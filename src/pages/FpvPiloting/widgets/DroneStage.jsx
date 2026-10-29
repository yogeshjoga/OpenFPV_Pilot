import { useEffect, useRef, useState } from 'react'
import { DEFAULT_BUILD, resolveBuild } from '../../DroneConfigurator/catalog.js'
import styles from './DroneStage.module.css'

// Our 3D drone on a mat. The parent writes the pose it wants into `poseRef.current` ({ pitch, roll, yaw } in radians, height, x and z in mm,
// and optionally `phase`) and this component applies it every frame, so nothing re-renders sixty times a second.
// With a `track` ({ segments, fit } from sceneTrack) the flight path is drawn in the scene, the camera is fitted to it,
// and the part of the path the drone is on (`phase`) is drawn solid.
// Optional: `spinRate` (radians a second, default 40), `highlight` (a part to glow: 'motor', 'prop', ...) and `explode` (0 to 1, lifts the parts apart).
export default function DroneStage({ poseRef, label, children, className = '', view = [430, 150, -40], target = [0, 60, 0], scale = 1, track = null, spinRate = 40, highlight = null, explode = 0 }) {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const builderRef = useRef(null)
  const trackRef = useRef(track)
  const shownRef = useRef(-1) // the part of the path drawn solid
  const [error, setError] = useState('')
  const [follow, setFollow] = useState(false)

  const applyTrack = (builder, next) => {
    if (!builder) return
    shownRef.current = -1
    if (!next) { builder.clearPath(); return }
    builder.setPath(next.segments)
    builder.fitView(next.fit)
  }
  trackRef.current = track
  const lookRef = useRef({})
  lookRef.current = { spinRate, highlight, explode }
  const applyLook = (builder) => {
    const look = lookRef.current
    builder.setSpinRate(look.spinRate)
    builder.highlight(look.highlight)
    builder.setExplode(look.explode)
  }

  useEffect(() => {
    let cancelled = false
    let observer
    let resize
    let frame = 0
    let builder
    import('@components/three/DroneBuilder')
      .then(({ createDroneBuilder }) => {
        if (cancelled || !canvasRef.current) return
        builder = createDroneBuilder(canvasRef.current, {})
        builderRef.current = builder
        builder.size()
        builder.setBuild(resolveBuild(DEFAULT_BUILD))
        builder.setSpin(true)
        builder.setAutoRotate(false)
        applyLook(builder)
        builder.setScale(scale)
        builder.setView(view, target)
        applyTrack(builder, trackRef.current)
        resize = new ResizeObserver(() => builder.size())
        resize.observe(canvasRef.current)
        let visible = true
        observer = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; builder.setActive(visible) }, { rootMargin: '80px' })
        observer.observe(stageRef.current)
        const apply = () => {
          const pose = poseRef.current
          if (visible && pose) {
            builder.setPose(pose)
            if (pose.phase !== undefined && pose.phase !== shownRef.current) { shownRef.current = pose.phase; builder.highlightPath(pose.phase) }
          }
          frame = requestAnimationFrame(apply)
        }
        frame = requestAnimationFrame(apply)
      })
      .catch(() => { if (!cancelled) setError('Your browser could not start the 3D view. The sticks and numbers still work.') })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      observer?.disconnect()
      resize?.disconnect()
      builder?.dispose()
      builderRef.current = null
    }
    // the camera and scale are fixed for the life of the stage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // a new move means a new path, seen from the whole path first
  useEffect(() => { setFollow(false); applyTrack(builderRef.current, track) }, [track])
  useEffect(() => { builderRef.current?.setFollow(follow) }, [follow])
  useEffect(() => { if (builderRef.current) applyLook(builderRef.current) }, [spinRate, highlight, explode])

  return (
    <div ref={stageRef} className={`${styles.stage} ${className}`}>
      <canvas ref={canvasRef} className={styles.canvas} aria-label={label} />
      {error && <p className={styles.error} role="status">{error}</p>}
      {track && (
        <div className={styles.camera} role="group" aria-label="Camera">
          <button type="button" aria-pressed={!follow} onClick={() => setFollow(false)}>Whole path</button>
          <button type="button" aria-pressed={follow} onClick={() => setFollow(true)}>Follow drone</button>
        </div>
      )}
      {children}
    </div>
  )
}
