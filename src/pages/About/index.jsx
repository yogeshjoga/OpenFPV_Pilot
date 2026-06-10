
import { motion } from 'framer-motion'
import { BookOpen, PenTool, Globe, Building, Bot, GraduationCap, Coffee, Sparkles, Brain, BarChart, Eye, Plane, Telescope, Globe as GlobeIcon } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import { APP_NAME, APP_DESCRIPTION } from '@config/constants'
import styles from './About.module.css'

const VALUES = [
  { icon: <BookOpen size={24} />, title: 'Learn by Building', desc: 'Every lesson is hands-on, you build a real drone, not a simulation.' },
  { icon: <PenTool size={24} />, title: 'Zero to First Flight', desc: 'From soldering iron to freestyle, structured day-by-day programs for all levels.' },
  { icon: <Globe size={24} />, title: 'Premium Platform', desc: 'No paywalls, no subscriptions. Every guide, schematic, and resource is available to everyone.' },
]

const TAGS = [
  { icon: <Building size={16} />, label: 'Founder, urussys.com' },
  { icon: <Bot size={16} />, label: 'Agentic AI Developer & Architect' },
  { icon: <GraduationCap size={16} />, label: 'Corporate Trainer' },
  { icon: <Coffee size={16} />, label: 'Java Full Stack' },
  { icon: <Sparkles size={16} />, label: 'Generative AI' },
  { icon: <Brain size={16} />, label: 'Agentic AI & LLMs' },
  { icon: <BarChart size={16} />, label: 'Machine Learning & Data Science' },
  { icon: <Eye size={16} />, label: 'Computer Vision' },
  { icon: <Plane size={16} />, label: 'DGCA Certified Drone Pilot' },
  { icon: <Telescope size={16} />, label: 'FPV & Drone Researcher' },
]

export default function About() {
  return (
    <PageWrapper>
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className="container">
            <motion.div
              className={styles.heroContent}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <p className={styles.eyebrow}>About Us</p>
              <h1 className={styles.title}>Built for Pilots,<br />by <span className="gradient-text">Pilots</span></h1>
              <p className={styles.sub}>{APP_DESCRIPTION}</p>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className={`section ${styles.valuesSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Our Values</h2>
            <div className={styles.valuesGrid}>
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.title}
                  className={styles.valueCard}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <span className={styles.valueIcon}>{v.icon}</span>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Founder / Team */}
        <section className={`section ${styles.teamSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>The Team</h2>

            <motion.div
              className={styles.founderCard}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Photo */}
              <div className={styles.photoWrap}>
                <div className={styles.photoGlow} />
                <img
                  src="/images/yogesh-joga.jpg"
                  alt="Yogesh Joga"
                  className={styles.photo}
                />
                <div className={styles.dgcaBadge}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Plane size={18} /> DGCA Certified</span>
                </div>
              </div>

              {/* Info */}
              <div className={styles.founderInfo}>
                <p className={styles.eyebrow}>Founder &amp; Creator</p>
                <h3 className={styles.founderName}>Yogesh Joga</h3>

                <p className={styles.founderBio}>
                  Founder of <a href="https://urussys.com" target="_blank" rel="noreferrer" className={styles.link}>urussys.com</a>, an Agentic AI Developer &amp; Architect, Corporate Trainer specialising in Java Full Stack, Generative AI, Agentic AI, LLMs, Machine Learning, Data Science, and Computer Vision. Also a <strong>DGCA Certified Drone Pilot</strong> and passionate FPV researcher building the future of drone education.
                </p>

                {/* Tag pills */}
                <div className={styles.tags}>
                  {TAGS.map(t => (
                    <span key={t.label} className={styles.tag}>
                      {t.icon} {t.label}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className={styles.socialRow}>
                  <a
                    href="https://www.linkedin.com/in/yogeshjoga/"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.websiteBtn}
                    id="founder-linkedin-link"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href="https://urussys.com"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.websiteBtn}
                    id="founder-website-link"
                  >
                    <GlobeIcon size={18} style={{ marginRight: 8 }} /> urussys.com
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
