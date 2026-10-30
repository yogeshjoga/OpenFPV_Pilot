// The 3D 5-inch freestyle quad, built from the parts a student picks. Shared by the configurator, the tuning and piloting stages
// and the Physics page. Drone-frame words: f = forward (the nose), r = right, u = up. In three.js: x = r, y = u, z = -f. Units are about 1 mm.
import * as THREE from 'three'
import { HUB_PROFILE, makeBlade } from './propBlade.js'

const TAU = Math.PI * 2
const WHEEL = 80 // motor centres are at +-80 along and across: a 225 mm wheelbase
const FEET = [[44, 16], [44, -16], [-44, 16], [-44, -16]]
const CW = 0xff6a1a
const CCW = 0x2f86d6
const GLOW = 0xff7a1a
export const MOTORS = [
  { at: [WHEEL, WHEEL], dir: 1 },
  { at: [WHEEL, -WHEEL], dir: -1 },
  { at: [-WHEEL, WHEEL], dir: -1 },
  { at: [-WHEEL, -WHEEL], dir: 1 },
]

export const v = (f, r, u) => new THREE.Vector3(r, u, -f)

// ---- canvas textures ----
function canvasTexture(w, h, draw, repeat) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  draw(c.getContext('2d'), w, h)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(repeat[0], repeat[1] ?? repeat[0])
  }
  return t
}
export const carbonTexture = () =>
  canvasTexture(128, 128, (g, w, h) => {
    g.fillStyle = '#101113'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < w / 16; i++) {
      for (let j = 0; j < h / 16; j++) {
        const lift = (i + j) % 4 < 2
        const grad = g.createLinearGradient(i * 16, j * 16, (i + 1) * 16, (j + 1) * 16)
        grad.addColorStop(0, lift ? '#34373c' : '#0b0c0d')
        grad.addColorStop(1, lift ? '#1a1c1f' : '#202327')
        g.fillStyle = grad
        g.fillRect(i * 16 + 0.5, j * 16 + 0.5, 15, 15)
      }
    }
  }, [1 / 16])
export const matTexture = () =>
  canvasTexture(2048, 2048, (g, w, h) => {
    g.fillStyle = '#0f5242'
    g.fillRect(0, 0, w, h)
    const noise = g.getImageData(0, 0, w, h)
    for (let i = 0; i < noise.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 10
      noise.data[i] += n
      noise.data[i + 1] += n
      noise.data[i + 2] += n
    }
    g.putImageData(noise, 0, 0)
    g.strokeStyle = 'rgba(210,255,240,0.16)'
    g.lineWidth = 1.2
    for (let x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke() }
    for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
    g.strokeStyle = 'rgba(230,255,245,0.34)'
    g.lineWidth = 2
    for (let x = 0; x <= w; x += 160) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke() }
    for (let y = 0; y <= h; y += 160) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke() }
  })
export const pegTexture = () =>
  canvasTexture(1024, 512, (g, w, h) => {
    g.fillStyle = '#17181b'
    g.fillRect(0, 0, w, h)
    for (let y = 24; y < h; y += 48) {
      for (let x = 24; x < w; x += 48) {
        g.fillStyle = '#050506'
        g.beginPath(); g.arc(x, y, 9, 0, TAU); g.fill()
        g.strokeStyle = 'rgba(255,255,255,0.10)'
        g.lineWidth = 2
        g.beginPath(); g.arc(x, y, 10.5, 0.2, Math.PI - 0.2); g.stroke()
      }
    }
  }, [7.8, 2.4])
const labelTexture = (text) =>
  canvasTexture(512, 128, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    g.fillStyle = 'rgba(255,255,255,0.85)'
    g.textAlign = 'center'
    g.font = 'bold 30px sans-serif'
    g.fillText('EGIRE', w / 2, 44)
    g.font = 'bold 54px sans-serif'
    g.fillText(text, w / 2, 100)
  })
