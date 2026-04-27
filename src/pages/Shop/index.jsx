// ================================
// Page — Shop (E-commerce)
// ================================

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import { PRODUCTS } from '@data/products'
import styles from './Shop.module.css'
import ProductCard from './ProductCard'

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'frames', label: 'Frames' },
  { id: 'motors', label: 'Motors' },
  { id: 'flight-controllers', label: 'FCs' },
  { id: 'cameras', label: 'Cameras' },
  { id: 'goggles', label: 'Goggles' },
  { id: 'props', label: 'Propellers' }
]

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [displayProducts, setDisplayProducts] = useState(PRODUCTS)

  useEffect(() => {
    let filtered = PRODUCTS
    if (activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === activeCategory)
    }
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    setDisplayProducts(filtered)
  }, [activeCategory, searchQuery])

  return (
    <PageWrapper>
      <div className={styles.shopPage}>
        {/* Hero / Header */}
        <header className={styles.header}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className={styles.title}>FPV Pro <span className="gradient-text">Store</span></h1>
              <p className={styles.subtitle}>Premium gear for elite pilots. Curated for performance.</p>
            </motion.div>

            {/* Search Bar */}
            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search for frames, motors, goggles..." 
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filters Row */}
              <div className={styles.categoryFilters}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`${styles.categoryPill} ${activeCategory === cat.id ? styles.active : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Catalog Section */}
        <section className={styles.catalogSection}>
          <div className="container">
            <div className={styles.layout}>
              {/* Product Grid */}
              <main className={styles.mainContent}>
                <div className={styles.gridHeader}>
                  <span>Showing <strong>{displayProducts.length}</strong> products</span>
                  <div className={styles.sort}>
                    <label>Sort by:</label>
                    <select>
                      <option>Featured</option>
                      <option>Price: Low to High</option>
                      <option>Price: High to Low</option>
                      <option>Newest</option>
                    </select>
                  </div>
                </div>

                <div className={styles.grid}>
                  <AnimatePresence mode="popLayout">
                    {displayProducts.map((product, index) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </AnimatePresence>
                </div>

                {displayProducts.length === 0 && (
                  <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📦</span>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or category filters.</p>
                    <button onClick={() => {setActiveCategory('all'); setSearchQuery('')}} className={styles.resetBtn}>
                      Clear All Filters
                    </button>
                  </div>
                )}
              </main>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
