/**
 * 侧边栏抽屉导航（Drawer）与 Toast 工具。
 * 对齐移动端最新 UI 设计：云端切换、新建任务胶囊、会话卡片列表（含标题与时间）、底部单一设置入口。
 */
import { state } from '../state/state.js'
import { el, workspaceTitle } from '../utils/dom.js'
import { formatTime } from '../utils/time.js'
import { sessionTitle } from '../chat/fold.js'
import { call } from '../net/rpc.js'
import { openChat } from './views/chat-view.js'
import { createTodaySession } from './views/session-create.js'
import { openWorkspacePickerSheet, switchSheet } from './sheets.js'

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
    const newTaskBtn = drawerEl.querySelector('.mp-drawer-new-task-btn')
    if (newTaskBtn) newTaskBtn.disabled = Boolean(state.creating)
    syncDrawerList()
  }
  void loadDrawerSessions()
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

export async function loadDrawerSessions() {
  try {
    // 1. 确保有工作区数据
    if (!state.workspaces || state.workspaces.length === 0) {
      const wss = await call('workspace.list', {})
      state.workspaces = wss.items || []
    }
    if (!state.workspace && state.workspaces.length > 0) {
      if (state.session?.sessionId) {
        state.workspace = state.workspaces.find(w => w.sessionIds?.includes(state.session.sessionId)) || state.workspaces[0]
      } else {
        state.workspace = state.workspaces[0]
      }
    }

    // 2. 拉取所有会话（优先展示当前工作区，如无工作区则展示全部）
    const res = await call('session.list', {
      ...(state.workspace?.workspaceId ? { workspaceId: state.workspace.workspaceId } : {}),
    })
    if (res && Array.isArray(res.items)) {
      state.sessions = res.items
    }
  } catch (err) {
    console.error('[Drawer Session Load Error]', err)
  } finally {
    syncDrawerList()
  }
}

export function syncDrawerList() {
  if (!drawerEl) return
  const list = drawerEl.querySelector('.mp-drawer-list')
  if (!list) return

  const currentSid = state.session?.sessionId
  const sessions = state.sessions || []

  if (sessions.length === 0) {
    list.replaceChildren(
      el('div', {
        class: 'mp-drawer-empty',
        style: 'padding: 24px 12px; text-align: center; color: #6b7280; font-size: 13px;',
      }, ['暂无历史会话'])
    )
  } else {
    list.replaceChildren(
      ...sessions.map((s) => {
        const isActive = s.sessionId === currentSid
        const title = s.blank ? '新会话' : sessionTitle(s)
        const timeStr = formatTime(s.updatedAt || s.createdAt)

        return el('button', {
          type: 'button',
          class: `mp-drawer-item${isActive ? ' is-active' : ''}`,
          title,
          onclick: () => {
            closeDrawer()
            if (!isActive) void openChat(s, { locationMode: 'push' })
          },
        }, [
          el('span', { class: 'mp-drawer-item-title' }, [title]),
          timeStr ? el('span', { class: 'mp-drawer-item-time' }, [timeStr]) : null,
        ].filter(Boolean))
      })
    )
  }

  // 同步工作区名与新建按钮状态
  const wsBtnText = drawerEl.querySelector('.mp-drawer-ws-name')
  if (wsBtnText) {
    wsBtnText.textContent = state.workspace ? workspaceTitle(state.workspace) : '云端'
  }
  const newTaskBtn = drawerEl.querySelector('.mp-drawer-new-task-btn')
  if (newTaskBtn) {
    newTaskBtn.disabled = Boolean(state.creating)
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

    // 侧边栏底部：单一干净的设置按钮（无头像与其他元素）
    const bottomSettings = el('div', { class: 'mp-drawer-bottom' }, [
      el('button', {
        type: 'button',
        class: 'mp-drawer-settings-btn',
        onclick: () => {
          closeDrawer()
          switchSheet('settings')
        },
      }, [
        el('span', {
          class: 'mp-settings-icon',
          html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
        }),
        el('span', { class: 'mp-settings-text' }, ['设置']),
      ]),
    ])

    drawerEl = el('aside', {
      class: `mp-drawer${state.drawerOpen ? ' is-open' : ''}`,
    }, [
      topSection,
      groupHead,
      list,
      bottomSettings,
    ])

    document.body.append(drawerEl)
  }

  syncDrawerList()
  return drawerEl
}
