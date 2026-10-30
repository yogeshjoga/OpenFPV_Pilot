import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@store/useAuthStore'
import { sendLoginCode } from '@lib/memberApi'
import { authConfigured } from '@lib/supabaseClient'
import Turnstile, { TURNSTILE_SITE_KEY } from './Turnstile.jsx'
import styles from './MemberAuthCard.module.css'

const CRM_URL = import.meta.env.VITE_CRM_LOGIN_URL

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.3 0 11.7-2.1 15.6-5.7l-7.5-5.8c-2.1 1.4-4.8 2.3-8.1 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  )
}

// the one-time question after the first sign-in: name, college, and (if they were in one) the workshop
function ProfileStep({ onDone }) {
  const profile = useAuthStore((s) => s.profile)
  const completeProfile = useAuthStore((s) => s.completeProfile)
  const loadWorkshops = useAuthStore((s) => s.loadWorkshops)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [college, setCollege] = useState(profile?.college_name ?? '')
  const [inWorkshop, setInWorkshop] = useState(false)
  const [workshops, setWorkshops] = useState([])
  const [workshopId, setWorkshopId] = useState('')
  const [otherName, setOtherName] = useState('')
  const [otherDate, setOtherDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!inWorkshop || workshops.length) return
    loadWorkshops().then(setWorkshops).catch(() => setWorkshops([]))
  }, [inWorkshop, workshops.length, loadWorkshops])

  const other = workshopId === 'other' || (inWorkshop && workshops.length === 0)
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (college.trim().length < 2) return setError('Please enter your college name.')
    if (inWorkshop && other && !otherName.trim()) return setError('Please enter the workshop name.')
    if (inWorkshop && !other && !workshopId) return setError('Please choose your workshop.')
    setBusy(true)
    try {
      await completeProfile({
        fullName: fullName.trim(),
        college: college.trim(),
        workshopId: inWorkshop && !other ? workshopId : null,
        workshopName: inWorkshop && other ? otherName.trim() : '',
        workshopDate: inWorkshop && other ? otherDate : '',
      })
      onDone?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className={styles.form}>
      <h2 className={styles.title}>One last step</h2>
      <p className={styles.lead}>Tell us who you are. It is free, and you only do this once.</p>
      <label className={styles.field}>
        <span>Your name</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required maxLength={120} />
      </label>
      <label className={styles.field}>
        <span>College name</span>
        <input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="The college or university you study at" autoComplete="organization" required maxLength={160} />
      </label>
      <label className={styles.check}>
        <input type="checkbox" checked={inWorkshop} onChange={(e) => setInWorkshop(e.target.checked)} />
        <span>I took part in an EGIRE workshop</span>
      </label>
      {inWorkshop && (
        <div className={styles.workshop}>
          {workshops.length > 0 && (
            <label className={styles.field}>
              <span>Which workshop?</span>
              <select value={workshopId} onChange={(e) => setWorkshopId(e.target.value)}>
                <option value="">Choose a workshop</option>
                {workshops.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}{w.starts_on ? ` · ${w.starts_on}` : ''}</option>
                ))}
                <option value="other">My workshop is not listed</option>
              </select>
            </label>
          )}
          {other && (
            <>
              <label className={styles.field}>
                <span>Workshop name</span>
                <input value={otherName} onChange={(e) => setOtherName(e.target.value)} maxLength={160} />
              </label>
              <label className={styles.field}>
                <span>Workshop date</span>
                <input type="date" value={otherDate} onChange={(e) => setOtherDate(e.target.value)} />
              </label>
            </>
          )}
          <p className={styles.note}>Our team checks this before it is confirmed.</p>
        </div>
      )}
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button type="submit" className={styles.primary} disabled={busy}>
        {busy ? 'Saving…' : 'Continue'} <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  )
}

// Sign in or register: Google, or a code by email. The same card is used on the sign-in page and on every gated page.
export default function MemberAuthCard({ next = '/', onSignedIn, bare = false }) {
  const cardClass = bare ? `${styles.card} ${styles.bare}` : styles.card
  const status = useAuthStore((s) => s.status)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const signInWithCode = useAuthStore((s) => s.signInWithCode)
  const [step, setStep] = useState('start') // start | code
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [captcha, setCaptcha] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (wait <= 0) return undefined
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  useEffect(() => { if (status === 'ready') onSignedIn?.() }, [status, onSignedIn])

  if (!authConfigured) return <p className={styles.error}>Sign-in is not available right now. Please call us.</p>
  if (status === 'incomplete') return <div className={cardClass}><ProfileStep onDone={onSignedIn} /></div>
  if (status === 'ready') return <div className={cardClass}><p className={styles.lead}>You are signed in.</p></div>

  const askForCode = async (e) => {
    e?.preventDefault()
    setError('')
    if (TURNSTILE_SITE_KEY && !captcha) return setError('Please complete the human check.')
    setBusy(true)
    try {
      await sendLoginCode(email.trim(), { captcha, website: honeypot })
      setStep('code')
      setCode('')
      setWait(30)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const checkCode = async (value) => {
    setError('')
    setBusy(true)
    try {
      await signInWithCode(email.trim(), value)
    } catch (err) {
      setError(err.message)
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  const google = async () => {
    setError('')
    try {
      await signInWithGoogle(next)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className={cardClass}>
      {step === 'start' ? (
        <form onSubmit={askForCode} className={styles.form}>
          <h2 className={styles.title}>Sign in or register</h2>
          <p className={styles.lead}>It is free. Use Google, or we email you a short code. No password.</p>
          <button type="button" className={styles.google} onClick={google}>
            <GoogleMark /> Continue with Google
          </button>
          <div className={styles.or}><span>or</span></div>
          <label className={styles.field}>
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required maxLength={254} />
          </label>
          {/* a trap for automated form fillers: people never see or fill it */}
          <input className={styles.trap} tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
          <Turnstile onToken={setCaptcha} />
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary} disabled={busy || !email}>
            <Mail size={18} aria-hidden="true" /> {busy ? 'Sending…' : 'Email me a code'}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (code.length === 6) checkCode(code) }} className={styles.form}>
          <h2 className={styles.title}>Check your email</h2>
          <p className={styles.lead}>We sent a 6-digit code to <b>{email}</b>. It works for 10 minutes.</p>
          <label className={styles.field}>
            <span>6-digit code</span>
            <input
              className={styles.codeInput}
              value={code}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                setCode(v)
                if (v.length === 6) checkCode(v)
              }}
            />
          </label>
          {error && <p className={styles.error} role="alert">{error}</p>}
          <button type="submit" className={styles.primary} disabled={busy || code.length !== 6}>
            {busy ? 'Checking…' : 'Sign in'} <ArrowRight size={18} aria-hidden="true" />
          </button>
          <div className={styles.links}>
            <button type="button" onClick={() => { setStep('start'); setError('') }}>Use a different email</button>
            <button type="button" onClick={askForCode} disabled={wait > 0 || busy}>{wait > 0 ? `Send again in ${wait}s` : 'Send the code again'}</button>
          </div>
        </form>
      )}
      <p className={styles.fine}>
        <ShieldCheck size={14} aria-hidden="true" /> By continuing you agree to our <Link to="/privacy">privacy notice</Link>.
        {CRM_URL && <> Staff and CRM students: <a href={CRM_URL}>sign in to the CRM</a>.</>}
      </p>
    </div>
  )
}
