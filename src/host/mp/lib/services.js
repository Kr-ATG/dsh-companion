/**
 * dsh-mobile-plus —— 0.1.2 宿主服务访问层。
 *
 * 上游（JackAIStudio）写的是旧统一网关时代，当前 DSH（0.1.2-rc.1）已经
 * 移除了那个网关：会话走 ctx.sessionController，
 * 工作区走 ctx.workspaceRegistry，能力调用全部经 ctx.get 拿，缺失即降级，
 * 绝不因为某个服务不在就拖垮整个插件。
 */
import { randomUUID } from 'node:crypto'

export function svc(ctx, name) {
  try {
    return ctx.get(name)
  } catch {
    return undefined
  }
}

export function unavailable(message) {
  return { ok: false, error: { code: 'unavailable', message } }
}

export function oldWorkspace(ws) {
  return {
    workspaceId: ws.id,
    title: ws.title,
    path: ws.path,
    sessionIds: [...(ws.sessionIds || [])],
    createdAt: ws.createdAt,
    updatedAt: ws.updatedAt,
  }
}

export function listWorkspaces(ctx) {
  const reg = svc(ctx, 'workspaceRegistry')
  if (!reg || typeof reg.list !== 'function') return { items: [] }
  return { items: reg.list().map(oldWorkspace) }
}

export async function createWorkspace(ctx, path) {
  const reg = svc(ctx, 'workspaceRegistry')
  if (!reg || typeof reg.create !== 'function') throw new Error('工作区服务不可用')
  return { workspace: oldWorkspace(await reg.create(path)) }
}

export async function listSessionSummaries(ctx, signal) {
  const sc = svc(ctx, 'sessionController')
  if (!sc || typeof sc.list !== 'function') throw new Error('会话服务不可用')
  const res = await sc.list({}, signal)
  // 原生行自带 projections（含 title）与 cwd/parentSessionId/origin：
  // 手机端标题链（投影标题 → title → 空会话 → 目录名）全靠它们，逐字透传。
  return (res.items || []).map((s) => ({
    sessionId: s.sessionId,
    updatedAt: s.updatedAt,
    running: s.running === true,
    blank: s.blank === true,
    ...(s.cwd !== undefined ? { cwd: s.cwd } : {}),
    ...(s.parentSessionId !== undefined ? { parentSessionId: s.parentSessionId } : {}),
    ...(s.origin !== undefined ? { origin: s.origin } : {}),
    ...(s.projections !== undefined ? { projections: s.projections } : {}),
  }))
}

export async function sessionCwd(ctx, sessionId, signal) {
  try {
    const rows = await listSessionSummaries(ctx, signal)
    const row = rows.find((item) => item.sessionId === sessionId)
    if (row?.cwd) return row.cwd
  } catch { /* fall through */ }
  try {
    const first = listWorkspaces(ctx).items[0]
    if (first?.path) return first.path
  } catch { /* fall through */ }
  return undefined
}

const historyCursors = new Map()

/**
 * 读手机端要的历史页。0.1.2 的 page() 是冷读但必须给 throughSeq（开口游标），
 * 游标来自 follow() 开口快照——桌面端打开会话也是同样路径，顺带把快照的
 * projections（标题等）透给手机。读完即关流，live 增量走我们自己的 SSE。
 */
export async function readHistory(ctx, { sessionId, maxMessages = 30, beforeSeq }, signal) {
  const sc = svc(ctx, 'sessionController')
  if (!sc || typeof sc.follow !== 'function' || typeof sc.page !== 'function') {
    throw new Error('会话服务不可用')
  }
  const address = { kind: 'session', sessionId }
  const max = Number.isFinite(maxMessages) ? maxMessages : 30
  if (beforeSeq !== undefined && historyCursors.has(sessionId)) {
    const page = await sc.page(
      { address, throughSeq: historyCursors.get(sessionId), beforeSeq, maxMessages: max },
      signal,
    )
    return { events: page.records.map((r) => ({ event: r.event })), hasMore: page.hasMore }
  }
  const stream = sc.follow({ address, maxMessages: max }, signal)
  try {
    for await (const frame of stream) {
      if (frame && frame.type === 'snapshot') {
        historyCursors.set(sessionId, frame.cursor)
        return {
          events: frame.records.map((r) => ({ event: r.event })),
          hasMore: frame.hasMore,
          projections: frame.projections,
        }
      }
    }
  } finally {
    if (stream && typeof stream.return === 'function') {
      try { await stream.return() } catch { /* already closed */ }
    }
  }
  throw new Error('历史读取失败')
}

function cleanTextPart(part) {
  if (!part || part.type !== 'text') return undefined
  return { type: 'text', text: String(part.text || '') }
}

function cleanImagePart(part) {
  if (!part || part.type !== 'image' || typeof part.data !== 'string' || part.data === '') return undefined
  const mediaType = part.mediaType === 'image/png' || part.mediaType === 'image/webp' || part.mediaType === 'image/gif'
    ? part.mediaType
    : 'image/jpeg'
  const clean = { type: 'image', mediaType, data: part.data }
  if (typeof part.name === 'string' && part.name !== '') clean.name = part.name.slice(0, 120)
  return clean
}

