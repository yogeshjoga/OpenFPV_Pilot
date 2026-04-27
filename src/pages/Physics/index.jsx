// ================================
// Page — Physics
// ================================

import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageWrapper from '@components/layout/PageWrapper'
import { PHYSICS_SECTIONS } from '@data/physicsData'
import styles from './Physics.module.css'

export default function Physics() {
  return (
    <PageWrapper>
      <div className={styles.page}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className={styles.eyebrow}>// Educational Guide</p>
              <h1 className={styles.title}>The Physics of <span className="gradient-text">Flight</span></h1>
              <p className={styles.sub}>
                Understanding the aerodynamic and mechanical forces that govern FPV drone performance. 
                A pin-to-pin guide for students and researchers.
              </p>
            </motion.div>
          </div>
        </header>

        {/* Content Sections */}
        {PHYSICS_SECTIONS.map((section, sIndex) => (
          <section key={section.id} className={styles.section}>
            <div className="container">
              <div className={styles.sectionHeader}>
                <span className={styles.sectionIcon}>{section.icon}</span>
                <div>
                  <h2 className={styles.sectionTitle}>{section.title}</h2>
                  <p className={styles.sectionDesc}>{section.description}</p>
                </div>
              </div>

              <div className={styles.grid}>
                {section.topics.map((topic, tIndex) => (
                  <motion.article
                    key={topic.id}
                    className={styles.card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ delay: tIndex * 0.1, duration: 0.5 }}
                  >
                    <Link to={`/physics/${section.id}/${topic.id}`} className={styles.cardLink}>
                      <div className={styles.imageWrapper}>
                        <img 
                          src={topic.image} 
                          alt={topic.title} 
                          className={styles.image}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className={styles.cardContent}>
                        <h3 className={styles.cardTitle}>{topic.title}</h3>
                        <p className={styles.cardText}>{topic.explanation}</p>
                        <span className={styles.readMore}>Read Full Story →</span>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Closing Section */}
        <section className={styles.footer_note}>
          <div className="container">
            <div className={styles.noteBox}>
              <h3>✦ Scientific Rigor</h3>
              <p>
                This guide is designed for educational purposes, integrating principles from fluid dynamics, 
                classical mechanics, and electrical engineering as applied specifically to multirotor UAVs.
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
