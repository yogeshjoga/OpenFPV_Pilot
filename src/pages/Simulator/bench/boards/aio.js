// An all-in-one board: flight controller and 4-in-1 ESC on one board. Its pads are given in millimetres from the top left
// corner of the board as the manual draws it, so they are easy to read off the picture.
import { joinByLabel, mm, part } from './build.js'
import { semantics } from './semantics.js'

const dedupe = () => {
  const seen = new Map()
  return (base) => {
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  }
}

/** A row of signal pads: P('R4 T4 5V G', x, y, dx, dy) puts the first at (x, y) and each next one (dx, dy) further on. */
export const P = (labels, x, y, dx = 2, dy = 0) => labels.trim().split(/\s+/).map((label, i) => ({ t: 'signal', label, x: x + i * dx, y: y + i * dy, pitch: Math.hypot(dx, dy) }))

/** The three pads of one motor output. `dir` is 'h' for a row of pads along the top or bottom, 'v' for a column down a side. */
export const M = (name, x, y, step, dir = 'h') => [0, 1, 2].map((i) => ({ t: 'motor', label: name, index: i, x: dir === 'h' ? x + i * step : x, y: dir === 'h' ? y : y + i * step, dir }))

/** The same pads on a board of a different size: positions are stretched, so one layout serves boards of one family. */
export const scaled = (pads, sx, sy = sx) => pads.flat().map((p) => ({ ...p, x: p.x * sx, y: p.y * sy, pitch: p.pitch ? p.pitch * Math.min(sx, sy) : p.pitch }))

/** The two big battery pads. */
export const BAT = (plus, minus) => [
  { t: 'bat', id: 'batp', label: 'BAT+', x: plus[0], y: plus[1] },
  { t: 'bat', id: 'batn', label: 'BAT-', x: minus[0], y: minus[1] },
]


/**
 * Pads laid out along the four edges of the board, in the order a clock goes round it: along the top from left to right, down
 * the right edge, along the bottom from right to left, up the left edge. Each edge lists what sits along it:
 *   { motor: 'M3' }                three pads of one motor output
 *   { pads: ['5V G', 'R2 T2'] }    rows of signal pads, one or two to a row (outer first, '-' for an empty place)
 *   { bat: true }                  the two big battery pads
 *   { usb: 9 }                     room for the USB port (the length it takes, in mm)
 *   { gap: 3 } or { grow: true }   empty space, a fixed length or whatever is left
 */
export function onEdges(edges, wmm, hmm) {
  const MARGIN = 2
  const MOTOR = 3.6
  const ROW = 2.1
  const DEPTH = [1.8, 4.3]
  const out = []
  let usb = null
  for (const edge of ['top', 'right', 'bottom', 'left']) {
    const items = edges[edge] ?? []
    const len = edge === 'top' || edge === 'bottom' ? wmm : hmm
    const size = (it) => (it.motor ? 3 * MOTOR : it.pads ? it.pads.length * ROW : it.bat ? 8.8 : it.usb ?? it.gap ?? 0)
    const fixed = items.reduce((n, it) => n + (it.grow ? 0 : size(it)), 0)
    const grows = items.filter((it) => it.grow).length
    const share = grows ? Math.max(0, (len - 2 * MARGIN - fixed) / grows) : 0
    const at = (s, depth) => ({ top: [s, depth], right: [wmm - depth, s], bottom: [wmm - s, hmm - depth], left: [depth, hmm - s] })[edge]
    let c = MARGIN
    for (const it of items) {
      if (it.grow) c += share
      else if (it.motor) {
        for (let i = 0; i < 3; i++) {
          const [x, y] = at(c + MOTOR / 2 + i * MOTOR, 0.7)
          out.push({ t: 'motor', label: it.motor, index: i, x, y, dir: edge === 'top' || edge === 'bottom' ? 'h' : 'v' })
        }
        c += 3 * MOTOR
      } else if (it.pads) {
        it.pads.forEach((row, r) => {
          row.trim().split(/\s+/).forEach((label, k) => {
            if (label === '-') return
            const [x, y] = at(c + ROW / 2 + r * ROW, DEPTH[k])
            out.push({ t: 'signal', label, x, y, pitch: ROW })
          })
        })
        c += it.pads.length * ROW
      } else if (it.bat) {
        ;[['batp', 'BAT+'], ['batn', 'BAT-']].forEach(([id, label], i) => {
          const [x, y] = at(c + 2.2 + i * 4.4, 2.4)
          out.push({ t: 'bat', id, label, x, y })
        })
        c += 8.8
      } else if (it.usb) {
        usb = [edge, edge === 'top' ? c + it.usb / 2 : edge === 'bottom' ? wmm - c - it.usb / 2 : edge === 'right' ? c + it.usb / 2 : hmm - c - it.usb / 2]
        c += it.usb
      } else c += it.gap ?? 0
    }
  }
  return { pads: out, usb }
}

