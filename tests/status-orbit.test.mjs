import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const CLIENT = resolve(ROOT, 'lib/client.js')

test('the running arc keeps the upstream stroke geometry', () => {
  // Ported from dsh-notch's StatusOrbit.swift: a 9.5-radius circle, 1.5px round
  // cap stroke, trimmed to 70% of the circumference (Circle().trim(to: 0.70)).
  const source = readFileSync(resolve(ROOT, 'src/client/status-orbit.tsx'), 'utf8')
  assert.ok(source.includes('RUNNING_ARC_SPAN = 0.7'), 'arc span is not the upstream 0.70')
  assert.ok(source.includes('strokeLinecap="round"'), 'arc lost its round line cap')
  assert.ok(source.includes('strokeWidth={1.5}'), 'arc stroke width is not the upstream 1.5')
  assert.ok(source.includes('const r = 9.5'), 'arc radius is not the upstream 9.5')
  assert.ok(source.includes('strokeDasharray'), 'arc does not use a dash array for the trim')
})

test('the running arc spins at the upstream angular velocity', () => {
  // DecisionSpin.runningVelocity = 2*pi/3 rad/s -> one turn every 3 seconds.
  const source = readFileSync(resolve(ROOT, 'src/client/status-orbit.tsx'), 'utf8')
  assert.ok(source.includes('(2 * Math.PI) / 3'), 'running velocity is not 2*pi/3')
  const pill = readFileSync(resolve(ROOT, 'src/client/pill.tsx'), 'utf8')
  assert.ok(pill.includes('dpOrbitSpin 3s linear infinite'), 'the spin is not a constant 3s turn')
})

test('the status colours match the upstream tokens', () => {
  const source = readFileSync(resolve(ROOT, 'src/client/status-orbit.tsx'), 'utf8')
  // NotchTokens.deepSeekBlue / StatusOutcome.rgb in StatusOrbit.swift.
  for (const hex of ['#4d6bfe', '#34c759', '#ff4000', '#f2ff14']) {
    assert.ok(source.includes(hex), 'missing status colour ' + hex)
  }
})

/**
 * Strip CSS block comments and JS line/block comments.
 *
 * Several comments explain WHY the old conic-gradient spinner was replaced, so a
 * naive substring ban would flag the documentation rather than the code.
 */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
}

test('the old conic-gradient spinner is gone', () => {
  // Check the merged stylesheet text the plugin actually injects, with comments
  // removed, so only real declarations count.
  for (const file of ['pill.tsx', 'sidebar-card.tsx', 'status-orbit.tsx']) {
    const code = stripComments(readFileSync(resolve(ROOT, 'src/client', file), 'utf8'))
    assert.ok(!code.includes('conic-gradient'), file + ' still declares a conic-gradient')
    assert.ok(!code.includes('dp-run-spin'), file + ' has a dangling .dp-run-spin reference')
    assert.ok(!code.includes('@keyframes dpSpin'), file + ' still defines dpSpin')
    assert.ok(!code.includes('dp-run-orb'), file + ' has a dangling .dp-run-orb reference')
  }
})

test('both pill modes render the mascot and the running arc', () => {
  const pill = readFileSync(resolve(ROOT, 'src/client/pill.tsx'), 'utf8')
  const card = readFileSync(resolve(ROOT, 'src/client/sidebar-card.tsx'), 'utf8')
  // Floating pill.
  assert.ok(pill.includes('<IdleRobot'), 'float pill never renders the mascot')
  assert.ok(pill.includes('<RunningArc'), 'float pill never renders the running arc')
  // Card: two branches (wide bar + rail), each must handle both states.
  const mascots = card.split('<IdleRobot').length - 1
  const arcs = card.split('<RunOrb').length - 1
  assert.equal(mascots, 2, 'card should render the mascot in both wide and rail branches, found ' + mascots)
  assert.equal(arcs, 3, 'card should use the arc in both branches plus its RunOrb helper, found ' + arcs)
})

