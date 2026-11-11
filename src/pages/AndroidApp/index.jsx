import { Link } from 'react-router-dom'
import PageWrapper from '@components/layout/PageWrapper'
import AppDownload from '@components/sections/AppDownload'
import useDocumentMeta from '@lib/useDocumentMeta'
import styles from './AndroidApp.module.css'

// A page of its own for the Android app, so the address (egirerobotics.com/app) can be shared, printed or put in a QR code.
export default function AndroidApp() {
  useDocumentMeta('Android app: programs, lessons and the Electronics Atlas | EGIRE Robotics', 'Download the EGIRE Robotics Android app (10 MB): the programs, the lessons, the offline Electronics Atlas and, for accepted students, the CRM.')
  const inApp = typeof window !== 'undefined' && !!window.EgireApp

  return (
    <PageWrapper>
      <div className={styles.page}>
        {inApp ? (
          <section className={`section ${styles.have}`}>
            <div className="container">
              <h1 className={styles.title}>You already have the app</h1>
              <p className={styles.sub}>You are using the EGIRE Robotics Android app right now. Updates come as a new version from this same page.</p>
              <Link to="/" className={styles.back}>Back to the home page</Link>
            </div>
          </section>
        ) : (
          <AppDownload id="download" titleTag="h1" />
        )}
      </div>
    </PageWrapper>
  )
}
