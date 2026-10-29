import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import styles from './FpvPiloting.module.css'

export function Section({ id, kicker, title, intro, children }) {
  const calm = useReducedMotion()
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className="container">
        <motion.header
          className={styles.sectionHead}
          initial={calm ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <p className={styles.kicker}>{kicker}</p>
          <h2 id={`${id}-title`} className={styles.sectionTitle}>{title}</h2>
          {intro && <p className={styles.sectionIntro}>{intro}</p>}
        </motion.header>
        {children}
      </div>
    </section>
  )
}

// a heading inside a section
export function Block({ title, intro, children }) {
  return (
    <div className={styles.block}>
      <h3 className={styles.blockTitle}>{title}</h3>
      {intro && <p className={styles.blockIntro}>{intro}</p>}
      {children}
    </div>
  )
}

// Calls `callback(dt)` every animation frame while `running`, with dt in seconds (never more than 50 ms, so a hidden tab does not jump).
export function useFrame(callback, running = true) {
  const saved = useRef(callback)
  saved.current = callback
  useEffect(() => {
    if (!running) return undefined
    let frame = 0
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      saved.current(dt)
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [running])
}
