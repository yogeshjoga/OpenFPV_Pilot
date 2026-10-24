import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Box, Maximize2, Minimize2, PencilRuler } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import useUIStore from '@store/useUIStore'
import styles from './DroneLesson.module.css'

// The same lesson twice: a 2D drawing and a 3D model. Each is a self-contained page, so either one can be shown in the frame.
const SRC = {
  '2d': {
    dark: '/illustrations/fpv-drone-lesson-dark.html',
    light: '/illustrations/fpv-drone-lesson-light.html',
  },
  '3d': {
    dark: '/illustrations/fpv-drone-lesson-3d-dark.html',
    light: '/illustrations/fpv-drone-lesson-3d-light.html',
  },
}
const MODE_KEY = 'droneLessonMode'

function savedMode() {
  try {
    return localStorage.getItem(MODE_KEY) === '3d' ? '3d' : '2d'
  } catch {
    return '2d'
  }
}

// In full screen the lesson is drawn at a fixed layout size and scaled to fit, so the drawing, the text,
// the radio and the motors are all in view at once. Landscape screens get the wide three-part layout
// (the lesson page switches to it from 1500px wide); tall or square screens get the narrower one.
const WIDE = { w: 1560, h: 1020 }
const NARROW = { w: 1200, h: 1200 }
const WIDE_MIN_ASPECT = 1.25
const FULL_MIN_WIDTH = 1000

function fullScreenSize() {
  const vw = window.innerWidth
  const vh = window.innerHeight
  if (vw < FULL_MIN_WIDTH) return { width: vw, height: vh, scale: 1 }
  const layout = vw / vh >= WIDE_MIN_ASPECT ? WIDE : NARROW
  const scale = Math.min(vw / layout.w, vh / layout.h)
  return { width: vw / scale, height: vh / scale, scale }
}

export default function DroneLesson() {
  const theme = useUIStore((s) => s.theme)
  const wrapRef = useRef(null)
  const frameRef = useRef(null)
  const stepRef = useRef(0) // the step the lesson is on, so switching view keeps your place
  const [mode, setMode] = useState(savedMode)
  const [notice, setNotice] = useState('')
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
  }, [theme, mode, full])

  // The lesson pages say which step they are on; a page that cannot start 3D says so and the 2D lesson is shown.
  useEffect(() => {
    const onMessage = (event) => {
      if (event.origin !== window.location.origin || event.source !== frameRef.current?.contentWindow) return
      const data = event.data || {}
      if (typeof data.droneLesson === 'number') stepRef.current = data.droneLesson
      if (data.droneLesson3dUnavailable) {
        setMode('2d')
        setNotice('Your browser could not start the 3D view, so the 2D lesson is shown.')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  const chooseMode = (next) => {
    if (next === mode) return
    setNotice('')
    setMode(next)
    try {
      localStorage.setItem(MODE_KEY, next)
    } catch {
      // the choice just is not remembered
    }
  }

  // read the step only when the view or theme changes, so later renders do not reload the frame
  const src = useMemo(
    () => `${SRC[mode][theme === 'dark' ? 'dark' : 'light']}#s=${stepRef.current}`,
    [mode, theme],
  )

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
            <div className={full ? styles.toolsFull : styles.tools}>
              <div className={styles.modes} role="group" aria-label="View">
                <button
                  type="button"
                  className={styles.modeButton}
                  aria-pressed={mode === '2d'}
                  onClick={() => chooseMode('2d')}
                >
                  <PencilRuler size={16} aria-hidden="true" />
                  2D drawing
                </button>
                <button
                  type="button"
                  className={styles.modeButton}
                  aria-pressed={mode === '3d'}
                  onClick={() => chooseMode('3d')}
                >
                  <Box size={16} aria-hidden="true" />
                  3D model
                </button>
              </div>
              <button
                type="button"
                className={styles.toolButton}
                onClick={full ? exitFull : enterFull}
                aria-label={full ? 'Exit full screen' : 'Full screen'}
              >
                {full ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
                {full ? 'Exit full screen' : 'Full screen'}
              </button>
            </div>
            {notice && <p className={styles.notice} role="status">{notice}</p>}
            <iframe
              key={mode + theme}
              ref={frameRef}
              className={full ? styles.frameFull : styles.frame}
              style={frameStyle}
              src={src}
              title={mode === '3d' ? 'Animated 3D FPV drone build and flight lesson' : 'Animated FPV drone build and flight lesson'}
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
