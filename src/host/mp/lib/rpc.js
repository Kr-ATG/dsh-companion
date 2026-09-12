/**
 * dsh-mobile-plus —— /mp/api/* 方法分发（0.1.2 服务面）。
 *
 * 手机前端（public/js）保持不动：这里把 20 个旧方法名逐一接到新服务上，
 * 返回包络维持 { type:'server-response', rpcId, result:{ ok, value } }。
 */
import { SESSION_PAGE, QUOTA_TTL_MS } from './constants.js'
import { isRecord, wrap, fetchLoopbackJson } from './utils.js'
import { listHostDirectory } from './fs-browser.js'
import { persistPhoneImages, slimHistoryImages, sessionCwd } from './upload.js'
import { svc, listWorkspaces, createWorkspace, listSessionSummaries, readHistory,
  promptSession, createSession, cancelSession, readAttachment, selectSessionModel,
  modelView, listSkills, listPresets } from './services.js'
import { enrichTitles } from './titles.js'
import { pendingSnapshot, resolveApproval, resolveQuestion, touchPhone } from './answerers.js'

let quotaCache = { at: 0, value: null }

export async function readQuotaSnapshot(ctx, force, signal) {
  if (!force && quotaCache.value && Date.now() - quotaCache.at < QUOTA_TTL_MS) {
    return quotaCache.value
  }
  const webServer = svc(ctx, 'webServer')
  const port = webServer && typeof webServer.port === 'number' ? webServer.port : 3080
  const [deepseek, grok] = await Promise.all([
    fetchLoopbackJson(port, '/dsh-deepseek-balance', signal),
    fetchLoopbackJson(port, '/dsh-grok-oauth/usage', signal),
  ])
  const value = { deepseek, grok }
  quotaCache = { at: Date.now(), value }
  return value
}

export function foldHistoryForMobile(entries, maxMessages) {
  const norm = (entries || []).map((entry, idx) => {
    const ev = entry && (entry.event || entry)
    return { entry, ev, seq: typeof ev?.seq === 'number' ? ev.seq : idx }
  }).sort((a, b) => a.seq - b.seq)
  const MESSAGE = new Set(['user/message', 'assistant/message'])
  const messageRows = norm.filter(({ ev }) => ev && MESSAGE.has(ev.type))
  const keepFrom = messageRows.length <= maxMessages ? 0 : messageRows[messageRows.length - maxMessages].seq
  const acc = new Map()
  for (const { ev } of norm) {
    if (!ev || ev.type !== 'assistant/chunk') continue
    const data = isRecord(ev.data) ? ev.data : {}
    const chunk = isRecord(data.chunk) ? data.chunk : {}
    if (chunk.type !== 'text-delta' && chunk.type !== 'reasoning-delta') continue
    const key = String(data.turn ?? 0) + '.' + String(data.step ?? 0)
    const cur = acc.get(key) || { text: '', reasoning: '' }
    const piece = typeof chunk.text === 'string' ? chunk.text : ''
    if (chunk.type === 'reasoning-delta') cur.reasoning += piece
    else cur.text += piece
    acc.set(key, cur)
  }
  const DROP = new Set(['assistant/chunk', 'request/header', 'tool/result', 'web/deepseek-search-llm-request', 'session/title-llm-request'])
  const events = []
  for (const { entry, ev, seq } of norm) {
    if (seq < keepFrom) continue
    if (!ev || DROP.has(ev.type)) continue
    if (ev.type === 'assistant/message') {
      const data = isRecord(ev.data) ? ev.data : {}
      const message = isRecord(data.message) ? data.message : data
      const merged = mergeChunkIntoMessage(message, acc.get(String(data.turn ?? 0) + '.' + String(data.step ?? 0)))
      events.push({ event: { ...ev, data: isRecord(data.message) ? { ...data, message: merged } : merged } })
      continue
    }
    events.push(entry)
  }
  return { events, hasMore: messageRows.length > maxMessages }
}

function mergeChunkIntoMessage(message, chunked) {
  const content = Array.isArray(message.content) ? message.content.map((b) => b) : []
  const hasText = content.some((b) => b && b.type === 'text')
  const hasReasoning = content.some((b) => b && b.type === 'reasoning')
  if (chunked && chunked.text !== '' && !hasText) content.unshift({ type: 'text', text: chunked.text })
  if (chunked && chunked.reasoning !== '' && !hasReasoning) content.push({ type: 'reasoning', text: chunked.reasoning })
  return { ...message, content }
}

function sessionCursor(row) {
  return String(row.updatedAt) + ':' + String(row.sessionId)
}

function paginateSessions(items, cursor) {
  const start = cursor ? Math.max(0, items.findIndex((row) => sessionCursor(row) === cursor) + 1) : 0
  const page = items.slice(start, start + SESSION_PAGE)
  const last = page[page.length - 1]
  const nextCursor = last && start + page.length < items.length ? sessionCursor(last) : undefined
  return { items: page, hasMore: Boolean(nextCursor), nextCursor }
}

function sessionsForWorkspace(items, workspaceId, workspaces) {
  if (!workspaceId) return items
  const ws = (workspaces || []).find((row) => row.workspaceId === workspaceId)
  const owned = new Set(ws?.sessionIds || [])
  return items.filter((row) => owned.has(row.sessionId))
}

