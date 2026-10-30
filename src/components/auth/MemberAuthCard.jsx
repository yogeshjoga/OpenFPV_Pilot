import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '@store/useAuthStore'
import { EXPERIENCE, HEARD_FROM, LOOKING_FOR, ROLES } from '@config/onboarding'
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

// the one-time questions after the first sign-in: who they are, how they found us, what they want
function ProfileStep({ onDone }) {
  const profile = useAuthStore((s) => s.profile)
  const completeProfile = useAuthStore((s) => s.completeProfile)
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [college, setCollege] = useState(profile?.college_name ?? '')
  const [role, setRole] = useState('')
  const [heardFrom, setHeardFrom] = useState('')
  const [heardOther, setHeardOther] = useState('')
  const [lookingFor, setLookingFor] = useState([])
  const [experience, setExperience] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const toggle = (value) => setLookingFor((list) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]))
  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (college.trim().length < 2) return setError('Please enter your college or company name.')
    if (!role) return setError('Please choose what describes you best.')
    if (!heardFrom) return setError('Please tell us how you found us.')
    setBusy(true)
    try {
      await completeProfile({ fullName: fullName.trim(), college: college.trim(), heardFrom, heardOther: heardOther.trim(), role, lookingFor, experience, phone: phone.trim() })
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
      <p className={styles.lead}>A few quick questions so we can help you better. It is free, and you only do this once.</p>
      <label className={styles.field}>
        <span>Your name</span>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required maxLength={120} />
      </label>
      <label className={styles.field}>
        <span>College or company</span>
        <input value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Where you study or work" autoComplete="organization" required maxLength={160} />
      </label>
      <label className={styles.field}>
        <span>Which describes you best?</span>
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value="">Choose one</option>
          {ROLES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span>How did you find us?</span>
        <select value={heardFrom} onChange={(e) => setHeardFrom(e.target.value)} required>
          <option value="">Choose one</option>
          {HEARD_FROM.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      {heardFrom === 'other' && (
        <label className={styles.field}>
          <span>Where?</span>
          <input value={heardOther} onChange={(e) => setHeardOther(e.target.value)} maxLength={80} />
        </label>
      )}
      <fieldset className={styles.group}>
        <legend>What are you looking for? <small>(pick any)</small></legend>
        <div className={styles.chips}>
          {LOOKING_FOR.map((o) => (
            <label key={o.value} className={styles.chip} data-on={lookingFor.includes(o.value)}>
              <input type="checkbox" checked={lookingFor.includes(o.value)} onChange={() => toggle(o.value)} />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
      <label className={styles.field}>
        <span>Your drone experience <small>(optional)</small></span>
        <select value={experience} onChange={(e) => setExperience(e.target.value)}>
          <option value="">Choose one</option>
          {EXPERIENCE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </label>
      <label className={styles.field}>
        <span>Phone or WhatsApp <small>(optional)</small></span>
        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91" autoComplete="tel" maxLength={20} />
      </label>
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
