/**
 * Sessions view with tabs, sorting, and live dot indicators.
 */
import { state, runtime } from '../../state/state.js'
import { el, workspaceTitle } from '../../utils/dom.js'
import { onListScroll } from '../../utils/scroll.js'
import { sessionTitle } from '../../chat/fold.js'
import { commitLocation, persistRoute } from '../../state/route.js'
import { renderQuotaBar } from '../../net/quota.js'
import { headerIcon, headerActions, globalSettingsButton } from '../theme.js'
import { stopMuxObservation } from '../../net/mux.js'
import { render } from './render.js'
import { showWorkspaces, openWorkspace } from './ws-view.js'
import { sessionRow } from './session-row.js'
import { createSession, createSessionInWorkspace, createTodaySession, renderPresetSelector } from './session-create.js'
import { openWorkspacePickerSheet } from '../sheets.js'
import {
  findWorkspaceForSession,
  switchListMode,
  ownedSessionIds,
  collectOwnedPages,
  loadSessions,
  startListPoll,
  stopListPoll,
  refreshLiveSnapshot,
} from './session-list-data.js'

export {
  findWorkspaceForSession,
  switchListMode,
  ownedSessionIds,
  loadSessions,
  startListPoll,
  stopListPoll,
  refreshLiveSnapshot,
  createSession,
  createSessionInWorkspace,
  createTodaySession,
}

export async function loadMoreSessions() {
  if (!state.cursor || state.loadingMore) return
  const q = runtime.sessionsQuery
  const workspaceId = state.workspace && state.workspace.workspaceId
  state.loadingMore = true
  if (state.view === 'sessions') render()
  try {
    const page = await collectOwnedPages(
      workspaceId,
      ownedSessionIds(state.workspace),
      state.cursor,
      [],
      Date.now(),
    )
    if (q !== runtime.sessionsQuery) return
    const seen = new Set(state.sessions.map((s) => s.sessionId))
    state.sessions = state.sessions.concat(page.items.filter((s) => !seen.has(s.sessionId)))
    state.cursor = page.nextCursor
    state.hasMoreSessions = page.hasMore
  } catch (err) {
    if (q !== runtime.sessionsQuery) return
    state.error = String(err.message || err)
  } finally {
    if (q === runtime.sessionsQuery) {
      state.loadingMore = false
      if (state.view === 'sessions') render()
    }
  }
}

export function showSessionsFromChat(ws, locationMode) {
  runtime.chatQuery += 1
  stopMuxObservation()
  state.workspace = ws
  state.session = null
  state.view = 'sessions'
  state.loading = false
  const loc = { view: 'sessions', workspaceId: ws.workspaceId }
  if (locationMode !== 'none') commitLocation(loc, locationMode)
  else persistRoute(loc)
  render()
  void loadSessions()
}

export function showRecentSessionsFromChat(locationMode) {
  runtime.chatQuery += 1
  stopMuxObservation()
  state.workspace = null
  state.session = null
  state.view = 'sessions'
  state.loading = false
  const loc = { view: 'sessions' }
  if (locationMode !== 'none') commitLocation(loc, locationMode)
  else persistRoute(loc)
  render()
  void loadSessions()
}

export async function openRecentSessions(opts = {}) {
  runtime.chatQuery += 1
  stopMuxObservation()
  state.workspace = null
  state.view = 'sessions'
  state.session = null
  state.sessions = []
  state.cursor = undefined
  state.hasMoreSessions = false
  state.createError = ''
  state.loading = true
  runtime.listScroll.top = 0
  const mode = opts.locationMode || 'push'
  if (mode !== 'none') commitLocation({ view: 'sessions' }, mode)
  else persistRoute({ view: 'sessions' })
  render()
  await loadSessions()
}

export function getSortedSessions() {
  const items = state.sessions.slice()
  if (state.sortMode === 'recent') {
    items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  } else if (state.sortMode === 'manual' && state.workspace) {
    const orderMap = new Map((state.workspace.sessionIds || []).map((id, idx) => [id, idx]))
    items.sort((a, b) => (orderMap.get(a.sessionId) ?? 9999) - (orderMap.get(b.sessionId) ?? 9999))
  }
  return items
}

