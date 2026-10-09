import { Star } from 'lucide-react'
import styles from './StarRating.module.css'

/** Five stars filled to the exact value, so 4.7 shows four full stars and the fifth filled 70% from the left. */
export default function StarRating({ value, size = 18, className = '' }) {
  return (
    <span className={`${styles.stars} ${className}`} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.min(1, Math.max(0, value - (n - 1)))
        return (
          <span key={n} className={styles.star} style={{ width: size, height: size }} aria-hidden="true">
            <Star size={size} className={styles.off} />
            {fill > 0 && (
              <span className={styles.fill} style={{ width: `${fill * 100}%` }}>
                <Star size={size} className={styles.on} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
