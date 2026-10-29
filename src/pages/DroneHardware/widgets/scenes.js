// The 3D scenes for the hardware lessons. Each `create...` takes { THREE, scene, camera, controls } and returns { update(state, seconds, dt), dispose() }.
// Units are about a millimetre. x runs along the part, y is up.

const TAU = Math.PI * 2

// a woven carbon pattern: bars going one way over bars going the other
function weaveTexture(THREE, repeat = [6, 2]) {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const g = c.getContext('2d')
  g.fillStyle = '#15171a'
  g.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 8; i += 1) {
    for (let j = 0; j < 8; j += 1) {
      const over = (i + j) % 2 === 0
      g.fillStyle = over ? '#454b54' : '#1f2227'
      if (over) g.fillRect(i * 16 + 1, j * 16 + 2, 14, 12)
      else g.fillRect(i * 16 + 2, j * 16 + 1, 12, 14)
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(...repeat)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

// a text label that always faces the viewer
function makeLabel(THREE, text, { color = '#f2f4f7', width = 56 } = {}) {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 96
  const g = c.getContext('2d')
  g.fillStyle = 'rgba(14, 17, 22, 0.72)'
  g.beginPath()
  g.roundRect(4, 8, 504, 80, 18)
  g.fill()
  g.fillStyle = color
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

// an arrow whose tip is at the origin and which points down the -y axis
function makeArrow(THREE, color, length = 22) {
  const g = new THREE.Group()
  const mat = new THREE.MeshBasicMaterial({ color })
  const cone = new THREE.Mesh(new THREE.ConeGeometry(3.6, 8, 14), mat)
  cone.rotation.x = Math.PI
  cone.position.y = 4
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, length - 8, 10), mat)
  shaft.position.y = 8 + (length - 8) / 2
  g.add(cone, shaft)
  return g
}

const drop = (u, tip) => (tip * (3 * u * u - u * u * u)) / 2

// ---------------------------------------------------------------------------------------------------------------
// strips fixed to a wall, pushed at the tip: thickness, material, bending and snapping
// state: { beams: [{ name, material: 'carbon' | 'aluminium', thick, tip, load, broken }] }   tip in mm (as drawn), broken from 0 to 1
// ---------------------------------------------------------------------------------------------------------------
export function createBeams({ THREE, scene }) {
  const L = 100
  const W = 20
  const weave = weaveTexture(THREE, [6, 2])
  const mats = {
    carbon: new THREE.MeshStandardMaterial({ map: weave, color: 0xffffff, roughness: 0.45, metalness: 0.25 }),
    aluminium: new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.28, metalness: 1 }),
  }
  const wall = new THREE.Mesh(new THREE.BoxGeometry(8, 100, 140), new THREE.MeshStandardMaterial({ color: 0x59606b, roughness: 0.8 }))
  wall.position.set(-4, 0, 0)
  scene.add(wall)
  const items = []

  const remove = (it) => {
    scene.remove(it.mesh, it.arrow, it.tag)
    it.mesh.geometry.dispose()
    it.tag.material.map.dispose()
    it.tag.material.dispose()
  }

  function build(spec, z) {
    const geo = new THREE.BoxGeometry(L, spec.thick, W, 48, 1, 1)
    geo.translate(L / 2, 0, 0)
    const mesh = new THREE.Mesh(geo, mats[spec.material])
    mesh.position.z = z
    const arrow = makeArrow(THREE, 0xe5484d)
    arrow.position.z = z
    const tag = makeLabel(THREE, spec.name, { width: 64 })
    tag.position.set(L * 0.42, 52, z)
    scene.add(mesh, arrow, tag)
    return { mesh, arrow, tag, base: geo.attributes.position.array.slice(), key: `${spec.material}|${spec.thick}|${spec.name}` }
  }

  return {
    update(state) {
      const beams = state.beams
      while (items.length > beams.length) remove(items.pop())
      beams.forEach((spec, i) => {
        const z = (i - (beams.length - 1) / 2) * 46
        const key = `${spec.material}|${spec.thick}|${spec.name}`
        if (!items[i] || items[i].key !== key) {
          if (items[i]) remove(items[i])
          items[i] = build(spec, z)
        }
        const it = items[i]
        const pos = it.mesh.geometry.attributes.position
        const arr = pos.array
        const broken = spec.broken || 0
        const pivotDrop = drop(0.5, spec.tip)
        const angle = -broken * 1.0
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        for (let k = 0; k < pos.count; k += 1) {
          const x0 = it.base[k * 3]
          const y0 = it.base[k * 3 + 1]
          const u = x0 / L
          if (broken > 0 && u > 0.5) {
            const rx = x0 - L / 2
            arr[k * 3] = L / 2 + rx * cos - y0 * sin + broken * 6
            arr[k * 3 + 1] = -pivotDrop + rx * sin + y0 * cos - broken * 28
          } else {
            arr[k * 3] = x0
            arr[k * 3 + 1] = y0 - drop(u, spec.tip)
          }
        }
        pos.needsUpdate = true
        it.mesh.geometry.computeVertexNormals()
        it.arrow.visible = spec.load > 0.02 && broken === 0
        it.arrow.position.set(L - 8, -drop(1, spec.tip) + spec.thick / 2 + 4 + 24 * (1 - Math.min(1, spec.load)), z)
      })
    },
    dispose() {
      items.forEach(remove)
      weave.dispose()
      Object.values(mats).forEach((m) => m.dispose())
    },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// a woven carbon plate pulled at an angle to its fibres. state: { angle (degrees), stretch (how much longer it gets, 0 to 0.6) }
// ---------------------------------------------------------------------------------------------------------------
export function createPlate({ THREE, scene }) {
  const weave = weaveTexture(THREE, [5, 5])
  weave.center.set(0.5, 0.5)
  const plate = new THREE.Mesh(new THREE.BoxGeometry(80, 3, 80), new THREE.MeshStandardMaterial({ map: weave, roughness: 0.45, metalness: 0.25 }))
  plate.position.y = 12
  scene.add(plate)
  const clampMat = new THREE.MeshStandardMaterial({ color: 0x8a93a0, metalness: 0.9, roughness: 0.35 })
  const left = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 90), clampMat)
  const right = left.clone()
  left.position.y = right.position.y = 12
  scene.add(left, right)
  const arrowL = makeArrow(THREE, 0xe5484d, 30)
  arrowL.rotation.z = -Math.PI / 2 // points to -x
  const arrowR = makeArrow(THREE, 0xe5484d, 30)
  arrowR.rotation.z = Math.PI / 2 // points to +x
  arrowL.position.y = arrowR.position.y = 12
  scene.add(arrowL, arrowR)
  const tag = makeLabel(THREE, 'pull', { width: 30 })
  tag.position.set(0, 50, 0)

  return {
    update(state, seconds) {
      weave.rotation = (state.angle * Math.PI) / 180
      const pulse = 0.5 - 0.5 * Math.cos(seconds * 2.2)
      const k = 1 + state.stretch * pulse
      plate.scale.x = k
      const half = 40 * k
      left.position.x = -half - 4
      right.position.x = half + 4
      arrowL.position.x = -half - 10 - 8 * pulse
      arrowR.position.x = half + 10 + 8 * pulse
    },
    dispose() { weave.dispose(); clampMat.dispose() },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// carbon fibre being made: a plastic thread goes through an oven and comes out black, beside a hair for scale
// ---------------------------------------------------------------------------------------------------------------
export function createThread({ THREE, scene }) {
  const pale = new THREE.MeshStandardMaterial({ color: 0xe9e4d4, roughness: 0.5 })
  const dark = new THREE.MeshStandardMaterial({ color: 0x0d0e10, roughness: 0.35, metalness: 0.3 })
  const strand = (x0, x1, mat) => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, x1 - x0, 10), mat)
    m.rotation.z = Math.PI / 2
    m.position.set((x0 + x1) / 2, 0, 0)
    scene.add(m)
    return m
  }
  strand(-140, -26, pale)
  strand(26, 140, dark)
  const ovenMat = new THREE.MeshStandardMaterial({ color: 0xff7a1a, emissive: 0xff5a00, emissiveIntensity: 0.6, transparent: true, opacity: 0.5, roughness: 0.6 })
  const oven = new THREE.Mesh(new THREE.BoxGeometry(52, 38, 44), ovenMat)
  scene.add(oven)
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(oven.geometry), new THREE.LineBasicMaterial({ color: 0xffd9a8 }))
  scene.add(edges)
  const beadGeo = new THREE.SphereGeometry(2.4, 12, 8)
  const beadsPale = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
  const beadsDark = new THREE.MeshStandardMaterial({ color: 0x3a3f47, roughness: 0.4 })
  const beads = Array.from({ length: 24 }, () => { const b = new THREE.Mesh(beadGeo, beadsPale); scene.add(b); return b })

  // a hair is about ten times thicker than a carbon fibre
  const hair = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 30, 28), new THREE.MeshStandardMaterial({ color: 0x7a5434, roughness: 0.6 }))
  hair.position.set(-50, 15, 58)
  const fibre = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 30, 12), dark)
  fibre.position.set(-14, 15, 58)
  scene.add(hair, fibre)
  const tags = [
    ['plastic thread', -80, 10, 0, 40],
    ['carbon thread', 90, 10, 0, 40],
    ['over 1000 °C, no oxygen', 0, 38, 0, 62],
    ['human hair, about 70 µm', -78, 40, 58, 58],
    ['carbon fibre, about 7 µm', 8, 22, 58, 58],
  ].map(([text, x, y, z, w]) => { const s = makeLabel(THREE, text, { width: w }); s.position.set(x, y, z); scene.add(s); return s })

  return {
    update(state, seconds) {
      ovenMat.emissiveIntensity = 0.55 + 0.3 * Math.sin(seconds * 2.2)
      beads.forEach((b, i) => {
        const x = ((((i * 12 + seconds * 24) % 288) + 288) % 288) - 144
        b.position.set(x, 0, 0)
        b.visible = Math.abs(x) > 26
        b.material = x < 0 ? beadsPale : beadsDark
      })
    },
    dispose() {
      tags.forEach((s) => { s.material.map.dispose(); s.material.dispose() })
      beadGeo.dispose()
      ;[pale, dark, ovenMat, beadsPale, beadsDark].forEach((m) => m.dispose())
    },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// a wave in 3D meeting a wall. state: { kind: 'radio' | 'light', through (0 to 1), lambda (length of one wave), wallColor }
// ---------------------------------------------------------------------------------------------------------------
export function createWave({ THREE, scene }) {
  const N = 220
  const bead = new THREE.SphereGeometry(2.1, 10, 8)
  const beadMat = new THREE.MeshBasicMaterial({ color: 0x3e8ef7 })
  const wave = new THREE.InstancedMesh(bead, beadMat, N)
  scene.add(wave)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x9aa3af, roughness: 0.7, transparent: true, opacity: 0.85 })
  const wall = new THREE.Mesh(new THREE.BoxGeometry(16, 74, 74), wallMat)
  scene.add(wall)
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 36, 8), new THREE.MeshStandardMaterial({ color: 0xcfd6e2, metalness: 0.8, roughness: 0.3 }))
  mast.position.set(-172, 18, 0)
  const dish = mast.clone()
  dish.position.x = 172
  scene.add(mast, dish)
  const tags = [['transmitter', -172, 46], ['receiver', 172, 46]].map(([text, x, y]) => { const s = makeLabel(THREE, text, { width: 44 }); s.position.set(x, y, 0); scene.add(s); return s })
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const one = new THREE.Vector3(1, 1, 1)
  const hide = new THREE.Vector3(0, 0, 0)
  const at = new THREE.Vector3()

  return {
    update(state, seconds) {
      beadMat.color.setHex(state.kind === 'radio' ? 0x3e8ef7 : 0xf5a524)
      wallMat.color.set(state.wallColor)
      for (let i = 0; i < N; i += 1) {
        const x = -165 + (i / (N - 1)) * 330
        const amp = x < -9 ? 1 : x > 9 ? state.through : 0
        const ph = (TAU * (x - 70 * seconds)) / state.lambda
        at.set(x, 14 + amp * 26 * Math.sin(ph), amp * 26 * Math.cos(ph))
        m.compose(at, q, amp > 0.03 ? one : hide)
        wave.setMatrixAt(i, m)
      }
      wave.instanceMatrix.needsUpdate = true
    },
    dispose() {
      tags.forEach((s) => { s.material.map.dispose(); s.material.dispose() })
      bead.dispose()
      beadMat.dispose()
      wallMat.dispose()
      wave.dispose()
    },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// a circuit board: the signal runs along the trace and the return current flows in the ground layer beneath. state: { cut }
// ---------------------------------------------------------------------------------------------------------------
function pointAt(points, u) {
  const lengths = []
  let total = 0
  for (let i = 1; i < points.length; i += 1) { const d = points[i].distanceTo(points[i - 1]); lengths.push(d); total += d }
  let want = (((u % 1) + 1) % 1) * total
  for (let i = 0; i < lengths.length; i += 1) {
    if (want <= lengths[i]) return points[i].clone().lerp(points[i + 1], want / lengths[i])
    want -= lengths[i]
  }
  return points[points.length - 1].clone()
}

export function createBoard({ THREE, scene }) {
  const board = new THREE.Mesh(new THREE.BoxGeometry(150, 4, 90), new THREE.MeshStandardMaterial({ color: 0x0f6b45, roughness: 0.55, transparent: true, opacity: 0.4 }))
  scene.add(board)
  const copper = new THREE.MeshStandardMaterial({ color: 0xd2a94c, metalness: 0.9, roughness: 0.3 })
  const trace = new THREE.Mesh(new THREE.BoxGeometry(130, 0.8, 3), copper)
  trace.position.set(0, 2.5, 0)
  scene.add(trace)
  const piece = (x0, x1, z0, z1) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.8, z1 - z0), copper)
    mesh.position.set((x0 + x1) / 2, -2.6, (z0 + z1) / 2)
    scene.add(mesh)
    return mesh
  }
  const whole = piece(-70, 70, -40, 40)
  const parts = [piece(-70, -18, -40, 40), piece(18, 70, -40, 40), piece(-18, 18, -40, -12), piece(-18, 18, 22, 40)]
  const sourcePad = new THREE.Mesh(new THREE.SphereGeometry(4, 16, 12), new THREE.MeshStandardMaterial({ color: 0x8892a0, metalness: 0.6, roughness: 0.4 }))
  sourcePad.position.set(-68, 3, 0)
  const loadPad = sourcePad.clone()
  loadPad.position.x = 68
  scene.add(sourcePad, loadPad)

  const V = (x, y, z) => new THREE.Vector3(x, y, z)
  const signalPath = [V(-66, 4, 0), V(66, 4, 0)]
  const straight = [V(66, -2, 2), V(-66, -2, 2)]
  const detour = [V(66, -2, 2), V(24, -2, 2), V(24, -2, 31), V(-24, -2, 31), V(-24, -2, 2), V(-66, -2, 2)]
  const N = 26
  const ballGeo = new THREE.SphereGeometry(2.2, 10, 8)
  const blue = new THREE.MeshBasicMaterial({ color: 0x3e8ef7 })
  const orange = new THREE.MeshBasicMaterial({ color: 0xf5a524 })
  const out = Array.from({ length: N }, () => { const b = new THREE.Mesh(ballGeo, blue); scene.add(b); return b })
  const back = Array.from({ length: N }, () => { const b = new THREE.Mesh(ballGeo, orange); scene.add(b); return b })
  const tags = [
    ['signal trace', 0, 14, -14, 40],
    ['ground layer, underneath', 0, -14, 58, 50],
    ['cut in the ground', 0, 14, 12, 40],
  ].map(([text, x, y, z, w]) => { const s = makeLabel(THREE, text, { width: w }); s.position.set(x, y, z); scene.add(s); return s })
  const cutTag = tags[2]

  return {
    update(state, seconds) {
      whole.visible = !state.cut
      parts.forEach((p) => { p.visible = state.cut })
      cutTag.visible = state.cut
      const path = state.cut ? detour : straight
      out.forEach((b, i) => b.position.copy(pointAt(signalPath, i / N + seconds * 0.12)))
      back.forEach((b, i) => b.position.copy(pointAt(path, i / N + seconds * (state.cut ? 0.09 : 0.12))))
    },
    dispose() {
      tags.forEach((s) => { s.material.map.dispose(); s.material.dispose() })
      ;[board.material, copper, blue, orange, sourcePad.material].forEach((m) => m.dispose())
      ;[board.geometry, trace.geometry, whole.geometry, ballGeo, sourcePad.geometry].forEach((g) => g.dispose())
      parts.forEach((p) => p.geometry.dispose())
    },
  }
}

