// The physics and aerodynamics behind the Physics page. Every function is a textbook formula in SI units (metres, kilograms, seconds,
// newtons, watts), kept small enough to teach from, and tested. Angles in degrees unless a name says radians.

export const G = 9.80665 // gravity, m/s²
export const R_AIR = 287.05 // gas constant of air, J/(kg·K)
export const GAMMA = 1.4 // ratio of specific heats of air
export const MU_AIR = 1.81e-5 // viscosity of air at about 15 °C, Pa·s

const RAD = Math.PI / 180

// ---------------------------------------------------------------------------------------------------------------
// The atmosphere
// ---------------------------------------------------------------------------------------------------------------

/** The International Standard Atmosphere below 11 km. `hotter` is how many degrees warmer than standard the day is. */
export function atmosphere(altitudeM, hotter = 0) {
  const standardT = 288.15 - 0.0065 * altitudeM
  const T = standardT + hotter
  const p = 101325 * (standardT / 288.15) ** 5.25588
  const rho = p / (R_AIR * T)
  return { temperatureK: T, pressurePa: p, density: rho, ratio: rho / 1.225, speedOfSound: Math.sqrt(GAMMA * R_AIR * T) }
}

// ---------------------------------------------------------------------------------------------------------------
// Forces and the propeller
// ---------------------------------------------------------------------------------------------------------------

export const weight = (massKg) => massKg * G
export const thrustToWeight = (totalThrustN, massKg) => totalThrustN / weight(massKg)
/** The fraction of full throttle that hovers, when thrust grows with the square of motor speed. */
export const hoverThrottle = (twr) => Math.sqrt(1 / twr)

export const discArea = (diameterM, count = 1) => count * Math.PI * (diameterM / 2) ** 2

/** Air speed through the rotor when hovering (momentum theory): v = sqrt(T / (2 ρ A)). */
export const inducedVelocity = (thrustN, rho, areaM2) => Math.sqrt(thrustN / (2 * rho * areaM2))

/** The least power any rotor needs to make that thrust: P = T v. Real motors and props need more. */
export const idealHoverPower = (thrustN, rho, areaM2) => thrustN * inducedVelocity(thrustN, rho, areaM2)

/** Electrical power in the air, from the ideal power, how good the propeller is (figure of merit) and the motor and ESC efficiency. */
export const hoverElectricalPower = ({ massKg, rho, areaM2, figureOfMerit = 0.6, efficiency = 0.8 }) =>
  idealHoverPower(weight(massKg), rho, areaM2) / (figureOfMerit * efficiency)

/** T = C_T ρ n² D⁴, with n in turns per second. C_T is about 0.1 for a typical 5 inch propeller. */
export const propellerThrust = ({ ct = 0.1, rho, rps, diameterM }) => ct * rho * rps ** 2 * diameterM ** 4
/** P = C_P ρ n³ D⁵ (shaft power). */
export const propellerPower = ({ cp = 0.045, rho, rps, diameterM }) => cp * rho * rps ** 3 * diameterM ** 5
/** The twisting force the motor must overcome: Q = P / (2π n). It is also the reaction that turns the drone the other way. */
export const propellerTorque = ({ cp = 0.045, rho, rps, diameterM }) => propellerPower({ cp, rho, rps, diameterM }) / (2 * Math.PI * rps)

export const tipSpeed = (rps, diameterM) => Math.PI * rps * diameterM
export const tipMach = (rps, diameterM, speedOfSound = 340.3) => tipSpeed(rps, diameterM) / speedOfSound
export const reynolds = (rho, speed, chordM, mu = MU_AIR) => (rho * speed * chordM) / mu

// ---------------------------------------------------------------------------------------------------------------
// Wings, blades, lift and drag
// ---------------------------------------------------------------------------------------------------------------

/**
 * Lift coefficient of a thin aerofoil: C_L = 2π α (α in radians) up to the stall angle, then it falls away as the air separates from the top.
 */
export function liftCoefficient(alphaDeg, stallDeg = 14) {
  const a = Math.abs(alphaDeg)
  const sign = alphaDeg < 0 ? -1 : 1
  const peak = 2 * Math.PI * stallDeg * RAD
  if (a <= stallDeg) return sign * 2 * Math.PI * a * RAD
  return sign * Math.max(0.45 * peak, peak * (1 - 0.045 * (a - stallDeg)))
}

export const isStalled = (alphaDeg, stallDeg = 14) => Math.abs(alphaDeg) > stallDeg

/** Drag coefficient: a base amount plus the drag that comes with making lift, C_D = C_D0 + k C_L². After the stall the wake adds a lot more. */
export function dragCoefficient(alphaDeg, { cd0 = 0.012, k = 0.05, stallDeg = 14 } = {}) {
  const cl = liftCoefficient(alphaDeg, stallDeg)
  const stallExtra = Math.max(0, Math.abs(alphaDeg) - stallDeg) * 0.03
  return cd0 + k * cl * cl + stallExtra
}

/** L = ½ ρ V² S C_L */
export const liftForce = ({ rho, speed, area, cl }) => 0.5 * rho * speed * speed * area * cl
/** D = ½ ρ V² C_D A. Pass the drag area C_D·A for a whole drone. */
export const dragForce = ({ rho, speed, cdA }) => 0.5 * rho * speed * speed * cdA
export const dynamicPressure = (rho, speed) => 0.5 * rho * speed * speed

// ---------------------------------------------------------------------------------------------------------------
// Flying forward and turning
// ---------------------------------------------------------------------------------------------------------------