export async function promptSession(ctx, payload, signal) {
  const sc = svc(ctx, 'sessionController')
  if (!sc || typeof sc.prompt !== 'function') throw new Error('会话服务不可用')
  const parts = Array.isArray(payload.content) ? payload.content : []
  const content = []
  for (const part of parts) content.push(cleanTextPart(part) || cleanImagePart(part))
  const filtered = content.filter(Boolean)
  return sc.prompt({
    requestId: 'mp-' + Date.now().toString(36) + '-' + randomUUID().slice(0, 8),
    sessionId: payload.sessionId,
    mode: payload.mode === 'steer' ? 'steer' : 'queue',
    content: filtered,
  }, signal)
}

export async function createSession(ctx, payload) {
  const sc = svc(ctx, 'sessionController')
  if (!sc || typeof sc.create !== 'function') throw new Error('会话服务不可用')
  const req = {}
  if (typeof payload.workspaceId === 'string') req.workspaceId = payload.workspaceId
  if (typeof payload.cwd === 'string') req.cwd = payload.cwd
  if (typeof payload.sessionId === 'string') req.sessionId = payload.sessionId
  if (typeof payload.agentPreset === 'string' && payload.agentPreset !== '') req.agentPreset = payload.agentPreset
  return sc.create(req)
}

export async function cancelSession(ctx, sessionId, signal) {
  const sc = svc(ctx, 'sessionController')
  if (!sc || typeof sc.cancel !== 'function') throw new Error('会话服务不可用')
  return sc.cancel({ sessionId }, signal)
}

export async function readAttachment(ctx, sessionId, attachmentId, signal) {
  const sc = svc(ctx, 'sessionController')
  if (!sc || typeof sc.attachment !== 'function') throw new Error('会话服务不可用')
  return sc.attachment({ sessionId, attachmentId }, signal)
}

export async function selectSessionModel(ctx, payload, signal) {
  const sc = svc(ctx, 'sessionController')
  if (!sc || typeof sc.selectModel !== 'function') throw new Error('会话服务不可用')
  const req = { sessionId: payload.sessionId }
  if (typeof payload.provider === 'string') req.provider = payload.provider
  if (typeof payload.model === 'string') req.model = payload.model
  if (payload.reasoningEffort !== undefined) req.reasoningEffort = payload.reasoningEffort
  return sc.selectModel(req, signal)
}

/**
 * 手机模型面板要的旧形状 { current, groups, failures }。current 优先取该会话
 * 的 modelSelection 投影（lastUsed/next），拿不到就用部署默认。
 */
export async function modelView(ctx, sessionId) {
  const sc = svc(ctx, 'sessionController')
  if (!sc || typeof sc.modelCatalog !== 'function') throw new Error('模型服务不可用')
  const catalog = await sc.modelCatalog()
  let current = catalog.default
  try {
    const query = svc(ctx, 'sessionQuery')
    if (query && typeof query.observeSession === 'function' && sessionId) {
      const obs = await query.observeSession(sessionId)
      try {
        const ms = obs && obs.projections && obs.projections.values
          ? obs.projections.values.modelSelection
          : undefined
        const sel = (ms && (ms.next || ms.lastUsed)) || undefined
        if (sel && typeof sel.provider === 'string' && typeof sel.model === 'string') current = sel
      } finally {
        if (obs && typeof obs[Symbol.dispose] === 'function') obs[Symbol.dispose]()
      }
    }
  } catch { /* 用部署默认 */ }
  return {
    current,
    groups: (catalog.groups || []).map((g) => ({
      id: g.id,
      name: g.name,
      models: (g.models || []).map((m) => ({
        id: m.id,
        name: m.name,
        description: m.description,
        reasoning: m.reasoning,
      })),
    })),
    failures: (catalog.failures || []).map((f) => ({ name: f.name || f.id, message: f.message })),
  }
}

export async function listSkills(ctx, sessionId, signal) {
  const cat = svc(ctx, 'sessionSkillCatalog')
  if (cat && typeof cat.list === 'function') {
    const res = await cat.list({ sessionId }, signal)
    return {
      skills: (res.skills || []).map((s) => ({
        name: s.name,
        description: s.description,
        whenToUse: s.whenToUse,
      })),
    }
  }
  return { skills: [] }
}

export async function listPresets(ctx) {
  const ap = svc(ctx, 'agentPresets')
  if (!ap || typeof ap.list !== 'function') return { presets: [] }
  const arr = await ap.list()
  let defId
  try {
    const cand = ap.defaultId ?? ap.default ?? (ap.config && ap.config.default)
    if (typeof cand === 'string' && cand !== '') defId = cand
  } catch { /* 无默认标记 */ }
  return {
    presets: (arr || []).map((p) => ({
      id: p.id,
      name: p.name || p.id,
      description: p.description,
      broken: p.broken,
      ...(defId !== undefined ? { isDefault: p.id === defId } : {}),
    })),
  }
}


