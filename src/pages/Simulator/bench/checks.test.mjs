import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PARTS, PART_BY_ID } from './catalog.js'
import { buildNets } from './netlist.js'
import { runChecks } from './checks.js'

// "esc.batp" means pad batp of the part placed with id "esc"
const wire = (a, b) => ({ a: a.replace('.', ':'), b: b.replace('.', ':') })
const node = (id, type = id) => ({ id, type })
const motorWires = (m, group) => ['a', 'b', 'c'].map((c, i) => wire(`${m}.w${i + 1}`, `esc.${group}${c}`))

const correct = () => ({
  nodes: [node('bat', 'battery'), node('esc'), node('cap', 'capacitor'), node('fc'), node('rx', 'receiver'), node('cam', 'camera'), node('vtx'), node('gps'),
    node('m1', 'motor'), node('m2', 'motor'), node('m3', 'motor'), node('m4', 'motor')],
  wires: [
    wire('bat.pos', 'esc.batp'), wire('bat.neg', 'esc.batn'), wire('cap.cp', 'esc.capp'), wire('cap.cn', 'esc.capn'),
    ...motorWires('m1', 'm1'), ...motorWires('m2', 'm2'), ...motorWires('m3', 'm3'), ...motorWires('m4', 'm4'),
    wire('fc.sig_bat', 'esc.sig_bat'), wire('fc.sig_g', 'esc.sig_g'),
    ...['m1', 'm2', 'm3', 'm4'].map((m) => wire(`fc.sig_${m}`, `esc.sig_${m}`)),
    wire('rx.r5', 'fc.u1_5v'), wire('rx.rg', 'fc.u1_g'), wire('rx.rt', 'fc.u1_r'), wire('rx.rr', 'fc.u1_t'),
    wire('cam.cpw', 'fc.cam_5v'), wire('cam.cg', 'fc.cam_g'), wire('cam.cv', 'fc.cam_in'),
    wire('vtx.vp', 'fc.v9'), wire('vtx.vg', 'fc.vtx_g'), wire('vtx.vv', 'fc.vtx_out'),
    wire('gps.g5', 'fc.u3_5v'), wire('gps.gg', 'fc.u3_g'), wire('gps.gt', 'fc.u3_r'), wire('gps.gr', 'fc.u3_t'),
  ],
})
const without = (build, ...pads) => ({ ...build, wires: build.wires.filter((w) => !pads.some((p) => w.a === p.replace('.', ':') || w.b === p.replace('.', ':'))) })
const swap = (build, a, b) => ({
  ...build,
  wires: build.wires.map((w) => {
    const [x, y] = [w.a, w.b]
    const fa = a.replace('.', ':')
    const fb = b.replace('.', ':')
    return { a: x === fa ? fb : x === fb ? fa : x, b: y === fa ? fb : y === fb ? fa : y }
  }),
})
// Moves the wire that ends on `lead` so that it ends on `pad` instead
const rewire = (build, lead, pad) => {
  const l = lead.replace('.', ':')
  const p = pad.replace('.', ':')
  return { ...build, wires: build.wires.map((w) => (w.a === l ? { ...w, b: p } : w.b === l ? { ...w, a: p } : w)) }
}
const titles = (r, level) => r.items.filter((i) => i.level === level).map((i) => i.title)

test('the catalog is consistent', () => {
  for (const part of PARTS) {
    const ids = part.pads.map((p) => p.id)
    assert.equal(new Set(ids).size, ids.length, `${part.id}: duplicate pad id`)
    for (const group of part.internal) for (const id of group) assert.ok(ids.includes(id), `${part.id}: internal pad ${id} missing`)
    for (const p of part.pads) assert.ok(p.x >= 0 && p.x <= part.w && p.y >= 0 && p.y <= part.h, `${part.id}.${p.id} is outside the part`)
  }
  assert.equal(PART_BY_ID.esc.pads.filter((p) => p.motor).length, 12)
})

