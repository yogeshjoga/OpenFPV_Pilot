// ================================
// Zustand — UI Store
// ================================

import { create } from 'zustand'

const useUIStore = create((set) => ({
  // Navbar
  navOpen: false,
  setNavOpen: (open) => set({ navOpen: open }),
  toggleNav: () => set((state) => ({ navOpen: !state.navOpen })),

  // Modal
  activeModal: null,
  openModal: (modalId) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  // Theme
  theme: 'light',
  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

  // Loading screen
  isLoading: true,
  setIsLoading: (val) => set({ isLoading: val }),

  // 3D model viewer — orbit controls locked?
  orbitLocked: false,
  setOrbitLocked: (val) => set({ orbitLocked: val }),
}))

export default useUIStore
