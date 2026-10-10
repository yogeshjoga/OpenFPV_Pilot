import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import manifest from '@data/galleryWorkshop1.json'
import sivani from '@data/gallerySivani.json'
import { fetchGallery } from '@lib/siteApi'
import styles from './Gallery.module.css'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import useDocumentMeta from '@lib/useDocumentMeta'

const STATIC_CATEGORY = { id: 'static-workshops', name: 'Workshops', slug: 'workshops' }

const staticImages = (set, images) =>
  images.map((img) => ({
    id: img.id,
    w: img.w,
    h: img.h,
    thumb: `/gallery/${set}/thumb/${img.id}.webp`,
    full: `/gallery/${set}/full/${img.id}.webp`,
  }))

// Albums bundled with the site. A `wide` album shows its few photos large, one per row, instead of a masonry grid.
const STATIC_ALBUMS = [
  {
    id: 'static-sivani-srikakulam',
    title: sivani.title,
    description: sivani.description,
    date: null,
    wide: true,
    images: staticImages(sivani.set, sivani.images),
  },
  {
    id: 'static-workshop-1',
    title: 'Workshop 1',
    description: '',
    date: null,
    images: staticImages(manifest.set, manifest.images),
  },
]

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''

export default function Gallery() {
  useDocumentMeta('Gallery | EGIRE Robotics', 'Photos from EGIRE Robotics workshops, flying sessions and events.')
  const [remote, setRemote] = useState(null)
  const [categoryId, setCategoryId] = useState('all')
  const [albumId, setAlbumId] = useState(null)
  const [active, setActive] = useState(null)

  useEffect(() => {
    let live = true
    fetchGallery()
      .then((data) => live && setRemote(data))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  const { categories, albums } = useMemo(() => {
    const remoteCats = remote?.categories ?? []
    const workshops = remoteCats.find((c) => c.slug === 'workshops') ?? STATIC_CATEGORY
    const cats = remoteCats.some((c) => c.slug === 'workshops') ? remoteCats : [...remoteCats, STATIC_CATEGORY]
    const all = [
      ...(remote?.albums ?? []).filter((a) => a.images.length > 0),
      ...STATIC_ALBUMS.map((a) => ({ ...a, categoryId: workshops.id })),
    ]
    const used = new Set(all.map((a) => a.categoryId))
    return { categories: cats.filter((c) => used.has(c.id)), albums: all }
  }, [remote])

  const album = albums.find((a) => a.id === albumId) ?? null
  const shown = albums.filter((a) => categoryId === 'all' || a.categoryId === categoryId)
  const images = album?.images ?? []
  const current = active === null ? null : images[active]

  const openAlbum = (id) => {
    setAlbumId(id)
    setActive(null)
    window.scrollTo({ top: 0 })
  }

  useEffect(() => {
    if (active === null) return
    const onKey = (e) => {
      if (e.key === 'Escape') setActive(null)
      if (e.key === 'ArrowRight') setActive((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, images.length])

  return (
    <PageWrapper>
      <div className={styles.page}>
        <div className="container">
          <header className={styles.header}>
            <motion.h1 className={styles.title} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              Our <span className="gradient-text">Gallery</span>
            </motion.h1>
            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Our team, workshops, flying sessions and events.
            </motion.p>
          </header>

          {album ? (
            <>
              <div className={styles.albumHeader}>
                <button type="button" className={styles.backBtn} onClick={() => openAlbum(null)}>
                  <ArrowLeft size={16} aria-hidden="true" /> All albums
                </button>
                <h2 className={styles.albumHeading}>{album.title}</h2>
                <p className={styles.albumSub}>
                  {[formatDate(album.date), `${images.length} photos`].filter(Boolean).join(' · ')}
                </p>
                {album.description && <p className={styles.albumDesc}>{album.description}</p>}
              </div>

              <div className={album.wide ? styles.wideGrid : styles.masonryGrid}>
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    type="button"
                    className={styles.gridItem}
                    onClick={() => setActive(index)}
                    aria-label={`Open photo ${index + 1}`}
                  >
                    <div className={styles.mediaWrap}>
                      <img
                        src={album.wide ? img.full : img.thumb}
                        alt={`${album.title} photo ${index + 1}`}
                        width={img.w}
                        height={img.h}
                        loading="lazy"
                        decoding="async"
                        className={styles.media}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className={styles.tabs} role="tablist" aria-label="Gallery categories">
                {[{ id: 'all', name: 'All' }, ...categories].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={categoryId === c.id}
                    className={`${styles.tab} ${categoryId === c.id ? styles.tabActive : ''}`}
                    onClick={() => setCategoryId(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className={styles.albumGrid}>
                {shown.map((a) => (
                  <button key={a.id} type="button" className={styles.albumCard} onClick={() => openAlbum(a.id)}>
                    <div className={styles.albumCover}>
                      <img src={a.images[0].thumb} alt="" loading="lazy" decoding="async" />
                    </div>
                    <div className={styles.albumMeta}>
                      <span className={styles.albumTitle}>{a.title}</span>
                      <span className={styles.albumCount}>
                        {[formatDate(a.date), `${a.images.length} photos`].filter(Boolean).join(' · ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {current && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${album.title} photo ${active + 1}`}
          onClick={() => setActive(null)}
        >
          <button type="button" className={styles.lightboxClose} onClick={() => setActive(null)} aria-label="Close">
            ×
          </button>
          {images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxPrev}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActive((i) => (i - 1 + images.length) % images.length)
                }}
                aria-label="Previous photo"
              >
                <ChevronLeft size={28} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={`${styles.lightboxNav} ${styles.lightboxNext}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActive((i) => (i + 1) % images.length)
                }}
                aria-label="Next photo"
              >
                <ChevronRight size={28} aria-hidden="true" />
              </button>
            </>
          )}
          <img
            src={current.full}
            alt={`${album.title} photo ${active + 1}`}
            className={styles.lightboxImg}
            onClick={(e) => e.stopPropagation()}
          />
          <span className={styles.lightboxCount}>
            {active + 1} / {images.length}
          </span>
        </div>
      )}
    </PageWrapper>
  )
}