test('wires and shared copper make nets', () => {
  const { netOf } = buildNets([node('esc'), node('bat', 'battery')], [wire('bat.pos', 'esc.batp')])
  assert.equal(netOf('bat', 'pos'), netOf('esc', 'capp'), 'BAT+ and CAP+ are the same copper')
  assert.equal(netOf('bat', 'pos'), netOf('esc', 'sig_bat'))
  assert.notEqual(netOf('bat', 'pos'), netOf('bat', 'neg'))
})

test('a correct build passes everything', () => {
  const r = runChecks(correct().nodes, correct().wires)
  assert.equal(r.faults, false, JSON.stringify(titles(r, 'critical')))
  assert.deepEqual(titles(r, 'warn'), [])
  for (const [goal, ok] of Object.entries(r.goals)) assert.ok(ok, `goal ${goal}`)
  assert.equal(Object.keys(r.spins).length, 4)
  assert.equal(r.powered, true)
})

test('an empty bench has nothing to report', () => {
  const r = runChecks([], [])
  assert.equal(r.items.length, 0)
  assert.equal(r.goals['no-faults'], false)
})

test('reversed battery is critical and burns the ESC', () => {
  const b = swap(correct(), 'esc.batp', 'esc.batn')
  const r = runChecks(b.nodes, b.wires)
  assert.ok(r.faults)
  assert.ok(titles(r, 'critical').some((t) => /wrong way round/.test(t)))
  assert.ok(r.smoke.includes('esc'))
  assert.equal(r.goals.battery, false)
  assert.equal(r.powered, false)
})

test('battery leads shorted together', () => {
  const r = runChecks([node('bat', 'battery')], [wire('bat.pos', 'bat.neg')])
  assert.ok(titles(r, 'critical').some((t) => /shorted/.test(t)))
})

test('BAT+ joined to ground is a short', () => {
  const alone = runChecks([node('esc')], [wire('esc.batp', 'esc.batn')])
  assert.ok(titles(alone, 'critical').includes('Short circuit'))
  const b = correct()
  b.wires.push(wire('esc.batp', 'fc.u1_g'))
  assert.ok(titles(runChecks(b.nodes, b.wires), 'critical').some((t) => /shorted|Short circuit/.test(t)))
})

test('a reversed capacitor is critical, a missing leg is a warning', () => {
  const r1 = (() => { const b = swap(correct(), 'esc.capp', 'esc.capn'); return runChecks(b.nodes, b.wires) })()
  assert.ok(titles(r1, 'critical').includes('Capacitor is the wrong way round'))
  assert.equal(r1.goals.capacitor, false)
  const b = without(correct(), 'cap.cn')
  const r2 = runChecks(b.nodes, b.wires)
  assert.ok(titles(r2, 'warn').includes('Capacitor is not finished'))
})

test('battery voltage on the receiver burns it', () => {
  const b = rewire(correct(), 'rx.r5', 'esc.batp')
  const r = runChecks(b.nodes, b.wires)
  assert.ok(titles(r, 'critical').some((t) => /wrong voltage/i.test(t)), JSON.stringify(titles(r, 'critical')))
  assert.ok(r.smoke.includes('rx'))
  assert.equal(r.goals.receiver, false)
})

test('battery voltage on the VTX or camera power', () => {
  const vtx = (() => { const b = rewire(correct(), 'vtx.vp', 'esc.batp'); return runChecks(b.nodes, b.wires) })()
  assert.ok(vtx.smoke.includes('vtx'))
  const cam = (() => { const b = rewire(correct(), 'cam.cpw', 'esc.batp'); return runChecks(b.nodes, b.wires) })()
  assert.equal(cam.smoke.includes('cam'), false, 'a camera takes battery voltage')
  assert.equal(cam.goals.camera, true)
})

test('TX to TX is detected', () => {
  const b = rewire(correct(), 'rx.rt', 'fc.u1_t')
  const r = runChecks(b.nodes, b.wires)
  assert.ok(titles(r, 'warn').some((t) => /TX is joined to TX/.test(t)), JSON.stringify(titles(r, 'warn')))
  assert.equal(r.goals.receiver, false)
})

