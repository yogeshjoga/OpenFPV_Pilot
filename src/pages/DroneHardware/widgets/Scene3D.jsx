import { useEffect, useRef, useState } from 'react'
import styles from './Scene3D.module.css'

// A small three.js stage for the hardware lessons. `create({ THREE, scene, camera, controls })` builds the objects and returns
// { update(state, seconds, dt), dispose() }. update runs every frame with the latest `stateRef.current`, so a lesson changes
// the 3D scene by writing into the ref and nothing re-renders sixty times a second. Drag to turn the view, scroll to zoom.
//
// A browser allows only a handful of live 3D contexts, and this page has ten scenes. So a scene only exists while it is on or near
// the screen: it is built when it scrolls close and its 3D context is released when it scrolls far away.
export default function Scene3D({ create, stateRef, view, target, label, floorY = 0, minDistance = 50, maxDistance = 700 }) {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const createRef = useRef(create)
  createRef.current = create
  const [error, setError] = useState('')
  const [near, setNear] = useState(false)
  const [ready, setReady] = useState(false) // the first picture has been drawn
  const [epoch, setEpoch] = useState(0) // bumped when the browser takes the 3D context away, so the scene is built again

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => setNear(entries[entries.length - 1].isIntersecting), { rootMargin: '900px' })
    observer.observe(stageRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!near) { setReady(false); return undefined }
    let cancelled = false
    let frame = 0
    let resize
    let renderer
    let controls
    let api
    let pmrem
    let scene
    let onLost
    const canvas = canvasRef.current
    Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('three/examples/jsm/environments/RoomEnvironment.js'),
    ])
      .then(([THREE, { OrbitControls }, { RoomEnvironment }]) => {
        if (cancelled || !canvas) return
        setError('')
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        onLost = (e) => { e.preventDefault(); if (!cancelled) setEpoch((n) => n + 1) }
        canvas.addEventListener('webglcontextlost', onLost)
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
          camera.fov = Math.min(75, 34 * Math.max(1, 1.45 / camera.aspect)) // a narrow screen sees more up and down, so the scene still fits
          camera.updateProjectionMatrix()
        }
        size()
        resize = new ResizeObserver(size)
        resize.observe(canvas)

        let ready0 = false
        let seconds = 0 // the lesson's own clock; it stands still while the lesson sets `paused`
        let last = performance.now()
        const loop = (now) => {
          if (cancelled) return
          const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05) // a frame can start a hair before the clock was read, which would be a negative step
          last = now
          if (!stateRef.current?.paused) seconds += dt
          api.update(stateRef.current, seconds, dt)
          controls.update()
          renderer.render(scene, camera)
          if (!ready0) { ready0 = true; setReady(true) }
          frame = requestAnimationFrame(loop)
        }
        frame = requestAnimationFrame(loop)
      })
      .catch(() => { if (!cancelled) setError('Your browser could not start the 3D view. The numbers still work.') })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      resize?.disconnect()
      if (onLost) canvas?.removeEventListener('webglcontextlost', onLost)
      api?.dispose?.()
      scene?.traverse((o) => {
        o.geometry?.dispose?.()
        const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []
        for (const m of mats) { m.map?.dispose?.(); m.dispose?.() }
      })
      controls?.dispose()
      pmrem?.dispose()
      renderer?.dispose()
      renderer?.forceContextLoss() // give the 3D context back to the browser straight away
    }
    // the camera and the scene are fixed while the stage is built; the lesson changes it through stateRef
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near, epoch])

  return (
    <div ref={stageRef} className={styles.stage}>
      {near && <canvas key={epoch} ref={canvasRef} className={styles.canvas} aria-label={label} role="img" />}
      {near && !ready && !error && <span className={styles.loading}>Loading the 3D view…</span>}
      <span className={styles.hint}>Drag to turn · scroll to zoom</span>
      {error && <p className={styles.error} role="status">{error}</p>}
    </div>
  )
}
