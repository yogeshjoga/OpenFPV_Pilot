// The 3D scenes for the Physics page. Each `create...` takes { THREE, scene } and returns { update(state, seconds, dt), dispose() }.
// Units are millimetres. x points forward (the nose), y up, z to the right of the drone. Angles in the state are in degrees.

import { buildDroneModel, carbonTexture, MOTORS } from '../../components/three/droneModel.js'
import { DEFAULT_BUILD, resolveBuild } from '../DroneConfigurator/catalog.js'
import { makeCloud, makeSlice, makeStreamlines, pressurePixel, pressureSample, speedSample, thresholded } from './cfd.js'
import { AIR_DENSITY, floorPressure, flowVelocity, rotorPressure } from './flow.js'
import { CHORD_RAW, EPS as EPSILON, X_LEADING, aerofoilVelocity, outline } from './airfoil.js'
import { HUB_PROFILE, makeBlade } from '../../components/three/propBlade.js'

const RAD = Math.PI / 180
const TAU = Math.PI * 2

const MOTOR_SPOTS = MOTORS.map((m) => m.at) // [forward, right] of each motor in the model, in mm

const COLORS = { thrust: 0x30a46c, weight: 0xe5484d, drag: 0xf5a524, lift: 0x3e8ef7, wind: 0x14b8a6, track: 0xf5c518, air: 0x3e8ef7 }

function label(THREE, text, width = 46) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 96
  const g = c.getContext('2d')
  g.fillStyle = 'rgba(14, 17, 22, 0.78)'
  g.beginPath()
  g.roundRect(4, 8, 504, 80, 18)
  g.fill()
  g.fillStyle = '#f2f4f7'
  g.font = '600 38px system-ui, sans-serif'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.fillText(text, 256, 49)
  const map = new THREE.CanvasTexture(c)
  map.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, depthTest: false }))
  sprite.scale.set(width, width * (96 / 512), 1)
  sprite.renderOrder = 10
  return sprite
}

function arrow(THREE, scene, color) {
  const a = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 10, color, 14, 9)
  a.renderOrder = 5
  a.line.material.depthTest = false
  a.cone.material.depthTest = false
  a.line.material.linewidth = 3
  scene.add(a)
  return a
}

// places an arrow from `from` along `dir` for `len` millimetres; hides it when it would be too short to see
function aim(a, from, dir, len) {
  a.visible = len > 2
  if (!a.visible) return
  a.position.copy(from)
  a.setDirection(dir.clone().normalize())
  a.setLength(len, Math.min(16, len * 0.35), Math.min(10, len * 0.22))
}

function points(THREE, count, { size = 3.2, colors = true } = {}) {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  if (colors) geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(count * 3).fill(1), 3))
  const mat = new THREE.PointsMaterial({ size, vertexColors: colors, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false })
  return { geo, mat, mesh: new THREE.Points(geo, mat) }
}

// ---------------------------------------------------------------------------------------------------------------
// The quad: the same detailed 5-inch freestyle model the drone configurator uses (droneModel.js), turned to face +x (the nose) with
// +z on its right. The group's origin is the middle of the flight controller stack, close to the centre of gravity, so the drone
// tilts about the right point. Motors are in the order front right, front left, rear right, rear left, matching quadMoments in physics.js.
// `arm` is the distance from the centre to a motor in mm; the model is scaled to fit it (113 mm is full size).
// ---------------------------------------------------------------------------------------------------------------
const FULL_ARM = 80 * Math.SQRT2
const STACK_U = 29 // height of the flight controller above the feet, in the model's own units

