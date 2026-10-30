import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import useDocumentMeta from '@lib/useDocumentMeta'
import { GATES } from '@config/gates'
import { useAuthStore } from '@store/useAuthStore'
import MemberAuthCard from './MemberAuthCard.jsx'
import styles from './RequireMember.module.css'

function GatePage({ info }) {
  const location = useLocation()
  const navigate = useNavigate()
  useDocumentMeta(`${info.title} | EGIRE Robotics`, info.blurb)
  const next = `${location.pathname}${location.search}`
  const done = useCallback(() => navigate(next, { replace: true }), [navigate, next])
  return (
    <PageWrapper>
      <section className={styles.gate}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.copy}>
            <p className={styles.kicker}><Lock size={14} aria-hidden="true" /> Academy · free with sign-in</p>
            <h1 className={styles.title}>{info.title}</h1>
            <p className={styles.blurb}>{info.blurb}</p>
            {info.bullets.length > 0 && <ul className={styles.bullets}>{info.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
            <p className={styles.free}>Registering is free. You only need to sign in once.</p>
          </div>
          <MemberAuthCard next={next} onSignedIn={done} />
        </div>
      </section>
    </PageWrapper>
  )
}

// Wraps an Academy page. A signed-in member with a name and college sees the page. Anyone else sees the header, a short teaser
// and the sign-in card. This is a gate on a static site: it keeps the lessons from ordinary visitors, but it is not file-level
// access control for anything in the public bundle.
// The gate is switched on with VITE_MEMBER_GATE=on (set in vercel.json when sign-in has been checked end to end). Until then every page stays open.
const GATE_ON = import.meta.env.VITE_MEMBER_GATE === 'on'

export default function RequireMember({ gate, children }) {
  if (!GATE_ON) return children
  const status = useAuthStore((s) => s.status)
  const init = useAuthStore((s) => s.init)
  const info = GATES[gate] ?? { title: 'Academy', blurb: 'Sign in to open this page.', bullets: [] }
  useEffect(() => { void init() }, [init])
  if (status === 'ready') return children
  if (status === 'loading') return <div className={styles.loading} role="status">Loading…</div>
  return <GatePage info={info} />
}