// a motor with its propeller, standing on the origin: a base, a ring of copper coils, a red bell with a shaft, and two blades
function makeMotor(THREE) {
  const steel = new THREE.MeshStandardMaterial({ color: 0xaab1bb, metalness: 0.95, roughness: 0.3 })
  const motor = new THREE.Group()
  const baseDisc = new THREE.Mesh(new THREE.CylinderGeometry(11, 12, 3, 32), steel)
  baseDisc.position.y = 2
  motor.add(baseDisc)
  const copper = new THREE.MeshStandardMaterial({ color: 0xc9743a, metalness: 0.8, roughness: 0.35 })
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * TAU
    const coil = new THREE.Mesh(new THREE.BoxGeometry(3.4, 7, 3.4), copper)
    coil.position.set(Math.cos(a) * 7.5, 7, Math.sin(a) * 7.5)
    coil.rotation.y = -a
    motor.add(coil)
  }
  const bellMat = new THREE.MeshStandardMaterial({ color: 0xb04a4a, metalness: 0.95, roughness: 0.25, emissive: 0xff3b1a, emissiveIntensity: 0 })
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 9, 40), bellMat)
  bell.position.y = 15
  motor.add(bell)
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 12, 12), steel)
  shaft.position.y = 24
  motor.add(shaft)
  const prop = new THREE.Group()
  prop.position.y = 28
  const bladeMat = new THREE.MeshStandardMaterial({ color: 0xff6a1a, roughness: 0.4 })
  for (let b = 0; b < 2; b += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(30, 0.9, 6.5), bladeMat)
    blade.position.x = b === 0 ? 17 : -17
    blade.rotation.x = b === 0 ? 0.3 : -0.3
    prop.add(blade)
  }
  prop.add(new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 3, 16), steel))
  motor.add(prop)
  const disc = new THREE.Mesh(new THREE.CircleGeometry(34, 48), new THREE.MeshBasicMaterial({ color: 0xcfd6e2, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide }))
  disc.rotation.x = -Math.PI / 2
  disc.position.y = 28
  motor.add(disc)
  return { motor, prop, bellMat }
}

