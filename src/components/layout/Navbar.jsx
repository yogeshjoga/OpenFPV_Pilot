// ================================
// Layout — Navbar
// ================================

import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { APP_NAME, NAV_LINKS } from '@config/constants'
import useUIStore from '@store/useUIStore'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useUIStore()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
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
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>✦</span>
          <span className={styles.logoText}>{APP_NAME}</span>
        </Link>

        {/* Desktop Nav */}
        <nav className={styles.navLinks} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
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
          ))}
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
              {theme === 'dark' ? '☀' : '🌙'}
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
            {NAV_LINKS.map((link) => (
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
            ))}
            <Link to="/catalog" className={styles.mobileCta}>
              Learn Today →
            </Link>
            <button className={styles.mobileThemeToggle} onClick={toggleTheme}>
              {theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode'}
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
