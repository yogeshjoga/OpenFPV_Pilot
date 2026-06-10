
import { motion } from 'framer-motion'
import { BookOpen, PenTool, Globe, Building, Bot, GraduationCap, Coffee, Sparkles, Brain, BarChart, Eye, Plane, Telescope, Globe as GlobeIcon } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import { APP_NAME, APP_DESCRIPTION } from '@config/constants'
import styles from './About.module.css'

const VALUES = [
  { icon: <BookOpen size={24} />, title: 'Learn by Building', desc: 'Every lesson is hands-on — you build a real drone, not a simulation.' },
  { icon: <PenTool size={24} />, title: 'Zero to First Flight', desc: 'From soldering iron to freestyle — structured day-by-day programs for all levels.' },
  { icon: <Globe size={24} />, title: 'Premium Platform', desc: 'No paywalls, no subscriptions. Every guide, schematic, and resource is available to everyone.' },
]

const TAGS = [
  { icon: <Building size={16} />, label: 'Founder — urussys.com' },
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
                  Founder of <a href="https://urussys.com" target="_blank" rel="noreferrer" className={styles.link}>urussys.com</a> — an Agentic AI Developer &amp; Architect, Corporate Trainer specialising in Java Full Stack, Generative AI, Agentic AI, LLMs, Machine Learning, Data Science, and Computer Vision. Also a <strong>DGCA Certified Drone Pilot</strong> and passionate FPV researcher building the future of drone education.
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
                    href="https://github.com/yogeshjoga"
                    target="_blank"
                    rel="noreferrer"
                    className={styles.githubBtn}
                    id="founder-github-link"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    github.com/yogeshjoga
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
