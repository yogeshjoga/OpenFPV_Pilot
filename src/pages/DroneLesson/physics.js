// The physics behind the lesson, in plain functions (SI units). Used by the 3D lesson page, tested with node:test.
// The drone is a typical 5-inch freestyle quad. Numbers are rounded, typical values for teaching.

export const G = 9.81
export const AIR = 1.225 // kg per cubic metre
export const HOVER = 0.4 // throttle (motor speed, 0..1) at which thrust equals weight

export const DRONE = {
  massKg: 0.588,
  armM: 0.088, // each motor is this far from the centre along the nose-tail line and across it
  inertia: 0.003, // kg m^2 about the pitch and roll axes
  propDiameterM: 0.1295, // 5.1 inch
  cd: 1.0, // drag coefficient of the body
  frontalAreaM2: 0.012, // area the air meets when flying level
  fmHover: 0.45, // figure of merit of the props
  efficiency: 0.8, // motors and speed controllers
}

export const WEIGHT_N = DRONE.massKg * G
// each motor's thrust is THRUST_MAX_N times its speed squared, so four motors at HOVER lift exactly the weight
export const THRUST_MAX_N = WEIGHT_N / 4 / (HOVER * HOVER)
export const motorThrustN = (speed) => THRUST_MAX_N * speed * speed

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// ---- aerodynamics, steady flight ----
// Every function takes the drone it is about (mass, prop size, body drag); the lesson's own drone is the default.
const weightOf = (d) => d.massKg * G
export const dragN = (v, { cd = DRONE.cd, area = DRONE.frontalAreaM2 } = {}) => 0.5 * AIR * cd * area * v * v
const dragFor = (v, d) => dragN(v, { cd: d.cd, area: d.frontalAreaM2 })
// to hold a steady speed the quad leans until the sideways part of thrust equals drag: tan(lean) = drag / weight
export const leanForSpeed = (v, d = DRONE) => Math.atan(dragFor(v, d) / weightOf(d))
export const thrustToFlyN = (v, d = DRONE) => Math.hypot(weightOf(d), dragFor(v, d))
export const rotorArea = (d = DRONE) => 4 * Math.PI * (d.propDiameterM / 2) ** 2
export const hoverInducedVelocity = (d = DRONE) => Math.sqrt(weightOf(d) / (2 * AIR * rotorArea(d)))
// induced velocity at forward speed v, from momentum theory (T = 2 rho A vi sqrt(v^2 + vi^2))
export function inducedVelocity(v, thrust, d = DRONE) {
  const t = thrust ?? weightOf(d)
  const vh = Math.sqrt(t / (2 * AIR * rotorArea(d)))
  return Math.sqrt((-v * v + Math.sqrt(v ** 4 + 4 * vh ** 4)) / 2)
}
// electrical power to fly level at speed v: the air pushed through the props (induced) plus beating the drag (parasitic)
export function powerW(v, d = DRONE) {
  const t = thrustToFlyN(v, d)
  const induced = (t * inducedVelocity(v, t, d)) / (d.fmHover * d.efficiency)
  const parasitic = (dragFor(v, d) * v) / d.efficiency
  return { induced, parasitic, total: induced + parasitic }
}
export function powerCurve(maxV = 40, steps = 80, d = DRONE) {
  const out = []
  for (let k = 0; k <= steps; k++) {
    const v = (maxV * k) / steps
    out.push({ v, ...powerW(v, d) })
  }
  return out
}
// the speed that uses the least power (longest flight) and the speed that uses the least energy per metre (longest range)
export function bestSpeeds(maxV = 40, d = DRONE) {
  const curve = powerCurve(maxV, 400, d)
  let endurance = curve[0]
  let range = curve[1]
  for (const p of curve) {
    if (p.total < endurance.total) endurance = p
    if (p.v > 0.5 && p.total / p.v < range.total / range.v) range = p
  }
  return { endurance: endurance.v, range: range.v }
}

// ---- thrust and torque from the four motors ----
// speeds are in the order front right, front left, rear right, rear left (the order of the lesson's MOTORS list)
const FRONT = [1, 1, -1, -1]
const RIGHT = [1, -1, 1, -1]
export function forces(speeds) {
  const t = speeds.map(motorThrustN)
  const total = t.reduce((a, b) => a + b, 0)
  // nose-down torque is positive: the rear motors push up harder than the front ones
  const pitchTorque = DRONE.armM * t.reduce((s, x, i) => s - FRONT[i] * x, 0)
  // roll-right torque is positive: the left motors push up harder than the right ones
  const rollTorque = DRONE.armM * t.reduce((s, x, i) => s - RIGHT[i] * x, 0)
  return { thrusts: t, total, pitchTorque, rollTorque }
}

