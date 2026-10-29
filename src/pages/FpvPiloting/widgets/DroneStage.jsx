import { useEffect, useRef, useState } from 'react'
import { DEFAULT_BUILD, resolveBuild } from '../../DroneConfigurator/catalog.js'
import styles from './DroneStage.module.css'

// Our 3D drone on a mat. The parent writes the pose it wants into `poseRef.current` ({ pitch, roll, yaw } in radians, height in mm)
// and this component applies it every frame, so nothing re-renders sixty times a second.
export default function DroneStage({ poseRef, label, children, className = '', view = [430, 150, -40], target = [0, 60, 0], scale = 1 }) {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const [error, setError] = useState('')

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
        builder.size()
        builder.setBuild(resolveBuild(DEFAULT_BUILD))
        builder.setSpin(true)
        builder.setAutoRotate(false)
        builder.setScale(scale)
        builder.setView(view, target)
        resize = new ResizeObserver(() => builder.size())
        resize.observe(canvasRef.current)
        let visible = true
        observer = new IntersectionObserver((entries) => { visible = entries[entries.length - 1].isIntersecting; builder.setActive(visible) }, { rootMargin: '80px' })
        observer.observe(stageRef.current)
        const apply = () => {
          if (visible && poseRef.current) builder.setPose(poseRef.current)
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
    }
    // the camera and scale are fixed for the life of the stage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={stageRef} className={`${styles.stage} ${className}`}>
      <canvas ref={canvasRef} className={styles.canvas} aria-label={label} />
      {error && <p className={styles.error} role="status">{error}</p>}
      {children}
    </div>
  )
}
