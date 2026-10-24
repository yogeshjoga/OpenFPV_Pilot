// Chart data for a build: how thrust, current, power, flight time and range change with the throttle and with forward speed.
// Built on the same simple physics as the lesson page (../DroneLesson/physics.js), for the parts the student chose.
import { G, bestSpeeds, dragN, leanForSpeed, powerCurve, powerW, thrustToFlyN } from '../DroneLesson/physics.js'
import { FIXED } from './catalog.js'

export const MAX_SPEED = 40 // m/s
const USABLE = 0.8

// the drone the physics functions work on: this build's weight and prop size, with a typical quad body
export const droneFor = (r) => ({
  massKg: r.weightG / 1000,
  propDiameterM: r.parts.prop.diameterIn * 0.0254,
  cd: 1.0,
  frontalAreaM2: 0.012,
  fmHover: 0.45,
  efficiency: 0.8,
})
export const usableWh = (r) => r.volts * (r.parts.battery.mah / 1000) * USABLE

// thrust grows with throttle squared and current with throttle cubed (power follows speed cubed), up to the full-throttle values
export function throttleCurves(r, steps = 40) {
  const xs = Array.from({ length: steps + 1 }, (_, k) => k / steps)
  const fullN = r.maxThrustKg * G
  return {
    xs,
    thrustN: xs.map((t) => fullN * t * t),
    currentA: xs.map((t) => r.peakCurrentA * t ** 3),
    weightN: (r.weightG / 1000) * G,
    hoverThrottle: r.hoverThrottle,
    batteryMaxA: r.batteryMaxA,
    escMaxA: 4 * FIXED.escRatingA,
  }
}

export function speedCurves(r, maxV = MAX_SPEED, steps = 80) {
  const d = droneFor(r)
  const points = powerCurve(maxV, steps, d)
  const wh = usableWh(r)
  return {
    xs: points.map((p) => p.v),
    induced: points.map((p) => p.induced),
    parasitic: points.map((p) => p.parasitic),
    total: points.map((p) => p.total),
    minutes: points.map((p) => (wh / p.total) * 60),
    rangeKm: points.map((p) => ((wh / p.total) * p.v * 3.6)),
    best: bestSpeeds(maxV, d),
    usableWh: wh,
  }
}

// the numbers at one throttle setting (0 to 1)
export function atThrottle(r, t) {
  const thrustN = r.maxThrustKg * G * t * t
  const currentA = r.peakCurrentA * t ** 3
  return {
    thrustN,
    thrustKg: thrustN / G,
    twr: thrustN / ((r.weightG / 1000) * G),
    currentA,
    powerW: currentA * r.volts,
    rpm: r.rpm * t,
    pitchSpeedKmh: r.topSpeedKmh * t,
    overBattery: currentA > r.batteryMaxA,
  }
}

// the numbers at one forward speed in level flight
export function atSpeed(r, v) {
  const d = droneFor(r)
  const p = powerW(v, d)
  const hours = usableWh(r) / p.total
  return {
    dragN: dragN(v, { cd: d.cd, area: d.frontalAreaM2 }),
    leanDeg: (leanForSpeed(v, d) * 180) / Math.PI,
    thrustN: thrustToFlyN(v, d),
    powerW: p.total,
    minutes: hours * 60,
    rangeKm: hours * v * 3.6,
  }
}
