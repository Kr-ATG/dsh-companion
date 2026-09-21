import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BASICS, chooseMotion, rareSeconds, restSeconds } from '../src/client/idle-director.ts'

test('rest between motions is 5-10s, matching the macOS director', () => {
  for (let i = 0; i < 200; i += 1) {
    const value = restSeconds()
    assert.ok(value >= 5 && value <= 10, 'restSeconds out of range: ' + String(value))
  }
})

test('the rare dance interval is 20-40 min', () => {
  for (let i = 0; i < 200; i += 1) {
    const value = rareSeconds()
    assert.ok(value >= 1200 && value <= 2400, 'rareSeconds out of range: ' + String(value))
  }
})

test('a basic motion never repeats the previous one', () => {
  // Sweep the random source across the whole range: none of the picks may be
  // the motion just played.
  for (const previous of BASICS) {
    for (let step = 0; step < 50; step += 1) {
      const r = step / 50
      const chosen = chooseMotion(0, 9999, previous, () => r)
      assert.notEqual(chosen, previous, 'replayed ' + previous)
      assert.ok(BASICS.includes(chosen), 'chose a non-basic motion: ' + chosen)
    }
  }
})

test('the rare dance wins once its interval elapses', () => {
  const chosen = chooseMotion(2000, 1500, 'blink', () => 0)
  assert.equal(chosen, 'dance')
})

test('the dance does not fire before its interval', () => {
  const chosen = chooseMotion(1000, 1500, 'blink', () => 0)
  assert.notEqual(chosen, 'dance')
})

test('every basic motion is reachable across the random range', () => {
  const seen = new Set()
  for (let step = 0; step < 1000; step += 1) {
    seen.add(chooseMotion(0, 9999, 'sleep', () => step / 1000))
  }
  // sleep is excluded as the previous motion, so the other eight must appear.
  for (const id of BASICS) {
    if (id === 'sleep') continue
    assert.ok(seen.has(id), 'motion never chosen: ' + id)
  }
})
