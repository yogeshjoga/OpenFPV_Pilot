import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/useAuthStore'
import { trackEvent } from '@lib/analytics'

// Where Google sends a person back to. The Supabase client reads the sign-in from the address; once the account is known we go on
// to the page they were trying to open (or to the sign-in page to finish the one-time college question).
export default function AuthCallback() {
  const status = useAuthStore((s) => s.status)
  const init = useAuthStore((s) => s.init)
  const takeNext = useAuthStore((s) => s.takeNext)
  const navigate = useNavigate()

  useEffect(() => { void init() }, [init])
  useEffect(() => {
    if (status === 'loading') return
    if (status === 'ready') { trackEvent('signin', { target: 'google' }); navigate(takeNext(), { replace: true }) }
    else if (status === 'incomplete') navigate('/login', { replace: true })
    else {
      // give the client a moment to finish reading the sign-in from the address before giving up
      const t = setTimeout(() => navigate('/login', { replace: true }), 2500)
      return () => clearTimeout(t)
    }
    return undefined
  }, [status, navigate, takeNext])

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }} role="status">
      Signing you in…
    </div>
  )
}
