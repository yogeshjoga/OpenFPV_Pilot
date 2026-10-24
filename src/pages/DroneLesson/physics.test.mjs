import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  AttitudeAxis, DEFAULT_SLIDERS, DRONE, G, HOVER, THRUST_MAX_N, WEIGHT_N,
  bestSpeeds, dragN, forces, gainsFromSliders, hoverInducedVelocity, inducedVelocity, leanForSpeed, motorThrustN, powerCurve, powerW, stepMetrics,
} from './physics.js'

const respond = (sliders, { target = 0.21, disturbance = 0, seconds = 0.8 } = {}) => {
  const axis = new AttitudeAxis()
  const gains = gainsFromSliders(sliders)
  const dt = 0.0005
  const samples = []
  for (let t = 0; t < seconds; t += dt) {
    axis.step(dt, target, gains, { disturbance })
    samples.push({ t, y: axis.angle })
  }
  return { axis, metrics: stepMetrics(samples.filter((_, k) => k % 4 === 0), target) }
}

test('four motors at the hover speed lift exactly the weight', () => {
  assert.ok(Math.abs(4 * motorThrustN(HOVER) - WEIGHT_N) < 1e-9)
  assert.ok(THRUST_MAX_N / (WEIGHT_N / 4) > 5) // a freestyle quad has plenty of spare thrust
})

test('thrust grows with the square of motor speed', () => {
  assert.ok(Math.abs(motorThrustN(0.8) / motorThrustN(0.4) - 4) < 1e-9)
})

test('equal motors make no torque, and uneven motors tip the drone the right way', () => {
  const level = forces([0.4, 0.4, 0.4, 0.4])
  assert.ok(Math.abs(level.pitchTorque) < 1e-9 && Math.abs(level.rollTorque) < 1e-9)
  const noseDown = forces([0.3, 0.3, 0.5, 0.5]) // front pair slow, rear pair fast
  assert.ok(noseDown.pitchTorque > 0)
  const rollRight = forces([0.3, 0.5, 0.3, 0.5]) // right pair slow, left pair fast
  assert.ok(rollRight.rollTorque > 0)
})

test('drag grows with the square of speed, and the lean needed grows with speed', () => {
  assert.ok(Math.abs(dragN(20) / dragN(10) - 4) < 1e-9)
  assert.ok(leanForSpeed(20) > leanForSpeed(10) && leanForSpeed(10) > 0)
  assert.equal(leanForSpeed(0), 0)
})

test('the power curve has a minimum: slow flight and fast flight both cost more', () => {
  const { endurance, range } = bestSpeeds()
  assert.ok(endurance > 4 && endurance < 25, `endurance ${endurance}`)
  assert.ok(range > endurance, 'the best range speed is faster than the best endurance speed')
  assert.ok(powerW(0).total > powerW(endurance).total)
  assert.ok(powerW(35).total > powerW(endurance).total)
  const hover = powerW(0).total
  assert.ok(hover > 60 && hover < 160, `hover power ${hover}`)
  const curve = powerCurve(30, 30)
  assert.ok(curve.every((p) => Math.abs(p.induced + p.parasitic - p.total) < 1e-9))
})

test('moving forward lowers the induced velocity (the air is already moving through the props)', () => {
  assert.ok(inducedVelocity(10) < hoverInducedVelocity())
  assert.ok(Math.abs(inducedVelocity(0) - hoverInducedVelocity()) < 1e-6)
})

test('the default PID tune follows a 12 degree step quickly and settles', () => {
  const { metrics } = respond(DEFAULT_SLIDERS)
  assert.ok(metrics.settled)
  assert.ok(metrics.overshootPct < 15, `overshoot ${metrics.overshootPct}`)
  assert.ok(metrics.riseS < 0.2, `rise ${metrics.riseS}`)
})

test('too little P is slow, too much P overshoots', () => {
  const low = respond({ ...DEFAULT_SLIDERS, p: 15 }).metrics
  const good = respond(DEFAULT_SLIDERS).metrics
  const high = respond({ ...DEFAULT_SLIDERS, p: 100 }).metrics
  assert.ok(low.riseS > good.riseS)
  assert.ok(high.overshootPct > good.overshootPct + 20)
})

test('D damps the response: without it the quad overshoots and rings', () => {
  const none = respond({ ...DEFAULT_SLIDERS, d: 0 }).metrics
  const good = respond(DEFAULT_SLIDERS).metrics
  assert.ok(none.overshootPct > good.overshootPct + 50)
})

test('I removes the offset a steady push leaves behind', () => {
  const push = -0.15 // N m against the step, like an off-centre battery or a crosswind
  const withoutI = respond({ ...DEFAULT_SLIDERS, i: 0 }, { disturbance: push, seconds: 3 }).axis
  const withI = respond(DEFAULT_SLIDERS, { disturbance: push, seconds: 3 }).axis
  assert.ok(Math.abs(0.21 - withI.angle) < Math.abs(0.21 - withoutI.angle), 'the I term pulls the angle closer to the target')
  assert.ok(withI.integral !== 0)
})

test('the PID output is limited, like the motors are', () => {
  const axis = new AttitudeAxis()
  const gains = gainsFromSliders({ p: 140, i: 0, d: 0 })
  for (let k = 0; k < 200; k++) {
    const out = axis.step(0.0005, 1, gains)
    assert.ok(Math.abs(out.u) <= 1 && Math.abs(out.out) <= 1)
  }
})

test('weight in newtons is mass times g', () => {
  assert.ok(Math.abs(WEIGHT_N - DRONE.massKg * G) < 1e-12)
})
