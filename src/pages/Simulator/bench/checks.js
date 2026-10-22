import { PART_BY_ID } from './catalog.js'
import { buildNets } from './netlist.js'

const RAIL_NAME = { vbat: 'battery voltage (about 16 V)', gnd: 'ground', '5v': '5 V', '9v': '9 V' }
const railList = (rails) => [...rails].map((r) => RAIL_NAME[r] ?? r).join(' and ')

/** Every check the bench can report. Lessons list the ones that must pass. */
export const GOALS = ['battery', 'capacitor', 'motors', 'fc-esc', 'receiver', 'gps', 'camera', 'vtx', 'video', 'no-faults']

/**
 * Reads the wiring on the bench the way the real parts would react and reports what is right and what is wrong.
 *
 * Returns {
 *   items:   [{ level: 'critical' | 'warn' | 'ok' | 'info', title, detail, nodes }]  critical first
 *   goals:   { [goalId]: boolean }
 *   faults:  true when something would burn or short
 *   smoke:   node ids that would burn
 *   spins:   { [motorNodeId]: 'cw' | 'ccw' } for the motors that would turn
 *   powered: true when the battery feeds the ESC correctly
 * }
 */
export function runChecks(nodes, wires) {
  const { nets, netOf } = buildNets(nodes, wires)
  const items = []
  const smoke = new Set()
  const goals = Object.fromEntries(GOALS.map((g) => [g, false]))
  const spins = {}
  const handled = new Set()
  let powerFault = false

  const ofType = (type) => nodes.filter((n) => n.type === type)
  const label = (node) => {
    const same = ofType(node.type)
    const name = PART_BY_ID[node.type]?.name ?? node.type
    return same.length > 1 ? `${name} ${same.indexOf(node) + 1}` : name
  }
  const say = (level, title, detail, ids = []) => items.push({ level, title, detail, nodes: ids })
  const burn = (title, detail, ids) => {
    for (const id of ids) smoke.add(id)
    say('critical', title, detail, ids)
  }
  const railsIn = (net, skip = () => false) => {
    const rails = new Set()
    for (const t of net.terminals) if (t.pad.rail && !skip(t)) rails.add(t.pad.rail)
    return rails
  }
  const partsIn = (net, pick = () => true) => [...new Set(net.terminals.filter(pick).map((t) => t.nodeId))]
  const nodeById = (id) => nodes.find((n) => n.id === id)
  const names = (ids) => ids.map((id) => label(nodeById(id))).join(', ')

  const batteries = ofType('battery')
  const escs = ofType('esc')
  const fcs = ofType('fc')

  // ---- Battery: shorted, reversed, or fine ----
  const liveRails = new Map()
  const makeLive = (net, rail) => {
    if (!liveRails.has(net)) liveRails.set(net, new Set())
    liveRails.get(net).add(rail)
  }
  for (const bat of batteries) {
    const pos = netOf(bat.id, 'pos')
    const neg = netOf(bat.id, 'neg')
    if (pos === neg) {
      handled.add(pos)
      powerFault = true
      burn(`${label(bat)} is shorted`, 'Its red and black leads are joined, so the battery is shorted. It would get hot and could catch fire.', [bat.id])
      continue
    }
    const onPos = railsIn(pos, (t) => t.nodeId === bat.id)
    const onNeg = railsIn(neg, (t) => t.nodeId === bat.id)
    if (onPos.has('gnd') && !onPos.has('vbat') && onNeg.has('vbat') && !onNeg.has('gnd')) {
      handled.add(pos)
      handled.add(neg)
      powerFault = true
      const hit = partsIn(pos, (t) => t.nodeId !== bat.id).concat(partsIn(neg, (t) => t.nodeId !== bat.id))
      burn(
        `${label(bat)} is the wrong way round`,
        'The red (positive) lead is on a ground pad and the black lead is on a positive pad. Reversed polarity destroys the electronics in a second. Swap the two leads.',
        [...new Set([bat.id, ...hit])],
      )
    }
  }

  // ---- Any net that carries two different rails ----
  for (const net of nets) {
    if (handled.has(net)) continue
    const rails = railsIn(net)
    if (rails.size < 2) continue
    handled.add(net)
    const ids = partsIn(net, (t) => t.pad.rail)
    if (rails.has('vbat') && rails.has('gnd')) {
      powerFault = true
      burn('Short circuit', `Battery positive and ground are joined (${names(ids)}). The battery would be shorted.`, ids)
    } else if (rails.has('gnd')) {
      const which = [...rails].find((r) => r !== 'gnd')
      burn(`${RAIL_NAME[which]} is joined to ground`, `A ${RAIL_NAME[which]} pad touches a ground pad (${names(ids)}). The regulator or the part would burn.`, ids)
    } else if (rails.has('vbat')) {
      const low = [...rails].find((r) => r !== 'vbat')
      burn(`Battery voltage reaches the ${RAIL_NAME[low]} rail`, `Battery voltage is joined to a ${RAIL_NAME[low]} pad (${names(ids)}). Everything on that rail would burn.`, ids)
    } else {
      burn('5 V and 9 V are joined', `Two different supply rails are joined (${names(ids)}).`, ids)
    }
  }

  // ---- Which nets are live ----
  if (!powerFault) {
    for (const bat of batteries) {
      makeLive(netOf(bat.id, 'pos'), 'vbat')
      makeLive(netOf(bat.id, 'neg'), 'gnd')
    }
  }
  const isLive = (net, rail) => !!net && !!liveRails.get(net)?.has(rail)
  const fcPowered = new Set()
  for (const fc of fcs) {
    if (isLive(netOf(fc.id, 'sig_bat'), 'vbat') && isLive(netOf(fc.id, 'sig_g'), 'gnd')) {
      fcPowered.add(fc.id)
      for (const pad of PART_BY_ID.fc.pads) if (pad.source) makeLive(netOf(fc.id, pad.id), pad.rail)
    }
  }

  // ---- Battery to ESC ----
  const hasEscPad = (net, rail) => net.terminals.some((t) => t.type === 'esc' && t.pad.rail === rail)
  for (const bat of batteries) {
    const pos = netOf(bat.id, 'pos')
    const neg = netOf(bat.id, 'neg')
    if (handled.has(pos) || handled.has(neg) || powerFault) continue
    if (hasEscPad(pos, 'vbat') && hasEscPad(neg, 'gnd')) {
      goals.battery = true
      say('ok', 'Battery is connected to the ESC', 'Positive to BAT+ and negative to BAT-.', [bat.id])
    } else if (escs.length) {
      say('warn', 'Battery is not connected to the ESC yet', 'Solder the red lead to BAT+ and the black lead to BAT- on the ESC.', [bat.id])
    }
  }

  // ---- Capacitor ----
  for (const cap of ofType('capacitor')) {
    const pos = netOf(cap.id, 'cp')
    const neg = netOf(cap.id, 'cn')
    const onPos = railsIn(pos)
    const onNeg = railsIn(neg)
    if (onPos.has('gnd') && !onPos.has('vbat') && onNeg.has('vbat') && !onNeg.has('gnd')) {
      burn('Capacitor is the wrong way round', 'The long (positive) leg is on a ground pad. A reversed electrolytic capacitor can pop, so check the stripe: it marks the negative leg.', [cap.id])
    } else if (onPos.has('vbat') && !onPos.has('gnd') && onNeg.has('gnd') && !onNeg.has('vbat')) {
      goals.capacitor = true
      say('ok', 'Capacitor is soldered correctly', 'Positive leg on CAP+, negative leg on CAP-, across the battery power.', [cap.id])
    } else {
      say('warn', 'Capacitor is not finished', 'Solder the long leg to CAP+ and the short, striped leg to CAP-.', [cap.id])
    }
  }

  // ---- Motors ----
  const motors = ofType('motor')
  const groupsUsed = new Map()
  let motorsReady = 0
  for (const motor of motors) {
    const part = PART_BY_ID.motor
    const info = part.motorLeads.map((id) => {
      const net = netOf(motor.id, id)
      return {
        net,
        pads: net.terminals.filter((t) => t.pad.motor),
        motorLeads: net.terminals.filter((t) => t.type === 'motor'),
      }
    })
    const sameMotorJoined = info.some((i) => i.motorLeads.filter((t) => t.nodeId === motor.id).length > 1)
    const otherMotor = info.some((i) => i.motorLeads.some((t) => t.nodeId !== motor.id))
    const manyPads = info.some((i) => i.pads.length > 1)
    const placed = info.filter((i) => i.pads.length === 1)

    if (sameMotorJoined) {
      burn(`${label(motor)}: two of its wires are joined`, 'Two wires of the same motor touch. That shorts two of its three phases, and the ESC would burn.', [motor.id])
    } else if (otherMotor) {
      say('warn', `${label(motor)} shares a pad with another motor`, 'Each motor needs its own three pads.', [motor.id])
    } else if (manyPads) {
      burn(`${label(motor)}: a wire touches more than one pad`, 'A wire is joined to two ESC pads. Keep each wire on a single pad.', [motor.id])
    } else if (placed.length === 0) {
      say('info', `${label(motor)} is not wired yet`, 'Solder its three wires to the three pads of one motor output (M1 to M4) on the ESC.', [motor.id])
    } else if (placed.length < 3) {
      say('warn', `${label(motor)} has ${3 - placed.length} loose wire${3 - placed.length > 1 ? 's' : ''}`, 'All three wires must be soldered, one to each pad of the same motor output.', [motor.id])
    } else {
      const groups = new Set(placed.map((i) => i.pads[0].pad.motor.group))
      const order = placed.map((i) => i.pads[0].pad.motor.index)
      if (groups.size > 1) {
        say('warn', `${label(motor)} is spread over different outputs`, 'Its three wires must all go to the same motor output (all on M1, for example).', [motor.id])
      } else if (new Set(order).size < 3) {
        say('warn', `${label(motor)} has two wires on one pad`, 'Use all three pads of the motor output, one wire each.', [motor.id])
      } else {
        const group = [...groups][0]
        const inversions = (order[0] > order[1]) + (order[0] > order[2]) + (order[1] > order[2])
        const dir = inversions % 2 === 0 ? 'cw' : 'ccw'
        groupsUsed.set(group, [...(groupsUsed.get(group) ?? []), motor.id])
        motorsReady += 1
        spins[motor.id] = dir
        say(
          'ok',
          `${label(motor)} is wired to ${group}`,
          `It will spin ${dir === 'cw' ? 'clockwise' : 'anticlockwise'} as wired. Swapping any two of its wires reverses it, and a flight controller can also reverse it in software.`,
          [motor.id],
        )
      }
    }
  }
  for (const [group, ids] of groupsUsed) {
    if (ids.length > 1) {
      for (const id of ids) delete spins[id]
      motorsReady -= ids.length
      say('warn', `${group} has ${ids.length} motors`, `Each motor output drives one motor. Move one of them to a free output.`, ids)
    }
  }
  goals.motors = motors.length >= 4 && motorsReady >= 4 && groupsUsed.size === 4

  // ---- Flight controller to ESC ----
  const SIGNALS = ['bat', 'g', 'm1', 'm2', 'm3', 'm4']
  const upper = (s) => (s === 'bat' ? 'BAT' : s === 'g' ? 'G' : s.toUpperCase())
  if (fcs.length && escs.length) {
    const fc = fcs[0]
    const esc = escs[0]
    const missing = []
    const crossed = []
    for (const s of SIGNALS) {
      const net = netOf(fc.id, `sig_${s}`)
      const escSignals = net.terminals.filter((t) => t.nodeId === esc.id && t.pad.signal).map((t) => t.pad.signal)
      if (escSignals.includes(s)) continue
      if (escSignals.length) crossed.push(`FC ${upper(s)} goes to ESC ${upper(escSignals[0])}`)
      else missing.push(upper(s))
    }
    if (!missing.length && !crossed.length) {
      goals['fc-esc'] = true
      say('ok', 'Flight controller is wired to the ESC', 'BAT, G and the four motor signals M1 to M4 are all connected.', [fc.id, esc.id])
    } else if (crossed.length) {
      say('warn', 'Some signals are crossed', `${crossed.join('. ')}. Each signal must meet the pad with the same name.`, [fc.id, esc.id])
    } else {
      say('warn', 'Flight controller to ESC is not finished', `Still to connect: ${missing.join(', ')}. The flight controller needs BAT and G for power, and M1 to M4 to tell the motors what to do.`, [fc.id, esc.id])
    }
  }

  // ---- Devices that take power and ground ----
  const powerOf = (node, spec) => {
    const part = PART_BY_ID[node.type]
    const powerPad = part.pads.find((p) => p.id === spec.power)
    const net = netOf(node.id, spec.power)
    const gnet = netOf(node.id, spec.gnd)
    const rails = railsIn(net)
    const need = railList(powerPad.accepts)
    if (rails.size === 0 || [...rails].every((r) => r === 'gnd')) return { ok: false, text: `Its power wire is not connected. It needs ${need}.` }
    const bad = [...rails].find((r) => !powerPad.accepts.includes(r))
    if (bad) {
      burn(`${label(node)} gets the wrong voltage`, `Its power wire reaches ${RAIL_NAME[bad]} but it only takes ${need}. It would burn.`, [node.id])
      return { ok: false, burned: true }
    }
    if (!railsIn(gnet, (t) => t.nodeId === node.id && t.padId === spec.gnd).has('gnd')) return { ok: false, text: 'Its ground wire is not connected to a ground pad.' }
    const rail = [...rails][0]
    if (!isLive(net, rail) || !isLive(gnet, 'gnd')) return { ok: false, text: 'It is wired to power, but that power is not on yet. Finish the battery, ESC and flight controller wiring first.' }
    return { ok: true }
  }

  const usedUarts = new Map()
  const uartDevice = (node, goal) => {
    const spec = PART_BY_ID[node.type].needs
    const leads = PART_BY_ID[node.type].pads
    const txLead = leads.find((p) => p.uartDevice === 'tx').id
    const rxLead = leads.find((p) => p.uartDevice === 'rx').id
    const power = powerOf(node, spec)
    if (power.burned) return
    const txNet = netOf(node.id, txLead)
    const rxNet = netOf(node.id, rxLead)
    const fcPads = (net, dir) => net.terminals.filter((t) => t.type === 'fc' && t.pad.uart?.dir === dir).map((t) => t.pad.uart.n)
    const txToRx = fcPads(txNet, 'rx')
    const rxToTx = fcPads(rxNet, 'tx')
    const txToTx = fcPads(txNet, 'tx')
    const rxToRx = fcPads(rxNet, 'rx')
    const common = txToRx.filter((n) => rxToTx.includes(n))
    if (!power.ok) {
      say('warn', `${label(node)} is not powered`, power.text, [node.id])
    } else if (common.length) {
      const n = common[0]
      if (usedUarts.has(n)) {
        say('warn', `${label(node)} and ${label(nodeById(usedUarts.get(n)))} are on the same UART`, `Both are on UART${n}. Give each device its own UART.`, [node.id])
      } else {
        usedUarts.set(n, node.id)
        goals[goal] = true
        say('ok', `${label(node)} is wired to UART${n}`, `Power and ground are good, and TX and RX are crossed over to R${n} and T${n}.`, [node.id])
      }
    } else if (txToTx.length || rxToRx.length) {
      say('warn', `${label(node)}: TX is joined to TX`, 'TX (transmit) must go to the flight controller’s RX (receive) pad, and RX to its TX pad. Cross them over.', [node.id])
    } else if (txToRx.length && rxToTx.length) {
      say('warn', `${label(node)} uses two different UARTs`, `TX goes to UART${txToRx[0]} but RX goes to UART${rxToTx[0]}. Both must be on the same UART.`, [node.id])
    } else {
      say('warn', `${label(node)} is powered but its data wires are not finished`, 'Connect its TX to the flight controller’s R pad and its RX to the matching T pad.', [node.id])
    }
  }
  if (fcs.length) {
    for (const node of ofType('receiver')) uartDevice(node, 'receiver')
    for (const node of ofType('gps')) uartDevice(node, 'gps')
  }

  // ---- Camera, VTX and the video between them ----
  const cams = ofType('camera')
  const vtxs = ofType('vtx')
  for (const [list, goal] of [
    [cams, 'camera'],
    [vtxs, 'vtx'],
  ]) {
    for (const node of list) {
      const power = powerOf(node, PART_BY_ID[node.type].needs)
      if (power.ok) {
        goals[goal] = true
        say('ok', `${label(node)} is powered`, 'Power and ground are connected to live pads.', [node.id])
      } else if (!power.burned) {
        say('warn', `${label(node)} is not powered`, power.text, [node.id])
      }
    }
  }
  if (cams.length && vtxs.length) {
    const cam = cams[0]
    const vtx = vtxs[0]
    const camNet = netOf(cam.id, 'cv')
    const vtxNet = netOf(vtx.id, 'vv')
    const direct = camNet === vtxNet
    const viaFc = camNet.terminals.some((t) => t.type === 'fc' && t.pad.video === 'cam-in') && vtxNet.terminals.some((t) => t.type === 'fc' && t.pad.video === 'vtx-out')
    const backwards = camNet.terminals.some((t) => t.type === 'fc' && t.pad.video === 'vtx-out') || vtxNet.terminals.some((t) => t.type === 'fc' && t.pad.video === 'cam-in')
    if (direct || viaFc) {
      goals.video = true
      say('ok', 'Video reaches the VTX', direct ? 'The camera video goes straight to the VTX.' : 'Camera video goes through the flight controller (so the OSD can be added) and out to the VTX.', [cam.id, vtx.id])
    } else if (backwards) {
      say('warn', 'Video is wired the wrong way round', 'The camera goes to the CAM pad, and the VTX takes its video from the VTX pad.', [cam.id, vtx.id])
    } else {
      say('warn', 'Video is not connected', 'Camera video goes to the flight controller’s CAM pad, and the flight controller’s VTX pad goes to the VTX video wire.', [cam.id, vtx.id])
    }
  }

  // ---- Result ----
  const faults = items.some((i) => i.level === 'critical')
  goals['no-faults'] = !faults && nodes.length > 0
  const powered = goals.battery && !powerFault
  if (!powered) for (const id of Object.keys(spins)) delete spins[id]
  const order = { critical: 0, warn: 1, info: 2, ok: 3 }
  items.sort((a, b) => order[a.level] - order[b.level])
  return { items, goals, faults, smoke: [...smoke], spins, powered }
}
