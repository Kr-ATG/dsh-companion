/**
 * dsh-done-pill — 对话完成胶囊（host 半身）。
 *
 * 移植自 dsh-webui 的 done-pill（_tmp-webui/src/done-pill.ts），拆分为独立
 * 插件；行为与数据契约保持原样，仅路由改为本插件私有路径（避免与 webui
 * 同时安装时 webServer.register 重复路径抛错）。
 *
 * 全局监听 `session/event`（含后台会话）：任一会话 turn/end 时提取
 *   - 会话标题（session/title 事件 > cwd basename > session id）
 *   - 触发回合的用户问题（回合内最后一条真人 user/message 的文本）
 *   - 助手回复全文（本回合 assistant/message 的 text 块按序拼接）
 * 存入内存完成列表（最近 MAX_ITEMS 条，seq 单调递增）。
 * GET /api/dsh-done-pill?since=N 供前端轮询增量（items = seq > N，升序）。
 *
 * 设计约束：
 *  - 只报非 subagent 会话（header.origin === 'subagent' 跳过）；
 *  - aborted 回合不算完成（用户主动停止）；
 *  - 最小服务契约（webui 同款做法），不引入 dsh-session 类型依赖。
 */
import { readFileSync } from 'node:fs'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from '@deepseek-ai/cordis'

const ROUTE = '/api/dsh-done-pill'
/** 热区状态上报路由（client POST → host 经壳子 CDP 注入壳页面）。 */
const HOT_ROUTE = '/api/dsh-done-pill/shell-hot'
/** 内存完成列表上限。 */
const MAX_ITEMS = 50
/** 单条问题/回复文本上限（超出截断加省略号；本地回传足够展示全文）。 */
const MAX_TEXT_CHARS = 20000

// ── 最小服务契约 ────────────────────────────────────────────────────────────

interface SessionLike {
  id: string
  header?: { cwd?: string; origin?: string }
  events?: readonly SessionEventLike[]
}

interface SessionEventLike {
  type: string
  seq: number
  data?: {
    turn?: number
    title?: unknown
    reason?: { kind?: unknown }
    message?: { content?: unknown }
    content?: unknown
    source?: { kind?: unknown }
  }
}

/**
 * 事件日志访问：DSH 0.1.2+ 的 Session 已把事件日志私有化，只暴露
 * `snapshotEvents()`（旧版直接暴露 `events` 数组）——读取两者兼容，
 * 任一不可用时回退空数组（v0.2.5 修复：旧实现读 `session.events`
 * 恒为空，完成条目全部被「空回合」跳过，提示不出现）。
 */
function eventsOf(session: SessionLike): readonly SessionEventLike[] {
  const candidate = session as SessionLike & { snapshotEvents?: () => unknown }
  if (typeof candidate.snapshotEvents === 'function') {
    try {
      const snapshot = candidate.snapshotEvents()
      if (Array.isArray(snapshot)) return snapshot as readonly SessionEventLike[]
    } catch { /* 快照失败按空处理 */ }
    return []
  }
  return session.events ?? []
}

interface WebServerRoute {
  kind: 'exact' | 'prefix'
  path: string
  handler: (req: IncomingMessage, res: ServerResponse) => void
}

interface WebServerService {
  register(route: WebServerRoute): () => void
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    webServer: WebServerService
  }
}


// ── 壳子顶栏热区让位（CDP applier）────────────────────────────────────────
// client 把胶囊热区状态 POST 到 HOT_ROUTE；这里经壳子的 CDP 调试端口
// （端口见 D:/AI/Dsh/.shell-cdp-port，壳子 main.js 启动时写入）把状态
// 注入壳页面：拖拽带 #drag-strip 在胶囊矩形范围内穿透（pointer-events:
// none），光标离开/胶囊移开自动恢复。壳子未运行（纯浏览器访问 WebUI）
// 或老版本壳子（无 setupShellHotZone 钩子）时静默降级，胶囊不受影响。

/** 热区状态（client 上报体）。 */
interface HotState {
  over: boolean
  rects: Array<{ x: number; y: number; w: number; h: number }>
}

/** 与壳子的连接：ws + 心跳 + 状态驱动的单飞发送。 */
interface ShellConn {
  /** 发送一次状态（失败自动按壳子不在处理）；立即返回，不阻塞路由。 */
  send: (state: HotState) => void
  close: () => void
}

