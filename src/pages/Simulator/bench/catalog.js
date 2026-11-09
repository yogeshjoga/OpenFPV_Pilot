import { BRAND_PARTS } from './boards/index.js'
import { genericEsc, genericFc } from './boards/generic.js'

// The parts of the wiring bench. Plain data, no React, so the checks can be tested with `node --test`.
//
// Every connection point is a `pad`:
//   id, label, x, y   where it sits on the part (px, in the part's own box)
//   rail              the supply rail this pad is meant to sit on: 'vbat' | 'gnd' | '5v' | '9v'
//   source            the pad drives its rail (a battery lead, or a regulator output of the flight controller)
//   accepts           a pad that needs power lists the rails it can take; anything else burns it
//   lead              set for a wire that is part of the part (colour and gauge), ending in a tinned tip
// `internal` lists pads that are the same copper on the real board.
// Pad names follow common Betaflight-style layouts. They are standard layouts, not any one brand's exact pinout.
// Parts also say what they are (kind), whose they are (brand) and where they belong in the list (category). Brand boards
// come from ./boards, with the real pad names and positions of that board.

const pad = (id, label, x, y, extra = {}) => ({ id, label, x, y, ...extra })
// Wires are drawn slim so a busy bench stays readable. The artwork scales its leads by the same amount.
export const LEAD_SCALE = 1.35
const lead = (id, label, x, y, color, gauge, extra = {}) => pad(id, label, x, y, { lead: { color, gauge: Math.round(gauge * LEAD_SCALE * 10) / 10 }, ...extra })

// ---------- 4-in-1 ESC and flight controller: the plain 30.5 mm stack boards, built like the brand boards (boards/generic.js) ----------
export const ESC = genericEsc()
export const FC = genericFc()

// ---------- Motor, 2306 ----------
export const MOTOR = {
  id: 'motor',
  name: 'Motor (2306)',
  blurb: 'Three wires. Any order works, the order sets which way it spins.',
  w: 150,
  h: 190,
  pads: [
    lead('w1', 'Wire 1', 40, 184, '#4b7bec', 3.6),
    lead('w2', 'Wire 2', 75, 184, '#e5b82a', 3.6),
    lead('w3', 'Wire 3', 110, 184, '#38a869', 3.6),
  ],
  internal: [],
  motorLeads: ['w1', 'w2', 'w3'],
}

// ---------- LiPo 4S with XT60 lead ----------
export const BATTERY = {
  id: 'battery',
  name: 'LiPo 4S + XT60 lead',
  blurb: '16.8 V when full. The red lead is positive.',
  w: 150,
  h: 250,
  pads: [
    lead('pos', '+', 100, 8, '#d6455d', 5.5, { rail: 'vbat', source: true, role: 'bat+' }),
    lead('neg', '-', 50, 8, '#2a2e35', 5.5, { rail: 'gnd', source: true, role: 'bat-' }),
  ],
  internal: [],
}

// ---------- Capacitor, 35 V 1000 uF ----------
export const CAPACITOR = {
  id: 'capacitor',
  name: 'Capacitor 35 V',
  blurb: 'Smooths the battery spikes. The stripe marks the negative leg.',
  w: 90,
  h: 150,
  pads: [
    lead('cp', '+', 28, 8, '#8f99a6', 3.2, { role: 'cap+' }),
    lead('cn', '-', 62, 8, '#8f99a6', 3.2, { role: 'cap-' }),
  ],
  internal: [],
}

// ---------- ELRS receiver ----------
export const RECEIVER = {
  id: 'receiver',
  name: 'ELRS receiver',
  blurb: 'Hears the pilot’s radio. Needs 5 V, ground, and its TX and RX crossed to the flight controller.',
  w: 140,
  h: 150,
  pads: [
    lead('r5', '5V', 20, 144, '#d6455d', 2.2, { accepts: ['5v'] }),
    lead('rg', 'G', 47, 144, '#2a2e35', 2.2, { rail: 'gnd' }),
    lead('rt', 'TX', 73, 144, '#e5b82a', 2.2, { uartDevice: 'tx' }),
    lead('rr', 'RX', 100, 144, '#4b7bec', 2.2, { uartDevice: 'rx' }),
  ],
  internal: [],
  needs: { power: 'r5', gnd: 'rg' },
}

// ---------- Analog VTX ----------
export const VTX = {
  id: 'vtx',
  name: 'Analog VTX',
  blurb: 'Sends the camera picture to the goggles. Takes 5 V or 9 V, not battery voltage.',
  w: 150,
  h: 150,
  pads: [
    lead('vp', 'PWR', 30, 144, '#d6455d', 2.4, { accepts: ['5v', '9v'] }),
    lead('vg', 'G', 75, 144, '#2a2e35', 2.4, { rail: 'gnd' }),
    lead('vv', 'VIDEO', 120, 144, '#e5b82a', 2.0, { video: 'video-in' }),
  ],
  internal: [],
  needs: { power: 'vp', gnd: 'vg' },
}

