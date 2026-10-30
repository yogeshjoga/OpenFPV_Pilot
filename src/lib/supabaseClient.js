// The browser's connection to the Supabase project that also holds the CRM's accounts. It is loaded only when a visitor needs it
// (the sign-in code, the account menu, a gated page), so it is not part of the first page load.
const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const authConfigured = Boolean(URL && KEY)

let clientPromise = null

export function getSupabase() {
  if (!authConfigured) return Promise.reject(new Error('Sign-in is not available right now.'))
  clientPromise ||= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(URL, KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'egire-site-auth' },
    }),
  )
  return clientPromise
}

export const functionUrl = (name) => `${URL}/functions/v1/${name}`
export const anonKey = KEY