function makeQuad(THREE, { arm = 110 } = {}) {
  const model = buildDroneModel(resolveBuild(DEFAULT_BUILD), carbonTexture(), { reverse: true })
  const k = arm / FULL_ARM
  const group = new THREE.Group()
  const body = new THREE.Group() // the model faces -z; the drones on this page face +x
  body.rotation.y = -Math.PI / 2
  body.scale.setScalar(k)
  model.drone.position.y = -STACK_U
  body.add(model.drone)
  group.add(body)
  model.discs.forEach((d) => { d.material.opacity = 0.1 })
  const rotorU = model.blades[0].position.y - STACK_U
  const rotorY = rotorU * k // the plane of the propellers, above the group's origin
  // front right, front left, rear right, rear left; the first and last turn counter-clockwise seen from above
  const props = model.blades.map((node, i) => ({ node, dir: i === 0 || i === 3 ? 1 : -1 }))
  const motorPositions = MOTOR_SPOTS.map(([f, r]) => new THREE.Vector3(f * k, rotorY, r * k))
  const battery = model.exploders.find((e) => e.g.userData.category === 'battery').g
  return {
    group, props, discs: model.discs, motorPositions, arm, rotorY,
    rotorR: 63.5 * k, // the radius of each propeller, in the group's millimetres
    // slides the battery along the nose (+x), in the group's own millimetres
    shiftBattery(x) { battery.position.z = -x / k },
    spin(dt, rate) { props.forEach((q) => { q.node.rotation.y += q.dir * rate * dt }) },
    // each propeller at its own rate, in the order front right, front left, rear right, rear left
    spinEach(dt, rates) { props.forEach((q, i) => { q.node.rotation.y += q.dir * rates[i] * dt }) },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 1. Forces on a drone that is hovering or flying forward, with the air each propeller throws down drawn as streamlines.
// The drone tilts, and so do its four rotors. Pitching the nose down makes the rear propellers spin faster than the front ones.
// state: { tiltDeg (nose down), thrustN (total), weightN, dragN, airspeed (m/s), thrustSplit: { front, rear }, rate, paused }
// ---------------------------------------------------------------------------------------------------------------
export function createForces({ THREE, scene }) {
  const quad = makeQuad(THREE, { arm: FULL_ARM })
  scene.add(quad.group)
  const thrust = arrow(THREE, scene, COLORS.thrust)
  const weight = arrow(THREE, scene, COLORS.weight)
  const drag = arrow(THREE, scene, COLORS.drag)
  const tags = { thrust: label(THREE, 'Thrust'), weight: label(THREE, 'Weight'), drag: label(THREE, 'Drag') }
  const propTags = [label(THREE, 'front propellers', 40), label(THREE, 'rear propellers', 40)]
  Object.values(tags).forEach((t) => scene.add(t))
  propTags.forEach((t) => scene.add(t))
  const origin = new THREE.Vector3(0, 40, 0)
  const rotors = quad.motorPositions.map((m) => ({ x: m.x, y: m.y, z: m.z, R: quad.rotorR, vi: 7, floor: false }))
  const stream = [0, 0, 0] // the air moving past the drone, in the world
  const induced = [0, 0, 0]
  let tilt = 0 // radians, nose down
  // the field is worked out in the drone's own frame, where the rotors point straight up, and turned back into the world
  const field = (out, x, y, z) => {
    const c = Math.cos(tilt)
    const s = Math.sin(tilt)
    const dx = x - origin.x
    const dy = y - origin.y
    flowVelocity(induced, dx * c - dy * s, dx * s + dy * c, z, rotors)
    out[0] = induced[0] * c + induced[1] * s + stream[0]
    out[1] = -induced[0] * s + induced[1] * c + stream[1]
    out[2] = induced[2]
    return Math.hypot(out[0], out[1], out[2])
  }
  const lines = makeStreamlines(THREE, {
    count: 560,
    length: 28,
    mmPerSecond: 11,
    life: 4,
    floorY: -Infinity,
    field,
    spawn: (i, p) => {
      const r0 = rotors[i % 4]
      const a = Math.random() * TAU
      const r = r0.R * (0.1 + 1.0 * Math.sqrt(Math.random()))
      const lx = r0.x + Math.cos(a) * r
      const ly = r0.y + 8 + Math.random() * 90
      p[0] = origin.x + lx * Math.cos(tilt) + ly * Math.sin(tilt)
      p[1] = origin.y - lx * Math.sin(tilt) + ly * Math.cos(tilt)
      p[2] = r0.z + Math.sin(a) * r
    },
    keep: (x, y, z) => y > -300 && y < 330 && Math.abs(x) < 520 && Math.abs(z) < 330,
  })
  scene.add(lines.object)
  // the whole volume of moving air round the drone, as a cloud of points coloured by how fast the air has been pushed
  const cloud = makeCloud(THREE, { count: 12000, size: 9 })
  scene.add(cloud.object)
  let painted = ''
  const spot = new THREE.Vector3()

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      tilt = state.tiltDeg * RAD
      quad.group.position.copy(origin)
      quad.group.rotation.z = -tilt
      // thrust of each propeller: nose down means the rear ones push harder
      const split = state.thrustSplit ?? { front: 1, rear: 1 }
      const each = state.thrustN / 4
      const weights = [split.front, split.front, split.rear, split.rear]
      const area = Math.PI * (quad.rotorR / 1000) ** 2
      rotors.forEach((r, i) => { r.vi = Math.sqrt((each * weights[i]) / (2 * AIR_DENSITY * area)) })
      stream[0] = -(state.airspeed ?? 0)
      const base = state.rate ?? 55
      quad.spinEach(step, weights.map((w) => base * Math.sqrt(w)))
      const viMax = Math.max(...rotors.map((r) => r.vi))
      const speedMax = Math.max(4, 2.1 * viMax + (state.airspeed ?? 0))
      const key = `${state.tiltDeg}|${state.thrustN.toFixed(2)}|${(state.airspeed ?? 0).toFixed(1)}|${split.rear.toFixed(2)}`
      if (key !== painted) {
        painted = key
        const out = [0, 0, 0]
        cloud.fill([-340, -310, -240], [340, 170, 240], (x, y, z, c) => {
          field(out, x, y, z)
          return speedSample(Math.hypot(out[0] - stream[0], out[1] - stream[1], out[2]), 2.1 * viMax, c)
        })
      }
      lines.update(step, speedMax)
      const k = 150 / Math.max(state.thrustN, state.weightN, 1)
      const up = new THREE.Vector3(Math.sin(-tilt) * -1, Math.cos(tilt), 0)
      aim(thrust, origin, up, state.thrustN * k)
      aim(weight, origin, new THREE.Vector3(0, -1, 0), state.weightN * k)
      aim(drag, origin, new THREE.Vector3(-1, 0, 0), state.dragN * k)
      tags.thrust.position.copy(origin).addScaledVector(up, state.thrustN * k + 14)
      tags.weight.position.set(0, origin.y - state.weightN * k - 12, 0)
      tags.drag.position.set(-state.dragN * k - 30, origin.y, 0)
      tags.drag.visible = state.dragN * k > 2
      quad.group.updateMatrixWorld(true)
      ;[0, 2].forEach((i, n) => {
        spot.copy(quad.motorPositions[i]).applyMatrix4(quad.group.matrixWorld)
        propTags[n].position.set(spot.x, spot.y + 60, rotors[i].z + 40)
      })
      propTags[0].visible = propTags[1].visible = Math.abs(split.rear - split.front) > 0.02
    },
    dispose() { lines.dispose(); cloud.dispose(); Object.values(tags).forEach((t) => { t.material.map.dispose(); t.material.dispose() }); propTags.forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 2. A rotor pulling air down, drawn like a CFD picture: streamlines coloured by speed, and a slice through the air painted with
// speed or pressure. The air is drawn in slowly from above, speeds up through the disc and leaves as a narrower, faster stream.
// state: { diameterMm, vi (m/s through the disc), thrustN, spin, mode ('speed' or 'pressure'), paused }
// ---------------------------------------------------------------------------------------------------------------
export function createAirflow({ THREE, scene }) {
  const rotor = { x: 0, y: 14, z: 0, R: 63.5, vi: 10, floor: false }
  const rotors = [rotor]
  const lines = makeStreamlines(THREE, {
    count: 900,
    length: 30,
    mmPerSecond: 12,
    life: 4.2,
    floorY: -Infinity, // there is no floor in this picture
    field: (out, x, y, z) => flowVelocity(out, x, y, z, rotors),
    spawn: (i, p) => {
      const a = Math.random() * TAU
      if (i % 6 === 0) { // some start beside and below the disc, to show the stream dragging the still air along
        const r = rotor.R * (1.4 + 1.8 * Math.random())
        p[0] = Math.cos(a) * r
        p[1] = -20 - Math.random() * 230
        p[2] = Math.sin(a) * r
      } else if (i % 6 < 4) { // and many start in the stream just below the disc, so the fast stream is full of lines
        const r = rotor.R * 0.85 * Math.sqrt(Math.random())
        p[0] = Math.cos(a) * r
        p[1] = rotor.y - 4 - Math.random() * 60
        p[2] = Math.sin(a) * r
      } else {
        const r = rotor.R * (0.08 + 2.1 * Math.sqrt(Math.random()))
        p[0] = Math.cos(a) * r
        p[1] = rotor.y + 30 + Math.random() * 190
        p[2] = Math.sin(a) * r
      }
    },
    keep: (x, y, z) => y > -385 && Math.hypot(x, z) < 9 * rotor.R + 120,
  })
  scene.add(lines.object)
  const cloud = makeCloud(THREE, { count: 14000, size: 8 })
  scene.add(cloud.object)
  // the same propeller blade as the 3D drone: swept, twisted by the pitch, with a cambered aerofoil section, in smoked plastic
  const bladeMat = new THREE.MeshPhysicalMaterial({ color: 0xff6a1a, roughness: 0.14, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.85 })
  const hubGeo = new THREE.LatheGeometry(HUB_PROFILE.map(([x, y]) => new THREE.Vector2(x, y)), 36)
  const hubMat = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.35, metalness: 0.3 })
  const blades = new THREE.Group()
  scene.add(blades)
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 9, 40), new THREE.MeshStandardMaterial({ color: 0xb3122a, roughness: 0.24, metalness: 0.95 }))
  scene.add(bell)
  let bladeGeo = null
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 72), new THREE.MeshBasicMaterial({ color: 0xcfd6e2, transparent: true, opacity: 0.55 }))
  ring.rotation.x = Math.PI / 2
  scene.add(ring)
  const thrust = arrow(THREE, scene, COLORS.thrust)
  const tags = [label(THREE, 'air drawn in: slow, low pressure', 78), label(THREE, 'air thrown down: fast', 62), label(THREE, 'Thrust', 30)]
  tags.forEach((t) => scene.add(t))
  let built = 0
  let painted = ''

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      const R = state.diameterMm / 2
      rotor.R = R
      rotor.vi = state.vi
      if (built !== state.diameterMm) {
        built = state.diameterMm
        blades.clear()
        bladeGeo?.dispose()
        bladeGeo = makeBlade({ radiusMm: R, pitchIn: (state.diameterMm / 25.4) * 0.9, dir: 1, blades: 3 })
        for (let b = 0; b < 3; b += 1) {
          const blade = new THREE.Mesh(bladeGeo, bladeMat)
          blade.rotation.y = (b / 3) * TAU
          blades.add(blade)
        }
        blades.add(new THREE.Mesh(hubGeo, hubMat))
        ring.scale.set(R, R, R)
      }
      blades.rotation.y -= step * state.spin
      const speedMax = 2.1 * state.vi
      const pressureMax = 1.5 * AIR_DENSITY * state.vi * state.vi
      const key = `${R}|${state.vi.toFixed(2)}|${state.mode}`
      if (key !== painted) {
        painted = key
        const out = [0, 0, 0]
        const reach = Math.max(R * 3, 140)
        cloud.fill([-reach, -400, -reach], [reach, 14 + R * 3, reach], (x, y, z, c) => (state.mode === 'pressure'
          ? pressureSample(rotorPressure(x, y, z, rotor), pressureMax, c)
          : speedSample(flowVelocity(out, x, y, z, rotors), speedMax, c)))
      }
      lines.update(step, speedMax)
      blades.position.set(0, 14, 0)
      bell.position.set(0, 14 - 1.2 - 4.5, 0)
      ring.position.set(0, 14, 0)
      aim(thrust, new THREE.Vector3(0, 14, 0), new THREE.Vector3(0, 1, 0), Math.min(150, 14 * state.thrustN))
      tags[0].position.set(R * 1.7, 160, 0)
      tags[1].position.set(R * 1.15, -230, 0)
      tags[2].position.set(0, 14 + Math.min(150, 14 * state.thrustN) + 24, 0)
    },
    dispose() { lines.dispose(); cloud.dispose(); bladeGeo?.dispose(); hubGeo.dispose(); tags.forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 3. A finite wing in moving air, in full 3D. The air round the middle of the wing follows the classical solution for a wing section; near the
// tips it spills round from the high pressure underneath to the low pressure on top, and rolls up into two spinning tubes of air, the wingtip
// vortices, that trail behind. Drawn as streamlines and as a 3D cloud coloured by speed or pressure.
// state: { alphaDeg, cl, cd, stalled, speed (m/s), mode ('speed' or 'pressure'), paused }   (the air moves left to right)
// ---------------------------------------------------------------------------------------------------------------
const CHORD = 150
const SPAN = 360

export function createAerofoil({ THREE, scene }) {
  const S = CHORD / CHORD_RAW // millimetres for each unit of the formula
  const XQ = X_LEADING + CHORD_RAW / 4 // the quarter-chord point sits at the middle of the scene
  const shape = new THREE.Shape(outline(200).map(([x, y]) => new THREE.Vector2((x - XQ) * S, y * S)))
  const geo = new THREE.ExtrudeGeometry(shape, { depth: SPAN, bevelEnabled: false })
  geo.translate(0, 0, -SPAN / 2)
  const wing = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xcfd6e2, metalness: 0.5, roughness: 0.35 }))
  scene.add(wing)
  const lift = arrow(THREE, scene, COLORS.lift)
  const drag = arrow(THREE, scene, COLORS.drag)
  const tags = [label(THREE, 'Lift', 24), label(THREE, 'Drag', 24), label(THREE, 'air flow', 30), label(THREE, 'low pressure above', 52), label(THREE, 'higher pressure below', 56), label(THREE, 'wingtip vortex', 40)]
  tags.forEach((t) => scene.add(t))
  const FINITE = (SPAN / CHORD) / (SPAN / CHORD + 2) // a short wing makes less lift per metre of span than the ideal section
  const TIP = SPAN / 2 * 0.94
  const CORE = 16 // radius of the core of a wingtip vortex, in millimetres
  let alpha = 0
  let circulation = 1
  let speed = 15
  let stalled = false
  let clock = 0
  const v2 = [0, 0]
  const smooth = (t) => { const c = Math.min(1, Math.max(0, t)); return c * c * (3 - 2 * c) }
  const insideWing = (x, y, z) => {
    if (Math.abs(z) >= SPAN / 2) return false
    const ca = Math.cos(alpha)
    const sa = Math.sin(alpha)
    return aerofoilVelocity(v2, (x * ca - y * sa) / S + XQ, (x * sa + y * ca) / S, alpha) < 0
  }
  // the velocity of the air at a point of the scene, in m/s
  const field = (out, x, y, z) => {
    const ca = Math.cos(alpha)
    const sa = Math.sin(alpha)
    const xb = x * ca - y * sa
    const yb = x * sa + y * ca
    if (insideWing(x, y, z)) { out[0] = out[1] = out[2] = 0; return 0 }
    // across the span the wing section's effect fades towards the tips, where the air can slip round instead
    const along = Math.abs(z) / (SPAN / 2)
    const weight = along < 1 ? Math.sqrt(1 - along ** 6) : 0
    let ux = 1
    let uy = 0
    let uz = 0
    if (weight > 0) {
      aerofoilVelocity(v2, xb / S + XQ, yb / S, alpha, circulation)
      let sx = v2[0] * ca + v2[1] * sa
      let sy = -v2[0] * sa + v2[1] * ca
      if (stalled && yb > 0 && xb > CHORD * 0.05 && yb < 90) { // the air has broken away from the top and tumbles
        sx *= 0.35
        sy = sy * 0.35 + Math.sin(clock * 11 + x * 0.09) * 0.45
      }
      ux += weight * (sx - 1)
      uy += weight * sy
    }
    // the two wingtip vortices trail from the trailing edge; the air between them is pushed down, and outside them up
    const xTail = (CHORD * 0.75) * ca
    const yTail = -(CHORD * 0.75) * sa
    const grow = smooth((x - xTail) / 90)
    if (grow > 0) {
      const strength = 4 * Math.PI * (1 + EPSILON) * Math.sin(alpha) * circulation * S * FINITE
      for (const side of [1, -1]) {
        const dy = y - (yTail - (x - xTail) * 0.06)
        const dz = z - side * TIP
        const r2 = dy * dy + dz * dz + 1
        const swirl = (grow * strength * (1 - Math.exp(-r2 / (CORE * CORE)))) / (2 * Math.PI * r2)
        uz += -side * dy * swirl
        uy += side * dz * swirl
      }
    }
    out[0] = ux * speed
    out[1] = uy * speed
    out[2] = uz * speed
    return Math.hypot(out[0], out[1], out[2])
  }
  const lines = makeStreamlines(THREE, {
    count: 900,
    length: 30,
    mmPerSecond: 8,
    life: 5,
    floorY: -Infinity,
    field,
    spawn: (i, p) => {
      p[0] = -345 + Math.random() * 30
      p[1] = -120 + Math.random() * 240
      p[2] = (Math.random() * 2 - 1) * (SPAN / 2 + 100)
    },
    keep: (x, y, z) => x < 380 && Math.abs(y) < 180 && Math.abs(z) < SPAN / 2 + 140 && !insideWing(x, y, z),
  })
  scene.add(lines.object)
  const cloud = makeCloud(THREE, { count: 16000, size: 8 })
  scene.add(cloud.object)
  let painted = ''

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      clock += step
      alpha = state.alphaDeg * RAD
      speed = state.speed ?? 15
      stalled = state.stalled
      const potential = TAU * Math.sin(alpha) // the lift coefficient of the ideal flow
      circulation = Math.abs(potential) < 0.03 ? 1 : Math.min(1.15, Math.max(0, state.cl / potential))
      wing.rotation.z = -alpha
      const q = 0.5 * AIR_DENSITY * speed * speed
      const key = `${state.alphaDeg}|${speed}|${state.mode}|${state.stalled}`
      if (key !== painted) {
        painted = key
        const out = [0, 0, 0]
        cloud.fill([-300, -170, -SPAN / 2 - 120], [400, 170, SPAN / 2 + 120], (x, y, z, c) => {
          if (insideWing(x, y, z)) return 0
          const v = field(out, x, y, z)
          if (state.mode === 'pressure') return pressureSample(q * (1 - (v / speed) ** 2), q * 1.4, c)
          // the air that the wing has changed: faster or slower than the free stream, or turned aside
          const change = Math.hypot(out[0] - speed, out[1], out[2]) / (speed * 0.7)
          speedSample(v, speed * 1.7, c)
          return thresholded(change)
        })
      }
      lines.update(step, speed * 1.7)
      const o = new THREE.Vector3(0, 0, 0)
      aim(lift, o, new THREE.Vector3(0, 1, 0), Math.abs(state.cl) * 75)
      aim(drag, new THREE.Vector3(CHORD * 0.6, 0, 0), new THREE.Vector3(1, 0, 0), Math.max(6, state.cd * 650))
      tags[0].position.set(0, Math.abs(state.cl) * 75 + 22, 0)
      tags[1].position.set(CHORD * 0.6 + Math.max(6, state.cd * 650) + 28, 0, 0)
      tags[2].position.set(-250, 150, 0)
      tags[3].position.set(-20, 95, 0)
      tags[4].position.set(20, -95, 0)
      tags[5].position.set(CHORD * 0.75 + 150, -30, TIP)
      tags[5].visible = Math.abs(alpha) > 0.05
    },
    dispose() { geo.dispose(); lines.dispose(); cloud.dispose(); tags.forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 4. Rotation: four thrusts make roll, pitch and yaw. state: { thrusts: [fr, fl, rr, rl], moments: {pitch, roll, yaw}, paused }
// ---------------------------------------------------------------------------------------------------------------
export function createTorque({ THREE, scene }) {
  const quad = makeQuad(THREE)
  scene.add(quad.group)
  const arrows = [0, 1, 2, 3].map(() => arrow(THREE, scene, COLORS.thrust))
  const twist = [0, 1, 2, 3].map(() => {
    const g = new THREE.Group()
    const ring = new THREE.Mesh(new THREE.TorusGeometry(26, 1.8, 8, 36, Math.PI * 1.55), new THREE.MeshBasicMaterial({ color: 0xa371f7 }))
    ring.rotation.x = Math.PI / 2
    const head = new THREE.Mesh(new THREE.ConeGeometry(6, 14, 12), new THREE.MeshBasicMaterial({ color: 0xa371f7 }))
    head.position.set(26, 0, 0)
    head.rotation.x = Math.PI
    g.add(ring, head)
    scene.add(g)
    return g
  })
  const tags = ['front right', 'front left', 'rear right', 'rear left'].map((t) => { const s = label(THREE, t, 34); scene.add(s); return s })
  let roll = 0
  let pitch = 0
  let yaw = 0
  const scratch = new THREE.Vector3()

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      const m = state.moments
      const targetPitch = Math.max(-30, Math.min(30, m.pitch * 9))
      const targetRoll = Math.max(-30, Math.min(30, m.roll * 9))
      pitch += (targetPitch - pitch) * Math.min(1, step * 5)
      roll += (targetRoll - roll) * Math.min(1, step * 5)
      yaw += Math.max(-4, Math.min(4, m.yaw * 90)) * step
      quad.group.position.y = 40
      quad.group.rotation.set(roll * RAD, -yaw * RAD * 0.3, pitch * RAD, 'YXZ')
      quad.group.updateMatrixWorld(true)
      const mean = state.thrusts.reduce((s, v) => s + v, 0) / 4 || 1
      quad.spin(step, 50)
      quad.props.forEach((p, i) => { p.node.rotation.y += p.dir * (state.thrusts[i] / mean - 1) * 18 * step })
      state.thrusts.forEach((t, i) => {
        scratch.copy(quad.motorPositions[i]).applyMatrix4(quad.group.matrixWorld)
        const up = new THREE.Vector3(0, 1, 0).applyQuaternion(quad.group.quaternion)
        aim(arrows[i], scratch, up, Math.max(0, t) * (95 / Math.max(mean, 0.5)) * 0.9)
        tags[i].position.copy(scratch).add(new THREE.Vector3(0, -34, 0))
        twist[i].position.copy(scratch).add(new THREE.Vector3(0, 46, 0))
        twist[i].rotation.y = seconds * 0.8 * (quad.props[i].dir > 0 ? -1 : 1)
        twist[i].scale.set(1, 1, quad.props[i].dir > 0 ? -1 : 1)
        twist[i].scale.multiplyScalar(0.6 + 0.4 * Math.min(1.5, t / mean))
      })
    },
    dispose() { tags.forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 5. Balance: where the battery sits moves the centre of gravity, and the motors have to make up for it.
// state: { batteryX (mm), cgX (mm), frontThrustN, rearThrustN, weightN, spin, paused }
// ---------------------------------------------------------------------------------------------------------------
export function createBalance({ THREE, scene }) {
  const quad = makeQuad(THREE, { arm: 120 })
  scene.add(quad.group)
  const arrows = [0, 1, 2, 3].map(() => arrow(THREE, scene, COLORS.thrust))
  const weight = arrow(THREE, scene, COLORS.weight)
  const cg = new THREE.Mesh(new THREE.SphereGeometry(8, 20, 14), new THREE.MeshBasicMaterial({ color: 0xe5484d, depthTest: false }))
  const centre = new THREE.Mesh(new THREE.TorusGeometry(11, 1.6, 8, 28), new THREE.MeshBasicMaterial({ color: 0x30a46c, depthTest: false }))
  centre.rotation.x = Math.PI / 2
  cg.renderOrder = centre.renderOrder = 6 // drawn over the drone, so they can be seen
  scene.add(cg, centre)
  const tags = [label(THREE, 'centre of gravity', 44), label(THREE, 'centre of the motors', 48), label(THREE, 'front motors', 36), label(THREE, 'rear motors', 36)]
  tags.forEach((t) => scene.add(t))

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      quad.group.position.y = 20
      quad.shiftBattery(state.batteryX)
      quad.spin(step, 48)
      cg.position.set(state.cgX, 20, 0)
      centre.position.set(0, 20, 0)
      const k = 120 / Math.max(state.weightN / 2, state.frontThrustN, state.rearThrustN, 1)
      quad.motorPositions.forEach((p, i) => {
        const front = i < 2
        aim(arrows[i], new THREE.Vector3(p.x, 20 + p.y, p.z), new THREE.Vector3(0, 1, 0), (front ? state.frontThrustN : state.rearThrustN) * k * 0.5)
      })
      aim(weight, new THREE.Vector3(state.cgX, 20, 0), new THREE.Vector3(0, -1, 0), state.weightN * k * 0.5)
      tags[0].position.set(state.cgX, -60, 0)
      tags[1].position.set(0, 80, 0)
      tags[2].position.set(95, 36, -130)
      tags[3].position.set(-95, 36, -130)
    },
    dispose() { tags.forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 6. Thin air: a box of air with fewer molecules at altitude. To carry the same weight in thinner air each propeller has to throw the air
// down faster, so the streams from the propellers get faster and redder.
// state: { ratio (air density compared with sea level), spin, hotter (0 to 1), vi (m/s through each disc), viSea (the same at sea level), paused }
// ---------------------------------------------------------------------------------------------------------------
export function createAtmosphere({ THREE, scene }) {
  const SIZE = 380
  const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE, SIZE, SIZE)), new THREE.LineBasicMaterial({ color: 0x8fa2ba }))
  box.position.y = SIZE / 2
  scene.add(box)
  const N = 520
  const molecules = points(THREE, N, { size: 3.4, colors: false })
  molecules.mat.color.set(0x7fb8ff)
  molecules.mat.opacity = 0.55
  scene.add(molecules.mesh)
  const state0 = Array.from({ length: N }, () => ({ p: [Math.random() * SIZE - SIZE / 2, Math.random() * SIZE, Math.random() * SIZE - SIZE / 2], v: [(Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70] }))
  const quad = makeQuad(THREE, { arm: FULL_ARM })
  const HEIGHT = SIZE * 0.55
  quad.group.position.y = HEIGHT
  scene.add(quad.group)
  const rotors = quad.motorPositions.map((m) => ({ x: m.x, y: HEIGHT + m.y, z: m.z, R: quad.rotorR, vi: 7, floor: true }))
  const lines = makeStreamlines(THREE, {
    count: 560,
    length: 26,
    mmPerSecond: 11,
    life: 3.6,
    field: (out, x, y, z) => flowVelocity(out, x, y, z, rotors),
    spawn: (i, p) => {
      const r0 = rotors[i % 4]
      const a = Math.random() * TAU
      const r = r0.R * (0.1 + 1.6 * Math.sqrt(Math.random()))
      p[0] = r0.x + Math.cos(a) * r
      p[1] = r0.y + 8 + Math.random() * 120
      p[2] = r0.z + Math.sin(a) * r
    },
    keep: (x, y, z) => Math.abs(x) < SIZE / 2 && Math.abs(z) < SIZE / 2 && y < SIZE,
  })
  scene.add(lines.object)
  const cloud = makeCloud(THREE, { count: 14000, size: 9 })
  scene.add(cloud.object)
  let painted = ''
  const gauge = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 14), new THREE.MeshBasicMaterial({ color: 0x3e8ef7 }))
  scene.add(gauge)
  const tag = label(THREE, 'air density', 40)
  scene.add(tag)
  const cold = new THREE.Color(0x7fb8ff)
  const hot = new THREE.Color(0xff8a5c)

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      const shown = Math.max(8, Math.round(N * Math.min(1, state.ratio)))
      molecules.geo.setDrawRange(0, shown)
      const pos = molecules.geo.attributes.position
      const speed = 1 + state.hotter * 1.2
      for (let i = 0; i < shown; i += 1) {
        const s = state0[i]
        for (let k = 0; k < 3; k += 1) {
          s.p[k] += s.v[k] * step * speed
          const lo = k === 1 ? 0 : -SIZE / 2
          const hi = k === 1 ? SIZE : SIZE / 2
          if (s.p[k] < lo || s.p[k] > hi) { s.v[k] *= -1; s.p[k] = Math.min(hi, Math.max(lo, s.p[k])) }
        }
        pos.setXYZ(i, s.p[0], s.p[1], s.p[2])
      }
      pos.needsUpdate = true
      molecules.mat.color.copy(cold).lerp(hot, state.hotter)
      quad.spin(step, 38 * state.spin)
      for (const r of rotors) r.vi = state.vi
      const speedMax = 2.1 * state.viSea * 1.3
      if (painted !== state.vi.toFixed(2)) {
        painted = state.vi.toFixed(2)
        const out = [0, 0, 0]
        cloud.fill([-SIZE / 2, 2, -SIZE / 2], [SIZE / 2, HEIGHT + 150, SIZE / 2], (x, y, z, c) => speedSample(flowVelocity(out, x, y, z, rotors), speedMax, c))
      }
      lines.update(step, speedMax)
      const h = Math.max(4, SIZE * Math.min(1, state.ratio))
      gauge.scale.y = h
      gauge.position.set(-SIZE / 2 - 34, h / 2, 0)
      tag.position.set(-SIZE / 2 - 34, h + 22, 0)
    },
    dispose() { molecules.geo.dispose(); molecules.mat.dispose(); lines.dispose(); cloud.dispose(); tag.material.map.dispose(); tag.material.dispose() },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 7. Ground effect: near the floor the downwash is squeezed and the propellers make more thrust. Drawn like a CFD picture: streamlines