export function visibleSessions() {
  const q = (state.sessionQuery || '').trim().toLowerCase()
  const sorted = getSortedSessions()
  if (!q) return sorted
  return sorted.filter((s) => {
    const title = (s.blank ? '新会话' : sessionTitle(s)).toLowerCase()
    const ws = findWorkspaceForSession(s.sessionId) || state.workspace
    const wsName = ws ? workspaceTitle(ws).toLowerCase() : ''
    return title.includes(q) || wsName.includes(q)
  })
}

export function renderHeaderTabs() {
  return el('div', { class: 'mobile-header-left' }, [
    el('div', { class: 'mobile-tabs' }, [
      el('button', {
        type: 'button',
        class: state.listMode === 'workspace' ? 'mobile-tab mobile-tabActive' : 'mobile-tab',
        onclick: () => switchListMode('workspace'),
      }, ['工作区']),
      el('button', {
        type: 'button',
        class: state.listMode === 'flat' ? 'mobile-tab mobile-tabActive' : 'mobile-tab',
        onclick: () => switchListMode('flat'),
      }, ['最近会话']),
    ]),
    el('button', {
      type: 'button',
      class: 'mobile-sort-toggle-btn',
      title: state.sortMode === 'recent' ? '当前：按最近活跃时间排序（点击切换为手动排序）' : '当前：按 Web 端自定义顺序排序（点击切换为最近更新）',
      'aria-label': state.sortMode === 'recent' ? '排序：最近更新' : '排序：手动排序',
      onclick: () => {
        state.sortMode = state.sortMode === 'recent' ? 'manual' : 'recent'
        try { localStorage.setItem('dsh-mp-sort-mode', state.sortMode) } catch {}
        render()
      },
    }, [
      headerIcon('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>'),
      el('span', { class: 'mobile-sort-toggle-label' }, [state.sortMode === 'recent' ? '最新' : '手动']),
    ]),
  ])
}

