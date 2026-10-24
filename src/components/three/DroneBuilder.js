// A 3D 5-inch freestyle quad that rebuilds itself from the parts a student picks (three.js, no React).
// Drone-frame words: f = forward (the nose), r = right, u = up. In three.js: x = r, y = u, z = -f. Units are about 1 mm.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const TAU = Math.PI * 2
const WHEEL = 80 // motor centres are at +-80 along and across: a 225 mm wheelbase
const FEET = [[44, 16], [44, -16], [-44, 16], [-44, -16]]
const CW = 0xff6a1a
const CCW = 0x2f86d6
const GLOW = 0xff7a1a
const MOTORS = [
  { at: [WHEEL, WHEEL], dir: 1 },
  { at: [WHEEL, -WHEEL], dir: -1 },
  { at: [-WHEEL, WHEEL], dir: -1 },
  { at: [-WHEEL, -WHEEL], dir: 1 },
]

const v = (f, r, u) => new THREE.Vector3(r, u, -f)

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
const carbonTexture = () =>
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
const matTexture = () =>
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
const pegTexture = () =>
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

export function createDroneBuilder(canvas, { onPick } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0c0d0f)
  scene.fog = new THREE.Fog(0x0c0d0f, 1100, 2600)
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTexture
  scene.environmentIntensity = 0.32

  const camera = new THREE.PerspectiveCamera(32, 1, 10, 5000)
  const HOME = { pos: new THREE.Vector3(330, 230, -400), target: new THREE.Vector3(0, 40, 0) }
  camera.position.copy(HOME.pos)
  const controls = new OrbitControls(camera, canvas)
  controls.target.copy(HOME.target)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 160
  controls.maxDistance = 1100
  controls.maxPolarAngle = Math.PI * 0.49
  controls.enablePan = false
  controls.autoRotate = true
  controls.autoRotateSpeed = 0.9
  controls.update()

  scene.add(new THREE.HemisphereLight(0xcfd8ff, 0x1a1208, 0.35))
  const sun = new THREE.DirectionalLight(0xfff0dc, 2.1)
  sun.position.set(280, 560, -190)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  Object.assign(sun.shadow.camera, { left: -260, right: 260, top: 260, bottom: -260, near: 50, far: 1500 })
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.6
  sun.shadow.radius = 3
  scene.add(sun)
  const rim = new THREE.DirectionalLight(0x86a8ff, 0.55)
  rim.position.set(-380, 220, 420)
  scene.add(rim)
  const lamp = new THREE.PointLight(0xff7a30, 1.6e5, 0, 2)
  lamp.position.set(-420, 260, 360)
  scene.add(lamp)

  // ---- the workshop: a cutting mat, a pegboard wall and a bench edge ----
  const fixed = []
  {
    const mat = matTexture()
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(1500, 1500), new THREE.MeshStandardMaterial({ map: mat, roughness: 0.82 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)
    const peg = pegTexture()
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(4200, 1000), new THREE.MeshStandardMaterial({ map: peg, roughness: 0.85, metalness: 0.1, bumpMap: peg, bumpScale: 1.5 }))
    wall.position.set(0, 450, 760)
    wall.rotation.y = Math.PI
    scene.add(wall)
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4200, 18, 90), new THREE.MeshStandardMaterial({ color: 0x5a3b22, roughness: 0.7 }))
    bench.position.set(0, -9, 755)
    scene.add(bench)
    fixed.push(mat, peg)
  }

  const carbonMap = carbonTexture()

  // ---- the drone, rebuilt whenever the parts change ----
  let drone = null
  let owned = [] // geometries, materials and textures to free on the next rebuild
  let parts = null
  let blades = []
  let discs = []
  let explode = 0
  let spinning = false
  let highlighted = null
  const byCategory = {}
  const exploders = []
  const spin = [0, 0, 0, 0]

  function dispose() {
    if (!drone) return
    drone.traverse((o) => {
      if (o.geometry) o.geometry.dispose()
    })
    for (const m of owned) m.dispose()
    scene.remove(drone)
    drone = null
    owned = []
  }

  function build(p) {
    dispose()
    byCategory.frame = []
    byCategory.motor = []
    byCategory.prop = []
    byCategory.battery = []
    byCategory.video = []
    byCategory.color = []
    exploders.length = 0
    blades = []
    discs = []
    drone = new THREE.Group()
    scene.add(drone)
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
    const part = (cat, explodeVec) => {
      category = cat
      const g = new THREE.Group()
      g.userData.category = cat === 'color' ? 'frame' : cat
      exploders.push({ g, vec: explodeVec })
      drone.add(g)
      return g
    }

    const { motor, prop, battery, video } = p
    const bellR = motor.stator[0] / 2 + 3
    const bellH = motor.stator[1] + 9
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
      const accent = m.dir > 0 ? CW : CCW
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
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(len * 0.5, 0.5, 2), tpu(0.5))
      stripe.position.set(len * 0.5, 4.2, 0)
      armGroup.add(stripe)
      arm.add(armGroup)

      const mg = part('motor', v(dir[0] * 28, dir[1] * 28, 22))
      const centre = v(m.at[0], m.at[1], 12)
      mg.add(lathe([[0, 0], [10.5, 0], [11.2, 0.6], [11.2, 2.2], [0, 2.2]], aluminium(0x8d939b), centre))
      mg.add(lathe([[0, 2.2], [bellR - 3.6, 2.2], [bellR - 3.6, 5.6], [0, 5.6]], mat(0xb4622a, { rough: 0.4, metal: 0.85 }), centre))
      mg.add(lathe(
        [[0, 5.6], [bellR - 0.4, 5.6], [bellR, 6.6], [bellR, 5.6 + bellH - 0.8], [bellR - 0.8, 5.6 + bellH], [6.2, 5.6 + bellH], [5.2, 5.6 + bellH - 0.7], [3.4, 5.6 + bellH - 0.7], [3.4, 5.6 + bellH], [0, 5.6 + bellH]],
        mat(0x2d3036, { rough: 0.28, metal: 0.9 }), centre, 48))
      mg.add(lathe([[bellR - 1.4, 5.6 + bellH - 0.5], [bellR + 0.1, 5.6 + bellH - 0.8], [bellR + 0.1, 5.6 + bellH - 0.1], [bellR - 1.4, 5.6 + bellH + 0.2]], mat(accent, { rough: 0.3, metal: 0.7 }), centre, 48))
      for (let h = 0; h < 12; h++) {
        const ang = (h / 12) * TAU
        const gr = new THREE.Mesh(new THREE.BoxGeometry(0.5, bellH - 4, 1.2), mat(0x0d0e10, { rough: 0.6 }))
        gr.position.set(centre.x + Math.cos(ang) * (bellR + 0.05), centre.y + 5.6 + bellH / 2, centre.z + Math.sin(ang) * (bellR + 0.05))
        gr.rotation.y = -ang
        mg.add(gr)
      }

      const top = 12 + 5.6 + bellH // top of the motor bell
      const pg = part('prop', v(dir[0] * 16, dir[1] * 16, 56))
      pg.add(lathe([[0, 0], [5, 0], [5, 2.4], [3.2, 3.6], [1.6, 3.6], [0, 3.6]], aluminium(0xcdd1d8), v(m.at[0], m.at[1], top), 24))
      const spinG = new THREE.Group()
      spinG.position.copy(v(m.at[0], m.at[1], top + 2.2))
      const bs = new THREE.Shape()
      bs.moveTo(3, -2.4)
      bs.bezierCurveTo(12, -9.5, propR * 0.7, -10, propR, -4)
      bs.quadraticCurveTo(propR + 3.5, 0, propR, 3.6)
      bs.bezierCurveTo(propR * 0.73, 5, 18, 3, 3, 2.4)
      bs.lineTo(3, -2.4)
      const geo = new THREE.ExtrudeGeometry(bs, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.25, bevelSize: 0.25, bevelSegments: 1, curveSegments: 12 })
      geo.rotateX(-Math.PI / 2)
      const bladeMat = mat(accent, { rough: 0.32, metal: 0.05, clear: 0.4 })
      for (let b = 0; b < prop.blades; b++) {
        const blade = shaped(geo, bladeMat, new THREE.Vector3(0, 0, 0))
        blade.rotation.y = (b / prop.blades) * TAU
        blade.rotation.x = m.dir * 0.22
        spinG.add(blade)
      }
      spinG.add(shaped(new THREE.CylinderGeometry(6.4, 7.2, 1.6, 28), mat(0x24262a, { rough: 0.4, metal: 0.6 }), new THREE.Vector3(0, 0.4, 0)))
      pg.add(spinG)
      const disc = new THREE.Mesh(new THREE.CircleGeometry(propR, 64), track(new THREE.MeshBasicMaterial({ color: 0xcfd6e2, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })))
      disc.rotation.x = -Math.PI / 2
      disc.position.copy(v(m.at[0], m.at[1], top + 3))
      pg.add(disc)
      blades[i] = spinG
      discs[i] = disc
    })

    // the stack: speed controller, flight controller, video transmitter
    const board = (u, color, lift, extra) => {
      const g = part('frame', v(0, 0, lift))
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
    board(29, 0x1c5a3c, 26, (g) => g.add(box(-4, 0, 30.6, [9, 9, 1.8], mat(0x0f1012, { rough: 0.5 }))))
    board(37, 0x4d2461, 38, (g) => g.add(roundBox(0, 0, 40.4, [14, 18, 3.4], 1.5, aluminium(0xa8aeb8))))

    // top plate with its screws
    {
      const g = part('frame', v(0, 0, 54))
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
      const g = part('battery', v(0, 0, 70))
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
    applyExplode()
    applyHighlight()
  }

  function applyExplode() {
    for (const { g, vec } of exploders) g.position.copy(vec).multiplyScalar(explode)
  }
  function applyHighlight() {
    for (const list of Object.values(byCategory)) {
      for (const m of list) if (m.emissive) { m.emissive.setHex(0x000000); m.emissiveIntensity = 0 }
    }
    if (highlighted && byCategory[highlighted]) {
      for (const m of byCategory[highlighted]) if (m.emissive) { m.emissive.setHex(GLOW); m.emissiveIntensity = 0.45 }
    }
  }

  // ---- picking: a click that is not a drag selects the part under it ----
  const ray = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let downAt = null
  const onDown = (e) => {
    downAt = [e.clientX, e.clientY]
    controls.autoRotate = false
  }
  const onUp = (e) => {
    if (!downAt || !onPick || !drone) return
    const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1])
    downAt = null
    if (moved > 4) return
    const rect = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -(((e.clientY - rect.top) / rect.height) * 2 - 1))
    ray.setFromCamera(ndc, camera)
    const hit = ray.intersectObject(drone, true)[0]
    if (!hit) return
    let o = hit.object
    while (o && !o.userData.category) o = o.parent
    if (o) onPick(o.userData.category)
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('pointerup', onUp)
  canvas.addEventListener('dblclick', () => { camera.position.copy(HOME.pos); controls.target.copy(HOME.target); controls.update() })

  // ---- the loop ----
  let frame = 0
  let last = 0
  let active = false
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60
    last = now
    for (let i = 0; i < 4; i++) {
      const rate = spinning ? 40 : 0
      spin[i] += MOTORS[i].dir * rate * dt
      if (blades[i]) {
        blades[i].rotation.y = -spin[i]
        discs[i].material.opacity += ((spinning ? 0.28 : 0) - discs[i].material.opacity) * Math.min(1, dt * 6)
      }
    }
    controls.update()
    renderer.render(scene, camera)
    frame = active ? requestAnimationFrame(tick) : 0
  }

  return {
    setBuild(next) {
      parts = next
      build(next)
    },
    setSpin(on) { spinning = on },
    setExplode(amount) { explode = amount; applyExplode() },
    highlight(category) { highlighted = category; applyHighlight() },
    resetView() { camera.position.copy(HOME.pos); controls.target.copy(HOME.target); controls.update() },
    setActive(on) {
      active = on
      if (on && !frame) { last = 0; frame = requestAnimationFrame(tick) }
    },
    size() {
      const w = canvas.clientWidth || 640
      const h = canvas.clientHeight || 480
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    },
    render() { controls.update(); renderer.render(scene, camera) },
    get parts() { return parts },
    dispose() {
      active = false
      cancelAnimationFrame(frame)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      dispose()
      for (const t of fixed) t.dispose()
      carbonMap.dispose()
      controls.dispose()
      envTexture.dispose()
      pmrem.dispose()
      renderer.dispose()
    },
  }
}
