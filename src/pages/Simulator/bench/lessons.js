// The practice lessons. Plain data, so the tests can check that every lesson can be finished and starts unfinished.
//
// nodes      the parts placed on the bench when the lesson opens (id, type, x, y)
// prewired   wires already soldered, so the lesson can focus on one job
// tasks      what the student has to do; each is ticked when its check (goal) passes
// solution   the wires that finish the lesson, added to the prewired ones (used by the tests)
// hints      shown one at a time

import { tidyLayout } from './placement.js'

const w = (a, b) => ({ a, b })
const motorSolution = (m, group) => ['a', 'b', 'c'].map((c, i) => w(`${m}:w${i + 1}`, `esc:${group}${c}`))

const POWER = [w('bat:pos', 'esc:batp'), w('bat:neg', 'esc:batn'), w('cap:cp', 'esc:batp'), w('cap:cn', 'esc:batn')]
const MOTORS = [...motorSolution('m1', 'm1'), ...motorSolution('m2', 'm2'), ...motorSolution('m3', 'm3'), ...motorSolution('m4', 'm4')]
const STACK = [w('fc:sig_bat', 'esc:sig_bat'), w('fc:sig_g', 'esc:sig_g'), ...['m1', 'm2', 'm3', 'm4'].map((m) => w(`fc:sig_${m}`, `esc:sig_${m}`))]
const RECEIVER = [w('rx:r5', 'fc:u1_5v'), w('rx:rg', 'fc:u1_g'), w('rx:rt', 'fc:u1_r'), w('rx:rr', 'fc:u1_t')]
const VIDEO = [w('cam:cpw', 'fc:cam_5v'), w('cam:cg', 'fc:cam_g'), w('cam:cv', 'fc:cam_in'), w('vtx:vp', 'fc:v9'), w('vtx:vg', 'fc:vtx_g'), w('vtx:vv', 'fc:vtx_out')]

const part = (id, type, x, y) => ({ id, type, x, y })

