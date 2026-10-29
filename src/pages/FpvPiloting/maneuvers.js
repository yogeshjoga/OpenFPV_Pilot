// Flying a stunt or a race turn on screen. A move is a list of phases. Each phase says how long it lasts, how much the flight path
// turns, how much the drone rolls, how fast it goes, and what the sticks do. Flying it gives a sample for every 1/60 second: where the
// drone is, which way it points, and where the sticks are. Pure functions, so they are tested.

const RAD = Math.PI / 180
const STEP = 1 / 60
const SMOOTH = 0.2 // s: a stick takes this long to move from one phase's position to the next, so it never jumps

export const NEUTRAL = { throttle: 0.45, yaw: 0, pitch: 0, roll: 0 }
const lerp = (a, b, k) => a + (b - a) * k
const ease = (k) => k * k * (3 - 2 * k)

// phase: { dur, dHeading = 0, dOffset = 0, dRoll = 0, speed, sticks, title, text }
//   dHeading  how much the flight path turns during the phase, in degrees. Side view: positive is up and over (a pull-up).
//             Top view: positive is a turn to the left.
//   dOffset   how much the drone rotates beyond the flight path (side view), in degrees; positive is nose up. A flip is a rotation with no path change.
//   dRoll     how much the drone rolls, in degrees, positive to the right
//   dYaw      how much the drone turns about its vertical axis beyond its flight path, in degrees, positive to the right (a pirouette, a stall turn)
//   speed     the speed at the end of the phase in m/s; it changes smoothly from the speed before
// options: view 'side' (x forward, y up) or 'top' (x east, y north); lean, the nose-down tilt of a cruising drone in degrees
export function flyManeuver(phases, { view = 'side', lean = 15, speed = 10, start = { x: 0, y: 0 } } = {}) {
  // the drone's own pitch, as the 3D model needs it: once the drone has turned round (yaw past 90 degrees) its nose points the other way along x,
  // so the angle is measured from the other side
  const bodyPitch = (heading, offset, yaw) => {
    const nose = view === 'side' ? heading + offset : -lean
    return Math.cos(yaw * RAD) < 0 && view === 'side' ? 180 - nose : nose
  }
  const samples = []
  let { x, y } = start
  let heading = view === 'side' ? 0 : 90
  let offset = -lean // the nose points a little below the flight path while cruising
  let roll = 0
  let yaw = 0
  let v = speed
  let t = 0
  let prev = { ...NEUTRAL }
  phases.forEach((phase, index) => {
    const steps = Math.max(1, Math.round(phase.dur / STEP))
    const dt = phase.dur / steps
    const target = { ...NEUTRAL, ...phase.sticks }
    const vEnd = phase.speed ?? v
    const vStart = v
    for (let k = 0; k < steps; k += 1) {
      const u = k / steps
      const blend = ease(Math.min(1, (u * phase.dur) / SMOOTH))
      const sticks = { throttle: lerp(prev.throttle, target.throttle, blend), yaw: lerp(prev.yaw, target.yaw, blend), pitch: lerp(prev.pitch, target.pitch, blend), roll: lerp(prev.roll, target.roll, blend) }
      samples.push({ t, x, y, heading, nose: view === 'side' ? heading + offset : heading - yaw, pitchUp: bodyPitch(heading, offset, yaw), roll, yaw, speed: v, phase: index, sticks })
      const nextHeading = heading + ((phase.dHeading ?? 0) / steps)
      const mid = ((heading + nextHeading) / 2) * RAD
      v = lerp(vStart, vEnd, (k + 1) / steps)
      x += Math.cos(mid) * v * dt
      y += Math.sin(mid) * v * dt
      heading = nextHeading
      offset += (phase.dOffset ?? 0) / steps
      roll += (phase.dRoll ?? 0) / steps
      yaw += (phase.dYaw ?? 0) / steps
      t += dt
    }
    prev = target
  })
  const last = samples[samples.length - 1]
  samples.push({ ...last, t, x, y, heading, nose: view === 'side' ? heading + offset : heading - yaw, pitchUp: bodyPitch(heading, offset, yaw), roll, yaw, speed: v })
  return samples
}

// the pose DroneBuilder wants, in radians (nose down and right side down are positive), and the height in mm
export function maneuverPose(sample, view, y0 = 0) {
  return {
    pitch: -sample.pitchUp * RAD,
    roll: sample.roll * RAD,
    // facing east in a side view (the path runs left to right), and facing along its heading in a top view
    yaw: ((view === 'top' ? -(sample.heading - 90) : 90) + sample.yaw) * RAD,
    height: view === 'side' ? Math.min(220, Math.max(0, (sample.y - y0) * 5)) : 40,
  }
}

// the first sample of a phase, for jumping to it
export const phaseStart = (samples, index) => samples.find((s) => s.phase === index) ?? samples[0]

// ---------------------------------------------------------------------------------------------------------------
// The same flight, laid out in the 3D scene. The scene is in millimetres, so a path of tens of metres is scaled down (k mm per metre) and
// the drone is drawn larger than life so it can be seen. Side view: forward is to the right and height is up. Top view: east is to the
// right and north is away from the viewer. A path is a list of samples (x, y in metres, phase).
// ---------------------------------------------------------------------------------------------------------------

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const FLIGHT_HEIGHT = 40 // mm above the mat for a flight seen from above

// colours: an array of numbers (0xrrggbb), one for each phase
export function sceneTrack(samples, view, { rigY = 12, colors = [0x3e8ef7], width = 1100 } = {}) {
  const xs = samples.map((p) => p.x)
  const ys = samples.map((p) => p.y)
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = Math.min(...ys)
  const y1 = Math.max(...ys)
  const w = x1 - x0
  const h = y1 - y0
  const cx = (x0 + x1) / 2
  const cy = (y0 + y1) / 2
  const k = clamp(width / Math.max(view === 'top' ? Math.max(w, h) : w, 6), 8, 44)

  // where the drone is: x, z and its height above the mat, all in mm (the height is measured from the mat, as the 3D drone expects)
  const place = (p) => view === 'side'
    ? { x: (p.x - cx) * k, z: 0, height: (p.y - y0) * k }
    : { x: (p.x - cx) * k, z: -(p.y - cy) * k, height: FLIGHT_HEIGHT }

  const phases = Math.max(...samples.map((p) => p.phase)) + 1
  const segments = Array.from({ length: phases }, (_, i) => ({
    color: colors[i % colors.length],
    points: samples.filter((p) => p.phase === i).filter((_, j, list) => j % 4 === 0 || j === list.length - 1).map((p) => {
      const at = place(p)
      return { x: at.x, y: rigY + at.height, z: at.z }
    }),
  }))
  // a segment needs to join the one before it
  for (let i = 1; i < segments.length; i += 1) {
    const prev = segments[i - 1].points
    if (prev.length) segments[i].points.unshift(prev[prev.length - 1])
  }

  const fit = view === 'side'
    ? { center: [0, rigY + (h * k) / 2, 0], width: w * k + 260, height: h * k + 260, elevation: 12 }
    : { center: [0, rigY + FLIGHT_HEIGHT, 0], width: w * k + 220, height: h * k + 220, elevation: 58 }
  return { k, place, segments, fit }
}