const stickerTexture = (label) =>
  canvasTexture(512, 192, (g, w) => {
    const grad = g.createLinearGradient(0, 0, w, 192)
    grad.addColorStop(0, '#1f4a80')
    grad.addColorStop(1, '#102746')
    g.fillStyle = grad
    g.fillRect(0, 0, w, 192)
    g.strokeStyle = '#f2b705'
    g.lineWidth = 7
    g.beginPath()
    for (let i = 0; i < 9; i++) g.lineTo(20 + i * 56, i % 2 ? 18 : 62)
    g.stroke()
    g.fillStyle = '#ffffff'
    g.font = 'bold 72px sans-serif'
    g.fillText(label, 24, 140)
    g.fillStyle = '#f2b705'
    g.font = 'bold 30px sans-serif'
    g.fillText('EGIRE', 380, 176)
  })

// ---- geometry helpers ----
function rounded(w, d, radius) {
  const s = new THREE.Shape()
  const x = -w / 2
  const y = -d / 2
  s.moveTo(x + radius, y)
  s.lineTo(x + w - radius, y)
  s.quadraticCurveTo(x + w, y, x + w, y + radius)
  s.lineTo(x + w, y + d - radius)
  s.quadraticCurveTo(x + w, y + d, x + w - radius, y + d)
  s.lineTo(x + radius, y + d)
  s.quadraticCurveTo(x, y + d, x, y + d - radius)
  s.lineTo(x, y + radius)
  s.quadraticCurveTo(x, y, x + radius, y)
  return s
}
const hole = (shape, x, y, radius) => {
  const p = new THREE.Path()
  p.absarc(x, y, radius, 0, TAU, true)
  shape.holes.push(p)
}
const slot = (shape, x, y, length, width) => {
  const p = new THREE.Path()
  const r = width / 2
  const h = length / 2 - r
  p.absarc(x, y + h, r, Math.PI, 0, true)
  p.absarc(x, y - h, r, 0, Math.PI, true)
  shape.holes.push(p)
}
// extrude a shape (x = r, y = f) into a flat slab with a small bevel; its bottom is at 0 and its top at h
function slabOf(shape, h, bevel = 0.35) {
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.01, h - 2 * bevel),
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 10,
  })
  g.translate(0, 0, bevel)
  g.rotateX(-Math.PI / 2)
  return g
}
const slabGeometry = (w, d, radius, h, bevel) => slabOf(rounded(d, w, radius), h, bevel)


// ---- the wiring: three wires from each motor run along its arm, over the plate edge and onto the speed controller's pads ----
function addWiring(parent, { P, shaped, mat }) {
  const mats = []
  const pad = mat(0xe6e2d8, { rough: 0.3, metal: 0.9 })
  const tie = mat(0x0c0d0e, { rough: 0.6 })
  for (const m of MOTORS) {
    const wire = mat(0x15171a, { rough: 0.5 })
    mats.push(wire)
    const sx = Math.sign(m.at[0])
    const sy = Math.sign(m.at[1])
    const from = [sx * 40, sy * 14]
    const dx = m.at[0] - from[0]
    const dy = m.at[1] - from[1]
    const len = Math.hypot(dx, dy)
    const d = [dx / len, dy / len]
    const n = [-d[1], d[0]]
    const along = (a, off) => [m.at[0] - d[0] * a + n[0] * off, m.at[1] - d[1] * a + n[1] * off]
    const aEdge = len - 8 / Math.abs(d[1]) // the arm leaves the edge of the plate here, measured from the motor
    for (let k = 0; k < 3; k++) {
      const off = (k - 1) * 1.6
      const padR = sy * (5.5 + 4 * k)
      const padF = sx * 16.2
      const p3 = along(aEdge - 3.2, off)
      const pts = [
        along(10.4, off), along(13, off), along(aEdge * 0.55, off), p3,
        [p3[0] - sx * 1.2, sy * (23.4 + k * 0.1)],
      ]
      const heights = [14.4, 12.9, 12.9, 12.9, 17.6]
      const path = pts.map((p, i) => P(p[0], p[1], heights[i]))
      path.push(P(sx * 30, sy * (15 + k * 1.4), 17.1), P(sx * 21.5, padR, 17.5), P(sx * 19.6, padR, 21.9), P(padF, padR, 21.5))
      const curve = new THREE.CatmullRomCurve3(path, false, 'centripetal')
      parent.add(shaped(new THREE.TubeGeometry(curve, 60, 0.62, 6), wire, new THREE.Vector3(0, 0, 0)))
      parent.add(shaped(new THREE.CylinderGeometry(1.5, 1.5, 0.35, 16), pad, P(padF, padR, 21.18)))
      parent.add(shaped(new THREE.SphereGeometry(0.95, 10, 8), pad, P(padF, padR, 21.55)))
    }
    for (const a of [aEdge * 0.3, aEdge * 0.75]) { // zip ties keep the three wires together
      const t = along(a, 0)
      const band = shaped(new THREE.BoxGeometry(1, 3.2, 6.4), tie, P(t[0], t[1], 12.9))
      band.rotation.y = Math.atan2(d[0], d[1])
      parent.add(band)
    }
  }
  return mats
}

