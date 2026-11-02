import { C, art, rr, rn, ci, cn, el, pa, ln, wire, g, text, label, zigzag } from './lib.mjs'

// the two halves of a pair of pliers or cutters: chunky jaws on the left, handles on the right, jaws just touching
const pliers = (jawLen, tipH, handle, upperExtra = '', lowerExtra = '') =>
  g('rotate(-3.5 380 262)', pa(`M${380 - jawLen} 262 L${380 - jawLen} ${262 - tipH} L380 224 L380 262 Z`, C.steel) + upperExtra + pa('M380 224 L720 190 L728 228 L380 262 Z', handle)) +
  g('rotate(3.5 380 262)', pa(`M${380 - jawLen} 262 L${380 - jawLen} ${262 + tipH} L380 300 L380 262 Z`, C.steel) + lowerExtra + pa('M380 300 L720 334 L728 296 L380 262 Z', handle)) +
  ci(380, 262, 16, C.steelL) + cn(380, 262, 5, C.steelD)

export const tools = {
  'soldering-iron': () => art(
    rr(110, 290, 310, 140, 22, C.dark) + rn(110, 290, 310, 42, 22, C.dark2) +
    rr(140, 345, 130, 64, 8, '#0d2218') + text(205, 392, '350°', 44, '#4ade80') +
    ci(350, 378, 34, C.steel) + ln(350, 378, 350, 352) + cn(305, 352, 6, C.orange) + cn(305, 372, 6, C.steelD) +
    rr(500, 388, 200, 42, 10, C.dark) + zigzag(520, 345, 160, 36, 12) +
    wire('M470 300 C 440 320 440 330 410 350', C.dark2, 9) +
    g('rotate(14 470 300)', rr(470, 282, 210, 38, 19, C.orange) + rr(560, 282, 10, 38, 2, C.ink) + rr(580, 282, 10, 38, 2, C.ink) +
      pa('M680 290 L760 296 L760 306 L680 312 Z', C.steel) + pa('M760 296 L790 301 L760 306 Z', C.steelD)) +
    label(205, 350, 130, 250, 'Temperature display', 'start') + label(766, 372, 780, 430, 'Hot tip', 'end') + label(600, 410, 600, 490, 'Iron stand', 'middle'),
  ),

  'solder-wire': () => art(
    el(255, 260, 52, 170, C.steelL) + rr(255, 112, 215, 296, 0, '#c4ccd6', 'stroke-width="0"') +
    Array.from({ length: 21 }, (_, i) => ln(257, 124 + i * 14, 468, 124 + i * 14, C.steelD, 2.5)).join('') +
    ln(255, 112, 470, 112) + ln(255, 408, 470, 408) +
    el(470, 260, 52, 170, C.steelL) + el(470, 260, 22, 70, C.white) +
    wire('M498 150 C 590 120 640 200 640 270 C 640 330 690 350 720 330', C.steel, 7) +
    ci(716, 330, 24, C.steel) + cn(716, 330, 8, C.orange) +
    label(360, 200, 330, 85, 'Tin-lead or lead-free wire', 'middle') + label(716, 330, 750, 410, 'Flux core inside', 'end') + label(263, 340, 130, 470, 'Wound on a spool', 'start'),
  ),

  flux: () => art(
    rr(170, 215, 350, 90, 14, '#fff8e6') + rr(182, 226, 250, 68, 8, C.amber, 'stroke="none"') + ln(182, 226, 432, 226, '#fff', 3, 'opacity=".5"') +
    rr(150, 200, 26, 120, 8, C.steelL) + rr(520, 244, 100, 32, 5, C.steel) + rr(618, 200, 26, 120, 10, C.dark2) +
    pa('M170 245 L105 257 L105 263 L170 275 Z', C.steel) + pa('M105 257 L84 259.5 L84 260.5 L105 263 Z', C.steelD) +
    pa('M96 290 C 88 305 88 315 96 322 C 104 315 104 305 96 290 Z', C.amber) +
    label(300, 260, 300, 160, 'Flux paste', 'middle') + label(570, 260, 600, 360, 'Plunger', 'middle') + label(90, 261, 110, 420, 'Fine needle tip', 'start'),
  ),

  'solder-wick': () => art(
    ci(290, 270, 140, C.copper) + ci(290, 270, 104, '#dfa56f') + ci(290, 270, 70, C.copper) + ci(290, 270, 36, C.white) +
    Array.from({ length: 16 }, (_, i) => ln(290 + Math.cos((i * Math.PI) / 8) * 36, 270 + Math.sin((i * Math.PI) / 8) * 36, 290 + Math.cos((i * Math.PI) / 8) * 140, 270 + Math.sin((i * Math.PI) / 8) * 140, '#8d4f1f', 1.5, 'opacity=".5"')).join('') +
    pa('M420 300 L690 345 L680 395 L410 350 Z', '#dfa56f') +
    Array.from({ length: 12 }, (_, i) => ln(430 + i * 22, 308 + i * 3.6, 418 + i * 22, 358 + i * 3.6, '#8d4f1f', 2, 'opacity=".5"')).join('') +
    pa('M600 332 L690 345 L680 395 L596 381 Z', C.steelL) + ci(640, 372, 12, C.steel) +
    label(200, 200, 110, 80, 'Copper braid', 'start') + label(640, 372, 690, 450, 'Soaks up old solder', 'middle'),
  ),

  'solder-sucker': () => art(
    rr(230, 214, 370, 100, 50, '#d4e6ff') + zigzag(260, 250, 300, 28, 14) + rn(244, 232, 330, 6, 3, C.white, 'opacity=".7"') +
    rr(150, 232, 82, 64, 14, C.dark) + rr(104, 247, 48, 34, 8, C.red) +
    pa('M600 240 L700 262 L700 268 L600 288 Z', C.steel) + pa('M700 262 L730 264.5 L730 265.5 L700 268 Z', C.steelD) +
    label(128, 264, 110, 170, 'Push button', 'start') + label(400, 264, 400, 380, 'Spring pushes the plunger', 'middle') + label(710, 266, 760, 150, 'Heat-proof nozzle', 'end'),
  ),

  'helping-hands': () => art(
    el(400, 430, 150, 24, C.dark) + rr(388, 330, 24, 100, 6, C.steelD) +
    wire('M400 335 C 340 335 300 300 296 250', C.steelD, 12) + wire('M400 335 C 460 335 500 300 504 250', C.steelD, 12) +
    rr(290, 242, 220, 24, 4, C.pcb) + Array.from({ length: 6 }, (_, i) => cn(318 + i * 33, 254, 4, C.gold)).join('') +
    g('translate(296 246) rotate(-18)', pa('M-8 -9 L40 -11 L40 11 L-8 9 Z', C.steel) + rr(-52, -8, 46, 16, 5, C.red)) +
    g('translate(504 246) rotate(198)', pa('M-8 -9 L40 -11 L40 11 L-8 9 Z', C.steel) + rr(-52, -8, 46, 16, 5, C.red)) +
    ln(400, 330, 400, 180, C.steelD, 10) + ci(400, 140, 66, '#d6ecff') + ci(400, 140, 50, 'none', `stroke="${C.white}" stroke-width="5" opacity=".8"`) +
    label(300, 252, 120, 360, 'Alligator clip', 'start') + label(380, 322, 640, 370, 'Bendy arm', 'start') + label(436, 120, 540, 80, 'Magnifier', 'start'),
  ),

  'heat-gun': () => art(
    rr(190, 170, 310, 110, 52, C.orange) + rr(170, 190, 28, 72, 8, C.dark2) +
    pa('M500 184 L596 196 L596 254 L500 266 Z', C.steel) + rr(590, 200, 22, 50, 6, C.steelD) +
    rr(285, 268, 96, 160, 24, C.dark) + rr(370, 296, 36, 64, 12, C.yellow) +
    pa('M630 200 q16 -16 32 0 t32 0 t32 0', 'none', `stroke="${C.red}" stroke-width="5"`) + pa('M630 225 q16 -16 32 0 t32 0 t32 0', 'none', `stroke="${C.orange}" stroke-width="5"`) + pa('M630 250 q16 -16 32 0 t32 0 t32 0', 'none', `stroke="${C.red}" stroke-width="5"`) +
    label(550, 225, 560, 130, 'Hot-air nozzle', 'middle') + label(388, 330, 520, 400, 'On / off switch', 'start') + label(332, 400, 200, 470, 'Handle', 'start'),
  ),

  'wire-stripper': () => art(
    wire('M70 262 L190 262', C.yellow, 16) + ln(190, 262, 250, 262, C.copper, 7) +
    pliers(230, 26, C.red, cn(290, 244, 9, C.paper) + cn(230, 246, 7, C.paper), cn(290, 280, 9, C.paper) + cn(230, 278, 7, C.paper)) +
    label(290, 262, 150, 150, 'Notches for each wire size', 'start') + label(560, 216, 600, 110, 'Insulated handles', 'middle') + label(190, 262, 120, 400, 'Cuts the jacket only', 'start'),
  ),

  'wire-cutter': () => art(
    pliers(160, 22, C.blue) + zigzag(560, 236, 100, 52, 7) +
    label(220, 262, 120, 150, 'Flat cutting edge', 'start') + label(610, 262, 540, 390, 'Return spring', 'middle') + label(640, 205, 680, 120, 'Grip handles', 'middle'),
  ),

  'needle-nose-pliers': () => art(
    pliers(260, 8, C.red) +
    label(160, 262, 120, 150, 'Long tapered jaws', 'start') + label(380, 262, 380, 400, 'Pivot', 'middle') + label(560, 214, 620, 120, 'Soft grips', 'middle'),
  ),

  'hex-drivers': () => art(
    [[170, '1.5', C.blue], [262, '2', C.orange], [354, '2.5', C.green]].map(([y, size, col]) =>
      rr(110, y - 28, 200, 56, 20, col) + rr(122, y - 20, 14, 40, 4, C.white, 'opacity=".35"') + text(210, y + 10, `${size} mm`, 28, C.white) +
      rr(310, y - 8, 330, 16, 4, C.steel) + pa(`M640 ${y - 14} L690 ${y - 14} L704 ${y} L690 ${y + 14} L640 ${y + 14} L626 ${y} Z`, C.steelL)).join('') +
    label(665, 170, 690, 100, 'Hex tip fits the screw', 'middle') + label(120, 354, 150, 440, 'Size marked on the handle', 'start'),
  ),

  'screwdriver-set': () => art(
    rr(100, 150, 600, 250, 22, C.dark) + rn(114, 164, 572, 222, 14, C.dark2) +
    [[200, C.orange, 'plus'], [256, C.blue, 'flat'], [312, C.green, 'plus'], [368, C.red, 'flat']].map(([y, col, tip]) =>
      rr(130, y - 20, 130, 40, 16, col) + rr(260, y - 6, 340, 12, 3, C.steel) +
      (tip === 'plus' ? rr(600, y - 8, 46, 16, 3, C.steelL) + ln(612, y - 6, 612, y + 6, C.ink, 2) + ln(628, y - 6, 628, y + 6, C.ink, 2) : pa(`M600 ${y - 8} L650 ${y - 12} L650 ${y + 12} L600 ${y + 8} Z`, C.steelL))).join('') +
    label(620, 200, 640, 110, 'Cross (Phillips) tip', 'middle') + label(625, 256, 700, 460, 'Flat tip', 'end') + label(180, 368, 130, 460, 'Insulated grip', 'start'),
  ),

  tweezers: () => art(
    pa('M130 372 L650 262 L654 276 L136 392 Z', C.steel) + pa('M130 424 L650 284 L652 296 L134 444 Z', C.steelD) +
    rr(100, 372, 44, 72, 12, C.dark2) + pa('M630 258 L690 272 L690 280 L632 292 Z', C.steelL) +
    label(660, 276, 640, 190, 'Fine pointed tips', 'middle') + label(120, 408, 240, 490, 'Spring arms', 'start') + label(400, 330, 520, 400, 'ESD-safe: no static zaps', 'start'),
  ),

  multimeter: () => art(
    rr(250, 60, 300, 380, 40, C.yellow) + rr(280, 92, 240, 110, 14, '#d3ecd8') + text(400, 170, '12.45', 56, '#1f3b2a') + text(500, 125, 'V', 22, '#1f3b2a') +
    ci(400, 310, 66, C.dark) + Array.from({ length: 10 }, (_, i) => ln(400 + Math.cos(-2.6 + i * 0.5) * 52, 310 + Math.sin(-2.6 + i * 0.5) * 52, 400 + Math.cos(-2.6 + i * 0.5) * 62, 310 + Math.sin(-2.6 + i * 0.5) * 62, C.white, 3)).join('') + ln(400, 310, 430, 284, C.orange, 6) +
    ci(335, 415, 16, C.dark) + ci(400, 415, 16, C.red) + ci(465, 415, 16, C.dark2) +
    wire('M400 430 C 400 480 250 480 170 440', C.red, 8) + wire('M465 430 C 480 490 600 490 640 440', C.dark2, 8) +
    g('rotate(-30 160 440)', rr(110, 424, 60, 30, 8, C.red) + pa('M110 432 L70 438 L110 446 Z', C.steel)) + g('rotate(30 650 440)', rr(630, 424, 60, 30, 8, C.dark2) + pa('M690 432 L730 438 L690 446 Z', C.steel)) +
    label(300, 135, 40, 90, 'Reads volts / amps', 'start') + label(430, 285, 640, 250, 'Mode dial', 'start') + label(100, 440, 80, 500, 'Probes', 'start'),
  ),

  'smoke-stopper': () => art(
    rr(270, 180, 260, 170, 20, C.dark2) + rn(285, 195, 230, 140, 12, '#1d232b') + ci(400, 262, 44, '#fff3b0') + pa('M380 290 L388 255 L400 275 L412 255 L420 290', 'none', `stroke="${C.orange}" stroke-width="4"`) +
    wire('M270 265 L190 265', C.red, 12) + rr(100, 238, 92, 54, 8, C.yellow) + rn(112, 250, 22, 30, 3, C.dark) + rn(146, 250, 22, 30, 3, C.dark) +
    wire('M530 265 L610 265', C.red, 12) + rr(608, 238, 92, 54, 8, C.yellow) + rn(632, 250, 22, 30, 3, C.dark) + rn(666, 250, 22, 30, 3, C.dark) +
    pa('M390 150 q-14 -22 0 -42 q16 -20 0 -40', 'none', `stroke="${C.steelD}" stroke-width="6" opacity=".4"`) +
    label(146, 238, 120, 150, 'Battery plugs in here', 'start') + label(400, 205, 400, 120, 'Bulb glows: a short!', 'middle') + label(654, 292, 700, 400, 'Drone plugs in here', 'end'),
  ),

  'digital-caliper': () => art(
    rr(110, 240, 580, 52, 6, C.steelL) + Array.from({ length: 28 }, (_, i) => ln(140 + i * 20, 240, 140 + i * 20, i % 5 ? 252 : 262, C.steelD, 2)).join('') +
    pa('M110 240 L110 120 L152 120 L152 240 Z', C.steel) + rr(158, 150, 130, 90, 8, C.orange) +
    rr(284, 205, 170, 110, 12, C.dark2) + rr(300, 220, 112, 38, 5, '#d3ecd8') + text(356, 249, '16.02', 28, '#1f3b2a') + ci(432, 235, 11, C.orange) +
    pa('M286 205 L286 120 L326 120 L326 205 Z', C.steel) +
    label(139, 150, 110, 80, 'Fixed jaw', 'start') + label(356, 238, 470, 150, 'Digital reading (mm)', 'start') + label(560, 266, 600, 360, 'Scale in millimetres', 'middle'),
  ),

  'hot-glue-gun': () => art(
    rr(110, 205, 140, 36, 12, '#faf6e8') + rr(230, 170, 300, 112, 42, C.yellow) + rr(300, 270, 92, 150, 22, C.dark2) + rr(384, 300, 36, 62, 12, C.orange) +
    pa('M530 192 L626 208 L626 246 L530 262 Z', C.steel) + pa('M626 220 q22 6 22 30 q0 26 -10 36 q-12 -10 -12 -36 Z', '#faf6e8') +
    label(180, 223, 150, 140, 'Glue stick', 'start') + label(580, 228, 620, 150, 'Hot nozzle', 'middle') + label(402, 330, 520, 400, 'Squeeze the trigger', 'start'),
  ),

  'double-sided-tape': () => art(
    ci(330, 270, 138, '#efe9d4') + ci(330, 270, 82, C.white) + ci(330, 270, 138, 'none', `stroke="${C.yellow}" stroke-width="10" opacity=".9"`) +
    pa('M456 312 L720 350 L712 394 L446 356 Z', '#efe9d4') + pa('M446 356 L712 394 L710 404 L444 366 Z', C.yellow) + pa('M456 312 L720 350 L718 340 L458 302 Z', C.yellow) +
    label(330, 150, 330, 80, 'Roll of foam tape', 'middle') + label(580, 354, 620, 450, 'Sticky on BOTH sides', 'middle') + label(330, 270, 180, 460, 'Mounts a flight controller', 'start'),
  ),

  'zip-ties': () => art(
    ci(300, 270, 82, C.dark2) + [[270, 250, C.red], [320, 245, C.yellow], [300, 295, C.blue], [262, 292, C.green], [338, 288, C.white]].map(([x, y, col]) => ci(x, y, 17, col)).join('') +
    el(300, 270, 112, 112, 'none', `stroke="${C.steelL}" stroke-width="22"`) + el(300, 270, 112, 112, 'none', `stroke="${C.ink}" stroke-width="3"`) + rr(398, 252, 52, 40, 6, C.steelL) + rr(404, 262, 38, 20, 3, C.white) +
    rr(500, 330, 230, 26, 4, C.steelL) + rr(704, 318, 44, 50, 6, C.steelL) + rr(712, 332, 28, 22, 3, C.white) + Array.from({ length: 14 }, (_, i) => ln(512 + i * 15, 330, 512 + i * 15, 356, C.steelD, 2)).join('') +
    label(450, 262, 560, 170, 'Locking head', 'middle') + label(600, 343, 640, 430, 'Toothed strap', 'middle') + label(300, 270, 130, 440, 'Bundles wires neatly', 'start'),
  ),

  'electrical-tape': () => art(
    ci(320, 270, 142, C.dark) + ci(320, 270, 88, C.white) + ci(320, 270, 142, 'none', `stroke="${C.dark2}" stroke-width="14"`) + pa('M200 190 q40 -40 100 -50', 'none', `stroke="${C.white}" stroke-width="6" opacity=".35"`) +
    pa('M448 316 L720 352 L712 396 L440 360 Z', C.dark) + pa('M448 316 L720 352 L716 340 L452 304 Z', C.dark2) +
    label(320, 150, 320, 75, 'Insulating vinyl tape', 'middle') + label(580, 356, 620, 450, 'Stretches to seal', 'middle') + label(250, 340, 120, 440, 'Covers bare joints', 'start'),
  ),
}
