import { useEffect, useRef, useState } from 'react'
import styles from './Scene3D.module.css'

// A small three.js stage for the hardware lessons. `create({ THREE, scene, camera, controls })` builds the objects and returns
// { update(state, seconds, dt), dispose() }. update runs every frame with the latest `stateRef.current`, so a lesson changes
// the 3D scene by writing into the ref and nothing re-renders sixty times a second. Drag to turn the view, scroll to zoom.
export default function Scene3D({ create, stateRef, view, target, label, floorY = 0, minDistance = 50, maxDistance = 700 }) {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const createRef = useRef(create)
  createRef.current = create
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    let frame = 0
    let observer
    let resize
    let renderer
    let controls
    let api
    let pmrem
    let scene
    Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
    ])
      .then(([THREE, { OrbitControls }, { RoomEnvironment }]) => {
        if (cancelled || !canvasRef.current) return
        const canvas = canvasRef.current
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        scene = new THREE.Scene()
        scene.background = new THREE.Color(0x161b22)
        pmrem = new THREE.PMREMGenerator(renderer)
        scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
        scene.environmentIntensity = 0.55
        const camera = new THREE.PerspectiveCamera(34, 1, 1, 4000)
        camera.position.set(...view)
        controls = new OrbitControls(camera, canvas)
        controls.target.set(...target)
        controls.enableDamping = true
        controls.dampingFactor = 0.08
        controls.minDistance = minDistance
        controls.maxDistance = maxDistance
        controls.enablePan = false
        controls.update()
        scene.add(new THREE.HemisphereLight(0xcfd8ff, 0x20242b, 0.6))
        const sun = new THREE.DirectionalLight(0xfff0dc, 1.8)
        sun.position.set(160, 300, 200)
        scene.add(sun)
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.MeshStandardMaterial({ color: 0x1d232b, roughness: 0.9 }))
        floor.rotation.x = -Math.PI / 2
        floor.position.y = floorY
        scene.add(floor)
        const grid = new THREE.GridHelper(800, 40, 0x3a4350, 0x2a313b)
        grid.position.y = floorY + 0.2
        scene.add(grid)

        api = createRef.current({ THREE, scene, camera, controls })
        const size = () => {
          const w = canvas.clientWidth || 640
          const h = canvas.clientHeight || 360
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        }
        size()
        resize = new ResizeObserver(size)
        resize.observe(canvas)

        let visible = true
        let seconds = 0 // the lesson's own clock; it stands still while the lesson sets `paused`
        let last = performance.now()
        const loop = (now) => {
          frame = 0
          if (cancelled) return
          const dt = Math.min((now - last) / 1000, 0.05)
          last = now
          if (!stateRef.current?.paused) seconds += dt
          api.update(stateRef.current, seconds, dt)
          controls.update()
          renderer.render(scene, camera)
          if (visible) frame = requestAnimationFrame(loop)
        }
        observer = new IntersectionObserver((entries) => {
          visible = entries[entries.length - 1].isIntersecting
          if (visible && !frame) { last = performance.now(); frame = requestAnimationFrame(loop) }
        }, { rootMargin: '80px' })
        observer.observe(stageRef.current)
        frame = requestAnimationFrame(loop)
      })
      .catch(() => { if (!cancelled) setError('Your browser could not start the 3D view. The numbers still work.') })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      resize?.disconnect()
      api?.dispose?.()
      scene?.traverse((o) => {
        o.geometry?.dispose?.()
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
        for (const m of mats) { m.map?.dispose?.(); m.dispose?.() }
      })
      controls?.dispose()
      pmrem?.dispose()
      renderer?.dispose()
    }
    // the camera and the scene are fixed for the life of the stage; the lesson changes it through stateRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={stageRef} className={styles.stage}>
      <canvas ref={canvasRef} className={styles.canvas} aria-label={label} role="img" />
      <span className={styles.hint}>Drag to turn · scroll to zoom</span>
      {error && <p className={styles.error} role="status">{error}</p>}
    </div>
  )
}
