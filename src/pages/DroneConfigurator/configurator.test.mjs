import { test } from 'node:test'
import assert from 'node:assert/strict'
import { estimate } from './calc.js'
import { BATTERIES, COLORS, DEFAULT_BUILD, MOTORS, PROPS, VIDEOS, resolveBuild } from './catalog.js'

const build = (changes = {}) => estimate({ ...DEFAULT_BUILD, ...changes })
const ids = (r) => r.warnings.map((w) => w.id)

test('the default build is a believable 5 inch freestyle quad', () => {
  const r = build()
  assert.ok(r.weightG > 480 && r.weightG < 650, `weight ${r.weightG}`)
  assert.ok(r.twr > 6 && r.twr < 14, `twr ${r.twr}`)
  assert.ok(r.topSpeedKmh > 120 && r.topSpeedKmh < 220, `speed ${r.topSpeedKmh}`)
  assert.ok(r.hoverMin > 8 && r.hoverMin < 30, `hover ${r.hoverMin}`)
  assert.ok(r.flightMin > 3 && r.flightMin < 12, `flight ${r.flightMin}`)
  assert.ok(r.hoverThrottle > 0.25 && r.hoverThrottle < 0.5, `hover throttle ${r.hoverThrottle}`)
  assert.equal(r.ok, true)
})

test('weights add up to the total', () => {
  const r = build()
  const sum = Object.values(r.weights).reduce((a, b) => a + b, 0)
  assert.equal(r.weightG, Math.round(sum))
})

test('every combination of the options produces finite numbers', () => {
  for (const motor of MOTORS) for (const prop of PROPS) for (const battery of BATTERIES) for (const video of VIDEOS) {
    const r = estimate({ motor: motor.id, prop: prop.id, battery: battery.id, video: video.id, color: 'blue' })
    for (const key of ['weightG', 'maxThrustKg', 'twr', 'topSpeedKmh', 'peakCurrentA', 'hoverPowerW', 'hoverMin', 'flightMin']) {
      assert.ok(Number.isFinite(r[key]) && r[key] > 0, `${key} for ${motor.id} ${prop.id} ${battery.id} ${video.id}`)
    }
  }
})

test('too many cells for a motor is an error, too few is a warning', () => {
  assert.ok(ids(build({ motor: '2306-2450', battery: '6s-1700' })).includes('cells-high'))
  assert.equal(build({ motor: '2306-2450', battery: '6s-1700' }).ok, false)
  assert.ok(ids(build({ motor: '2207-1750', battery: '4s-1500' })).includes('cells-low'))
  assert.deepEqual(ids(build({ motor: '2306-2450', battery: '4s-1500' })).filter((id) => id.startsWith('cells')), [])
})

test('a heavier battery adds weight and a bigger one lasts longer', () => {
  const small = build({ battery: '6s-1100' })
  const big = build({ battery: '6s-1700' })
  assert.ok(big.weightG > small.weightG)
  assert.ok(big.hoverMin > small.hoverMin)
})

test('the action camera costs weight and thrust-to-weight', () => {
  const plain = build({ video: 'digital' })
  const action = build({ video: 'digital-action' })
  assert.equal(action.weightG - plain.weightG, 55)
  assert.ok(action.twr < plain.twr)
})

test('a higher pitch prop is faster than a lower pitch one', () => {
  assert.ok(build({ prop: 'bi-5050' }).topSpeedKmh > build({ prop: 'tri-5040' }).topSpeedKmh)
  assert.ok(build({ prop: 'tri-5146' }).topSpeedKmh > build({ prop: 'tri-5040' }).topSpeedKmh)
})

test('the battery warning matches the current the motors would draw', () => {
  const r = build({ motor: '2207-2750', battery: '4s-1300', prop: 'tri-5146' })
  assert.equal(ids(r).includes('battery-c'), r.peakCurrentA > r.batteryMaxA)
})

test('unknown ids fall back to the default part', () => {
  const r = resolveBuild({ motor: 'nope', prop: '', battery: undefined, video: 'x', color: 'purple' })
  assert.equal(r.motor.id, DEFAULT_BUILD.motor)
  assert.equal(r.prop.id, DEFAULT_BUILD.prop)
  assert.equal(r.battery.id, DEFAULT_BUILD.battery)
  assert.equal(r.video.id, DEFAULT_BUILD.video)
  assert.equal(r.color.id, DEFAULT_BUILD.color)
})

test('catalog entries have what the page needs', () => {
  for (const list of [MOTORS, PROPS, BATTERIES, VIDEOS]) for (const part of list) {
    assert.ok(part.id && part.name && part.learn && part.weightG > 0, part.id)
  }
  assert.ok(COLORS.every((c) => c.id && c.name && Number.isInteger(c.hex)))
})
