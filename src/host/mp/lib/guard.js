/**
 * 配对失败限流：同一来源在窗口内失败太多次就暂时拒绝，
 * 防止固定配对码被在线穷举。成功一次即清零。
 */
const MAX_FAILS = 10
const WINDOW_MS = 10 * 60 * 1000

export class AttemptGuard {
  constructor() {
    this.fails = new Map()
  }

  blocked(key) {
    const hits = this.fails.get(key)
    if (!hits) return false
    const recent = hits.filter((t) => Date.now() - t < WINDOW_MS)
    if (recent.length === 0) this.fails.delete(key)
    else this.fails.set(key, recent)
    return recent.length >= MAX_FAILS
  }

  fail(key) {
    const hits = this.fails.get(key) || []
    hits.push(Date.now())
    this.fails.set(key, hits.slice(-MAX_FAILS))
  }

  reset(key) {
    this.fails.delete(key)
  }
}

export function remoteKey(req) {
  const addr = req?.socket?.remoteAddress
  return typeof addr === 'string' && addr !== '' ? addr : 'unknown'
}
