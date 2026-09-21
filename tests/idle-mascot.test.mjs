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

test('the pill renders the mascot only in the fully idle state', () => {
  // Guards the wiring: the engine is the only element that continuously costs
  // frames, so it must not run while there is an unread result or a running task.
  const source = readFileSync(PILL, 'utf8')
  assert.ok(source.includes("from './idle-robot'"), 'pill.tsx does not import the mascot')
  assert.ok(source.includes('<IdleRobot'), 'pill.tsx never renders the mascot')
  // Anchor on the JSX render call, not the import line (which also matches).
  const start = source.indexOf('<IdleRobot size=')
  assert.ok(start >= 0, 'pill.tsx has no <IdleRobot size=... /> render call')
  const branch = source.slice(Math.max(0, start - 300), start + 200)
  assert.ok(
    branch.includes('runningSessions.length > 0'),
    'the mascot branch does not check for running sessions',
  )
  assert.ok(
    branch.includes('latest !== undefined'),
    'the mascot branch does not check for an existing record',
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