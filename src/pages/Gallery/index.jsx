import { motion } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import styles from './Gallery.module.css'

// Placeholder data for the gallery
const GALLERY_ITEMS = [
  { id: 1, type: 'image', url: 'https://placehold.co/600x400/1a1a1a/00d4ff?text=Build+Photo+1', title: 'First 5-inch Build' },
  { id: 2, type: 'video', url: 'https://placehold.co/400x600/1a1a1a/ff0055?text=Freestyle+Clip', title: 'Bando Freestyle Flow' },
  { id: 3, type: 'image', url: 'https://placehold.co/600x800/1a1a1a/00ffaa?text=Workshop', title: 'Soldering Workshop' },
  { id: 4, type: 'image', url: 'https://placehold.co/800x600/1a1a1a/ffaa00?text=Race+Day', title: 'Local Race Meetup' },
  { id: 5, type: 'video', url: 'https://placehold.co/600x400/1a1a1a/7c3aed?text=Sim+Clip', title: 'Simulator PB Lap' },
  { id: 6, type: 'image', url: 'https://placehold.co/400x400/1a1a1a/00d4ff?text=Crash', title: 'Broken Arm Aftermath' },
]

export default function Gallery() {
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
              Explore builds, freestyle clips, and workshop moments from the community.
            </motion.p>
          </header>

          <div className={styles.masonryGrid}>
            {GALLERY_ITEMS.map((item, index) => (
              <motion.div
                key={item.id}
                className={styles.gridItem}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <div className={styles.mediaWrap}>
                  <img src={item.url} alt={item.title} className={styles.media} />
                  <div className={styles.overlay}>
                    <span className={styles.mediaType}>{item.type === 'video' ? '▶ Video' : '📷 Image'}</span>
                    <h3 className={styles.mediaTitle}>{item.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
