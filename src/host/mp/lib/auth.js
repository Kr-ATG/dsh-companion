import { randomBytes } from 'node:crypto'
import { join } from 'node:path'
import { makeQrSvg } from '../qrcodegen.js'
import {
  PREFIX,
  COOKIE,
  TOKEN_TTL_MS,
  IDLE_MS,
  COOKIE_MAX_AGE_SEC,
  dshHome,
} from './constants.js'
import {
  json,
  readBody,
  isLoopback,
  isLanHost,
  getLanIps,
  cookieValue,
  sameSecret,
  isHttps,
  svgDataUri,
} from './utils.js'
import {
  deviceCookie,
  deviceId,
  pairingCode,
  loadDevices,
  saveDevices,
  aliveDevices,
  deviceRows,
} from './devices.js'
import { AttemptGuard, remoteKey } from './guard.js'
import { normalizePushUrl, buildPushPayload, pushPairInfo } from './push.js'
import { WebSessionGranter, cookieForRequest } from './web-session.js'

/** 固定配对码：4~64 位无空白字符；配错格式就当没设，不静默放宽。 */
function normalizeFixedCode(raw) {
  const trimmed = String(raw ?? '').trim()
  if (trimmed.length < 4 || trimmed.length > 64) return ''
  if (!/^[A-Za-z0-9._~-]+$/.test(trimmed)) return ''
  return trimmed
}

export class AuthManager {
  constructor(config = {}) {
    this.publicBaseUrl = (config.publicBaseUrl || '').trim().replace(/\/$/, '')
    this.requirePairing = config.requirePairing !== false
    this.publicHost = ''
    try {
      this.publicHost = this.publicBaseUrl === '' ? '' : new URL(this.publicBaseUrl).host
    } catch {
      this.publicHost = ''
    }
    this.devicesFile = config.devicesFile || join(dshHome(), 'mobile-plus-devices.json')
    this.devices = loadDevices(this.devicesFile)
    this.lanPort = typeof config.lanPort === 'number' ? config.lanPort : 0
    this.token = undefined
    this.fixedPairCode = normalizeFixedCode(config.fixedPairCode ?? process.env.DSH_MOBILE_PAIR_CODE)
    this.pushUrl = normalizePushUrl(config.tokenPushUrl || process.env.DSH_MOBILE_PUSH_URL)
    this.pushHeaders = config.tokenPushHeaders && typeof config.tokenPushHeaders === 'object'
      ? config.tokenPushHeaders
      : {}
    this.guard = new AttemptGuard()
    this.grantWebSession = config.grantWebSession === true; this.webGrant = undefined
  }

  /** grantWebSession: true 时预热 credentials 签名密钥。 */
  setupWebSession(credentials) {
    if (!this.grantWebSession || !credentials) return
    this.webGrant = new WebSessionGranter(credentials); void this.webGrant.prepare()
  }

  persist() {
    saveDevices(this.devicesFile, this.devices)
  }

  trustedHost(req) {
    if (isLoopback(req)) return true
    if (isLanHost(req)) return true
    const host = req.headers.host
    return typeof host === 'string' && this.publicHost !== '' && host === this.publicHost
  }

  findByCookie(cookie) {
    if (typeof cookie !== 'string' || cookie === '') return undefined
    for (const id of Object.keys(this.devices)) {
      const row = this.devices[id]
      if (sameSecret(deviceCookie(id, row), cookie)) return { id, row }
    }
    return undefined
  }

  touch(req) {
    const found = this.findByCookie(cookieValue(req.headers.cookie, COOKIE))
    if (!found) return false
    if (!found.row.pinned && Date.now() - found.row.lastSeenAt > IDLE_MS) {
      delete this.devices[found.id]
      this.persist()
      return false
    }
    found.row.lastSeenAt = Date.now()
    this.persist()
    return true
  }