// ---- the PID loop that keeps the quad at the angle the stick asks for ----
// The sliders use numbers like a flight controller does (P 45, I 80 are common defaults).
export const GAIN_SCALE = { p: 0.27, i: 0.1, d: 0.0155 }
export const DEFAULT_SLIDERS = { p: 45, i: 80, d: 42 }
export const gainsFromSliders = ({ p, i, d }) => ({ kp: p * GAIN_SCALE.p, ki: i * GAIN_SCALE.i, kd: d * GAIN_SCALE.d })

export const MIX = 0.1 // a full PID output moves the motors this far from the base speed
export const MOTOR_LAG_S = 0.02
const I_LIMIT = 0.35
const DAMPING = 0.002 // N m s per rad, from the air

export class AttitudeAxis {
  constructor() {
    this.reset()
  }

  reset() {
    this.angle = 0 // rad
    this.rate = 0 // rad/s
    this.integral = 0
    this.out = 0 // what the speed controllers are doing (the PID output after the motor lag)
    this.p = 0
    this.i = 0
    this.d = 0
    this.u = 0
    this.torque = 0
  }

  // One step of the loop. dt in seconds of simulated time. `base` is the throttle all four motors share.
  // `sign` is +1 for pitch (positive = nose down) and -1 for roll, so both can use one set of equations.
  step(dt, setpoint, gains, { disturbance = 0, base = HOVER } = {}) {
    const err = setpoint - this.angle
    this.p = gains.kp * err
    this.d = -gains.kd * this.rate
    const raw = this.p + this.integral + this.d
    const u = clamp(raw, -1, 1)
    // only keep adding to the I term while the output is not stuck at its limit
    if (raw === u || Math.sign(err) !== Math.sign(raw)) this.integral = clamp(this.integral + gains.ki * err * dt, -I_LIMIT, I_LIMIT)
    this.i = this.integral
    this.u = u
    this.out += (u - this.out) * (1 - Math.exp(-dt / MOTOR_LAG_S))
    // a positive output tips the nose down: the front pair slows and the rear pair speeds up
    const front = clamp(base - MIX * this.out, 0, 1)
    const rear = clamp(base + MIX * this.out, 0, 1)
    this.torque = DRONE.armM * 2 * (motorThrustN(rear) - motorThrustN(front))
    const accel = (this.torque + disturbance) / DRONE.inertia - (DAMPING / DRONE.inertia) * this.rate
    this.rate += accel * dt
    this.angle += this.rate * dt
    return { angle: this.angle, rate: this.rate, u: this.u, p: this.p, i: this.i, d: this.d, torque: this.torque, out: this.out }
  }
}

// ---- how good was a step response? (used by the PID lab to tell the pilot what happened) ----
// samples: [{t, y}] after the step; target is the value the response should reach
export function stepMetrics(samples, target) {
  if (samples.length < 3 || Math.abs(target) < 1e-6) return null
  const dir = Math.sign(target)
  const ys = samples.map((s) => s.y * dir)
  const goal = Math.abs(target)
  const peak = Math.max(...ys)
  const overshootPct = Math.max(0, ((peak - goal) / goal) * 100)
  const rise = samples.find((s) => s.y * dir >= 0.9 * goal)
  const band = 0.05 * goal
  let settleT = null
  for (let k = samples.length - 1; k >= 0; k--) {
    if (Math.abs(samples[k].y * dir - goal) > band) {
      settleT = samples[Math.min(k + 1, samples.length - 1)].t - samples[0].t
      break
    }
  }
  if (settleT === null) settleT = 0
  const last = samples.slice(-Math.max(3, Math.floor(samples.length * 0.1)))
  const final = last.reduce((a, s) => a + s.y * dir, 0) / last.length
  return {
    overshootPct,
    riseS: rise ? rise.t - samples[0].t : null,
    settleS: settleT,
    steadyErrorPct: ((goal - final) / goal) * 100,
    settled: Math.abs(final - goal) <= band,
  }
}

// ---- what the physics is doing right now, for the "laws" tab ----
export function liveLaws({ thrustN, weightN, dragNow, vertAccel, speedMs, pitchDeg, rollDeg, pitchTorque, rollTorque, yawTorqueNet }) {
  const net = thrustN * 1 - weightN - dragNow
  return {
    netForce: net,
    accel: vertAccel,
    speedMs,
    pitchDeg,
    rollDeg,
    pitchTorque,
    rollTorque,
    yawTorqueNet,
  }
}
