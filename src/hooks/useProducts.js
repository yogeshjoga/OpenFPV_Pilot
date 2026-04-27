// ================================
// Hook — useProducts
// ================================

import useProductStore from '@store/useProductStore'
import { useMemo } from 'react'

/**
 * Returns filtered + searched product list,
 * category state, and search state from the product store.
 */
export function useProducts() {
  const {
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    getFiltered,
  } = useProductStore()

  const filtered = useMemo(() => getFiltered(), [activeCategory, searchQuery])

  return {
    products: filtered,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
  }
}
