import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Lock } from 'lucide-react'
import useDocumentMeta from '@lib/useDocumentMeta'
import { GATES } from '@config/gates'
import { useAuthStore } from '@store/useAuthStore'
import Loader from '@components/ui/Loader'
import MemberAuthCard from './MemberAuthCard.jsx'
import styles from './RequireMember.module.css'

// The sign-in popup that sits over an Academy page. The page behind it is the real page, shown only as far as the first screen and
// blurred, so a visitor sees what they are about to open. The header above stays clear and usable.
function SignInPopup({ info }) {
  const calm = useReducedMotion()
  const location = useLocation()
  const navigate = useNavigate()
  const overlayRef = useRef(null)
  const [top, setTop] = useState(140)
  const next = `${location.pathname}${location.search}`
  const done = useCallback(() => navigate(next, { replace: true }), [navigate, next])
  useDocumentMeta(`${info.title} | EGIRE Robotics`, info.blurb)

  // the popup starts where the header ends, so the header is never covered or blurred
  useLayoutEffect(() => {
    const measure = () => {
      const header = document.querySelector('header')
      setTop(Math.round(header ? header.getBoundingClientRect().bottom : 140))
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // nothing scrolls behind the popup, and focus starts inside it
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.scrollTo(0, 0)
    overlayRef.current?.querySelector('input, button')?.focus({ preventScroll: true })
    return () => { document.body.style.overflow = previous }
  }, [])

  return (
    <div ref={overlayRef} className={styles.overlay} style={{ '--gate-top': `${top}px` }}>
      <motion.div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gate-title"
        initial={calm ? false : { opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <aside className={styles.aside}>
          <img className={styles.logo} src="/images/logo-egire-robotics.png" alt="EGIRE Robotics" width="141" height="48" />
          <p className={styles.kicker}><Lock size={14} aria-hidden="true" /> Academy · free to join</p>
          <h1 id="gate-title" className={styles.title}>Sign in or register to open {info.title}</h1>
          <p className={styles.blurb}>{info.blurb}</p>
          {info.bullets.length > 0 && (
            <ul className={styles.bullets}>
              {info.bullets.map((b) => <li key={b}><CheckCircle2 size={16} aria-hidden="true" /> {b}</li>)}
            </ul>
          )}
          <p className={styles.free}>Registering is free and takes a minute. You only do it once.</p>
          <Link to="/" className={styles.back}>Back to the home page</Link>
        </aside>
        <MemberAuthCard next={next} onSignedIn={done} bare />
      </motion.div>
    </div>
  )
}

function Gate({ gate, children }) {
  const status = useAuthStore((s) => s.status)
  const init = useAuthStore((s) => s.init)
  const info = GATES[gate] ?? { title: 'the Academy', blurb: 'Sign in to open this page.', bullets: [] }
  useEffect(() => { void init() }, [init])
  if (status === 'ready') return children
  if (status === 'loading') return <Loader />
  return (
    <>
      <div className={styles.preview} aria-hidden="true">{children}</div>
      <SignInPopup info={info} />
    </>
  )
}

// Wraps an Academy page. A signed-in member with a name and college sees the page. Anyone else sees the header, the first screen of the
// page blurred, and a sign-in popup. This is a gate on a static site: it keeps the lessons from ordinary visitors, but it is not
// file-level access control for anything in the public bundle.
// The gate is switched on with VITE_MEMBER_GATE=on (set in vercel.json). Without it every page stays open.
const GATE_ON = import.meta.env.VITE_MEMBER_GATE === 'on'

export default function RequireMember({ gate, children }) {
  return GATE_ON ? <Gate gate={gate}>{children}</Gate> : children
}