/**
 * spec: {
 *   id, brand, model, blurb, specs: [], source,
 *   mm: [35, 34.3], mount: 25.5, mcu: 'STM32F722',
 *   usb: [side, along in mm],           'top' | 'bottom' | 'left' | 'right'
 *   pads: [...P(...), ...M(...), ...BAT(...)]
 * }
 */
export function aioBoard(o) {
  const [wmm, hmm] = o.mm
  const w = mm(wmm)
  const h = mm(hmm)
  const laid = o.edges ? onEdges(o.edges, wmm, hmm) : null
  const id = dedupe()
  const pads = (laid ? laid.pads : o.pads).flat().map((p) => {
    const x = mm(p.x)
    const y = mm(p.y)
    if (p.t === 'bat') return { id: p.id, label: p.label, x, y, shape: 'pad', size: [46, 32], big: true, tin: true, hit: 30, ...semantics(p.label, { kind: 'aio', group: 'BAT' }) }
    if (p.t === 'motor') {
      return {
        id: `${p.label.toLowerCase()}${'abc'[p.index]}`,
        label: p.label,
        x,
        y,
        shape: 'pad',
        size: p.dir === 'h' ? [30, 17] : [17, 30],
        hit: 17,
        motor: { group: p.label, index: p.index },
      }
    }
    const size = Math.max(14, Math.min(18, Math.floor(p.pitch * 9 - 2)))
    return { id: id(p.label), label: p.label, x, y, shape: 'pad', size: [size, size], hit: 15, group: 'PADS', ...semantics(p.label, { kind: 'aio', group: 'PADS' }) }
  })
  const hx = (w - mm(o.mount)) / 2
  const hy = (h - mm(o.mount)) / 2
  const [usbSide, usbAt] = o.usb ?? laid?.usb ?? ['top', wmm / 2]
  const along = mm(usbAt)
  const usbXY = { top: [along, 18], bottom: [along, h - 18], left: [18, along], right: [w - 18, along] }[usbSide]
  const cx = w * 0.45
  const cy = h * 0.44
  return part({
    id: o.id,
    kind: 'aio',
    kinds: ['fc', 'esc'],
    brand: o.brand ?? 'GEPRC',
    model: o.model,
    name: `${o.brand ?? 'GEPRC'} ${o.model}`,
    category: 'AIO boards',
    blurb: o.blurb,
    specs: o.specs,
    source: o.source,
    w,
    h,
    pads,
    internal: joinByLabel(pads.filter((p) => !p.motor)),
    // the battery pads power the flight controller side of the board
    power: { vbat: 'batp', gnd: 'batn' },
    art: {
      kind: 'aio',
      title: o.model,
      holes: [[hx, hy], [w - hx, hy], [hx, h - hy], [w - hx, h - hy]],
      radius: 14,
      features: [
        { t: 'chip', x: cx - 34, y: cy - 34, w: 68, h: 68, die: true, label: o.mcu },
        { t: 'coil', x: cx - 70, y: cy + 52, w: 44, h: 44 },
        { t: 'cap', x: cx + 40, y: cy + 74, r: 12 },
        { t: 'fet', x: w * 0.3, y: 44, w: 60, h: 40 },
        { t: 'fet', x: w * 0.3, y: h - 84, w: 60, h: 40 },
        { t: 'fet', x: w - 110, y: cy - 50, w: 40, h: 60 },
        { t: 'usb', x: usbXY[0], y: usbXY[1], side: usbSide },
        { t: 'title', x: cx, y: cy + 78, text: 'GEPRC', sub: false },
      ],
      backFeatures: [
        { t: 'ghost', x: cx - 34, y: cy - 34, w: 68, h: 68 },
        { t: 'title', x: cx, y: cy + 78, text: 'BOTTOM', sub: false },
      ],
    },
  })
}
