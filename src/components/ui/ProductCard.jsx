// ================================
// UI — ProductCard
// ================================

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatPrice } from '@lib/utils'
import styles from './ProductCard.module.css'

export default function ProductCard({ product, index = 0 }) {
  const { id, name, category, price, originalPrice, rating, reviews, badge, inStock } = product

  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4 }}
    >
      {/* Thumbnail */}
      <Link to={`/product/${id}`} className={styles.imageWrapper} aria-label={`View ${name}`}>
        <div className={styles.imagePlaceholder}>
          <DroneGlyph category={category} />
        </div>
        {badge && (
          <span className={`${styles.badge} ${styles[`badge_${badge.toLowerCase().replace(/ /g, '_')}`]}`}>
            {badge}
          </span>
        )}
        {!inStock && <div className={styles.outOfStock}>Out of Stock</div>}
      </Link>

      {/* Info */}
      <div className={styles.body}>
        <p className={styles.category}>{category.replace(/-/g, ' ')}</p>
        <h3 className={styles.name}>
          <Link to={`/product/${id}`}>{name}</Link>
        </h3>

        {/* Rating */}
        <div className={styles.rating}>
          <StarRow rating={rating} />
          <span className={styles.reviewCount}>({reviews})</span>
        </div>

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(price)}</span>
          {originalPrice && (
            <span className={styles.originalPrice}>{formatPrice(originalPrice)}</span>
          )}
          {discount && <span className={styles.discount}>-{discount}%</span>}
        </div>

        <Link to={`/product/${id}`} className={styles.viewBtn}>
          View Details →
        </Link>
      </div>
    </motion.article>
  )
}

function StarRow({ rating }) {
  return (
    <div className={styles.stars} aria-label={`Rating: ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`${styles.star} ${n <= Math.round(rating) ? styles.filled : ''}`}
        >
          ★
        </span>
      ))}
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </div>
  )
}

function DroneGlyph({ category }) {
  const glyphs = {
    frames: '□',
    motors: '◎',
    'flight-controllers': '◈',
    cameras: '⊡',
    props: '✦',
    goggles: '◉',
  }
  return (
    <span className={styles.glyph}>
      {glyphs[category] || '✦'}
    </span>
  )
}
