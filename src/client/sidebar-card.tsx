/**
 * dsh-done-pill — 左下角小横条卡片（client 半身）。
 *
 * 挂载在 `sidebar.footer.action`（侧边栏底部、设置行上方，声明见
 * ui-sidebar 的 slot 契约：footArea 内 footerActions 在上、settingsArea
 * 在下纵向排列）。与顶部悬浮胶囊（pill.tsx 的 DonePill）互斥显示，
 * 由设置里的「胶囊形态」切换（stores.modeStore）：
 *  - mode === 'card'：本卡片显示，悬浮胶囊隐藏；
 *  - mode === 'float'：本卡片返回 null，悬浮胶囊显示。
 *
 * 数据口径与悬浮胶囊一致：轮询 host 的 /api/dsh-done-pill（完成记录增量
 * + 进行中回合列表）。小横条只做摘要展示；鼠标悬停（触屏点按亦可）时
 * 在卡片上方弹出面板，展示「进行中 + 最近完成」。
 *
 * 本文件不 import pill.tsx（避免循环依赖）：共享 store 走 ./stores；
 * 胶囊样式表（--dpl-* 变量 + keyframes）由 pill.tsx 的 applyDonePill 在
 * 启动时全局注入一次，本卡片只复用类名，不重复注入。
 */
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { appearanceStore, enabledStore, fontStackOf, modeStore, type AppearanceConfig } from './stores'

/** sidebar.footer.action 的 owner props（ui-sidebar 契约）：只有列宽状态。 */
export interface SidebarBarCardProps {
  wide?: boolean
}

interface DoneEntry {
  seq: number
  id: string
  sessionId: string
  title: string
  question: string
  answer: string
  endedAt: number
  turn: number
  reasonKind: string
}

/** 轮询间隔（ms，与悬浮胶囊一致）。 */
const POLL_MS = 3000
/** 内存保留条目上限（卡片弹窗只展示前几条，保留 30 条足够）。 */
const MAX_ENTRIES = 30
/** localStorage 已读 id 上限（与悬浮胶囊同键共享）。 */
const MAX_READ_IDS = 300
const READ_KEY = 'dsh.donePill.read'
/** 弹窗展示的最近完成条数。 */
const POP_RECENT_N = 5
/** 弹窗展示的进行中条数。 */
const POP_RUNNING_N = 5
/** 弹窗宽度（px）。 */
const POP_W = 440
/** hover 离开后延迟关闭（ms）：给鼠标从卡片滑到弹窗留出桥接时间。 */
const CLOSE_DELAY_MS = 150

// ---- 会话跳转（点击时懒取 sessions 服务，与 pill.tsx 同款做法）----

let sessionsAccessor: (() => { open(id: SessionId): void } | undefined) | undefined
let sessionsWarned = false

/** 由 applyDonePill 在注册槽位时注入（pill.tsx 调用）。 */
export function setSidebarSessionsAccessor(
  fn: () => { open(id: SessionId): void } | undefined,
): void {
  sessionsAccessor = fn
}

function openSessionById(sessionId: string): void {
  try {
    const runtime = sessionsAccessor?.()
    if (runtime === undefined) {
      if (!sessionsWarned) {
        sessionsWarned = true
        console.warn('[dsh-done-pill] sessions 服务不可用，点击无法跳转会话（刷新页面后重试）')
      }
    } else {
      runtime.open(sessionId as SessionId)
    }
  } catch (error) {
    console.warn('[dsh-done-pill] 跳转会话失败：', error)
  }
}

// ---- localStorage：已读 id（与悬浮胶囊同键，切换形态后已读态延续）----

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_KEY)
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw)
      if (Array.isArray(parsed)) return new Set(parsed.filter((v): v is string => typeof v === 'string'))
    }
  } catch { /* 忽略 */ }
  return new Set()
}

function saveReadIds(ids: Set<string>): void {
  try {
    const arr = [...ids]
    localStorage.setItem(READ_KEY, JSON.stringify(arr.length > MAX_READ_IDS ? arr.slice(-MAX_READ_IDS) : arr))
  } catch { /* 忽略 */ }
}

// ---- 展示工具（与 pill.tsx 同款规则的小子集）----