test('data wires on two different UARTs', () => {
  const b = correct()
  b.wires = b.wires.map((w) => (w.b === 'fc:u1_t' ? { ...w, b: 'fc:u3_t' } : w))
  const r = runChecks(b.nodes, b.wires)
  assert.equal(r.goals.receiver, false)
  assert.ok(titles(r, 'warn').some((t) => /different UARTs|same UART|not finished/.test(t)))
})

test('the receiver is not powered until the flight controller has the battery', () => {
  const b = without(correct(), 'fc.sig_bat')
  const r = runChecks(b.nodes, b.wires)
  assert.equal(r.goals.receiver, false)
  assert.equal(r.goals.camera, false)
  assert.ok(titles(r, 'warn').some((t) => /is not powered/.test(t)))
})

test('a missing motor wire is reported', () => {
  const b = without(correct(), 'm2.w3')
  const r = runChecks(b.nodes, b.wires)
  assert.equal(r.goals.motors, false)
  assert.ok(titles(r, 'warn').some((t) => /loose wire/.test(t)))
})

test('a motor spread over two outputs, or two motors on one output', () => {
  const spread = correct()
  spread.wires = spread.wires.map((w) => (w.a === 'm1:w3' ? { ...w, b: 'esc:m2c' } : w))
  assert.ok(titles(runChecks(spread.nodes, spread.wires), 'warn').some((t) => /different outputs|shares a pad/.test(t)))
  const doubled = correct()
  doubled.wires = doubled.wires.map((w) => (w.a.startsWith('m2:') ? { ...w, b: w.b.replace('m2', 'm1') } : w))
  const r = runChecks(doubled.nodes, doubled.wires)
  assert.equal(r.goals.motors, false)
})

test('swapping two motor wires reverses its spin', () => {
  const b = correct()
  const before = runChecks(b.nodes, b.wires).spins.m1
  const swapped = swap(b, 'esc.m1a', 'esc.m1b')
  const after = runChecks(swapped.nodes, swapped.wires).spins.m1
  assert.notEqual(before, after)
  assert.ok(['cw', 'ccw'].includes(after))
})

test('two wires of one motor joined together burns the ESC', () => {
  const b = correct()
  b.wires.push(wire('m3.w1', 'm3.w2'))
  const r = runChecks(b.nodes, b.wires)
  assert.ok(titles(r, 'critical').some((t) => /two of its wires are joined/.test(t)))
})

test('FC signals crossed or missing', () => {
  const b = correct()
  b.wires = b.wires.map((w) => (w.a === 'fc:sig_m1' ? { ...w, b: 'esc:sig_m2' } : w))
  const r = runChecks(b.nodes, b.wires)
  assert.equal(r.goals['fc-esc'], false)
  assert.ok(titles(r, 'warn').some((t) => /crossed/.test(t)))
  const missing = without(correct(), 'fc.sig_m4')
  assert.ok(titles(runChecks(missing.nodes, missing.wires), 'warn').some((t) => /not finished/.test(t)))
})

test('video: direct from the camera, through the FC, or wired backwards', () => {
  const direct = without(correct(), 'cam.cv', 'vtx.vv')
  direct.wires.push(wire('cam.cv', 'vtx.vv'))
  assert.equal(runChecks(direct.nodes, direct.wires).goals.video, true)
  const back = correct()
  back.wires = back.wires.map((w) => (w.b === 'fc:cam_in' ? { ...w, b: 'fc:vtx_out' } : w.b === 'fc:vtx_out' ? { ...w, b: 'fc:cam_in' } : w))
  const r = runChecks(back.nodes, back.wires)
  assert.equal(r.goals.video, false)
  assert.ok(titles(r, 'warn').some((t) => /wrong way round/.test(t)))
})

test('5 V joined to ground is critical', () => {
  const b = correct()
  b.wires.push(wire('fc.u1_5v', 'fc.u1_g'))
  assert.ok(runChecks(b.nodes, b.wires).items.some((i) => i.level === 'critical' && /joined to ground/.test(i.title)))
})
