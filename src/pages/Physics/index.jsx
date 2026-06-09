
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageWrapper from '@components/layout/PageWrapper'
import SidebarMenu from '@components/common/SidebarMenu'
import { PHYSICS_SECTIONS } from '@data/physicsData'
import styles from './Physics.module.css'

export default function Physics() {
  const [activeSectionId, setActiveSectionId] = useState(PHYSICS_SECTIONS[0].id)
  const activeSection = PHYSICS_SECTIONS.find(s => s.id === activeSectionId)

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
              <p className={styles.eyebrow}>Educational Guide</p>
              <h1 className={styles.title}>The Physics of <span className="gradient-text">Flight</span></h1>
              <p className={styles.sub}>
                Understanding the aerodynamic and mechanical forces that govern FPV drone performance. 
                A pin-to-pin guide for students and researchers.
              </p>
            </motion.div>
          </div>
        </header>

        {/* Content Sections */}
        <div className="container">
          <div className={styles.splitLayout}>
            <div className={styles.sidebarWrap}>
              <SidebarMenu
                items={PHYSICS_SECTIONS.map(s => ({
                  id: s.id,
                  icon: s.icon,
                  label: s.title,
                  color: '#00d4ff'
                }))}
                activeId={activeSectionId}
                onSelect={setActiveSectionId}
                layoutIdPrefix="physics"
                label="Topics"
              />
            </div>
            
            <div className={styles.contentWrap}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                >
                  <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionIcon}>{activeSection.icon}</span>
                      <div>
                        <h2 className={styles.sectionTitle}>{activeSection.title}</h2>
                        <p className={styles.sectionDesc}>{activeSection.description}</p>
                      </div>
                    </div>

                    <div className={styles.grid}>
                      {activeSection.topics.map((topic, tIndex) => (
                        <motion.article
                          key={topic.id}
                          className={styles.card}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-50px' }}
                          transition={{ delay: tIndex * 0.1, duration: 0.5 }}
                        >
                          <Link to={`/physics/${activeSection.id}/${topic.id}`} className={styles.cardLink}>
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
                  </section>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

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
