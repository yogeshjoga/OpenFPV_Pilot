
import { Link } from 'react-router-dom'
import { Mail, LifeBuoy, Phone } from 'lucide-react'
import { APP_NAME, APP_TAGLINE, NAV_LINKS, SOCIAL_LINKS, CONTACT_EMAIL, SUPPORT_EMAIL, CONTACT_PHONE } from '@config/constants'
import styles from './Footer.module.css'

const SOCIAL_LABELS = { youtube: 'YouTube', instagram: 'Instagram', discord: 'Discord' }

export default function Footer() {
  const year = new Date().getFullYear()
  const socials = Object.entries(SOCIAL_LINKS).filter(([, url]) => url)

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo} aria-label="EGIRE Robotics home">
            <img className={styles.logoImg} src="/images/logo-egire-robotics.png" alt="EGIRE Robotics: Explore, Engineer, Excel" width="165" height="56" />
          </Link>
          <p className={styles.tagline}>{APP_TAGLINE}</p>
          <ul className={styles.contact}>
            <li>
              <Mail size={16} aria-hidden="true" />
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </li>
            <li>
              <LifeBuoy size={16} aria-hidden="true" />
              <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <a href={CONTACT_PHONE.href}>{CONTACT_PHONE.display}</a>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <nav className={styles.nav} aria-label="Footer navigation">
          <h3 className={styles.heading}>Quick Links</h3>
          <div className={styles.linkGrid}>
            {NAV_LINKS.map((link, idx) => link.path ? (
              <Link key={link.path || idx} to={link.path} className={styles.link}>
                {link.label || link.title}
              </Link>
            ) : null)}
          </div>
        </nav>

        {/* Socials: shown only once real profile links are set in the config */}
        {socials.length > 0 && (
          <div className={styles.socials}>
            <h3 className={styles.heading}>Community</h3>
            {socials.map(([key, url]) => (
              <a key={key} href={url} className={styles.socialLink} target="_blank" rel="noopener noreferrer">
                {SOCIAL_LABELS[key]}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className={styles.bottom}>
        <div className="container">
          <p>
            © {year} {APP_NAME}. All rights reserved. <Link to="/privacy" className={styles.legalLink}>Privacy policy</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
