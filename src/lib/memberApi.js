import { anonKey, authConfigured, functionUrl } from './supabaseClient.js'

// Calls the two sign-in functions. Errors are written to be safe to show a visitor.
async function post(name, payload) {
  if (!authConfigured) throw new Error('Sign-in is not available right now. Please call us.')
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 20000)
  try {
    const res = await fetch(functionUrl(name), {
      method: 'POST',
      headers: { apikey: anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
    return data
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('That took too long. Please try again.')
    if (err instanceof TypeError) throw new Error('We could not reach our server. Please check your connection.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/** Mails a 6-digit code to the address. `website` is a honeypot field real visitors never fill. */
export const sendLoginCode = (email, { captcha = '', website = '' } = {}) => post('member-otp-send', { email, captcha, website })

/** Checks the code. Returns { token_hash, new_user } for the browser to open a session with. */
export const verifyLoginCode = (email, code) => post('member-otp-verify', { email, code })
