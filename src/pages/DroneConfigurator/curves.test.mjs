import { test } from 'node:test'
import assert from 'node:assert/strict'
import { estimate } from './calc.js'
import { DEFAULT_BUILD } from './catalog.js'
import { atSpeed, atThrottle, speedCurves, throttleCurves } from './curves.js'
import { G } from '../DroneLesson/physics.js'

const build = (changes = {}) => estimate({ ...DEFAULT_BUILD, ...changes })

test('the thrust curve grows with throttle squared and ends at the build\'s full thrust', () => {
  const r = build()
  const c = throttleCurves(r)
  assert.equal(c.thrustN[0], 0)
  assert.ok(Math.abs(c.thrustN.at(-1) - r.maxThrustKg * G) < 1e-9)
  assert.ok(Math.abs(c.thrustN[20] / c.thrustN[10] - 4) < 1e-9)
})

test('the drone lifts off where the thrust curve crosses the weight, at the hover throttle', () => {
  const r = build()
  const c = throttleCurves(r, 1000)
  const i = c.thrustN.findIndex((n) => n >= c.weightN)
  assert.ok(Math.abs(c.xs[i] - r.hoverThrottle) < 0.005, `crosses at ${c.xs[i]}, hover throttle ${r.hoverThrottle}`)
})

test('the current curve rises with throttle and ends at the peak current', () => {
  const r = build()
  const c = throttleCurves(r)
  assert.ok(c.currentA.every((v, k) => k === 0 || v >= c.currentA[k - 1]))
  assert.ok(Math.abs(c.currentA.at(-1) - r.peakCurrentA) < 1e-9)
  assert.equal(c.escMaxA, 220)
})

test('a motor that is more powerful makes a taller thrust curve', () => {
  const small = throttleCurves(build({ motor: '2207-2750', battery: '4s-1500' }))
  const big = throttleCurves(build())
  assert.ok(big.thrustN.at(-1) > small.thrustN.at(-1))
})

test('speed curves: power has a minimum and the best speeds sit on the curves', () => {
  const r = build()
  const c = speedCurves(r)
  const min = Math.min(...c.total)
  const at = c.xs[c.total.indexOf(min)]
  assert.ok(Math.abs(at - c.best.endurance) < 0.6, `minimum power at ${at} m/s, best endurance ${c.best.endurance}`)
  const bestRange = Math.max(...c.rangeKm.slice(1))
  const rAt = c.xs[c.rangeKm.indexOf(bestRange)]
  assert.ok(Math.abs(rAt - c.best.range) < 0.6, `longest range at ${rAt}, best range speed ${c.best.range}`)
  assert.ok(c.minutes.every((m) => m > 0))
})

test('a bigger battery flies longer at the same speed, and a heavier build uses more power', () => {
  const small = atSpeed(build({ battery: '6s-1100' }), 12)
  const big = atSpeed(build({ battery: '6s-1700' }), 12)
  assert.ok(big.minutes > small.minutes)
  const light = atSpeed(build({ video: 'analog' }), 0)
  const heavy = atSpeed(build({ video: 'digital-action' }), 0)
  assert.ok(heavy.powerW > light.powerW)
})

test('at one throttle: thrust, current and power agree with each other', () => {
  const r = build()
  const full = atThrottle(r, 1)
  assert.ok(Math.abs(full.currentA - r.peakCurrentA) < 1e-9)
  assert.ok(Math.abs(full.powerW - r.peakCurrentA * r.volts) < 1e-9)
  assert.ok(Math.abs(full.twr - r.twr) < 1e-9)
  assert.equal(atThrottle(r, 0).thrustN, 0)
  assert.equal(atThrottle(build({ motor: '2207-2750', battery: '4s-1300' }), 1).overBattery, build({ motor: '2207-2750', battery: '4s-1300' }).peakCurrentA > build({ motor: '2207-2750', battery: '4s-1300' }).batteryMaxA)
})

test('at one speed: more speed means more drag and a bigger lean', () => {
  const r = build()
  assert.ok(atSpeed(r, 20).dragN > atSpeed(r, 10).dragN)
  assert.ok(atSpeed(r, 20).leanDeg > atSpeed(r, 10).leanDeg)
  assert.equal(atSpeed(r, 0).leanDeg, 0)
})
