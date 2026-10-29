import { useEffect, useState } from 'react'
import { Brain, Gauge, GraduationCap, Repeat, SlidersHorizontal } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import useDocumentMeta from '@lib/useDocumentMeta'
import Modes from './sections/Modes.jsx'
import Training from './sections/Training.jsx'
import Loops from './sections/Loops.jsx'
import Mind from './sections/Mind.jsx'
import Fast from './sections/Fast.jsx'
import styles from './FpvPiloting.module.css'

const SECTIONS = [
  { id: 'modes', label: '1. Flight modes' },
  { id: 'training', label: '2. Train each mode' },
  { id: 'loops', label: '3. Sticks and loops' },
  { id: 'mind', label: '4. Hands and head' },
  { id: 'fast', label: '5. Flying fast' },
]

const PATHS = [
  { id: 'modes', icon: SlidersHorizontal, title: 'Angle, Acro and 3D', text: 'What a flight mode is, how each one works on a 3D drone, how they compare, and which to use when.' },
  { id: 'training', icon: GraduationCap, title: 'A task ladder for each mode', text: 'Step-by-step tasks to practise in every mode, with a tick list to track your progress.' },
  { id: 'loops', icon: Repeat, title: 'Sticks and the 0, 8, 6, 7', text: 'Every stick move explained, and four practice patterns flown on screen with the sticks moving beside them.' },
  { id: 'mind', icon: Brain, title: 'Muscle memory and focus', text: 'Exercises that build quick, steady hands, and habits that keep your head clear.' },
  { id: 'fast', icon: Gauge, title: 'Braking and speed at 100+ km/h', text: 'How much room a fast drone needs, how to brake, control speed and decide quickly.' },
]

export default function FpvPiloting() {
  useDocumentMeta('FPV Piloting | EGIRE Robotics', 'Learn FPV piloting: Angle, Acro and 3D modes on a 3D drone, training tasks for each mode, the 0, 8, 6 and 7 loops with animated sticks, muscle memory, focus, braking and flying at 100+ km/h.')
  const [current, setCurrent] = useState('modes')

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
          <p className={styles.eyebrow}>FPV piloting</p>
          <h1 className={styles.title}>Learn to fly FPV, mode by mode</h1>
          <p className={styles.subtitle}>
            Start with what a flight mode is, practise in each one, learn every stick move and four patterns that train your hands, then build the speed, focus and decisions that fast flying needs.
          </p>
          <div className={styles.paths}>
            {PATHS.map((p, i) => (
              <a key={p.id} href={`#${p.id}`} className={styles.path}>
                <span className={styles.pathNum}>{i + 1}</span>
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

      <Modes />
      <Training />
      <Loops />
      <Mind />
      <Fast />

      <p className={styles.foot}>Learn in a simulator first, then fly in a large open area where it is legal and safe, away from people. The numbers on this page are simple models for learning.</p>
    </PageWrapper>
  )
}
