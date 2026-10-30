// A picture of the air around propellers, built from the textbook model of a rotor (momentum theory) and nothing else.
// It is not a full CFD solver: it is a simple, smooth flow field that has the right shape and the right numbers, so that streamlines
// and colour maps drawn from it show what a propeller really does to the air.
//
// Positions are in millimetres, speeds in m/s, pressures in pascals (gauge: 0 is the pressure of still air).
// A rotor is { x, y, z, R, vi, floor }: its centre, its radius R (mm), the air speed vi through the disc (m/s), and whether the floor
// (the plane y = 0) is there. The rotor pushes air towards -y (down).

export const AIR_DENSITY = 1.225

const smooth = (t) => {
  const c = Math.min(1, Math.max(0, t))
  return c * c * (3 - 2 * c)
}

// jet radius and centre-line speed of the stream, s mm below the disc
function wakeRadius(s, R) {
  return R * (1 - 0.29 * Math.min(1, s / (2 * R))) * (1 + 0.1 * Math.max(0, s - 2 * R) / R)
}
function wakeSpeed(s, R, vi) {
  const rise = Math.min(1, s / (1.2 * R)) // the stream keeps accelerating below the disc and reaches twice the speed at the disc
  const decay = 1 / (1 + Math.max(0, s - 4 * R) / (8 * R)) // far downstream it mixes with the still air and slows
  return vi * (1 + rise) * decay
}

// the flow without a floor: [radial speed (outwards is positive), vertical speed, how deep inside the jet we are (0 to 1)]
function freeFlow(r, dy, R, vi, out) {
  if (dy >= 0) {
    // above the disc the air is drawn in, as if into a sink a little below the disc
    const ax = dy + 0.6 * R
    const d2 = r * r + ax * ax
    const mag = (vi * 1.36 * R * R) / (R * R + d2)
    const d = Math.sqrt(d2)
    out[0] = (-mag * r) / d
    out[1] = (-mag * ax) / d
    out[2] = 0
    return out
  }
  const s = -dy
  const w = wakeSpeed(s, R, vi)
  const rj = wakeRadius(s, R)
  const inside = Math.exp(-((r / rj) ** 4))
  const outsideShare = rj / Math.max(r, rj)
  out[0] = -0.12 * w * (1 - inside) * outsideShare // the jet drags the still air along with it, so air is drawn in towards it
  out[1] = -w * inside - 0.1 * w * outsideShare * outsideShare * (1 - inside)
  out[2] = inside
  return out
}

const free = [0, 0, 0]
const axis = [0, 0, 0]

/** The air velocity at a point, for one rotor. Fills `out` with [vx, vy, vz] and returns the speed. */
export function rotorVelocity(out, px, py, pz, rotor) {
  const { x, y, z, R, vi } = rotor
  const dx = px - x
  const dz = pz - z
  const dy = py - y
  const r = Math.hypot(dx, dz)
  freeFlow(r, dy, R, vi, free)
  let vr = free[0]
  let vy = free[1]
  if (rotor.floor && dy < 0) {
    // the jet meets the floor: it stops going down and turns into a fast stream along the floor
    const gap = py
    const hb = Math.max(0.5 * R, Math.min(rotor.y * 0.8, 1.4 * R))
    const k = smooth(gap / hb)
    freeFlow(0, dy, R, vi, axis)
    const w0 = -axis[1]
    const rj = wakeRadius(-dy, R)
    vy *= k
    vr += 0.9 * w0 * (1 - k) * Math.min(1, (1.2 * rj) / Math.max(r, 1e-3)) / (1 + (r / (3.2 * R)) ** 2)
  }
  if (r > 1e-6) {
    out[0] = (vr * dx) / r
    out[2] = (vr * dz) / r
  } else {
    out[0] = 0
    out[2] = 0
  }
  out[1] = vy
  return Math.hypot(out[0], out[1], out[2])
}

const scratch = [0, 0, 0]

/** Air velocity at a point from several rotors, added together. */
export function flowVelocity(out, px, py, pz, rotors) {
  out[0] = 0
  out[1] = 0
  out[2] = 0
  for (const rotor of rotors) {
    rotorVelocity(scratch, px, py, pz, rotor)
    out[0] += scratch[0]
    out[1] += scratch[1]
    out[2] += scratch[2]
  }
  return Math.hypot(out[0], out[1], out[2])
}

/**
 * The pressure at a point, for one rotor in free air, from Bernoulli's law.
 * Above the disc the air speeds up towards it, so the pressure falls (suction). Just below, the pressure is high; it falls back to
 * the pressure of the room as the stream speeds up to twice the speed through the disc.
 * The jump across the disc is thrust ÷ disc area, the same as 2 ρ vi².
 */
