
import { Link } from 'react-router-dom'
import { Mail, LifeBuoy, Phone } from 'lucide-react'
import { APP_NAME, APP_TAGLINE, NAV_LINKS, SOCIAL_LINKS, CONTACT_EMAIL, SUPPORT_EMAIL, CONTACT_PHONE } from '@config/constants'
import styles from './Footer.module.css'

export default function Footer() {
  const year = new Date().getFullYear()

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
