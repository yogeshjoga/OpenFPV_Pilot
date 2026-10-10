import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import styles from './WorkshopVideo.module.css'

const SOURCES = {
  high: '/videos/sivani-workshop-v1-720.mp4',
  low: '/videos/sivani-workshop-v1-480.mp4',
}
const POSTER = '/images/sivani-workshop-poster-v1.webp'
const TITLE = 'Workshop at Sri Sivani College of Engineering'

/** The lighter file for phones, data-saver mode and slow connections; the sharper one otherwise. */
function pickSource() {
  const connection = typeof navigator !== 'undefined' ? navigator.connection : undefined
  const slow = connection && (connection.saveData || ['slow-2g', '2g', '3g'].includes(connection.effectiveType))
  return window.innerWidth <= 640 || slow ? SOURCES.low : SOURCES.high
}

/**
 * A workshop film shown as a still with a play button. Nothing is downloaded until the visitor presses play,
 * so the page loads exactly as fast as before. The film is silent: the files carry no audio track, and the
 * player is muted and kept muted as well.
 */
export default function WorkshopVideo() {
  const [src, setSrc] = useState(null)

  return (
    <section className={`section ${styles.section}`} aria-labelledby="workshop-video-title">
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.eyebrow}>Workshop in action</p>
          <h2 id="workshop-video-title" className={styles.title}>See how a workshop runs</h2>
          <p className={styles.lead}>
            Highlights from our workshop at Sri Sivani College of Engineering: the inauguration, an introduction to drone engineering and piloting, and students at work.
          </p>
        </motion.div>

        <div className={styles.player}>
          {src ? (
            <video
              className={styles.video}
              src={src}
              poster={POSTER}
              controls
              controlsList="nodownload noremoteplayback"
              autoPlay
              muted
              playsInline
              preload="auto"
              aria-label={TITLE}
              onVolumeChange={(e) => {
                if (!e.currentTarget.muted) e.currentTarget.muted = true
              }}
            />
          ) : (
            <button type="button" className={styles.poster} onClick={() => setSrc(pickSource())} aria-label={`Play video: ${TITLE}`}>
              <img src={POSTER} alt="" width="1280" height="720" loading="lazy" decoding="async" />
              <span className={styles.play}>
                <Play size={32} aria-hidden="true" />
              </span>
              <span className={styles.duration}>0:40</span>
            </button>
          )}
        </div>
        <p className={styles.caption}>{TITLE}</p>
      </div>
    </section>
  )
}
