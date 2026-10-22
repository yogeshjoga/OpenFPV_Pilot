import { test } from 'node:test'
import assert from 'node:assert/strict'
import { GENERIC_PARTS, PARTS, PART_BY_ID, exitOf, onFace, padAt } from './catalog.js'
import { BRAND_PARTS } from './boards/index.js'
import { semantics } from './boards/semantics.js'
import { buildNets } from './netlist.js'
import { runChecks } from './checks.js'
import { findParts, groupByBrand } from './browse.js'
import { fromFlow, lookOf, redrawEdges, toFlowEdges, toFlowNodes } from './flowModel.js'
import { cleanWorkspace, decodeBuild, encodeBuild } from './workspaces.js'
import { canMate, matesFor } from './mates.js'
import { tidyLayout } from './placement.js'

const wire = (a, b) => ({ a: a.replace('.', ':'), b: b.replace('.', ':') })
const node = (id, type) => ({ id, type })
const FC = 'geprc-f405-hd-v3'
const FC2 = 'geprc-f722-bt-hd-v3'
const ESC = 'geprc-taker-h65'

test('the pad label says what a pad is', () => {
  assert.deepEqual(semantics('GND', { kind: 'fc', group: 'LED' }), { rail: 'gnd' })
  assert.deepEqual(semantics('5V', { kind: 'fc', group: 'UART2' }), { rail: '5v', source: true })
  assert.deepEqual(semantics('5V', { kind: 'receiver', group: 'x' }), { rail: '5v' })
  assert.deepEqual(semantics('T2', { kind: 'fc', group: 'UART2' }), { uart: { n: 2, dir: 'tx' } })
  assert.deepEqual(semantics('R1', { kind: 'fc', group: 'DJI' }), { uart: { n: 1, dir: 'rx' } })
  assert.deepEqual(semantics('BAT', { kind: 'fc', group: 'ESC' }), { rail: 'vbat', signal: 'bat' })
  assert.deepEqual(semantics('GND', { kind: 'esc', group: 'ESC' }), { rail: 'gnd', signal: 'g' })
  assert.deepEqual(semantics('M3', { kind: 'fc', group: 'ESC' }), { signal: 'm3' })
  assert.deepEqual(semantics('M3', { kind: 'fc', group: 'BACK' }), {}, 'a back pad is not part of the ESC link')
  assert.equal(semantics('VTX', { kind: 'fc', group: 'VTX' }).video, 'vtx-out')
  assert.equal(semantics('CAM', { kind: 'fc', group: 'CAM' }).video, 'cam-in')
  assert.equal(semantics('RX5', { kind: 'fc', group: 'ESC' }).signal, 'tlm')
  assert.equal(semantics('NC', { kind: 'esc', group: 'ESC' }).signal, undefined)
})

test('every brand part is a complete part', () => {
  assert.ok(BRAND_PARTS.length >= 4)
  for (const p of BRAND_PARTS) {
    for (const key of ['id', 'kind', 'brand', 'model', 'name', 'category', 'blurb', 'source', 'w', 'h']) assert.ok(p[key], `${p.id} has no ${key}`)
    assert.ok(p.specs.length > 0, p.id)
    assert.equal(p.brand, 'GEPRC')
    assert.equal(PART_BY_ID[p.id], p)
    // a pad is on a known face, and the part has something to see on each face
    for (const pad of p.pads) assert.ok(['front', 'back', undefined].includes(pad.face), `${p.id}.${pad.id}`)
    for (const flip of [false, true]) assert.ok(p.pads.some((pad) => pad.face !== (flip ? 'front' : 'back') && onFace(pad, flip)), `${p.id} shows no pads when flip is ${flip}`)
    // pads on the same face are far enough apart to point at one of them
    for (const flip of [false, true]) {
      const here = p.pads.filter((pad) => onFace(pad, flip))
      for (let i = 0; i < here.length; i++) {
        for (let j = i + 1; j < here.length; j++) {
          const d = Math.hypot(here[i].x - here[j].x, here[i].y - here[j].y)
          assert.ok(d >= 15, `${p.id}: ${here[i].id} and ${here[j].id} are ${d.toFixed(1)} apart`)
        }
      }
    }
  }
})