// coloured by speed, a pressure map on the floor, and a slice through the air.
// state: { heightMm (of the propellers), gain, vi (m/s through each disc), mode ('speed' or 'pressure'), paused }
// ---------------------------------------------------------------------------------------------------------------
export function createGroundEffect({ THREE, scene }) {
  const quad = makeQuad(THREE, { arm: 113 })
  scene.add(quad.group)
  const rotors = quad.motorPositions.map((m) => ({ x: m.x, y: 60, z: m.z, R: 63.5, vi: 7, floor: true }))
  const lines = makeStreamlines(THREE, {
    count: 520,
    length: 26,
    mmPerSecond: 18,
    life: 3.4,
    field: (out, x, y, z) => flowVelocity(out, x, y, z, rotors),
    spawn: (i, p) => {
      const r0 = rotors[i % 4]
      const a = Math.random() * TAU
      const r = r0.R * (0.1 + 1.6 * Math.sqrt(Math.random()))
      p[0] = r0.x + Math.cos(a) * r
      p[1] = r0.y + 8 + Math.random() * 170
      p[2] = r0.z + Math.sin(a) * r
    },
    keep: (x, y, z) => Math.hypot(x, z) < 400 && y < rotors[0].y + 260,
  })
  scene.add(lines.object)
  // pressure of the air pushing on the floor
  const floorMap = makeSlice(THREE, { width: 760, height: 760, res: 120 })
  floorMap.mesh.rotation.x = -Math.PI / 2
  floorMap.mesh.position.y = 0.6
  scene.add(floorMap.mesh)
  // the volume of moving air (or of pressure) under and round the drone
  const cloud = makeCloud(THREE, { count: 14000, size: 8 })
  scene.add(cloud.object)
  const gain = label(THREE, 'more thrust', 36)
  scene.add(gain)
  let painted = ''

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      const height = state.heightMm
      quad.group.position.y = height - quad.rotorY
      quad.spin(step, 52)
      for (const r of rotors) { r.y = height; r.vi = state.vi }
      const speedMax = 2.1 * state.vi
      const key = `${height}|${state.vi.toFixed(2)}|${state.mode}`
      if (key !== painted) {
        painted = key
        const out = [0, 0, 0]
        const px = [0, 0, 0, 0]
        const pressureMax = Math.max(1, floorPressure(rotors[0].x, rotors[0].z, rotors)) * 1.05
        floorMap.paint((a, b) => pressurePixel(floorPressure(a, -b, rotors), pressureMax, px))
        cloud.fill([-300, 2, -300], [300, height + 150, 300], (x, y, z, c) => (state.mode === 'pressure'
          ? pressureSample(sidePressure(x, y, z, rotors), pressureMax, c)
          : speedSample(flowVelocity(out, x, y, z, rotors), speedMax, c)))
      }
      lines.update(step, speedMax)
      gain.visible = state.gain > 1.02
      gain.position.set(0, height + 110, 0)
    },
    dispose() { lines.dispose(); floorMap.dispose(); cloud.dispose(); gain.material.map.dispose(); gain.material.dispose() },
  }
}

