import { test } from 'node:test'
import assert from 'node:assert/strict'
import { runChecks } from './checks.js'
import { summarize } from './summary.js'
import { LESSON_BY_ID } from './lessons.js'

const wiresOf = (list) => list.map((w, i) => ({ id: `w${i}`, a: w.a, b: w.b }))
const row = (rows, id) => rows.find((r) => r.id === id)

test('a finished build has every part ok', () => {
  const lesson = LESSON_BY_ID.full
  const wires = wiresOf(lesson.solution)
  const rows = summarize(lesson.nodes, wires, runChecks(lesson.nodes, wires))
  for (const r of rows) assert.equal(r.status, 'ok', `${r.id}: ${r.status} ${JSON.stringify(r.notes.map((n) => n.title))}`)
  assert.equal(row(rows, 'm1').connected, 3)
  assert.equal(row(rows, 'm1').total, 3)
  assert.ok(row(rows, 'fc').wires >= 8)
})

test('a motor with a loose wire is open, and counts 2 of 3', () => {
  const lesson = LESSON_BY_ID.motors
  const wires = wiresOf([...lesson.prewired, ...lesson.solution]).filter((w) => w.a !== 'm2:w3')
  const rows = summarize(lesson.nodes, wires, runChecks(lesson.nodes, wires))
  assert.equal(row(rows, 'm2').status, 'open')
  assert.equal(row(rows, 'm2').connected, 2)
  assert.equal(row(rows, 'm1').status, 'ok')
})

test('a part wired wrongly needs attention, not just more work', () => {
  const lesson = LESSON_BY_ID.fix
  const wires = wiresOf(lesson.prewired)
  const rows = summarize(lesson.nodes, wires, runChecks(lesson.nodes, wires))
  assert.equal(row(rows, 'cap').status, 'attention')
  assert.equal(row(rows, 'rx').status, 'attention')
})

test('nothing connected is open, and there is no verdict without a report', () => {
  const nodes = [{ id: 'esc', type: 'esc' }]
  assert.equal(summarize(nodes, [], runChecks(nodes, []))[0].status, 'open')
  assert.equal(summarize(nodes, [], null)[0].status, 'unchecked')
})
