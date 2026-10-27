import { test } from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_SLIDERS, DRONES, TESTS, authority, simulate } from './sim.js'

const tune = (changes) => ({ ...DEFAULT_SLIDERS, ...changes })

test('the default tune follows a stick step quickly and settles on every drone size', () => {
  for (const d of DRONES) {
    const m = simulate({ drone: d.id }).metrics
    assert.equal(m.kind, 'step')
    assert.ok(m.settled, d.id)
    assert.ok(m.overshootPct < 25, `${d.id} overshoot ${m.overshootPct}`)
    assert.ok(m.riseMs < 200, `${d.id} rise ${m.riseMs}`)
  }
})

test('a bigger, heavier drone overshoots more with the same tune', () => {
  assert.ok(simulate({ drone: '7in' }).metrics.overshootPct > simulate({ drone: '3in' }).metrics.overshootPct)
})

test('P: too low is slow, too high overshoots', () => {
  const good = simulate().metrics
  assert.ok(simulate({ sliders: tune({ p: 15 }) }).metrics.riseMs > good.riseMs * 1.5)
  assert.ok(simulate({ sliders: tune({ p: 100 }) }).metrics.overshootPct > good.overshootPct + 30)
})

test('D: without it the drone swings badly, and a lot of it makes the response slow', () => {
  const good = simulate().metrics
  assert.ok(simulate({ sliders: tune({ d: 0 }) }).metrics.overshootPct > 100)
  assert.ok(simulate({ sliders: tune({ d: 100 }) }).metrics.riseMs > good.riseMs * 1.5)
})

test('control authority grows in a straight line with throttle', () => {
  const [a, b, c] = [0.2, 0.4, 0.8].map((t) => authority(DRONES[0], t))
  assert.ok(Math.abs(b / a - 2) < 1e-9 && Math.abs(c / b - 2) < 1e-9)
})

test('the same hot tune rings more at high throttle when the motors lag', () => {
  const hot = { p: 70, i: 60, d: 35 }
  const low = simulate({ sliders: hot, base: 0.25, lagS: 0.035 }).metrics.overshootPct
  const high = simulate({ sliders: hot, base: 0.85, lagS: 0.035 }).metrics.overshootPct
  assert.ok(high > low, `overshoot at high throttle ${high}, at low throttle ${low}`)
})

test('gust: more D gives a smaller knock and a quicker recovery', () => {
  const normal = simulate({ test: 'gust' }).metrics
  const damped = simulate({ test: 'gust', sliders: tune({ d: 100 }) }).metrics
  assert.ok(damped.peakDeg < normal.peakDeg)
  assert.ok(simulate({ test: 'gust', sliders: tune({ p: 100 }) }).metrics.recoverMs > normal.recoverMs)
})

test('steady crosswind: I removes the offset that P alone leaves', () => {
  const withI = simulate({ test: 'push' }).metrics
  const noI = simulate({ test: 'push', sliders: tune({ i: 0 }) }).metrics
  assert.ok(Math.abs(withI.offsetDeg) < Math.abs(noI.offsetDeg) / 2)
  assert.ok(simulate({ test: 'push', sliders: tune({ i: 150 }) }).metrics.recoverMs < withI.recoverMs)
})

test('prop wash: too little D lets the shaking grow', () => {
  const low = simulate({ test: 'propwash', sliders: tune({ d: 12 }) }).metrics
  const normal = simulate({ test: 'propwash' }).metrics
  assert.ok(low.peakDeg > normal.peakDeg * 2)
})

test('every test returns aligned recordings for the charts', () => {
  for (const t of TESTS) {
    const r = simulate({ test: t.id })
    const n = r.t.length
    for (const key of ['setpoint', 'angle', 'rate', 'p', 'i', 'd', 'u', 'torque']) assert.equal(r[key].length, n, key)
    assert.ok(n > 300)
    assert.ok(r.angle.every(Number.isFinite))
  }
})