// The pressure in the slice: the usual pressure of the free stream (suction above the propellers, push just below them), and close to the
// floor the stagnation pressure of the stream that has hit it.
function sidePressure(x, y, z, rotors) {
  let p = 0
  for (const rotor of rotors) {
    const free = rotorPressure(x, y, z, { ...rotor, floor: false })
    const away = Math.min(1, Math.max(0, y / (0.9 * rotor.R)))
    const stagnation = floorPressure(x, z, [rotor]) * Math.exp(-((y / (0.6 * rotor.R)) ** 2))
    p += free * away + stagnation * (1 - away)
  }
  return p
}

// ---------------------------------------------------------------------------------------------------------------
// 8. The wind triangle seen from above. North is -z, east is +x. Headings and tracks are compass degrees.
// state: { headingDeg, trackDeg, windFromDeg, windSpeed, airspeed, groundSpeed, possible, paused }
// ---------------------------------------------------------------------------------------------------------------
export function createWindTriangle({ THREE, scene }) {
  const quad = makeQuad(THREE, { arm: 80, propRadius: 44 })
  quad.group.scale.setScalar(0.45)
  scene.add(quad.group)
  const air = arrow(THREE, scene, COLORS.air)
  const wind = arrow(THREE, scene, COLORS.wind)
  const ground = arrow(THREE, scene, COLORS.track)
  const trackLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]), new THREE.LineDashedMaterial({ color: COLORS.track, dashSize: 10, gapSize: 8 }))
  scene.add(trackLine)
  const tags = {
    n: label(THREE, 'N', 18), e: label(THREE, 'E', 18), s: label(THREE, 'S', 18), w: label(THREE, 'W', 18),
    air: label(THREE, 'where the nose points', 52), wind: label(THREE, 'wind pushes', 34), ground: label(THREE, 'where it goes', 36),
  }
  Object.values(tags).forEach((t) => scene.add(t))
  tags.n.position.set(0, 1, -250); tags.s.position.set(0, 1, 250); tags.e.position.set(250, 1, 0); tags.w.position.set(-250, 1, 0)
  const streaks = points(THREE, 220, { colors: false, size: 3 })
  streaks.mat.color.set(0x7fe3d4)
  scene.add(streaks.mesh)
  const seeds = Array.from({ length: 220 }, () => [Math.random() * 520 - 260, Math.random() * 520 - 260])
  const K = 8 // millimetres per metre per second
  const dir = (deg) => new THREE.Vector3(Math.sin(deg * RAD), 0, -Math.cos(deg * RAD))
  let along = 0

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      const origin = new THREE.Vector3(0, 2, 0)
      const heading = dir(state.headingDeg)
      const toward = dir(state.windFromDeg + 180)
      aim(air, origin, heading, state.airspeed * K)
      const tip = origin.clone().addScaledVector(heading, state.airspeed * K)
      aim(wind, tip, toward, state.windSpeed * K)
      const trackDir = dir(state.trackDeg)
      trackLine.geometry.setFromPoints([origin, origin.clone().addScaledVector(trackDir, 300)])
      trackLine.computeLineDistances()
      aim(ground, origin, trackDir, state.possible ? Math.max(0, state.groundSpeed) * K : 0)
      tags.air.position.copy(origin).addScaledVector(heading, state.airspeed * K * 0.5).add(new THREE.Vector3(0, 14, 24))
      tags.wind.position.copy(tip).addScaledVector(toward, state.windSpeed * K * 0.5).add(new THREE.Vector3(0, 14, -22))
      tags.ground.position.copy(origin).addScaledVector(trackDir, Math.max(40, state.groundSpeed * K * 0.55)).add(new THREE.Vector3(0, 14, 24))
      tags.ground.visible = state.possible
      // the drone slides along the track, with its nose turned into the wind
      along = (along + Math.max(0, state.groundSpeed) * K * 0.35 * step) % 280
      quad.group.position.copy(origin).addScaledVector(trackDir, 40 + along)
      quad.group.position.y = 14
      quad.group.rotation.y = -((state.headingDeg - 0) * RAD)
      quad.spin(step, 50)
      const pos = streaks.geo.attributes.position
      const vx = toward.x * state.windSpeed * K * 0.9
      const vz = toward.z * state.windSpeed * K * 0.9
      seeds.forEach((s, i) => {
        s[0] += vx * step
        s[1] += vz * step
        if (s[0] > 260) s[0] -= 520
        if (s[0] < -260) s[0] += 520
        if (s[1] > 260) s[1] -= 520
        if (s[1] < -260) s[1] += 520
        pos.setXYZ(i, s[0], 3, s[1])
      })
      pos.needsUpdate = true
    },
    dispose() { streaks.geo.dispose(); streaks.mat.dispose(); trackLine.geometry.dispose(); Object.values(tags).forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
  }
}