function formatTime(ts: number): string {
  if (ts <= 0) return ''
  const d = new Date(ts)
  const now = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  if (d.toDateString() === now.toDateString()) return `${hh}:${mm}`
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${mo}-${day} ${hh}:${mm}`
}

function truncate(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length <= max ? flat : `${flat.slice(0, max)}…`
}

/** 执行时长：mm:ss，超 1 小时 h:mm:ss。 */
function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const hh = Math.floor(total / 3600)
  const mm = Math.floor((total % 3600) / 60)
  const ss = total % 60
  if (hh > 0) return `${hh}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  return `${mm}:${String(ss).padStart(2, '0')}`
}

/**
 * 最近完成按分钟分组（formatTime 同键即同组）：时间升级为一级菜单组头，
 * 同一分钟的多条消息归入一个分类。列表按完成时间倒序，相邻同键合并即可。
 */
function groupByMinute(items: DoneEntry[]): Array<{ time: string; items: DoneEntry[] }> {
  const groups: Array<{ time: string; items: DoneEntry[] }> = []
  for (const item of items) {
    const time = formatTime(item.endedAt)
    const last = groups[groups.length - 1]
    if (last !== undefined && last.time === time) last.items.push(item)
    else groups.push({ time, items: [item] })
  }
  return groups
}

// ---- 底部布局修正（注入式 CSS，不改 DSH / 其他插件源码）----
// dsh-mobile-plus 把宽栏 foot 改成了一行（设置左、动作右），小横条会被挤到
// 设置右边去。目标两行：首行只放本卡片（独占整行），末行保持原样
// （设置 + 手机配对等动作图标，位置不动）。
// 做法：槽位渲染器自身的出口包裹层已经是 display:contents（不占布局），这里
// 把 footerActions 及其槽位出口一并透明化，让「卡片 / 其他图标 / 设置区」直接
// 成为 foot 的 flex 成员再重排：卡片与设置同取 order:-1（DOM 里卡片在前，
// 同级决胜卡片占首行、设置占末行首位），其他动作图标保持默认 order（0/1 无妨，
// 一律排在设置之后、末行右侧，与原来一致）——不再逐个点名图标 class，
// 新增/未知的动作图标也自动归位。
// 规则只在「宽栏（mp-trigger-wide 存在）+ 本卡片已挂载」时生效（:has 双锁），
// 切悬浮（卡片卸载）/ 窄轨 / 无 mobile-plus 时自动失效，原生纵向布局不受影响；
// 钩子用本地名后缀（hash 前缀会变）；特异度逐条压过 mobile-plus，
// 不依赖插件加载顺序。

const CARD_LAYOUT_STYLE_ID = 'dsh-done-pill-card-layout'

const CARD_LAYOUT_CSS = `
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]){
  flex-wrap:wrap;
  row-gap:8px;
}
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]) [class*="_footerActions"],
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]) [class*="_footerActions"] > [data-slot]{
  display:contents;
}
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]) [data-dpp-card]{
  order:-1;
  flex-grow:1;
  flex-basis:100% !important;
  min-width:0;
}
[class*="_footArea"][class*="_footArea"]:has(.mp-trigger-wide):has([data-dpp-card]) [class*="_settingsArea"]{
  order:-1;
  flex:1 1 auto;
  width:auto;
  min-width:0;
}
`

/** 幂等注入布局修正样式（apply 时调用一次即可，规则自带 :has 自失效）。 */
export function ensureCardLayoutCss(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(CARD_LAYOUT_STYLE_ID) !== null) return
  const style = document.createElement('style')
  style.id = CARD_LAYOUT_STYLE_ID
  style.dataset.plugin = 'dsh-done-pill'
  style.textContent = CARD_LAYOUT_CSS
  document.head.appendChild(style)
}

// ---- 样式 ----

/** 卡片外层：占满 footerActions 整行（wide）；收起态居中。 */
const wrapStyle = (wide: boolean, fontStack: string, scale: number): CSSProperties => ({
  flex: wide ? '1 1 auto' : 'none',
  minWidth: 0,
  width: wide ? '100%' : 'auto',
  display: 'flex',
  ...(fontStack !== '' ? { fontFamily: fontStack } : {}),
  '--dps': String(scale),
  letterSpacing: '-0.01em',
  WebkitFontSmoothing: 'antialiased',
} as unknown as CSSProperties)

