// GEPRC stack boards, from the maker's product manuals (https://geprc.com/electronics/fc-manual/).
// Only the facts are taken from the manuals: sizes, pad and connector names, and where each one sits. The drawings are
// our own, in the bench's own style.
import { MM, backPads, joinByLabel, part, pinRow } from './build.js'

const SOURCE = { label: 'GEPRC product manual', url: 'https://geprc.com/electronics/fc-manual/' }
const mm = (v) => Math.round(v * MM)

// ---------------------------------------------------------------------------------------------------------------
// Flight controllers: connectors on the front, solder pads on the back.
// ---------------------------------------------------------------------------------------------------------------

/**
 * Back pads as the manual shows them: rows of (outer, inner) on the left and (inner, outer) on the right, and a short
 * row by the USB port. A row on the left may be a single name when the board has only one column there.
 */
function rowsOf({ w, left, right, bottom, y0 = 60, pitch = 22 }) {
  const list = []
  const colL = [34, 74]
  const colR = [w - 74, w - 34]
  left.forEach((row, i) => {
    const cells = Array.isArray(row) ? row : [row]
    cells.forEach((label, c) => list.push([label, cells.length === 1 ? colL[0] : colL[c], y0 + i * pitch]))
  })
  right.forEach((row, i) => row.forEach((label, c) => list.push([label, colR[c], y0 + i * pitch])))
  bottom.forEach((label, i) => list.push([label, w / 2 - 100 + i * 40, 308]))
  return list
}

function flightController(o) {
  const w = mm(o.mmSize)
  const h = w
  const groups = [
    { group: 'LED', labels: ['GND', '5V', 'LED'], x: 14, y: 50, side: 'left' },
    { group: 'ESC', labels: o.escLink, x: 14, y: 110, side: 'left' },
    { group: 'CAM', labels: ['CAM', 'GND', '5V'], x: 14, y: 250, side: 'left' },
    { group: 'UART2', labels: ['GND', '5V', 'R2', 'T2'], x: w - 14, y: 50, side: 'right' },
    { group: 'DJI', labels: o.dji, x: w - 14, y: 126, side: 'right' },
    { group: 'VTX', labels: o.vtx, x: w - 14, y: 234, side: 'right' },
  ]
  const pins = groups.flatMap((g) => pinRow({ ...g, kind: 'fc' }))
  const back = backPads({ kind: 'fc', w, list: rowsOf({ w, left: o.backLeft, right: o.backRight, bottom: ['LED', 'BOOT', ...o.usbPads, '5V', 'GND'] }) })
  const pads = [...pins, ...back]
  const hole = (w - mm(30.5)) / 2
  return part({
    id: o.id,
    kind: 'fc',
    brand: 'GEPRC',
    model: o.model,
    name: `GEPRC ${o.model}`,
    category: 'Flight controllers',
    blurb: o.blurb,
    specs: o.specs,
    source: SOURCE,
    w,
    h,
    pads,
    internal: joinByLabel(pads),
    art: {
      kind: 'fc',
      title: o.model,
      holes: [[hole, hole], [w - hole, hole], [hole, h - hole], [w - hole, h - hole]],
      radius: 16,
      features: o.features(w, h),
      backFeatures: o.backFeatures(w, h),
    },
  })
}

const backSide = (w) => [
  { t: 'ghost', x: w / 2 - 36, y: 120, w: 72, h: 72 },
  { t: 'ghost', x: w / 2 - 22, y: 214, w: 44, h: 22 },
  { t: 'title', x: w / 2, y: 262, text: 'BOTTOM' },
]

