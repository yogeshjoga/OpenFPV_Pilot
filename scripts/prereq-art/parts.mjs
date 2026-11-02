import { C, art, rr, rn, ci, cn, el, pa, ln, wire, g, text, label } from './lib.mjs'

// a wire cut open: the jacket, and the copper strands inside
const cross = (cx, cy, R, jacket) => {
  const dots = [[0, 0]]
  const ring = (r, n) => { for (let i = 0; i < n; i += 1) dots.push([Math.cos((i / n) * Math.PI * 2) * r, Math.sin((i / n) * Math.PI * 2) * r]) }
  ring(R * 0.28, 6)
  ring(R * 0.52, 12)
  const strand = R * 0.12
  return ci(cx, cy, R, jacket) + cn(cx, cy, R * 0.68, C.copper) + dots.map(([x, y]) => cn(cx + x, cy + y, strand, '#e6a06a', `stroke="#8d4f1f" stroke-width="1.5"`)).join('')
}

const hex = (cx, cy, r, fill, extra = '') => pa(Array.from({ length: 6 }, (_, i) => `${i ? 'L' : 'M'}${cx + Math.cos((i / 6) * Math.PI * 2) * r} ${cy + Math.sin((i / 6) * Math.PI * 2) * r}`).join(' ') + ' Z', fill, extra)

const siliconeWire = (thick, R, count, gauge, words) => art(
  wire(`M90 ${210} C 250 130 330 330 480 250`, C.red, thick) + wire(`M90 ${290} C 250 210 330 410 480 330`, C.dark2, thick) +
  (count > 2 ? wire(`M90 ${370} C 250 290 330 490 480 410`, C.yellow, thick) : '') +
  cross(620, 270, R, C.red) +
  label(620, 270, 640, 130, 'Copper strands inside', 'middle') + label(620 + R * 0.95, 270 + R * 0.4, 700, 430, 'Silicone jacket', 'end') + label(250, 262, 120, 490, words, 'start'),
)

const xt = (scale, tag, words) => art(
  g(`translate(400 260) scale(${scale}) translate(-400 -260)`,
    wire('M190 238 L90 238', C.red, 16) + wire('M190 282 L90 282', C.dark2, 16) + rr(190, 200, 170, 120, 12, C.yellow) + rn(360, 222, 44, 30, 4, C.gold, `stroke="${C.ink}" stroke-width="3"`) + rn(360, 270, 44, 30, 4, C.gold, `stroke="${C.ink}" stroke-width="3"`) + text(236, 270, '+ −', 34, C.ink) +
    wire('M610 238 L710 238', C.red, 16) + wire('M610 282 L710 282', C.dark2, 16) + rr(440, 200, 170, 120, 12, C.yellow) + rn(440, 222, 34, 30, 3, C.dark) + rn(440, 270, 34, 30, 3, C.dark) + text(540, 270, '+ −', 34, C.ink)) +
  label(270, 200, 150, 120, 'Male plug: pins', 'start') + label(520, 200, 650, 120, 'Female plug: sockets', 'middle') + label(400, 330, 400, 440, words, 'middle'),
)

const jstPlug = (x, y, w, pins, body, tone) =>
  rr(x, y, w, 64, 8, body) + Array.from({ length: pins }, (_, i) => rn(x + 14 + i * ((w - 28) / pins), y + 14, (w - 28) / pins - 6, 36, 3, tone)).join('')