// ---------------------------------------------------------------------------------------------------------------
// one frame arm with its motor and propeller, and nothing else. The arm bends and shakes in slow motion, the propeller spins, and the motor glows when it is hot.
// state: { swing (how far the tip moves, in mm), thick (mm), spin (radians a second), glow (0 to 1), paused }
// ---------------------------------------------------------------------------------------------------------------
export function createArm({ THREE, scene }) {
  const L = 90
  const weave = weaveTexture(THREE, [5, 1.5])
  const armMat = new THREE.MeshStandardMaterial({ map: weave, roughness: 0.45, metalness: 0.25 })
  const body = new THREE.Mesh(new THREE.BoxGeometry(24, 30, 40), new THREE.MeshStandardMaterial({ color: 0x59606b, roughness: 0.7 }))
  body.position.set(-12, 0, 0)
  scene.add(body)

  let thickNow = 0
  let armMesh = null
  let base = null
  const buildArm = (thick) => {
    if (armMesh) { scene.remove(armMesh); armMesh.geometry.dispose() }
    const geo = new THREE.BoxGeometry(L, thick, 18, 40, 1, 1)
    geo.translate(L / 2, 0, 0)
    base = geo.attributes.position.array.slice()
    armMesh = new THREE.Mesh(geo, armMat)
    scene.add(armMesh)
    thickNow = thick
  }

  const { motor, prop, bellMat } = makeMotor(THREE)
  scene.add(motor)
  const tags = [['frame arm', 38, 24, 0], ['motor', L + 4, 62, 0]].map(([text, x, y, z]) => { const s = makeLabel(THREE, text, { width: 30 }); s.position.set(x, y, z); scene.add(s); return s })

  return {
    update(state, seconds, dt) {
      if (!armMesh || thickNow !== state.thick) buildArm(state.thick)
      const tip = state.swing * Math.sin(TAU * 2.2 * seconds)
      const pos = armMesh.geometry.attributes.position
      for (let k = 0; k < pos.count; k += 1) {
        pos.array[k * 3] = base[k * 3]
        pos.array[k * 3 + 1] = base[k * 3 + 1] - drop(base[k * 3] / L, tip)
      }
      pos.needsUpdate = true
      armMesh.geometry.computeVertexNormals()
      motor.position.set(L, -tip + state.thick / 2, 0)
      motor.rotation.z = Math.atan((-1.5 * tip) / L)
      prop.rotation.y += (state.paused ? 0 : dt) * state.spin
      bellMat.emissiveIntensity = state.glow * 0.9
      tags[1].position.y = 62 - tip
    },
    dispose() {
      weave.dispose()
      tags.forEach((s) => { s.material.map.dispose(); s.material.dispose() })
      armMat.dispose()
    },
  }
}