// ---------- FPV camera ----------
export const CAMERA = {
  id: 'camera',
  name: 'FPV camera',
  blurb: 'Three wires: power, ground and video.',
  w: 120,
  h: 160,
  pads: [
    lead('cpw', 'PWR', 20, 154, '#d6455d', 2.2, { accepts: ['5v', '9v', 'vbat'] }),
    lead('cg', 'G', 60, 154, '#2a2e35', 2.2, { rail: 'gnd' }),
    lead('cv', 'VIDEO', 100, 154, '#e5b82a', 2.0, { video: 'video-out' }),
  ],
  internal: [],
  needs: { power: 'cpw', gnd: 'cg' },
}

// ---------- GPS ----------
export const GPS = {
  id: 'gps',
  name: 'GPS module',
  blurb: 'Needs 5 V, ground, and its TX and RX crossed to the flight controller.',
  w: 130,
  h: 150,
  pads: [
    lead('g5', '5V', 18, 144, '#d6455d', 2.2, { accepts: ['5v'] }),
    lead('gg', 'G', 49, 144, '#2a2e35', 2.2, { rail: 'gnd' }),
    lead('gt', 'TX', 80, 144, '#38a869', 2.2, { uartDevice: 'tx' }),
    lead('gr', 'RX', 111, 144, '#4b7bec', 2.2, { uartDevice: 'rx' }),
  ],
  internal: [],
  needs: { power: 'g5', gnd: 'gg' },
}

const KIND = {
  esc: ['esc', 'ESCs'],
  fc: ['fc', 'Flight controllers'],
  motor: ['motor', 'Motors'],
  battery: ['battery', 'Batteries'],
  capacitor: ['capacitor', 'Capacitors'],
  receiver: ['receiver', 'Receivers'],
  vtx: ['vtx', 'Video transmitters'],
  camera: ['camera', 'Cameras'],
  gps: ['gps', 'GPS'],
}

/** The plain, maker-neutral parts the lessons use. */
export const GENERIC_PARTS = [ESC, FC, MOTOR, BATTERY, CAPACITOR, RECEIVER, VTX, CAMERA, GPS].map((p) => ({
  ...p,
  kind: KIND[p.id][0],
  category: KIND[p.id][1],
  brand: 'Generic',
  specs: [],
}))

/** Every part a student can place: the generic ones, then the boards of each brand. */
export const PARTS = [...GENERIC_PARTS, ...BRAND_PARTS]
export const PART_BY_ID = Object.fromEntries(PARTS.map((p) => [p.id, p]))
export const padOf = (partId, padId) => PART_BY_ID[partId]?.pads.find((p) => p.id === padId) ?? null

/** Is this part a flight controller, an ESC ...? A board that is two things at once (an AIO is both) lists them in `kinds`. */
export const isKind = (partId, kind) => {
  const part = PART_BY_ID[partId]
  return !!part && (part.kinds ?? [part.kind]).includes(kind)
}

/** Parts have a front and a back. A pad is on one of them, or (a lead, a through-hole pad) shows on both. */
export const onFace = (pad, flip) => !pad.face || pad.face === 'both' || pad.face === (flip ? 'back' : 'front')

/**
 * Where a pad is drawn. Positions are given as seen from the front. Turn the part over, as you would about a vertical
 * axis, and everything swings to the other side, so a pad at x is now at width minus x.
 */
export function padAt(part, pad, flip, turn = 0) {
  const x = flip ? part.w - pad.x : pad.x
  if (!turn) return { x, y: pad.y }
  // turned clockwise about the middle of the part: a pad below the middle ends up to its left after a quarter turn
  const dx = x - part.w / 2
  const dy = pad.y - part.h / 2
  const [rx, ry] = { 90: [-dy, dx], 180: [-dx, -dy], 270: [dy, -dx] }[turn] ?? [dx, dy]
  return { x: part.w / 2 + rx, y: part.h / 2 + ry }
}

/** The side of the part a wire leaves from, so wires route away from the board instead of across it. */
export function exitOf(partId, padId, flip = false, turn = 0) {
  const part = PART_BY_ID[partId]
  const p = padOf(partId, padId)
  if (!part || !p) return 'bottom'
  const { x, y } = padAt(part, p, flip, turn)
  if (p.lead && !turn) return y > part.h / 2 ? 'bottom' : 'top'
  // a wire of a turned part leaves the way its end now points
  if (p.lead) {
    const dx = x - part.w / 2
    const dy = y - part.h / 2
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'bottom' : 'top'
  }
  const edge = 60
  if (x < edge) return 'left'
  if (x > part.w - edge) return 'right'
  if (y < edge) return 'top'
  return 'bottom'
}
