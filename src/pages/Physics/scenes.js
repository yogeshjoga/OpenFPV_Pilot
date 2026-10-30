// The 3D scenes for the Physics page. Each `create...` takes { THREE, scene } and returns { update(state, seconds, dt), dispose() }.
// Units are millimetres. x points forward (the nose), y up, z to the right of the drone. Angles in the state are in degrees.

import { buildDroneModel, carbonTexture, MOTORS } from '../../components/three/droneModel.js'
import { DEFAULT_BUILD, resolveBuild } from '../DroneConfigurator/catalog.js'
import { makeSlice, makeStreamlines, pressurePixel, speedPixel } from './cfd.js'
import { AIR_DENSITY, floorPressure, flowVelocity, rotorPressure } from './flow.js'

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
    // slides the battery along the nose (+x), in the group's own millimetres
    shiftBattery(x) { battery.position.z = -x / k },
    spin(dt, rate) { props.forEach((q) => { q.node.rotation.y += q.dir * rate * dt }) },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 1. Forces on a drone that is hovering or flying forward.
// state: { tiltDeg (nose down), thrustN, weightN, dragN, wind (relative air speed, m/s), spin, paused }
// ---------------------------------------------------------------------------------------------------------------
export function createForces({ THREE, scene }) {
  const quad = makeQuad(THREE)
  scene.add(quad.group)
  const thrust = arrow(THREE, scene, COLORS.thrust)
  const weight = arrow(THREE, scene, COLORS.weight)
  const drag = arrow(THREE, scene, COLORS.drag)
  const tags = { thrust: label(THREE, 'Thrust'), weight: label(THREE, 'Weight'), drag: label(THREE, 'Drag') }
  Object.values(tags).forEach((t) => scene.add(t))
  const air = points(THREE, 160, { colors: false, size: 2.6 })
  air.mat.color.set(0x9fd0ff)
  scene.add(air.mesh)
  const seeds = Array.from({ length: 160 }, () => [Math.random(), Math.random(), Math.random()])
  const origin = new THREE.Vector3(0, 12, 0)

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      quad.group.position.copy(origin)
      quad.group.rotation.z = -state.tiltDeg * RAD
      quad.spin(step, state.rate ?? 55)
      const k = 150 / Math.max(state.thrustN, state.weightN, 1)
      const up = new THREE.Vector3(Math.sin(-state.tiltDeg * RAD) * -1, Math.cos(state.tiltDeg * RAD), 0)
      aim(thrust, origin, up, state.thrustN * k)
      aim(weight, origin, new THREE.Vector3(0, -1, 0), state.weightN * k)
      aim(drag, origin, new THREE.Vector3(-1, 0, 0), state.dragN * k)
      tags.thrust.position.copy(origin).addScaledVector(up, state.thrustN * k + 14)
      tags.weight.position.set(0, 12 - state.weightN * k - 12, 0)
      tags.drag.position.set(-state.dragN * k - 30, 12, 0)
      tags.drag.visible = state.dragN * k > 2
      // air rushing past the drone, backwards, as fast as the drone flies forward
      const pos = air.geo.attributes.position
      const speed = state.wind * 22
      seeds.forEach((s, i) => {
        const travel = (s[0] * 520 + (state.paused ? 0 : seconds) * speed * (0.6 + s[2] * 0.8)) % 520
        pos.setXYZ(i, 260 - travel, -40 + s[1] * 170, -90 + s[2] * 180)
      })
      pos.needsUpdate = true
      air.mat.opacity = Math.min(0.9, state.wind / 6)
    },
    dispose() { air.geo.dispose(); air.mat.dispose(); Object.values(tags).forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
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
  const SLICE_Y = -80
  const slice = makeSlice(THREE, { width: 560, height: 620, res: 112 })
  slice.mesh.position.set(0, SLICE_Y, 0)
  scene.add(slice.mesh)
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 8, 20), new THREE.MeshStandardMaterial({ color: 0xaab1bb, metalness: 0.9, roughness: 0.3 }))
  scene.add(hub)
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xff6a1a, roughness: 0.4 })
  const blades = new THREE.Group()
  scene.add(blades)
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
        for (let b = 0; b < 2; b += 1) {
          const blade = new THREE.Mesh(new THREE.BoxGeometry(R - 6, 1.4, 11), bladeMat)
          blade.position.x = b === 0 ? R / 2 : -R / 2
          blade.rotation.x = b === 0 ? 0.3 : -0.3
          blades.add(blade)
        }
        ring.scale.set(R, R, R)
      }
      blades.rotation.y += step * state.spin
      const speedMax = 2.1 * state.vi
      const pressureMax = 1.5 * AIR_DENSITY * state.vi * state.vi
      const key = `${R}|${state.vi.toFixed(2)}|${state.mode}`
      if (key !== painted) {
        painted = key
        const out = [0, 0, 0]
        const px = [0, 0, 0, 0]
        slice.paint((a, b) => (state.mode === 'pressure'
          ? pressurePixel(rotorPressure(a, SLICE_Y + b, 0, rotor), pressureMax, px)
          : speedPixel(flowVelocity(out, a, SLICE_Y + b, 0, rotors), speedMax, px)))
      }
      lines.update(step, speedMax)
      hub.position.set(0, 14, 0)
      blades.position.set(0, 14, 0)
      ring.position.set(0, 14, 0)
      aim(thrust, new THREE.Vector3(0, 14, 0), new THREE.Vector3(0, 1, 0), Math.min(150, 14 * state.thrustN))
      tags[0].position.set(R * 1.7, 160, 0)
      tags[1].position.set(R * 1.15, -230, 0)
      tags[2].position.set(0, 14 + Math.min(150, 14 * state.thrustN) + 24, 0)
    },
    dispose() { lines.dispose(); slice.dispose(); tags.forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// 3. A wing section in moving air: streamlines, lift, drag and the stall.
// state: { alphaDeg, cl, cd, stalled, paused }   (the air moves left to right)
// ---------------------------------------------------------------------------------------------------------------
const CHORD = 150
const thickness = (u) => 5 * 0.12 * (0.2969 * Math.sqrt(u) - 0.126 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1015 * u ** 4) * CHORD

export function createAerofoil({ THREE, scene }) {
  const shape = new THREE.Shape()
  const upper = []
  for (let i = 0; i <= 40; i += 1) { const u = (i / 40) ** 2; upper.push([u * CHORD - CHORD * 0.25, thickness(u)]) }
  shape.moveTo(upper[0][0], 0)
  upper.forEach(([x, y]) => shape.lineTo(x, y))
  for (let i = upper.length - 1; i >= 0; i -= 1) shape.lineTo(upper[i][0], -upper[i][1])
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 80, bevelEnabled: false })
  geo.translate(0, 0, -40)
  const wing = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xcfd6e2, metalness: 0.5, roughness: 0.35 }))
  scene.add(wing)
  const N = 900
  const flow = points(THREE, N, { size: 2.8 })
  scene.add(flow.mesh)
  const seeds = Array.from({ length: N }, () => ({ x: -300 + Math.random() * 600, y: -110 + Math.random() * 220, z: -34 + Math.random() * 68, j: Math.random() }))
  const lift = arrow(THREE, scene, COLORS.lift)
  const drag = arrow(THREE, scene, COLORS.drag)
  const tags = [label(THREE, 'Lift', 24), label(THREE, 'Drag', 24), label(THREE, 'air flow', 30), label(THREE, 'low pressure above', 52), label(THREE, 'higher pressure below', 56)]
  tags.forEach((t) => scene.add(t))
  const slow = new THREE.Color(0x3e8ef7)
  const fast = new THREE.Color(0xe8f6ff)
  const c = new THREE.Color()
  const U = 150

  return {
    update(state, seconds, dt) {
      const step = state.paused ? 0 : dt
      const a = state.alphaDeg * RAD
      wing.rotation.z = -a
      const gamma = 0.5 * U * CHORD * state.cl * 1.05
      const pos = flow.geo.attributes.position
      const col = flow.geo.attributes.color
      for (let i = 0; i < N; i += 1) {
        const s = seeds[i]
        // the free stream plus the swirl of the wing's circulation (upwash in front, downwash behind, faster over the top)
        const r2 = Math.max(s.x * s.x + s.y * s.y, 34 * 34)
        let vx = U + (gamma * s.y) / (TAU * r2)
        let vy = (-gamma * s.x) / (TAU * r2)
        // the wing is solid: the air slides round it
        const ca = Math.cos(a)
        const sa = Math.sin(a)
        const lx = s.x * ca - s.y * sa
        const ly = s.x * sa + s.y * ca
        const u = (lx + CHORD * 0.25) / CHORD
        let separated = false
        if (u > 0 && u < 1) {
          const t = thickness(u)
          if (Math.abs(ly) < t * 1.15) {
            const target = (ly >= 0 ? 1 : -1) * t * 1.18
            const dy = target - ly
            s.y += dy * ca
            s.x -= dy * sa
          }
          if (state.stalled && ly > 0 && u > 0.3) separated = true
        }
        if (separated) {
          vx *= 0.35
          vy += Math.sin(seconds * 17 + s.j * 40) * 55
        }
        s.x += vx * step
        s.y += vy * step
        if (s.x > 320 || Math.abs(s.y) > 150) { s.x = -310 + Math.random() * 20; s.y = -110 + Math.random() * 220; s.z = -34 + Math.random() * 68 }
        pos.setXYZ(i, s.x, s.y, s.z)
        c.copy(slow).lerp(fast, Math.min(1, Math.max(0, (vx - 90) / 120)))
        col.setXYZ(i, c.r, c.g, c.b)
      }
      pos.needsUpdate = true
      col.needsUpdate = true
      const o = new THREE.Vector3(0, 0, 0)
      aim(lift, o, new THREE.Vector3(0, 1, 0), Math.abs(state.cl) * 75)
      aim(drag, new THREE.Vector3(CHORD * 0.6, 0, 0), new THREE.Vector3(1, 0, 0), Math.max(6, state.cd * 650))
      tags[0].position.set(0, Math.abs(state.cl) * 75 + 22, 0)
      tags[1].position.set(CHORD * 0.6 + Math.max(6, state.cd * 650) + 28, 0, 0)
      tags[2].position.set(-250, 135, 0)
      tags[3].position.set(-20, 80, 0)
      tags[4].position.set(20, -80, 0)
    },
    dispose() { geo.dispose(); flow.geo.dispose(); flow.mat.dispose(); tags.forEach((t) => { t.material.map.dispose(); t.material.dispose() }) },
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
// 6. Thin air: a box of air with fewer molecules at altitude, and a drone that must spin its propellers faster.
// state: { ratio (air density compared with sea level), spin, hotter (0 to 1), paused }
// ---------------------------------------------------------------------------------------------------------------
export function createAtmosphere({ THREE, scene }) {
  const SIZE = 210
  const box = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(SIZE, SIZE, SIZE)), new THREE.LineBasicMaterial({ color: 0x8fa2ba }))
  box.position.y = SIZE / 2
  scene.add(box)
  const N = 420
  const molecules = points(THREE, N, { size: 4.4, colors: false })
  molecules.mat.color.set(0x7fb8ff)
  scene.add(molecules.mesh)
  const state0 = Array.from({ length: N }, () => ({ p: [Math.random() * SIZE - SIZE / 2, Math.random() * SIZE, Math.random() * SIZE - SIZE / 2], v: [(Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70, (Math.random() - 0.5) * 70] }))
  const quad = makeQuad(THREE, { arm: 70, propRadius: 40 })
  quad.group.position.y = SIZE * 0.5
  quad.group.scale.setScalar(0.8)
  scene.add(quad.group)
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
      const h = Math.max(4, SIZE * Math.min(1, state.ratio))
      gauge.scale.y = h
      gauge.position.set(-SIZE / 2 - 34, h / 2, 0)
      tag.position.set(-SIZE / 2 - 34, h + 22, 0)
    },
    dispose() { molecules.geo.dispose(); molecules.mat.dispose(); tag.material.map.dispose(); tag.material.dispose() },
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
  // a slice through the air along the right-hand side of the drone, through the two right-hand propellers
  const SLICE_H = 340
  const side = makeSlice(THREE, { width: 760, height: SLICE_H, res: 120 })
  side.mesh.position.set(0, SLICE_H / 2, rotors[0].z)
  scene.add(side.mesh)
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
        side.paint((a, b) => (state.mode === 'pressure'
          ? pressurePixel(sidePressure(a, SLICE_H / 2 + b, rotors[0].z, rotors), pressureMax, px)
          : speedPixel(flowVelocity(out, a, SLICE_H / 2 + b, rotors[0].z, rotors), speedMax, px)))
      }
      lines.update(step, speedMax)
      gain.visible = state.gain > 1.02
      gain.position.set(0, height + 110, 0)
    },
    dispose() { lines.dispose(); floorMap.dispose(); side.dispose(); gain.material.map.dispose(); gain.material.dispose() },
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

