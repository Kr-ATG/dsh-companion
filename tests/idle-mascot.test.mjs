import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createDocument, descendants, SVG_NS } from '../scripts/helpers/dom-stub.mjs'

// The mascot is the vendored OpenBotMotion engine. It is a browser library that
// reads the globals `document` and `window` directly, so install stubs before
// importing anything that pulls it in.
const documentStub = createDocument()
globalThis.document = documentStub
globalThis.window = globalThis
globalThis.requestAnimationFrame = () => 1
globalThis.cancelAnimationFrame = () => {}

const { default: OpenBotMotion } = await import('../src/vendor/open-bot-motion.js')
const { poseFor } = await import('../src/vendor/idle-motions.js')

const HERE = dirname(fileURLToPath(import.meta.url))
const PILL = resolve(HERE, '..', 'src/client/pill.tsx')

/** Mount into a fresh container using the installed document stub. */
function mountRobot() {
  const container = documentStub.createElement('div')
  documentStub.body.appendChild(container)
  const robot = OpenBotMotion.mount(container, { bot: 1, size: 22, autoplay: false, loop: false })
  return { container, robot }
}

test('the bundled mascot engine exposes every bot the pill relies on', () => {
  assert.equal(typeof OpenBotMotion.mount, 'function')
  assert.equal(typeof OpenBotMotion.getBotState, 'function')
  assert.equal(OpenBotMotion.BOTS.length, 7)
})

test('all nine idle motions plus dance produce a finite pose', () => {
  const ids = ['blink', 'scan', 'tilt', 'nod', 'stretch', 'hop', 'balance', 'sneeze', 'sleep', 'dance']
  for (const id of ids) {
    for (const t of [0, 0.5, 1.7, 3.3, 6.9]) {
      const state = poseFor(id, t)
      assert.ok(state && state.bot, id + ' produced no bot state at t=' + String(t))
      const bot = state.bot
      for (const key of ['x', 'y', 'scale', 'scaleX', 'scaleY', 'yaw', 'pitch', 'roll', 'eyeShiftX', 'eyeShiftY']) {
        const value = bot[key]
        if (value === undefined) continue
        assert.ok(Number.isFinite(value), id + '.' + key + ' is not finite at t=' + String(t))
      }
      // scale must never collapse to zero, or the body path vanishes.
      assert.ok(bot.scale > 0, id + ' collapsed scale to ' + String(bot.scale))
    }
  }
})

test('the engine paints real SVG geometry, not an empty shell', () => {
  const { container } = mountRobot()
  const svg = descendants(container).find((el) => el.namespaceURI === SVG_NS && el.tagName === 'SVG')
  assert.ok(svg, 'no SVG root was created')
  assert.equal(svg.getAttribute('viewBox'), '-140 -140 280 280')

  const painted = descendants(svg)
    .filter((el) => el.tagName === 'PATH' && (el.getAttribute('d') ?? '').length > 10)
  assert.ok(painted.length > 0, 'body paths carry no geometry')
  assert.ok(descendants(svg).some((el) => el.tagName === 'RECT'), 'no eye rects')
})

test('destroy clears the container so unmount leaves nothing behind', () => {
  const { container, robot } = mountRobot()
  assert.ok(container.children.length > 0, 'nothing was mounted')
  robot.destroy()
  assert.equal(container.children.length, 0, 'destroy left nodes behind')
})

/**
 * The float pill's main button: the JSX branch that decides the icon.
 *
 * Sliced by marker rather than a fixed character window. The branch carries a
 * long explanatory comment, so any hardcoded offset silently drifts out of
 * range and the assertions start inspecting unrelated code.
 */
function floatMainBranch(source) {
  // Slice exactly the icon ternary: from its opening `unreadCount > 0` test to
  // the mascot element itself. Starting at that test (rather than the button or
  // a wider window) keeps the a11y aria-label, which legitimately names the
  // latest session, out of scope.
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const idle = stripped.indexOf('<IdleRobot size=')
  assert.ok(idle >= 0, 'pill.tsx never renders the mascot')
  const check = stripped.lastIndexOf('style={checkBadgeStyle}', idle)
  assert.ok(check >= 0, 'no checkBadge branch in the icon ternary')
  const start = stripped.lastIndexOf('unreadCount > 0', check)
  assert.ok(start >= 0, 'the icon ternary is not gated on unread')
  return stripped.slice(start, idle)
}

test('the pill renders the mascot only in the fully idle state', () => {
  // Guards the wiring: the engine is the only element that continuously costs
  // frames, so it must not run while there is a running task.
  const source = readFileSync(PILL, 'utf8')
  assert.ok(source.includes("from './idle-robot'"), 'pill.tsx does not import the mascot')
  assert.ok(source.includes('<IdleRobot'), 'pill.tsx never renders the mascot')
  const branch = floatMainBranch(source)
  assert.ok(
    branch.includes('runningSessions.length > 0'),
    'the mascot branch does not check for running sessions',
  )
  assert.ok(
    branch.includes('unreadCount > 0'),
    'the mascot branch does not check for unread results',
  )
})

test('the float mascot is gated on unread, never on record history', () => {
  // Regression: the float pill used to gate the mascot on the existence of a
  // completion record (`latest !== undefined`). The entries list is a completion
  // HISTORY the host keeps (up to 50 items) and never clears, so after a single
  // finished turn it is permanently non-empty and the mascot could never mount
  // again. The card half gated on unread and was fine, so the two forms
  // disagreed: in float mode the robot was simply never visible.
  const stripped = readFileSync(PILL, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
  const idle = stripped.indexOf('<IdleRobot size=')
  assert.ok(idle >= 0, 'pill.tsx never renders the mascot')

  // Walk back from the mascot to the `unreadCount > 0 && latest !== undefined`
  // test that opens the icon ternary — that is the enclosing gate.
  const check = stripped.lastIndexOf('style={checkBadgeStyle}', idle)
  assert.ok(check >= 0, 'no checkBadge branch in the icon ternary')
  const gate = stripped.lastIndexOf('unreadCount > 0', check)
  assert.ok(gate >= 0, 'the icon ternary is not gated on unread')
  const closed = stripped.slice(gate, idle)

  // The alive-on-unread branch is the badge; the mascot is the else-branch, so
  // the mascot must NOT consult the record history. `latest` is allowed only as
  // part of the unread guard above it.
  const idleGate = stripped.slice(check, idle)
  assert.ok(
    !idleGate.includes('latest'),
    'the float mascot branch is gated on record history again: the robot will never mount',
  )
  assert.ok(
    !idleGate.includes('entries.length'),
    'the float mascot branch is gated on the entries history length again',
  )
  assert.ok(
    closed.includes('unreadCount > 0'),
    'the float mascot is not gated on unread',
  )
})

test('the mascot container is styled by the pill stylesheet', () => {
  const source = readFileSync(PILL, 'utf8')
  assert.ok(source.includes('.dpl-idle-bot{'), 'no .dpl-idle-bot rule in PILL_CSS')
  // It must be sized, or the SVG has no box to fill.
  const rule = source.slice(source.indexOf('.dpl-idle-bot{'), source.indexOf('.dpl-idle-bot{') + 220)
  assert.ok(rule.includes('width:calc('), '.dpl-idle-bot has no width')
  assert.ok(rule.includes('height:calc('), '.dpl-idle-bot has no height')
})
