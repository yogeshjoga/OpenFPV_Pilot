
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatPrice } from '@lib/utils'
import styles from './ProductCard.module.css'
import { ArrowRight, Box, Fan, Cpu, Camera, Wind, Glasses, Package } from 'lucide-react'
import StarRating from '@components/ui/StarRating'

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
          View Details <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </motion.article>
  )
}

function StarRow({ rating }) {
  return (
    <div className={styles.stars}>
      <StarRating value={rating} size={14} />
      <span className={styles.ratingNum}>{rating.toFixed(1)}</span>
    </div>
  )
}

const CATEGORY_ICONS = {
  frames: Box,
  motors: Fan,
  'flight-controllers': Cpu,
  cameras: Camera,
  props: Wind,
  goggles: Glasses,
}

function DroneGlyph({ category }) {
  const Icon = CATEGORY_ICONS[category] || Package
  return (
    <span className={styles.glyph}>
      <Icon size={56} strokeWidth={1.5} aria-hidden="true" />
    </span>
  )
}
