// ================================
// Layout — Footer
// ================================

import { Link } from 'react-router-dom'
import { APP_NAME, APP_TAGLINE, NAV_LINKS, SOCIAL_LINKS, CONTACT_EMAIL } from '@config/constants'
import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>✦</span>
            <span className={styles.logoText}>{APP_NAME}</span>
          </Link>
          <p className={styles.tagline}>{APP_TAGLINE}</p>
          <p className={styles.email}>
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Footer navigation">
          <h3 className={styles.heading}>Quick Links</h3>
          {NAV_LINKS.map((link) => (
            <Link key={link.path} to={link.path} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Socials */}
        <div className={styles.socials}>
          <h3 className={styles.heading}>Community</h3>
          <a href={SOCIAL_LINKS.youtube} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
            YouTube
          </a>
          <a href={SOCIAL_LINKS.instagram} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href={SOCIAL_LINKS.discord} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </div>
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>© {year} {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
