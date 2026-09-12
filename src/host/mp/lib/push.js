/**
 * 配对令牌外推：每次签发 / 服务启动后，把最新的一次性配对链接
 * POST 给自建的接收端（反代服务器上的小接口、ntfy、知识库等），
 * 手机从服务器取最新 token，不必回电脑重新扫码。
 * 推送体只带一次性令牌，绝不带固定配对码。
 */
import { hostname } from 'node:os'

const PUSH_TIMEOUT_MS = 10_000
const RETRY_DELAYS_MS = [0, 3_000, 10_000, 30_000]

export function normalizePushUrl(raw) {
  const trimmed = String(raw || '').trim().replace(/\/$/, '')
  if (trimmed === '') return ''
  try {
    const parsed = new URL(trimmed)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return ''
    return trimmed
  } catch {
    return ''
  }
}

export function buildPushPayload(issue, reason) {
  const { qr, qrLan, qrLocal, fixedPairCode, ...compact } = issue
  return {
    type: 'dsh-mobile-plus/pair',
    reason,
    pushedAt: Date.now(),
    hostname: hostname(),
    platform: process.platform,
    hasFixedPairCode: Boolean(fixedPairCode),
    ...compact,
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 尽力送达：带退避重试，全部失败只 warn，不影响配对页本身。 */
export async function pushPairInfo(url, headers, payload, warn = (m) => console.warn(m)) {
  const body = JSON.stringify(payload)
  let lastError = ''
  for (let attempt = 0; attempt < RETRY_DELAYS_MS.length; attempt += 1) {
    if (RETRY_DELAYS_MS[attempt] > 0) await sleep(RETRY_DELAYS_MS[attempt])
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...(headers || {}) },
        body,
        signal: AbortSignal.timeout(PUSH_TIMEOUT_MS),
      })
      if (res.ok) return true
      lastError = 'HTTP ' + res.status
    } catch (error) {
      lastError = String((error && error.message) || error)
    }
  }
  warn('[dsh-mobile-plus] 配对令牌推送失败（' + url + '）：' + lastError)
  return false
}