/** Thrust needed when the drone is tilted: T = m g / cos θ. */
export const thrustForTilt = (massKg, tiltDeg) => weight(massKg) / Math.cos(tiltDeg * RAD)

/** Steady forward speed at a tilt, where the sideways part of the thrust (m g tan θ) equals drag: V = sqrt(2 m g tan θ / (ρ C_D A)). */
export const speedForTilt = ({ massKg, tiltDeg, rho, cdA }) => Math.sqrt((2 * weight(massKg) * Math.tan(tiltDeg * RAD)) / (rho * cdA))

/** The tilt that holds a steady speed. */
export const tiltForSpeed = ({ massKg, speed, rho, cdA }) => Math.atan(dragForce({ rho, speed, cdA }) / weight(massKg)) / RAD

/** A level turn at a bank angle: the load factor n = 1 / cos φ, the radius r = V² / (g tan φ) and the turn rate. */
export function levelTurn({ speed, bankDeg }) {
  const phi = bankDeg * RAD
  return { loadFactor: 1 / Math.cos(phi), radiusM: (speed * speed) / (G * Math.tan(phi)), rateDegPerS: ((G * Math.tan(phi)) / speed) / RAD }
}

// ---------------------------------------------------------------------------------------------------------------
// Frame, balance and rotation
// ---------------------------------------------------------------------------------------------------------------

/**
 * The turning effect (torque, N·m) a four-motor X quad gets from its four thrusts. Motors in the order front right, front left, rear right,
 * rear left. `arm` is the distance from the centre to a motor. `torquePerThrust` is Q / T (about 0.01 to 0.02 m for a 5 inch propeller).
 * Positive pitch lifts the nose; positive roll lowers the right side; positive yaw turns clockwise seen from above.
 */
export function quadMoments({ thrusts, arm, torquePerThrust = 0.015 }) {
  const [fr, fl, rr, rl] = thrusts
  const d = arm / Math.SQRT2
  return {
    pitch: (fr + fl - rr - rl) * d,
    roll: (fl + rl - fr - rr) * d,
    // front right and rear left spin one way, the other two spin the opposite way, so their reaction torques have opposite signs
    yaw: (fr + rl - fl - rr) * torquePerThrust,
    lift: fr + fl + rr + rl,
  }
}

/** Moment of inertia about the roll (or pitch) axis and about the yaw axis, for four motors on arms and a central body treated as a disc. */
export function quadInertia({ motorMassKg, armM, bodyMassKg, bodyRadiusM }) {
  const body = 0.25 * bodyMassKg * bodyRadiusM ** 2
  return {
    roll: 4 * motorMassKg * (armM / Math.SQRT2) ** 2 + body,
    yaw: 4 * motorMassKg * armM ** 2 + 0.5 * bodyMassKg * bodyRadiusM ** 2,
  }
}

/** α = τ / I */
export const angularAcceleration = (torque, inertia) => torque / inertia

/** The balance point along a line (x in mm) of parts with masses in grams. */
export const centreOfGravity = (parts) => parts.reduce((s, p) => s + p.massG * p.x, 0) / parts.reduce((s, p) => s + p.massG, 0)

/** In ground effect the rotor makes more thrust for the same power: T_ige / T_oge = 1 / (1 − (R / 4z)²), z is the height of the rotor above the ground. */
export function groundEffect(rotorRadiusM, heightM) {
  const z = Math.max(heightM, rotorRadiusM * 0.5)
  return 1 / (1 - (rotorRadiusM / (4 * z)) ** 2)
}

// ---------------------------------------------------------------------------------------------------------------
// Energy and flight time
// ---------------------------------------------------------------------------------------------------------------

export const batteryEnergyWh = (capacityMah, cells, nominalCellV = 3.7) => (capacityMah / 1000) * cells * nominalCellV
/** Minutes of flight: energy you can use divided by the average power. `usable` leaves some in the battery. */
export const flightTimeMin = ({ energyWh, powerW, usable = 0.8 }) => (energyWh * usable * 60) / powerW

// ---------------------------------------------------------------------------------------------------------------
// Navigation: the wind triangle
// ---------------------------------------------------------------------------------------------------------------

const norm360 = (deg) => ((deg % 360) + 360) % 360

/**
 * The wind triangle, as taught in ground school. You want to fly a ground track in a wind that is blowing FROM `windFrom` (degrees).
 * Returns the heading to point the nose at, the wind correction angle, and the speed over the ground. Angles are compass degrees.
 * If the wind is stronger than the airspeed on the crosswind, the track cannot be held and `possible` is false.
 */
export function windTriangle({ airspeed, trackDeg, windFromDeg, windSpeed }) {
  const beta = (windFromDeg - trackDeg) * RAD // angle of the wind from the track
  const ratio = (windSpeed / airspeed) * Math.sin(beta)
  if (Math.abs(ratio) > 1) return { possible: false, headingDeg: trackDeg, correctionDeg: 0, groundSpeed: 0, headwind: windSpeed * Math.cos(beta), crosswind: windSpeed * Math.sin(beta) }
  const wca = Math.asin(ratio)
  return {
    possible: true,
    correctionDeg: wca / RAD,
    headingDeg: norm360(trackDeg + wca / RAD),
    groundSpeed: airspeed * Math.cos(wca) - windSpeed * Math.cos(beta),
    headwind: windSpeed * Math.cos(beta),
    crosswind: windSpeed * Math.sin(beta),
  }
}
