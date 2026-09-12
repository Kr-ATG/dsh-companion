/**
 * 已配对设备的持久化存储：加载 / 保存 / 空闲清理 / 状态行渲染。
 * `pinned: true` 的设备（用固定配对码配上的）不参与空闲淘汰。
 */
import { randomBytes, randomInt } from 'node:crypto'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { IDLE_MS, OFFLINE_MS } from './constants.js'

export function deviceCookie(id, row) {
  return typeof row?.secret === 'string' && row.secret !== '' ? row.secret : id
}

export function deviceId() {
  return randomBytes(16).toString('hex')
}

export function pairingCode() {
  return String(randomInt(100000, 1000000))
}

export function loadDevices(file) {
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8'))
    if (raw && typeof raw === 'object' && raw.devices && typeof raw.devices === 'object') return raw.devices
  } catch {}
  return {}
}

export function saveDevices(file, devices) {
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify({ version: 1, devices }, null, 2), { mode: 0o600 })
}

export function aliveDevices(devices) {
  const now = Date.now()
  let count = 0
  let cleaned = false
  for (const id of Object.keys(devices)) {
    const row = devices[id]
    if (!row.pinned && now - row.lastSeenAt > IDLE_MS) {
      delete devices[id]
      cleaned = true
      continue
    }
    count += 1
  }
  return { count, cleaned }
}

export function deviceRows(devices) {
  const now = Date.now()
  return Object.entries(devices).map(([id, row]) => ({
    id,
    createdAt: row.createdAt,
    lastSeenAt: row.lastSeenAt,
    userAgent: row.label,
    pinned: row.pinned === true,
    online: now - row.lastSeenAt < OFFLINE_MS,
  }))
}
