/**
 * dsh-mobile-plus —— 会话标题富化（独立子模块）。
 *
 * 上游列表行由旧统一网关直接带回 title；0.1.2 的 sessionController.list 只在
 * 投影缓存命中时才带 projections.values.title，冷会话会缺，手机端于是回退显示
 * 目录名（看起来像「标题变成了工作区」）。这里补齐：投影已有的不动，缺的走
 * sessionQuery.readTitleSnapshots 批量冷读（一次调用 N 个会话，不激活任何会话），
 * 结果写进行上的 title 字段并缓存 2 分钟，扛住手机端 25 秒一轮的列表轮询。
 * 读不到就留空，手机端按自己的顺序回退（空会话→「新会话」，否则目录名）。
 */
import { svc } from './services.js'

const titleCache = new Map()
const TITLE_TTL_MS = 120 * 1000

function cachedTitle(sessionId, now) {
  const hit = titleCache.get(sessionId)
  return hit && now - hit.at < TITLE_TTL_MS ? hit.title : undefined
}

/** 实时标题事件到达时顺手写缓存，下一次列表就是热的。 */
export function noteTitle(sessionId, title) {
  if (typeof sessionId !== 'string' || typeof title !== 'string') return
  const text = title.trim()
  if (text === '') return
  titleCache.set(sessionId, { title: text, at: Date.now() })
}

export async function enrichTitles(ctx, items, signal) {
  const now = Date.now()
  const need = []
  for (const item of items) {
    if (!item || typeof item.sessionId !== 'string') continue
    const projected = item.projections && item.projections.values
      ? item.projections.values.title
      : undefined
    if (typeof projected === 'string' && projected.trim() !== '') continue
    const hit = cachedTitle(item.sessionId, now)
    if (hit !== undefined) {
      item.title = hit
      continue
    }
    need.push(item)
  }
  if (need.length === 0) return items
  try {
    const query = svc(ctx, 'sessionQuery')
    if (!query || typeof query.readTitleSnapshots !== 'function') return items
    const rows = await query.readTitleSnapshots(need.map((item) => item.sessionId), signal)
    for (const row of rows || []) {
      const snap = row && row.status === 'fulfilled' && row.value ? row.value.title : undefined
      const title = snap && typeof snap.title === 'string' ? snap.title.trim() : ''
      if (title === '') continue
      const item = need.find((it) => it.sessionId === row.sessionId)
      if (!item) continue
      titleCache.set(item.sessionId, { title, at: Date.now() })
      item.title = title
    }
  } catch { /* 标题读失败就按手机端自己的回退显示 */ }
  if (titleCache.size > 1000) {
    for (const [id, row] of titleCache) {
      if (now - row.at >= TITLE_TTL_MS) titleCache.delete(id)
    }
  }
  return items
}
