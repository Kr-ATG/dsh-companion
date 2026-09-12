import { existsSync, readFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { PREFIX, PUBLIC, ALLOW, MAX_BODY, MIME_MAP } from './constants.js'
import { json, readBody, isLoopback } from './utils.js'
import { handleUpload } from './upload.js'
import { pipeSse } from './events.js'
import { touchPhone } from './answerers.js'
import { noteTitle } from './titles.js'
import { clearCookieForRequest } from './web-session.js'

export function handleStaticFile(filePath, req, res) {
  try {
    const ext = extname(filePath).toLowerCase()
    const contentType = MIME_MAP[ext] || 'application/octet-stream'
    const body = readFileSync(filePath)
    const headers = { 'content-type': contentType, 'cache-control': 'no-store' }
    if (basename(filePath) === 'sw.js') headers['service-worker-allowed'] = PREFIX + '/'
    res.writeHead(200, headers)
    res.end(body)
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Not Found')
    } else {
      res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
      res.end('Internal Server Error')
    }
  }
}

function unpaired(res) {
  json(res, 403, { ok: false, error: { code: 'unpaired', message: '此设备未配对：请在电脑端重新生成配对链接。' } })
}

/** 配对门禁：静态资源与配对页常开，数据面（api / 上传 / SSE）必须已配对。 */
function gate(auth, req, res) {
  if (auth.requirePairing && !auth.touch(req)) {
    unpaired(res)
    return false
  }
  return true
}

/** 订阅宿主帧：会话 live 事件 + 会话增删/运行态 + 手机审批问询帧。 */
function subscribeFrames(ctx, hub, { hostOnly = false } = {}) {
  let queue = null
  const offs = []
  const track = (off) => { if (typeof off === 'function') offs.push(off) }
  try {
    if (!hostOnly) {
      track(ctx.on('session/event', (session, event) => {
        if (queue && session && typeof session.id === 'string') {
          queue({ type: 'session/event', sessionId: session.id, event })
        }
        try {
          const data = event && event.type === 'session/title' && event.data ? event.data : null
          if (data && session && typeof session.id === 'string') noteTitle(session.id, data.title)
        } catch { /* 标题缓存不影响推送 */ }
      }))
    }
    track(ctx.on('api-session/added', (summary) => {
      if (queue && summary && typeof summary.sessionId === 'string') {
        queue({ type: 'host/session-added', sessionId: summary.sessionId, summary })
      }
    }))
    track(ctx.on('api-session/removed', (sessionId) => {
      if (queue && typeof sessionId === 'string') queue({ type: 'host/session-removed', sessionId })
    }))
    track(ctx.on('api-session/status', (sessionId, running) => {
      if (queue && typeof sessionId === 'string') {
        queue({ type: 'host/session-status', sessionId, running: running === true })
      }
    }))
    track(hub.subscribe((frame) => { if (queue) queue(frame) }))
  } catch { /* 极老宿主缺事件，SSE 退化为心跳 */ }
  const stream = async function* (signal) {
    const pending = []
    let wake = undefined
    queue = (frame) => {
      pending.push(frame)
      if (wake) { const w = wake; wake = undefined; w() }
    }
    const onAbort = () => { if (wake) { const w = wake; wake = undefined; w() } }
    if (signal) signal.addEventListener('abort', onAbort, { once: true })
    try {
      while (!signal || !signal.aborted) {
        const next = pending.shift()
        if (next === undefined) {
          await new Promise((resolve) => { wake = resolve })
          continue
        }
        yield next
      }
    } finally {
      queue = null
      if (signal) signal.removeEventListener('abort', onAbort)
      for (const off of offs) { try { off() } catch { /* ignore */ } }
    }
  }
  return (signal) => stream(signal)
}

