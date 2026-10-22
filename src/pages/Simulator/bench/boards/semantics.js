/**
 * What a pad is, from the label printed beside it on the board (the way a builder reads a manual).
 *   rail     the supply rail the pad sits on
 *   source   the pad is a regulator output of a flight controller
 *   signal   the pad meets the pad of the same name on the flight controller or ESC (the 8-pin ESC link)
 *   uart     { n, dir } for the T and R pads of a UART
 *   video    'cam-in' or 'vtx-out'
 * `group` is the connector or pad group the pad belongs to ('ESC' is the link to the ESC).
 */
export function semantics(label, { kind, group }) {
  const out = {}
  const L = label.toUpperCase()
  const fc = kind === 'fc'
  if (L === 'GND' || L === 'G') out.rail = 'gnd'
  else if (L === 'BAT-') out.rail = 'gnd'
  else if (L === 'BAT' || L === 'BAT+' || L === 'VBAT' || L === 'VSW') out.rail = 'vbat'
  else if (L === '5V') Object.assign(out, { rail: '5v' }, fc ? { source: true } : {})
  else if (L === '9V') Object.assign(out, { rail: '9v' }, fc ? { source: true } : {})
  else if (L === '12V') Object.assign(out, { rail: '12v' }, fc ? { source: true } : {})
  else if (L === '3V3') Object.assign(out, { rail: '3v3' }, fc ? { source: true } : {})
  else if (L === 'CAM') out.video = 'cam-in'
  else if (L === 'VTX') out.video = 'vtx-out'
  else {
    const t = /^T(\d)$/.exec(L)
    const r = /^R(\d)$/.exec(L) ?? /^RX(\d)$/.exec(L)
    if (t) out.uart = { n: Number(t[1]), dir: 'tx' }
    else if (r) out.uart = { n: Number(r[1]), dir: 'rx' }
  }
  // the 8-pin link between the flight controller and the ESC: each pin meets the pin of the same name
  if (group === 'ESC') {
    if (L === 'BAT') out.signal = 'bat'
    else if (L === 'GND') out.signal = 'g'
    else if (L === 'CUR' || L === 'CR') out.signal = 'cur'
    else if (/^M[1-4]$/.test(L)) out.signal = L.toLowerCase()
    else if (/^R\d$|^RX\d$|^TLM$/.test(L)) out.signal = 'tlm'
  }
  return out
}

/** Labels that are the same copper on the board. By default every pad with the same label is one net. */
export const netKey = (label) => {
  const L = label.toUpperCase()
  if (L === 'VSW') return 'BAT'
  if (L === 'G') return 'GND'
  if (L === 'RX5' || L === 'TLM') return 'R5'
  if (L === 'CR') return 'CUR'
  if (L === 'S.B') return 'SBUS'
  return L
}