export function rotorPressure(px, py, pz, rotor, rho = AIR_DENSITY) {
  const { x, y, z, R, vi } = rotor
  const dy = py - y
  const r = Math.hypot(px - x, pz - z)
  freeFlow(r, dy, R, vi, free)
  const v2 = free[0] * free[0] + free[1] * free[1]
  if (dy >= 0) return -0.5 * rho * v2
  const s = -dy
  const reference = (2 * vi) / (1 + Math.max(0, s - 4 * R) / (8 * R)) // the speed the stream settles to, which slows far downstream
  return 0.5 * rho * (free[2] * reference * reference - v2)
}

/** The pressure of the air pushing on the floor at (px, pz): the stagnation pressure ½ρv² of the stream that reaches the floor. */
export function floorPressure(px, pz, rotors, rho = AIR_DENSITY) {
  let p = 0
  for (const rotor of rotors) {
    const r = Math.hypot(px - rotor.x, pz - rotor.z)
    freeFlow(r, -rotor.y, rotor.R, rotor.vi, free)
    p += 0.5 * rho * free[1] * free[1]
  }
  return p
}

/** The fastest air along the floor (m/s) around a rotor that hovers at height y, sampled a few millimetres above the floor. */
export function floorWindSpeed(rotor) {
  const out = [0, 0, 0]
  let best = 0
  for (let k = 0.6; k <= 3; k += 0.2) {
    best = Math.max(best, rotorVelocity(out, rotor.x + k * rotor.R, 3, rotor.z, rotor))
  }
  return best
}

// ---------------------------------------------------------------------------------------------------------------
// Colours: the speed scale runs from dark blue (still air) through green to red (fastest); the pressure scale from blue (suction)
// through nothing to red (push).
// ---------------------------------------------------------------------------------------------------------------
const hexToRgb = (hex) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255].map((v) => v / 255)

export const SPEED_STOPS = [[0, 0x1d2a78], [0.2, 0x2563eb], [0.4, 0x06b6d4], [0.6, 0x22c55e], [0.8, 0xfacc15], [1, 0xef4444]]
export const PRESSURE_COLORS = { suction: 0x3b82f6, push: 0xef4444, rest: 0x1d2330 }

// the colours are worked out once: a table of 256 speed colours, and the three pressure colours as numbers
const SPEED_TABLE = new Float32Array(256 * 3)
for (let i = 0; i < 256; i += 1) {
  const c = i / 255
  let j = 1
  while (j < SPEED_STOPS.length - 1 && c > SPEED_STOPS[j][0]) j += 1
  const [t0, h0] = SPEED_STOPS[j - 1]
  const [t1, h1] = SPEED_STOPS[j]
  const f = (c - t0) / (t1 - t0)
  const lo = hexToRgb(h0)
  const hi = hexToRgb(h1)
  for (let k = 0; k < 3; k += 1) SPEED_TABLE[i * 3 + k] = lo[k] + (hi[k] - lo[k]) * f
}
const SUCTION_RGB = hexToRgb(PRESSURE_COLORS.suction)
const PUSH_RGB = hexToRgb(PRESSURE_COLORS.push)
const REST_RGB = hexToRgb(PRESSURE_COLORS.rest)

/** Fills `out` with [r, g, b] (0 to 1) for a speed t between 0 and 1. */
export function speedColor(t, out = [0, 0, 0]) {
  const i = Math.round(Math.min(1, Math.max(0, t)) * 255) * 3
  out[0] = SPEED_TABLE[i]
  out[1] = SPEED_TABLE[i + 1]
  out[2] = SPEED_TABLE[i + 2]
  return out
}

/** Fills `out` with [r, g, b, alpha] for a pressure t between -1 (suction) and 1 (push). */
export function pressureColor(t, out = [0, 0, 0, 0]) {
  const c = Math.min(1, Math.max(-1, t))
  const end = c < 0 ? SUCTION_RGB : PUSH_RGB
  const f = Math.sqrt(Math.abs(c))
  for (let k = 0; k < 3; k += 1) out[k] = REST_RGB[k] + (end[k] - REST_RGB[k]) * f
  out[3] = 0.12 + 0.78 * f
  return out
}

const css = (hex) => `#${hex.toString(16).padStart(6, '0')}`
export const SPEED_GRADIENT = `linear-gradient(to right, ${SPEED_STOPS.map(([t, h]) => `${css(h)} ${t * 100}%`).join(', ')})`
export const PRESSURE_GRADIENT = `linear-gradient(to right, ${css(PRESSURE_COLORS.suction)}, ${css(PRESSURE_COLORS.rest)} 50%, ${css(PRESSURE_COLORS.push)})`
