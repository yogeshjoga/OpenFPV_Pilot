import styles from './Loader.module.css'

// The screen shown while a page or the sign-in check is loading: the logo, the company name and a small spinner.
// It looks the same as the first screen in index.html, so the page never seems to change between them.
export default function Loader({ label = 'Loading' }) {
  return (
    <div className={styles.loader} role="status" aria-label={label}>
      <img className={styles.logo} src="/icon-192.png" width="64" height="64" alt="" />
      <b className={styles.name}>EGIRE ROBOTICS</b>
      <span className={styles.ring} aria-hidden="true" />
    </div>
  )
}

// A small spinner for a part of a page that is still loading. The words are there for screen readers only.
export function Spinner({ label = 'Loading' }) {
  return (
    <span className={styles.inline} role="status">
      <span className={styles.ring} aria-hidden="true" />
      <span className={styles.sr}>{label}</span>
    </span>
  )
}
