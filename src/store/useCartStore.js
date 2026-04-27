// ================================
// Zustand — Cart Store (local only)
// ================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],

      addItem: (product) => {
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id)
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
              ),
            }
          }
          return { cart: [...state.cart, { ...product, quantity: 1 }] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) return
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
          ),
        }))
      },

      clearCart: () => set({ cart: [] }),

      getTotalPrice: () => {
        return get()
          .cart.reduce((total, item) => total + item.price * item.quantity, 0)
          .toFixed(2)
      },

      getCartCount: () => {
        return get().cart.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: 'openfpv-cart-storage',
    }
  )
)
