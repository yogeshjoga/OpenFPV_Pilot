
import { Link } from 'react-router-dom'
import PageWrapper from '@components/layout/PageWrapper'
import styles from './Auth.module.css'

export default function Unauthorized() {
  return (
    <PageWrapper>
      <div className={styles.authFeedbackPage}>
        <div className="container">
          <div className={styles.feedbackCard}>
            <span className={styles.errorIcon}>✕</span>
            <h1>Access Denied</h1>
            <p>You do not have the required permissions to view this section. Please upgrade your account level or contact support.</p>
            <Link to="/" className="btn-primary">Return Home</Link>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
