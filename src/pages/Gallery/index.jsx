import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import manifest from '@data/galleryWorkshop1.json'
import styles from './Gallery.module.css'

const BASE = `/gallery/${manifest.set}`

const GALLERY_ITEMS = manifest.images.map((img, i) => ({
  ...img,
  title: `Workshop photo ${i + 1}`,
  thumb: `${BASE}/thumb/${img.id}.webp`,
  full: `${BASE}/full/${img.id}.webp`,
}))

export default function Gallery() {
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (active === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % GALLERY_ITEMS.length)
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + GALLERY_ITEMS.length) % GALLERY_ITEMS.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active])

  const current = active === null ? null : GALLERY_ITEMS[active]

  return (
    <PageWrapper>
      <div className={styles.page}>
        <div className="container">
          <header className={styles.header}>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Our <span className="gradient-text">Gallery</span>
            </motion.h1>
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Moments from our hands-on FPV drone workshops.
            </motion.p>
          </header>

          <div className={styles.masonryGrid}>
            {GALLERY_ITEMS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                className={styles.gridItem}
                onClick={() => setActive(index)}
                aria-label={`Open ${item.title}`}
              >
                <div className={styles.mediaWrap}>
                  <img
                    src={item.thumb}
                    alt={item.title}
                    width={item.w}
                    height={item.h}
                    loading="lazy"
                    decoding="async"
                    className={styles.media}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {current && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setActive(null)}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={current.full}
            alt={current.title}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <span className={styles.lightboxCount}>
            {active + 1} / {GALLERY_ITEMS.length}
          </span>
        </div>
      )}
    </PageWrapper>
  )
}
