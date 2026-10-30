import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  atmosphere, centreOfGravity, discArea, dragCoefficient, dragForce, flightTimeMin, groundEffect, hoverElectricalPower, hoverThrottle, idealHoverPower,
  inducedVelocity, isStalled, levelTurn, liftCoefficient, liftForce, propellerPower, propellerThrust, propellerTorque, quadInertia, quadMoments,
  reynolds, speedForTilt, thrustForTilt, thrustToWeight, tiltForSpeed, tipMach, weight, windTriangle, batteryEnergyWh,
} from './physics.js'

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`)

test('standard atmosphere: sea level, Leh and a hot day', () => {
  near(atmosphere(0).density, 1.225, 0.002)
  near(atmosphere(2000).density, 1.007, 0.004)
  near(atmosphere(3000).density, 0.909, 0.003)
  near(atmosphere(3500).density, 0.863, 0.003)
  near(atmosphere(3500).ratio, 0.705, 0.004)
  assert.ok(atmosphere(0, 20).density < atmosphere(0).density, 'heat thins the air')
  near(atmosphere(0).speedOfSound, 340.3, 0.5)
})

test('hover: weight, thrust to weight and the throttle that hovers', () => {
  near(weight(1), 9.80665, 1e-9)
  near(thrustToWeight(40, 1), 4.08, 0.01)
  near(hoverThrottle(4), 0.5, 1e-9)
  near(hoverThrottle(9), 1 / 3, 1e-9)
})

test('momentum theory: a 1 kg drone on four 5 inch propellers', () => {
  const A = discArea(0.127, 4)
  near(A, 0.0507, 0.0005)
  near(inducedVelocity(weight(1), 1.225, A), 8.9, 0.1)
  near(idealHoverPower(weight(1), 1.225, A), 87, 2)
  // the real electrical power is more than the ideal power
  assert.ok(hoverElectricalPower({ massKg: 1, rho: 1.225, areaM2: A }) > 150)
  // bigger propellers need less power for the same weight
  assert.ok(idealHoverPower(weight(1), 1.225, discArea(0.178, 4)) < idealHoverPower(weight(1), 1.225, A))
})

test('propeller laws: thrust goes with the square of speed, power with the cube', () => {
  const base = { rho: 1.225, diameterM: 0.127 }
  near(propellerThrust({ ...base, rps: 500 }), 7.97, 0.1)
  near(propellerThrust({ ...base, rps: 1000 }) / propellerThrust({ ...base, rps: 500 }), 4, 1e-9)
  near(propellerPower({ ...base, rps: 1000 }) / propellerPower({ ...base, rps: 500 }), 8, 1e-9)
  assert.ok(propellerThrust({ ...base, rps: 500, rho: 0.9 }) < propellerThrust({ ...base, rps: 500 }), 'thin air, less thrust')
  assert.ok(propellerTorque({ ...base, rps: 500 }) > 0)
  near(tipMach(500, 0.127), 0.59, 0.02)
})

test('lift coefficient: 2 pi per radian, then the stall', () => {
  near(liftCoefficient(0), 0, 1e-12)
  near(liftCoefficient(5), 2 * Math.PI * (5 * Math.PI / 180), 1e-9)
  near(liftCoefficient(14), 1.535, 0.01)
  assert.ok(liftCoefficient(20) < liftCoefficient(14), 'lift falls after the stall')
  assert.equal(isStalled(10), false)
  assert.equal(isStalled(18), true)
  assert.ok(dragCoefficient(18) > dragCoefficient(10) * 2, 'drag jumps after the stall')
  near(liftCoefficient(-5), -liftCoefficient(5), 1e-12)
})

test('lift and drag forces follow V squared', () => {
  const a = liftForce({ rho: 1.225, speed: 10, area: 0.01, cl: 1 })
  near(liftForce({ rho: 1.225, speed: 20, area: 0.01, cl: 1 }) / a, 4, 1e-9)
  near(dragForce({ rho: 1.225, speed: 30, cdA: 0.02 }), 11.03, 0.05)
})

test('tilted flight: more tilt, more speed and more thrust needed', () => {
  near(thrustForTilt(1, 60) / weight(1), 2, 1e-9)
  near(speedForTilt({ massKg: 1, tiltDeg: 45, rho: 1.225, cdA: 0.02 }), 28.3, 0.2)
  assert.ok(speedForTilt({ massKg: 1, tiltDeg: 60, rho: 1.225, cdA: 0.02 }) > speedForTilt({ massKg: 1, tiltDeg: 30, rho: 1.225, cdA: 0.02 }))
  // the two directions agree
  const v = speedForTilt({ massKg: 1, tiltDeg: 35, rho: 1.225, cdA: 0.02 })
  near(tiltForSpeed({ massKg: 1, speed: v, rho: 1.225, cdA: 0.02 }), 35, 1e-6)
  // thin air makes you faster for the same tilt
  assert.ok(speedForTilt({ massKg: 1, tiltDeg: 35, rho: 0.9, cdA: 0.02 }) > v)
})

test('level turn: load factor, radius and rate', () => {
  const t = levelTurn({ speed: 20, bankDeg: 60 })
  near(t.loadFactor, 2, 1e-9)
  near(t.radiusM, 400 / (9.80665 * Math.sqrt(3)), 1e-6)
  near(levelTurn({ speed: 20, bankDeg: 0.001 }).loadFactor, 1, 1e-6)
})

test('quad torques: balanced does nothing, front heavy pitches up, one side rolls, one pair yaws', () => {
  const m = (thrusts) => quadMoments({ thrusts, arm: 0.2 })
  const level = m([5, 5, 5, 5])
  near(level.pitch, 0, 1e-12); near(level.roll, 0, 1e-12); near(level.yaw, 0, 1e-12); near(level.lift, 20, 1e-12)
  assert.ok(m([6, 6, 4, 4]).pitch > 0 && Math.abs(m([6, 6, 4, 4]).roll) < 1e-12)
  assert.ok(m([4, 6, 4, 6]).roll > 0, 'more thrust on the left lowers the right side')
  assert.ok(m([6, 4, 4, 6]).yaw > 0 && Math.abs(m([6, 4, 4, 6]).pitch) < 1e-12)
  near(m([6, 6, 4, 4]).pitch, 4 * (0.2 / Math.SQRT2), 1e-9)
})

test('inertia grows with arm length and with weight at the ends', () => {
  const small = quadInertia({ motorMassKg: 0.03, armM: 0.1, bodyMassKg: 0.4, bodyRadiusM: 0.04 })
  const big = quadInertia({ motorMassKg: 0.03, armM: 0.2, bodyMassKg: 0.4, bodyRadiusM: 0.04 })
  assert.ok(big.roll > small.roll * 2 && big.yaw > small.yaw * 2)
  assert.ok(small.yaw > small.roll, 'yaw inertia is about twice the roll inertia')
})

test('centre of gravity moves toward the heavy part', () => {
  const body = { massG: 400, x: 0 }
  near(centreOfGravity([body, { massG: 200, x: 0 }]), 0, 1e-12)
  near(centreOfGravity([body, { massG: 200, x: 30 }]), 10, 1e-12)
})

test('ground effect: more thrust close to the floor, none far away', () => {
  assert.ok(groundEffect(0.0635, 0.0635) > 1.05)
  near(groundEffect(0.0635, 1), 1.001, 0.002)
  assert.ok(groundEffect(0.0635, 0.04) > groundEffect(0.0635, 0.1))
})

test('flight time from energy and power', () => {
  near(batteryEnergyWh(1500, 4), 22.2, 0.01)
  near(flightTimeMin({ energyWh: 22.2, powerW: 200 }), 5.33, 0.01)
  assert.ok(flightTimeMin({ energyWh: 44.4, powerW: 200 }) > flightTimeMin({ energyWh: 22.2, powerW: 200 }))
})

test('wind triangle: head wind, tail wind and cross wind', () => {
  const head = windTriangle({ airspeed: 20, trackDeg: 90, windFromDeg: 90, windSpeed: 5 })
  near(head.groundSpeed, 15, 1e-9); near(head.correctionDeg, 0, 1e-9); near(head.headingDeg, 90, 1e-9)
  const tail = windTriangle({ airspeed: 20, trackDeg: 90, windFromDeg: 270, windSpeed: 5 })
  near(tail.groundSpeed, 25, 1e-9)
  const cross = windTriangle({ airspeed: 20, trackDeg: 90, windFromDeg: 180, windSpeed: 10 })
  near(cross.correctionDeg, 30, 1e-9)
  near(cross.headingDeg, 120, 1e-9)
  near(cross.groundSpeed, 20 * Math.cos(Math.PI / 6), 1e-9)
  assert.equal(windTriangle({ airspeed: 5, trackDeg: 90, windFromDeg: 180, windSpeed: 10 }).possible, false)
  near(windTriangle({ airspeed: 20, trackDeg: 90, windFromDeg: 0, windSpeed: 10 }).headingDeg, 60, 1e-9)
})

test('Reynolds number of a small propeller is low', () => {
  const re = reynolds(1.225, 60, 0.012)
  assert.ok(re > 40000 && re < 60000, `${re}`)
})
