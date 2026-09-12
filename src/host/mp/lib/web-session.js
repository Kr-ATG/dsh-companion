/**
 * 给已配对手机签发 dsh web 会话 cookie。
 * dsh web 根路径 "/" 由每次重启都会更换的 launch token 把守（不扫码就 401），
 * 但会话 cookie 的签名密钥持久存在 credentials（client-connection/browser-session）。
 * 本模块用同一枚密钥给手机签一枚 29 天 cookie：开全量 web 界面免扫码、跨重启有效。
 * 只给已完成插件配对的设备签；固定配对码 + 本模块 = 手机永远不用再碰 token。
 */
import { createHash, createHmac } from 'node:crypto'
import { cookieValue } from './utils.js'

const AUTH_RECORD_KEY = 'client-connection/browser-session'
const COOKIE_PREFIX = 'dsh-auth-'
const DAY_MS = 24 * 60 * 60 * 1000
// client-connection 默认 cookieMaxAgeDays=30，签发跨度必须 ≤ 它，留 1 天余量
const GRANT_DAYS = 29

function encodeBase64Url(buf) {
  return Buffer.from(buf).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '')
}

function decodeBase64Url(value) {
  if (!/^[A-Za-z0-9_-]*$/.test(value) || value.length % 4 === 1) return undefined
  const padding = '='.repeat((4 - value.length % 4) % 4)
  const decoded = Buffer.from(value.replaceAll('-', '+').replaceAll('_', '/') + padding, 'base64')
  return encodeBase64Url(decoded) === value ? decoded : undefined
}

/** 与 client-connection 的 cookieName 一致：名字绑定 Host authority。 */
export function webSessionCookieName(authority) {
  return COOKIE_PREFIX + encodeBase64Url(createHash('sha256').update(authority).digest())
}

export class WebSessionGranter {
  constructor(credentials) {
    this.credentials = credentials
    this.secret = undefined
  }

  /** 载入签名密钥；credentials 里没有记录（宿主太老）则保持不可用。 */
  async prepare() {
    try {
      const record = await this.credentials.readRecord(AUTH_RECORD_KEY)
      if (!record || record.kind !== 'grant') return false
      const secret = decodeBase64Url(String(record.payload?.secret ?? ''))
      if (!secret || secret.length !== 32) return false
      this.secret = secret
      return true
    } catch {
      return false
    }
  }

  cookieFor(authority) {
    if (this.secret === undefined || typeof authority !== 'string' || authority === '') return undefined
    const issuedAt = Date.now()
    const expiresAt = issuedAt + GRANT_DAYS * DAY_MS
    const body = encodeBase64Url(Buffer.from(JSON.stringify({
      version: 1, authority, issuedAt, expiresAt,
    }), 'utf8'))
    const sig = encodeBase64Url(createHmac('sha256', this.secret).update(body).digest())
    const maxAge = Math.floor((expiresAt - issuedAt) / 1000)
    return `${webSessionCookieName(authority)}=v1.${body}.${sig}; Max-Age=${String(maxAge)}; Path=/; Expires=${new Date(expiresAt).toUTCString()}; HttpOnly; SameSite=Lax`
  }
}

/** 设备被撤销后再开 /mp/：把它残留的 web 会话 cookie 清掉（Max-Age=0）。 */
export function clearCookieForRequest(req) {
  const host = req?.headers?.host
  if (typeof host !== 'string' || host === '') return {}
  let authority
  try {
    authority = new URL(`http://${host}`).host
  } catch {
    return {}
  }
  const name = webSessionCookieName(authority)
  if (cookieValue(req.headers.cookie, name) === undefined) return {}
  return { 'set-cookie': `${name}=; Max-Age=0; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax` }
}

/** 从请求 Host 头取 authority 并签一枚 cookie；不可用时 undefined。 */
export function cookieForRequest(granter, req) {
  if (!granter) return undefined
  const host = req?.headers?.host
  if (typeof host !== 'string' || host === '') return undefined
  try {
    return granter.cookieFor(new URL(`http://${host}`).host)
  } catch {
    return undefined
  }
}
