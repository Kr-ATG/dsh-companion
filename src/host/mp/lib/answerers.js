/**
 * dsh-mobile-plus —— 手机端审批 / 问询回答器（0.1.2 waterfall 机制）。
 *
 * 0.1.2 里审批与问询不再走旧统一网关的事件流与应答器，而是两条 cordis
 * waterfall 事件：'approval/request' 与 'user-questions/request'。本模块把
 * 手机当成其中一位回答者：
 *
 * - 只有手机最近碰过该会话（prompt / history / pending 轮询，5 分钟内）才
 *   接单，否则立刻 next() 让桌面端对话框照常弹出；
 * - 接单后在手机 SSE 上推 requested 帧，手机回 mobile.respond 即决议；
 * - 决议同时推 resolved 帧，pending 快照与 SSE 状态灯都跟着走。
 */
import { randomUUID } from 'node:crypto'

const TOUCH_TTL_MS = 5 * 60 * 1000
const MAX_PENDING = 50

const touches = new Map()
const approvals = new Map()
const questions = new Map()

export function touchPhone(sessionId) {
  if (typeof sessionId === 'string' && sessionId !== '') touches.set(sessionId, Date.now())
}

export function phonePresent(sessionId) {
  const at = touches.get(sessionId)
  return at !== undefined && Date.now() - at < TOUCH_TTL_MS
}

function prune(map) {
  if (map.size <= MAX_PENDING) return
  const keys = [...map.keys()].slice(0, map.size - MAX_PENDING)
  for (const key of keys) map.delete(key)
}

function agentSessionId(req, scoped) {
  const agent = (scoped && scoped.agent) || (req && req.agent)
  const id = agent && agent.session && agent.session.id
  return typeof id === 'string' ? id : undefined
}

function onAbort(signal, fn) {
  if (!signal) return () => {}
  if (signal.aborted) {
    fn()
    return () => {}
  }
  signal.addEventListener('abort', fn, { once: true })
  return () => signal.removeEventListener('abort', fn)
}

export function pendingSnapshot(sessionId) {
  const list = (map) => [...map.values()]
    .filter((row) => row.sessionId === sessionId)
    .map((row) => row.view)
  return { approvals: list(approvals), questions: list(questions) }
}

export function resolveApproval(sessionId, approvalId, outcome) {
  if (outcome !== 'allowed-once' && outcome !== 'rejected') {
    throw new Error('未知的审批决议')
  }
  const row = approvals.get(approvalId)
  if (!row || row.sessionId !== sessionId) throw new Error('没有待处理的审批')
  approvals.delete(approvalId)
  row.settle(outcome)
  return true
}

export function resolveQuestion(sessionId, rpcId, answers) {
  const row = questions.get(rpcId)
  if (!row || row.sessionId !== sessionId) throw new Error('没有待处理的提问')
  if (!Array.isArray(answers)) throw new Error('回答格式不对')
  const clean = answers
    .filter((a) => a && typeof a.id === 'string')
    .map((a) => ({
      id: a.id,
      selected: Array.isArray(a.selected) ? a.selected.filter((s) => typeof s === 'string') : [],
      ...(typeof a.custom === 'string' && a.custom !== '' ? { custom: a.custom } : {}),
    }))
  questions.delete(rpcId)
  row.settle({ answers: clean })
  return true
}

function claimApproval(ctx, tracker, emit) {
  return function approvalAnswerer(req, next) {
    let sessionId
    try {
      sessionId = agentSessionId(req, this)
      if (!sessionId || !phonePresent(sessionId)) return next()
    } catch {
      return next()
    }
    const approvalId = randomUUID()
    let settled = false
    const finish = (outcome) => {
      if (settled) return
      settled = true
      approvals.delete(approvalId)
      emit({ type: 'approval/resolved', sessionId, approvalId })
    }
    const outcome = new Promise((resolve) => {
      approvals.set(approvalId, {
        sessionId,
        settle: (value) => { finish(value); resolve(value) },
        view: {
          rpcId: approvalId,
          approvalId,
          toolName: req.toolName || 'tool',
          callId: req.callId,
          reason: req.reason,
        },
      })
      prune(approvals)
    })
    emit({
      type: 'approval/requested',
      sessionId,
      approvalId,
      rpcId: approvalId,
      toolName: req.toolName || 'tool',
      callId: req.callId,
      reason: req.reason,
    })
    const detach = onAbort(req.signal, () => {
      if (settled) return
      finish('cancelled')
    })
    return outcome.then(
      (value) => { detach(); finish(value); return value },
      () => { detach(); finish('cancelled'); return 'cancelled' },
    )
  }
}

function claimQuestion(ctx, tracker, emit) {
  return function questionAnswerer(req, next) {
    let sessionId
    try {
      sessionId = agentSessionId(req, this)
      if (!sessionId || !phonePresent(sessionId)) return next()
      if (!req || !Array.isArray(req.questions)) return next()
    } catch {
      return next()
    }
    const rpcId = randomUUID()
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      questions.delete(rpcId)
      emit({ type: 'question/resolved', sessionId, questionRpcId: rpcId })
    }
    const answer = new Promise((resolve) => {
      questions.set(rpcId, {
        sessionId,
        settle: (value) => { finish(); resolve(value) },
        view: { rpcId, questions: req.questions },
      })
      prune(questions)
    })
    emit({ type: 'question/requested', sessionId, rpcId, questions: req.questions })
    const detach = onAbort(req.signal, () => {
      if (settled) return
      finish()
    })
    return answer.then(
      (value) => { detach(); finish(); return value },
      () => {
        detach()
        finish()
        return { answers: [] }
      },
    )
  }
}

/**
 * 注册两条 waterfall 回答器，返回卸载函数。服务缺失（极老宿主）时静默跳过，
 * 手机 pending 轮询照常返回空快照，不炸。
 */
export function setupAnswerers(ctx, tracker, emit) {
  const disposers = []
  try {
    const off = ctx.on('approval/request', claimApproval(ctx, tracker, emit))
    if (typeof off === 'function') disposers.push(off)
  } catch { /* 老宿主无此事件 */ }
  try {
    const off = ctx.on('user-questions/request', claimQuestion(ctx, tracker, emit))
    if (typeof off === 'function') disposers.push(off)
  } catch { /* 老宿主无此事件 */ }
  return () => {
    for (const off of disposers) {
      try { off() } catch { /* ignore */ }
    }
  }
}
