import { test } from 'node:test'
import assert from 'node:assert/strict'
import { LESSONS, lessonGoals } from './lessons.js'
import { runChecks } from './checks.js'
import { createStore, emptyWorkspace, cleanWorkspace, encodeBuild, decodeBuild } from './workspaces.js'

const asWires = (list) => list.map((w, i) => ({ id: `w${i}`, a: w.a, b: w.b }))
const finished = (lesson) => asWires(lesson.solutionIsComplete ? lesson.solution : [...lesson.prewired, ...lesson.solution])
const passes = (lesson, wires) => {
  const r = runChecks(lesson.nodes, wires)
  return lessonGoals(lesson).every((g) => r.goals[g])
}

for (const lesson of LESSONS) {
  test(`lesson "${lesson.id}" starts unfinished and can be finished`, () => {
    assert.equal(passes(lesson, asWires(lesson.prewired)), false, 'the lesson must not start finished')
    const r = runChecks(lesson.nodes, finished(lesson))
    assert.equal(r.faults, false, JSON.stringify(r.items.filter((i) => i.level === 'critical')))
    assert.ok(passes(lesson, finished(lesson)), `goals not met: ${lessonGoals(lesson).filter((g) => !r.goals[g])}`)
    assert.ok(lesson.hints.length >= 2)
    assert.ok(lesson.tasks.length >= 2)
  })
}

test('every wire in every lesson joins two pads of placed parts', () => {
  for (const lesson of LESSONS) {
    const clean = cleanWorkspace({ nodes: lesson.nodes, wires: asWires([...lesson.prewired, ...lesson.solution]) })
    assert.equal(clean.nodes.length, lesson.nodes.length, lesson.id)
    assert.equal(clean.wires.length, lesson.prewired.length + lesson.solution.length, `${lesson.id} has a wire to a pad that does not exist`)
  }
})

const memory = () => {
  const map = new Map()
  return { getItem: (k) => map.get(k) ?? null, setItem: (k, v) => void map.set(k, v), map }
}

test('workspaces are saved, listed, renamed and removed', () => {
  const store = createStore(memory())
  const ws = { ...emptyWorkspace('First'), nodes: [{ id: 'esc', type: 'esc', x: 0, y: 0 }] }
  store.putFree(ws)
  store.putFree({ ...emptyWorkspace('Second') })
  assert.equal(store.listFree().length, 2)
  assert.equal(store.getFree(ws.id).name, 'First')
  store.putFree({ ...ws, name: 'Renamed' })
  assert.equal(store.getFree(ws.id).name, 'Renamed')
  store.removeFree(ws.id)
  assert.equal(store.getFree(ws.id), null)
})

test('lesson progress keeps the best time and the stars', () => {
  const store = createStore(memory())
  assert.deepEqual(store.recordAttempt('power', { passed: false, ms: 5000 }), { attempts: 1, done: false, bestMs: null, stars: 0 })
  const second = store.recordAttempt('power', { passed: true, ms: 90000 })
  assert.equal(second.done, true)
  assert.equal(second.stars, 2)
  const third = store.recordAttempt('power', { passed: true, ms: 40000 })
  assert.equal(third.bestMs, 40000)
  store.restartAttempts('power')
  const clean = store.recordAttempt('power', { passed: true, ms: 70000 })
  assert.equal(clean.stars, 3, 'a first-try finish after restarting earns three stars, and stars never go down')
  assert.equal(clean.bestMs, 40000)
})

test('the bench works when storage is blocked', () => {
  const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } }
  const store = createStore(blocked)
  store.putFree(emptyWorkspace())
  assert.equal(store.saving, false)
  assert.deepEqual(store.listFree(), [])
  assert.equal(createStore(null).saving, false)
})

test('data from another version or damaged data is ignored', () => {
  const m = memory()
  m.setItem('egire.bench.v1', JSON.stringify({ v: 99, free: { x: { id: 'x' } } }))
  assert.deepEqual(createStore(m).listFree(), [])
  m.setItem('egire.bench.v1', '{not json')
  assert.deepEqual(createStore(m).listFree(), [])
})

test('unknown parts and pads are dropped when a workspace loads', () => {
  const ws = cleanWorkspace({
    nodes: [{ id: 'a', type: 'esc', x: 1, y: 2 }, { id: 'b', type: 'flux-capacitor', x: 1, y: 2 }, { id: 'c', type: 'battery', x: 'no', y: 1 }],
    wires: [{ id: '1', a: 'a:batp', b: 'a:batn' }, { id: '2', a: 'a:nope', b: 'a:batn' }, { id: '3', a: 'a:batp', b: 'b:x' }],
  })
  assert.equal(ws.nodes.length, 1)
  assert.equal(ws.wires.length, 1)
})

test('a share link round trips a whole build', () => {
  const lesson = LESSONS.find((l) => l.id === 'full')
  const ws = { nodes: lesson.nodes, wires: finished(lesson) }
  const text = encodeBuild(ws)
  assert.match(text, /^[A-Za-z0-9_-]+$/)
  const back = decodeBuild(text)
  assert.equal(back.nodes.length, ws.nodes.length)
  assert.equal(back.wires.length, ws.wires.length)
  assert.equal(runChecks(back.nodes, back.wires).faults, false)
  assert.ok(runChecks(back.nodes, back.wires).goals.video)
})

test('a damaged share link is refused', () => {
  assert.equal(decodeBuild('nonsense'), null)
  assert.equal(decodeBuild(''), null)
  assert.equal(decodeBuild(Buffer.from(JSON.stringify({ v: 2, n: [], w: [] })).toString('base64url')), null)
})

import { tidyLayout } from './placement.js'
import { PART_BY_ID } from './catalog.js'

test('tidy layout places every part, none on top of another, and each motor beside its own output', () => {
  const lesson = LESSONS.find((l) => l.id === 'full')
  const wires = finished(lesson)
  const at = tidyLayout(lesson.nodes, wires)
  const boxes = lesson.nodes.map((n) => ({ id: n.id, x: at[n.id].x, y: at[n.id].y, w: PART_BY_ID[n.type].w, h: PART_BY_ID[n.type].h }))
  assert.equal(boxes.length, lesson.nodes.length)
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]
      const b = boxes[j]
      const overlap = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
      assert.equal(overlap, false, `${a.id} overlaps ${b.id}`)
    }
  }
  // m1 is wired to the M1 output, which sits at the bottom right
  assert.ok(at.m1.x > at.esc.x && at.m1.y > at.esc.y - 20)
  assert.ok(at.m4.x < at.esc.x && at.m4.y < at.m3.y)
})
