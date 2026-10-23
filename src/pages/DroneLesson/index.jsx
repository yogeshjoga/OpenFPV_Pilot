import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Maximize2, Minimize2 } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import useUIStore from '@store/useUIStore'
import styles from './DroneLesson.module.css'

const SRC = {
  dark: '/illustrations/fpv-drone-lesson-dark.html',
  light: '/illustrations/fpv-drone-lesson-light.html',
}

// In full screen the lesson keeps its two-column layout at this size and is scaled to fit the screen,
// so the drawing, the text, the radio and the motors are all in view at once.
const FULL_W = 1200
const FULL_H = 1200
const FULL_MIN_WIDTH = 1000

function fullScreenSize() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vw < FULL_MIN_WIDTH) return { width: vw, height: vh, scale: 1 }
  const scale = Math.min(vw / FULL_W, vh / FULL_H)
  return { width: vw / scale, height: vh / scale, scale }
}

export default function DroneLesson() {
  const theme = useUIStore((s) => s.theme)
  const wrapRef = useRef(null)
  const frameRef = useRef(null)
  const [height, setHeight] = useState(900)
  const [full, setFull] = useState(false)
  const [size, setSize] = useState(fullScreenSize)

  // The lesson is a self-contained page. It is same-origin, so the frame can grow to fit it.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame || full) return undefined
    let observer
    const fit = () => {
      const doc = frame.contentDocument
      if (!doc?.documentElement) return
      setHeight(Math.ceil(doc.documentElement.scrollHeight))
    }
    const onLoad = () => {
      fit()
      const doc = frame.contentDocument
      if (doc?.body && 'ResizeObserver' in window) {
        observer = new ResizeObserver(fit)
        observer.observe(doc.body)
      }
    }
    frame.addEventListener('load', onLoad)
    if (frame.contentDocument?.readyState === 'complete') onLoad()
    return () => {
      frame.removeEventListener('load', onLoad)
      observer?.disconnect()
    }
  }, [theme, full])

  const exitFull = useCallback(() => {
    setFull(false)
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
  }, [])

  const enterFull = () => {
    setSize(fullScreenSize())
    setFull(true)
    wrapRef.current?.requestFullscreen?.().catch(() => {})
  }

  // Esc and the browser's own full-screen exit both end up here.
  useEffect(() => {
    if (!full) return undefined
    const onChange = () => {
      if (!document.fullscreenElement) setFull(false)
    }
    const onKey = (event) => {
      if (event.key === 'Escape') exitFull()
    }
    const onResize = () => setSize(fullScreenSize())
    const scroll = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      document.body.style.overflow = scroll
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [full, exitFull])

  const frameStyle = full
    ? { width: size.width, height: size.height, transform: `scale(${size.scale})` }
    : { height }

  return (
    <PageWrapper>
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>How a drone works</p>
          <h1 className={styles.title}>Build it part by part, then learn to fly it</h1>
          <p className={styles.subtitle}>
            Press play. Twelve parts go on one by one, each with a short explanation. Then the radio sticks show how
            throttle, yaw, pitch and roll move the drone. At the end it is your turn to fly.
          </p>
        </div>
      </section>

      <section className={styles.stage}>
        <div className="container">
          <div ref={wrapRef} className={full ? styles.wrapFull : styles.wrap}>
            <button
              type="button"
              className={full ? styles.exitButton : styles.fullButton}
              onClick={full ? exitFull : enterFull}
              aria-label={full ? 'Exit full screen' : 'Full screen'}
            >
              {full ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
              {full ? 'Exit full screen' : 'Full screen'}
            </button>
            <iframe
              key={theme}
              ref={frameRef}
              className={full ? styles.frameFull : styles.frame}
              style={frameStyle}
              src={SRC[theme === 'dark' ? 'dark' : 'light']}
              title="Animated FPV drone build and flight lesson"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className={styles.next}>
        <div className="container">
          <p>Want to build and fly one with a coach next to you?</p>
          <Link to="/workshops" className={styles.cta}>
            See the workshops <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageWrapper>
  )
}
