import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, PhoneOff, X, MessageCircle } from 'lucide-react'
import { trackEvent } from '@lib/analytics'
import styles from './VoiceAgentWidget.module.css'

// The voice agent server (E:\EgireRobotics_voice_agent, deployed on Vercel). Without it the widget stays hidden.
const AGENT_URL = (import.meta.env.VITE_VOICE_AGENT_URL || '').replace(/\/+$/, '')
const wsUrl = (language, voice) =>
  `${AGENT_URL.replace(/^http/, 'ws')}/ws/web?language=${language}&voice=${voice}&page=${encodeURIComponent(window.location.pathname)}`

// Shown until the server says otherwise. The founder's voice appears only while it is switched on in the CRM.
const DEFAULT_VOICES = [{ id: 'priya', label: 'Priya', sub: 'AI assistant' }]
const ASSISTANT_TEXT = {
  priya: { title: 'Talk to Priya', sub: 'EGIRE Robotics AI assistant' },
  founder: { title: "Talk to Yogesh's assistant", sub: "AI assistant · in the founder's voice" },
}

const LANGUAGES = [
  { code: 'te', label: 'తెలుగు' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'en', label: 'English' },
]

const STATUS_TEXT = {
  idle: 'Choose a language and start',
  connecting: 'Connecting…',
  listening: 'Listening',
  speaking: 'Speaking',
  ended: 'Conversation ended',
}

