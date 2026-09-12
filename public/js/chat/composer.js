/**
 * Chat composer input bar, IME handling, and keydown listeners.
 */
import { state, chat, runtime } from '../state/state.js'
import { el } from '../utils/dom.js'
import { send, stopTurn } from './outbox.js'
import { pickFromFiles } from './upload.js'
import { renderSlashMenu } from './slash.js'
import { render } from '../ui/views/render.js'
import { showToast } from '../ui/drawer.js'

export function contextUsage() {
    for (let i = chat.messages.length - 1; i >= 0; i -= 1) {
      const message = chat.messages[i]
      if (message.kind !== 'assistant' || !message.usage) continue
      const windowSize = message.contextWindow
      if (!windowSize || windowSize <= 0) continue
      const tokens = message.usage.inputTokens + (message.usage.cacheReadTokens || 0) + (message.usage.cacheWriteTokens || 0)
      return Math.round(tokens / windowSize * 100)
    }
    return undefined
  }

export function autosizeInput(node) {
    if (!node || runtime.imeComposing) return
    node.style.height = 'auto'
    node.style.height = `${Math.min(node.scrollHeight, 120)}px`
  }

export function imeLocked(ev) {
    return runtime.imeComposing || Boolean(ev && (ev.isComposing || ev.keyCode === 229))
  }

export function flushComposerRender() {
    if (!runtime.composerRenderQueued) return
    runtime.composerRenderQueued = false
    if (state.view === 'chat') render()
  }

export function syncComposerDraft(node, next, force) {
    if (!node) return
    if (!force && runtime.imeComposing) return
    if (node.value === next) return
    node.value = next
  }

export function setDraft(next) {
    state.draft = next == null ? '' : String(next)
    syncComposerDraft(runtime.composerNode, state.draft, true)
    autosizeInput(runtime.composerNode)
  }

export function onComposerInput(ev) {
    const node = ev.target
    if (ev.isComposing || ev.inputType === 'insertCompositionText') runtime.imeComposing = true
    const prev = state.draft
    state.draft = node.value
    if (imeLocked(ev)) return
    autosizeInput(node)
    if (state.draft.startsWith('/') || prev.startsWith('/')) render()
  }

export function onComposerKeydown(ev) {
    if (composerReturnIsNewline()) return
    if (imeLocked(ev)) return
    if (ev.key === 'Enter' && !ev.shiftKey) {
      ev.preventDefault()
      void send()
    }
  }

let speechRec = null
let isRecording = false

export function toggleVoiceInput(btn) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) {
    showToast('当前浏览器不支持原生语音转写')
    return
  }
  if (isRecording) {
    if (speechRec) speechRec.stop()
    isRecording = false
    if (btn) btn.classList.remove('is-recording')
    showToast('语音识别结束')
    return
  }
  try {
    speechRec = new SR()
    speechRec.lang = 'zh-CN'
    speechRec.continuous = false
    speechRec.interimResults = true
    speechRec.onstart = () => {
      isRecording = true
      if (btn) btn.classList.add('is-recording')
      showToast('正在聆听，请说话…')
    }
    speechRec.onresult = (ev) => {
      let transcript = ''
      for (let i = ev.resultIndex; i < ev.results.length; ++i) {
        transcript += ev.results[i][0].transcript
      }
      if (transcript) {
        setDraft((state.draft ? state.draft + ' ' : '') + transcript)
      }
    }
    speechRec.onerror = () => {
      isRecording = false
      if (btn) btn.classList.remove('is-recording')
    }
    speechRec.onend = () => {
      isRecording = false
      if (btn) btn.classList.remove('is-recording')
    }
    speechRec.start()
  } catch (err) {
    showToast('麦克风启动失败')
  }
}

export function makeVoiceButton() {
  const btn = el('button', {
    type: 'button',
    class: 'mp-voice-btn',
    'aria-label': '语音输入',
    title: '语音输入',
    onclick: function() { toggleVoiceInput(this) },
  }, [
    el('span', {
      html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><path d="M10 7a7 7 0 0 1 0 10"/><path d="M15 4a12 12 0 0 1 0 16"/></svg>',
    }),
  ])
  return btn
}

export function ensureComposer() {
    if (runtime.composerNode) return runtime.composerNode
    runtime.composerNode = el('textarea', {
      class: 'chat-input',
      placeholder: '发消息或按住说话',
      rows: 1,
      enterkeyhint: composerReturnIsNewline() ? 'enter' : 'send',
      autocomplete: 'off',
      oninput: (ev) => {
        onComposerInput(ev)
        const bar = document.querySelector('.chat-inputbar')
        if (bar) syncInputbar(bar)
      },
      onkeydown: onComposerKeydown,
    })
    runtime.composerNode.value = state.draft
    return runtime.composerNode
  }

export function makeSendButton() {
    if (state.running) {
      return el('button', {
        type: 'button',
        class: 'mp-send-btn is-stop',
        'aria-label': '停止输出',
        title: '停止输出',
        onclick: () => void stopTurn(),
      }, [
        el('span', {
          html: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
        }),
      ])
    }
    const hasText = Boolean(state.draft && state.draft.trim().length > 0)
    if (!hasText) return null

    return el('button', {
      type: 'button',
      class: 'mp-send-btn',
      'aria-label': '发送',
      title: '发送',
      disabled: state.sending,
      onclick: () => void send(),
    }, [
      el('span', {
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
      }),
    ])
  }

export function makeAttachButton() {
    return el('button', {
      type: 'button',
      class: 'mp-attach-btn',
      'aria-label': '添加附件',
      title: '添加附件',
      disabled: state.sending,
      onclick: () => { pickFromFiles() },
    }, [
      el('span', {
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
      }),
    ])
  }

export function buildInputbar() {
    const pill = el('div', { class: 'mp-input-pill' }, [
      makeVoiceButton(),
      ensureComposer(),
      makeAttachButton(),
    ])
    const send = makeSendButton()
    if (send) pill.append(send)

    return el('div', { class: 'chat-inputbar' }, [pill])
  }

export function syncInputbar(bar) {
    if (!bar) return
    const pill = bar.querySelector('.mp-input-pill')
    if (!pill) return

    syncComposerDraft(ensureComposer(), state.draft, false)
    
    // 更新发送按钮状态
    const oldSend = pill.querySelector('.mp-send-btn')
    const newSend = makeSendButton()
    if (!newSend) {
      if (oldSend) oldSend.remove()
    } else if (!oldSend) {
      pill.append(newSend)
    } else if (oldSend.className !== newSend.className) {
      oldSend.replaceWith(newSend)
    }
  }

export function abandonComposerIme() {
    runtime.imeComposing = false
    runtime.composerRenderQueued = false
  }

export function composerReturnIsNewline() {
    const ua = navigator.userAgent || ''
    if (/iPhone|iPod|Android.+Mobile/i.test(ua)) return true
    if (/iPad/i.test(ua)) return true
    if (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1) return true
    try {
      if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return true
    } catch {
      /* ignore */
    }
    return false
  }

export function focusComposer() {
    const input = document.querySelector('.chat-input')
    if (input) input.focus({ preventScroll: true })
  }