/** 读壳子 CDP 端口；读不到/未写盘（壳子不在）返回 null。 */
function readShellCdpPort(): number | null {
  try {
    const raw = readFileSync('D:/AI/Dsh/.shell-cdp-port', 'utf8').trim()
    const port = Number(raw)
    return Number.isInteger(port) && port > 0 && port < 65536 ? port : null
  } catch {
    return null
  }
}

/** 浏览器风格 WebSocket 的最小面（Node ≥22 全局内置）。 */
interface WebSocketLike {
  addEventListener(type: 'open' | 'error' | 'close' | 'message', fn: () => void): void
  send(data: string): void
  close(): void
}

/** 拉取壳子（主框架页面）的 CDP target 列表；壳子不在返回 null。 */
async function fetchShellTargets(port: number): Promise<Array<{ id: string; type: string; url?: string }> | null> {
  try {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(1500) })
    if (!res.ok) return null
    const list = (await res.json()) as Array<{ id: string; type: string }>
    return Array.isArray(list) ? list : null
  } catch {
    return null
  }
}

/**
 * 建立与壳页面的 CDP 会话（全局 WebSocket，Node ≥22 内置）。
 * 只做一件事：把热区状态写进壳页面（`window.__dshPillHot`）并驱动
 * #drag-strip 的穿透类切换。壳页面侧由首次连接时注入的幂等补丁承接。
 */
async function connectShell(port: number, targetId: string, onDead: () => void): Promise<ShellConn | null> {
  const WS = (globalThis as { WebSocket?: new (url: string) => WebSocketLike }).WebSocket
  if (typeof WS !== 'function') return null
  const ws = new WS(`ws://127.0.0.1:${port}/devtools/page/${targetId}`)
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { try { ws.close() } catch { /* 忽略 */ } reject(new Error('cdp ws handshake timeout')) }, 2000)
    ws.addEventListener('open', () => { clearTimeout(timer); resolve() })
    ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('cdp ws error')) })
  })
  let seq = 0

  /** 在壳页面主世界执行一段 JS（发后即忘；状态上报允许丢帧）。 */
  function evalInShell(expression: string): void {
    const id = ++seq
    try {
      ws.send(JSON.stringify({ id, method: 'Runtime.evaluate', params: { expression, returnByValue: false } }))
    } catch { /* ws 已断：close 统一清理 */ }
  }

  /**
   * 壳页面补丁（幂等）：注入穿透类样式 + 在 window 上挂状态对象。
   * 老版本壳子没有 #drag-strip 时只挂对象不注入（applyState 自然 no-op）。
   */
  /**
   * 壳页面补丁（幂等）：穿透样式 + 状态对象 + 壳侧命中试探。
   * 壳侧 mousemove 只在拖拽带自身上触发（iframe 区域的事件不冒泡到壳
   * 文档），用于「光标从侧方直接进入胶囊被覆盖的上半段」的首次接触——
   * 命中已上报矩形即点亮穿透，下一个事件起 WebUI 文档接管判断。
   */
  const SHELL_HOT_PATCH = `
(function () {
  var w = window
  var mod = w.__dshPillHot || (w.__dshPillHot = { state: { over: false, rects: [] } })
  if (mod.ready) return
  mod.ready = true
  var strip = document.getElementById('drag-strip')
  if (strip !== null) {
    var style = document.createElement('style')
    style.id = 'dsh-pill-hot-style'
    style.textContent = '#drag-strip.dsh-pill-hot{pointer-events:none !important;-webkit-app-region:no-drag !important;}'
    document.head.appendChild(style)
    strip.addEventListener('mousemove', function (e) {
      var m = window.__dshPillHot
      if (!m || !m.ready) return
      var hit = (m.state.rects || []).some(function (r) {
        return e.clientX >= r.x && e.clientX < r.x + r.w && e.clientY >= r.y && e.clientY < r.y + r.h
      })
      strip.classList.toggle('dsh-pill-hot', hit)
    }, true)
  }
  mod.strip = function () { return document.getElementById('drag-strip') }
})()`

  evalInShell(SHELL_HOT_PATCH)

  let lastSig = ''
  function applyState(state: HotState): void {
    const sig = JSON.stringify(state)
    if (sig === lastSig) return
    lastSig = sig
    // 穿透完全由 client 侧状态驱动：壳页面在 iframe 区域收不到 mousemove
    //（事件不跨文档冒泡），壳侧自行探测永远慢一拍——over 标志由看得见
    // 胶囊的那一端（WebUI 文档）算好推过来，壳侧只做类切换。
    evalInShell(`(function () {
  var mod = window.__dshPillHot
  if (!mod || !mod.ready) return
  mod.state = ${sig}
  var strip = mod.strip ? mod.strip() : null
  if (strip !== null) strip.classList.toggle('dsh-pill-hot', ${state.over ? 'true' : 'false'})
})()`)
  }

  ws.addEventListener('close', onDead)
  ws.addEventListener('error', () => { try { ws.close() } catch { /* 忽略 */ } })

  return {
    send(state) { applyState(state) },
    close() {
      try { applyState({ over: false, rects: [] }) } catch { /* 忽略 */ }
      try { ws.close() } catch { /* 忽略 */ }
    },
  }
}

