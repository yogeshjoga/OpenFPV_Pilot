
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, PenTool, Globe, Building, Bot, GraduationCap, Coffee, Sparkles, Brain, BarChart, Eye, Plane, Telescope, Globe as GlobeIcon, Settings, Wrench, Activity, Layers, ChevronLeft, ChevronRight } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import { APP_NAME, APP_DESCRIPTION } from '@config/constants'
import styles from './About.module.css'

const VALUES = [
  { icon: <BookOpen size={24} />, title: 'Learn by Building', desc: 'Every lesson is hands-on, you build a real drone, not a simulation.' },
  { icon: <PenTool size={24} />, title: 'Zero to First Flight', desc: 'From soldering iron to freestyle, structured day-by-day programs for all levels.' },
  { icon: <Globe size={24} />, title: 'Premium Platform', desc: 'No paywalls, no subscriptions. Every guide, schematic, and resource is available to everyone.' },
]

const TAGS = [
  { icon: <Plane size={16} />, label: 'DGCA Certified Drone Pilot' },
  { icon: <Building size={16} />, label: 'Founder, Urussys' },
  { icon: <Bot size={16} />, label: 'AI Systems Architect' },
  { icon: <Brain size={16} />, label: 'Agentic AI & LLMs' },
  { icon: <Telescope size={16} />, label: 'FPV & Drone Research' },
  { icon: <GraduationCap size={16} />, label: 'Corporate Trainer' },
]

const SANTHOSH_TAGS = [
  { icon: <Settings size={16} />, label: 'Mechanical Engineer' },
  { icon: <Plane size={16} />, label: 'FPV Drone Pilot' },
  { icon: <Wrench size={16} />, label: 'CAD/CAM Designer' },
  { icon: <Activity size={16} />, label: 'Simulation & Analysis' },
  { icon: <Layers size={16} />, label: 'CATIA & 3DExperience' },
  { icon: <Telescope size={16} />, label: 'Design Researcher' },
]

const TEAM_MEMBERS = [
  {
    id: 'yogesh',
    name: 'Yogesh Joga',
    role: 'Founder & Creator',
    bio: 'DGCA Certified Drone Pilot and AI Systems Architect with expertise in Agentic AI, Autonomous Systems, and Software Engineering. Founder of Urussys, focused on developing intelligent technologies, practical engineering education, and advanced FPV drone programs.',
    image: '/images/yogesh-joga.jpg',
    badgeText: 'DGCA Certified',
    tags: TAGS,
    glowStyle: {},
    links: [
      { id: 'founder-linkedin-link', label: 'LinkedIn', url: 'https://www.linkedin.com/in/yogeshjoga/', isLinkedin: true },
      { id: 'founder-website-link', label: 'urussys.com', url: 'https://urussys.com', isLinkedin: false }
    ]
  },
  {
    id: 'santhosh',
    name: 'Santhosh Kumar',
    role: 'Design Researcher & Engineer',
    bio: 'Mechanical Engineer and FPV Drone Pilot specializing in CAD/CAM design, complex simulations, and product validation within the CATIA & 3DExperience ecosystems. Dedicated to advanced design research, structural optimization, and next-generation aerial platform development.',
    image: '/images/santhosh-kumar.jpg',
    badgeText: 'FPV Pilot',
    tags: SANTHOSH_TAGS,
    glowStyle: { filter: 'blur(18px) hue-rotate(185deg)' },
    links: [
      { id: 'santhosh-linkedin-link', label: 'LinkedIn', url: 'https://www.linkedin.com/', isLinkedin: true }
    ]
  }
]

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? 60 : -60,
    opacity: 0,
    transition: {
      x: { type: "tween", ease: "easeIn", duration: 0.08 },
      opacity: { type: "tween", ease: "linear", duration: 0.08 }
    }
  })
}

export default function About() {
  const [[page, direction], setPage] = useState([0, 0])

  const paginate = (newDirection) => {
    const nextIdx = (page + newDirection + TEAM_MEMBERS.length) % TEAM_MEMBERS.length
    setPage([nextIdx, newDirection])
  }

  const currentMember = TEAM_MEMBERS[page]

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

            <div className={styles.sliderContainer}>
              {/* Prev Button */}
              <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={() => paginate(-1)} aria-label="Previous Slide">
                <ChevronLeft size={24} />
              </button>

              <div className={styles.sliderWindow}>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentMember.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "tween", ease: "easeOut", duration: 0.18 },
                      opacity: { type: "tween", ease: "linear", duration: 0.15 }
                    }}
                    className={styles.founderCard}
                  >
                    {/* Photo */}
                    <div className={styles.photoWrap}>
                      <div className={styles.photoGlow} style={currentMember.glowStyle} />
                      <img
                        src={currentMember.image}
                        alt={currentMember.name}
                        className={styles.photo}
                      />
                      <div className={styles.dgcaBadge}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Plane size={18} /> {currentMember.badgeText}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className={styles.founderInfo}>
                      <p className={styles.eyebrow}>{currentMember.role}</p>
                      <h3 className={styles.founderName}>{currentMember.name}</h3>

                      <p className={styles.founderBio}>
                        {currentMember.bio}
                      </p>

                      {/* Tag pills */}
                      <div className={styles.tags}>
                        {currentMember.tags.map(t => (
                          <span key={t.label} className={styles.tag}>
                            {t.icon} {t.label}
                          </span>
                        ))}
                      </div>

                      {/* Links */}
                      <div className={styles.socialRow}>
                        {currentMember.links.map(link => (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.websiteBtn}
                            id={link.id}
                          >
                            {link.isLinkedin ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 8 }}>
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                              </svg>
                            ) : (
                              <GlobeIcon size={18} style={{ marginRight: 8 }} />
                            )}
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Next Button */}
              <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={() => paginate(1)} aria-label="Next Slide">
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Pagination Dots */}
            <div className={styles.dotsContainer}>
              {TEAM_MEMBERS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newDir = index > page ? 1 : -1
                    setPage([index, newDir])
                  }}
                  className={`${styles.dot} ${page === index ? styles.activeDot : ''}`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </PageWrapper>
  )
}