  setDeviceCookie(resHeaders, secret, req) {
    const expires = new Date(Date.now() + COOKIE_MAX_AGE_SEC * 1000).toUTCString()
    const parts = [
      `${COOKIE}=${secret}`,
      `Path=${PREFIX}`,
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${COOKIE_MAX_AGE_SEC}`,
      `Expires=${expires}`,
    ]
    if (isHttps(req)) parts.push('Secure')
    resHeaders['set-cookie'] = parts.join('; ')
    return resHeaders
  }

  cookieHeadersIfPaired(req) {
    const found = this.findByCookie(cookieValue(req.headers.cookie, COOKIE))
    if (!found) return {}
    const headers = this.setDeviceCookie({}, deviceCookie(found.id, found.row), req)
    const web = cookieForRequest(this.webGrant, req)
    if (web) headers['set-cookie'] = [headers['set-cookie'], web] // 顺带续期 web 会话
    return headers
  }

  /** 生成一次性令牌与三种配对链接（setup 页与推送共用）。 */
  mintToken(port) {
    const secret = randomBytes(16).toString('hex')
    const code = pairingCode()
    this.token = { secret, code, expiresAt: Date.now() + TOKEN_TTL_MS, consumed: false }
    const lanIps = getLanIps()
    const primaryLanIp = lanIps[0] || ''
    const lanPort = this.lanPort || port
    const lanUrl = primaryLanIp !== '' ? `http://${primaryLanIp}:${String(lanPort)}${PREFIX}/?pair=${secret}` : ''
    const localUrl = `http://127.0.0.1:${String(port)}${PREFIX}/?pair=${secret}`
    const url = this.publicBaseUrl !== '' ? `${this.publicBaseUrl}${PREFIX}/?pair=${secret}` : (lanUrl || localUrl)
    return {
      ok: true,
      token: secret,
      url,
      lanUrl,
      localUrl,
      lanIp: primaryLanIp,
      code,
      qr: svgDataUri(makeQrSvg(url)),
      qrLan: lanUrl !== '' ? svgDataUri(makeQrSvg(lanUrl)) : '',
      qrLocal: svgDataUri(makeQrSvg(localUrl)),
      expiresAt: this.token.expiresAt,
      publicBaseUrl: this.publicBaseUrl,
      fixedPairCode: this.fixedPairCode,
    }
  }

  /** 把最新一次性令牌推给自建接收端；未配置则静默跳过。 */
  pushToken(issue, reason) {
    if (this.pushUrl === '') return Promise.resolve(false)
    return pushPairInfo(this.pushUrl, this.pushHeaders, buildPushPayload(issue, reason))
  }

  /** 服务启动后自动签发并推送一份，重启后服务器永远有最新 token。 */
  async autoIssuePush(port) {
    if (this.pushUrl === '') return false
    return this.pushToken(this.mintToken(port), 'startup')
  }

  handleIssue = async (port, req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405)
      res.end()
      return
    }
    if (!isLoopback(req)) {
      json(res, 403, { ok: false, code: 'forbidden' })
      return
    }
    const payload = this.mintToken(port)
    void this.pushToken(payload, 'issue')
    json(res, 200, payload)
  }

  handleAccept = async (req, res) => {
    if (req.method !== 'POST') {
      res.writeHead(405)
      res.end()
      return
    }
    if (!this.trustedHost(req)) {
      json(res, 403, { ok: false, code: 'forbidden' })
      return
    }
    let body
    try {
      body = await readBody(req, 4096)
    } catch {
      json(res, 400, { ok: false, code: 'bad-payload' })
      return
    }
    const offered = typeof body.token === 'string' ? body.token.trim() : ''
    const ip = remoteKey(req)
    if (this.guard.blocked(ip)) {
      json(res, 429, { ok: false, code: 'too-many-attempts' })
      return
    }
    const oneTime = Boolean(
      this.token
      && !this.token.consumed
      && Date.now() <= this.token.expiresAt
      && (sameSecret(this.token.secret, offered) || sameSecret(this.token.code, offered)),
    )
    const fixed = !oneTime && this.fixedPairCode !== '' && sameSecret(this.fixedPairCode, offered)
    if (!oneTime && !fixed) {
      if (offered !== '') this.guard.fail(ip)
      json(res, 404, { ok: false, code: 'invalid-token' })
      return
    }
    this.guard.reset(ip)
    if (oneTime) this.token.consumed = true
    const id = deviceId()
    const cookieSecret = deviceId()
    this.devices[id] = {
      secret: cookieSecret,
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      pinned: fixed,
      label: typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'].slice(0, 180) : 'phone',
    }
    this.persist()
    const extra = this.setDeviceCookie({}, cookieSecret, req)
    const web = cookieForRequest(this.webGrant, req); if (web) extra['set-cookie'] = [extra['set-cookie'], web]
    json(res, 200, { ok: true, deviceId: id }, extra)
  }

  handleStatus = (req, res) => {
    if (req.method !== 'GET') {
      res.writeHead(405)
      res.end()
      return
    }
    if (!this.trustedHost(req)) {
      json(res, 403, { ok: false, code: 'forbidden' })
      return
    }
    const paired = this.requirePairing ? this.touch(req) : true
    const extra = paired && this.requirePairing ? this.cookieHeadersIfPaired(req) : {}
    if (!isLoopback(req)) {
      json(res, 200, {
        ok: true,
        paired,
        deviceCount: 0,
        onlineCount: 0,
        devices: [],
        publicBaseUrl: this.publicBaseUrl,
      }, extra)
      return
    }
    const alive = aliveDevices(this.devices)
    if (alive.cleaned) this.persist()
    const rows = deviceRows(this.devices)
    json(res, 200, {
      ok: true,
      paired,
      deviceCount: alive.count,
      onlineCount: rows.filter((row) => row.online).length,
      devices: rows,
      publicBaseUrl: this.publicBaseUrl,
    }, extra)
  }

  handleStop = (req, res) => {
    if (req.method !== 'POST') return res.writeHead(405).end()
    if (!isLoopback(req)) return json(res, 403, { ok: false, code: 'forbidden' })
    this.token = undefined
    for (const id of Object.keys(this.devices)) delete this.devices[id]
    this.persist()
    json(res, 200, { ok: true })
  }

  handleRevoke = async (req, res) => {
    if (req.method !== 'POST') return res.writeHead(405).end()
    if (!isLoopback(req)) return json(res, 403, { ok: false, code: 'forbidden' })
    let body
    try {
      body = await readBody(req, 4096)
    } catch {
      return json(res, 400, { ok: false, code: 'bad-payload' })
    }
    const id = typeof body.deviceId === 'string' ? body.deviceId : ''
    if (id === '' || !Object.prototype.hasOwnProperty.call(this.devices, id)) {
      return json(res, 404, { ok: false, code: 'unknown-device' })
    }
    delete this.devices[id]
    this.persist()
    json(res, 200, { ok: true })
  }
}