test('every part keeps its generic pads and gains a kind, brand and category', () => {
  for (const p of GENERIC_PARTS) {
    assert.equal(p.brand, 'Generic')
    assert.ok(p.kind && p.category, p.id)
  }
  assert.deepEqual([...new Set(PARTS.map((p) => p.brand))].sort(), ['GEPRC', 'Generic'])
})

test('a pad swings to the other side when the part is turned over', () => {
  const fc = PART_BY_ID[FC]
  const front = fc.pads.find((p) => p.id === 'ESC.M1')
  assert.equal(onFace(front, false), true)
  assert.equal(onFace(front, true), false)
  assert.deepEqual(padAt(fc, front, false), { x: front.x, y: front.y })
  assert.deepEqual(padAt(fc, front, true), { x: fc.w - front.x, y: front.y })
  // the connector is on the left edge seen from the front, and on the right edge seen from the back
  assert.equal(exitOf(FC, 'ESC.M1', false), 'left')
  assert.equal(exitOf(FC, 'ESC.M1', true), 'right')
  const back = fc.pads.find((p) => p.id === 'B.BZ-')
  assert.equal(onFace(back, true), true)
  assert.equal(onFace(back, false), false)
  // a wire lead (a motor) is on both
  assert.equal(onFace(PART_BY_ID.motor.pads[0], true), true)
})

test('the same copper on the front and the back of a flight controller is one net', () => {
  const nodes = [node('fc', FC)]
  const { netOf } = buildNets(nodes, [])
  assert.equal(netOf('fc', 'ESC.M1'), netOf('fc', 'B.M1'))
  assert.equal(netOf('fc', 'ESC.GND'), netOf('fc', 'LED.GND'))
  assert.equal(netOf('fc', 'ESC.GND'), netOf('fc', 'B.GND-2'))
  assert.equal(netOf('fc', 'UART2.R2'), netOf('fc', 'B.R2'))
  assert.notEqual(netOf('fc', 'ESC.M1'), netOf('fc', 'ESC.M2'))
  assert.notEqual(netOf('fc', 'ESC.GND'), netOf('fc', 'ESC.BAT'))
  // the 12 V pads on the F405 are one rail; the F722 has 9 V instead
  assert.equal(netOf('fc', 'DJI.12V'), netOf('fc', 'VTX.12V'))
  const f722 = buildNets([node('fc', FC2)], [])
  assert.equal(f722.netOf('fc', 'DJI.9V'), f722.netOf('fc', 'B.9V'))
  // VSW is the battery voltage, switched
  assert.equal(f722.netOf('fc', 'ESC.BAT'), f722.netOf('fc', 'B.VSW'))
})

test('on the ESC the three pads of a motor output are not joined to each other or to the connector', () => {
  const { netOf } = buildNets([node('esc', ESC)], [])
  assert.notEqual(netOf('esc', 'm1a'), netOf('esc', 'm1b'))
  assert.notEqual(netOf('esc', 'm1a'), netOf('esc', 'ESC.M1'))
  assert.equal(netOf('esc', 'batp'), netOf('esc', 'capp'))
  assert.equal(netOf('esc', 'batp'), netOf('esc', 'ESC.BAT'))
  assert.equal(netOf('esc', 'batn'), netOf('esc', 'ESC.GND'))
})