const clock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/** "Talk to us": a voice conversation with the EGIRE Robotics AI assistant — Priya, or in Yogesh's own voice — with a WhatsApp handoff to enroll. */
export default function VoiceAgentWidget() {
  const [open, setOpen] = useState(false)
  const [language, setLanguage] = useState('te')
  const [voices, setVoices] = useState(DEFAULT_VOICES)
  const [voice, setVoice] = useState('priya')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [muted, setMuted] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const clientRef = useRef(null)
  const orbRef = useRef(null)
  const statusRef = useRef('idle')

  const live = status === 'connecting' || status === 'listening' || status === 'speaking'

  useEffect(() => { statusRef.current = status }, [status])

  // A sleeping agent takes several seconds to wake on Vercel, so wake it quietly once the page has settled.
  useEffect(() => {
    if (!AGENT_URL) return undefined
    const t = setTimeout(() => { void fetch(`${AGENT_URL}/voice-options`).catch(() => {}) }, 2500)
    return () => clearTimeout(t)
  }, [])

  // Ask the server which voices are on each time the panel opens.
  useEffect(() => {
    if (!open || !AGENT_URL) return undefined
    let gone = false
    fetch(`${AGENT_URL}/voice-options`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (gone || !Array.isArray(d?.voices) || !d.voices.length) return
        setVoices(d.voices)
        setVoice((v) => (d.voices.some((x) => x.id === v) ? v : d.voices[0].id))
      })
      .catch(() => {})
    return () => { gone = true }
  }, [open])

  // Call timer while connected.
  useEffect(() => {
    if (status !== 'listening' && status !== 'speaking') return undefined
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [status])

  // Audio level drives the rings around the logo, written straight to CSS so React doesn't re-render per frame.
  const setLevel = useCallback((level) => {
    orbRef.current?.style.setProperty('--level', Math.min(1, level * 4).toFixed(3))
  }, [])

  const stop = useCallback(async () => {
    const client = clientRef.current
    clientRef.current = null
    if (client) {
      try { await client.disconnect() } catch { /* already closed */ }
    }
  }, [])

  useEffect(() => () => { void stop() }, [stop])

  const start = async () => {
    setError('')
    setWhatsappUrl('')
    setMuted(false)
    setSeconds(0)
    setStatus('connecting')
    trackEvent('voice_agent_start', { language, voice })
    try {
      const [{ PipecatClient }, { WebSocketTransport, ProtobufFrameSerializer }] = await Promise.all([
        import('@pipecat-ai/client-js'),
        import('@pipecat-ai/websocket-transport'),
      ])
      const client = new PipecatClient({
        transport: new WebSocketTransport({
          serializer: new ProtobufFrameSerializer(),
          recorderSampleRate: 16000,
          playerSampleRate: 24000,
        }),
        enableMic: true,
        enableCam: false,
        callbacks: {
          onBotReady: () => setStatus('listening'),
          onBotStartedSpeaking: () => setStatus('speaking'),
          onBotStoppedSpeaking: () => { setStatus('listening'); setLevel(0) },
          onDisconnected: () => {
            clientRef.current = null
            setLevel(0)
            setStatus('ended')
          },
          onRemoteAudioLevel: (level) => { if (statusRef.current === 'speaking') setLevel(level) },
          onLocalAudioLevel: (level) => { if (statusRef.current === 'listening') setLevel(level) },
          onServerMessage: (data) => {
            // Only ever a wa.me link to our own number, built by the server.
            if (data?.type === 'whatsapp' && typeof data.url === 'string' && data.url.startsWith('https://wa.me/')) {
              setWhatsappUrl(data.url)
              trackEvent('voice_agent_whatsapp_offered', { language })
            }
          },
          onError: () => setError('Something went wrong. Please try again.'),
        },
      })
      clientRef.current = client
      await client.connect({ wsUrl: wsUrl(language, voice) })
    } catch (e) {
      clientRef.current = null
      setStatus('idle')
      const msg = String(e?.message || e || '')
      setError(
        /permission|NotAllowed|denied/i.test(msg)
          ? 'Please allow microphone access to talk to us.'
          : /429|busy|503/.test(msg)
            ? 'Our assistant is busy right now. Please message us on WhatsApp.'
            : 'Could not connect. Please try again, or message us on WhatsApp.',
      )
    }
  }

  const toggleMute = () => {
    const next = !muted
    clientRef.current?.enableMic(!next)
    setMuted(next)
  }

  const close = () => {
    void stop()
    setOpen(false)
    setStatus('idle')
  }

  if (!AGENT_URL) return null

  const who = ASSISTANT_TEXT[voice] || ASSISTANT_TEXT.priya

  return (
    <>
      {!open && (
        <button type="button" className={styles.launcher} onClick={() => setOpen(true)} aria-label="Talk to our voice assistant">
          <span className={styles.launcherMark}>
            <img src="/icon-192.png" alt="" width="28" height="28" />
          </span>
          <span className={styles.launcherText}>
            <span className={styles.launcherTitle}>Talk to us</span>
            <span className={styles.launcherSub}>Voice assistant</span>
          </span>
        </button>
      )}

      {open && (
        <section className={styles.panel} aria-label={who.title}>
          <header className={styles.header}>
            <div className={styles.brand}>
              <img src="/icon-192.png" alt="" width="32" height="32" className={styles.brandMark} />
              <div>
                <p className={styles.brandName}>EGIRE Robotics</p>
                <p className={styles.brandSub}>
                  <span className={styles.online} aria-hidden="true" /> {who.sub}
                </p>
              </div>
            </div>
            <button type="button" className={styles.iconButton} onClick={close} aria-label="Close">
              <X size={18} aria-hidden="true" />
            </button>
          </header>

          <div className={styles.stage}>
            <div ref={orbRef} className={`${styles.orb} ${styles[status] || ''}`}>
              <span className={styles.ring} aria-hidden="true" />
              <span className={styles.ring2} aria-hidden="true" />
              <span className={styles.core}>
                <img src="/icon-192.png" alt="" width="64" height="64" />
              </span>
            </div>
            <p className={styles.status} aria-live="polite">{STATUS_TEXT[status]}</p>
            <p className={styles.meta}>
              {live && status !== 'connecting'
                ? clock(seconds)
                : 'Workshops, fees, demos and enrolment'}
            </p>
          </div>

          {!live && voices.length > 1 && (
            <div className={styles.voices} role="radiogroup" aria-label="Voice">
              {voices.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={voice === v.id}
                  className={`${styles.voiceOption} ${voice === v.id ? styles.voiceActive : ''}`}
                  onClick={() => setVoice(v.id)}
                >
                  <span className={styles.voiceName}>{v.label}</span>
                  <span className={styles.voiceSub}>{v.sub}</span>
                </button>
              ))}
            </div>
          )}

          {!live && (
            <div className={styles.languages} role="radiogroup" aria-label="Language">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="radio"
                  aria-checked={language === l.code}
                  className={`${styles.chip} ${language === l.code ? styles.chipActive : ''}`}
                  onClick={() => setLanguage(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}

          {whatsappUrl && (
            <a
              className={styles.whatsapp}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent('voice_agent_whatsapp_click', { language })}
            >
              <MessageCircle size={18} aria-hidden="true" /> Continue on WhatsApp to enrol
            </a>
          )}

          {error && <p className={styles.error} role="alert">{error}</p>}

          {!live ? (
            <button type="button" className={styles.primary} onClick={start}>
              <Mic size={16} aria-hidden="true" /> {status === 'ended' ? 'Start again' : 'Start conversation'}
            </button>
          ) : (
            <div className={styles.controls}>
              <button
                type="button"
                className={`${styles.round} ${muted ? styles.roundOn : ''}`}
                onClick={toggleMute}
                disabled={status === 'connecting'}
                aria-label={muted ? 'Unmute microphone' : 'Mute microphone'}
                aria-pressed={muted}
              >
                {muted ? <MicOff size={20} aria-hidden="true" /> : <Mic size={20} aria-hidden="true" />}
              </button>
              <button type="button" className={`${styles.round} ${styles.hangup}`} onClick={() => void stop()} aria-label="End conversation">
                <PhoneOff size={20} aria-hidden="true" />
              </button>
            </div>
          )}

          <p className={styles.fine}>{voice === 'founder' ? "An AI assistant in Yogesh's voice. " : ''}Uses your microphone. Conversations are recorded so our team can follow up.</p>
        </section>
      )}
    </>
  )
}