export function setupRoutes(ctx, auth, pendingTracker, dispatch, hub) {
  const handleSetup = (req, res) => {
    if (!isLoopback(req)) {
      res.writeHead(403)
      res.end('setup is loopback only')
      return
    }
    handleStaticFile(join(PUBLIC, 'setup.html'), req, res)
  }

  const handleApp = (req, res) => {
    const paired = auth.requirePairing && auth.touch(req)
    // 已配对：续发设备 + web 会话 cookie；被撤销的设备：清掉残留 web cookie
    const extra = paired ? auth.cookieHeadersIfPaired(req) : (auth.grantWebSession ? clearCookieForRequest(req) : {})
    const body = readFileSync(join(PUBLIC, 'app.html'))
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', ...extra })
    res.end(body)
  }

  /** /mp/web：已配对设备直接领 web 会话 cookie 并跳全量 web 界面；未配对回配对页。 */
  const handleWeb = (req, res) => {
    const paired = !auth.requirePairing || auth.touch(req)
    const extra = paired ? auth.cookieHeadersIfPaired(req) : {}
    res.writeHead(302, { 'cache-control': 'no-store', ...extra, location: paired ? '/' : PREFIX + '/' })
    res.end()
  }

  const handleEvents = async (req, res) => {
    if (!gate(auth, req, res)) return
    await pipeSse(req, res, subscribeFrames(ctx, hub), auth, pendingTracker)
  }

  const handleHostEvents = async (req, res) => {
    if (!gate(auth, req, res)) return
    await pipeSse(req, res, subscribeFrames(ctx, hub, { hostOnly: true }), auth, pendingTracker)
  }

  const handleApi = async (req, res) => {
    const pathname = new URL(req.url || '/', 'http://x').pathname
    if (pathname === PREFIX + '/api/events.mux') {
      await handleEvents(req, res)
      return
    }
    if (pathname === PREFIX + '/api/events.host') {
      await handleHostEvents(req, res)
      return
    }
    if (pathname === PREFIX + '/api/mobile.upload') {
      if (!gate(auth, req, res)) return
      await handleUpload(ctx, req, res)
      return
    }
    if (!gate(auth, req, res)) return
    if (req.method !== 'POST') {
      res.writeHead(405)
      res.end()
      return
    }
    const method = pathname.slice((PREFIX + '/api/').length)
    if (!ALLOW.has(method)) {
      json(res, 403, { ok: false, error: { code: 'forbidden', message: method } })
      return
    }
    let envelope
    try {
      envelope = await readBody(req, method === 'session.prompt' ? MAX_BODY : 256 * 1024)
    } catch (error) {
      json(res, 400, { ok: false, error: { code: 'bad-request', message: String(error.message || error) } })
      return
    }
    const rpcId = typeof envelope.rpcId === 'string' ? envelope.rpcId : ''
    if (rpcId === '') {
      json(res, 400, { ok: false, error: { code: 'bad-request', message: 'missing rpcId' } })
      return
    }
    if (envelope.payload && typeof envelope.payload.sessionId === 'string') touchPhone(envelope.payload.sessionId)
    try {
      const abort = new AbortController()
      res.on('close', () => { if (!res.writableEnded) abort.abort() })
      json(res, 200, await dispatch(method, envelope.payload, rpcId, abort.signal))
    } catch (error) {
      json(res, 200, {
        type: 'server-response',
        rpcId,
        result: { ok: false, error: { code: 'internal', message: error instanceof Error ? error.message : String(error) } },
      })
    }
  }

  const handleStaticRoute = (req, res) => {
    let pathname = new URL(req.url || '/', 'http://x').pathname
    if (pathname.startsWith(PREFIX + '/')) pathname = pathname.slice((PREFIX + '/').length)
    else if (pathname.startsWith(PREFIX)) pathname = pathname.slice(PREFIX.length)
    if (pathname.startsWith('/')) pathname = pathname.slice(1)
    if (pathname === '' || pathname === 'index.html' || pathname === 'app.html') {
      handleApp(req, res)
      return
    }
    const target = resolve(PUBLIC, pathname)
    if (target.startsWith(PUBLIC) && existsSync(target)) {
      handleStaticFile(target, req, res)
      return
    }
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('Not Found')
  }

  const routes = [
    { kind: 'exact', path: PREFIX + '/setup', handler: handleSetup },
    { kind: 'exact', path: PREFIX, handler: handleApp },
    { kind: 'exact', path: PREFIX + '/', handler: handleApp },
    { kind: 'exact', path: PREFIX + '/web', handler: handleWeb },
    { kind: 'exact', path: PREFIX + '/pair/issue', handler: (req, res) => auth.handleIssue(ctx.webServer.port, req, res) },
    { kind: 'exact', path: PREFIX + '/pair/accept', handler: auth.handleAccept },
    { kind: 'exact', path: PREFIX + '/pair/status', handler: auth.handleStatus },
    { kind: 'exact', path: PREFIX + '/pair/stop', handler: auth.handleStop },
    { kind: 'exact', path: PREFIX + '/pair/revoke', handler: auth.handleRevoke },
    { kind: 'exact', path: PREFIX + '/api/events.mux', handler: handleEvents },
    { kind: 'exact', path: PREFIX + '/api/events.host', handler: handleHostEvents },
    { kind: 'prefix', path: PREFIX + '/api', handler: handleApi },
    { kind: 'prefix', path: PREFIX, handler: handleStaticRoute },
  ]
  const stop = routes.map((route) => ctx.webServer.register(route))
  return () => { for (const dispose of stop) dispose() }
}
