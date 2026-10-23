import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import useUIStore from '@store/useUIStore'
import styles from './DroneLesson.module.css'

const SRC = {
  dark: '/illustrations/fpv-drone-lesson-dark.html',
  light: '/illustrations/fpv-drone-lesson-light.html',
}

export default function DroneLesson() {
  const theme = useUIStore((s) => s.theme)
  const frameRef = useRef(null)
  const [height, setHeight] = useState(900)

  // The lesson is a self-contained page. It is same-origin, so the frame can grow to fit it.
  useEffect(() => {
    const frame = frameRef.current
    if (!frame) return undefined
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
  }, [theme])

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
          <iframe
            key={theme}
            ref={frameRef}
            className={styles.frame}
            style={{ height }}
            src={SRC[theme === 'dark' ? 'dark' : 'light']}
            title="Animated FPV drone build and flight lesson"
            loading="lazy"
          />
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