/** 壳子热区连接管理：懒连接、断线重连、失败冷却。 */
function createShellHotZone(): { handle: (state: HotState) => void; stop: () => void } {
  const SHELL_RETRY_MS = 5000
  let conn: ShellConn | null = null
  let connecting: Promise<ShellConn | null> | null = null
  let retryAt = 0
  let stopped = false
  let pendingState: HotState | null = null
  let flushTimer: ReturnType<typeof setTimeout> | null = null

  async function ensureConn(): Promise<ShellConn | null> {
    if (stopped) return null
    if (conn !== null) return conn
    if (connecting !== null) return connecting
    if (Date.now() < retryAt) return null
    connecting = (async () => {
      try {
        const port = readShellCdpPort()
        if (port === null) { retryAt = Date.now() + SHELL_RETRY_MS; return null }
        const targets = await fetchShellTargets(port)
        if (targets === null) { retryAt = Date.now() + SHELL_RETRY_MS; return null }
        // 只找主框架页面（topbar.html）；iframe/DevTools 等目标一律忽略。
        const page = targets.find(t => t.type === 'page' && t.url.includes('topbar.html'))
        if (page === undefined) { retryAt = Date.now() + SHELL_RETRY_MS; return null }
        const established = await connectShell(port, page.id, () => {
          conn = null
          retryAt = Date.now() + SHELL_RETRY_MS
        })
        if (established === null) { retryAt = Date.now() + SHELL_RETRY_MS; return null }
        conn = established
        return established
      } catch {
        retryAt = Date.now() + SHELL_RETRY_MS
        return null
      } finally {
        connecting = null
      }
    })()
    return connecting
  }

  function flush(): void {
    flushTimer = null
    const state = pendingState
    pendingState = null
    if (state === null || stopped) return
    void ensureConn().then((c) => { c?.send(state) })
  }

  return {
    handle(state) {
      if (stopped) return
      pendingState = state
      if (flushTimer === null) flushTimer = setTimeout(flush, 80)
    },
    stop() {
      stopped = true
      if (flushTimer !== null) clearTimeout(flushTimer)
      flushTimer = null
      conn?.close()
      conn = null
    },
  }
}
// ── 数据结构 ────────────────────────────────────────────────────────────────

export interface DonePillEntry {
  /** 单调递增序号（也是增量拉取水位）。 */
  seq: number
  /** 稳定 id（seq 字符串化，供前端去重/已读标记）。 */
  id: string
  sessionId: string
  /** 会话显示标题（title 事件 > cwd basename > id）。 */
  title: string
  /** 触发回合的用户问题文本（找不到真人消息时为空串）。 */
  question: string
  /** 本回合助手回复全文（text 块拼接）。 */
  answer: string
  /** 回合结束时间戳。 */
  endedAt: number
  turn: number
  /** 结束原因 kind（error 时前端标注「出错结束」）。 */
  reasonKind: string
}

/** 内容块数组 → 纯文本（text 块取原文；image 等非文本块输出占位标记）。 */
function blocksToText(content: unknown): string {
  if (!Array.isArray(content)) return ''
  const parts: string[] = []
  for (const block of content) {
    if (block === null || typeof block !== 'object') continue
    const type = (block as { type?: unknown }).type
    if (type === 'text' && typeof (block as { text?: unknown }).text === 'string') {
      parts.push((block as { text: string }).text)
    } else if (type === 'image') {
      parts.push('[图片]')
    }
  }
  return parts.join('\n').trim()
}

function clampText(text: string): string {
  return text.length <= MAX_TEXT_CHARS ? text : `${text.slice(0, MAX_TEXT_CHARS)}…`
}

