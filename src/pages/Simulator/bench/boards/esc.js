// A 4-in-1 ESC board: a narrow tab with the battery pads, motor pads at the corners and the 8-pin link to the flight controller.
import { frontPins, mm, part } from './build.js'

/**
 * spec: {
 *   id, brand, model, blurb, specs: [], source,
 *   mm: [42, 45.7], mount: 30.5, body: 36.5, tab: 22,   the board, the part with the tab (body) and how wide the tab is
 *   link: 'NC CUR M4 M3 M2 M1 BAT GND'                   the 8-pin connector on top, left to right
 *   holeY, batSpread                                      where the upper mounting holes are (mm), how far the battery pads sit from the middle
 * }
 */
export function escBoard(o) {
  const [wmm, hmm] = o.mm ?? [42, 45.7]
  const w = mm(wmm)
  const h = mm(hmm)
  const bodyH = mm(o.body ?? 36.5)
  const tab = mm(o.tab ?? 22)
  const tabX = (w - tab) / 2
  const tabR = tabX + tab
  const cx = w / 2
  const mount = mm(o.mount ?? 30.5)
  const hx = (w - mount) / 2
  const hy = mm(o.holeY ?? 4.2)
  // a taller board has more power stages and its motor pads are spread further down
  const t = bodyH / mm(36.5)
  const spread = o.batSpread ?? 50
  const link = frontPins({ top: [['ESC', o.link ?? 'NC CUR M4 M3 M2 M1 BAT GND']] }, { w, h, kind: 'esc' })

  const motor = []
  const top = Math.round(76 * t)
  const low = Math.round(196 * t)
  const edge = { M4: [34, top], M3: [34, low], M2: [w - 34, top], M1: [w - 34, low] }
  for (const name of ['M1', 'M2', 'M3', 'M4']) {
    const [x, y0] = edge[name]
    for (let i = 0; i < 3; i++) {
      motor.push({ id: `${name.toLowerCase()}${'abc'[i]}`, label: name, x, y: y0 + i * 30, shape: 'pad', size: [46, 24], hit: 22, motor: { group: name, index: i } })
    }
  }
  const power = [
    { id: 'batn', label: 'BAT-', x: cx - spread, y: h - 40, shape: 'pad', size: [60, 40], big: true, tin: true, hit: 30, rail: 'gnd' },
    { id: 'batp', label: 'BAT+', x: cx + spread, y: h - 40, shape: 'pad', size: [60, 40], big: true, tin: true, hit: 30, rail: 'vbat' },
    { id: 'capn', label: 'CAP-', x: cx - 24, y: bodyH - 22, shape: 'round', size: [20, 20], hit: 20, rail: 'gnd' },
    { id: 'capp', label: 'CAP+', x: cx + 24, y: bodyH - 22, shape: 'round', size: [20, 20], hit: 20, rail: 'vbat' },
  ]
  const pads = [...link, ...power, ...motor]
  const rows = Math.max(4, Math.round(4 * t))
  const pitch = Math.round(208 / rows) // the power stages fill the same height however many there are
  const outline = `M16 0 H${w - 16} Q${w} 0 ${w} 16 V${bodyH} H${tabR} V${h - 14} Q${tabR} ${h} ${tabR - 14} ${h} H${tabX + 14} Q${tabX} ${h} ${tabX} ${h - 14} V${bodyH} H0 V16 Q0 0 16 0 Z`
  return part({
    id: o.id,
    kind: 'esc',
    brand: o.brand ?? 'GEPRC',
    model: o.model,
    name: `${o.brand ?? 'GEPRC'} ${o.model}`,
    category: 'ESCs',
    blurb: o.blurb,
    specs: o.specs,
    source: o.source,
    w,
    h,
    pads,
    internal: [
      ['batp', 'capp', 'ESC.BAT'],
      ['batn', 'capn', 'ESC.GND'],
    ],
    art: {
      kind: 'esc',
      title: o.model,
      outline,
      holes: [[hx, hy], [w - hx, hy], [hx, hy + mount], [w - hx, hy + mount]],
      radius: 16,
      features: [
        ...Array.from({ length: rows }, (_, i) => i).flatMap((i) => [
          { t: 'fet', x: 84, y: 82 + i * pitch, w: 64, h: 40 },
          { t: 'fet', x: w - 84 - 64, y: 82 + i * pitch, w: 64, h: 40 },
        ]),
        { t: 'chip', x: cx - 34, y: Math.round(156 * t), w: 68, h: 68, die: true, label: 'MCU' },
        { t: 'coil', x: cx - 24, y: 80, w: 48, h: 40 },
        { t: 'cap', x: cx - 52, y: Math.round(262 * t), r: 15 },
        { t: 'cap', x: cx + 52, y: Math.round(262 * t), r: 15 },
        { t: 'title', x: cx, y: Math.round(140 * t), text: 'GEPRC', sub: false },
      ],
      backFeatures: [
        { t: 'ghost', x: 84, y: 82, w: 64, h: Math.round(200 * t) },
        { t: 'ghost', x: w - 84 - 64, y: 82, w: 64, h: Math.round(200 * t) },
        { t: 'ghost', x: cx - 34, y: Math.round(156 * t), w: 68, h: 68 },
        { t: 'title', x: cx, y: Math.round(140 * t), text: 'BOTTOM', sub: false },
      ],
    },
  })
}
