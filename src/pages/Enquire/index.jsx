import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Building2, CheckCircle2, GraduationCap, MessageCircle, Phone, Mail, PlayCircle } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import { CONTACT_EMAIL, CONTACT_PHONE, FEES, WHATSAPP } from '@config/constants'
import { submitEnquiry } from '@lib/siteApi'
import useDocumentMeta from '@lib/useDocumentMeta'
import styles from './Enquire.module.css'

const KINDS = [
  { id: 'student', icon: <GraduationCap size={20} />, label: 'Student or parent' },
  { id: 'college', icon: <Building2 size={20} />, label: 'College or university' },
  { id: 'demo', icon: <PlayCircle size={20} />, label: 'Demo session' },
  { id: 'general', icon: <MessageCircle size={20} />, label: 'Something else' },
]

const INTERESTS = [
  'Not sure yet',
  'EGIRE Robotics Special Course (90 days)',
  'Simulation Skill workshop (Grade 3)',
  'Moderate Skill workshop (Grade 2)',
  'Professional workshop (Grade 1)',
  'Cinematography',
  'Agriculture',
  '3D mapping, LiDAR and GIS',
  'Racing training',
  'Surveillance and security',
  'AI and robotics',
  'College projects',
]

const digitsOf = (value) => value.replace(/\D/g, '')

export default function Enquire() {
  useDocumentMeta('Enquire | EGIRE Robotics', 'Register for a workshop, book a demo session, or ask about bringing EGIRE Robotics to your college.')

  const [params] = useSearchParams()
  const initialKind = KINDS.some((k) => k.id === params.get('type')) ? params.get('type') : 'student'
  const [kind, setKind] = useState(initialKind)
  const [form, setForm] = useState({ name: '', phone: '', email: '', organisation: '', interest: '', message: '', website: '' })
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState('idle') // idle | sending | done
  const [error, setError] = useState('')

  const isCollege = kind === 'college'
  const sourcePage = useMemo(() => `/enquire${params.get('from') ? `?from=${params.get('from')}` : ''}`.slice(0, 200), [params])
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return setError('Please enter your name.')
    const phoneDigits = digitsOf(form.phone)
    if (!form.phone.trim() && !form.email.trim()) return setError('Please give a phone number or an email so we can reach you.')
    if (form.phone.trim() && (phoneDigits.length < 7 || phoneDigits.length > 15)) return setError('Please enter a valid phone number.')
    if (isCollege && !form.organisation.trim()) return setError('Please enter your college or university.')
    if (!consent) return setError('Please agree to be contacted about this enquiry.')

    setState('sending')
    try {
      await submitEnquiry({
        kind,
        full_name: form.name,
        phone: form.phone,
        email: form.email,
        organisation: form.organisation,
        interest: form.interest,
        message: form.message,
        consent: true,
        source_page: sourcePage,
        website: form.website, // honeypot: left empty by real visitors
      })
      setState('done')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setState('idle')
      setError(err.message || `We could not send your enquiry. Please call ${CONTACT_PHONE.display}.`)
    }
  }

  if (state === 'done') {
    return (
      <PageWrapper>
        <div className={styles.page}>
          <div className={`container ${styles.doneWrap}`}>
            <CheckCircle2 size={48} className={styles.doneIcon} aria-hidden="true" />
            <h1 className={styles.title}>Thank you, {form.name.trim().split(' ')[0]}</h1>
            <p className={styles.lead}>
              We have your enquiry. Someone from the EGIRE Robotics team will call or email you to talk about the right program.
            </p>
            <p className={styles.note}>
              In a hurry? Call <a href={CONTACT_PHONE.href}>{CONTACT_PHONE.display}</a>.
            </p>
            <Link to="/" className={styles.homeLink}>
              Back to the home page
            </Link>
          </div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper>
      <div className={styles.page}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Enquire</p>
            <h1 className={styles.title}>Tell us what you are looking for</h1>
            <p className={styles.lead}>
              Register for a workshop, book a demo session, or ask about bringing EGIRE Robotics to your college. We read every enquiry and get back to you.
            </p>

            <h2 className={styles.sideHeading}>What happens next</h2>
            <ol className={styles.steps}>
              <li>You send this form.</li>
              <li>We call or email you to understand your goal.</li>
              <li>We suggest the right program, dates and fees.</li>
            </ol>
            <p className={styles.fees}>
              Fees start from {FEES.workshopFrom} per person. A demo session is {FEES.demo}.
            </p>

            <h2 className={styles.sideHeading}>Prefer to talk?</h2>
            <ul className={styles.contactList}>
              <li>
                <Phone size={16} aria-hidden="true" /> <a href={CONTACT_PHONE.href}>{CONTACT_PHONE.display}</a>
              </li>
              <li>
                <MessageCircle size={16} aria-hidden="true" />{' '}
                <a href={WHATSAPP.href} target="_blank" rel="noopener noreferrer">WhatsApp {WHATSAPP.display}</a>
              </li>
              <li>
                <Mail size={16} aria-hidden="true" /> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
              </li>
            </ul>
          </div>

          <form className={styles.form} onSubmit={submit} noValidate>
            <fieldset className={styles.kinds}>
              <legend className={styles.legend}>I am a</legend>
              <div className={styles.kindGrid}>
                {KINDS.map((k) => (
                  <label key={k.id} className={`${styles.kind} ${kind === k.id ? styles.kindActive : ''}`}>
                    <input type="radio" name="kind" value={k.id} checked={kind === k.id} onChange={() => setKind(k.id)} className={styles.radio} />
                    {k.icon}
                    <span>{k.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.label}>Your name <em>required</em></span>
                <input type="text" value={form.name} onChange={set('name')} maxLength={120} autoComplete="name" required />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>Phone <em>or email</em></span>
                <input type="tel" value={form.phone} onChange={set('phone')} maxLength={20} autoComplete="tel" placeholder="+91" />
              </label>
            </div>

            <div className={styles.row}>
              <label className={styles.field}>
                <span className={styles.label}>Email</span>
                <input type="email" value={form.email} onChange={set('email')} maxLength={200} autoComplete="email" />
              </label>
              <label className={styles.field}>
                <span className={styles.label}>
                  {isCollege ? 'College or university' : 'School or college'} {isCollege ? <em>required</em> : <em>optional</em>}
                </span>
                <input type="text" value={form.organisation} onChange={set('organisation')} maxLength={200} autoComplete="organization" />
              </label>
            </div>

            <label className={styles.field}>
              <span className={styles.label}>What are you interested in?</span>
              <select value={form.interest} onChange={set('interest')}>
                <option value="">Choose one</option>
                {INTERESTS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>{isCollege ? 'Number of students and preferred dates' : 'Anything we should know?'} <em>optional</em></span>
              <textarea value={form.message} onChange={set('message')} rows={4} maxLength={2000} />
            </label>

            {/* Honeypot: hidden from people, filled in by bots */}
            <div className={styles.trap} aria-hidden="true">
              <label>
                Leave this empty
                <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
              </label>
            </div>

            <label className={styles.consent}>
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>
                I agree that EGIRE Robotics may contact me about this enquiry. See the <Link to="/privacy">privacy policy</Link>.
              </span>
            </label>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button type="submit" className={styles.submit} disabled={state === 'sending'}>
              {state === 'sending' ? 'Sending...' : 'Send enquiry'}
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  )
}