const RAW_LESSONS = [
  {
    id: 'power',
    title: 'Power loop',
    level: 'Beginner',
    summary: 'Connect the battery and the capacitor to the ESC. This is the first thing every build needs, and the easiest to get wrong.',
    nodes: [part('esc', 'esc', 330, 40), part('bat', 'battery', 230, 600), part('cap', 'capacitor', 540, 620)],
    prewired: [],
    tasks: [
      { goal: 'battery', text: 'Solder the battery: red lead to BAT+, black lead to BAT-.' },
      { goal: 'capacitor', text: 'Solder the capacitor on the battery pads: long leg to BAT+, short striped leg to BAT-.' },
      { goal: 'no-faults', text: 'Nothing shorted or burnt.' },
    ],
    solution: POWER,
    hints: [
      'Drag from the tinned tip of a wire to the pad you want. The tip is the small silver end of each lead.',
      'The battery’s red lead is positive. The ESC pad marked BAT+ is where it goes.',
      'The capacitor goes on the same two pads as the battery leads. Its stripe is on the negative side, so the striped leg goes to BAT-.',
    ],
  },
  {
    id: 'motors',
    title: 'Motors',
    level: 'Beginner',
    summary: 'Solder the three wires of each motor to the three pads of its motor output. Any order works, and the order sets which way it spins.',
    nodes: [
      part('esc', 'esc', 330, 150),
      part('m4', 'motor', 60, 20),
      part('m2', 'motor', 790, 20),
      part('m3', 'motor', 60, 400),
      part('m1', 'motor', 790, 400),
      part('bat', 'battery', 330, 680),
      part('cap', 'capacitor', 620, 700),
    ],
    prewired: POWER,
    tasks: [
      { goal: 'motors', text: 'Wire all four motors: each motor’s three wires to the three pads of one output (M1 to M4).' },
      { goal: 'no-faults', text: 'No two wires touching, nothing burnt.' },
    ],
    solution: MOTORS,
    hints: [
      'Each motor output on the ESC has three pads in a column, with its name (M1 to M4) beside them.',
      'Wire 1, 2 and 3 can go to the three pads in any order. Try swapping two wires afterwards and power up: the motor spins the other way.',
      'Use the output closest to the motor: M4 top left, M2 top right, M3 bottom left, M1 bottom right.',
    ],
  },
  {
    id: 'stack',
    title: 'Flight controller to ESC',
    level: 'Beginner',
    summary: 'Connect the flight controller to the ESC: power (BAT and GND) and the four motor signals M1 to M4.',
    nodes: [part('esc', 'esc', 80, 80), part('fc', 'fc', 600, 80), part('bat', 'battery', 120, 600), part('cap', 'capacitor', 360, 620)],
    prewired: POWER,
    tasks: [
      { goal: 'fc-esc', text: 'Connect BAT, GND and M1 to M4 on the flight controller to the pads with the same names on the ESC.' },
      { goal: 'no-faults', text: 'Nothing shorted or burnt.' },
    ],
    solution: STACK,
    hints: [
      'On a real stack these eight pads sit in a row and plug together. Here you wire them one by one. Point at a pad to see what it carries.',
      'Join each pad to the pad with the same name: BAT to BAT, GND to GND, M1 to M1 and so on.',
    ],
  },
  {
    id: 'receiver',
    title: 'Receiver',
    level: 'Intermediate',
    summary: 'Wire the ELRS receiver to a UART on the flight controller. This is where TX and RX must be crossed over.',
    nodes: [part('esc', 'esc', 40, 60), part('fc', 'fc', 540, 60), part('rx', 'receiver', 960, 120), part('bat', 'battery', 70, 600), part('cap', 'capacitor', 300, 620)],
    prewired: [...POWER, ...STACK],
    tasks: [
      { goal: 'receiver', text: 'Power the receiver from 5V and GND of UART1, then cross TX to R1 and RX to T1.' },
      { goal: 'no-faults', text: 'Nothing burnt.' },
    ],
    solution: RECEIVER,
    hints: [
      'The receiver takes 5 V only. The flight controller’s 5V pads are on its right edge.',
      'A UART has a transmit (T) and a receive (R) pad. A device’s TX talks to the other side’s RX.',
      'Receiver TX goes to R1. Receiver RX goes to T1.',
    ],
  },
  {
    id: 'video',
    title: 'Camera and VTX',
    level: 'Intermediate',
    summary: 'Bring the picture from the camera, through the flight controller, to the video transmitter.',
    nodes: [part('esc', 'esc', 40, 60), part('fc', 'fc', 520, 60), part('cam', 'camera', 940, 40), part('vtx', 'vtx', 920, 300), part('bat', 'battery', 70, 600), part('cap', 'capacitor', 300, 620)],
    prewired: [...POWER, ...STACK],
    tasks: [
      { goal: 'camera', text: 'Power the camera (5V and GND from the CAM group).' },
      { goal: 'vtx', text: 'Power the VTX from 9V and GND of the VTX group. It must not touch battery voltage.' },
      { goal: 'video', text: 'Camera video to CAM, and the VTX pad to the VTX video wire.' },
      { goal: 'no-faults', text: 'Nothing burnt.' },
    ],
    solution: VIDEO,
    hints: [
      'The camera and the VTX each have three wires: power, ground and video.',
      'On the flight controller the CAM group has CAM, GND and 5V. The VTX group has VTX, GND and 9V.',
      'Video flows camera, then the CAM pad, through the flight controller, then the VTX pad, then the VTX.',
    ],
  },
  {
    id: 'full',
    title: 'Full build',
    level: 'Advanced',
    summary: 'Wire a whole quad from scratch: power, four motors, the stack, the receiver, the camera and the VTX.',
    nodes: [
      part('esc', 'esc', 330, 280),
      part('fc', 'fc', 840, 280),
      part('bat', 'battery', 40, 560),
      part('cap', 'capacitor', 210, 700),
      part('m4', 'motor', 40, 40),
      part('m2', 'motor', 220, 40),
      part('m3', 'motor', 400, 40),
      part('m1', 'motor', 580, 40),
      part('rx', 'receiver', 1260, 330),
      part('cam', 'camera', 1260, 40),
      part('vtx', 'vtx', 1250, 600),
    ],
    prewired: [],
    tasks: [
      { goal: 'battery', text: 'Battery to the ESC.' },
      { goal: 'capacitor', text: 'Capacitor on the BAT+ and BAT- pads.' },
      { goal: 'motors', text: 'Four motors, one per output.' },
      { goal: 'fc-esc', text: 'Flight controller to the ESC.' },
      { goal: 'receiver', text: 'Receiver on a UART.' },
      { goal: 'camera', text: 'Camera powered.' },
      { goal: 'vtx', text: 'VTX powered from 5V or 9V.' },
      { goal: 'video', text: 'Video from the camera to the VTX.' },
      { goal: 'no-faults', text: 'Nothing shorted or burnt.' },
    ],
    solution: [...POWER, ...MOTORS, ...STACK, ...RECEIVER, ...VIDEO],
    hints: [
      'Work in the order of the other lessons: power first, then the motors, the stack, the receiver, the camera and the VTX.',
      'Press Power up after each part to catch a mistake while it is small.',
    ],
  },
  {
    id: 'fix',
    title: 'Find the faults',
    level: 'Advanced',
    summary: 'This build is finished, but three things are wrong. Power it up, read the report and fix them.',
    nodes: [
      part('esc', 'esc', 330, 280),
      part('fc', 'fc', 840, 280),
      part('bat', 'battery', 40, 560),
      part('cap', 'capacitor', 210, 700),
      part('m4', 'motor', 40, 40),
      part('m2', 'motor', 220, 40),
      part('m3', 'motor', 400, 40),
      part('m1', 'motor', 580, 40),
      part('rx', 'receiver', 1260, 330),
      part('cam', 'camera', 1260, 40),
      part('vtx', 'vtx', 1250, 600),
    ],
    // The finished build with three mistakes: capacitor reversed, receiver TX joined to TX, video wired backwards
    prewired: [
      ...POWER.filter((x) => !x.a.startsWith('cap:')),
      w('cap:cp', 'esc:batn'),
      w('cap:cn', 'esc:batp'),
      ...MOTORS,
      ...STACK,
      w('rx:r5', 'fc:u1_5v'),
      w('rx:rg', 'fc:u1_g'),
      w('rx:rt', 'fc:u1_t'),
      w('rx:rr', 'fc:u1_r'),
      ...VIDEO.filter((x) => x.a !== 'cam:cv' && x.a !== 'vtx:vv'),
      w('cam:cv', 'fc:vtx_out'),
      w('vtx:vv', 'fc:cam_in'),
    ],
    tasks: [
      { goal: 'capacitor', text: 'The capacitor is the wrong way round. Fix it.' },
      { goal: 'receiver', text: 'The receiver does not talk to the flight controller. Find out why.' },
      { goal: 'video', text: 'No picture reaches the VTX. Find out why.' },
      { goal: 'no-faults', text: 'Nothing shorted or burnt.' },
    ],
    solution: [...POWER, ...MOTORS, ...STACK, ...RECEIVER, ...VIDEO],
    solutionIsComplete: true, // replaces the wiring, instead of adding to the prewired wires
    hints: [
      'Power up and read the report. The red entry is the most urgent fault.',
      'Delete a wire by clicking it and pressing Delete, then solder it again where it belongs.',
    ],
  },
]

// Every lesson opens arranged like a wiring diagram (the same arrangement as the builder's Tidy up): the flight controller above
// the ESC, each motor beside its own output, the battery and the capacitor underneath. The positions written in each lesson
// above are only a starting point; this is what the student sees.
const arranged = (lesson) => {
  const at = tidyLayout(lesson.nodes, [...lesson.prewired, ...lesson.solution])
  return { ...lesson, nodes: lesson.nodes.map((n) => ({ ...n, x: Math.round(at[n.id].x), y: Math.round(at[n.id].y) })) }
}
export const LESSONS = RAW_LESSONS.map(arranged)

export const LESSON_BY_ID = Object.fromEntries(LESSONS.map((l) => [l.id, l]))
export const lessonGoals = (lesson) => lesson.tasks.map((t) => t.goal)