const f405 = flightController({
  id: 'geprc-f405-hd-v3',
  model: 'GEP-F405-HD V3',
  mmSize: 37.2,
  blurb: 'F405 flight controller for digital HD systems. 6 UARTs, and a 12 V regulator for the video unit.',
  specs: ['STM32F405, ICM-42688-P gyro', '37.2 x 37.2 mm, 30.5 mm mounting', '3S to 6S', '5 V 3 A and 12 V 2.5 A regulators', '6 UARTs'],
  escLink: ['R4', 'CUR', 'M4', 'M3', 'M2', 'M1', 'BAT', 'GND'],
  dji: ['S.B', 'GND', 'R1', 'T1', 'GND', '12V'],
  vtx: ['GND', '12V', 'VTX', 'T1'],
  backLeft: [['5V', '5V'], ['GND', 'BZ-'], ['CAM', 'LED'], ['GND', 'GND'], ['BAT', 'T5'], ['M1', 'R5'], ['M2', '5V'], ['M3', 'GND'], ['M4', 'M5'], ['CUR', 'M6'], ['R4', 'T4']],
  backRight: [['BAT', 'VTX'], ['GND', '12V'], ['5V', 'GND'], ['R6', 'T1'], ['T6', 'R1'], ['SCL', 'GND'], ['SDA', 'SBUS'], ['T3', 'T2'], ['R3', 'R2'], ['5V', '5V'], ['GND', 'GND']],
  usbPads: ['DP', 'DM'],
  features: (w, h) => [
    { t: 'chip', x: w / 2 - 41, y: 108, w: 82, h: 82, die: true, label: 'STM32F405' },
    { t: 'chip', x: w / 2 - 70, y: 214, w: 30, h: 30, label: 'ICM42688' },
    { t: 'chip', x: w / 2 + 40, y: 216, w: 40, h: 26, label: 'FLASH' },
    { t: 'coil', x: w / 2 + 40, y: 56, w: 40, h: 40 },
    { t: 'coil', x: w / 2 - 6, y: 56, w: 40, h: 40 },
    { t: 'cap', x: w / 2 - 48, y: 76, r: 14 },
    { t: 'usb', x: w / 2, y: h - 22 },
    { t: 'button', x: w / 2 - 62, y: h - 26 },
    { t: 'led', x: w / 2 + 60, y: h - 26 },
    { t: 'title', x: w / 2, y: 268, text: 'GEPRC' },
  ],
  backFeatures: (w) => backSide(w),
})

const f722 = flightController({
  id: 'geprc-f722-bt-hd-v3',
  model: 'GEP-F722-BT-HD V3',
  mmSize: 36.9,
  blurb: 'F722 flight controller for digital HD systems, with Bluetooth for settings from a phone.',
  specs: ['STM32F722, Bluetooth on UART4', '36.9 x 36.9 mm', '3S to 6S', '5 V 3 A and 9 V 2.5 A regulators'],
  escLink: ['RX5', 'CUR', 'M4', 'M3', 'M2', 'M1', 'BAT', 'GND'],
  dji: ['R2', 'GND', 'R1', 'T1', 'GND', '9V'],
  vtx: ['GND', '9V', 'VTX', 'T1'],
  backLeft: ['5V', 'GND', 'CAM', 'GND', 'BAT', 'M1', 'M2', 'M3', 'M4', 'CUR', 'R5'],
  backRight: [['VSW', 'VTX'], ['GND', '9V'], ['5V', 'GND'], ['R5', 'T1'], ['T5', 'R1'], ['T3', 'GND'], ['R3', 'R2'], ['BZ-', 'T2'], ['LED', 'R2'], ['5V', '5V'], ['GND', 'GND']],
  usbPads: ['OP', 'OM'],
  features: (w, h) => [
    { t: 'chip', x: w / 2 - 41, y: 108, w: 82, h: 82, die: true, label: 'STM32F722' },
    { t: 'chip', x: w / 2 - 70, y: 214, w: 30, h: 30, label: 'GYRO' },
    { t: 'chip', x: w / 2 + 40, y: 216, w: 40, h: 26, label: 'FLASH' },
    { t: 'module', x: w / 2 + 14, y: 56, w: 66, h: 36, label: 'BT' },
    { t: 'coil', x: w / 2 - 62, y: 56, w: 40, h: 40 },
    { t: 'cap', x: w / 2 - 6, y: 76, r: 13 },
    { t: 'usb', x: w / 2, y: h - 22 },
    { t: 'button', x: w / 2 - 62, y: h - 26 },
    { t: 'led', x: w / 2 + 60, y: h - 26 },
    { t: 'title', x: w / 2, y: 268, text: 'GEPRC' },
  ],
  backFeatures: (w) => backSide(w),
})

// ---------------------------------------------------------------------------------------------------------------
// 4-in-1 ESCs: 42 x 45.7 mm with a narrow tab for the battery pads. Motor pads at the corners, the 8-pin link on top.
// ---------------------------------------------------------------------------------------------------------------