/** 小横条本体：矮条卡片，随主题（颜色走 --dpl-*，几何走内联）。 */
const barStyle = (scale: number): CSSProperties => ({
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  gap: `calc(8px * var(--dps))`,
  width: '100%',
  minWidth: 0,
  height: `calc(38px * var(--dps))`,
  padding: `0 calc(12px * var(--dps))`,
  borderRadius: `calc(10px * var(--dps))`,
  border: '1px solid var(--dpl-panel-border)',
  background: 'var(--dpl-panel-bg)',
  color: 'var(--dpl-fg)',
  boxShadow: 'var(--dpl-shell-shadow)',
  fontSize: `calc(12.5px * var(--dps))`,
  lineHeight: `calc(20px * var(--dps))`,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'box-shadow .18s ease, transform .18s ease',
})

/** 收起态（56px rail）：正方形图标钮。 */
const railStyle: CSSProperties = {
  position: 'relative',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  borderRadius: 10,
  border: '1px solid var(--dpl-panel-border)',
  background: 'var(--dpl-panel-bg)',
  color: 'var(--dpl-fg)',
  boxShadow: 'var(--dpl-shell-shadow)',
  cursor: 'pointer',
}

/** 条上未读数小徽标。 */
const countBadgeStyle: CSSProperties = {
  flex: 'none',
  minWidth: 20,
  height: 20,
  padding: '0 6px',
  boxSizing: 'border-box',
  borderRadius: 10,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--dpl-fg)',
  color: 'var(--dpl-panel-bg)',
  fontSize: 11,
  fontWeight: 600,
  lineHeight: '20px',
  fontVariantNumeric: 'tabular-nums',
}

/** rail 钮角标（右上展示总数）。 */
const railBadgeStyle: CSSProperties = {
  position: 'absolute',
  top: -6,
  right: -6,
  minWidth: 18,
  height: 18,
  padding: '0 5px',
  boxSizing: 'border-box',
  borderRadius: 9,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--dpl-fg)',
  color: 'var(--dpl-panel-bg)',
  fontSize: 10,
  fontWeight: 600,
  lineHeight: '18px',
  fontVariantNumeric: 'tabular-nums',
}

const barLabelStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  color: 'var(--dpl-fg-dim)',
}

/** 弹窗：fixed 定位（portal 到 body，不受侧边栏 overflow 裁剪）。 */
const popStyle = (anchor: { left: number; bottom: number } | null): CSSProperties => {
  const width = Math.min(POP_W, Math.max(240, window.innerWidth - 16))
  const left = anchor === null ? 8 : Math.max(8, Math.min(anchor.left, window.innerWidth - width - 8))
  return {
    position: 'fixed',
    left,
    bottom: anchor === null ? 60 : anchor.bottom,
    width,
    maxHeight: 'min(60vh, 480px)',
    overflowY: 'auto',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '12px 12px 10px',
    borderRadius: 16,
    border: '1px solid var(--dpl-panel-border)',
    background: 'var(--dpl-panel-bg)',
    color: 'var(--dpl-fg)',
    boxShadow: 'var(--dpl-panel-shadow)',
    zIndex: 9500,
    animation: 'dpRowIn .22s cubic-bezier(.32,.72,0,1) backwards',
  }
}

const popHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '2px 4px 8px',
}

const popBarStyle: CSSProperties = {
  flex: 'none',
  width: 3,
  height: 14,
  borderRadius: 1.5,
  background: 'var(--dpl-fg-dim)',
}

const popTitleStyle: CSSProperties = {
  flex: 'none',
  fontSize: 15,
  fontWeight: 600,
  lineHeight: '22px',
  color: 'var(--dpl-fg)',
}

const popMetaStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  textAlign: 'right',
  fontSize: 12,
  lineHeight: '18px',
  color: 'var(--dpl-fg-dim)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

