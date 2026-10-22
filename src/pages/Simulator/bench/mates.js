import { PART_BY_ID } from './catalog.js'

/**
 * Can a wire sensibly join these two pads? Used by Assisted mode to light up the pads that fit while a wire is being
 * dragged. It only says which pads belong together (same rail, matching signal, TX to RX ...), it does not judge the
 * whole build: the checks do that.
 * a, b: { nodeId, pad }  with the pad as in catalog.js
 */
export function canMate(a, b) {
  if (a.nodeId === b.nodeId) return false
  const A = a.pad
  const B = b.pad
  // a supply rail meets the same rail, and a part that needs power meets a rail it can take
  if (A.rail && B.rail) return A.rail === B.rail
  const takes = (load, rail) => load.accepts && rail.rail && rail.rail !== 'gnd' && load.accepts.includes(rail.rail)
  if (takes(A, B) || takes(B, A)) return true
  // data: a device's TX talks to the flight controller's RX and its RX listens to the flight controller's TX
  const uart = (device, fc) => device.uartDevice && fc.uart && ((device.uartDevice === 'tx' && fc.uart.dir === 'rx') || (device.uartDevice === 'rx' && fc.uart.dir === 'tx'))
  if (uart(A, B) || uart(B, A)) return true
  // video: the camera feeds the flight controller or the VTX, and the flight controller feeds the VTX
  const video = (from, to) => (from.video === 'video-out' && (to.video === 'cam-in' || to.video === 'video-in')) || (from.video === 'vtx-out' && to.video === 'video-in')
  if (video(A, B) || video(B, A)) return true
  // the flight controller and the ESC meet on the pad with the same name
  if (A.signal && B.signal) return A.signal === B.signal
  // a motor wire meets a motor pad
  if ((a.type === 'motor' && A.lead && B.motor) || (b.type === 'motor' && B.lead && A.motor)) return true
  // the capacitor's legs meet the battery pads
  if (A.role === 'cap+' && B.rail === 'vbat') return true
  if (B.role === 'cap+' && A.rail === 'vbat') return true
  if (A.role === 'cap-' && B.rail === 'gnd') return true
  if (B.role === 'cap-' && A.rail === 'gnd') return true
  return false
}

/** For a wire started on one pad: the pads of every other placed part that fit it, as { [nodeId]: [padId] }. */
export function matesFor(nodes, nodeId, padId) {
  const from = nodes.find((n) => n.id === nodeId)
  const pad = from && PART_BY_ID[from.type]?.pads.find((p) => p.id === padId)
  if (!pad) return {}
  const out = {}
  for (const node of nodes) {
    if (node.id === nodeId) continue
    const ids = PART_BY_ID[node.type].pads.filter((p) => canMate({ nodeId, type: from.type, pad }, { nodeId: node.id, type: node.type, pad: p })).map((p) => p.id)
    if (ids.length) out[node.id] = ids
  }
  return out
}
