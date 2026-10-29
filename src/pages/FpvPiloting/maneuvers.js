// Flying a stunt or a race turn on screen. A move is a list of phases. Each phase says how long it lasts, how much the flight path
// turns, how much the drone rolls, how fast it goes, and what the sticks do. Flying it gives a sample for every 1/60 second: where the
// drone is, which way it points, and where the sticks are. Pure functions, so they are tested.

const RAD = Math.PI / 180
const STEP = 1 / 60
const SMOOTH = 0.14 // s: a stick takes this long to move from one phase's position to the next, so it never jumps

export const NEUTRAL = { throttle: 0.45, yaw: 0, pitch: 0, roll: 0 }
const lerp = (a, b, k) => a + (b - a) * k
const ease = (k) => k * k * (3 - 2 * k)

// phase: { dur, dHeading = 0, dOffset = 0, dRoll = 0, speed, sticks, title, text }
//   dHeading  how much the flight path turns during the phase, in degrees. Side view: positive is up and over (a pull-up).
//             Top view: positive is a turn to the left.
//   dOffset   how much the drone rotates beyond the flight path (side view), in degrees; positive is nose up. A flip is a rotation with no path change.
//   dRoll     how much the drone rolls, in degrees, positive to the right
//   speed     the speed at the end of the phase in m/s; it changes smoothly from the speed before
// options: view 'side' (x forward, y up) or 'top' (x east, y north); lean, the nose-down tilt of a cruising drone in degrees
export function flyManeuver(phases, { view = 'side', lean = 15, speed = 10, start = { x: 0, y: 0 } } = {}) {
  const samples = []
  let { x, y } = start
  let heading = view === 'side' ? 0 : 90
  let offset = -lean // the nose points a little below the flight path while cruising
  let roll = 0
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
      samples.push({ t, x, y, heading, pitchUp: view === 'side' ? heading + offset : -lean, roll, speed: v, phase: index, sticks })
      const nextHeading = heading + ((phase.dHeading ?? 0) / steps)
      const mid = ((heading + nextHeading) / 2) * RAD
      v = lerp(vStart, vEnd, (k + 1) / steps)
      x += Math.cos(mid) * v * dt
      y += Math.sin(mid) * v * dt
      heading = nextHeading
      offset += (phase.dOffset ?? 0) / steps
      roll += (phase.dRoll ?? 0) / steps
      t += dt
    }
    prev = target
  })
  const last = samples[samples.length - 1]
  samples.push({ ...last, t, x, y, heading, pitchUp: view === 'side' ? heading + offset : -lean, roll, speed: v })
  return samples
}

// the pose DroneBuilder wants, in radians (nose down and right side down are positive), and the height in mm
export function maneuverPose(sample, view, y0 = 0) {
  return {
    pitch: -sample.pitchUp * RAD,
    roll: sample.roll * RAD,
    yaw: view === 'top' ? -(sample.heading - 90) * RAD : 0,
    height: view === 'side' ? Math.min(220, Math.max(0, (sample.y - y0) * 5)) : 40,
  }
}

// the first sample of a phase, for jumping to it
export const phaseStart = (samples, index) => samples.find((s) => s.phase === index) ?? samples[0]
