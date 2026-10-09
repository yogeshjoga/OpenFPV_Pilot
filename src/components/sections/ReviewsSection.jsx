import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { fetchReviews } from '@lib/siteApi'
import styles from './ReviewsSection.module.css'

const MAX_CHARS = 320

function shorten(text) {
  const clean = text.trim().replace(/\s+/g, ' ')
  if (clean.length <= MAX_CHARS) return clean
  const cut = clean.slice(0, MAX_CHARS)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[.,;:!?-]+$/, '')}...`
}

/** Five stars filled to the exact value, so 4.7 shows four full stars and the fifth filled 70% from the left. */
function Stars({ value, size = 18 }) {
  return (
    <span className={styles.stars} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.min(1, Math.max(0, value - (n - 1)))
        return (
          <span key={n} className={styles.star} style={{ width: size, height: size }} aria-hidden="true">
            <Star size={size} className={styles.starOff} />
            {fill > 0 && (
              <span className={styles.starFill} style={{ width: `${fill * 100}%` }}>
                <Star size={size} className={styles.starOn} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

/** Student ratings and the reviews staff chose to publish. Renders nothing if there is nothing to show or the data is unreachable. */
export default function ReviewsSection() {
  const [data, setData] = useState(null)

  useEffect(() => {
    let live = true
    fetchReviews()
      .then((d) => live && setData(d))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  if (!data || (!data.stats && data.reviews.length === 0)) return null
  const { stats, reviews } = data

  return (
    <section className={`section ${styles.section}`} aria-labelledby="reviews-title">
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.eyebrow}>What students say</p>
          <h2 id="reviews-title" className={styles.title}>
            {stats ? `Students rate us ${stats.average.toFixed(1)} out of 5` : 'What our students say'}
          </h2>
          {stats && (
            <div className={styles.summary}>
              <Stars value={stats.average} size={22} />
              <span>Based on {stats.count} student reviews</span>
            </div>
          )}
        </motion.div>

        {reviews.length > 0 && (
          <div className={styles.grid}>
            {reviews.map((r, index) => (
              <motion.figure
                key={r.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: Math.min(index, 5) * 0.05 }}
              >
                <Stars value={r.rating} />
                <blockquote className={styles.quote}>&ldquo;{shorten(r.comment)}&rdquo;</blockquote>
                <figcaption className={styles.who}>
                  <strong>{r.name}</strong>
                  {r.subtitle && <span>{r.subtitle}</span>}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
