// ================================
// Page — Training Academy
// ================================

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import { COURSES } from '@data/training'
import styles from './Training.module.css'

export default function Training() {
  const [activeCourse, setActiveCourse] = useState(COURSES[0]?.id || '')
  const [openDay, setOpenDay] = useState(null)

  const course = COURSES.find((c) => c.id === activeCourse) || null

  return (
    <PageWrapper>
      <div className={styles.page}>

        {/* ========= HEADER ========= */}
        <section className={styles.header}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <p className={styles.eyebrow}>// Academy</p>
              <h1 className={styles.title}>
                FPV Training <span className="gradient-text">Academy</span>
              </h1>
              <p className={styles.sub}>
                Structured day-by-day programs to take you from unboxing to your first
                freestyle flight — designed by professional FPV pilots.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ========= COURSE TABS ========= */}
        <div className="container">
          <div className={styles.courseTabs}>
            {COURSES.map((c) => (
              <button
                key={c.id}
                className={`${styles.courseTab} ${activeCourse === c.id ? styles.activeTab : ''}`}
                onClick={() => { setActiveCourse(c.id); setOpenDay(null) }}
                style={{ '--tab-color': c.color }}
              >
                <span className={styles.tabIcon}>{c.icon}</span>
                <span className={styles.tabLabel}>{c.title}</span>
                {c.badge && <span className={styles.tabBadge}>{c.badge}</span>}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCourse}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              {course && (
                <>
                  {/* ===== COURSE OVERVIEW ===== */}
                  <div className={styles.overview}>
                    <div className={styles.overviewLeft}>
                  <span className={styles.overviewIcon}>{course.icon}</span>
                  <div>
                    <h2 className={styles.courseTitle}>{course.title}</h2>
                    <p className={styles.courseSubtitle}>{course.subtitle}</p>
                  </div>
                </div>
                <div className={styles.overviewStats}>
                  <Stat icon="📅" label="Duration" value={course.duration} />
                  <Stat icon="⏱" label="Total Hours" value={`${course.totalHours}h`} />
                  <Stat icon="📊" label="Level" value={course.level} />
                  <Stat icon="📆" label="Sessions" value={`${course.syllabus.length} Days`} />
                </div>
              </div>

              {/* ===== PROGRESS STRIP ===== */}
              <div className={styles.progressStrip}>
                {course.syllabus.map((day) => (
                  <button
                    key={day.day}
                    className={`${styles.dayDot} ${openDay === day.day ? styles.activeDot : ''}`}
                    onClick={() => setOpenDay(openDay === day.day ? null : day.day)}
                    title={`Day ${day.day}: ${day.title}`}
                    style={{ '--dot-color': course.color }}
                  >
                    {day.day}
                  </button>
                ))}
              </div>

              {/* ===== SYLLABUS ACCORDION ===== */}
              <div className={styles.syllabus}>
                {course.syllabus.map((day, i) => (
                  <DayCard
                    key={day.day}
                    day={day}
                    index={i}
                    isOpen={openDay === day.day}
                    onToggle={() => setOpenDay(openDay === day.day ? null : day.day)}
                    color={course.color}
                  />
                ))}
              </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>



      </div>
    </PageWrapper>
  )
}

/* ===========================
   Sub-components
=========================== */

function Stat({ icon, label, value }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statIcon}>{icon}</span>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  )
}

function DayCard({ day, index, isOpen, onToggle, color }) {
  return (
    <motion.div
      className={`${styles.dayCard} ${isOpen ? styles.dayCardOpen : ''}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      style={{ '--card-color': color }}
    >
      {/* Header row */}
      <button className={styles.dayHeader} onClick={onToggle} aria-expanded={isOpen}>
        <div className={styles.dayMeta}>
          <span className={styles.dayNum} style={{ background: color }}>
            Day {day.day}
          </span>
          <div>
            <h3 className={styles.dayTitle}>{day.title}</h3>
            <p className={styles.dayDuration}>⏱ {day.duration}</p>
          </div>
        </div>
        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>›</span>
      </button>

      {/* Accordion body */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            className={styles.dayBody}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={styles.dayContent}>
              {/* Topics */}
              <div className={styles.section}>
                <h4 className={styles.sectionHeading}>📚 Topics Covered</h4>
                <ul className={styles.topicList}>
                  {day.topics.map((t, i) => (
                    <li key={i} className={styles.topicItem}>
                      <span className={styles.bullet} style={{ color }}>▸</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Practicals */}
              <div className={styles.section}>
                <h4 className={styles.sectionHeading}>🛠 Practicals</h4>
                <ul className={styles.practicalList}>
                  {day.practicals.map((p, i) => (
                    <li key={i} className={styles.practicalItem}>
                      <span className={styles.checkIcon}>✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div className={styles.section}>
                <h4 className={styles.sectionHeading}>📎 Resources</h4>
                <div className={styles.resourceList}>
                  {day.resources.map((r, i) => (
                    <span key={i} className={styles.resourceTag} style={{ borderColor: color + '55', color }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}


