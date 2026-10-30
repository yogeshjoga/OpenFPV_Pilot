import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AIR_DENSITY, floorPressure, floorWindSpeed, pressureColor, rotorPressure, rotorVelocity, speedColor } from './flow.js'

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`)
const rotor = { x: 0, y: 0, z: 0, R: 63.5, vi: 10, floor: false }
const at = (x, y, z, r = rotor) => {
  const v = [0, 0, 0]
  const speed = rotorVelocity(v, x, y, z, r)
  return { v, speed }
}

test('the air goes down through the disc at the induced speed', () => {
  const { v } = at(0, -0.001, 0)
  near(v[1], -rotor.vi, 0.05)
})

test('far below, on the axis, the stream moves at twice the speed through the disc', () => {
  const { v } = at(0, -2 * rotor.R * 1.5, 0)
  near(v[1], -2 * rotor.vi, 0.5)
})

test('above the disc the air is drawn in: towards the axis and down', () => {
  const { v } = at(80, 40, 0)
  assert.ok(v[0] < 0, 'moves towards the axis')
  assert.ok(v[1] < 0, 'moves down')
})

test('the stream is narrower below the disc than at it', () => {
  const edgeAtDisc = at(rotor.R * 0.97, -1, 0).v[1]
  const edgeFarBelow = at(rotor.R * 0.97, -150, 0).v[1]
  assert.ok(Math.abs(edgeFarBelow) < Math.abs(edgeAtDisc) * 2, 'speed at the old edge grows less than on the axis')
  assert.ok(Math.abs(at(rotor.R * 0.9, -150, 0).v[1]) < Math.abs(at(0, -150, 0).v[1]), 'slower toward the edge')
})

test('the pressure jumps by thrust over area across the disc: 2 ρ vi squared', () => {
  const above = rotorPressure(0, 0.001, 0, rotor)
  const below = rotorPressure(0, -0.001, 0, rotor)
  near(below - above, 2 * AIR_DENSITY * rotor.vi ** 2, 2)
  assert.ok(above < 0, 'suction above')
  assert.ok(below > 0, 'push below')
})

test('far below the jet the pressure is back to that of the room', () => {
  near(rotorPressure(0, -150, 0, rotor), 0, 0.1 * AIR_DENSITY * rotor.vi ** 2)
  near(rotorPressure(0, -600, 0, rotor), 0, 0.1 * AIR_DENSITY * rotor.vi ** 2)
})

test('with a floor the stream stops going down and runs along the floor', () => {
  const hover = { ...rotor, y: 60, floor: true }
  const close = at(0.5 * hover.R, 2, 0, hover)
  assert.ok(Math.abs(close.v[1]) < 1, 'almost no vertical speed at the floor')
  const wall = at(1.4 * hover.R, 3, 0, hover)
  assert.ok(wall.v[0] > 2, 'a stream moves out along the floor')
  assert.ok(floorWindSpeed(hover) > 2)
})

test('the floor pressure is highest right under the propeller and falls away from it', () => {
  const hover = { ...rotor, y: 60, floor: true }
  const under = floorPressure(0, 0, [hover])
  const aside = floorPressure(3 * hover.R, 0, [hover])
  assert.ok(under > 0)
  assert.ok(aside < under * 0.1, 'much weaker to the side')
})

test('a heavier drone pushes harder on the floor', () => {
  const light = { ...rotor, y: 60, floor: true, vi: 6 }
  const heavy = { ...rotor, y: 60, floor: true, vi: 9 }
  assert.ok(floorPressure(0, 0, [heavy]) > floorPressure(0, 0, [light]))
})

test('colours stay in range', () => {
  for (const t of [-0.2, 0, 0.4, 1, 1.5]) for (const c of speedColor(t)) assert.ok(c >= 0 && c <= 1)
  for (const t of [-2, -0.5, 0, 0.5, 2]) for (const c of pressureColor(t)) assert.ok(c >= 0 && c <= 1)
})

test('nose down: the rear propellers push harder than the front ones, and level they are equal', async () => {
  const { pitchThrustSplit } = await import('./physics.js')
  const level = pitchThrustSplit(0)
  near(level.front, 1, 1e-9)
  near(level.rear, 1, 1e-9)
  const tilted = pitchThrustSplit(30)
  assert.ok(tilted.rear > tilted.front)
  near(tilted.front + tilted.rear, 2, 1e-9)
})
