/**
 * Pairing and authorization status.
 * 配对成功后把用过的码 / 令牌记进 localStorage；cookie 失效时用
 * tryAutoRepair() 静默重配（固定配对码场景下用户永远不用再输入）。
 */

const SAVED_TOKEN_KEY = 'mp_pair_token'

export function loadSavedPairToken() {
    try { return localStorage.getItem(SAVED_TOKEN_KEY) || '' } catch { return '' }
  }

export function saveSavedPairToken(token) {
    try {
      if (typeof token === 'string' && token !== '') localStorage.setItem(SAVED_TOKEN_KEY, token)
    } catch { /* privacy mode: non-persistent is acceptable */ }
  }

export function parsePairInput(value) {
    const trimmed = (value || '').trim()
    if (trimmed === '') return undefined
    const digitsOnly = trimmed.replace(/[s-]+/g, '')
    if (/^d{6}$/.test(digitsOnly)) return digitsOnly
    try {
      const base = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'http://localhost'
      const url = new URL(trimmed, base)
      const token = url.searchParams.get('pair')
      if (token) return token
    } catch {
      /* raw token or relative query */
    }
    if (/^[a-f0-9]{32}$/i.test(trimmed)) return trimmed
    // 固定配对码：4~64 位字母数字与 . _ ~ -
    if (/^[A-Za-z0-9._~-]{4,64}$/.test(trimmed)) return trimmed
    return undefined
  }

async function postAccept(token) {
    return fetch('/mp/pair/accept', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ token }),
    })
  }

export async function acceptPair(token) {
    try {
      const res = await postAccept(token)
      if (res.ok) {
        saveSavedPairToken(token)
        return undefined
      }
      if (res.status === 404) return '配对码或链接无效，或已过期。'
      if (res.status === 409) return '配对码或链接已被使用。'
      if (res.status === 429) return '尝试次数过多：请 10 分钟后再试，或核对配对码。'
      return '此设备无法完成配对。'
    } catch {
      return '网络不可达：确认电脑端 dsh 与隧道在线后再试。'
    }
  }

let repairing = false

/** 用记住的码静默重新配对一次；成功 true，失败 false。并发调用只放行一个。 */
export async function tryAutoRepair() {
    const saved = loadSavedPairToken()
    if (!saved || repairing) return false
    repairing = true
    try {
      const res = await postAccept(saved)
      return res.ok
    } catch {
      return false
    } finally {
      repairing = false
    }
  }

export async function pairStatus() {
    try {
      const res = await fetch('/mp/pair/status', { credentials: 'same-origin' })
      const data = await res.json()
      return data.paired === true
    } catch {
      return false
    }
  }
