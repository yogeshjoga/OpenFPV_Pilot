// A 3D 5-inch freestyle quad that rebuilds itself from the parts a student picks (three.js, no React).
// The drone itself is built in droneModel.js. This file adds the workshop, the camera, picking and the loop.
// Drone-frame words: f = forward (the nose), r = right, u = up. In three.js: x = r, y = u, z = -f. Units are about 1 mm.
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { buildDroneModel, disposeDroneModel, carbonTexture, matTexture, pegTexture, MOTORS } from './droneModel.js'

const GLOW = 0xff7a1a

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
  const SUN_OFFSET = new THREE.Vector3(280, 560, -190)
  sun.position.copy(SUN_OFFSET)
  scene.add(sun.target)
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

  // ---- a flight path drawn in the scene, for the stunt and race lessons: one coloured tube for each part of the move ----
  const pathGroup = new THREE.Group()
  scene.add(pathGroup)
  let pathParts = []
  const clearPath = () => {
    for (const part of pathParts) { part.mesh.geometry.dispose(); part.material.dispose(); pathGroup.remove(part.mesh) }
    pathParts = []
  }
  let fitted = null // the last view fitted to a path, so a resize can fit it again
  let following = false // the camera travels with the drone
  const fit = ({ center, width, height, elevation = 15 }) => {
    fitted = { center, width, height, elevation }
    const vfov = (camera.fov * Math.PI) / 180
    const tanV = Math.tan(vfov / 2)
    const tanH = tanV * camera.aspect
    const dist = Math.max(width / 2 / tanH, height / 2 / tanV) * 1.2 + 120
    const el = (elevation * Math.PI) / 180
    camera.position.set(center[0], center[1] + dist * Math.sin(el), center[2] + dist * Math.cos(el))
    controls.target.set(center[0], center[1], center[2])
    controls.minDistance = 120
    controls.maxDistance = dist * 2.4
    controls.autoRotate = false
    scene.fog.near = dist + 1200
    scene.fog.far = dist + 3200
    camera.far = dist * 4 + 3500
    camera.updateProjectionMatrix()
    controls.update()
  }

  // ---- the drone, rebuilt whenever the parts change ----
  // the drone sits in a rig that turns about its centre, so it can pitch, roll and yaw like the real thing
  const RIG_Y = 36
  let rigScale = 1
  const rig = new THREE.Group()
  rig.position.y = RIG_Y
  scene.add(rig)
  let drone = null
  let model = null
  let parts = null
  let blades = []
  let discs = []
  let explode = 0
  let wireGroup = null
  let wireMats = []
  let reveal = false
  let spinning = false
  let spinRate = 40 // radians a second
  let highlighted = null
  let byCategory = {}
  let exploders = []
  const spin = [0, 0, 0, 0]

  function dispose() {
    if (!model) return
    disposeDroneModel(model)
    rig.remove(drone)
    drone = null
    model = null
  }

  function build(p) {
    dispose()
    model = buildDroneModel(p, carbonMap)
    drone = model.drone
    drone.position.y = -RIG_Y
    rig.add(drone)
    ;({ byCategory, exploders, blades, discs, wireGroup, wireMats } = model)
    applyExplode()
    applyHighlight()
    applyReveal()
  }

  function applyExplode() {
    if (wireGroup) wireGroup.visible = explode < 0.05 // the wires only make sense on an assembled drone
    for (const { g, vec } of exploders) g.position.copy(vec).multiplyScalar(explode)
  }
  // "show wiring": lift off the battery, top plate and upper boards, and colour each motor's wires
  const WIRE_COLORS = [0xf5a524, 0x3e8ef7, 0xe5484d, 0x30a46c] // front right, front left, rear right, rear left
  function applyReveal() {
    for (const { g } of exploders) if (g.userData.cover) g.visible = !reveal
    wireMats.forEach((m, i) => m.color.setHex(reveal ? WIRE_COLORS[i] : 0x15171a))
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
      const rate = spinning ? spinRate : 0
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
    setSpinRate(rate) { spinRate = rate },
    setReveal(on) { reveal = on; applyReveal() },
    setExplode(amount) { explode = amount; applyExplode() },
    highlight(category) { highlighted = category; applyHighlight() },
    // pitch (nose down is positive), roll (right side down is positive) and yaw in radians; height in millimetres
    // x and z (mm) move the drone about the scene: x to the right, z toward the viewer. The shadow goes with it.
    setPose({ pitch = 0, roll = 0, yaw = 0, height = 0, x = 0, z = 0 } = {}) {
      rig.rotation.set(-pitch, -yaw, -roll, 'YXZ')
      const before = rig.position.clone()
      rig.position.set(x, RIG_Y * rigScale + height, z)
      if (following) {
        const move = rig.position.clone().sub(before)
        camera.position.add(move)
        controls.target.add(move)
      }
      sun.position.set(x + SUN_OFFSET.x, SUN_OFFSET.y, z + SUN_OFFSET.z)
      sun.target.position.set(x, 0, z)
    },
    // segments: [{ points: [{ x, y, z }, ...], color }] in scene units (mm), drawn as tubes
    setPath(segments, { radius = 4 } = {}) {
      clearPath()
      for (const seg of segments) {
        if (seg.points.length < 2) continue
        const curve = new THREE.CatmullRomCurve3(seg.points.map((q) => new THREE.Vector3(q.x, q.y, q.z)), false, 'centripetal')
        const geometry = new THREE.TubeGeometry(curve, Math.min(240, seg.points.length * 2), radius, 6, false)
        const material = new THREE.MeshBasicMaterial({ color: seg.color, transparent: true, opacity: 0.45 })
        const mesh = new THREE.Mesh(geometry, material)
        pathGroup.add(mesh)
        pathParts.push({ mesh, material })
      }
    },
    // the part of the path the drone is on is drawn solid, the rest faint
    highlightPath(index) { pathParts.forEach((part, i) => { part.material.opacity = i === index ? 1 : 0.4 }) },
    clearPath,
    // true: the camera stays close to the drone and travels with it. false: back to the view of the whole path.
    setFollow(on) {
      following = on
      if (!fitted) return
      if (on) {
        const el = (fitted.elevation * Math.PI) / 180
        const dist = 480
        controls.target.copy(rig.position)
        camera.position.set(rig.position.x, rig.position.y + dist * Math.sin(el), rig.position.z + dist * Math.cos(el))
        controls.minDistance = 120
        controls.maxDistance = 1400
        controls.update()
      } else fit(fitted)
    },
    // look at a path from the side or from above: it fits the whole path in view, whatever the size of the canvas
    fitView(options) { fit(options) },
    // scale the whole drone about its centre, keeping its feet on the mat
    setScale(k) {
      rigScale = k
      rig.scale.setScalar(k)
      rig.position.y = RIG_Y * k
    },
    setAutoRotate(on) { controls.autoRotate = on },
    setView(position, target) {
      camera.position.set(...position)
      controls.target.set(...target)
      controls.autoRotate = false
      controls.update()
    },
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
      if (fitted && !following) fit(fitted)
    },
    render() { controls.update(); renderer.render(scene, camera) },
    get parts() { return parts },
    dispose() {
      active = false
      cancelAnimationFrame(frame)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      clearPath()
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
