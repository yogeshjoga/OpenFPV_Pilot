// Privacy-first page analytics for the website. No cookies and no IP address are stored; the server keeps a daily-rotating hash.
// What is sent: the page, where the visit came from, the device and browser, rough location (country, region, city), clicks on
// buttons and links (their label, never what a person types), scroll depth and time on the site. A browser that asks not to be
// tracked (Do Not Track) sends nothing.
import { anonKey, authConfigured } from './supabaseClient.js'

const URL = import.meta.env.VITE_SUPABASE_URL
const ON = import.meta.env.VITE_ANALYTICS !== 'off'

let visitId = null
let starting = null
let started = false
let sent = 0
let lastClick = 0
const seen = { pointer: false, keys: false, scroll: 0 }

const sessionKey = () => {
  try {
    let key = sessionStorage.getItem('egire-sk')
    if (!key) {
      const bytes = crypto.getRandomValues(new Uint8Array(12))
      key = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
      sessionStorage.setItem('egire-sk', key)
    }
    return key
  } catch {
    return `t${Math.random().toString(36).slice(2, 14)}`
  }
}

// a signed-in person's token lets the server link the visit to the member
const bearer = () => {
  try {
    const raw = localStorage.getItem('egire-site-auth')
    const token = raw ? JSON.parse(raw)?.access_token : ''
    if (token) return token
  } catch { /* use the public key */ }
  return anonKey
}

async function call(name, body, { keepalive = false } = {}) {
  const res = await fetch(`${URL}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: anonKey, Authorization: `Bearer ${bearer()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p: body }),
    keepalive,
  })
  if (!res.ok) throw new Error(String(res.status))
  return res.json().catch(() => null)
}

const enabled = () =>
  ON && authConfigured && typeof window !== 'undefined' && navigator.doNotTrack !== '1' && !/^(localhost|127\.|\[::1\])/.test(window.location.hostname)

async function place() {
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 2500)
    const res = await fetch('/api/geo', { signal: ctrl.signal })
    clearTimeout(t)
    return res.ok ? await res.json() : {}
  } catch {
    return {}
  }
}

const host = (value) => {
  try { return new window.URL(value).hostname.replace(/^www\./, '') } catch { return '' }
}

async function begin() {
  const params = new URLSearchParams(window.location.search)
  const refHost = host(document.referrer)
  const own = host(window.location.href)
  const geo = await place()
  const id = await call('track_visit', {
    session: sessionKey(),
    path: window.location.pathname,
    referrer_host: refHost && refHost !== own ? refHost : '',
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    language: navigator.language || '',
    geo,
    signals: { webdriver: Boolean(navigator.webdriver) },
  })
  visitId = typeof id === 'string' ? id : null
}

/** Records a page view. The first call starts the visit. */
export function trackPage(path) {
  if (!enabled()) return
  if (!started) {
    started = true
    starting = begin().catch(() => {})
    return
  }
  void event('page', { path })
}

async function event(kind, { path = window.location.pathname, target = '', label = '' } = {}) {
  if (!enabled() || sent > 250) return
  await starting
  if (!visitId) return
  sent += 1
  try {
    await call('track_event', { visit: visitId, kind, path, target, label, pointer: seen.pointer, keys: seen.keys, scroll: seen.scroll, webdriver: Boolean(navigator.webdriver) })
  } catch { /* analytics must never get in the way */ }
}

export const trackEvent = (kind, details) => { void event(kind, details) }

function describe(el) {
  const link = el.closest('a[href]')
  const button = el.closest('button, [role="button"]')
  const node = link || button
  if (!node) return null
  const text = (node.getAttribute('aria-label') || node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50)
  if (link) {
    const href = link.getAttribute('href') || ''
    const where = href.startsWith('/') ? href.split('?')[0] : host(href) || 'link'
    return { target: `link: ${text || where}`.slice(0, 80), label: where.slice(0, 80) }
  }
  return text ? { target: `button: ${text}`.slice(0, 80), label: '' } : null
}

/** Starts listening for clicks, scrolling and the signs that a real person is using the page. */
export function startAnalytics() {
  if (!enabled() || window.__egireTracking) return
  window.__egireTracking = true
  const onClick = (e) => {
    const now = Date.now()
    if (now - lastClick < 250) return
    lastClick = now
    seen.pointer = true
    const d = e.target instanceof Element ? describe(e.target) : null
    if (d) trackEvent('click', d)
  }
  document.addEventListener('click', onClick, { capture: true, passive: true })
  const mark = () => { seen.pointer = true }
  window.addEventListener('pointermove', mark, { once: true, passive: true })
  window.addEventListener('touchstart', mark, { once: true, passive: true })
  window.addEventListener('keydown', () => { seen.keys = true }, { once: true, passive: true })
  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (max > 0) seen.scroll = Math.max(seen.scroll, Math.round((window.scrollY / max) * 100))
  }, { passive: true })
  const flush = async () => {
    if (document.visibilityState !== 'hidden' || !visitId || !enabled()) return
    try {
      await call('track_event', { visit: visitId, kind: 'ping', pointer: seen.pointer, keys: seen.keys, scroll: seen.scroll, webdriver: Boolean(navigator.webdriver) }, { keepalive: true })
    } catch { /* ignore */ }
  }
  document.addEventListener('visibilitychange', flush)
  window.addEventListener('pagehide', flush)
}
