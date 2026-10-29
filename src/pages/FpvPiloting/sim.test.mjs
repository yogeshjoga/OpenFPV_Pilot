import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LOOPS, MAX_ANGLE, describeStick, initialState, liftNow, routeFor, sticksFor, stepMode, stopping, thrustWeights, tiltDeg } from './sim.js'

const run = (mode, input, seconds, state = initialState(), dt = 1 / 60) => {
  let s = state
  for (let t = 0; t < seconds; t += dt) s = stepMode(s, typeof input === 'function' ? input(t) : input, mode, dt)
  return s
}
const centred = { roll: 0, pitch: 0, yaw: 0, throttle: 0.4 }

test('Angle mode: the stick sets the tilt, and the drone levels itself when you let go', () => {
  const held = run('angle', { ...centred, roll: 1 }, 1)
  assert.ok(Math.abs(held.roll - MAX_ANGLE) < 1, `held ${held.roll}`)
  const released = run('angle', centred, 1, held)
  assert.ok(Math.abs(released.roll) < 1, `released ${released.roll}`)
})

test('Angle mode can never flip, however long the stick is held', () => {
  const s = run('angle', { ...centred, roll: 1 }, 5)
  assert.ok(s.roll <= MAX_ANGLE + 0.5)
})

test('Acro: the stick is a rotation speed, and the drone stays tilted when you let go', () => {
  const tipped = run('acro', (t) => ({ ...centred, roll: t < 0.1 ? 1 : 0 }), 0.1)
  assert.ok(tipped.roll > 40, `tipped ${tipped.roll}`)
  const later = run('acro', centred, 2, tipped)
  assert.ok(Math.abs(later.roll - tipped.roll) < 0.01, 'it keeps the tilt')
})

test('Acro flips all the way round: full stick for 0.6 s is about one turn', () => {
  const s = run('acro', (t) => ({ ...centred, roll: t < 0.6 ? 1 : 0 }), 1)
  assert.ok(Math.abs(s.roll - 360) < 15, `roll ${s.roll}`)
})

test('Horizon levels itself near the centre but flips at full stick', () => {
  const tilted = { ...initialState(), roll: 30 }
  const small = run('horizon', centred, 2, tilted)
  assert.ok(Math.abs(small.roll) < 3, `levelled ${small.roll}`)
  const flipped = run('horizon', { ...centred, roll: 1 }, 0.8)
  assert.ok(flipped.roll > 150, `flipped ${flipped.roll}`)
})

test('in Angle mode a hover throttle holds height, in Acro upside down the same throttle pushes the drone down', () => {
  const hover = run('angle', centred, 3, initialState(2))
  assert.ok(Math.abs(hover.alt - 2) < 0.15, `alt ${hover.alt}`)
  const upside = { ...initialState(3), roll: 180 }
  const falling = run('acro', centred, 1, upside)
  assert.ok(falling.alt < 2, `upside down alt ${falling.alt}`)
})

test('3D mode: the middle of the throttle is zero thrust, and below it the thrust reverses', () => {
  assert.equal(thrustWeights('3d', 0.5), 0)
  assert.ok(thrustWeights('3d', 0.2) < 0)
  assert.ok(thrustWeights('3d', 0.8) > 0)
  // upside down, backwards thrust pushes the drone UP
  const upside = { ...initialState(3), roll: 180 }
  assert.ok(liftNow(upside, '3d', 0.25) > 0)
  assert.ok(liftNow(upside, 'acro', 0.4) < 0)
})

test('3D mode can hold a hover upside down', () => {
  const upside = { ...initialState(3), roll: 180 }
  const held = run('3d', { ...centred, throttle: 0.25 }, 3, upside)
  assert.ok(Math.abs(held.alt - 3) < 0.2, `alt ${held.alt}`)
  assert.ok(tiltDeg(held) > 170)
})

test('a drone that falls in hard crashes, and a gentle landing does not', () => {
  const hard = run('acro', { ...centred, throttle: 0 }, 3, initialState(5))
  assert.equal(hard.crashed, true)
  const soft = run('angle', { ...centred, throttle: 0.34 }, 8, initialState(1))
  assert.equal(soft.crashed, false)
})

test('a circle route comes back to where it started, heading the same way', () => {
  const route = routeFor(0)
  const a = route[0]
  const b = route[route.length - 1]
  const mid = route.find((p) => p.phase === 2)
  assert.ok(mid, 'has an exit straight')
  assert.ok(Math.abs(wrap(a.heading - b.heading)) < 1, 'same heading')
  // the circle itself: the loop ends where it began
  const loopStart = route.find((p) => p.phase === 1)
  const loopEnd = [...route].reverse().find((p) => p.phase === 1)
  assert.ok(Math.hypot(loopStart.x - loopEnd.x, loopStart.y - loopEnd.y) < 1.0)
})

