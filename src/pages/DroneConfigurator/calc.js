// Estimates for a build. Simple, honest physics for teaching: every number is rounded and typical, not a measurement.
import { FIXED, resolveBuild } from './catalog.js'

export const G = 9.81
const CELL_V = 3.7 // nominal volts per cell
const LOADED = 0.82 // the motor turns at about this fraction of its no-load speed when it drives a prop
const THRUST_K = 0.00167 // kgf per (1000 rpm)^2 for a 5.1 x 4.6 tri-blade
const OVER_CELL_HEADROOM = 1.2
const AIR = 1.225 // kg per cubic metre
const HOVER_EFFICIENCY = 0.45 * 0.8 // prop figure of merit x motor and speed controller efficiency
const USABLE = 0.8 // keep 20% of the battery in reserve
const FREESTYLE_POWER = 2.5 // flying freestyle takes about this many times the hover power

export function estimate(input) {
  const { frame, motor, prop, battery, video } = resolveBuild(input)
  const cells = battery.cells
  const volts = cells * CELL_V
  const [minCells, maxCells] = motor.cells
  const overCells = cells > maxCells
  const underCells = cells < minCells

  const weights = {
    frame: frame.weightG,
    motors: motor.weightG * 4,
    props: Math.round(prop.weightG * 4 * 10) / 10,
    battery: battery.weightG,
    video: video.weightG,
    stack: FIXED.stackWeightG,
    extras: FIXED.extrasWeightG,
  }
  const weightG = Math.round(Object.values(weights).reduce((a, b) => a + b, 0))

  const rpm = motor.kv * volts * LOADED
  const formulaKg = THRUST_K * prop.thrustFactor * (rpm / 1000) ** 2
  const limitKg = motor.maxThrustKg * (overCells ? OVER_CELL_HEADROOM : 1)
  const motorKg = Math.min(formulaKg, limitKg)
  const maxThrustKg = motorKg * 4
  const twr = maxThrustKg / (weightG / 1000)
  const hoverThrottle = Math.min(1, Math.sqrt(1 / twr))

  const topSpeedKmh = ((rpm * prop.pitchIn * 0.0254) / 60) * 3.6 * 0.7
  const peakCurrentA = motor.maxCurrentA * prop.currentFactor * (motorKg / motor.maxThrustKg) ** 1.2 * 4
  const batteryMaxA = (battery.c * battery.mah) / 1000

  const thrustN = (weightG / 1000) * G
  const area = 4 * Math.PI * ((prop.diameterIn * 0.0254) / 2) ** 2
  const hoverPowerW = thrustN ** 1.5 / Math.sqrt(2 * AIR * area) / HOVER_EFFICIENCY
  const usableWh = volts * (battery.mah / 1000) * USABLE
  const hoverMin = (usableWh / hoverPowerW) * 60
  const flightMin = hoverMin / FREESTYLE_POWER

  const warnings = []
  if (overCells) {
    warnings.push({ level: 'error', id: 'cells-high', text: `${cells}S is too much for this motor. It is wound for ${maxCells}S and would overspin, overheat and may fail.` })
  }
  if (underCells) {
    warnings.push({ level: 'warn', id: 'cells-low', text: `This motor is made for ${minCells}S. On ${cells}S it gives much less power than it can.` })
  }
  if (prop.diameterIn > frame.maxPropIn) {
    warnings.push({ level: 'error', id: 'prop-size', text: `This frame fits props up to ${frame.maxPropIn} inches. The propellers would hit each other or the arms.` })
  }
  if (peakCurrentA / 4 > FIXED.escRatingA) {
    warnings.push({ level: 'error', id: 'esc', text: `Each motor would draw about ${Math.round(peakCurrentA / 4)} A at full throttle. The speed controller is rated ${FIXED.escRatingA} A.` })
  }
  if (peakCurrentA > batteryMaxA) {
    warnings.push({ level: 'warn', id: 'battery-c', text: `At full throttle the motors want about ${Math.round(peakCurrentA)} A, and this battery can give about ${Math.round(batteryMaxA)} A. It would sag and heat up.` })
  }
  if (twr < 4) {
    warnings.push({ level: 'warn', id: 'twr-low', text: 'Thrust-to-weight is below 4. The quad will feel heavy and slow to climb. Freestyle quads usually have 5 or more.' })
  } else if (twr > 12) {
    warnings.push({ level: 'info', id: 'twr-high', text: 'Thrust-to-weight is above 12. It will be very fast and twitchy, so it is a lot to handle for a beginner.' })
  }
  if (weightG > 650) {
    warnings.push({ level: 'info', id: 'heavy', text: 'This build is heavy. A lighter battery or video setup would help it fly better.' })
  }

  return {
    parts: { frame, motor, prop, battery, video },
    cells,
    volts,
    weights,
    weightG,
    rpm,
    maxThrustKg,
    twr,
    hoverThrottle,
    topSpeedKmh,
    peakCurrentA,
    batteryMaxA,
    hoverPowerW,
    hoverMin,
    flightMin,
    warnings,
    ok: !warnings.some((w) => w.level === 'error'),
  }
}
