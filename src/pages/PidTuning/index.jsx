import { useEffect, useState } from 'react'
import { BookOpen, Settings2, SlidersHorizontal } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import Learn from './sections/Learn.jsx'
import TuningLab from './sections/TuningLab.jsx'
import Parameters from './sections/Parameters.jsx'
import BetaflightGuide from './sections/BetaflightGuide.jsx'
import styles from './PidTuning.module.css'

const SECTIONS = [
  { id: 'learn', label: '1. Learn PID' },
  { id: 'tune', label: '2. Tune it yourself' },
  { id: 'parameters', label: '3. Every parameter' },
  { id: 'betaflight', label: '4. Betaflight' },
]

const PATHS = [
  { id: 'learn', n: 1, icon: BookOpen, title: 'Learn how PID works', text: 'The physics of why a drone needs a controller, what P, I and D each do, and how aerodynamics changes the answer, with graphs from a real simulation.' },
  { id: 'tune', n: 2, icon: SlidersHorizontal, title: 'Tune a 3D drone', text: 'Move the sliders, run a stick step, a gust, a crosswind or prop wash, and watch the drone and its numbers respond.' },
  { id: 'betaflight', n: 3, icon: Settings2, title: 'Set it up in Betaflight', text: 'Every tuning parameter explained, how to flash the firmware, and a tour of every tab of the Configurator.' },
]

export default function PidTuning() {
  const [current, setCurrent] = useState('learn')

  // the section in view lights up in the navigation
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean)
    if (!els.length || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setCurrent(visible.target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.2, 0.5] },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <PageWrapper>
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>PID tuning academy</p>
          <h1 className={styles.title}>Understand PID, tune a drone, and set it up in Betaflight</h1>
          <p className={styles.subtitle}>
            A short path from the physics of a flying drone to a tuned quad: learn why it needs a controller, tune one yourself, then set up the real thing.
          </p>
          <div className={styles.paths}>
            {PATHS.map((p) => (
              <a key={p.id} href={`#${p.id}`} className={styles.path}>
                <span className={styles.pathNum}>{p.n}</span>
                <span className={styles.pathTitle}>{p.title}</span>
                <span className={styles.pathText}>{p.text}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <nav className={styles.subnav} aria-label="On this page">
        <div className={`container ${styles.subnavInner}`}>
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className={styles.subnavLink} aria-current={current === s.id ? 'true' : undefined}>{s.label}</a>
          ))}
        </div>
      </nav>

      <Learn />
      <TuningLab />
      <Parameters />
      <BetaflightGuide />

      <p className={styles.foot}>Simulated with simple, typical numbers for learning. Always confirm a tune on the real drone, with the props on and a clear field.</p>
    </PageWrapper>
  )
}