test('the figure 8 is closed and crosses itself in the middle', () => {
  const route = routeFor(8)
  const a = route[0]
  const b = route[route.length - 1]
  assert.ok(Math.hypot(a.x - b.x, a.y - b.y) < 1.2, `gap ${Math.hypot(a.x - b.x, a.y - b.y)}`)
  // it passes close to its start point in the middle of the flight
  const crossing = route.slice(10, -10).some((p) => Math.hypot(p.x - a.x, p.y - a.y) < 0.8)
  assert.ok(crossing, 'passes through the middle again')
})

test('the 7 turns a sharp corner of 135 degrees to the right', () => {
  const route = routeFor(7)
  const first = route[0]
  const last = route[route.length - 1]
  assert.ok(Math.abs(wrap(last.heading - first.heading) + 135) < 2)
})

function wrap(d) { return ((((d + 180) % 360) + 360) % 360) - 180 }

test('turning left: yaw and roll to the left; turning right: to the right; going straight: they are centred', () => {
  const left = routeFor(0).find((p) => p.phase === 1)
  const right = routeFor(7).find((p) => p.turnRate < 0)
  const straight = routeFor(7)[0]
  const l = sticksFor(left)
  const r = sticksFor(right)
  const s = sticksFor(straight)
  assert.ok(l.yaw < 0 && l.roll < 0)
  assert.ok(r.yaw > 0 && r.roll > 0)
  assert.equal(s.yaw, 0)
  assert.equal(s.roll, 0)
  assert.ok(s.pitch > 0.4, 'forward')
})

test('sticks are always inside their travel', () => {
  for (const id of Object.keys(LOOPS)) {
    for (const p of routeFor(id)) {
      const s = sticksFor(p)
      for (const k of ['yaw', 'pitch', 'roll']) assert.ok(Math.abs(s[k]) <= 1, `${id} ${k}`)
      assert.ok(s.throttle >= 0 && s.throttle <= 1)
    }
  }
})

test('the 7 slows down for its corner, and the pitch stick comes back to match', () => {
  const route = routeFor(7)
  const fast = sticksFor(route[0])
  const corner = sticksFor(route.find((p) => p.turnRate < 0))
  assert.ok(corner.pitch < fast.pitch * 0.6, `corner ${corner.pitch} fast ${fast.pitch}`)
  assert.ok(corner.yaw > 0.5, 'a firm yaw to the right')
})

test('stick words', () => {
  assert.equal(describeStick('yaw', 0), 'centred')
  assert.match(describeStick('yaw', -0.4), /^left about half/)
  assert.match(describeStick('pitch', 0.6), /^forward a lot/)
  assert.match(describeStick('throttle', 0.45), /^hold steady/)
  assert.match(describeStick('throttle', 0.6), /^up to 60%/)
})

test('stopping from 100 km/h: reaction and braking add up, and a faster drone needs much more room', () => {
  const s = stopping(100, 0.4, 55)
  assert.ok(Math.abs(s.v - 27.78) < 0.01)
  assert.ok(Math.abs(s.reaction - 11.1) < 0.1)
  assert.ok(s.braking > 15 && s.braking < 35, `braking ${s.braking}`)
  assert.equal(s.total, s.reaction + s.braking)
  // double the speed: reaction doubles, braking quadruples
  const d = stopping(200, 0.4, 55)
  assert.ok(Math.abs(d.braking / s.braking - 4) < 0.01)
  assert.ok(Math.abs(d.reaction / s.reaction - 2) < 0.01)
})

test('leaning back harder stops the drone in less room', () => {
  assert.ok(stopping(100, 0.4, 65).braking < stopping(100, 0.4, 35).braking)
})

import { compass, flyCombo, headingDeg, initialFlight, speedOf, stepFlight } from './sim.js'

const fly = (input, seconds, state = initialFlight(), dt = 1 / 60) => {
  let s = state
  for (let t = 0; t < seconds; t += dt) s = stepFlight(s, typeof input === 'function' ? input(t) : input, dt)
  return s
}
const hoverIn = { throttle: 0.4, yaw: 0, pitch: 0, roll: 0 }

