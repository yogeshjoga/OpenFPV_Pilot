// Test flights for the PID tuning page: a tune, a drone and a test go in, a recorded response comes out.
// Built on the lesson's physics (../DroneLesson/physics.js): angle error -> PID -> motor speeds -> torque -> a body with inertia.
import { AttitudeAxis, DEFAULT_SLIDERS, HOVER, MIX, gainsFromSliders, loopDrone, stepMetrics } from '../DroneLesson/physics.js'

export { DEFAULT_SLIDERS }

export const DRONES = [
  { id: '5in', name: '5-inch freestyle', massKg: 0.588, armM: 0.088, inertia: 0.003, note: 'The drone from the lesson and the configurator.' },
  { id: '3in', name: '3-inch micro', massKg: 0.26, armM: 0.052, inertia: 0.00065, note: 'Light and small: it turns very quickly.' },
  { id: '7in', name: '7-inch long range', massKg: 1.05, armM: 0.115, inertia: 0.0095, note: 'Heavy with long arms: it is slow to start and slow to stop.' },
]
export const droneById = (id) => DRONES.find((d) => d.id === id) || DRONES[0]

export const TESTS = [
  { id: 'step', label: 'Stick step', text: 'You snap the stick: the drone is asked to tilt 15 degrees at once. This shows how fast and how cleanly it follows.' },
  { id: 'gust', label: 'Gust of wind', text: 'A short push knocks the drone over while the stick is centred. This shows how quickly it recovers.' },
  { id: 'push', label: 'Steady crosswind', text: 'A constant push, like wind or an off-centre battery. This shows what the I term is for.' },
  { id: 'propwash', label: 'Prop wash', text: 'Turbulence from the drone\'s own props shakes it for half a second. This shows how well it stays calm.' },
]

const DT = 0.0005
const SAMPLE_EVERY = 4 // one recorded point every 2 ms
const T0 = 0.1 // the test starts at 0.1 s
const STEP_RAD = (15 * Math.PI) / 180
const DEG = 180 / Math.PI

// how hard the test pushes, scaled with the drone so every size gets a comparable shove
const shove = (drone) => drone.inertia / 0.003

function disturbanceAt(test, t, scale) {
  const x = t - T0
  if (test === 'gust') return x >= 0 && x < 0.08 ? 0.25 * scale : 0
  if (test === 'push') return x >= 0 ? 0.12 * scale : 0
  if (test === 'propwash') {
    if (x < 0 || x > 0.5) return 0
    const fade = 1 - x / 0.5
    return 1.2 * scale * fade * (Math.sin(2 * Math.PI * 31 * x) + 0.6 * Math.sin(2 * Math.PI * 47 * x + 1.3))
  }
  return 0
}

// how much torque a full PID output makes at a given throttle: motor thrust grows with speed squared, so this grows with throttle
export function authority(droneInfo, base = HOVER) {
  const d = loopDrone(droneInfo)
  return d.armM * 2 * d.thrustMaxN * ((base + MIX) ** 2 - (base - MIX) ** 2)
}

export function simulate({ sliders = DEFAULT_SLIDERS, drone = '5in', test = 'step', base = HOVER, seconds, lagS } = {}) {
  seconds = seconds ?? (test === 'push' ? 2.5 : 1.2)
  const info = droneById(drone)
  const axis = new AttitudeAxis(loopDrone({ ...info, ...(lagS ? { lagS } : {}) }))
  const gains = gainsFromSliders(sliders)
  const scale = shove(info)
  const out = { t: [], setpoint: [], angle: [], rate: [], p: [], i: [], d: [], u: [], torque: [] }
  const steps = Math.round(seconds / DT)
  for (let k = 0; k <= steps; k++) {
    const t = k * DT
    const setpoint = test === 'step' && t >= T0 ? STEP_RAD : 0
    const r = axis.step(DT, setpoint, gains, { disturbance: disturbanceAt(test, t, scale), base })
    if (k % SAMPLE_EVERY === 0) {
      out.t.push(t)
      out.setpoint.push(setpoint * DEG)
      out.angle.push(r.angle * DEG)
      out.rate.push(r.rate * DEG)
      out.p.push(r.p); out.i.push(r.i); out.d.push(r.d); out.u.push(r.u)
      out.torque.push(r.torque)
    }
  }
  return { ...out, test, drone, metrics: metricsFor(test, out) }
}

function metricsFor(test, r) {
  const after = r.t.map((t, i) => ({ t, y: r.angle[i] })).filter((s) => s.t >= T0)
  if (test === 'step') {
    const m = stepMetrics(after.map((s) => ({ t: s.t, y: s.y })), 15)
    return m && { kind: 'step', riseMs: m.riseS == null ? null : m.riseS * 1000, overshootPct: m.overshootPct, settleMs: m.settleS * 1000, settled: m.settled, steadyErrorPct: m.steadyErrorPct }
  }
  const peak = Math.max(...after.map((s) => Math.abs(s.y)))
  const last = after.slice(-Math.max(5, Math.floor(after.length * 0.1)))
  const final = last.reduce((a, s) => a + s.y, 0) / last.length
  // how long until it stays within 1 degree for good
  let back = null
  for (let k = after.length - 1; k >= 0; k--) {
    if (Math.abs(after[k].y) > 1) { back = after[Math.min(k + 1, after.length - 1)].t - T0; break }
  }
  if (back === null) back = 0
  const rms = Math.sqrt(after.reduce((a, s) => a + s.y * s.y, 0) / after.length)
  return { kind: test, peakDeg: peak, offsetDeg: final, recoverMs: back * 1000, recovered: Math.abs(final) <= 1, rmsDeg: rms }
}

export const STEP_START = T0
