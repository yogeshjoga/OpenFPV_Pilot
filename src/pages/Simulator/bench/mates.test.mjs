import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matesFor } from './mates.js'

const nodes = ['battery:bat', 'esc:esc', 'fc:fc', 'motor:m1', 'receiver:rx', 'capacitor:cap', 'camera:cam', 'vtx:vtx'].map((s) => {
  const [type, id] = s.split(':')
  return { id, type }
})
const pads = (m, id) => (m[id] ?? []).sort()

test('the battery leads fit the battery pads only', () => {
  const plus = matesFor(nodes, 'bat', 'pos')
  assert.deepEqual(pads(plus, 'esc'), ['batp', 'capp', 'sig_bat'])
  assert.ok(pads(plus, 'fc').includes('sig_bat'))
  assert.equal(pads(plus, 'fc').includes('u1_5v'), false, 'battery voltage does not fit a 5V pad')
  assert.deepEqual(pads(matesFor(nodes, 'bat', 'neg'), 'esc'), ['batn', 'capn', 'sig_g'])
})

test('a motor wire fits the twelve motor pads', () => {
  assert.equal(pads(matesFor(nodes, 'm1', 'w1'), 'esc').length, 12)
})

test('the receiver: 5V to a 5V pad, TX to R, RX to T', () => {
  assert.deepEqual(pads(matesFor(nodes, 'rx', 'r5'), 'fc'), ['cam_5v', 'u1_5v', 'u3_5v'])
  assert.deepEqual(pads(matesFor(nodes, 'rx', 'rt'), 'fc'), ['u1_r', 'u3_r'])
  assert.deepEqual(pads(matesFor(nodes, 'rx', 'rr'), 'fc'), ['u1_t', 'u3_t'])
})

test('the capacitor and the video wires', () => {
  assert.deepEqual(pads(matesFor(nodes, 'cap', 'cp'), 'esc'), ['batp', 'capp', 'sig_bat'])
  assert.deepEqual(pads(matesFor(nodes, 'cam', 'cv'), 'fc'), ['cam_in'])
  assert.deepEqual(pads(matesFor(nodes, 'cam', 'cv'), 'vtx'), ['vv'])
  assert.deepEqual(pads(matesFor(nodes, 'vtx', 'vp'), 'fc'), ['cam_5v', 'u1_5v', 'u3_5v', 'v9'])
})

test('flight controller and ESC signals meet on the same name', () => {
  assert.deepEqual(pads(matesFor(nodes, 'fc', 'sig_m2'), 'esc'), ['sig_m2'])
  assert.deepEqual(pads(matesFor(nodes, 'fc', 'sig_bat'), 'esc'), ['batp', 'capp', 'sig_bat'])
})