function esc(o) {
  const w = mm(42)
  const h = mm(45.7)
  const bodyH = mm(36.5)
  const tab = mm(22)
  const tabX = (w - tab) / 2
  const cx = w / 2
  const hole = (w - mm(30.5)) / 2
  const holeY = mm(4.2)
  const link = pinRow({ group: 'ESC', kind: 'esc', labels: ['NC', 'CUR', 'M4', 'M3', 'M2', 'M1', 'BAT', 'GND'], x: cx - 56, y: 18, pitch: 16, along: 'x', side: 'down' })

  const motor = []
  const edge = { M4: [34, 76], M3: [34, 196], M2: [w - 34, 76], M1: [w - 34, 196] }
  for (const name of ['M1', 'M2', 'M3', 'M4']) {
    const [x, y0] = edge[name]
    for (let i = 0; i < 3; i++) {
      motor.push({ id: `${name.toLowerCase()}${'abc'[i]}`, label: name, x, y: y0 + i * 30, shape: 'pad', size: [46, 24], hit: 22, motor: { group: name, index: i } })
    }
  }
  const power = [
    { id: 'batn', label: 'BAT-', x: cx - 50, y: h - 40, shape: 'pad', size: [60, 40], big: true, tin: true, hit: 30, rail: 'gnd' },
    { id: 'batp', label: 'BAT+', x: cx + 50, y: h - 40, shape: 'pad', size: [60, 40], big: true, tin: true, hit: 30, rail: 'vbat' },
    { id: 'capn', label: 'CAP-', x: cx - 24, y: bodyH - 22, shape: 'round', size: [20, 20], hit: 20, rail: 'gnd' },
    { id: 'capp', label: 'CAP+', x: cx + 24, y: bodyH - 22, shape: 'round', size: [20, 20], hit: 20, rail: 'vbat' },
  ]
  const pads = [...link, ...power, ...motor]
  const tabR = tabX + tab
  const outline = `M16 0 H${w - 16} Q${w} 0 ${w} 16 V${bodyH} H${tabR} V${h - 14} Q${tabR} ${h} ${tabR - 14} ${h} H${tabX + 14} Q${tabX} ${h} ${tabX} ${h - 14} V${bodyH} H0 V16 Q0 0 16 0 Z`
  return part({
    id: o.id,
    kind: 'esc',
    brand: 'GEPRC',
    model: o.model,
    name: `GEPRC ${o.model}`,
    category: 'ESCs',
    blurb: o.blurb,
    specs: o.specs,
    source: SOURCE,
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
      holes: [[hole, holeY], [w - hole, holeY], [hole, holeY + mm(30.5)], [w - hole, holeY + mm(30.5)]],
      radius: 16,
      features: [
        ...[0, 1, 2, 3].flatMap((i) => [
          { t: 'fet', x: 84, y: 82 + i * 52, w: 64, h: 40 },
          { t: 'fet', x: w - 84 - 64, y: 82 + i * 52, w: 64, h: 40 },
        ]),
        { t: 'chip', x: cx - 34, y: 156, w: 68, h: 68, die: true, label: 'MCU' },
        { t: 'coil', x: cx - 24, y: 80, w: 48, h: 40 },
        { t: 'cap', x: cx - 52, y: 262, r: 15 },
        { t: 'cap', x: cx + 52, y: 262, r: 15 },
        { t: 'title', x: cx, y: 140, text: 'GEPRC', sub: false },
      ],
      backFeatures: [
        { t: 'ghost', x: 84, y: 82, w: 64, h: 200 },
        { t: 'ghost', x: w - 84 - 64, y: 82, w: 64, h: 200 },
        { t: 'ghost', x: cx - 34, y: 156, w: 68, h: 68 },
        { t: 'title', x: cx, y: 140, text: 'BOTTOM', sub: false },
      ],
    },
  })
}

const h65 = esc({
  id: 'geprc-taker-h65',
  model: 'TAKER H65_8S_BLS 65A',
  blurb: '4-in-1 ESC for big builds. 3S to 8S and 65 A for each motor.',
  specs: ['65 A continuous, 3S to 8S', '42 x 45.7 mm, 30.5 mm mounting', 'About 14.9 g'],
})
const h60 = esc({
  id: 'geprc-taker-h60',
  model: 'TAKER H60_BLS 60A',
  blurb: '4-in-1 ESC with 60 A for each motor, for 3S to 6S builds.',
  specs: ['60 A continuous, 3S to 6S', '42 x 45.7 mm, 30.5 mm mounting'],
})

export const GEPRC = [f405, f722, h65, h60]
