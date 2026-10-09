import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { fetchPartners } from '@lib/siteApi'
import styles from './PartnersSection.module.css'

/** Our logo first, then the partners added in the CRM. Renders nothing until at least one partner is published. */
export default function PartnersSection() {
  const [partners, setPartners] = useState([])

  useEffect(() => {
    let live = true
    fetchPartners()
      .then((list) => live && setPartners(list))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [])

  if (partners.length === 0) return null

  return (
    <section className={`section ${styles.section}`} aria-labelledby="partners-title">
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.eyebrow}>Partners and collaborations</p>
          <h2 id="partners-title" className={styles.title}>
            Who we build FPV training with
          </h2>
          <p className={styles.lead}>Colleges, companies and communities we work with to bring hands-on drone training to students.</p>
        </motion.div>

        <ul className={styles.grid}>
          <li className={styles.tile}>
            <img src="/images/logo-egire-robotics.png" alt="EGIRE Robotics" className={styles.logo} loading="lazy" />
          </li>
          {partners.map((p) => {
            const logo = <img src={p.logo} alt={p.name} className={styles.logo} loading="lazy" />
            return (
              <li key={p.id} className={styles.tile}>
                {p.url ? (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className={styles.link} aria-label={`${p.name} (opens in a new tab)`}>
                    {logo}
                  </a>
                ) : (
                  logo
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
