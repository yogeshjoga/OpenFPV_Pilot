import styles from './Loader.module.css'

// The screen shown while a page or the sign-in check is loading: the logo and a small spinner, with no text on screen.
// It looks the same as the first screen in index.html, so the page never seems to change between them.
export default function Loader({ label = 'Loading' }) {
  return (
    <div className={styles.loader} role="status" aria-label={label}>
      <img className={styles.logo} src="/icon-192.png" width="64" height="64" alt="" />
      <span className={styles.ring} aria-hidden="true" />
    </div>
  )
}
