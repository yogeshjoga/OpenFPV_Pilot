// The plain, maker-neutral flight controller and 4-in-1 ESC the lessons use. They are built by the same code as the
// GEPRC boards (so the grid, the spacing and the drawing style are the same) and use sizes taken from real 30.5 mm stack
// boards: the ESC has the same body, battery tab and motor pads as the GEPRC TAKER ESCs (GEPRC product manual,
// https://geprc.com/electronics/fc-manual/) and the flight controller the same 36 mm board as the GEP-F405-HD V2.
// The 8-pin link between them uses the common order BAT GND CUR TLM M1 M2 M3 M4 that SpeedyBee prints in its F405 stack
// manual; other makers order the eight pins differently, which is why the pins here are labelled and not numbered.
//
// The pad ids are the short ones the lessons and saved builds already use (sig_bat, m1a, u1_t ...), so the ids that the
// board builder makes are renamed to them here.
import { escBoard } from './esc.js'
import { flightController } from './fc.js'

const rename = (part, ids) => {
  const to = (id) => ids[id] ?? id
  return { ...part, pads: part.pads.map((p) => ({ ...p, id: to(p.id) })), internal: part.internal.map((group) => group.map(to)) }
}

const LINK = { 'ESC.BAT': 'sig_bat', 'ESC.GND': 'sig_g', 'ESC.CUR': 'sig_cur', 'ESC.TLM': 'sig_tlm', 'ESC.M1': 'sig_m1', 'ESC.M2': 'sig_m2', 'ESC.M3': 'sig_m3', 'ESC.M4': 'sig_m4' }

export function genericEsc() {
  const board = escBoard({
    id: 'esc',
    brand: 'Generic',
    model: '4-in-1 ESC',
    title: 'ESC',
    blurb: 'Drives the four motors from the battery. 30.5 mm stack board.',
    specs: [],
    mm: [42, 45.7],
    mount: 30.5,
    body: 36.5,
    tab: 22,
    link: 'BAT GND CUR TLM M1 M2 M3 M4',
  })
  const renamed = rename(board, LINK)
  // the TLM pin carries the ESC's telemetry back to the flight controller
  return { ...renamed, name: '4-in-1 ESC', source: undefined, pads: renamed.pads.map((p) => (p.id === 'sig_tlm' ? { ...p, signal: 'tlm' } : p)) }
}

export function genericFc() {
  const board = flightController({
    id: 'fc',
    brand: 'Generic',
    model: 'Flight controller',
    title: 'FC',
    blurb: 'The brain. Reads the receiver and tells the ESC what each motor should do.',
    specs: [],
    mm: 36,
    mount: 30.5,
    mcu: 'F405',
    usb: 'bottom',
    front: {
      top: [['ESC', 'BAT GND CUR TLM M1 M2 M3 M4']],
      left: [['VTX', 'VTX GND 9V'], ['CAM', 'CAM GND 5V']],
      right: [['UART1', '5V GND T1 R1'], ['UART3', '5V GND T3 R3']],
    },
    back: {},
  })
  const ids = {
    ...LINK,
    'VTX.VTX': 'vtx_out', 'VTX.GND': 'vtx_g', 'VTX.9V': 'v9',
    'CAM.CAM': 'cam_in', 'CAM.GND': 'cam_g', 'CAM.5V': 'cam_5v',
    'UART1.5V': 'u1_5v', 'UART1.GND': 'u1_g', 'UART1.T1': 'u1_t', 'UART1.R1': 'u1_r',
    'UART3.5V': 'u3_5v', 'UART3.GND': 'u3_g', 'UART3.T3': 'u3_t', 'UART3.R3': 'u3_r',
  }
  const renamed = rename(board, ids)
  return {
    ...renamed,
    name: 'Flight controller',
    source: undefined,
    // what powers the regulators: the battery voltage on BAT and the ground on G
    power: { vbat: 'sig_bat', gnd: 'sig_g' },
    pads: renamed.pads.map((p) => (p.id === 'sig_tlm' ? { ...p, signal: 'tlm' } : p)),
  }
}
