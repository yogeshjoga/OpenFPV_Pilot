import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CHORD_RAW, THICKNESS, aerofoilVelocity, outline } from './airfoil.js'

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`)
const RAD = Math.PI / 180

test('the section is a sensible wing: long and thin', () => {
  assert.ok(CHORD_RAW > 3.5 && CHORD_RAW < 5)
  assert.ok(THICKNESS > 0.06 && THICKNESS < 0.2, `thickness ${THICKNESS}`)
})

test('far from the wing the air moves at the free-stream speed and direction', () => {
  const v = [0, 0]
  aerofoilVelocity(v, -200, 5, 6 * RAD)
  near(v[0], Math.cos(6 * RAD), 0.02)
  near(v[1], Math.sin(6 * RAD), 0.02)
})

test('the air does not go through the wing: it flows along the surface', () => {
  const alpha = 8 * RAD
  const pts = outline(120)
  const v = [0, 0]
  let worst = 0
  for (let i = 0; i < pts.length; i += 1) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const tx = b[0] - a[0]
    const ty = b[1] - a[1]
    const len = Math.hypot(tx, ty)
    const nx = -ty / len
    const ny = tx / len
    // a point just outside the surface
    const px = (a[0] + b[0]) / 2 + nx * 0.004
    const py = (a[1] + b[1]) / 2 + ny * 0.004
    const speed = aerofoilVelocity(v, px, py, alpha)
    if (speed < 0.05 || speed > 2.9) continue
    worst = Math.max(worst, Math.abs((v[0] * nx + v[1] * ny) / speed))
  }
  assert.ok(worst < 0.25, `the air crosses the surface by ${worst}`)
})

test('the air is faster over the top than underneath, so the pressure is lower above (lift)', () => {
  const up = [0, 0]
  const down = [0, 0]
  const alpha = 6 * RAD
  const above = aerofoilVelocity(up, -0.2, 0.55, alpha)
  const below = aerofoilVelocity(down, -0.2, -0.55, alpha)
  assert.ok(above > below, `above ${above}, below ${below}`)
})

test('a stalled wing has less circulation, so less speed-up over the top', () => {
  const v = [0, 0]
  const alpha = 6 * RAD
  const full = aerofoilVelocity(v, -0.2, 0.55, alpha, 1)
  const stalled = aerofoilVelocity(v, -0.2, 0.55, alpha, 0.2)
  assert.ok(stalled < full)
})

test('points inside the wing are reported', () => {
  assert.equal(aerofoilVelocity([0, 0], 0, 0, 0), -1)
})