const popLinkStyle: CSSProperties = {
  flex: 'none',
  border: 'none',
  background: 'transparent',
  padding: 0,
  fontSize: 12,
  lineHeight: '18px',
  color: 'var(--dpl-fg)',
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
  textDecorationColor: 'var(--dpl-fg-weak)',
  cursor: 'pointer',
}

const sectionLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 4px 2px',
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '18px',
  color: 'var(--dpl-fg-dim)',
}

const sectionDotStyle: CSSProperties = {
  flex: 'none',
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: 'var(--dpl-fg-dim)',
}

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  width: '100%',
  boxSizing: 'border-box',
  padding: '8px 10px',
  borderRadius: 8,
  border: 'none',
  background: 'var(--dpl-row-bg)',
  color: 'var(--dpl-fg)',
  fontSize: 13,
  lineHeight: '20px',
  textAlign: 'left',
  cursor: 'pointer',
}

const rowTitleStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

const rowTimeStyle: CSSProperties = {
  flex: 'none',
  fontSize: 11,
  color: 'var(--dpl-fg-weak)',
  fontVariantNumeric: 'tabular-nums',
}

/** 回合小标签：发丝描边圆角胶囊，放在行右侧（时间已升级为组头）。 */
const turnTagStyle: CSSProperties = {
  flex: 'none',
  padding: '1px 7px',
  borderRadius: 999,
  border: '1px solid var(--dpl-panel-border)',
  color: 'var(--dpl-fg-dim)',
  fontSize: 11,
  lineHeight: '16px',
  whiteSpace: 'nowrap',
  fontVariantNumeric: 'tabular-nums',
}

/** 时间组头（一级菜单）：分钟时间靠左，同分钟多条消息归此组。 */
const groupHeadStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 4px 3px',
  fontSize: 11,
  fontWeight: 600,
  lineHeight: '16px',
  color: 'var(--dpl-fg-dim)',
  fontVariantNumeric: 'tabular-nums',
}

/** 组头里的条数（仅同组多条时出现）。 */
const groupCountStyle: CSSProperties = {
  fontWeight: 400,
  color: 'var(--dpl-fg-weak)',
}

const unreadDotStyle: CSSProperties = {
  flex: 'none',
  width: 7,
  height: 7,
  borderRadius: '50%',
  background: 'var(--dpl-fg)',
}

const dismissStyle: CSSProperties = {
  flex: 'none',
  width: 22,
  height: 22,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: 'var(--dpl-fg-weak)',
  fontSize: 12,
  lineHeight: '22px',
  cursor: 'pointer',
}

const emptyStyle: CSSProperties = {
  padding: '16px 8px',
  textAlign: 'center',
  fontSize: 12,
  lineHeight: '20px',
  color: 'var(--dpl-fg-weak)',
}

/** 运行中转圈弧线（复用胶囊的 .dp-run-spin 动画，颜色随主题）。 */
function RunOrb(): JSX.Element {
  return (
    <span className="dp-run-orb" style={{ flex: 'none' }} aria-hidden>
      <span className="dp-run-spin" />
    </span>
  )
}

/** 空闲灯泡线稿（与悬浮胶囊同款极简风）。 */
function BulbIcon(): JSX.Element {
  return (
    <svg
      width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flex: 'none' }}
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <line x1="9.5" y1="17" x2="14.5" y2="17" />
      <line x1="10.5" y1="20" x2="13.5" y2="20" />
    </svg>
  )
}

function ChevronIcon(): JSX.Element {
  return (
    <svg
      width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ flex: 'none' }}
    >
      <path d="m9 5 7 7-7 7" />
    </svg>
  )
}

// ---- 组件 ----

/**
 * 左下角小横条卡片。wide=false（56px rail）时退化为 36px 图标钮，
 * 弹窗逻辑不变。
 */
