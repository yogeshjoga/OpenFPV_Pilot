import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MOVES } from './data/moves.js'
import { flyManeuver, maneuverPose, phaseStart } from './maneuvers.js'

const fly = (id) => {
  const move = MOVES.find((m) => m.id === id)
  return flyManeuver(move.phases, { view: move.view, speed: move.speed })
}
const last = (s) => s[s.length - 1]

test('every move has phases with words, a way to practise and a way it goes wrong', () => {
  assert.ok(MOVES.length >= 10)
  for (const m of MOVES) {
    assert.ok(['stunt', 'race'].includes(m.group), m.id)
    assert.ok(['side', 'top'].includes(m.view), m.id)
    assert.ok(m.phases.length >= 3, m.id)
    for (const p of m.phases) assert.ok(p.title && p.text && p.dur > 0, `${m.id} ${p.title}`)
    assert.ok(m.mistakes.length >= 2 && m.drill.length >= 2 && m.tip, m.id)
  }
})

test('the sticks stay inside their travel, and move smoothly from one phase to the next', () => {
  for (const m of MOVES) {
    const s = fly(m.id)
    for (const p of s) {
      for (const k of ['yaw', 'pitch', 'roll']) assert.ok(Math.abs(p.sticks[k]) <= 1.0001, `${m.id} ${k}`)
      assert.ok(p.sticks.throttle >= 0 && p.sticks.throttle <= 1, `${m.id} throttle`)
    }
    // no stick jumps by more than a quarter of its travel in one frame
    for (let i = 1; i < s.length; i += 1) {
      for (const k of ['throttle', 'yaw', 'pitch', 'roll']) assert.ok(Math.abs(s[i].sticks[k] - s[i - 1].sticks[k]) < 0.25, `${m.id} ${k} jumps at ${s[i].t.toFixed(2)}`)
    }
  }
})

test('time runs forward and every phase is reached', () => {
  for (const m of MOVES) {
    const s = fly(m.id)
    for (let i = 1; i < s.length; i += 1) assert.ok(s[i].t >= s[i - 1].t)
    const reached = new Set(s.map((p) => p.phase))
    assert.equal(reached.size, m.phases.length, m.id)
    assert.ok(phaseStart(s, 1).t > 0)
  }
})

test('a roll turns the drone once about its nose and does not change its path', () => {
  const s = fly('roll')
  assert.ok(Math.abs(last(s).roll - 360) < 0.5)
  assert.ok(Math.abs(last(s).y) < 0.01, 'flies level')
})

test('a flip turns the drone once about its side, and the front and back flip go opposite ways', () => {
  const front = last(fly('flip'))
  const back = last(fly('backflip'))
  // the nose has turned a whole circle: the same direction as at the start, plus or minus 360
  assert.ok(Math.abs(front.pitchUp - (-15 - 360)) < 12, `front ${front.pitchUp}`)
  assert.ok(Math.abs(back.pitchUp - (-15 + 360)) < 12, `back ${back.pitchUp}`)
})

test('a power loop turns the flight path a full circle and ends flying forward, near the height it began', () => {
  const s = fly('powerloop')
  assert.ok(Math.abs(last(s).heading - 360) < 0.5)
  assert.ok(Math.abs(last(s).y) < 4, `height ${last(s).y}`)
  const top = Math.max(...s.map((p) => p.y))
  assert.ok(top > 6, `the loop goes up ${top}`)
})

test('a Split-S ends going the other way and lower; an Immelmann ends going the other way and higher', () => {
  const split = fly('splits')
  const immel = fly('immelmann')
  assert.ok(Math.abs(last(split).heading + 180) < 0.5)
  assert.ok(last(split).y < -5)
  assert.ok(Math.abs(last(immel).heading - 180) < 0.5)
  assert.ok(last(immel).y > 3)
  // both end upright, which is a half roll plus a half loop
  assert.ok(Math.abs(last(split).roll - 180) < 0.5)
  assert.ok(Math.abs(last(immel).roll - 180) < 0.5)
})

test('a race circle turns a full 360 degrees to the left, banked left and rolling back to level', () => {
  const s = fly('racecircle')
  assert.ok(Math.abs(last(s).heading - 90 - 360) < 0.5)
  assert.ok(Math.min(...s.map((p) => p.roll)) < -60)
  assert.ok(Math.abs(last(s).roll) < 0.5)
})

test('a hairpin turns the drone through 180 degrees to the right, and slows for it', () => {
  const s = fly('hairpin')
  assert.ok(Math.abs(last(s).heading - (90 - 180)) < 0.5)
  const corner = s.filter((p) => p.phase === 2)
  assert.ok(Math.min(...corner.map((p) => p.speed)) < 8)
  assert.ok(Math.max(...s.map((p) => p.speed)) > 14)
})

test('a chicane goes left then right and ends on the original heading', () => {
  const s = fly('chicane')
  assert.ok(Math.abs(last(s).heading - 90) < 0.5)
  assert.ok(Math.max(...s.map((p) => p.heading)) > 140)
  assert.ok(Math.min(...s.map((p) => p.roll)) < -40 && Math.max(...s.map((p) => p.roll)) > 40)
})

test('a dive gate goes down and comes back out level', () => {
  const s = fly('divegate')
  assert.ok(Math.min(...s.map((p) => p.y)) < -10)
  assert.ok(Math.abs(last(s).heading) < 0.5)
})

test('the pose for the 3D drone: nose-down is positive, a side view stays on one spot, a top view turns with the heading', () => {
  const s = fly('powerloop')
  const mid = s[Math.floor(s.length / 2)]
  const pose = maneuverPose(mid, 'side')
  assert.equal(pose.yaw, 0)
  assert.ok(Number.isFinite(pose.pitch))
  const turn = fly('racecircle').find((p) => p.phase === 2)
  assert.notEqual(maneuverPose(turn, 'top').yaw, 0)
  assert.ok(maneuverPose(turn, 'top').roll < 0, 'banked to the left')
})
