// The small simulations behind the FPV Piloting page. They are simple on purpose: they show what each flight mode does
// with the sticks, how a loop pattern is flown, and how far a drone needs to stop. Pure functions, so they are tested.

export const G = 9.81
const RAD = Math.PI / 180
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180

// ---------------------------------------------------------------------------------------------------------------
// Flight modes
// ---------------------------------------------------------------------------------------------------------------

export const MODE_IDS = ['angle', 'horizon', 'acro', '3d']

export const MAX_ANGLE = 55 // deg: the most tilt Angle mode allows
export const FLIP_RATE = 600 // deg/s at full stick in Horizon, Acro and 3D
export const YAW_RATE = 360 // deg/s at full yaw stick
const ANGLE_LAG = 0.12 // s: how fast the drone settles on the angle the stick asks for
const HOVER_STICK = 0.4 // throttle stick that holds the drone up in the normal modes
const THRUST_RATIO = 1 / HOVER_STICK // thrust-to-weight at full throttle is 2.5
const CEILING = 6 // m

export const initialState = (alt = 2) => ({ roll: 0, pitch: 0, yaw: 0, alt, vz: 0, crashed: false })

// The throttle stick means different things: 0 to 1 is "how hard to push" in the normal modes, and in 3D mode the middle is zero
// and below it the motors spin backwards. Returns the thrust as a multiple of weight, positive = along the drone's top.
export function thrustWeights(mode, throttle) {
  if (mode === '3d') return clamp((throttle - 0.5) * 2, -1, 1) * 2 // 2 weights each way
  return clamp(throttle, 0, 1) * THRUST_RATIO
}

// one axis of attitude (roll or pitch), in degrees
function stepAxis(angle, stick, mode, dt) {
  if (mode === 'angle') {
    const target = stick * MAX_ANGLE
    return angle + (target - angle) * (1 - Math.exp(-dt / ANGLE_LAG))
  }
  if (mode === 'horizon') {
    // levels itself near the centre, and turns into Acro as the stick goes to the end
    const pull = Math.max(0, 1 - Math.abs(stick) * 1.5)
    return angle + (stick * FLIP_RATE - wrap(angle) * 5 * pull) * dt
  }
  return angle + stick * FLIP_RATE * dt // acro and 3d: the stick is a rotation speed, and the drone stays where you leave it
}

// input: { roll, pitch, yaw, throttle } with the sticks from -1 to 1 and the throttle from 0 to 1
export function stepMode(state, input, mode, dt) {
  const roll = stepAxis(state.roll, input.roll, mode, dt)
  const pitch = stepAxis(state.pitch, input.pitch, mode, dt)
  const yaw = state.yaw + input.yaw * YAW_RATE * dt
  // thrust pushes along the top of the drone, so tilting it spends some of the thrust sideways, and upside down it pushes down
  const up = Math.cos(roll * RAD) * Math.cos(pitch * RAD)
  const thrust = thrustWeights(mode, input.throttle)
  let acc = G * thrust * up - G - 0.7 * state.vz
  let vz = state.vz + acc * dt
  let alt = state.alt + vz * dt
  let crashed = state.crashed
  if (alt <= 0) {
    if (state.alt > 0 && vz < -3) crashed = true // came down hard
    alt = 0
    vz = Math.max(0, vz)
  }
  if (alt >= CEILING) { alt = CEILING; vz = Math.min(0, vz) }
  if (alt > 0.05) crashed = false
  return { roll, pitch, yaw, alt, vz, crashed }
}

// how much of the thrust is pushing the drone up the world (negative: pushing it down)
export const liftNow = (state, mode, throttle) => thrustWeights(mode, throttle) * Math.cos(state.roll * RAD) * Math.cos(state.pitch * RAD)

// what the student sees: how far the drone is tilted from level, 0 to 180
export const tiltDeg = (state) => Math.acos(clamp(Math.cos(state.roll * RAD) * Math.cos(state.pitch * RAD), -1, 1)) / RAD

// ---------------------------------------------------------------------------------------------------------------
// Loop patterns: a route is a list of straights and turns; flying it gives the path and the sticks needed
// ---------------------------------------------------------------------------------------------------------------

export const FLY = { speed: 9, yawFull: 240, maxPitch: 0.62, throttle: 0.44 }

const SAMPLES_PER_SECOND = 30

// segments: { kind: 'straight', len } or { kind: 'turn', deg, r } with deg > 0 turning left and deg < 0 turning right (metres, degrees),
// and an optional `speed` (m/s) for a slower part, such as braking for a corner
// start: { x, y, heading } with the heading in degrees, 0 = east, 90 = north
export function flyRoute(segments, start = { x: 0, y: 0, heading: 90 }, { speed: defaultSpeed = FLY.speed } = {}) {
  const samples = []
  let { x, y, heading } = start
  let t = 0
  segments.forEach((seg, phase) => {
    const speed = seg.speed ?? defaultSpeed
    const length = seg.kind === 'straight' ? seg.len : Math.abs(seg.deg) * RAD * seg.r
    const duration = length / speed
    const steps = Math.max(2, Math.round(duration * SAMPLES_PER_SECOND))
    const dt = duration / steps
    const turnRate = seg.kind === 'turn' ? (speed / seg.r) * Math.sign(seg.deg) / RAD : 0 // deg/s, positive turning left
    for (let k = 0; k < steps; k += 1) {
      samples.push({ t, x, y, heading, phase, turnRate, speed })
      const next = heading + turnRate * dt
      const mid = (heading + next) / 2 // move along the average heading, so a circle closes
      x += Math.cos(mid * RAD) * speed * dt
      y += Math.sin(mid * RAD) * speed * dt
      heading = next
      t += dt
    }
  })
  samples.push({ t, x, y, heading, phase: segments.length - 1, turnRate: 0, speed: segments[segments.length - 1].speed ?? defaultSpeed })
  return samples
}