/** cwd → 显示名（与 client displayTitleOf 同款规则：去尾分隔符取末段）。 */
function workspaceTitleOf(cwd: string): string {
  return cwd.replace(/[/\\]+$/, '').split(/[/\\]/).pop() ?? ''
}

// ── 插件体 ──────────────────────────────────────────────────────────────────

export function applyDonePill(ctx: Context): void {
  // 壳子顶栏热区让位：client POST 状态 → 这里经壳子 CDP 推给壳页面。
  const hotZone = createShellHotZone()
  const titles = new Map<string, string>()
  const items: DonePillEntry[] = []
  // 正在执行的回合：turn/start 时记录开始时间 + 触发消息（该会话最近的
  // 真人 user/message，steering 中途插话也跟随更新）+ 会话标题快照，
  // turn/end 移除（含 aborted）。供前端展示「正在执行的消息 + 实时时长」。
  // 服务重启后清零。subagent 回合不进表（与完成列表口径一致）。
  const runningTurns = new Map<string, { since: number; question: string; title: string }>()
  const lastQuestions = new Map<string, string>()
  // seq = 启动时间戳 + 计数器：进程内单调；重启后启动时间戳变大，
  // 新 seq 必然大于客户端在旧进程里见过的所有 seq（增量水位永不回绕卡死）。
  const seqBase = Date.now()
  let counter = 0

  /** 会话显示标题：缓存 title 事件 > 日志反查 > cwd basename > id。 */
  function titleOf(session: SessionLike): string {
    const cached = titles.get(session.id)
    if (cached !== undefined && cached !== '') return cached
    const events = eventsOf(session)
    for (let i = events.length - 1; i >= 0; i--) {
      const data = events[i]?.data
      if (events[i]?.type === 'session/title' && typeof data?.title === 'string' && data.title !== '') {
        titles.set(session.id, data.title)
        return data.title
      }
    }
    const cwd = session.header?.cwd
    if (typeof cwd === 'string' && cwd !== '') {
      const base = workspaceTitleOf(cwd)
      if (base !== '') return base
    }
    return session.id
  }

  /**
   * 反向扫描事件日志：收集本回合 assistant/message 文本（保持正序拼接），
   * 遇到第一条真人 user/message 记为触发问题后停止。
   */
  function extractTurnTexts(events: readonly SessionEventLike[], turn: number): { question: string; answer: string } {
    const answerParts: string[] = []
    let question = ''
    for (let i = events.length - 1; i >= 0; i--) {
      const event = events[i]
      if (event === undefined) continue
      if (event.type === 'assistant/message') {
        if (event.data?.turn === turn) {
          const text = blocksToText(event.data.message?.content)
          if (text !== '') answerParts.push(text)
        }
        continue
      }
      if (event.type === 'user/message' && event.data?.source?.kind === 'user') {
        question = clampText(blocksToText(event.data.content))
        break
      }
    }
    return { question, answer: clampText(answerParts.reverse().join('\n\n')) }
  }

  ctx.on('session/event', ((session: SessionLike, event: SessionEventLike) => {
    try {
      if (event.type === 'session/title') {
        if (typeof event.data?.title === 'string' && event.data.title !== '') {
          titles.set(session.id, event.data.title)
        }
        return
      }
      if (event.type === 'user/message') {
        // 真人消息（含 queued / steering）：记录为该会话最新触发消息；
        // 若回合已在执行中，同步刷新正在执行的消息展示。
        if (event.data?.source?.kind === 'user') {
          const text = clampText(blocksToText(event.data.content))
          if (text !== '') {
            lastQuestions.set(session.id, text)
            const running = runningTurns.get(session.id)
            if (running !== undefined) runningTurns.set(session.id, { ...running, question: text })
          }
        }
        return
      }
      if (event.type === 'turn/start') {
        if (session.header?.origin === 'subagent') return
        runningTurns.set(session.id, { since: Date.now(), question: lastQuestions.get(session.id) ?? '', title: titleOf(session) })
        return
      }
      if (event.type !== 'turn/end') return
      // 回合结束（含 aborted / subagent）都清除执行计时。
      runningTurns.delete(session.id)
      lastQuestions.delete(session.id)
      if (session.header?.origin === 'subagent') return
      const reasonKind = typeof event.data?.reason?.kind === 'string' ? event.data.reason.kind : ''
      if (reasonKind === 'aborted') return
      const turn = typeof event.data?.turn === 'number' ? event.data.turn : -1
      const events = eventsOf(session)
      const { question, answer } = extractTurnTexts(events, turn)
      // 空回合（无回复也无提问，例如纯斜杠命令回合）不值得上报。
      if (question === '' && answer === '') return
      counter += 1
      const seq = seqBase + counter
      items.push({
        seq,
        id: String(seq),
        sessionId: session.id,
        title: titleOf(session),
        question,
        answer,
        endedAt: Date.now(),
        turn,
        reasonKind,
      })
      if (items.length > MAX_ITEMS) items.splice(0, items.length - MAX_ITEMS)
    } catch (error) {
      ctx.logger?.warn?.(`[dsh-done-pill] turn/end handling failed for ${session.id}: ${String(error)}`)
    }
  }) as never, { global: true })

  const webServer = ctx.get('webServer') as WebServerService | undefined
  if (webServer === undefined) return
  ctx.effect(() => {
    try {
      return webServer.register({
        kind: 'exact',
        path: ROUTE,
        handler: (req, res) => {
          if (req.method !== 'GET') {
            res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ ok: false, message: 'method not allowed' }))
            return
          }
          let since = 0
          try {
            const url = new URL(req.url ?? '/', 'http://localhost')
            const raw = url.searchParams.get('since')
            if (raw !== null && /^\d+$/.test(raw)) since = Number(raw)
          } catch { /* since 解析失败按 0 处理 */ }
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
          res.end(JSON.stringify({
            ok: true,
            version: seqBase + counter,
            items: items.filter(item => item.seq > since),
            running: [...runningTurns.entries()].map(([sessionId, info]) => ({
              sessionId,
              since: info.since,
              question: info.question,
              title: info.title,
            })),
          }))
        },
      })
    } catch (error) {
      // 路由可能已被同路径的其他插件注册（如 webui 的 done-pill 模块）；
      // 记录警告并继续，不让一个路由冲突拖垮整个插件加载。
      ctx.logger?.warn?.(`[dsh-done-pill] route ${ROUTE} already registered (webui done-pill 模块共存？): ${String(error)}`)
      return undefined
    }
  }, 'dsh-done-pill: done-pill route')

  ctx.effect(() => {
    try {
      return webServer.register({
        kind: 'exact',
        path: HOT_ROUTE,
        handler: (req, res) => {
          // 热区状态上报（client 半身 POST）：over=true 时光标悬停在胶囊上，
          // rects 是胶囊当前矩形（页面视口坐标 = 壳页面坐标，iframe 铺满窗口）。
          if (req.method !== 'POST') {
            res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' })
            res.end(JSON.stringify({ ok: false, message: 'method not allowed' }))
            return
          }
          let body = ''
          let tooLarge = false
          req.on('data', (chunk: Buffer) => {
            body += chunk.toString()
            if (body.length > 4096) { tooLarge = true; req.destroy() }
          })
          req.on('end', () => {
            if (tooLarge) return
            try {
              const parsed = JSON.parse(body || '{}') as Partial<HotState>
              const rects = Array.isArray(parsed.rects)
                ? parsed.rects.filter(r => r !== null && typeof r === 'object'
                  && Number.isFinite(r.x) && Number.isFinite(r.y)
                  && Number.isFinite(r.w) && Number.isFinite(r.h) && (r.w as number) > 0 && (r.h as number) > 0)
                .map(r => ({ x: r.x, y: r.y, w: r.w, h: r.h }))
                .slice(0, 8)
                : []
              hotZone.handle({ over: parsed.over === true, rects })
            } catch { /* 上报体损坏：忽略本帧 */ }
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
            res.end(JSON.stringify({ ok: true }))
          })
        },
      })
    } catch (error) {
      ctx.logger?.warn?.(`[dsh-done-pill] route ${HOT_ROUTE} already registered: ${String(error)}`)
      return undefined
    }
  }, 'dsh-done-pill: shell-hot route')

  // 插件卸载时恢复壳页面常态并断开 CDP 连接。
  ctx.effect(() => () => hotZone.stop(), 'dsh-done-pill: shell-hot zone lifecycle')

  console.log(`[dsh-done-pill] done-pill mounted: ${ROUTE} + ${HOT_ROUTE} (global session/event listener active)`)
}

// ── Cordis 插件契约 ────────────────────────────────────────────────────────

export const name = 'dsh-done-pill'
export const inject = ['webServer']

/** 装配对话完成胶囊（host 半身）。 */
export function apply(ctx: Context): void {
  applyDonePill(ctx)
}