const ok = (rpcId, value) => ({ type: 'server-response', rpcId, result: { ok: true, value } })
const fail = (rpcId, code, message) => ({ type: 'server-response', rpcId, result: { ok: false, error: { code, message } } })
export function createDispatcher(ctx) {
  return async (method, payload, rpcId, signal) => {
    const sid = payload && typeof payload.sessionId === 'string' ? payload.sessionId : ''
    if (sid !== '') touchPhone(sid)
    try {
      if (method === 'workspace.list') return ok(rpcId, listWorkspaces(ctx))
      if (method === 'workspace.create') {
        if (!payload || typeof payload.path !== 'string') return fail(rpcId, 'bad-request', '缺少目录路径')
        return ok(rpcId, await createWorkspace(ctx, payload.path))
      }
      if (method === 'host.listDirectory') {
        return wrap(rpcId, await listHostDirectory(payload, signal))
      }
      if (method === 'agentPreset.list') return ok(rpcId, await listPresets(ctx))
      if (method === 'session.create') return ok(rpcId, await createSession(ctx, payload || {}))
      if (method === 'session.history') {
        const max = Number.isFinite(payload?.maxMessages) ? payload.maxMessages : 30
        const raw = await readHistory(ctx, {
          sessionId: payload?.sessionId,
          maxMessages: max,
          beforeSeq: typeof payload?.beforeSeq === 'number' ? payload.beforeSeq : undefined,
        }, signal)
        const folded = foldHistoryForMobile(raw.events, max)
        const cwd = await sessionCwd(ctx, payload?.sessionId, signal)
        folded.events = await slimHistoryImages(folded.events, cwd)
        return {
          type: 'server-response',
          rpcId,
          result: { ok: true, value: { events: folded.events, hasMore: folded.hasMore, projections: raw.projections } },
        }
      }
      if (method === 'session.prompt') {
        const next = await persistPhoneImages(ctx, payload, signal)
        const res = await promptSession(ctx, next, signal)
        return ok(rpcId, res && typeof res === 'object' ? res : { accepted: true })
      }
      if (method === 'session.cancel') return ok(rpcId, await cancelSession(ctx, sid, signal))
      if (method === 'session.attachment') {
        return ok(rpcId, await readAttachment(ctx, sid, payload?.attachmentId, signal))
      }
      if (method === 'session.models') return ok(rpcId, await modelView(ctx, sid))
      if (method === 'session.selectModel') {
        const res = await selectSessionModel(ctx, payload || {}, signal)
        return ok(rpcId, res && typeof res === 'object' ? res : { selected: payload })
      }
      if (method === 'mobile.pending') return ok(rpcId, pendingSnapshot(sid))
      if (method === 'mobile.respond') {
        const kind = payload && payload.type
        if (kind === 'approval') {
          resolveApproval(sid, payload.approvalId, payload.outcome)
          return ok(rpcId, { resolved: true })
        }
        if (kind === 'question') {
          resolveQuestion(sid, payload.rpcId, payload.answers)
          return ok(rpcId, { resolved: true })
        }
        return fail(rpcId, 'bad-request', 'unknown respond type')
      }
      if (method === 'skill.list') return ok(rpcId, await listSkills(ctx, sid, signal))
      if (method === 'command.list') {
        const commands = svc(ctx, 'commands')
        const agent = sid && commands ? svc(ctx, 'agents')?.get(sid) : undefined
        if (!agent || !commands || typeof commands.list !== 'function') return ok(rpcId, { items: [] })
        const items = commands.list(agent).map((row) => ({
          name: row.name,
          description: row.description,
          hint: row.input && typeof row.input.hint === 'string' ? row.input.hint : undefined,
        }))
        return ok(rpcId, { items })
      }
      if (method === 'command.execute') {
        const line = payload && typeof payload.line === 'string' ? payload.line : ''
        const commands = svc(ctx, 'commands')
        const agent = sid && commands ? svc(ctx, 'agents')?.get(sid) : undefined
        if (!agent || !commands || typeof commands.execute !== 'function') {
          return fail(rpcId, 'unavailable', '宿主命令服务不可用')
        }
        const execution = await commands.execute(agent, line, [], signal)
        if (execution === undefined) return fail(rpcId, 'unknown-command', '未知命令')
        return ok(rpcId, { matched: true, result: execution.result })
      }
      if (method === 'quota.read') {
        return ok(rpcId, await readQuotaSnapshot(ctx, payload?.force === true, signal))
      }
      if (method === 'host.restart') {
        try {
          const webServer = svc(ctx, 'webServer')
          const port = webServer && typeof webServer.port === 'number' ? webServer.port : 3080
          const res = await fetch('http://127.0.0.1:' + port + '/dsh-web-restart', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ confirm: true }),
            signal,
          })
          const value = await res.json()
          return { type: 'server-response', rpcId, result: { ok: res.ok, value } }
        } catch (err) {
          return fail(rpcId, 'restart-failed', err instanceof Error ? err.message : String(err))
        }
      }
      if (method === 'session.list') {
        const all = await listSessionSummaries(ctx, signal)
        const sorted = [...all].sort((a, b) => b.updatedAt - a.updatedAt)
        const workspaceId = payload && typeof payload.workspaceId === 'string' ? payload.workspaceId : ''
        const items = sessionsForWorkspace(sorted, workspaceId, listWorkspaces(ctx).items)
        const cursor = payload && typeof payload.cursor === 'string' ? payload.cursor : undefined
        const page = paginateSessions(items, cursor)
        await enrichTitles(ctx, page.items, signal)
        return ok(rpcId, page)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return fail(rpcId, 'internal', message)
    }
    throw new Error('unhandled ' + method)
  }
}