// The sticks for one moment of the route, in Mode 2 (left stick: throttle up and down, yaw left and right;
// right stick: pitch forward and back, roll left and right). Every value is from -1 to 1 (throttle: 0 to 1).
// A left turn is yaw to the left (negative) with a little roll to the left; going forward is pitch up (positive).
export function sticksFor(sample) {
  const turning = Math.abs(sample.turnRate)
  const side = -Math.sign(sample.turnRate) // -1 turning left, +1 turning right
  const yaw = turning ? clamp(side * (turning / FLY.yawFull), -1, 1) : 0
  const roll = turning ? clamp(side * (0.18 + 0.35 * Math.min(1, turning / FLY.yawFull)), -1, 1) : 0
  const pitch = FLY.maxPitch * Math.min(1, sample.speed / FLY.speed)
  const throttle = FLY.throttle + (turning ? 0.11 : 0)
  return { throttle, yaw, pitch, roll }
}

// the pose of the 3D drone for those sticks, in radians (nose down and right side down are positive, as DroneBuilder expects)
export function poseFor(sample) {
  const s = sticksFor(sample)
  return { pitch: s.pitch * MAX_ANGLE * 0.6 * RAD, roll: s.roll * MAX_ANGLE * RAD, yaw: -(sample.heading - 90) * RAD } // the drone's yaw is positive to the right, a heading is positive to the left
}

// the words for a stick value
export function describeStick(name, value) {
  const pct = Math.round(Math.abs(value) * 100)
  if (name === 'throttle') return value > 0.52 ? `up to ${Math.round(value * 100)}%` : value < 0.36 ? `down to ${Math.round(value * 100)}%` : `hold steady (${Math.round(value * 100)}%)`
  if (pct < 4) return 'centred'
  const words = { yaw: ['left', 'right'], pitch: ['back', 'forward'], roll: ['left', 'right'] }[name]
  const dir = value < 0 ? words[0] : words[1]
  return `${dir} ${pct < 25 ? 'a little' : pct < 55 ? 'about half' : 'a lot'} (${pct}%)`
}

// the shapes
const R = 5.5
const eightLeg = R * Math.sqrt(3) // the straight part of the figure 8, between the two circles (circle centres 2R apart)
export const LOOPS = {
  0: {
    start: { x: 0, y: -8, heading: 90 },
    segments: [
      { kind: 'straight', len: 5 },
      { kind: 'turn', deg: 360, r: 6.5 },
      { kind: 'straight', len: 5 },
    ],
  },
  8: {
    start: { x: 0, y: 0, heading: 120 }, // the two loops one above the other, like the number 8
    segments: [
      { kind: 'straight', len: eightLeg },
      { kind: 'turn', deg: -240, r: R },
      { kind: 'straight', len: 2 * eightLeg }, // through the crossing in the middle
      { kind: 'turn', deg: 240, r: R },
      { kind: 'straight', len: eightLeg },
    ],
  },
  6: {
    start: { x: 9, y: 11, heading: 215 },
    segments: [
      { kind: 'straight', len: 3 },
      { kind: 'turn', deg: 95, r: 16 },
      { kind: 'turn', deg: 360, r: 5 },
      { kind: 'straight', len: 4 },
    ],
  },
  7: {
    start: { x: -9, y: 5, heading: 0 },
    segments: [
      { kind: 'straight', len: 14 },
      { kind: 'straight', len: 3, speed: 6 }, // brake for the corner
      { kind: 'turn', deg: -135, r: 1.6, speed: 4 },
      { kind: 'straight', len: 3, speed: 6 }, // pick the speed back up
      { kind: 'straight', len: 12 },
    ],
  },
}

export const routeFor = (id, options) => flyRoute(LOOPS[id].segments, LOOPS[id].start, options)

// the sample of a route at time t (seconds), found by bisection
export function sampleAt(route, t) {
  let lo = 0
  let hi = route.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (route[mid].t <= t) lo = mid
    else hi = mid - 1
  }
  return route[lo]
}

// ---------------------------------------------------------------------------------------------------------------
// Speed and stopping
// ---------------------------------------------------------------------------------------------------------------

export const kmhToMs = (kmh) => kmh / 3.6

// How far a drone goes before it has stopped: it keeps going while you see and decide (the reaction time), then you tip it
// back by `brakeDeg` and the sideways part of the thrust slows it. Holding height while tipped back means the sideways pull is g tan(angle).
// It ignores drag and wind, which help a little, so it is a careful estimate.
export function stopping(kmh, reactionS, brakeDeg) {
  const v = kmhToMs(kmh)
  const decel = G * Math.tan(brakeDeg * RAD)
  const reaction = v * reactionS
  const braking = (v * v) / (2 * decel)
  return { v, decel, reaction, braking, total: reaction + braking, seconds: reactionS + v / decel }
}
