
import { useState, useEffect } from 'react'
import { Sun, Moon, ArrowRight, ChevronDown } from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS } from '@config/constants'
import useUIStore from '@store/useUIStore'
import styles from './Navbar.module.css'

// What the announcement strip under the navigation says, repeated as it scrolls
const ANNOUNCEMENT_LEAD = 'We are starting sales and service for all robotic spares and robots'
const ANNOUNCEMENTS = [
  'Drones',
  'Drone spares',
  '3D printers',
  '3D printed cases',
  'AI software',
  'AI hardware kits',
  'College projects for students in software, electronics and mechanical domains',
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useUIStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile nav on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="EGIRE Robotics home">
          <span className={styles.logoCrop}>
            <img className={styles.logoImg} src="/images/logo-egire-robotics.png" alt="EGIRE Robotics" width="141" height="48" />
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.navLinks} aria-label="Main navigation">
          {NAV_LINKS.map((link) => {
            if (link.subLinks) {
              return (
                <div key={link.label} className={styles.navDropdownGroup}>
                  <button className={styles.navLink}>
                    {link.label} <ChevronDown size={14} className={styles.dropdownIcon} aria-hidden="true" />
                  </button>
                  <div className={styles.navDropdown}>
                    {link.subLinks.map((sub) => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) =>
                          `${styles.navDropdownItem} ${isActive ? styles.active : ''}`
                        }
                      >
                        {sub.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )
            }
            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.active : ''}`
                }
                end={link.path === '/'}
              >
                {link.label}
              </NavLink>
            )
          })}
        </nav>

        {/* Theme Toggle + Hamburger */}
        <div className={styles.actions}>
          <motion.button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            whileTap={{ scale: 0.85 }}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
              animate={{ rotate: 0, opacity: 1, scale: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={styles.themeIcon}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </motion.span>
          </motion.button>

          {/* Hamburger */}
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <span className={`${styles.bar} ${mobileOpen ? styles.open1 : ''}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.open2 : ''}`} />
            <span className={`${styles.bar} ${mobileOpen ? styles.open3 : ''}`} />
          </button>
        </div>
      </div>

      {/* Announcement strip */}
      <div className={styles.ticker} role="region" aria-label="Announcement">
        <div className={styles.tickerTrack}>
          {/* four copies: the loop moves half the track, so even a very wide screen never shows a gap */}
          {[0, 1, 2, 3].map((copy) => (
            <ul key={copy} className={styles.tickerList} aria-hidden={copy > 0 ? 'true' : undefined}>
              {/* the badge marks where the message starts each time the strip loops round */}
              <li className={styles.tickerLead}>
                <span className={styles.tickerBadge}>New</span>
                {ANNOUNCEMENT_LEAD}
              </li>
              {ANNOUNCEMENTS.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            aria-label="Mobile navigation"
          >
            {NAV_LINKS.map((link) => {
              if (link.subLinks) {
                return (
                  <div key={link.label} className={styles.mobileDropdownGroup}>
                    <div className={styles.mobileDropdownHeader}>{link.label}</div>
                    <div className={styles.mobileDropdownItems}>
                      {link.subLinks.map((sub) => (
                        <NavLink
                          key={sub.path}
                          to={sub.path}
                          className={({ isActive }) =>
                            `${styles.mobileLink} ${styles.mobileSubLink} ${isActive ? styles.active : ''}`
                          }
                          end={sub.path === '/'}
                        >
                          {sub.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `${styles.mobileLink} ${isActive ? styles.active : ''}`
                  }
                  end={link.path === '/'}
                >
                  {link.label}
                </NavLink>
              )
            })}
            <Link to="/enquire" className={styles.mobileCta}>
              Enquire now <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <button className={styles.mobileThemeToggle} onClick={toggleTheme}>
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