// A whole build with GEPRC boards. Every wire goes to a pad the real board has.
const motorWires = (m, group) => ['a', 'b', 'c'].map((c, i) => wire(`${m}.w${i + 1}`, `esc.${group}${c}`))
const stack = (fc, extra = {}) => ({
  nodes: [node('bat', 'battery'), node('esc', ESC), node('cap', 'capacitor'), node('fc', fc), node('rx', 'receiver'), node('cam', 'camera'), node('vtx', 'vtx'), node('gps', 'gps'),
    node('m1', 'motor'), node('m2', 'motor'), node('m3', 'motor'), node('m4', 'motor')],
  wires: [
    wire('bat.pos', 'esc.batp'), wire('bat.neg', 'esc.batn'), wire('cap.cp', 'esc.capp'), wire('cap.cn', 'esc.capn'),
    ...motorWires('m1', 'm1'), ...motorWires('m2', 'm2'), ...motorWires('m3', 'm3'), ...motorWires('m4', 'm4'),
    // the 8-pin link: connector pins meet the pins of the same name (the ESC has NC where the FC has the telemetry line)
    ...['CUR', 'M4', 'M3', 'M2', 'M1', 'BAT', 'GND'].map((n) => wire(`fc.ESC.${n}`, `esc.ESC.${n}`)),
    wire('rx.r5', 'fc.UART2.5V'), wire('rx.rg', 'fc.UART2.GND'), wire('rx.rt', 'fc.UART2.R2'), wire('rx.rr', 'fc.UART2.T2'),
    wire('cam.cpw', 'fc.CAM.5V'), wire('cam.cg', 'fc.CAM.GND'), wire('cam.cv', 'fc.CAM.CAM'),
    wire('vtx.vp', 'fc.UART2.5V'), wire('vtx.vg', 'fc.VTX.GND'), wire('vtx.vv', 'fc.VTX.VTX'),
    wire('gps.g5', 'fc.B.5V'), wire('gps.gg', 'fc.B.GND'), wire('gps.gt', 'fc.B.R3'), wire('gps.gr', 'fc.B.T3'),
  ],
  ...extra,
})
const titles = (r, level) => r.items.filter((i) => i.level === level).map((i) => i.title)

for (const fc of [FC, FC2]) {
  test(`a GEPRC stack (${fc}) wired correctly passes every check`, () => {
    const b = stack(fc)
    const r = runChecks(b.nodes, b.wires)
    assert.equal(r.faults, false, JSON.stringify(r.items.filter((i) => i.level === 'critical')))
    assert.deepEqual(titles(r, 'warn'), [])
    for (const [goal, ok] of Object.entries(r.goals)) assert.ok(ok, `goal ${goal}`)
    assert.equal(Object.keys(r.spins).length, 4)
    assert.equal(r.powered, true)
  })
}

test('a GEPRC stack still works when the wires go to pads on the back of the flight controller', () => {
  const b = stack(FC)
  // the receiver's RX on a back pad instead of the connector: same copper
  b.wires = b.wires.map((w) => ({ a: w.a === 'fc:UART2.T2' ? 'fc:B.T2' : w.a, b: w.b === 'fc:UART2.T2' ? 'fc:B.T2' : w.b }))
  const r = runChecks(b.nodes, b.wires)
  assert.equal(r.faults, false)
  assert.ok(r.goals.receiver)
})

test('GEPRC wiring mistakes are caught like generic ones', () => {
  // M1 and M2 swapped on the link
  const crossed = stack(FC)
  crossed.wires = crossed.wires.map((w) => (w.a === 'fc:ESC.M1' ? { ...w, b: 'esc:ESC.M2' } : w))
  const r1 = runChecks(crossed.nodes, crossed.wires)
  assert.equal(r1.goals['fc-esc'], false)
  assert.ok(titles(r1, 'warn').some((t) => /crossed/.test(t)))
  // battery voltage on a 5 V pad
  const burn = stack(FC)
  burn.wires.push(wire('fc.ESC.BAT', 'fc.UART2.5V'))
  assert.ok(runChecks(burn.nodes, burn.wires).faults)
  // the receiver's 5V on the battery pad of the ESC
  const rx = stack(FC)
  rx.wires = rx.wires.map((w) => (w.a === 'rx:r5' ? { ...w, b: 'esc:batp' } : w))
  const r2 = runChecks(rx.nodes, rx.wires)
  assert.ok(r2.smoke.includes('rx'))
  // a flight controller on its own has nothing to check yet
  assert.equal(runChecks([node('fc', FC)], []).faults, false)
})

test('Assisted mode lights up the right pads on a GEPRC board', () => {
  const nodes = [node('fc', FC), node('esc', ESC), node('rx', 'receiver'), node('m1', 'motor')]
  const lit = matesFor(nodes, 'rx', 'rt')
  assert.ok(lit.fc.includes('UART2.R2') && lit.fc.includes('B.R2'), 'the receiver TX meets an R pad')
  assert.equal(lit.fc.includes('UART2.T2'), false)
  assert.ok(matesFor(nodes, 'rx', 'r5').fc.includes('CAM.5V'))
  assert.ok(matesFor(nodes, 'm1', 'w1').esc.includes('m1a'))
  const a = { nodeId: 'fc', type: FC, pad: PART_BY_ID[FC].pads.find((p) => p.id === 'ESC.BAT') }
  const b = { nodeId: 'esc', type: ESC, pad: PART_BY_ID[ESC].pads.find((p) => p.id === 'ESC.BAT') }
  assert.equal(canMate(a, b), true)
})

