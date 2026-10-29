import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Brain, Flag, Gauge, GraduationCap, Maximize2, Minimize2, Repeat, SlidersHorizontal } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import useDocumentMeta from '@lib/useDocumentMeta'
import Modes from './sections/Modes.jsx'
import Training from './sections/Training.jsx'
import Loops from './sections/Loops.jsx'
import Mind from './sections/Mind.jsx'
import Fast from './sections/Fast.jsx'
import Moves from './sections/Moves.jsx'
import styles from './FpvPiloting.module.css'

// The course is six parts. Only one shows at a time, so the student sees what they are working on and nothing else.
const PARTS = [
  { id: 'modes', label: 'Flight modes', icon: SlidersHorizontal, View: Modes, text: 'What a flight mode is, how each one works on a 3D drone, how they compare, and which to use when.' },
  { id: 'training', label: 'Train each mode', icon: GraduationCap, View: Training, text: 'Step-by-step tasks to practise in every mode, with a tick list to track your progress.' },
  { id: 'loops', label: 'Sticks and loops', icon: Repeat, View: Loops, text: 'Every stick move explained, and four practice patterns flown on screen with the sticks moving beside them.' },
  { id: 'mind', label: 'Hands and head', icon: Brain, View: Mind, text: 'Exercises that build quick, steady hands, and habits that keep your head clear.' },
  { id: 'fast', label: 'Flying fast', icon: Gauge, View: Fast, text: 'How much room a fast drone needs, how to brake, control speed and decide quickly.' },
  { id: 'moves', label: 'Race moves and stunts', icon: Flag, View: Moves, text: 'Flips, rolls, loops, race circles, hairpins and dive gates, all flown on screen with the sticks.' },
]

// the address says which part is open: /fpv-piloting#loops
const readPart = () => {
  const id = typeof window === 'undefined' ? '' : window.location.hash.replace('#', '')
  return PARTS.some((p) => p.id === id) ? id : 'start'
}

export default function FpvPiloting() {
  useDocumentMeta('FPV Piloting | EGIRE Robotics', 'Learn FPV piloting: Angle, Acro and 3D modes on a 3D drone, training tasks for each mode, the 0, 8, 6 and 7 loops with animated sticks, muscle memory, focus, braking and flying at 100+ km/h, and race moves and stunts.')
  const [part, setPart] = useState(readPart)
  const rootRef = useRef(null)
  const [native, setNative] = useState(false) // the browser's own full screen
  const [pseudo, setPseudo] = useState(false) // a full screen made of the page itself, where the browser has none (iPhone, some embedded views)
  const full = native || pseudo

  // full screen follows the browser: Esc leaves it, and so does the button
  useEffect(() => {
    const sync = () => setNative(document.fullscreenElement === rootRef.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])
  useEffect(() => {
    if (!pseudo) return undefined
    const onKey = (e) => { if (e.key === 'Escape') setPseudo(false) }
    document.documentElement.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.documentElement.style.overflow = ''; window.removeEventListener('keydown', onKey) }
  }, [pseudo])

  const toggleFull = useCallback(async () => {
    if (document.fullscreenElement) { await document.exitFullscreen(); return }
    if (pseudo) { setPseudo(false); return }
    const el = rootRef.current
    try {
      if (!el?.requestFullscreen) throw new Error('no full screen')
      await el.requestFullscreen()
    } catch {
      setPseudo(true)
    }
  }, [pseudo])

  // the back and forward buttons move between parts
  useEffect(() => {
    const sync = () => setPart(readPart())
    window.addEventListener('popstate', sync)
    window.addEventListener('hashchange', sync)
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync) }
  }, [])

  const go = useCallback((id) => {
    setPart((current) => {
      if (current === id) return current
      window.history.pushState(null, '', id === 'start' ? window.location.pathname : `#${id}`)
      return id
    })
    window.scrollTo({ top: 0 })
    rootRef.current?.scrollTo({ top: 0 }) // in full screen the page is what scrolls
  }, [])

  const index = PARTS.findIndex((p) => p.id === part)
  const current = PARTS[index]
  const before = PARTS[index - 1]
  const after = PARTS[index + 1]

  return (
    <PageWrapper>
      <div ref={rootRef} className={styles.page} data-full={full} data-pseudo={pseudo}>
      <nav className={styles.subnav} aria-label="Parts of the course">
        <div className={`container ${styles.subnavInner}`}>
          <a href={window.location.pathname} className={styles.subnavLink} aria-current={part === 'start' ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go('start') }}>Overview</a>
          {PARTS.map((p, i) => (
            <a key={p.id} href={`#${p.id}`} className={styles.subnavLink} aria-current={part === p.id ? 'page' : undefined} onClick={(e) => { e.preventDefault(); go(p.id) }}>
              {i + 1}. {p.label}
            </a>
          ))}
          <button type="button" className={styles.fullButton} aria-pressed={full} onClick={toggleFull} title={full ? 'Leave full screen (Esc)' : 'Full screen'}>
            {full ? <Minimize2 size={16} aria-hidden="true" /> : <Maximize2 size={16} aria-hidden="true" />}
            {full ? 'Exit full screen' : 'Full screen'}
          </button>
        </div>
      </nav>

      {!current && (
        <section className={styles.hero}>
          <div className="container">
            <p className={styles.eyebrow}>FPV piloting</p>
            <h1 className={styles.title}>Learn to fly FPV, mode by mode</h1>
            <p className={styles.subtitle}>
              Six short parts. Open one, work through it, and press Next when you are ready for the next one. Start with what a flight mode is, then practise, learn every stick move, and build the speed, focus and decisions that fast flying needs.
            </p>
            <div className={styles.paths}>
              {PARTS.map((p, i) => (
                <a key={p.id} href={`#${p.id}`} className={styles.path} onClick={(e) => { e.preventDefault(); go(p.id) }}>
                  <span className={styles.pathNum}>{i + 1}</span>
                  <span className={styles.pathTitle}>{p.label}</span>
                  <span className={styles.pathText}>{p.text}</span>
                </a>
              ))}
            </div>
            <button type="button" className={styles.start} onClick={() => go(PARTS[0].id)}>
              Start with part 1 <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {current && (
        <>
          <h1 className="sr-only">FPV piloting, part {index + 1}: {current.label}</h1>
          <current.View />
          <div className={`container ${styles.pager}`}>
            {before ? (
              <button type="button" onClick={() => go(before.id)}><ArrowLeft size={16} aria-hidden="true" /> Part {index}: {before.label}</button>
            ) : (
              <button type="button" onClick={() => go('start')}><ArrowLeft size={16} aria-hidden="true" /> Overview</button>
            )}
            {after ? (
              <button type="button" className={styles.pagerNext} onClick={() => go(after.id)}>Part {index + 2}: {after.label} <ArrowRight size={16} aria-hidden="true" /></button>
            ) : (
              <button type="button" className={styles.pagerNext} onClick={() => go('start')}>Back to the overview <ArrowRight size={16} aria-hidden="true" /></button>
            )}
          </div>
        </>
      )}

      <p className={styles.foot}>Learn in a simulator first, then fly in a large open area where it is legal and safe, away from people. The numbers on this page are simple models for learning.</p>
      </div>
    </PageWrapper>
  )
}
