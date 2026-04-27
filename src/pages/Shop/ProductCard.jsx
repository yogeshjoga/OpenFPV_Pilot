// ================================
// Component — ProductCard (E-commerce)
// ================================

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCartStore } from '@store/useCartStore'
import styles from './Shop.module.css'

export default function ProductCard({ product, index }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3, delay: (index % 12) * 0.05 }}
      className={styles.card}
    >
      <Link to={`/product/${product.id}`} className={styles.cardLink}>
        <div className={styles.imageWrapper}>
          {product.badge && <span className={styles.badge}>{product.badge}</span>}
          <img src={product.thumbnail} alt={product.name} className={styles.productImage} />
          
          <div className={styles.overlay}>
            <button className={styles.quickView}>Quick View</button>
          </div>
        </div>

        <div className={styles.details}>
          <div className={styles.category}>{product.category}</div>
          <h3 className={styles.cardTitle}>{product.name}</h3>
          
          <div className={styles.rating}>
            <span className={styles.stars}>{"★".repeat(Math.floor(product.rating))}</span>
            <span className={styles.reviews}>({product.reviews})</span>
          </div>

          <div className={styles.priceRow}>
            <div className={styles.priceBlock}>
              <span className={styles.price}>₹{product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className={styles.oldPrice}>₹{product.originalPrice.toLocaleString('en-IN')}</span>
              )}
            </div>
            
            <button 
              className={styles.addToCart}
              onClick={(e) => {
                e.preventDefault();
                useCartStore.getState().addItem(product);
              }}
            >
              Add +
            </button>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
