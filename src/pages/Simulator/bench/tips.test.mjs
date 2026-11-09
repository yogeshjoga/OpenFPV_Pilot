import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PARTS, PART_BY_ID } from './catalog.js'
import { featureTip, padTip, partTip, wireTip } from './tips.js'
import { WIRE_LAYER, lookOf, toFlowEdges } from './flowModel.js'

const TONES = ['power', 'ground', 'signal', 'data', 'motor', 'plain']

test('every pad of every part says what it is, what it carries and what to connect it to', () => {
  for (const part of PARTS) {
    for (const pad of part.pads) {
      const tip = padTip(part, pad)
      const where = `${part.id}.${pad.id}`
      assert.ok(tip.title, `${where} has no title`)
      assert.ok(tip.badge, `${where} has no badge`)
      assert.ok(TONES.includes(tip.tone), `${where} has tone ${tip.tone}`)
      assert.ok(tip.rows.length >= 2, `${where} says too little`)
      for (const [heading, text] of tip.rows) assert.ok(heading && text && text.length > 8, `${where}: empty row ${heading}`)
    }
  }
})

test('the battery, motor and capacitor leads explain themselves', () => {
  const bat = padTip(PART_BY_ID.battery, PART_BY_ID.battery.pads.find((p) => p.id === 'pos'))
  assert.match(bat.title, /Battery \+/)
  assert.equal(bat.tone, 'power')
  assert.match(bat.rows.map((r) => r[1]).join(' '), /12 to 14 AWG/)
  const neg = padTip(PART_BY_ID.battery, PART_BY_ID.battery.pads.find((p) => p.id === 'neg'))
  assert.equal(neg.tone, 'ground')
  const motor = padTip(PART_BY_ID.motor, PART_BY_ID.motor.pads[0])
  assert.equal(motor.tone, 'motor')
  assert.match(motor.rows.map((r) => r[1]).join(' '), /Swapping two wires/)
  assert.equal(padTip(PART_BY_ID.capacitor, PART_BY_ID.capacitor.pads.find((p) => p.id === 'cn')).tone, 'ground')
})

test('the ESC and flight controller pads are told apart', () => {
  const esc = PART_BY_ID.esc
  const pad = (part, id) => padTip(part, part.pads.find((p) => p.id === id))
  assert.equal(pad(esc, 'batp').tone, 'power')
  assert.equal(pad(esc, 'batn').tone, 'ground')
  assert.match(pad(esc, 'capp').title, /capacitor/)
  assert.equal(pad(esc, 'm1a').tone, 'motor')
  assert.match(pad(esc, 'm1a').rows[0][1], /rear right/)
  assert.match(pad(esc, 'm4a').rows[0][1], /front left/)
  assert.equal(pad(esc, 'sig_m2').tone, 'signal')
  assert.match(pad(esc, 'sig_cur').title, /CUR/)
  assert.equal(pad(esc, 'sig_tlm').tone, 'data')
  const fc = PART_BY_ID.fc
  assert.equal(pad(fc, 'v9').tone, 'power')
  assert.match(pad(fc, 'v9').rows[0][1], /regulator/)
  assert.equal(pad(fc, 'u1_t').tone, 'data')
  assert.match(pad(fc, 'u1_t').rows.map((r) => r[1]).join(' '), /RX/)
  assert.match(pad(fc, 'cam_in').badge, /Camera video in/)
})

test('a pad that is particular to one maker says so, instead of guessing', () => {
  const part = PART_BY_ID['geprc-f405-8s']
  const odd = part.pads.find((p) => p.label === 'C1')
  assert.ok(odd)
  assert.equal(padTip(part, odd).badge, 'See the maker’s manual')
})

test('the parts on a board are explained', () => {
  for (const key of ['chip:MCU', 'chip:IMU', 'chip:FLASH', 'fet', 'coil', 'cap', 'usb', 'button', 'led', 'hole', 'ghost', 'module:BT', 'group:ESC', 'group:CAM', 'group:UART2', 'group:DJI']) {
    const tip = featureTip(key, PART_BY_ID.fc)
    assert.ok(tip && tip.title && tip.rows[0][1].length > 20, key)
  }
  assert.match(featureTip('chip:MCU', PART_BY_ID.esc).rows[0][1], /BLHeli|AM32/)
  assert.match(featureTip('chip:MCU', PART_BY_ID.fc).rows[0][1], /Betaflight/)
  assert.ok(partTip(PART_BY_ID.esc).rows[0][1])
})

test('a wire says what it carries and which wire to use', () => {
  const nodes = new Map([['bat', { id: 'bat', type: 'battery' }], ['esc', { id: 'esc', type: 'esc' }]])
  const look = lookOf(nodes, 'bat:pos', 'esc:batp')
  assert.equal(look.tip.tone, 'power')
  assert.equal(look.tip.title, 'Battery voltage wire')
  assert.match(look.tip.rows[0][1], /Battery \+ \(red lead\)/)
  assert.equal(typeof look.lane, 'number')
  const direct = wireTip({ padLabel: 'A', partName: 'x', tip: { tone: 'data', badge: 'd', rows: [['Carries', 'c'], ['Wire', 'w']] } }, { padLabel: 'B', partName: 'y', tip: { tone: 'plain', badge: 'p', rows: [['What it is', 'z']] } })
  assert.equal(direct.tone, 'data')
})

test('neighbouring pads give their wires different lanes', () => {
  const nodes = new Map([['esc', { id: 'esc', type: 'esc' }], ['fc', { id: 'fc', type: 'fc' }]])
  const lanes = ['sig_bat', 'sig_g', 'sig_cur', 'sig_tlm'].map((id) => lookOf(nodes, `fc:${id}`, `esc:${id}`).lane)
  assert.equal(new Set(lanes).size, lanes.length)
})

test('every wire is drawn above the parts', () => {
  const edges = toFlowEdges([{ id: 'a', type: 'battery' }, { id: 'b', type: 'esc' }], [{ id: 'w', a: 'a:pos', b: 'b:batp' }])
  assert.equal(edges[0].zIndex, WIRE_LAYER)
  assert.ok(WIRE_LAYER >= 1000, 'above a selected part')
})
