import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play, X } from 'lucide-react'
import { fetchVideos } from '@lib/siteApi'
import styles from './VideoCarousel.module.css'

// Shown if the CRM has no published videos yet or cannot be reached, so the section is never empty.
const FALLBACK = [
  {
    id: 'sivani-workshop',
    kind: 'file',
    title: 'Workshop at Sri Sivani College of Engineering',
    caption: 'The inauguration, an introduction to drone engineering and piloting, and students at work.',
    url: '/videos/sivani-workshop-v1-720.mp4',
    urlLow: '/videos/sivani-workshop-v1-480.mp4',
    poster: '/images/sivani-workshop-poster-v1.webp',
  },
]

/** The lighter file for phones, data-saver mode and slow connections; the sharper one otherwise. */
function pickFile(video) {
  const connection = typeof navigator !== 'undefined' ? navigator.connection : undefined
  const slow = connection && (connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType))
  return video.urlLow && (window.innerWidth <= 640 || slow) ? video.urlLow : video.url
}

/** Plays one video. Uploaded files are silent; YouTube plays in its privacy-enhanced player, started muted. */
function Player({ video }) {
  if (video.kind === 'youtube') {
    return (
      <iframe
        className={styles.frame}
        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`}
        title={video.title}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    )
  }
  return (
    <video
      className={styles.video}
      src={pickFile(video)}
      poster={video.poster}
      controls
      controlsList="nodownload noremoteplayback"
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-label={video.title}
      onVolumeChange={(e) => {
        if (!e.currentTarget.muted) e.currentTarget.muted = true
      }}
    />
  )
}

function Thumb({ video, onPlay, large = false }) {
  return (
    <button type="button" className={`${styles.thumb} ${large ? styles.thumbLarge : ''}`} onClick={onPlay} aria-label={`Play video: ${video.title}`}>
      <img src={video.poster} alt="" width="1280" height="720" loading="lazy" decoding="async" />
      <span className={styles.play}>
        <Play size={large ? 32 : 24} aria-hidden="true" />
      </span>
    </button>
  )
}

/** The workshop videos managed in the CRM: one large player, or a carousel that opens each video in a window. */
export default function VideoCarousel() {
  const [videos, setVideos] = useState(null)
  const [inline, setInline] = useState(false) // the single-video layout has started playing
  const [open, setOpen] = useState(null) // the video shown in the window
  const track = useRef(null)
  const opener = useRef(null)

  useEffect(() => {
    let live = true
    fetchVideos()
      .then((list) => live && setVideos(list.length ? list : FALLBACK))
      .catch(() => live && setVideos(FALLBACK))
    return () => {
      live = false
    }
  }, [])

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

  const close = useCallback(() => {
    setOpen(null)
    opener.current?.focus()
  }, [])

  // The window: Escape closes it, the page behind does not scroll, and focus moves into it.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, close])

  if (!videos) return null
  const single = videos.length === 1

  return (
    <section className={`section ${styles.section}`} aria-labelledby="videos-title">
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.eyebrow}>Training in action</p>
          <h2 id="videos-title" className={styles.title}>See how our workshops run</h2>
          <p className={styles.lead}>Highlights from our workshops and training sessions.</p>
        </motion.div>

        {single ? (
          <>
            <div className={styles.player}>
              {inline ? <Player video={videos[0]} /> : <Thumb video={videos[0]} large onPlay={() => setInline(true)} />}
            </div>
            <p className={styles.caption}>
              <strong>{videos[0].title}</strong>
              {videos[0].caption && <span>{videos[0].caption}</span>}
            </p>
          </>
        ) : (
          <div className={styles.carousel} role="region" aria-roledescription="carousel" aria-label="Videos">
            <div className={styles.track} ref={track} tabIndex={0}>
              {videos.map((video) => (
                <figure key={video.id} className={styles.card}>
                  <Thumb
                    video={video}
                    onPlay={(e) => {
                      opener.current = e.currentTarget
                      setOpen(video)
                    }}
                  />
                  <figcaption className={styles.cardText}>
                    <strong>{video.title}</strong>
                    {video.caption && <span>{video.caption}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div className={styles.controls}>
              <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label="Previous videos">
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <button type="button" className={styles.arrow} onClick={() => step(1)} aria-label="Next videos">
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>

      {open && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={open.title} onClick={close}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <button type="button" className={styles.close} onClick={close} aria-label="Close video" autoFocus>
              <X size={22} aria-hidden="true" />
            </button>
            <div className={styles.dialogPlayer}>
              <Player video={open} />
            </div>
            <p className={styles.dialogTitle}>{open.title}</p>
          </div>
        </div>
      )}
    </section>
  )
}
