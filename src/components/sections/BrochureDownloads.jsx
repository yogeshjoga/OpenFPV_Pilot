import { Download, ExternalLink } from 'lucide-react'
import { BROCHURES } from '@data/brochures'
import styles from './BrochureDownloads.module.css'

// Download the programme brochures as PDFs. Each card has the cover, a short summary, a download button and a link to read it in the browser.
export default function BrochureDownloads({ id = 'brochures' }) {
  return (
    <section id={id} className={`section ${styles.section}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Brochures</p>
          <h2 id={`${id}-title`} className={styles.title}>Read our programmes at your own pace</h2>
          <p className={styles.sub}>Download the full brochure to read on your phone or laptop, print it, or share it with your parents and your college.</p>
        </div>

        <div className={styles.grid}>
          {BROCHURES.map((b) => (
            <article key={b.id} className={styles.card}>
              <img className={styles.cover} src={b.cover} alt={b.coverAlt} width="640" height="906" loading="lazy" decoding="async" />
              <div className={styles.body}>
                <p className={styles.kicker}>{b.kicker}</p>
                <h3 className={styles.name}>{b.title}</h3>
                <p className={styles.summary}>{b.summary}</p>
                <ul className={styles.facts}>
                  {b.facts.map((f) => <li key={f}>{f}</li>)}
                </ul>
                <div className={styles.actions}>
                  <a className={styles.primary} href={b.file} download={b.fileName}>
                    <Download size={18} aria-hidden="true" /> Download {b.id === 'engineering' ? 'Engineering' : 'Internship'} brochure (PDF, {b.size})
                  </a>
                  <a className={styles.secondary} href={b.file} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} aria-hidden="true" /> Read online
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
