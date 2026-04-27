// ================================
// Layout — Page Wrapper
// ================================

import Navbar from './Navbar'
import Footer from './Footer'
import styles from './PageWrapper.module.css'

/**
 * PageWrapper — wraps all page content with Navbar and Footer.
 * Pass fullHeight=true for pages that need a full-viewport canvas.
 */
export default function PageWrapper({ children, fullHeight = false }) {
  return (
    <div className={`${styles.wrapper} ${fullHeight ? styles.fullHeight : ''}`}>
      <Navbar />
      <main className={styles.main} id="main-content">
        {children}
      </main>
      <Footer />
    </div>
  )
}
