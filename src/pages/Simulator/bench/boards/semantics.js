/**
 * What a pad is, from the label printed beside it on the board (the way a builder reads a manual).
 *   rail     the supply rail the pad sits on
 *   source   the pad is a regulator output of a flight controller
 *   signal   the pad meets the pad of the same name on the flight controller or ESC (the 8-pin ESC link)
 *   uart     { n, dir } for the T and R pads of a UART
 *   video    'cam-in' or 'vtx-out'
 * `group` is the connector or pad group the pad belongs to ('ESC' is the link to the ESC).
 */

/** The same pad is printed in different ways on different boards. This is the name every other rule uses. */
export function canon(label) {
  const L = label.toUpperCase().replace(/\s+/g, '')
  const alias = { G: 'GND', '4V5': '5V', '3.3V': '3V3', VBAT: 'BAT', VSW: 'BAT', 'BAT+': 'BAT', 'BAT-': 'GND', CR: 'CUR', 'S.B': 'SBUS', VI: 'CAM', VO: 'VTX' }
  if (alias[L]) return alias[L]
  const uart = /^([TR])X(\d)$/.exec(L)
  return uart ? `${uart[1]}${uart[2]}` : L
}

export function semantics(label, { kind, group }) {
  const out = {}
  const L = canon(label)
  const source = kind === 'fc' || kind === 'aio'
  if (L === 'GND') out.rail = 'gnd'
  else if (L === 'BAT') out.rail = 'vbat'
  else if (L === '5V') Object.assign(out, { rail: '5v' }, source ? { source: true } : {})
  else if (L === '9V') Object.assign(out, { rail: '9v' }, source ? { source: true } : {})
  else if (L === '12V') Object.assign(out, { rail: '12v' }, source ? { source: true } : {})
  else if (L === '3V3') Object.assign(out, { rail: '3v3' }, source ? { source: true } : {})
  else if (L === 'CAM') out.video = 'cam-in'
  else if (L === 'VTX') out.video = 'vtx-out'
  else {
    const t = /^T(\d)$/.exec(L)
    const r = /^R(\d)$/.exec(L)
    if (t) out.uart = { n: Number(t[1]), dir: 'tx' }
    else if (r) out.uart = { n: Number(r[1]), dir: 'rx' }
  }
  // the 8-pin link between the flight controller and the ESC: each pin meets the pin of the same name
  if (group === 'ESC') {
    if (L === 'BAT') out.signal = 'bat'
    else if (L === 'GND') out.signal = 'g'
    else if (L === 'CUR') out.signal = 'cur'
    else if (/^M[1-4]$/.test(L)) out.signal = L.toLowerCase()
    else if (/^R\d$/.test(L)) out.signal = 'tlm'
  }
  return out
}

/** Labels that are the same copper on the board. By default every pad with the same name is one net. */
export const netKey = (label) => canon(label)