export const parts = {
  'silicone-14awg': () => siliconeWire(26, 52, 2, '14', '14 AWG: battery power'),
  'silicone-16awg': () => siliconeWire(18, 38, 3, '16', '16-18 AWG: motor wires'),
  'silicone-20awg': () => art(
    [[210, C.red], [250, C.yellow], [290, C.blue], [330, C.green]].map(([y, col]) => wire(`M90 ${y} C 230 ${y - 80} 340 ${y + 90} 470 ${y}`, col, 10)).join('') +
    cross(620, 270, 24, C.red) + cross(670, 270, 24, C.yellow) + cross(620, 320, 24, C.blue) + cross(670, 320, 24, C.green) +
    label(620, 262, 560, 150, 'Thin copper strands', 'middle') + label(240, 270, 110, 470, 'Signal wires: 20 to 30 AWG', 'start') + label(690, 340, 740, 430, 'Soft jacket', 'end'),
  ),

  'coax-cable': () => art(
    rr(100, 226, 190, 56, 14, C.dark) +
    rr(290, 234, 100, 40, 4, C.steelL) + Array.from({ length: 10 }, (_, i) => ln(298 + i * 10, 234, 286 + i * 10 + 20, 274, C.steelD, 2)).join('') +
    rr(390, 242, 80, 24, 3, C.white) + rr(470, 250, 110, 8, 2, C.copper) +
    rr(560, 214, 70, 80, 8, C.gold) + rr(630, 230, 70, 48, 6, C.gold) + Array.from({ length: 5 }, (_, i) => ln(640 + i * 12, 230, 640 + i * 12, 278, C.ink, 2)).join('') + ln(700, 254, 740, 254, C.gold, 8) +
    label(190, 226, 150, 130, 'Outer jacket', 'middle') + label(340, 234, 340, 130, 'Braided shield', 'middle') + label(430, 266, 460, 360, 'Insulator', 'middle') + label(520, 254, 560, 430, 'Centre wire carries the video signal', 'middle'),
  ),

  xt60: () => xt(1, 'XT60', '60 A: the battery plug'),
  xt30: () => xt(0.72, 'XT30', '30 A: smaller drones'),

  'balance-jst-xh': () => art(
    [['#1b1b1b', 200], ['#d64545', 230], ['#f2b705', 260], ['#3e8ef7', 290], ['#2f9e6a', 320]].map(([col, y]) => wire(`M110 ${y + 20} C 200 ${y + 20} 240 ${y} 290 ${y}`, col, 8)).join('') +
    rr(290, 180, 300, 80, 8, '#f1efe6') + Array.from({ length: 5 }, (_, i) => rn(304 + i * 55, 194, 44, 52, 3, '#cfc8b4')).join('') + Array.from({ length: 5 }, (_, i) => rn(318 + i * 55, 204, 16, 32, 2, C.gold)).join('') +
    rr(290, 300, 300, 80, 8, '#f1efe6') + Array.from({ length: 5 }, (_, i) => cn(326 + i * 55, 340, 12, C.gold, `stroke="${C.ink}" stroke-width="2"`)).join('') + text(440, 412, 'socket on the battery', 22, C.ink) +
    label(500, 220, 640, 150, 'JST-XH plug', 'middle') + label(160, 215, 110, 120, 'One thin wire per cell', 'start') + label(560, 340, 660, 440, 'Lets a charger check every cell', 'end'),
  ),

  'jst-connectors': () => art(
    wire('M110 190 L210 190', C.red, 8) + wire('M110 210 L210 210', C.dark2, 8) + jstPlug(210, 170, 200, 3, '#f1efe6', '#cfc8b4') + text(440, 218, 'PH 2.0', 30, C.ink, 'start') + text(440, 250, 'bigger plug, more current', 20, C.steelD, 'start') +
    wire('M110 300 L240 300', C.red, 6) + wire('M110 316 L240 316', C.dark2, 6) + jstPlug(240, 284, 140, 3, '#e8dfc4', '#bfb49a') + text(410, 322, 'SH 1.0', 30, C.ink, 'start') + text(410, 352, 'tiny: cameras, GPS', 20, C.steelD, 'start') +
    wire('M110 400 L270 400', C.red, 5) + wire('M110 414 L270 414', C.dark2, 5) + jstPlug(270, 384, 110, 3, C.dark2, C.dark) + text(400, 428, 'GH', 30, C.ink, 'start') + text(400, 458, 'locks in place', 20, C.steelD, 'start'),
  ),

  'dupont-servo': () => art(
    [[210, '#8b5a2b', C.red, C.yellow]].map(([y, a, b, c]) => wire(`M100 ${y} C 170 ${y} 190 ${y + 10} 250 ${y + 10}`, a, 8) + wire(`M100 ${y + 22} C 170 ${y + 22} 190 ${y + 32} 250 ${y + 32}`, b, 8) + wire(`M100 ${y + 44} C 170 ${y + 44} 190 ${y + 54} 250 ${y + 54}`, c, 8)).join('') +
    rr(250, 200, 120, 78, 6, C.dark) + Array.from({ length: 3 }, (_, i) => rn(266 + i * 34, 216, 22, 46, 2, C.gold)).join('') +
    [[360, C.red], [392, C.blue], [424, C.green], [456, C.yellow]].map(([y, col], i) => wire(`M440 ${y} C 520 ${y} 560 ${y} 620 ${y}`, col, 8) + rr(620, y - 15, 70, 30, 4, C.dark)).join('') +
    label(310, 200, 220, 120, 'Servo plug: signal, power, ground', 'start') + label(655, 376, 650, 480, 'Dupont jumper', 'middle'),
  ),

  capacitor: () => art(
    ln(374, 380, 374, 450, C.steel, 8) + ln(426, 380, 426, 430, C.steel, 8) +
    rr(320, 130, 160, 255, 16, '#1c2531') + rn(320, 130, 44, 255, 16, '#e8eef5') + Array.from({ length: 6 }, (_, i) => text(342, 175 + i * 36, '−', 34, C.ink)).join('') +
    el(400, 130, 80, 20, C.steelL) + pa('M340 130 L460 130', 'none', `stroke="${C.steelD}" stroke-width="3"`) +
    g('rotate(-90 420 270)', text(420, 276, '470µF 35V', 30, C.white)) +
    label(342, 330, 60, 300, 'Stripe marks the minus leg', 'start') + label(425, 400, 560, 440, 'Two legs: + and −', 'start') + label(470, 220, 560, 150, 'Capacity and voltage', 'start'),
  ),

  bec: () => art(
    wire('M240 220 L130 220', C.red, 12) + wire('M240 300 L130 300', C.dark2, 12) + wire('M560 220 L670 220', C.red, 12) + wire('M560 300 L670 300', C.dark2, 12) +
    rr(240, 170, 320, 200, 14, C.pcb) + Array.from({ length: 4 }, (_, i) => cn(262, 196 + i * 50, 9, C.gold)).join('') + Array.from({ length: 4 }, (_, i) => cn(538, 196 + i * 50, 9, C.gold)).join('') +
    rr(290, 200, 90, 80, 6, C.dark) + rr(400, 220, 70, 70, 6, C.dark2) + text(435, 262, 'IC', 26, C.white) + rr(300, 300, 50, 48, 24, '#1c2531') + text(480, 340, '5V', 38, C.white) +
    label(190, 220, 60, 120, 'Battery in (up to 25 V)', 'start') + label(335, 240, 300, 440, 'Coil and chip steady the voltage', 'start') + label(610, 220, 760, 130, 'Steady 5 V out', 'end'),
  ),

  'sma-connectors': () => art(
    rr(120, 212, 72, 96, 8, C.gold) + rr(192, 228, 110, 64, 6, C.gold) + Array.from({ length: 6 }, (_, i) => ln(204 + i * 16, 228, 204 + i * 16, 292, C.ink, 2)).join('') + ln(302, 260, 372, 260, C.gold, 9) + ln(302, 260, 372, 260, C.ink, 2) +
    rr(608, 212, 72, 96, 8, C.gold) + rr(498, 228, 110, 64, 6, C.gold) + ci(498, 260, 14, C.dark) + Array.from({ length: 6 }, (_, i) => ln(510 + i * 16, 228, 510 + i * 16, 292, C.ink, 2)).join('') +
    wire('M120 260 L60 260', C.dark2, 8) + wire('M680 260 L740 260', C.dark2, 8) +
    label(340, 260, 280, 150, 'Centre pin', 'middle') + label(498, 260, 560, 360, 'Hole for the pin', 'middle') + label(250, 228, 160, 420, 'Screws on by its thread', 'start') + text(300, 480, 'RP-SMA swaps the pin and the hole', 24, C.ink, 'middle'),
  ),

  'ufl-mmcx': () => art(
    rr(100, 330, 260, 120, 10, C.pcb) + ci(230, 390, 30, C.gold) + ci(230, 390, 14, C.dark2) + cn(230, 390, 5, C.gold) +
    ci(230, 250, 28, C.steel) + cn(230, 250, 10, C.dark2) + ln(230, 280, 230, 336, C.steelD, 6) + wire('M230 222 C 260 150 420 130 520 190', C.dark2, 6) +
    ci(600, 350, 46, C.gold) + ci(600, 350, 30, C.steelD) + ci(600, 350, 12, C.gold) + rr(570, 230, 60, 70, 8, C.gold) + ln(600, 300, 600, 308, C.ink, 4) +
    label(230, 390, 130, 480, 'U.FL: tiny, presses on', 'start') + label(600, 350, 700, 470, 'MMCX: round, snaps on', 'end') + label(450, 160, 450, 90, 'Thin cable to the antenna', 'middle'),
  ),

  'frame-screws-nuts': () => art(
    [[160, 0], [250, 0]].map(([x]) => rr(x, 170, 70, 28, 6, C.steelL) + hex(x + 35, 184, 8, C.dark) + rr(x + 14, 198, 42, 170, 3, C.steel) + Array.from({ length: 11 }, (_, i) => ln(x + 14, 208 + i * 15, x + 56, 214 + i * 15, C.steelD, 2)).join('')).join('') +
    hex(520, 270, 62, C.steel) + ci(520, 270, 36, C.white) + ci(520, 270, 28, '#cfd6df') + cn(520, 270, 12, C.paper, `stroke="${C.ink}" stroke-width="2"`) +
    hex(640, 340, 50, C.steel) + ci(640, 340, 28, '#9fb4ff') + ci(640, 340, 12, C.paper) +
    label(195, 184, 120, 120, 'Hex socket head', 'start') + label(300, 300, 300, 420, 'Thread: M2 / M3', 'middle') + label(560, 270, 600, 160, 'Nylon ring: will not vibrate loose', 'middle'),
  ),

  standoffs: () => art(
    rr(130, 360, 540, 26, 4, C.dark) + rr(130, 150, 540, 26, 4, C.dark) +
    [[210, C.steel, C.steelD], [340, C.steel, C.steelD], [470, C.blue, '#2a69c4'], [590, C.blue, '#2a69c4']].map(([x, col, edge]) =>
      rr(x - 22, 176, 44, 184, 3, col) + ln(x - 22, 230, x + 22, 230, edge, 2) + ln(x - 22, 306, x + 22, 306, edge, 2) + rr(x - 12, 130, 24, 20, 4, C.steelL) + rr(x - 12, 386, 24, 20, 4, C.steelL)).join('') +
    label(210, 268, 130, 440, 'Aluminium: strong', 'start') + label(590, 268, 700, 500, 'Nylon: light and cheap', 'end') + label(400, 163, 400, 90, 'Keeps the plates apart', 'middle'),
  ),

  'rubber-grommets': () => art(
    rr(130, 360, 540, 28, 4, C.dark) + rr(150, 270, 500, 22, 3, C.pcb) + rn(372, 268, 56, 26, 0, C.paper) +
    rr(346, 238, 108, 28, 14, C.dark2) + rn(372, 262, 56, 66, 0, C.dark2, `stroke="${C.ink}" stroke-width="3"`) + rr(346, 292, 108, 28, 14, C.dark2) +
    rr(392, 196, 16, 168, 3, C.steel) + rr(372, 182, 56, 18, 6, C.steelL) +
    pa('M120 330 q18 -22 36 0 t36 0', 'none', `stroke="${C.red}" stroke-width="5"`) + pa('M610 330 q18 -22 36 0 t36 0', 'none', `stroke="${C.red}" stroke-width="5"`) +
    label(450, 252, 590, 160, 'Soft rubber mount', 'start') + label(230, 281, 140, 210, 'Flight controller board', 'start') + label(150, 330, 130, 450, 'Motor vibration', 'start'),
  ),

  'carbon-arms': () => art(
    '<defs><pattern id="cw" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#23272e"/><path d="M0 0h8v8H0zM8 8h8v8H8z" fill="#3c434f"/></pattern></defs>' +
    pa('M110 220 L560 200 Q650 200 650 260 Q650 320 560 320 L110 300 Z', 'url(#cw)') + rr(210, 250, 90, 22, 11, C.paper) + rr(340, 250, 90, 22, 11, C.paper) +
    ci(580, 260, 38, C.dark2) + ci(580, 260, 12, C.paper) + [[-26, 0], [26, 0], [0, -26], [0, 26]].map(([x, y]) => cn(580 + x, 260 + y, 5, C.paper)).join('') +
    rr(110, 200, 36, 120, 4, C.steelD) + cn(128, 230, 6, C.paper) + cn(128, 290, 6, C.paper) +
    label(300, 215, 250, 120, 'Carbon-fibre weave', 'middle') + label(580, 260, 640, 400, 'Motor mount holes', 'middle') + label(128, 260, 120, 420, 'Bolts to the frame body', 'start'),
  ),

  'battery-strap': () => art(
    rr(90, 220, 620, 44, 6, C.dark2) + Array.from({ length: 22 }, (_, i) => ln(110 + i * 27, 222, 110 + i * 27, 262, C.dark, 2)).join('') +
    rr(540, 204, 90, 76, 8, C.steel) + rr(556, 226, 58, 32, 4, C.dark) +
    rr(220, 320, 360, 110, 14, '#2c333d') + Array.from({ length: 5 }, (_, r) => Array.from({ length: 12 }, (_, c) => cn(250 + c * 28, 340 + r * 20, 5, '#46505e')).join('')).join('') +
    label(300, 242, 220, 150, 'Strap holds the battery', 'start') + label(585, 242, 640, 150, 'Buckle', 'middle') + label(400, 380, 620, 470, 'Rubber pad stops sliding', 'middle'),
  ),

  'flight-controller': () => art(
    rr(240, 110, 320, 320, 18, '#20242c') + [[262, 132], [538, 132], [262, 408], [538, 408]].map(([x, y]) => ci(x, y, 13, C.gold) + cn(x, y, 6, C.paper)).join('') +
    Array.from({ length: 6 }, (_, i) => rn(246, 190 + i * 34, 18, 22, 2, C.gold)).join('') + Array.from({ length: 6 }, (_, i) => rn(536, 190 + i * 34, 18, 22, 2, C.gold)).join('') +
    rr(340, 220, 120, 120, 8, '#0f1115') + cn(360, 240, 5, C.steelD) + rr(290, 150, 44, 44, 5, '#0f1115') + rr(460, 360, 60, 30, 4, '#0f1115') +
    rr(360, 416, 80, 34, 6, C.steel) + rn(372, 426, 56, 14, 2, C.dark) + text(400, 288, 'MCU', 30, C.steelL),
    label(448, 232, 600, 190, 'Processor: the brain', 'start') + label(312, 172, 120, 90, 'Gyro: feels tilt', 'start') + label(255, 280, 100, 400, 'Solder pads', 'start') + label(400, 433, 500, 490, 'USB: tune it here', 'start'),
  ),

  'esc-4in1': () => art(
    rr(200, 120, 400, 310, 16, '#20242c') + [[236, 156], [564, 156], [236, 394], [564, 394]].map(([x, y]) => ci(x, y, 24, C.gold) + cn(x, y, 8, C.paper) + [[-8, -6], [8, -6], [0, 8]].map(([dx, dy]) => cn(x + dx * 2, y + dy * 2, 0.1, C.gold)).join('')).join('') +
    [[300, 150], [440, 150], [300, 340], [440, 340]].map(([x, y]) => Array.from({ length: 3 }, (_, i) => rr(x + i * 34, y, 28, 36, 4, '#0f1115')).join('')).join('') +
    rr(140, 250, 86, 110, 8, C.gold) + cn(168, 290, 8, C.paper) + cn(168, 330, 8, C.paper) + rr(560, 250, 58, 110, 8, '#1c2531') +
    label(236, 156, 150, 90, 'Motor pads (4)', 'start') + label(183, 305, 80, 430, 'Battery in', 'start') + label(380, 168, 560, 90, 'Power chips run the motors', 'start') + label(590, 305, 700, 460, 'Capacitor', 'end'),
  ),

  receiver: () => art(
    wire('M330 240 C 300 170 250 140 190 130', C.dark2, 6) + ln(190, 130, 110, 112, C.white, 8) + ln(190, 130, 110, 112, C.ink, 2) +
    wire('M470 240 C 500 170 550 140 610 130', C.dark2, 6) + ln(610, 130, 690, 112, C.white, 8) + ln(610, 130, 690, 112, C.ink, 2) +
    rr(290, 240, 220, 110, 10, '#20242c') + rr(340, 262, 70, 64, 6, '#0f1115') + cn(450, 296, 12, C.red) + Array.from({ length: 6 }, (_, i) => rn(310 + i * 32, 350, 16, 36, 2, C.gold)).join('') +
    label(150, 122, 120, 70, 'Two antennas', 'start') + label(375, 294, 560, 260, 'Radio chip', 'start') + label(400, 380, 520, 450, 'Pins to the flight controller', 'middle'),
  ),

  'vtx-camera': () => art(
    wire('M250 290 C 330 290 360 320 440 310', C.red, 6) +
    rr(120, 220, 130, 140, 14, C.dark2) + ci(185, 290, 46, '#0d1b2a') + ci(185, 290, 28, '#1b4f9a') + cn(175, 280, 8, C.white, 'opacity=".7"') +
    rr(430, 230, 180, 120, 10, C.pcb) + rr(460, 250, 80, 64, 4, C.steel) + Array.from({ length: 5 }, (_, i) => rn(450 + i * 30, 350, 14, 26, 2, C.gold)).join('') +
    wire('M590 232 C 610 180 640 150 690 120', C.dark2, 6) + ln(690, 120, 720, 100, C.white, 8) + ln(690, 120, 720, 100, C.ink, 2) +
    label(185, 232, 150, 150, 'FPV camera lens', 'start') + label(500, 282, 420, 170, 'VTX sends video to goggles', 'start') + label(715, 102, 700, 60, 'Antenna', 'middle'),
  ),

  'heat-shrink': () => art(
    wire('M100 170 L330 170', C.red, 14) + wire('M470 170 L700 170', C.red, 14) + el(400, 170, 80, 16, C.steelL) +
    wire('M100 350 L330 350', C.red, 14) + wire('M470 350 L700 350', C.red, 14) + rr(300, 322, 200, 56, 24, C.dark) + rn(310, 330, 180, 8, 4, C.dark2, 'opacity=".9"') +
    pa('M400 205 L400 300 M388 288 L400 304 L412 288', 'none', `stroke="${C.orange}" stroke-width="6"`) + pa('M450 240 q10 -14 20 0 t20 0 t20 0', 'none', `stroke="${C.orange}" stroke-width="5"`) +
    label(400, 182, 120, 100, 'Bare solder joint: a short risk', 'start') + label(500, 350, 620, 450, 'Tube shrinks tight', 'middle') + label(500, 240, 640, 270, 'Heat it', 'start'),
  ),

  'lipo-checker': () => art(
    rr(260, 130, 280, 210, 24, C.dark) + rr(284, 156, 232, 118, 10, '#0d2218') +
    text(340, 205, '3.82', 36, '#4ade80') + text(450, 205, '3.81', 36, '#4ade80') + text(340, 255, '3.83', 36, '#4ade80') + text(450, 255, '3.82', 36, '#4ade80') +
    text(500, 175, 'V', 18, '#4ade80') + ci(300, 305, 10, C.red) + ci(500, 305, 10, C.green) +
    wire('M400 340 C 400 380 400 380 400 392', C.white, 6) + rr(340, 392, 120, 44, 8, '#f1efe6') + Array.from({ length: 5 }, (_, i) => rn(352 + i * 22, 402, 12, 24, 2, C.gold)).join('') +
    label(850 - 450, 175, 120, 90, 'Voltage of every cell', 'start') + label(400, 414, 560, 470, 'Plugs into the balance lead', 'start') + label(500, 305, 640, 330, 'Beeps if low', 'start'),
  ),

  'lipo-bag': () => art(
    rr(290, 96, 220, 90, 12, C.blue) + text(400, 150, 'LiPo', 36, C.white) +
    rr(170, 150, 460, 300, 26, '#d94a3d') + rr(170, 150, 460, 76, 26, '#a93225') + ln(190, 226, 610, 226, C.paper, 4, 'stroke-dasharray="14 10"') +
    pa('M400 296 q50 36 40 86 q-14 36 -40 36 q-40 0 -48 -40 q-6 -26 20 -52 q2 22 14 30 q-6 -34 14 -60 Z', C.yellow) + pa('M400 350 q22 14 18 38 q-8 12 -18 12 q-18 -2 -20 -20 q4 -14 20 -30 Z', C.orange) +
    label(610, 330, 700, 300, 'Fire-resistant bag', 'end') + label(400, 226, 120, 120, 'Zip it shut', 'start') + label(400, 140, 580, 80, 'Charge and store inside', 'start'),
  ),

  'usb-c-cable': () => art(
    wire('M190 320 C 240 470 560 470 610 320', C.dark2, 14) +
    rr(100, 280, 100, 72, 16, C.steel) + rr(112, 296, 76, 40, 10, C.dark) + rn(120, 308, 60, 16, 8, C.steelL) +
    rr(610, 284, 110, 64, 6, C.steelL) + rr(624, 296, 82, 40, 3, C.dark) + rn(632, 308, 66, 14, 2, C.steelL) +
    label(150, 280, 60, 190, 'USB-C plug: the small end', 'start') + label(670, 284, 760, 190, 'USB-A plug: goes in the computer', 'end') + label(400, 440, 400, 500, 'Must be a DATA cable, not charge-only', 'middle'),
  ),

  'raspberry-pi': () => art(
    rr(170, 140, 460, 280, 14, '#1f8a4c') + [[192, 162], [608, 162], [192, 398], [608, 398]].map(([x, y]) => cn(x, y, 9, C.paper, `stroke="${C.gold}" stroke-width="3"`)).join('') +
    rr(210, 150, 330, 34, 4, C.dark) + Array.from({ length: 20 }, (_, i) => cn(224 + i * 16, 160, 4, C.gold) + cn(224 + i * 16, 174, 4, C.gold)).join('') +
    rr(330, 240, 96, 96, 8, C.steel) + rr(340, 250, 76, 76, 4, C.steelL) + text(378, 296, 'CPU', 24, C.ink) + rr(250, 260, 56, 56, 4, '#111') +
    rr(560, 200, 70, 74, 6, C.steelL) + rr(560, 290, 70, 74, 6, C.steelL) + rr(448, 380, 60, 40, 4, C.dark) + rr(250, 380, 44, 40, 4, C.dark) + rr(310, 380, 44, 40, 4, C.dark) +
    label(380, 160, 580, 90, 'GPIO pins connect sensors', 'start') + label(345, 330, 130, 470, 'CPU: the computer’s brain', 'start') + label(630, 280, 700, 440, 'USB and network ports', 'end'),
  ),
}
