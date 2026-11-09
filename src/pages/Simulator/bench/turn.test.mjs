import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PART_BY_ID, exitOf, padAt } from './catalog.js'
import { motorTurns, withMotorTurns } from './placement.js'
import { flowFromModel } from './flowModel.js'

const motor = PART_BY_ID.motor
const wire2 = motor.pads.find((p) => p.id === 'w2') // the middle wire, straight below the middle of the motor
const node = (id, type, x, y, turn) => ({ id, type: 'part', position: { x, y }, data: { type, ...(turn ? { turn } : {}) } })

test('a turned part has its pads where the turn puts them', () => {
  const below = padAt(motor, wire2, false, 0)
  assert.equal(below.x, motor.w / 2)
  assert.ok(below.y > motor.h / 2)
  const quarter = padAt(motor, wire2, false, 90) // clockwise: what was below is now to the left
  assert.ok(quarter.x < motor.w / 2 && Math.abs(quarter.y - motor.h / 2) < 0.001)
  const back = padAt(motor, wire2, false, 270) // anticlockwise: what was below is now to the right
  assert.ok(back.x > motor.w / 2 && Math.abs(back.y - motor.h / 2) < 0.001)
  assert.ok(padAt(motor, wire2, false, 180).y < motor.h / 2)
})

test('the wires of a turned motor leave the way they now point', () => {
  assert.equal(exitOf('motor', 'w2', false, 0), 'bottom')
  assert.equal(exitOf('motor', 'w2', false, 90), 'left')
  assert.equal(exitOf('motor', 'w2', false, 270), 'right')
  assert.equal(exitOf('motor', 'w2', false, 180), 'top')
})

test('a motor faces the nearest ESC: wires pointing at it', () => {
  const nodes = [node('esc', 'esc', 400, 300), node('left', 'motor', 100, 300), node('right', 'motor', 800, 300), node('above', 'motor', 450, 0), node('below', 'motor', 450, 800)]
  const t = motorTurns(nodes)
  assert.equal(t.left, 270, 'to the left of the ESC: wires point right')
  assert.equal(t.right, 90, 'to the right of the ESC: wires point left')
  assert.equal(t.above, 0, 'above the ESC: wires point down')
  assert.equal(t.below, 180, 'below the ESC: wires point up')
  assert.equal(t.esc, undefined, 'only motors turn')
})

test('with two ESCs a motor faces the nearer one, and with none it stays as it is', () => {
  const two = [node('a', 'esc', 0, 0), node('b', 'esc', 2000, 0), node('m', 'motor', 1700, 100)]
  assert.equal(motorTurns(two).m, 270)
  assert.deepEqual(motorTurns([node('m', 'motor', 0, 0)]), {})
})

test('settled nodes keep their identity when nothing changes, and a model opens with its motors facing the ESC', () => {
  const nodes = withMotorTurns([node('esc', 'esc', 400, 300), node('m', 'motor', 100, 300)])
  assert.equal(nodes[1].data.turn, 270)
  assert.equal(withMotorTurns(nodes)[1], nodes[1])
  const flow = flowFromModel([{ id: 'esc', type: 'esc', x: 400, y: 300 }, { id: 'm', type: 'motor', x: 100, y: 300 }], [{ id: 'w', a: 'm:w1', b: 'esc:m4a' }], true)
  assert.equal(flow.nodes[1].data.turn, 270)
  assert.equal(flow.edges[0].data.from, 'right', 'the motor wire leaves toward the ESC')
})