test('the card mascot is sized and only shown when fully idle', () => {
  const pill = readFileSync(resolve(ROOT, 'src/client/pill.tsx'), 'utf8')
  const card = readFileSync(resolve(ROOT, 'src/client/sidebar-card.tsx'), 'utf8')
  // Sizing lives in PILL_CSS; without a box the engine's SVG has nothing to fill.
  assert.ok(pill.includes('.dpp-idle-bot{'), 'no .dpp-idle-bot rule')
  assert.ok(pill.includes('[data-dpp-card="rail"] .dpp-idle-bot'), 'rail size variant missing')
  // The mascot must be the else-branch of both unread and running.
  assert.ok(card.includes('runningSessions.length > 0'), 'card mascot does not check running')
  assert.ok(card.includes('unreadCount > 0'), 'wide card mascot does not check unread')
  assert.ok(card.includes('totalBadge > 0'), 'rail card mascot does not check the badge')
})

test('reduced motion freezes the running arc and the mascot', () => {
  const pill = readFileSync(resolve(ROOT, 'src/client/pill.tsx'), 'utf8')
  const idx = pill.indexOf('@media (prefers-reduced-motion:reduce)')
  assert.ok(idx >= 0, 'no reduced-motion block')
  const block = pill.slice(idx, idx + 700)
  assert.ok(block.includes('.dpl-run-arc'), 'reduced motion does not stop the running arc')
  // The idle director itself checks the media query (see idle-director.ts).
  const director = readFileSync(resolve(ROOT, 'src/client/idle-director.ts'), 'utf8')
  assert.ok(director.includes('prefers-reduced-motion'), 'idle director ignores reduced motion')
})

test('the shipped client bundle carries both features', () => {
  const code = readFileSync(CLIENT, 'utf8')
  // JSX props stay camelCase in the bundle (React turns them into DOM attributes
  // only at render time), so assert the prop names, not the kebab-case HTML.
  for (const marker of [
    'OpenBotMotion', 'dpl-idle-bot', 'dpp-idle-bot', 'dpl-run-arc',
    'strokeDasharray', 'strokeLinecap', 'dpOrbitSpin', 'RUNNING_ARC_SPAN',
  ]) {
    assert.ok(code.includes(marker), 'client bundle is missing ' + marker)
  }
})

test('the pill stylesheet is replaced when the served CSS changes', () => {
  // Regression: ensurePillKeyframes() used to early-return whenever a tag with
  // the id already existed. After a plugin upgrade the OLD stylesheet survives,
  // so new rules (the running arc's animation) never load — the arc renders but
  // is frozen, with no console error. The injection must therefore compare a
  // content revision and replace a stale tag.
  const source = readFileSync(resolve(ROOT, 'src/client/pill.tsx'), 'utf8')

  assert.ok(source.includes('function cssRevision()'), 'no content-revision helper')
  assert.ok(source.includes('data-css-rev'), 'the injected tag carries no revision')
  assert.ok(source.includes('existing.remove()'), 'a stale stylesheet is never removed')

  // The revision must be computed lazily: PILL_CSS is declared later in the
  // module, so a top-level call would throw a TDZ ReferenceError and break the
  // whole client bundle.
  const topLevelRev = /^const\s+CSS_REV\s*=/m.test(source)
  assert.ok(!topLevelRev, 'CSS_REV is evaluated at module scope (TDZ against PILL_CSS)')

  // The injected tag must actually be keyed by the revision, not by a constant.
  const inject = source.slice(source.indexOf('document.head.appendChild(style)') - 400)
  assert.ok(inject.includes("setAttribute('data-css-rev', cssRevision())"), 'tag is not keyed by the live revision')
})

test('the arc animation is declared in the stylesheet, not only inline', () => {
  // The rotation must come from CSS so it can be replaced/upgraded; the SVG only
  // carries the geometry (dash array, round cap).
  const source = readFileSync(resolve(ROOT, 'src/client/pill.tsx'), 'utf8')
  assert.ok(source.includes('animation:dpOrbitSpin 3s linear infinite'), 'no CSS rotation on the arc')
  const orbit = readFileSync(resolve(ROOT, 'src/client/status-orbit.tsx'), 'utf8')
  assert.ok(!orbit.includes('animation:'), 'the arc component should not inline its animation')
})