test('flight: hovering stays put, pitch forward goes north, roll right goes east, and letting go slows to a stop', () => {
  const still = fly(hoverIn, 3)
  assert.ok(Math.hypot(still.e, still.n) < 0.05)
  const north = fly({ ...hoverIn, pitch: 0.5 }, 3)
  assert.ok(north.n > 5 && Math.abs(north.e) < 0.1, `north ${north.n} east ${north.e}`)
  const east = fly({ ...hoverIn, roll: 0.5 }, 3)
  assert.ok(east.e > 5 && Math.abs(east.n) < 0.1)
  const stopped = fly(hoverIn, 6, north)
  assert.ok(speedOf(stopped) < 0.3, `speed ${speedOf(stopped)}`)
})

test('flight: forward means the way the nose points, so after a quarter turn to the right, forward goes east', () => {
  let s = fly({ ...hoverIn, yaw: 0.25 }, 1, initialFlight()) // 90 degrees to the right
  assert.ok(Math.abs(headingDeg(s) - 90) < 2, `heading ${headingDeg(s)}`)
  s = fly({ ...hoverIn, pitch: 0.5 }, 3, { ...s, yaw: 90 })
  assert.ok(s.e > 5 && Math.abs(s.n) < 1)
  assert.equal(compass(90), 'east')
  assert.equal(compass(350), 'north')
})

test('flight: a tilted drone sinks unless the throttle is raised, and throttle up climbs, throttle down descends', () => {
  const sinks = fly({ ...hoverIn, pitch: 0.7 }, 3)
  assert.ok(sinks.alt < 1.7, `alt ${sinks.alt}`)
  const holds = fly({ ...hoverIn, pitch: 0.7, throttle: 0.52 }, 3)
  assert.ok(holds.alt > sinks.alt + 0.5)
  assert.ok(fly({ ...hoverIn, throttle: 0.6 }, 2).alt > 3)
  assert.ok(fly({ ...hoverIn, throttle: 0.3 }, 2).alt < 1.5)
})

test('flight: on the ground the drone does not slide', () => {
  const s = fly({ ...hoverIn, throttle: 0, pitch: 0.6 }, 3, initialFlight(0))
  assert.ok(Math.hypot(s.e, s.n) < 0.01)
})

test('flight: a banked turn (forward, roll and yaw to the right) curves to the right', () => {
  const s = fly({ ...hoverIn, throttle: 0.5, pitch: 0.4, roll: 0.2, yaw: 0.15 }, 2)
  assert.ok(s.e > 2, `east ${s.e}`)
  assert.ok(headingDeg(s) > 40 && headingDeg(s) < 140, `heading ${headingDeg(s)}`)
})

test('a combination flies the steps in order and samples like a move', () => {
  const samples = flyCombo([{ dur: 1, sticks: {} }, { dur: 2, sticks: { pitch: 0.5, throttle: 0.5 } }])
  assert.equal(new Set(samples.map((p) => p.phase)).size, 2)
  assert.ok(samples.at(-1).y > 3, 'it went north')
  for (const p of samples) assert.ok(Number.isFinite(p.x) && Number.isFinite(p.alt) && Number.isFinite(p.heading))
  assert.ok(Math.abs(samples[0].heading - 90) < 0.01, 'facing north is 90 degrees from east')
})

import { COMBOS } from './data/combos.js'
import { describeFlight } from './sim.js'

test('combinations: every step has words, and each flight does what it says', () => {
  for (const c of COMBOS) {
    assert.ok(c.name && c.uses && c.why && c.steps.length >= 3, c.id)
    for (const s of c.steps) assert.ok(s.title && s.text && s.dur > 0, `${c.id} ${s.title}`)
  }
  const flight = (id) => describeFlight(flyCombo(COMBOS.find((c) => c.id === id).steps))
  const forward = flight('forward')
  assert.equal(forward.direction, 'north')
  assert.ok(forward.distance > 8, `forward ${forward.distance}`)
  assert.ok(forward.altMin > 1.4 && forward.altMax < 2.8, `height held: ${forward.altMin} to ${forward.altMax}`)
  const climb = flight('climbforward')
  assert.equal(climb.direction, 'north')
  assert.ok(climb.altMax > climb.altStart + 1.5, `climb ${climb.altMax}`)
  const slide = flight('slide')
  assert.equal(slide.direction, 'east')
  const bank = flight('bank')
  assert.ok(bank.distance > 5)
  const spiral = flight('spiral')
  assert.ok(spiral.altMax > spiral.altStart + 1.5)
  // the square: it ends near where it began, still at about the same height
  const square = flight('square')
  assert.ok(square.distance < 6, `square ends ${square.distance} m from the start`)
  assert.ok(square.altMin > 1.2 && square.altMax < 3, `square height ${square.altMin} to ${square.altMax}`)
})