test('a part that is turned over is remembered, in saved builds and in share links', () => {
  const model = { nodes: [{ id: 'a', type: FC, x: 5, y: 6, flip: true }, { id: 'b', type: ESC, x: 500, y: 6 }], wires: [{ id: 'w', a: 'a:B.M1', b: 'b:m1a' }] }
  const clean = cleanWorkspace(model)
  assert.equal(clean.nodes[0].flip, true)
  const back = decodeBuild(encodeBuild(model))
  assert.equal(back.nodes[0].flip, true)
  assert.equal(back.nodes[1].flip, undefined)
  assert.equal(back.wires.length, 1)
  const flow = toFlowNodes(model.nodes, true)
  assert.equal(flow[0].data.flip, true)
  assert.deepEqual(fromFlow(flow, toFlowEdges(model.nodes, model.wires)).nodes, model.nodes)
  // an old link without the flag still opens
  assert.equal(decodeBuild(Buffer.from(JSON.stringify({ v: 1, n: [[FC, 1, 2]], w: [] })).toString('base64url')).nodes[0].flip, undefined)
})

test('wires follow the side a part faces', () => {
  const nodes = [{ id: 'fc', type: FC }, { id: 'esc', type: ESC }]
  const byId = (flip) => new Map(nodes.map((n) => [n.id, { ...n, flip: n.id === 'fc' && flip }]))
  const front = lookOf(byId(false), 'fc:ESC.M1', 'esc:ESC.M1')
  assert.equal(front.hidden, false)
  assert.equal(front.from, 'left')
  const turned = lookOf(byId(true), 'fc:ESC.M1', 'esc:ESC.M1')
  assert.equal(turned.hidden, true, 'the connector is on the other side now')
  assert.equal(turned.from, 'right')
  const back = lookOf(byId(true), 'fc:B.M1', 'esc:m1a')
  assert.equal(back.hidden, false)
  // redrawing after a flip
  const flow = toFlowNodes([{ id: 'fc', type: FC, x: 0, y: 0, flip: true }, { id: 'esc', type: ESC, x: 400, y: 0 }], true)
  const edges = toFlowEdges([{ id: 'fc', type: FC }, { id: 'esc', type: ESC }], [{ id: 'w', a: 'fc:ESC.M1', b: 'esc:ESC.M1' }])
  assert.equal(edges[0].data.hidden, false)
  assert.equal(redrawEdges(flow, edges)[0].data.hidden, true)
})

test('parts can be found by brand, kind and words', () => {
  assert.deepEqual(groupByBrand(PARTS).map((g) => g.brand), ['Generic', 'GEPRC'])
  assert.equal(findParts(PARTS, { brand: 'GEPRC' }).length, BRAND_PARTS.length)
  assert.deepEqual(findParts(PARTS, { brand: 'GEPRC', category: 'ESCs' }).map((p) => p.id), [ESC, 'geprc-taker-h60'])
  assert.deepEqual(findParts(PARTS, { query: 'bluetooth' }).map((p) => p.id), [FC2])
  assert.equal(findParts(PARTS, { query: '65 A' }).some((p) => p.id === ESC), true)
  assert.equal(findParts(PARTS, { brand: 'Generic', category: 'Motors' }).length, 1)
  assert.equal(findParts(PARTS, { query: 'zzzz' }).length, 0)
})

test('tidy up leaves room for the big boards', () => {
  const b = stack(FC)
  const at = tidyLayout(b.nodes, b.wires)
  const boxes = b.nodes.map((n) => ({ id: n.id, x: at[n.id].x, y: at[n.id].y, w: PART_BY_ID[n.type].w, h: PART_BY_ID[n.type].h }))
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const p = boxes[i]
      const q = boxes[j]
      assert.equal(p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h, false, `${p.id} overlaps ${q.id}`)
    }
  }
  assert.ok(at.fc.y + PART_BY_ID[FC].h < at.esc.y, 'the flight controller sits above the ESC')
})
