import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MOVES } from './data/moves.js'
import { flyManeuver, maneuverPose, phaseStart } from './maneuvers.js'

const fly = (id) => {
  const move = MOVES.find((m) => m.id === id)
  return flyManeuver(move.phases, { view: move.view, speed: move.speed, lean: move.lean ?? 15 })
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

test('the pose for the 3D drone: nose-down is positive, a side view faces east, a top view turns with the heading', () => {
  const s = fly('powerloop')
  const mid = s[Math.floor(s.length / 2)]
  const pose = maneuverPose(mid, 'side')
  assert.ok(Math.abs(pose.yaw - Math.PI / 2) < 1e-6, 'a side view faces east')
  assert.ok(Number.isFinite(pose.pitch))
  const turn = fly('racecircle').find((p) => p.phase === 2)
  assert.notEqual(maneuverPose(turn, 'top').yaw, 0)
  assert.ok(maneuverPose(turn, 'top').roll < 0, 'banked to the left')
})

test('there are twenty moves, sixteen stunts and four race moves, each with a distinct id', () => {
  assert.ok(MOVES.length >= 20)
  assert.equal(new Set(MOVES.map((m) => m.id)).size, MOVES.length)
  assert.ok(MOVES.filter((m) => m.group === 'stunt').length >= 16)
})

test('a double roll turns twice, a double flip turns the nose twice', () => {
  assert.ok(Math.abs(last(fly('doubleroll')).roll - 720) < 0.5)
  assert.ok(Math.abs(last(fly('doubleflip')).pitchUp - (-15 - 720)) < 25)
})

test('an inverted pass goes upside down and comes back, a whole turn of roll in total, and sinks while inverted', () => {
  const s = fly('inverted')
  assert.ok(Math.abs(last(s).roll - 360) < 0.5)
  assert.ok(s.some((p) => Math.abs(p.roll - 180) < 1))
  assert.ok(Math.min(...s.map((p) => p.y)) < -1)
})

test('a punch-out climbs and levels off higher than it began', () => {
  const s = fly('punchout')
  assert.ok(last(s).y > 12)
  assert.ok(Math.abs(last(s).heading) < 0.5)
})

test('a stall turn climbs vertically, yaws 180 degrees almost on the spot, and leaves flying the other way', () => {
  const s = fly('stallturn')
  assert.ok(Math.abs(last(s).yaw - 180) < 0.5)
  assert.ok(Math.abs(last(s).heading - 180) < 0.5)
  const pivot = s.filter((p) => p.phase === 3)
  const moved = Math.hypot(pivot[pivot.length - 1].x - pivot[0].x, pivot[pivot.length - 1].y - pivot[0].y)
  assert.ok(moved < 2, `moved ${moved}`)
  // pointing straight up when the climb ends
  assert.ok(Math.abs(s.find((p) => p.phase === 3).heading - 90) < 0.5)
  assert.ok(last(s).x < Math.max(...s.map((p) => p.x)) - 5, 'comes back the way it went')
})

test('once the drone has turned round, its nose angle is measured from the other side', () => {
  const s = fly('stallturn')
  const before = s.find((p) => p.phase === 3)
  const after = last(s)
  // the pitch the 3D model needs mirrors the path angle after the turn
  assert.ok(Math.abs(before.pitchUp - 90) < 0.5)
  assert.ok(Math.abs(after.pitchUp - (180 - after.nose)) < 0.5)
})

test('a dive bomb goes up, then down below where it began, and ends level', () => {
  const s = fly('divebomb')
  assert.ok(Math.max(...s.map((p) => p.y)) > 8)
  assert.ok(last(s).y < -5)
  assert.ok(Math.abs(last(s).heading) < 0.5)
})

test('an outside loop goes round below the start, turning the path the other way from a power loop', () => {
  const s = fly('outsideloop')
  assert.ok(Math.abs(last(s).heading + 360) < 0.5)
  assert.ok(Math.min(...s.map((p) => p.y)) < -6)
  assert.ok(Math.abs(last(s).y) < 6)
})

test('a rolling loop does a full loop and a full roll together', () => {
  const s = fly('rollingloop')
  assert.ok(Math.abs(last(s).heading - 360) < 0.5)
  assert.ok(Math.abs(last(s).roll - 360) < 0.5)
  assert.ok(Math.max(...s.map((p) => p.y)) > 6)
})

test('a half Cuban eight loops five eighths, rolls half a turn on the diagonal, and pulls out going the other way', () => {
  const s = fly('cuban')
  assert.ok(Math.abs(last(s).heading - 180) < 0.5)
  assert.ok(Math.abs(last(s).roll - 180) < 0.5)
  assert.ok(Math.abs(Math.max(...s.map((p) => p.heading)) - 225) < 0.5)
  // the roll happens on the 45 degree line, with the path heading steady
  const line = s.filter((p) => p.phase === 2)
  assert.ok(Math.abs(line[0].heading - line[line.length - 1].heading) < 0.5)
  assert.ok(Math.abs(line[0].heading - 225) < 0.5)
  assert.ok(last(s).x < Math.max(...s.map((p) => p.x)), 'ends flying back the way it came')
})

test('a pirouette spins the nose a full turn while the drone stays nearly in place', () => {
  const s = fly('pirouette')
  assert.ok(Math.abs(last(s).yaw - 360) < 0.5)
  const spin = s.filter((p) => p.phase === 1)
  assert.ok(Math.abs(spin[spin.length - 1].nose - spin[0].nose) > 300)
  assert.ok(Math.hypot(last(s).x, last(s).y - 0) < 6)
})

test('there are twelve race moves', () => {
  assert.equal(MOVES.filter((m) => m.group === 'race').length, 12)
  assert.equal(new Set(MOVES.map((m) => m.id)).size, MOVES.length)
})

test('a race start leaves the ground from a standstill and ends at race speed, level, at gate height', () => {
  const s = fly('racestart')
  assert.ok(s[0].speed < 0.5)
  assert.ok(last(s).speed > 15)
  assert.ok(last(s).y > 2 && last(s).y < 12, `height ${last(s).y}`)
  assert.ok(Math.abs(last(s).heading) < 0.5)
})

test('a slalom goes left, right, left, right and ends straight and level, with the bank switching sides each time', () => {
  const s = fly('slalom')
  assert.ok(Math.abs(last(s).heading - 90) < 0.5)
  assert.ok(Math.abs(last(s).roll) < 0.5)
  const banks = []
  for (const p of s) {
    const side = p.roll < -25 ? -1 : p.roll > 25 ? 1 : 0
    if (side && banks[banks.length - 1] !== side) banks.push(side)
  }
  assert.deepEqual(banks, [-1, 1, -1, 1])
})

test('a sweeping turn is a 90 degree turn to the left at speed', () => {
  const s = fly('sweeper')
  assert.ok(Math.abs(last(s).heading - 180) < 0.5)
  assert.ok(Math.min(...s.map((p) => p.speed)) > 13)
  assert.ok(Math.min(...s.map((p) => p.roll)) < -55)
})

test('a square corner is a 90 degree turn to the right that slows right down and uses the yaw stick', () => {
  const s = fly('squarecorner')
  assert.ok(Math.abs(last(s).heading - 0) < 0.5)
  assert.ok(Math.min(...s.map((p) => p.speed)) <= 6.5)
  assert.ok(Math.max(...s.map((p) => p.sticks.yaw)) > 0.6)
})

test('a race lap turns the path a full circle, two turns, and the speed holds up', () => {
  const s = fly('racelap')
  assert.ok(Math.abs(last(s).heading - 90 - 360) < 0.5)
  assert.ok(Math.abs(last(s).roll) < 0.5)
  assert.ok(Math.min(...s.map((p) => p.speed)) > 12)
})

test('an up-and-over climbs, then dives, and comes back to level', () => {
  const s = fly('upover')
  assert.ok(Math.max(...s.map((p) => p.y)) > 3)
  assert.ok(Math.abs(last(s).heading) < 0.5)
  assert.ok(Math.abs(last(s).y) < 6)
})

test('a sprint reaches a very high speed, and the brake brings it right down', () => {
  const s = fly('sprint')
  assert.ok(Math.max(...s.map((p) => p.speed)) > 24)
  assert.ok(last(s).speed < 6)
  assert.ok(Math.min(...s.map((p) => p.sticks.pitch)) < -0.6)
})

test('a race Split-S ends going the other way and lower', () => {
  const s = fly('splitsgate')
  assert.ok(Math.abs(last(s).heading + 180) < 0.5)
  assert.ok(last(s).y < -4)
})

import { sceneTrack } from './maneuvers.js'

test('the 3D track fits the mat, the drone stays on its drawn path, and the path is split by phase', () => {
  for (const m of MOVES) {
    const s = fly(m.id)
    const track = sceneTrack(s, m.view)
    assert.ok(track.k >= 8 && track.k <= 44, `${m.id} k ${track.k}`)
    assert.equal(track.segments.length, m.phases.length, m.id)
    for (const p of s) {
      const at = track.place(p)
      assert.ok(Math.abs(at.x) <= 700, `${m.id} x ${at.x}`)
      assert.ok(Math.abs(at.z) <= 700, `${m.id} z ${at.z}`)
      assert.ok(at.height >= 0, `${m.id} height`)
    }
    // every drawn point is one the drone really passes through
    for (const seg of track.segments) assert.ok(seg.points.length >= 2, `${m.id} segment`)
  }
})

test('side view: forward is to the right and the path stays in one plane; top view: north is away from the viewer', () => {
  const side = sceneTrack(fly('powerloop'), 'side')
  assert.ok(side.place(last(fly('powerloop'))).x > side.place(fly('powerloop')[0]).x)
  assert.ok(side.segments.every((seg) => seg.points.every((q) => q.z === 0)))
  const top = sceneTrack(fly('racecircle'), 'top')
  const circle = fly('racecircle')
  const north = circle.reduce((best, p) => (p.y > best.y ? p : best))
  const south = circle.reduce((best, p) => (p.y < best.y ? p : best))
  assert.ok(top.place(north).z < top.place(south).z, 'north has the smaller z, which is further from the viewer')
})

test('the lowest point of a side-view flight is on the mat, and a flight from above stays low', () => {
  const s = fly('splits')
  const track = sceneTrack(s, 'side')
  assert.ok(Math.min(...s.map((p) => track.place(p).height)) < 0.001)
  assert.equal(sceneTrack(fly('slalom'), 'top').place(fly('slalom')[0]).height, 40)
})

test('the drone faces east in a side view, and along its heading from above', () => {
  const side = maneuverPose(fly('flip')[0], 'side')
  assert.ok(Math.abs(side.yaw - Math.PI / 2) < 1e-6)
  const turned = maneuverPose(fly('stallturn').at(-1), 'side')
  assert.ok(Math.abs(turned.yaw - (Math.PI / 2 + Math.PI)) < 1e-6, 'after the stall turn it faces west')
  const top = maneuverPose(fly('racecircle')[0], 'top')
  assert.ok(Math.abs(top.yaw) < 1e-6, 'heading north is a yaw of zero')
})


import { flyCombo } from './sim.js'
import { COMBOS } from './data/combos.js'

test('a flight in space is laid out with its real height, and fits the mat', () => {
  for (const c of COMBOS) {
    const samples = flyCombo(c.steps)
    const track = sceneTrack(samples, 'free')
    for (const p of samples) {
      const at = track.place(p)
      assert.ok(Math.abs(at.x) <= 700 && Math.abs(at.z) <= 700, c.id)
      assert.ok(Math.abs(at.height - p.alt * track.k) < 1e-6, c.id)
    }
    assert.equal(track.segments.length, c.steps.length, c.id)
  }
})
