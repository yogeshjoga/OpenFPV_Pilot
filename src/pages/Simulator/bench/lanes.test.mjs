import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SLOT, corridorShift, shifted, slotOf, slotShift } from './lanes.js'

const edge = (id, source, sourceHandle, target, targetHandle) => ({ id, source, sourceHandle, target, targetHandle })

test('wires on one pad fan out side by side, centred on the pad', () => {
  assert.equal(slotShift(0, 1), 0)
  assert.deepEqual([slotShift(0, 2), slotShift(1, 2)], [-SLOT / 2, SLOT / 2])
  assert.deepEqual([0, 1, 2].map((i) => slotShift(i, 3)), [-SLOT, 0, SLOT])
})

test('the wires on a pad are found from either end', () => {
  const edges = [edge('a', 'bat', 'pos', 'esc', 'batp'), edge('b', 'cap', 'cp', 'esc', 'batp'), edge('c', 'bat', 'neg', 'esc', 'batn')]
  assert.deepEqual(slotOf(edges, 'a', 'esc', 'batp'), { index: 0, count: 2 })
  assert.deepEqual(slotOf(edges, 'b', 'esc', 'batp'), { index: 1, count: 2 })
  assert.deepEqual(slotOf(edges, 'c', 'esc', 'batn'), { index: 0, count: 1 })
  assert.deepEqual(slotOf(edges, 'a', 'bat', 'pos'), { index: 0, count: 1 })
})

test('neighbouring wires get different corridors', () => {
  const shifts = Array.from({ length: 9 }, (_, rank) => corridorShift(rank))
  assert.equal(new Set(shifts).size, 9)
  for (let i = 1; i < shifts.length; i++) assert.ok(Math.abs(shifts[i] - shifts[i - 1]) >= SLOT)
})

test('a slot moves a wire across the way it leaves', () => {
  assert.deepEqual(shifted(100, 50, 'bottom', 11), [111, 50])
  assert.deepEqual(shifted(100, 50, 'top', -11), [89, 50])
  assert.deepEqual(shifted(100, 50, 'left', 11), [100, 61])
  assert.deepEqual(shifted(100, 50, 'right', 0), [100, 50])
})