export function SidebarBarCard(props: SidebarBarCardProps): JSX.Element | null {
  const wide = props.wide !== false
  const [mode, setMode] = useState(modeStore.get())
  const [enabled, setEnabled] = useState(enabledStore.get())
  const [appearance, setAppearance] = useState<AppearanceConfig>(() => appearanceStore.get())
  const [entries, setEntries] = useState<DoneEntry[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(() => loadReadIds())
  const [runInfo, setRunInfo] = useState<Record<string, { since: number; question: string; title: string }>>({})
  const [open, setOpen] = useState(false)
  const [nowTick, setNowTick] = useState(() => Date.now())
  // 弹窗定位锚点：卡片矩形（视口坐标），portal 用 fixed 定位。
  const [anchor, setAnchor] = useState<{ left: number; bottom: number } | null>(null)
  const cardRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const sinceRef = useRef(0)

  useEffect(() => modeStore.subscribe(setMode), [])
  useEffect(() => enabledStore.subscribe(setEnabled), [])
  useEffect(() => appearanceStore.subscribe(setAppearance), [])

  const active = enabled && mode === 'card'

  // 轮询 host：与悬浮胶囊同一路由、同一数据口径。非卡片形态时暂停请求。
  useEffect(() => {
    if (!active) return
    let stopped = false
    const merge = (incoming: DoneEntry[]): void => {
      if (incoming.length === 0) return
      setEntries(prev => {
        const seen = new Set(prev.map(item => item.id))
        const merged = [...prev]
        for (const item of incoming) {
          if (seen.has(item.id)) continue
          seen.add(item.id)
          merged.push(item)
        }
        merged.sort((a, b) => b.seq - a.seq)
        return merged.length > MAX_ENTRIES ? merged.slice(0, MAX_ENTRIES) : merged
      })
    }
    const tick = (): void => {
      if (document.hidden) return
      fetch(`/api/dsh-done-pill?since=${sinceRef.current}`, { cache: 'no-store' })
        .then(async (res) => {
          if (!res.ok) throw new Error(`http ${res.status}`)
          return res.json() as Promise<{ ok: boolean; version: number; items: DoneEntry[]; running?: Array<{ sessionId: string; since: number; question?: string; title?: string }> }>
        })
        .then((data) => {
          if (stopped || data?.ok !== true || !Array.isArray(data.items)) return
          sinceRef.current = Math.max(sinceRef.current, typeof data.version === 'number' ? data.version : 0)
          merge(data.items.filter(item => item !== null && typeof item === 'object' && typeof item.id === 'string'))
          if (Array.isArray(data.running)) {
            const next: Record<string, { since: number; question: string; title: string }> = {}
            for (const entry of data.running) {
              if (entry !== null && typeof entry === 'object'
                && typeof entry.sessionId === 'string' && typeof entry.since === 'number') {
                next[entry.sessionId] = {
                  since: entry.since,
                  question: typeof entry.question === 'string' ? entry.question : '',
                  title: typeof entry.title === 'string' ? entry.title : '',
                }
              }
            }
            setRunInfo(next)
          }
        })
        .catch(() => { /* 服务暂不可达时静默，下轮重试 */ })
    }
    // 切到卡片形态时重读已读态（与悬浮胶囊同键共享，另一形态的标记即时延续）。
    setReadIds(loadReadIds())
    tick()
    const timer = window.setInterval(tick, POLL_MS)
    const onVisibility = (): void => { if (!document.hidden) tick() }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stopped = true
      window.clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [active])

  const runningSessions = Object.entries(runInfo)
    .map(([sessionId, info]) => ({
      id: sessionId,
      displayTitle: info.title,
      question: info.question,
      since: info.since,
    }))
    .sort((a, b) => b.since - a.since)

  const unreadCount = entries.filter(item => !readIds.has(item.id)).length
  const latest = entries[0]
  const latestLabel = latest !== undefined
    ? (latest.question !== '' ? latest.question : latest.title)
    : ''

  // 实时时钟：弹窗展开且有进行中任务时每秒走字。
  useEffect(() => {
    if (!open || runningSessions.length === 0) return
    setNowTick(Date.now())
    const timer = window.setInterval(() => { setNowTick(Date.now()) }, 1000)
    return () => { window.clearInterval(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, runningSessions.length])

  const markAllRead = useCallback((): void => {
    setReadIds(prev => {
      const next = new Set(prev)
      for (const item of entries) next.add(item.id)
      saveReadIds(next)
      return next.size === prev.size ? prev : next
    })
  }, [entries])

  // 已读时机 = 弹窗**关闭**时（看过即已读，与悬浮胶囊一致）。
  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (open) { wasOpenRef.current = true; return }
    if (wasOpenRef.current) {
      wasOpenRef.current = false
      markAllRead()
    }
  }, [open, markAllRead])

  const dismiss = useCallback((id: string): void => {
    setEntries(prev => prev.filter(item => item.id !== id))
    setReadIds(prev => {
      const next = new Set(prev)
      next.add(id)
      saveReadIds(next)
      return next
    })
  }, [])

  const openSession = useCallback((sessionId: string, markReadId?: string): void => {
    openSessionById(sessionId)
    if (markReadId !== undefined) {
      setReadIds(prev => {
        if (prev.has(markReadId)) return prev
        const next = new Set(prev)
        next.add(markReadId)
        saveReadIds(next)
        return next
      })
    }
    setOpen(false)
  }, [])

  // ---- 弹窗开合（含 hover 桥接）----

  const clearCloseTimer = useCallback((): void => {
    if (closeTimer.current !== null) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }, [])

  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current)
  }, [])

  const measureAnchor = useCallback((): void => {
    const el = cardRef.current
    if (el === null) return
    const rect = el.getBoundingClientRect()
    setAnchor({
      left: Math.round(rect.left),
      bottom: Math.round(Math.max(8, window.innerHeight - rect.top + 8)),
    })
  }, [])

  const showPop = useCallback((): void => {
    clearCloseTimer()
    measureAnchor()
    setOpen(true)
  }, [clearCloseTimer, measureAnchor])

  const scheduleHide = useCallback((): void => {
    clearCloseTimer()
    closeTimer.current = setTimeout(() => { setOpen(false) }, CLOSE_DELAY_MS)
  }, [clearCloseTimer])

  const togglePop = useCallback((): void => {
    clearCloseTimer()
    setOpen(prev => {
      if (!prev) measureAnchor()
      return !prev
    })
  }, [clearCloseTimer, measureAnchor])

  // 弹窗展开时窗口缩放跟随重定位。
  useEffect(() => {
    if (!open) return
    const onResize = (): void => { measureAnchor() }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize) }
  }, [open, measureAnchor])

  if (!active) return null

  // ---- 条文案：摘要一行 ----
  const firstRunning = runningSessions[0]
  const firstRunningLabel = firstRunning !== undefined
    ? (firstRunning.question !== '' ? firstRunning.question : firstRunning.displayTitle)
    : ''
  let barText = '暂无新动态'
  if (runningSessions.length > 0 && unreadCount > 0) {
    barText = `${runningSessions.length} 进行中 · ${unreadCount} 完成`
  } else if (runningSessions.length > 0) {
    barText = `${runningSessions.length} 进行中 · ${truncate(firstRunningLabel, 18)}`
  } else if (unreadCount > 0 && latest !== undefined) {
    barText = `${unreadCount} 完成 · ${truncate(latestLabel, 18)}`
  }
  const totalBadge = runningSessions.length + unreadCount
  const summaryLabel = runningSessions.length > 0 || unreadCount > 0
    ? `对话动态：${runningSessions.length} 个进行中，${unreadCount} 个已完成未读；${truncate(firstRunningLabel !== '' ? firstRunningLabel : latestLabel, 40)}`
    : '对话动态：暂无新动态；悬停或点按查看记录'

  const scale = appearance.scale
  const fontStack = fontStackOf(appearance.font)

  return (
    <div
      className="dsh-done-pill"
      data-dpp-card={wide ? 'wide' : 'rail'}
      style={wrapStyle(wide, fontStack, scale)}
      onMouseEnter={showPop}
      onMouseLeave={scheduleHide}
    >
      {wide ? (
        <button
          ref={cardRef}
          type="button"
          style={barStyle(scale)}
          className="dsh-done-pill-row"
          aria-label={summaryLabel}
          aria-expanded={open}
          title="悬停查看进行中与最近完成的对话"
          onClick={togglePop}
          onFocus={showPop}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
        >
          {runningSessions.length > 0 ? <RunOrb /> : <BulbIcon />}
          <span style={barLabelStyle}>{barText}</span>
          {unreadCount > 0 && <span style={countBadgeStyle}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
          <ChevronIcon />
        </button>
      ) : (
        <button
          ref={cardRef}
          type="button"
          style={railStyle}
          aria-label={summaryLabel}
          aria-expanded={open}
          title="对话动态：悬停查看进行中与最近完成"
          onClick={togglePop}
          onFocus={showPop}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
        >
          {runningSessions.length > 0 ? <RunOrb /> : <BulbIcon />}
          {totalBadge > 0 && <span style={railBadgeStyle}>{totalBadge > 99 ? '99+' : totalBadge}</span>}
        </button>
      )}
      {open && createPortal(
        <div
          ref={popRef}
          className="dsh-done-pill"
          style={popStyle(anchor)}
          role="dialog"
          aria-label="对话动态：进行中与最近完成"
          onMouseEnter={showPop}
          onMouseLeave={scheduleHide}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false)
          }}
        >
          <div style={popHeadStyle}>
            <span style={popBarStyle} aria-hidden />
            <span style={popTitleStyle}>对话动态</span>
            <span style={popMetaStyle}>{`${unreadCount} 未读 · ${runningSessions.length} 进行中`}</span>
            <button
              type="button"
              className="dsh-done-pill-link"
              style={{ ...popLinkStyle, opacity: latest === undefined ? 0.45 : 1 }}
              disabled={latest === undefined}
              onClick={() => { if (latest !== undefined) openSession(latest.sessionId) }}
            >
              进入最新会话
            </button>
          </div>
          {runningSessions.length > 0 && (
            <>
              <div style={sectionLabelStyle}><span style={sectionDotStyle} aria-hidden />{`进行中 ${runningSessions.length}`}</div>
              {runningSessions.slice(0, POP_RUNNING_N).map((session) => {
                const label = session.question !== '' ? session.question : session.displayTitle
                return (
                  <button
                    key={session.id}
                    type="button"
                    className="dsh-done-pill-row"
                    style={rowStyle}
                    title={`「${session.displayTitle}」正在执行 — 点击打开会话`}
                    onClick={() => { openSession(session.id) }}
                  >
                    <RunOrb />
                    <span style={rowTitleStyle}>{label}</span>
                    <span style={rowTimeStyle}>{formatElapsed(nowTick - session.since)}</span>
                  </button>
                )
              })}
            </>
          )}
          <div style={sectionLabelStyle}><span style={sectionDotStyle} aria-hidden />{`最近完成${entries.length > 0 ? ` ${entries.length}` : ''}`}</div>
          {entries.length === 0 ? (
            <div style={emptyStyle}>暂无记录 — 任一会话的对话完成后会出现在这里</div>
          ) : (
            groupByMinute(entries.slice(0, POP_RECENT_N)).map((group) => (
              <div key={`${group.time}|${group.items[0].id}`}>
                <div style={groupHeadStyle}>
                  <span>{group.time === '' ? '未知时间' : group.time}</span>
                  {group.items.length > 1 && <span style={groupCountStyle}>{`${group.items.length} 条`}</span>}
                </div>
                {group.items.map((item) => {
                  const headLabel = item.question !== '' ? item.question : item.title
                  const unread = !readIds.has(item.id)
                  return (
                    <div
                      key={item.id}
                      className="dsh-done-pill-row"
                      style={{ ...rowStyle, cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      title={`「${item.title}」 — 点击打开会话`}
                      onClick={() => { openSession(item.sessionId, item.id) }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          openSession(item.sessionId, item.id)
                        }
                      }}
                    >
                      {unread && <span style={unreadDotStyle} aria-hidden />}
                      <span style={rowTitleStyle}>{headLabel}</span>
                      {item.reasonKind === 'error' && (
                        <span style={{ flex: 'none', fontSize: 12, color: 'var(--dpl-warn)' }}>出错</span>
                      )}
                      <span style={turnTagStyle}>{`回合 ${item.turn >= 0 ? item.turn + 1 : '?'}`}</span>
                      <button
                        type="button"
                        className="dsh-done-pill-close"
                        style={dismissStyle}
                        aria-label="移除这条记录（不跳转会话）"
                        onClick={(event) => { event.stopPropagation(); dismiss(item.id) }}
                      >
                        ✕
                      </button>
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>,
        document.body,
      )}
    </div>
  )
}