// ---------------------------------------------------------------------------------------------------------------
// the power chain: battery, ESC and one motor, joined by wires, with current flowing along them.
// state: { cells, current (1 = a 4S pack's current), glow (0 to 1 heat), spin (radians a second), paused }
// ---------------------------------------------------------------------------------------------------------------
export function createPowerChain({ THREE, scene }) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z)
  let cellsNow = 0
  let batteryGroup = null
  let batteryTag = null
  const makeBattery = (cells) => {
    if (batteryGroup) { scene.remove(batteryGroup); batteryGroup.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.() }) }
    if (batteryTag) { scene.remove(batteryTag); batteryTag.material.map.dispose(); batteryTag.material.dispose() }
    batteryGroup = new THREE.Group()
    const w = 13
    for (let i = 0; i < cells; i += 1) {
      const cell = new THREE.Mesh(new THREE.BoxGeometry(w, 20, 38), new THREE.MeshStandardMaterial({ color: i % 2 ? 0x2f7bd9 : 0x3e8ef7, roughness: 0.5, metalness: 0.2 }))
      cell.position.x = -150 + i * (w + 1.5)
      batteryGroup.add(cell)
    }
    const plug = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 14), new THREE.MeshStandardMaterial({ color: 0xf5c518, roughness: 0.5 }))
    plug.position.set(-150 + cells * (w + 1.5) + 2, 0, 0)
    batteryGroup.add(plug)
    scene.add(batteryGroup)
    batteryTag = makeLabel(THREE, `Battery: ${cells}S, ${(cells * 3.7).toFixed(1)} V`, { width: 58 })
    batteryTag.position.set(-150 + (cells * (w + 1.5)) / 2, 34, 0)
    scene.add(batteryTag)
    cellsNow = cells
    return -150 + cells * (w + 1.5) + 6
  }
  let plugEnd = makeBattery(4)

  // the speed controller: a board with power transistors and a capacitor
  const escMat = new THREE.MeshStandardMaterial({ color: 0x0f6b45, roughness: 0.5, emissive: 0xff3b1a, emissiveIntensity: 0 })
  const esc = new THREE.Mesh(new THREE.BoxGeometry(44, 3, 34), escMat)
  esc.position.set(-6, 0, 0)
  scene.add(esc)
  const fetMat = new THREE.MeshStandardMaterial({ color: 0x1a1c20, roughness: 0.4, emissive: 0xff3b1a, emissiveIntensity: 0 })
  for (let i = 0; i < 6; i += 1) {
    const fet = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 6), fetMat)
    fet.position.set(-6 + (i % 3) * 11 - 3, 3, i < 3 ? -8 : 8)
    scene.add(fet)
  }
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 14, 20), new THREE.MeshStandardMaterial({ color: 0x23272e, metalness: 0.6, roughness: 0.35 }))
  cap.position.set(-22, 9, 0)
  scene.add(cap)
  const escTag = makeLabel(THREE, 'ESC (speed controller)', { width: 58 })
  escTag.position.set(-6, 34, 0)
  scene.add(escTag)

  // the motor on a short arm stub
  const stub = new THREE.Mesh(new THREE.BoxGeometry(46, 3, 16), new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.5 }))
  stub.position.set(105, -2, 0)
  scene.add(stub)
  const { motor, prop, bellMat } = makeMotor(THREE)
  motor.position.set(120, 0, 0)
  scene.add(motor)
  const motorTag = makeLabel(THREE, 'Motor', { width: 34 })
  motorTag.position.set(120, 58, 0)
  scene.add(motorTag)

  // wires: two fat power wires battery to ESC, three thin phase wires ESC to motor
  const mats = []
  const wireMat = (hex) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.5, emissive: 0xff3b1a, emissiveIntensity: 0 }); mats.push(m); return m }
  let powerGroup = []
  const buildPower = (end) => {
    powerGroup.forEach((w) => { scene.remove(w.mesh); w.mesh.geometry.dispose(); w.mat.dispose(); mats.splice(mats.indexOf(w.mat), 1) })
    const ends = [[V(end, 4, 7), V((end - 26) / 2, 12, 12), V(-26, 6, 12)], [V(end, 4, -7), V((end - 26) / 2, 12, -12), V(-26, 6, -12)]]
    powerGroup = ends.map((pts, i) => {
      const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.3)
      const mat = wireMat(i === 0 ? 0xd33a3a : 0x1c1e22)
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 2.1, 8, false), mat)
      scene.add(mesh)
      return { curve, mat, mesh }
    })
  }
  buildPower(plugEnd)
  const phase = [0xf5a524, 0x3e8ef7, 0xe5484d].map((hex, i) => {
    const curve = new THREE.CatmullRomCurve3([V(16, 4, (i - 1) * 9), V(60, 8 + i * 3, (i - 1) * 14), V(114, 8, (i - 1) * 6)], false, 'catmullrom', 0.3)
    const mat = wireMat(hex)
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 1.2, 8, false), mat))
    return { curve, mat }
  })

  const bead = new THREE.SphereGeometry(1.9, 10, 8)
  const beadMat = new THREE.MeshBasicMaterial({ color: 0xffd36a })
  const beads = []
  const addBeads = (curveOf, count, wire = -1) => { for (let i = 0; i < count; i += 1) { const m = new THREE.Mesh(bead, beadMat); scene.add(m); beads.push({ m, curveOf, k: i / count, wire }) } }
  addBeads(() => powerGroup[0].curve, 8)
  addBeads(() => powerGroup[1].curve, 8)
  phase.forEach((w, i) => addBeads(() => w.curve, 7, i))
  const wireTags = ['A', 'B', 'C'].map((t, i) => { const s = makeLabel(THREE, `wire ${t}`, { width: 20 }); s.position.set(100, 20 + i * 9, (i - 1) * 16); scene.add(s); return s })
  let flow = 0

  return {
    update(state, seconds, dt) {
      if (state.cells !== cellsNow) { plugEnd = makeBattery(state.cells); buildPower(plugEnd) }
      flow += (state.paused ? 0 : dt) * (0.1 + state.current * 0.16)
      // with state.phase = { from: 'A', to: 'B' } the current goes in along one motor wire and out along another; the third is left floating
      beads.forEach((b) => {
        let u = (((b.k + flow) % 1) + 1) % 1
        b.m.visible = true
        if (state.phase && b.wire >= 0) {
          const role = 'ABC'[b.wire] === state.phase.from ? 'in' : 'ABC'[b.wire] === state.phase.to ? 'out' : 'float'
          b.m.visible = role !== 'float'
          if (role === 'out') u = 1 - u
        }
        b.m.position.copy(b.curveOf().getPoint(u))
      })
      phase.forEach((w, i) => {
        const role = state.phase ? ('ABC'[i] === state.phase.from ? 'in' : 'ABC'[i] === state.phase.to ? 'out' : 'float') : 'in'
        w.mat.transparent = true
        w.mat.opacity = role === 'float' ? 0.2 : 1
      })
      wireTags.forEach((t, i) => { t.visible = !!state.phase })
      const heat = state.glow
      fetMat.emissiveIntensity = heat * 1.1
      bellMat.emissiveIntensity = heat * 0.9
      escMat.emissiveIntensity = heat * 0.25
      mats.forEach((m) => { m.emissiveIntensity = heat * 0.6 })
      prop.rotation.y += (state.paused ? 0 : dt) * state.spin
    },
    dispose() {
      ;[escMat, fetMat, beadMat].forEach((m) => m.dispose())
      bead.dispose()
    },
  }
}
