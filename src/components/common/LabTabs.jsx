import { NavLink } from 'react-router-dom'
import styles from './LabTabs.module.css'

/**
 * LabTabs: the switch at the top of a "lab" page that holds several tools in one place.
 * Each tab is a real link, so the address bar, back button and shared links all work.
 */
export default function LabTabs({ label, tabs }) {
  return (
    <nav className={styles.bar} aria-label={label}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.name}>{label}</span>
        <div className={styles.tabs}>
          {tabs.map(({ to, text, icon: Icon }) => (
            <NavLink key={to} to={to} replace className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
              {Icon && <Icon size={16} aria-hidden="true" />}
              {text}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
