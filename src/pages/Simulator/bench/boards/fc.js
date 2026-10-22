// A flight controller from a short description: its size, the connectors on the front and the pads on the back.
import { backPads, frontPins, joinByLabel, mm, part } from './build.js'

/**
 * spec: {
 *   id, brand, model, blurb, specs: [], source,
 *   mm: 37.2 | [w, h], mount: 30.5,
 *   front, back                       as in build.js
 *   mcu: 'STM32F405', usb: 'top' | 'bottom' | 'left' | 'right', module: 'BT'   what is drawn on the board
 * }
 */
export function flightController(o) {
  const [wmm, hmm] = Array.isArray(o.mm) ? o.mm : [o.mm, o.mm]
  const w = mm(wmm)
  const h = mm(hmm)
  const pads = [...frontPins(o.front, { w, h, kind: 'fc' }), ...backPads(o.back, { w, h, kind: 'fc' })]
  const hx = (w - mm(o.mount ?? 30.5)) / 2
  const hy = (h - mm(o.mount ?? 30.5)) / 2
  const cx = w / 2
  const cy = h / 2
  const usb = o.usb ?? 'bottom'
  const usbAt = { top: [cx, 20], bottom: [cx, h - 18], left: [18, cy], right: [w - 18, cy] }[usb]
  const features = [
    { t: 'chip', x: cx - 41, y: cy - 62, w: 82, h: 82, die: true, label: o.mcu },
    { t: 'chip', x: cx - 74, y: cy + 36, w: 30, h: 30, label: 'IMU' },
    { t: 'chip', x: cx + 36, y: cy + 40, w: 40, h: 26, label: 'FLASH' },
    { t: 'coil', x: cx - 62, y: 64, w: 40, h: 40 },
    o.module ? { t: 'module', x: cx + 10, y: 64, w: 66, h: 36, label: o.module } : { t: 'coil', x: cx + 22, y: 64, w: 40, h: 40 },
    { t: 'cap', x: cx - 8, y: 84, r: 13 },
    { t: 'usb', x: usbAt[0], y: usbAt[1], side: usb },
    { t: 'title', x: cx, y: cy + 80, text: 'GEPRC', sub: false },
  ]
  return part({
    id: o.id,
    kind: 'fc',
    brand: o.brand ?? 'GEPRC',
    model: o.model,
    name: `${o.brand ?? 'GEPRC'} ${o.model}`,
    category: 'Flight controllers',
    blurb: o.blurb,
    specs: o.specs,
    source: o.source,
    w,
    h,
    pads,
    internal: joinByLabel(pads),
    art: {
      kind: 'fc',
      title: o.model,
      holes: [[hx, hy], [w - hx, hy], [hx, h - hy], [w - hx, h - hy]],
      radius: 16,
      features,
      backFeatures: [
        { t: 'ghost', x: cx - 36, y: cy - 56, w: 72, h: 72 },
        { t: 'ghost', x: cx - 22, y: cy + 36, w: 44, h: 22 },
        { t: 'title', x: cx, y: cy + 80, text: 'BOTTOM', sub: false },
      ],
    },
  })
}