export function renderSessions() {
  const isSingleWs = Boolean(state.workspace)
  const page = el('div', { class: 'mobile' }, [
    isSingleWs
      ? el('header', { class: 'mobile-header' }, [
        el('button', {
          type: 'button',
          class: 'mobile-back',
          'aria-label': '返回',
          onclick: () => {
            if (state.listMode === 'flat') {
              void openRecentSessions({ locationMode: 'push' })
            } else {
              showWorkspaces('push')
            }
          },
        }, ['‹']),
        el('h1', { class: 'mobile-title mobile-titleInline' }, [workspaceTitle(state.workspace)]),
        headerActions([
          renderQuotaBar(),
          globalSettingsButton(),
        ]),
      ])
      : el('header', { class: 'mobile-header' }, [
        el('div', { class: 'mp-hero' }, [
          el('span', { class: 'mp-hero-eyebrow' }, ['移动工作台']),
          el('div', { class: 'mp-hero-row' }, [
            el('h1', { class: 'mp-hero-title' }, ['继续对话']),
            el('button', {
              type: 'button',
              class: 'mp-hero-new',
              disabled: state.creating,
              onclick: () => void createTodaySession(),
            }, ['+ 新会话']),
          ]),
          el('div', { class: 'mp-hero-tools' }, [
            renderHeaderTabs(),
            renderQuotaBar(),
            globalSettingsButton(),
          ]),
        ]),
      ]),
  ])

  if (state.loading && state.sessions.length === 0 && !state.error) {
    page.append(el('div', { class: 'mobile-empty' }, [el('p', { class: 'mobile-muted' }, ['加载中…'])]))
    return page
  }

  if (isSingleWs) {
    const presetKids = renderPresetSelector(render)
    page.append(el('div', { class: 'mobile-create mobile-pad' }, [
      ...presetKids,
      el('button', { type: 'button', class: 'mobile-new', disabled: state.creating, onclick: () => void createSession() }, [state.creating ? '创建中…' : '+ 新建会话']),
    ]))
    if (state.createError) page.append(el('p', { class: 'mobile-error mobile-pad' }, [state.createError]))
  }

  let search = null
  let section = null
  let countBadge = null
  if (!isSingleWs) {
    search = el('input', {
      class: 'mobile-wsSearch',
      type: 'search',
      placeholder: '搜索会话或所属工作区…',
      value: state.sessionQuery || '',
      autocomplete: 'off',
      autocapitalize: 'off',
      autocorrect: 'off',
      spellcheck: 'false',
      enterkeyhint: 'search',
      'aria-label': '搜索会话',
      oninput: (ev) => {
        state.sessionQuery = ev.target.value
        refreshSessionList()
      },
    })

    const wss = state.workspaces || []
    const wsSelect = el('select', {
      class: 'mp-ws-select',
      'aria-label': '当前工作区',
      onchange: (ev) => {
        const v = ev.target.value
        if (v === '__more') { ev.target.value = ''; openWorkspacePickerSheet(); return }
        if (v === '') { showWorkspaces('push'); return }
        const ws = wss.find((w) => w.workspaceId === v)
        if (ws) void openWorkspace(ws, { locationMode: 'push' })
      },
    }, [
      el('option', { value: '' }, [wss.length ? '选择工作区…' : '暂无工作区']),
      ...wss.map((w) => el('option', { value: w.workspaceId }, [workspaceTitle(w)])),
      el('option', { value: '__more' }, ['选其他工作区新建…']),
    ])
    const wsRefresh = el('button', {
      type: 'button',
      class: 'mp-ws-refresh',
      'aria-label': '刷新会话列表',
      onclick: (ev) => {
        const btn = ev.currentTarget
        btn.classList.add('is-spinning')
        Promise.resolve(loadSessions()).finally(() => {
          setTimeout(() => btn.classList.remove('is-spinning'), 400)
        })
      },
    }, [
      headerIcon('<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><polyline points="21 3 21 9 15 9"/></svg>'),
    ])
    page.append(el('div', { class: 'mp-ws-card' }, [
      el('span', { class: 'mp-ws-label' }, ['当前工作区']),
      el('div', { class: 'mp-ws-row' }, [wsSelect, wsRefresh]),
    ]))
    countBadge = el('span', { class: 'mp-count-badge' }, ['0'])
    section = el('div', { class: 'mp-section' }, [
      el('span', {}, ['最近会话']),
      countBadge,
    ])
    if (state.createError) page.append(el('p', { class: 'mobile-error mobile-pad' }, [state.createError]))
  }

  const list = el('ul', { class: 'mobile-list', onscroll: onListScroll })
  const empty = el('p', { class: 'mobile-muted mobile-wsSearchEmpty', hidden: true }, [''])

  const refreshSessionList = () => {
    const q = (state.sessionQuery || '').trim()
    const visible = visibleSessions()
    list.replaceChildren(...visible.map((s) => sessionRow(s, isSingleWs)))
    if (countBadge) countBadge.textContent = String(visible.length)
    if (visible.length === 0 && !state.loading) {
      empty.textContent = q ? `没有匹配「${q}」的会话` : (isSingleWs ? '该工作区还没有会话，点上方按钮新建一个' : '暂无最近会话')
      empty.hidden = false
    } else {
      empty.hidden = true
    }
  }

  refreshSessionList()

  if (section) page.append(section)
  if (search) page.append(search)
  page.append(list, empty)

  if (state.hasMoreSessions && !state.sessionQuery.trim()) {
    page.append(el('div', { class: 'mobile-pad' }, [
      el('button', { type: 'button', class: 'mobile-button mobile-block', disabled: state.loadingMore, onclick: () => void loadMoreSessions() }, [state.loadingMore ? '加载中…' : '加载更多会话']),
    ]))
  }
  return page
}
