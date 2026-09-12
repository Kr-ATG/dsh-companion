/**
 * dsh-companion — host half smoke test.
 *
 * Loads `lib/index.js` with plain node (the host bundle is self-contained)
 * and asserts the union of both modules' contracts:
 *
 * 手机远程 (mobile-plus):
 *  1. apply(ctx, {enabled:true}) 不抛错；回答器订阅 approval/request + user-questions/request
 *  2. /mp/* 全套路由注册；未配对调 /mp/api 返回 403 unpaired
 *  3. bundle 零外部依赖（仅 node: 内置模块）
 *  4. 手写源文件单文件 ≤300 行（mobile-plus 项目规范，第三方 vendor 除外）
 *
 * 对话胶囊 (done-pill):
 *  5. name / inject[] / apply() 契约；全局 session/event 监听
 *  6. turn/end → 完成条目（标题/问题/拼接回复）；since 增量；aborted/subagent 跳过；非 GET → 405
 *
 * Usage: node scripts/smoke-host.mjs
 */

import { resolve, dirname } from 'node:path'
import { readFileSync, readdirSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')

const fail = (msg) => { console.error(`FAIL  ${msg}`); process.exitCode = 1 }
const pass = (msg) => console.log(`ok    ${msg}`)

const mod = await import(pathToFileURL(resolve(ROOT, 'lib/index.js')).href)

// ── 0) 插件契约 ──────────────────────────────────────────────────────────
if (typeof mod.name !== 'string' || mod.name !== 'dsh-companion') fail(`expected name "dsh-companion", got ${JSON.stringify(mod.name)}`)
else pass('host exports name = "dsh-companion"')

if (!Array.isArray(mod.inject)) fail('host did not export inject[]')
else pass(`host exports inject[] = [${mod.inject.join(', ')}]`)

if (typeof mod.apply !== 'function') fail('host did not export apply()')
else pass('host exports apply()')

// ── stub ctx：两个模块触达的服务面 ─────────────────────────────────────────
const routes = []
const listeners = new Map()
const warns = []

const services = {
  webServer: {
    port: 3080,
    register: (spec) => { routes.push(spec); return () => {} },
  },
  logger: { warn: (m) => warns.push(String(m)), info: () => {} },
}

const ctx = {
  logger: services.logger,
  get: (name) => services[name],
  on: (type, handler, options) => {
    if (!listeners.has(type)) listeners.set(type, [])
    listeners.get(type).push({ handler, options })
    return () => {}
  },
  effect: (fn) => { const stop = typeof fn === 'function' ? fn() : undefined; return stop ?? (() => {}) },
  inject: (names, cb) => {
    const scope = Object.create(ctx)
    for (const key of names) scope[key] = services[key]
    return cb(scope)
  },
}

try {
  mod.apply(ctx, { enabled: true })
  pass('apply(ctx, {enabled:true}) ran without throwing')
} catch (error) {
  fail(`apply(ctx) threw: ${error?.stack ?? error}`)
}

// ── 手机远程：回答器订阅 ──────────────────────────────────────────────────
const evTypes = (t) => listeners.get(t) ?? []
if (evTypes('approval/request').length < 1) fail('approval/request 未订阅')
else pass('回答器订阅 approval/request')
if (evTypes('user-questions/request').length < 1) fail('user-questions/request 未订阅')
else pass('回答器订阅 user-questions/request')

// ── 手机远程：路由 ────────────────────────────────────────────────────────
for (const want of [
  'exact /mp/setup', 'exact /mp', 'exact /mp/', 'exact /mp/pair/issue',
  'exact /mp/pair/accept', 'exact /mp/pair/status', 'exact /mp/pair/stop',
  'exact /mp/pair/revoke', 'exact /mp/api/events.mux', 'exact /mp/api/events.host',
  'prefix /mp/api', 'prefix /mp',
]) {
  const paths = routes.map((r) => `${r.kind} ${r.path}`)
  if (!paths.includes(want)) fail(`缺路由: ${want}`)
}
pass(`手机远程路由注册完毕（共 ${routes.length} 条）`)

function fakeRes() {
  return {
    status: 0, headers: {}, body: '', ended: false, handlers: {},
    writeHead(status, headers) { this.status = status; this.headers = headers || {} },
    end(chunk) { this.ended = true; if (chunk) this.body += chunk },
    on(event, fn) { this.handlers[event] = fn },
  }
}

{
  const apiRoute = routes.find((r) => r.kind === 'prefix' && r.path === '/mp/api')
  if (!apiRoute) fail('缺 /mp/api 路由')
  else {
    const res = fakeRes()
    await apiRoute.handler({ method: 'POST', url: '/mp/api/workspace.list', headers: {} }, res)
    if (res.status !== 403) fail(`未配对调 api 返回 ${res.status}，要 403`)
    else if (!/unpaired/.test(res.body)) fail('未配对返回体缺 unpaired')
    else pass('未配对调 api 返回 403 unpaired')
  }
}

// ── 对话胶囊：监听器 + 路由 ────────────────────────────────────────────────
const pillListeners = listeners.get('session/event') ?? []
if (pillListeners.length < 1) fail('no session/event listener registered')
else pass('registered session/event listener')
const pillEv = pillListeners.find((l) => l.options?.global === true)
if (!pillEv) fail('session/event listener not global (options.global !== true)')
else pass('session/event listener is global:true')

const pillRoute = routes.find((r) => r.path === '/api/dsh-done-pill')
if (pillRoute === undefined) fail(`route /api/dsh-done-pill not registered (got ${routes.map((r) => r.path).join(', ')})`)
else pass('registered GET /api/dsh-done-pill (exact)')
if (pillRoute !== undefined && pillRoute.kind !== 'exact') fail(`pill route kind expected "exact", got ${pillRoute.kind}`)

if (pillEv !== undefined && pillRoute !== undefined) {
  const session = {
    id: 's1',
    header: { cwd: 'C:\\work\\proj' },
    _log: [],
    snapshotEvents() { return this._log },
  }
  const emit = (s, e) => {
    if (Array.isArray(s.events)) s.events.push(e)
    else if (Array.isArray(s._log)) s._log.push(e)
    pillEv.handler(s, e)
  }
  const callPill = (url, method = 'GET') => {
    let status = 0
    let body = null
    pillRoute.handler({ method, url }, { writeHead: (c) => { status = c }, end: (t) => { body = JSON.parse(t) } })
    return { status, body }
  }
  emit(session, { type: 'session/title', seq: 1, data: { title: '测试项目' } })
  emit(session, { type: 'user/message', seq: 2, data: { source: { kind: 'user' }, content: [{ type: 'text', text: '第一个问题' }] } })
  emit(session, { type: 'turn/start', seq: 3, data: { turn: 0 } })
  emit(session, { type: 'assistant/message', seq: 4, data: { turn: 0, message: { content: [{ type: 'text', text: '回答A' }] } } })
  emit(session, { type: 'turn/end', seq: 5, data: { turn: 0, reason: { kind: 'finished' } } })

  const r1 = callPill('/api/dsh-done-pill?since=0')
  const item = r1.body?.items?.[0]
  if (r1.status !== 200 || r1.body?.ok !== true || r1.body?.items?.length !== 1) fail(`完成条目断言失败: ${JSON.stringify(r1.body)}`)
  else if (item.sessionId !== 's1' || item.title !== '测试项目' || item.question !== '第一个问题' || item.answer !== '回答A') {
    fail(`完成条目内容不对: ${JSON.stringify(item)}`)
  } else pass('turn/end 生成完成条目（标题/问题/回复）')

  const r2 = callPill(`/api/dsh-done-pill?since=${r1.body.version}`)
  if (r2.body?.items?.length !== 0) fail('since 增量过滤失败')
  else pass('since=version incremental filter returns 0 items')

  const s2 = { id: 's2', header: { cwd: 'C:\\work\\aborted' }, events: [] }
  emit(s2, { type: 'user/message', seq: 1, data: { source: { kind: 'user' }, content: [{ type: 'text', text: 'x' }] } })
  emit(s2, { type: 'turn/start', seq: 2, data: { turn: 0 } })
  emit(s2, { type: 'turn/end', seq: 3, data: { turn: 0, reason: { kind: 'aborted' } } })
  if (callPill('/api/dsh-done-pill?since=0').body?.items?.length !== 1) fail('aborted turn created an item')
  else pass('aborted turn does not create a completion entry')

  const r5 = callPill('/api/dsh-done-pill', 'POST')
  if (r5.status !== 405) fail(`POST return status ${r5.status}, want 405`)
  else pass('non-GET returns 405')
}

// ── 产物卫生 ──────────────────────────────────────────────────────────────
{
  const source = readFileSync(resolve(ROOT, 'lib/index.js'), 'utf8')
  const specs = new Set()
  for (const m of source.matchAll(/(?:^|[;\n])\s*(?:import|export)[\s\S]*?from\s*["']([^"']+)["']/g)) specs.add(m[1])
  const bad = [...specs].filter((s) => !s.startsWith('node:'))
  if (bad.length > 0) fail(`host bundle 有外部依赖: ${bad.join(', ')}`)
  else pass('host bundle 零外部依赖（仅 node: 内置模块）')
}
{
  // mobile-plus 项目规范：手写源文件单文件 ≤300 行（第三方 qrcodegen 除外）。
  const dir = resolve(ROOT, 'src/host/mp')
  const files = ['index.js', ...readdirSync(resolve(dir, 'lib')).filter((f) => f.endsWith('.js')).map((f) => 'lib/' + f)]
  const over = files
    .map((f) => [f, readFileSync(resolve(dir, f), 'utf8').split('\n').length])
    .filter(([, n]) => n > 300)
  if (over.length > 0) fail(`超 300 行: ${over.map(([f, n]) => `${f}(${n})`).join(', ')}`)
  else pass('mp 手写源文件单文件 ≤300 行')
}
{
  const hit = ['src/host/mp/index.js', ...readdirSync(resolve(ROOT, 'src/host/mp/lib')).map((f) => 'src/host/mp/lib/' + f)]
    .filter((f) => readFileSync(resolve(ROOT, f), 'utf8').includes('apiProxy'))
  if (hit.length > 0) fail(`旧 apiProxy 残留: ${hit.join(', ')}`)
  else pass('旧 apiProxy 无残留')
}

console.log(`\n${process.exitCode ? 'SMOKE FAILED' : 'SMOKE PASSED'} — host half`)
process.exit(process.exitCode ?? 0)
