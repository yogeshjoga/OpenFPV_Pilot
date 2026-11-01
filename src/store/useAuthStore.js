// Who is signed in on the website. Accounts live in the same Supabase project as the CRM, so a CRM student signs in here with the
// same email (Google or an emailed code) and a new visitor becomes a "member".
//
// status:
//   loading     we have not asked the server yet
//   out         nobody is signed in
//   incomplete  signed in, but the name or college is missing (asked once, then the Academy opens)
//   ready       signed in and complete
import { create } from 'zustand'
import { getSupabase, authConfigured } from '@lib/supabaseClient'
import { verifyLoginCode } from '@lib/memberApi'
import { trackEvent } from '@lib/analytics'

const STAFF = ['instructor', 'coordinator', 'admin', 'super_admin']
const PROFILE_COLUMNS = 'id, full_name, email, phone, role, status, college_name, member_type, account_kind, is_paid'
const NEXT_KEY = 'egire-next'
// Everyone who signs in lands in the Academy. The CRM is a separate place that a member has to ask for.
export const ACADEMY_HOME = '/intro'

const isComplete = (profile) => Boolean(profile && profile.college_name && profile.full_name)

let started = false
let refreshSession = async () => {}

export const useAuthStore = create((set, get) => ({
  status: 'loading',
  loading: true, // kept for existing callers
  user: null,
  profile: null,
  error: null,

  /** Starts listening to the session. Safe to call more than once. */
  init: async () => {
    if (started) return
    started = true
    if (!authConfigured) { set({ status: 'out', loading: false }); return }
    try {
      const supabase = await getSupabase()
      const apply = async (session) => {
        if (!session?.user) { set({ status: 'out', loading: false, user: null, profile: null }); return }
        const { data } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', session.user.id).maybeSingle()
        const profile = data ?? null
        // when the member last asked for the CRM; read on its own so the sign-in still works if that column is not there yet
        if (profile) {
          const { data: ask, error: askError } = await supabase.from('profiles').select('crm_requested_at').eq('id', session.user.id).maybeSingle()
          profile.crm_requested_at = askError ? null : ask?.crm_requested_at ?? null
        }
        set({
          status: isComplete(profile) ? 'ready' : 'incomplete',
          loading: false,
          user: { id: session.user.id, email: session.user.email, name: profile?.full_name || session.user.user_metadata?.full_name || '' },
          profile,
        })
      }
      refreshSession = async () => { const { data: now } = await supabase.auth.getSession(); await apply(now.session) }
      await refreshSession()
      // not awaited inside the callback: calling the client from here can deadlock it
      supabase.auth.onAuthStateChange((_event, session) => { setTimeout(() => { void apply(session) }, 0) })
    } catch {
      set({ status: 'out', loading: false })
    }
  },
  fetchUser: () => get().init(),

  /** Second step of the emailed code: check it, then open the session. */
  signInWithCode: async (email, code) => {
    const { token_hash: tokenHash } = await verifyLoginCode(email, code)
    const supabase = await getSupabase()
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' })
    if (error) throw new Error('We could not sign you in. Please try again.')
    trackEvent('signin', { target: 'email code' })
  },

  signInWithGoogle: async (next = ACADEMY_HOME) => {
    try { sessionStorage.setItem(NEXT_KEY, next) } catch { /* the person simply lands on the home page */ }
    const supabase = await getSupabase()
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } })
    if (error) throw new Error('Google sign-in is not available right now.')
  },

  /** Where to send a person after signing in. */
  takeNext: () => {
    let next = ACADEMY_HOME
    try { next = sessionStorage.getItem(NEXT_KEY) || ACADEMY_HOME; sessionStorage.removeItem(NEXT_KEY) } catch { /* ignore */ }
    return next.startsWith('/') && !next.startsWith('//') ? next : ACADEMY_HOME
  },

  /** Saves the name, college or company and the onboarding answers. Throws a message safe to show. */
  completeProfile: async ({ fullName, college, heardFrom, heardOther = '', role, lookingFor = [], experience = '', phone = '' }) => {
    const supabase = await getSupabase()
    const { error } = await supabase.rpc('member_complete_profile', {
      p_full_name: fullName,
      p_college: college,
      p_heard_from: heardFrom,
      p_heard_other: heardOther,
      p_role: role,
      p_looking_for: lookingFor,
      p_experience: experience,
      p_phone: phone,
    })
    if (error) throw new Error(error.message || 'We could not save that. Please try again.')
    await refreshSession()
    trackEvent('signup', { target: 'profile completed', label: heardFrom })
  },

  /**
   * A member asks for the CRM, on purpose. The request goes to the admins; nothing opens until one of them accepts it.
   * Returns 'requested' or 'approved'. Throws a message safe to show.
   */
  requestCrmAccess: async () => {
    const supabase = await getSupabase()
    const { data, error } = await supabase.rpc('member_request_crm_access')
    if (error) throw new Error(error.message || 'We could not send your request. Please try again.')
    await refreshSession()
    trackEvent('crm_request', { target: 'crm access' })
    return data?.state ?? 'requested'
  },

  signOut: async () => {
    const supabase = await getSupabase()
    await supabase.auth.signOut()
    set({ status: 'out', user: null, profile: null })
  },

  // existing callers
  login: async () => false,
  logout: () => { void get().signOut() },
  getProfile: () => {},
  updateProfile: async () => false,
  isAdmin: () => STAFF.includes(get().profile?.role),
  hasAccess: (level = 1) => {
    const { status, profile } = get()
    if (level <= 1) return status === 'ready'
    return status === 'ready' && STAFF.includes(profile?.role)
  },
}))