// Builds the drone for a resolved build ({ motor, prop, battery, video, color }). `carbonMap` is the carbon weave texture.
// `reverse` turns every propeller the other way (colours and blade shape included).
// Returns the group and the parts a viewer drives: the part groups (`exploders`, each with a `vec` it moves along when taken apart),
// the spinning blade groups and their discs, and the materials and textures to free with disposeDroneModel.
export function buildDroneModel(p, carbonMap, { reverse = false } = {}) {
  const byCategory = { frame: [], motor: [], prop: [], battery: [], video: [], color: [] }
  const exploders = []
  const blades = []
  const discs = []
  const owned = [] // materials and textures to free
  const drone = new THREE.Group()
  let wireGroup = null
  let wireMats = []
  const tpuHex = p.color.hex
  let category = 'frame'
  const track = (m, cat = category) => {
    owned.push(m)
    byCategory[cat].push(m)
    return m
  }
  const mat = (color, { rough = 0.55, metal = 0.1, clear = 0, map = null, cat } = {}) =>
    track(
      clear || map
        ? new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, clearcoat: clear, clearcoatRoughness: 0.3, map })
        : new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal }),
      cat,
    )
  const carbon = () => track(new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.62, metalness: 0.12, clearcoat: 0.15, clearcoatRoughness: 0.3, map: carbonMap }))
  const tpu = (rough = 0.55) => mat(tpuHex, { rough, clear: 0.2, cat: 'color' })
  const aluminium = (color = 0xb9bec6) => mat(color, { rough: 0.3, metal: 0.9 })
  const shaped = (geometry, material, at) => {
    const mesh = new THREE.Mesh(geometry, material)
    mesh.position.copy(at)
    mesh.castShadow = true
    mesh.receiveShadow = true
    return mesh
  }
  const box = (f, r, u, size, material) => shaped(new THREE.BoxGeometry(size[1], size[2], size[0]), material, v(f, r, u))
  const tube = (f, r, u0, u1, radius, material, seg = 24) => shaped(new THREE.CylinderGeometry(radius, radius, u1 - u0, seg), material, v(f, r, (u0 + u1) / 2))
  const lathe = (points, material, position, seg = 40) => shaped(new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg), material, position)
  const roundBox = (f, r, u, size, radius, material) => shaped(slabGeometry(size[0], size[1], radius, size[2], Math.min(0.8, radius * 0.4)), material, v(f, r, u - size[2] / 2))
  // a group that moves in the exploded view
  const part = (cat, explodeVec, cover = false) => {
    category = cat
    const g = new THREE.Group()
    g.userData.cover = cover
    g.userData.category = cat === 'color' ? 'frame' : cat
    exploders.push({ g, vec: explodeVec })
    drone.add(g)
    return g
  }

  const { motor, prop, battery, video } = p
  const propR = (prop.diameterIn * 25.4) / 2
  const wide = video.id !== 'analog'

  // frame: bottom plate, standoffs, feet
  {
    const g = part('frame', v(0, 0, -6))
    const shape = rounded(44, 108, 10)
    for (const a of [15.25, -15.25]) for (const b of [15.25, -15.25]) hole(shape, b, a, 1.7)
    for (const s of [-1, 1]) { slot(shape, s * 14, -34, 14, 5); slot(shape, s * 14, 34, 14, 5) }
    g.add(shaped(slabOf(shape, 2.4), carbon(), v(0, 0, 13.5)))
    const standoff = mat(tpuHex, { rough: 0.35, metal: 0.75 })
    for (const a of [15.25, -15.25]) {
      for (const b of [15.25, -15.25]) {
        g.add(tube(a, b, 15.9, 44, 2.5, standoff, 6))
        g.add(tube(a, b, 15.9, 17.2, 3.4, aluminium(), 6))
      }
    }
    const rubber = mat(0x161616, { rough: 0.95 })
    for (const [f, r] of FEET) {
      g.add(shaped(new THREE.CylinderGeometry(4.4, 5.2, 13.5, 20), rubber, v(f, r, 6.75)))
      g.add(tube(f, r, 13.5, 14.2, 3.2, aluminium(), 12))
    }
  }
  // arms, motors, props
  MOTORS.forEach((m, i) => {
    const sx = Math.sign(m.at[0])
    const sy = Math.sign(m.at[1])
    const from = [sx * 40, sy * 14]
    const dx = m.at[0] - from[0]
    const dy = m.at[1] - from[1]
    const len = Math.hypot(dx, dy)
    const dir = [dx / len, dy / len]
    const dir4 = reverse ? -m.dir : m.dir
    const accent = dir4 > 0 ? CW : CCW
    const out = v(dir[0] * 40, dir[1] * 40, 0)

    const arm = part('frame', out)
    const shape = new THREE.Shape()
    shape.moveTo(0, -9)
    shape.lineTo(len, -6.2)
    shape.absarc(len, 0, 6.2, -Math.PI / 2, Math.PI / 2, false)
    shape.lineTo(0, 9)
    shape.lineTo(0, -9)
    for (const [cx, length, width] of [[len * 0.34, 16, 4.4], [len * 0.62, 14, 3.6]]) {
      const hp = new THREE.Path()
      const rr = width / 2
      const hh = length / 2 - rr
      hp.absarc(cx + hh, 0, rr, -Math.PI / 2, Math.PI / 2, true)
      hp.absarc(cx - hh, 0, rr, Math.PI / 2, Math.PI * 1.5, true)
      shape.holes.push(hp)
    }
    hole(shape, len, 0, 1.6)
    const armGroup = new THREE.Group()
    armGroup.position.copy(v(from[0], from[1], 8))
    armGroup.rotation.y = Math.atan2(dir[0], dir[1])
    const slab = new THREE.Mesh(slabOf(shape, 4, 0.3), carbon())
    slab.castShadow = slab.receiveShadow = true
    armGroup.add(slab)
    arm.add(armGroup)

    // ---- the motor: base with screw ears, exposed stator and coils, anodised bell, shaft ----
    const mg = part('motor', v(dir[0] * 28, dir[1] * 28, 22))
    const S = motor.stator[1]
    const R = motor.stator[0] / 2 + 3.2 // bell radius
    const statorR = motor.stator[0] / 2 - 1.4
    const bellBottom = 18.6
    const top = 12 + 14 + S // top of the bell
    const H = top - bellBottom
    const at0 = (u) => v(m.at[0], m.at[1], u)
    const cx = at0(0).x
    const cz = at0(0).z
    const baseMat = mat(0x1b1d21, { rough: 0.4, metal: 0.7 })
    mg.add(lathe([[0, 0], [11, 0], [11.6, 0.7], [11.6, 1.8], [10.4, 2.6], [0, 2.6]], baseMat, at0(12), 48))
    for (const x of [8, -8]) {
      for (const y of [8, -8]) {
        mg.add(tube(m.at[0] + x, m.at[1] + y, 12, 14.2, 3.4, baseMat, 16))
        mg.add(tube(m.at[0] + x, m.at[1] + y, 14.2, 15.2, 1.9, mat(0x0a0a0b, { rough: 0.35, metal: 0.8 }), 6))
      }
    }
    const baseTop = 14.6
    mg.add(tube(m.at[0], m.at[1], baseTop, baseTop + S + 1, statorR - 3.4, mat(0x4a4f57, { rough: 0.4, metal: 0.85 }), 24))
    const copper = mat(0xc0702f, { rough: 0.35, metal: 0.85 })
    const solder = mat(0xe8c24a, { rough: 0.35, metal: 0.9 })
    for (let t = 0; t < 12; t++) {
      const ang = (t / 12) * TAU
      const rr = statorR - 2.2
      const coil = shaped(new THREE.BoxGeometry(4.4, S + 1.4, 3.0), copper, new THREE.Vector3(cx + Math.cos(ang) * rr, baseTop + (S + 1.4) / 2, cz + Math.sin(ang) * rr))
      coil.rotation.y = -ang
      mg.add(coil)
      if (t % 2 === 0) mg.add(shaped(new THREE.SphereGeometry(0.7, 8, 6), solder, new THREE.Vector3(cx + Math.cos(ang) * (statorR - 0.4), baseTop + S + 1.3, cz + Math.sin(ang) * (statorR - 0.4))))
    }
    const bellMat = mat(motor.bellColor, { rough: 0.24, metal: 0.95, clear: 0.5 })
    mg.add(lathe(
      [[R - 0.9, 0], [R, 0.5], [R, H - 2.6], [R - 0.5, H - 1.4], [R - 1.7, H - 0.4], [R - 3.2, H], [5.6, H], [5.6, H + 0.9], [3.6, H + 0.9], [3.6, H], [0, H]],
      bellMat, at0(bellBottom), 64))
    mg.add(lathe([[R + 0.02, 1.0], [R + 0.14, 1.25], [R + 0.14, 2.35], [R + 0.02, 2.6]], mat(accent, { rough: 0.3, metal: 0.7 }), at0(bellBottom), 64))
    const slotMat = mat(0x070708, { rough: 0.7 })
    for (let q = 0; q < 8; q++) {
      const ang = ((q + 0.5) / 8) * TAU
      const sl = shaped(new THREE.BoxGeometry(3.4, 0.3, 1.6), slotMat, new THREE.Vector3(cx + Math.cos(ang) * (R - 6.4), top + 0.04, cz + Math.sin(ang) * (R - 6.4)))
      sl.rotation.y = -ang
      mg.add(sl)
    }
    // the label printed on the side of the bell, facing out along the arm
    const labelTex = labelTexture(`${motor.stator.join('')}  ${motor.kv}KV`)
    owned.push(labelTex)
    const arc = Math.PI * 0.62
    const band = new THREE.Mesh(
      new THREE.CylinderGeometry(R + 0.08, R + 0.08, 7, 40, 1, true, Math.atan2(dir[1], -dir[0]) - arc / 2, arc),
      track(new THREE.MeshBasicMaterial({ map: labelTex, transparent: true, depthWrite: false })),
    )
    band.position.copy(at0(bellBottom + 6))
    mg.add(band)
    mg.add(lathe([[0, 0], [2.6, 0], [2.6, 9.8], [0, 9.8]], aluminium(0xb9bec6), at0(top), 12))

    const pg = part('prop', v(dir[0] * 16, dir[1] * 16, 56))
    pg.add(shaped(new THREE.CylinderGeometry(4.5, 4.5, 3.4, 6), mat(0x2a2c31, { rough: 0.35, metal: 0.85 }), v(m.at[0], m.at[1], top + 7.7))) // lock nut
    pg.add(tube(m.at[0], m.at[1], top + 9.4, top + 10, 3.0, mat(0x08080a, { rough: 0.6 }), 16)) // its nylon insert
    const spinG = new THREE.Group()
    spinG.position.copy(v(m.at[0], m.at[1], top + 2.2))
    // a real blade shape: swept, twisted by the pitch, with a cambered airfoil, in smoked translucent plastic
    const bladeGeo = makeBlade({ radiusMm: propR, pitchIn: prop.pitchIn, dir: dir4, blades: prop.blades })
    const bladeMat = mat(accent, { rough: 0.14, metal: 0, clear: 1 })
    bladeMat.transparent = true
    bladeMat.opacity = 0.8
    for (let b = 0; b < prop.blades; b++) {
      const blade = shaped(bladeGeo, bladeMat, new THREE.Vector3(0, 0, 0))
      blade.rotation.y = (b / prop.blades) * TAU
      spinG.add(blade)
    }
    spinG.add(lathe(HUB_PROFILE, mat(0x1a1c20, { rough: 0.35, metal: 0.3, clear: 0.6 }), new THREE.Vector3(0, 0, 0), 36))
    pg.add(spinG)
    const disc = new THREE.Mesh(new THREE.CircleGeometry(propR, 64), track(new THREE.MeshBasicMaterial({ color: 0xcfd6e2, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })))
    disc.rotation.x = -Math.PI / 2
    disc.position.copy(v(m.at[0], m.at[1], top + 3))
    pg.add(disc)
    blades[i] = spinG
    discs[i] = disc
  })

  // the stack: speed controller, flight controller, video transmitter
  const board = (u, color, lift, extra, cover = false) => {
    const g = part('frame', v(0, 0, lift), cover)
    const shape = rounded(36, 36, 2.5)
    for (const a of [15.25, -15.25]) for (const b of [15.25, -15.25]) hole(shape, b, a, 1.6)
    g.add(shaped(slabOf(shape, 1.6, 0.2), mat(color, { rough: 0.45, metal: 0.15, clear: 0.3 }), v(0, 0, u - 1.6)))
    const gold = mat(0xd8b04a, { rough: 0.3, metal: 0.95 })
    for (const a of [15.25, -15.25]) for (const b of [15.25, -15.25]) g.add(tube(a, b, u - 1.7, u + 0.2, 3.3, gold, 14))
    for (let q = -14; q <= 14; q += 4.7) for (const e of [16.8, -16.8]) g.add(box(q, e, u + 0.15, [2.6, 2, 0.5], gold))
    const black = mat(0x0f1012, { rough: 0.5 })
    g.add(box(6, -6, u + 0.9, [8, 8, 1.4], black))
    g.add(box(-9, 8, u + 0.7, [5, 5, 1], black))
    if (extra) extra(g)
  }
  board(21, 0x1b3f66, 14, (g) => {
    for (const [f, r] of [[-12, -9], [-12, 9]]) {
      g.add(tube(f, r, 21, 28.5, 3.4, mat(0x0d0e10, { rough: 0.45 }), 16))
      g.add(tube(f, r, 28.5, 29.1, 3.1, aluminium(), 16))
    }
  })
  category = 'frame'
  wireGroup = new THREE.Group()
  drone.add(wireGroup)
  wireMats = addWiring(wireGroup, { P: v, shaped, mat })
  board(29, 0x1c5a3c, 26, (g) => g.add(box(-4, 0, 30.6, [9, 9, 1.8], mat(0x0f1012, { rough: 0.5 }))), true)
  board(37, 0x4d2461, 38, (g) => g.add(roundBox(0, 0, 40.4, [14, 18, 3.4], 1.5, aluminium(0xa8aeb8))), true)

  // top plate with its screws
  {
    const g = part('frame', v(0, 0, 54), true)
    const shape = rounded(44, 108, 10)
    for (const a of [15.25, -15.25]) for (const b of [15.25, -15.25]) hole(shape, b, a, 1.7)
    for (const s of [-1, 1]) { slot(shape, s * 14, -34, 14, 5); slot(shape, s * 14, 34, 14, 5) }
    slot(shape, 0, 0, 30, 5)
    g.add(shaped(slabOf(shape, 2.4), carbon(), v(0, 0, 44)))
    const screw = mat(0x0b0b0c, { rough: 0.35, metal: 0.8 })
    for (const a of [15.25, -15.25]) for (const b of [15.25, -15.25]) g.add(tube(a, b, 46.4, 47.7, 2.9, screw, 16))
  }
  // power lead
  {
    const g = part('frame', v(-45, 0, 0))
    g.add(roundBox(-58, 0, 30, [16, 12, 8.4], 1.4, mat(0xe8b800, { rough: 0.5, clear: 0.2 })))
    for (const r of [-3, 3]) {
      const pin = shaped(new THREE.CylinderGeometry(1.5, 1.5, 4, 12), mat(0xd8b04a, { rough: 0.3, metal: 0.95 }), v(-50.3, r, 30))
      pin.rotation.x = Math.PI / 2
      g.add(pin)
      const curve = new THREE.CatmullRomCurve3([v(-50, r, 30), v(-40, r * 1.1, 27), v(-26, r * 1.2, 24), v(-14, r * 1.1, 22.4)])
      g.add(shaped(new THREE.TubeGeometry(curve, 24, 1.7, 10), mat(r < 0 ? 0x101010 : 0xc2302a, { rough: 0.55 }), new THREE.Vector3(0, 0, 0)))
    }
  }

  // video: camera (and an action camera) in 3D printed mounts at the nose
  {
    const g = part('video', v(45, 0, 8))
    const width = wide ? 28 : 24
    const camH = wide ? 24 : 22
    g.add(roundBox(58, 0, 31, [16, width, camH + 4], 2.5, tpu(0.55)))
    g.add(roundBox(62, 0, 31, [13, width - 8, camH - 4], 1.8, mat(0x15171b, { rough: 0.4, metal: 0.4 })))
    const lensR = wide ? 7.4 : 6
    const lens = lathe([[0, 0], [lensR, 0], [lensR, 2.4], [lensR - 0.8, 4.4], [0, 4.4]], mat(0x090a0c, { rough: 0.25, metal: 0.6 }), new THREE.Vector3(0, 0, 0), 28)
    lens.rotation.x = -Math.PI / 2
    lens.position.copy(v(68.6, 0, 31))
    g.add(lens)
    const glass = new THREE.Mesh(new THREE.CircleGeometry(lensR - 2.4, 24), mat(0x1b4f9a, { rough: 0.05, metal: 0.2, clear: 1 }))
    glass.position.copy(v(73.05, 0, 31))
    glass.rotation.y = Math.PI
    g.add(glass)
    if (video.actionCam) {
      // the action camera rides on a printed cage in front of the nose
      g.add(roundBox(70, 0, 52, [14, 42, 36], 3, tpu(0.55)))
      g.add(roundBox(86, 0, 52, [34, 36, 30], 3, mat(0x15171b, { rough: 0.4, metal: 0.4 })))
      const big = lathe([[0, 0], [11, 0], [11, 3], [9, 6], [0, 6]], mat(0x090a0c, { rough: 0.25, metal: 0.6 }), new THREE.Vector3(0, 0, 0), 32)
      big.rotation.x = -Math.PI / 2
      big.position.copy(v(103.5, 0, 55))
      g.add(big)
      const g2 = new THREE.Mesh(new THREE.CircleGeometry(7, 28), mat(0x1b4f9a, { rough: 0.05, metal: 0.2, clear: 1 }))
      g2.position.copy(v(109.5, 0, 55))
      g2.rotation.y = Math.PI
      g.add(g2)
      g.add(box(103, 12, 41, [1, 10, 8], mat(0x2a2c30, { rough: 0.4, metal: 0.5 })))
    }
  }

  // battery: sticker on top, rubber straps
  {
    const [bl, bw, bh] = battery.size
    const g = part('battery', v(0, 0, 70), true)
    const baseU = 46.4
    g.add(roundBox(0, 0, baseU + bh / 2, [bl, bw, bh], 3, mat(0x16181c, { rough: 0.7, cat: 'battery' })))
    const label = stickerTexture(`${battery.cells}S ${battery.mah}`)
    owned.push(label)
    const sticker = new THREE.Mesh(new THREE.PlaneGeometry(bl * 0.7, bw * 0.65), track(new THREE.MeshStandardMaterial({ map: label, roughness: 0.5, metalness: 0.1 })))
    sticker.rotation.x = -Math.PI / 2
    sticker.rotation.z = Math.PI / 2
    sticker.position.copy(v(0, 0, baseU + bh + 0.08))
    g.add(sticker)
    const strap = mat(0x0b0b0c, { rough: 0.95 })
    for (const f of [-bl * 0.24, bl * 0.24]) {
      g.add(box(f, 0, baseU + bh / 2, [7, bw + 1.4, bh + 1.4], strap))
      g.add(box(f, 0, baseU + bh + 1.4, [7, 9, 1.2], mat(0x2a2c30, { rough: 0.4, metal: 0.7 })))
    }
  }
  // antennas in printed mounts
  {
    const g = part('video', v(-30, 0, 40))
    for (const r of [19, -19]) {
      g.add(roundBox(-44, r, 46.4 + 4, [8, 8, 8], 1.4, tpu(0.55)))
      g.add(tube(-44, r, 54, 94, 1.1, mat(0x141517, { rough: 0.5 }), 10))
      g.add(shaped(new THREE.SphereGeometry(1.8, 12, 10), mat(0x141517, { rough: 0.5 }), v(-44, r, 94)))
    }
  }
  drone.traverse((o) => { if (o.isMesh) o.userData.root = o })
  return { drone, byCategory, exploders, blades, discs, owned, wireGroup, wireMats }
}

export function disposeDroneModel(model) {
  model.drone.traverse((o) => { if (o.geometry) o.geometry.dispose() })
  for (const m of model.owned) m.dispose()
}
