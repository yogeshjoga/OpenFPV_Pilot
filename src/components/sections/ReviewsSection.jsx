import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchReviews } from '@lib/siteApi'
import StarRating from '@components/ui/StarRating'
import styles from './ReviewsSection.module.css'

const MAX_CHARS = 320
const AUTO_MS = 6000

/** Students sometimes add emoji; keep the quotes plain text, and cut long ones at a word. */
function shorten(text) {
  const clean = text.replace(/\p{Extended_Pictographic}️?/gu, '').trim().replace(/\s+/g, ' ')
  if (clean.length <= MAX_CHARS) return clean
  const cut = clean.slice(0, MAX_CHARS)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[.,;:!?-]+$/, '')}...`
}

/** Student ratings and published reviews as a carousel. Renders nothing if there is nothing to show or the data is unreachable. */
export default function ReviewsSection() {
  const [data, setData] = useState(null)
  const track = useRef(null)
  const paused = useRef(false)

  useEffect(() => {
    let live = true
    fetchReviews()
      .then((d) => live && setData(d))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  /** Scrolls one card in a direction, wrapping around at either end. */
  const step = useCallback((direction) => {
    const el = track.current
    if (!el || !el.firstElementChild) return
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const card = el.firstElementChild.getBoundingClientRect().width + gap
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4
    const atStart = el.scrollLeft <= 4
    if (direction > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' })
    else if (direction < 0 && atStart) el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
    else el.scrollBy({ left: direction * card, behavior: 'smooth' })
  }, [])

  const count = data?.reviews.length ?? 0
  useEffect(() => {
    if (count < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => {
      if (!paused.current) step(1)
    }, AUTO_MS)
    return () => clearInterval(timer)
  }, [count, step])

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
          <div
            className={styles.carousel}
            role="region"
            aria-roledescription="carousel"
            aria-label="Student reviews"
            onMouseEnter={() => (paused.current = true)}
            onMouseLeave={() => (paused.current = false)}
            onFocus={() => (paused.current = true)}
            onBlur={() => (paused.current = false)}
            onTouchStart={() => (paused.current = true)}
          >
            <div className={styles.track} ref={track} tabIndex={0}>
              {reviews.map((r) => (
                <figure key={r.id} className={styles.card}>
                  <StarRating value={r.rating} />
                  <blockquote className={styles.quote}>&ldquo;{shorten(r.comment)}&rdquo;</blockquote>
                  <figcaption className={styles.who}>
                    <strong>{r.name}</strong>
                    {r.subtitle && <span>{r.subtitle}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>

            {reviews.length > 1 && (
              <div className={styles.controls}>
                <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label="Previous reviews">
                  <ChevronLeft size={20} aria-hidden="true" />
                </button>
                <button type="button" className={styles.arrow} onClick={() => step(1)} aria-label="Next reviews">
                  <ChevronRight size={20} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
