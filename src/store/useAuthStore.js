// Auth is removed — static site, no backend
// Kept as a stub so existing imports don't break

import { create } from 'zustand'

export const useAuthStore = create(() => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: () => {},
  login: async () => false,
  logout: () => {},
  getProfile: () => {},
  updateProfile: async () => false,
  isAdmin: () => false,
  hasAccess: () => true, // all routes open
}))
