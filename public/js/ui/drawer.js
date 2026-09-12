/**
 * 侧边栏抽屉导航（Drawer）与 Toast 工具。
 * 对齐移动端最新 UI 设计：云端切换、新建任务胶囊、会话卡片列表、底部用户资料卡。
 */
import { state, runtime, quota } from '../state/state.js'
import { el, workspaceTitle } from '../utils/dom.js'
import { sessionTitle } from '../chat/fold.js'
import { openChat } from './views/chat-view.js'
import { createTodaySession } from './views/session-create.js'
import { openWorkspacePickerSheet, switchSheet } from './sheets.js'
import { loadSessions } from './views/session-list-data.js'

let drawerEl = null
let backdropEl = null
let toastEl = null
let toastTimer = null

export function showToast(msg) {
  if (!toastEl) {
    toastEl = el('div', { class: 'mp-toast' })
    document.body.append(toastEl)
  }
  toastEl.textContent = msg
  toastEl.classList.add('is-show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    if (toastEl) toastEl.classList.remove('is-show')
  }, 1500)
}

export function openDrawer() {
  state.drawerOpen = true
  if (backdropEl) backdropEl.classList.add('is-open')
  if (drawerEl) {
    drawerEl.classList.add('is-open')
    syncDrawerList()
  }
}

export function closeDrawer() {
  state.drawerOpen = false
  if (backdropEl) backdropEl.classList.remove('is-open')
  if (drawerEl) drawerEl.classList.remove('is-open')
}

export function toggleDrawer() {
  if (state.drawerOpen) closeDrawer()
  else openDrawer()
}

function syncDrawerList() {
  if (!drawerEl) return
  const list = drawerEl.querySelector('.mp-drawer-list')
  if (!list) return

  const currentSid = state.session?.sessionId
  const sessions = state.sessions || []
  
  if (sessions.length === 0) {
    void loadSessions().then(() => {
      if (drawerEl) syncDrawerList()
    })
  }

  list.replaceChildren(
    ...sessions.map((s) => {
      const isActive = s.sessionId === currentSid
      const title = s.blank ? '新会话' : sessionTitle(s)
      return el('button', {
        type: 'button',
        class: `mp-drawer-item${isActive ? ' is-active' : ''}`,
        title,
        onclick: () => {
          closeDrawer()
          if (!isActive) void openChat(s, { locationMode: 'push' })
        },
      }, [title])
    })
  )

  // 同步工作区名与额度
  const wsBtnText = drawerEl.querySelector('.mp-drawer-ws-name')
  if (wsBtnText) {
    wsBtnText.textContent = state.workspace ? workspaceTitle(state.workspace) : '云端'
  }
  const quotaNum = drawerEl.querySelector('.mp-quota-val')
  if (quotaNum) {
    const pts = quota.deepseek?.limit != null ? Math.round(quota.deepseek.limit) : '500'
    quotaNum.textContent = String(pts)
  }
}

export function ensureDrawer() {
  if (!backdropEl) {
    backdropEl = el('div', {
      class: `mp-drawer-backdrop${state.drawerOpen ? ' is-open' : ''}`,
      onclick: closeDrawer,
    })
    document.body.append(backdropEl)
  }

  if (!drawerEl) {
    const wsName = state.workspace ? workspaceTitle(state.workspace) : '云端'
    
    const wsBtn = el('button', {
      type: 'button',
      class: 'mp-drawer-ws-btn',
      'aria-label': '切换工作区',
      onclick: () => {
        closeDrawer()
        openWorkspacePickerSheet()
      },
    }, [
      el('span', {
        html: '<svg class="ws-cloud-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>',
      }),
      el('span', { class: 'mp-drawer-ws-name' }, [wsName]),
      el('span', {
        html: '<svg class="ws-chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
      }),
    ])

    const newTaskBtn = el('button', {
      type: 'button',
      class: 'mp-drawer-new-task-btn',
      disabled: state.creating,
      onclick: () => {
        closeDrawer()
        void createTodaySession()
      },
    }, [
      el('span', {
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>',
      }),
      '新建任务',
    ])

    const topSection = el('div', { class: 'mp-drawer-top' }, [wsBtn, newTaskBtn])

    const groupHead = el('div', { class: 'mp-drawer-group-head' }, [
      el('span', {}, ['更早']),
      el('span', {
        class: 'mp-drawer-group-icon',
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
      }),
    ])

    const list = el('div', { class: 'mp-drawer-list' })

    const profile = el('div', {
      class: 'mp-drawer-profile',
      onclick: () => {
        closeDrawer()
        switchSheet('settings')
      },
    }, [
      el('div', { class: 'mp-drawer-avatar' }, ['静']),
      el('div', { class: 'mp-drawer-user-meta' }, [
        el('div', { class: 'mp-drawer-username' }, ['静']),
        el('div', { class: 'mp-drawer-quota-tag' }, [
          '体验版',
          el('span', { class: 'sep' }, ['|']),
          '✧ ',
          el('span', { class: 'mp-quota-val' }, ['500']),
        ]),
      ]),
    ])

    drawerEl = el('aside', {
      class: `mp-drawer${state.drawerOpen ? ' is-open' : ''}`,
    }, [
      topSection,
      groupHead,
      list,
      profile,
    ])

    document.body.append(drawerEl)
  }

  syncDrawerList()
  return drawerEl
}
