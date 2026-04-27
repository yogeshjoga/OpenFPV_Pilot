// ================================
// Zustand — Product Store (static data)
// ================================

import { create } from 'zustand'
import { PRODUCTS } from '@data/products'

const useProductStore = create((set, get) => ({
  products: PRODUCTS,
  loading: false,
  error: null,
  activeCategory: 'all',
  selectedProduct: null,
  searchQuery: '',

  // No-op: data is already loaded from static file
  fetchProducts: () => {},

  // Filtered product list
  getFiltered: () => {
    const { products, activeCategory, searchQuery } = get()
    let list =
      activeCategory === 'all'
        ? products
        : products.filter((p) => p.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          p.category.toLowerCase().includes(q)
      )
    }
    return list
  },

  setActiveCategory: (category) => set({ activeCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  selectProduct: (id) =>
    set({ selectedProduct: get().products.find((p) => p.id === id) || null }),
  clearSelectedProduct: () => set({ selectedProduct: null }),
}))

export default useProductStore
