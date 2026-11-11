import { Download, ShieldCheck, Smartphone, WifiOff } from 'lucide-react'
import { ANDROID_APP } from '@data/androidApp'
import styles from './AppDownload.module.css'

// The Android app, for download. Hidden inside the app itself (a person who has it does not need to download it again).
export default function AppDownload({ id = 'android-app', titleTag: Title = 'h2' }) {
  if (typeof window !== 'undefined' && window.EgireApp) return null
  const app = ANDROID_APP

  return (
    <section id={id} className={`section ${styles.section}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.text}>
            <p className={styles.eyebrow}>Android app</p>
            <Title id={`${id}-title`} className={styles.title}>Take EGIRE Robotics on your phone</Title>
            <p className={styles.sub}>
              The programs, the lessons and the Electronics Atlas in one small app. The Atlas and the saved pages open with no internet, and students
              the team has accepted get the CRM in the same app.
            </p>

            <ul className={styles.facts}>
              <li><Smartphone size={15} aria-hidden="true" /> Android {app.minAndroid} or newer</li>
              <li><Download size={15} aria-hidden="true" /> {app.size}</li>
              <li><WifiOff size={15} aria-hidden="true" /> Atlas works offline</li>
              <li>Version {app.version}</li>
            </ul>

            <div className={styles.actions}>
              <a className={styles.primary} href={app.file} download={app.fileName}>
                <Download size={18} aria-hidden="true" /> Download the Android app (APK, {app.size})
              </a>
            </div>

            <details className={styles.how}>
              <summary>How to install it</summary>
              <ol>
                <li>Download the file and open it from your notifications or your Downloads folder.</li>
                <li>If Android asks, allow your browser to install apps from this source (a one-time switch in Settings).</li>
                <li>Tap Install, then Open. Sign in with the same account you use on the website.</li>
                <li>
                  Android may say the app is not from the Play Store. That is because we share it here first, before the Play Store listing. Only
                  install it from this page.
                </li>
              </ol>
            </details>

            <details className={styles.how}>
              <summary><ShieldCheck size={15} aria-hidden="true" /> Check the file (for the careful)</summary>
              <p>
                The SHA-256 of the file is below. A tool on your computer or phone can show the checksum of the downloaded file, and the two should match.
              </p>
              <code className={styles.hash}>{app.sha256}</code>
            </details>
          </div>
        </div>
      </div>
    </section>
  )
}
