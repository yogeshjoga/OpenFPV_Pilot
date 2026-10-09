import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchReviews } from '@lib/siteApi'
import StarRating from '@components/ui/StarRating'
import styles from './ReviewsSection.module.css'

const MAX_CHARS = 320

function shorten(text) {
  const clean = text.trim().replace(/\s+/g, ' ')
  if (clean.length <= MAX_CHARS) return clean
  const cut = clean.slice(0, MAX_CHARS)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[.,;:!?-]+$/, '')}...`
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
              <StarRating value={stats.average} size={22} />
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
                <StarRating value={r.rating} />
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
