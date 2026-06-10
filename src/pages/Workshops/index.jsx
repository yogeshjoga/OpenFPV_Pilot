import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Plane, Microscope, Gamepad2, Building2, MonitorPlay, BookOpen, Atom, Wind, FileText, Wrench, Bot, Settings, Battery, Flame, Award, Lightbulb, PenTool, BatteryCharging, Plug, Zap, Sprout } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import SidebarMenu from '@components/common/SidebarMenu'
import styles from './Workshops.module.css'

// ── Data ──────────────────────────────────────────────────────
const AUDIENCES = [
  { icon: <GraduationCap size={24} />, label: 'B.Tech / B.E / B.Sc Students' },
  { icon: <Plane size={24} />, label: 'Aviation Students' },
  { icon: <Microscope size={24} />, label: 'Researchers' },
  { icon: <Gamepad2 size={24} />, label: 'Hobbyists' },
  { icon: <Building2 size={24} />, label: 'Universities & Colleges' },
]

const LEVELS = [
  {
    id: 'level3',
    badge: 'Level 3',
    emoji: <Award size={24} />,
    title: 'Simulation Skill Certificate',
    subtitle: 'Team-Based • Group Controllers',
    color: '#22c55e',
    duration: '1 Week',
    cert: 'Simulation Based Skill Certificate',
    includes: [
      { icon: <Gamepad2 size={16} />, text: 'Shared controller — team-wise rotation' },
      { icon: <MonitorPlay size={16} />, text: 'Full simulation practice sessions' },
      { icon: <BookOpen size={16} />, text: 'Theory: Drone fundamentals & regulations' },
      { icon: <Atom size={16} />, text: 'Physics of flight & UAV mechanics' },
      { icon: <Wind size={16} />, text: 'Aerodynamics principles' },
      { icon: <FileText size={16} />, text: 'Level 3 Simulation Skill Certificate' },
    ],
  },
  {
    id: 'level2',
    badge: 'Level 2',
    emoji: <Award size={24} />,
    title: 'Moderate Skill Certificate',
    subtitle: 'Individual Controller • Cinewoop Flying',
    color: '#f59e0b',
    duration: '1 Week',
    cert: 'Moderate Skill Certificate',
    includes: [
      { icon: <Gamepad2 size={16} />, text: 'Personal controller for each student' },
      { icon: <MonitorPlay size={16} />, text: '1-week simulation training' },
      { icon: <Plane size={16} />, text: 'Cinewoop indoor + outdoor practice' },
      { icon: <BookOpen size={16} />, text: 'Theory: Drone systems & components' },
      { icon: <Atom size={16} />, text: 'Physics & flight dynamics' },
      { icon: <Wind size={16} />, text: 'Aerodynamics principles' },
      { icon: <FileText size={16} />, text: 'Level 2 Moderate Skill Certificate' },
    ],
  },
  {
    id: 'level1',
    badge: 'Level 1',
    emoji: <Award size={24} />,
    title: 'Professional Certificate',
    subtitle: 'Full Build • AI Integration • Pro Certificate',
    color: '#ef4444',
    duration: '1 Week',
    cert: 'Professional Certificate (DGCA Eligible)',
    highlight: 'DGCA Eligible',
    includes: [
      { icon: <Gamepad2 size={16} />, text: 'Personal controller for each student' },
      { icon: <MonitorPlay size={16} />, text: '1-week simulation training' },
      { icon: <Plane size={16} />, text: 'Cinewoop indoor + outdoor practice' },
      { icon: <BookOpen size={16} />, text: 'Theory, physics & aerodynamics' },
      { icon: <Wrench size={16} />, text: 'In-depth drone component knowledge' },
      { icon: <Bot size={16} />, text: 'AI / ML model integration' },
      { icon: <PenTool size={16} />, text: 'FPV drone build from scratch' },
      { icon: <Settings size={16} />, text: 'Component selection & battery packing' },
      { icon: <BatteryCharging size={16} />, text: 'Assembly & troubleshooting' },
      { icon: <MonitorPlay size={16} />, text: 'ESC / FC programming' },
      { icon: <Flame size={16} />, text: 'Soldering skills' },
      { icon: <Award size={16} />, text: 'Professional Certificate — DGCA eligible' },
    ],
  },
]

const DOMAINS = [
  {
    icon: <MonitorPlay size={32} />,
    branch: 'CSE / Computer Science',
    color: '#6366f1',
    focus: 'Drone Monitoring & Dashboard Development',
    topics: ['Drone telemetry dashboards', 'Agriculture drone monitoring', 'Domain-specific data pipelines', 'Real-time sensor visualization'],
  },
  {
    icon: <Zap size={32} />,
    branch: 'ECE / EEE',
    color: '#f59e0b',
    focus: 'Drone Repair, ESC & FC Board Design',
    topics: ['Drone troubleshooting & repair', 'ESC design & programming', 'FC board layout & soldering', 'Signal & power management'],
  },
  {
    icon: <Settings size={32} />,
    branch: 'Mechanical Engineering',
    color: '#22c55e',
    focus: 'Frame Design, Fabrication & 3D Printing',
    topics: ['Drone frame structural analysis', 'CAD modelling & 3D printing', 'Material selection & fabrication', 'Weight-to-thrust optimization'],
  },
  {
    icon: <Bot size={32} />,
    branch: 'AI / ML / CS (Advanced)',
    color: '#00d4ff',
    focus: 'Autonomous Drones with AI / ML / DL',
    topics: ['Autopilot using AI/ML/Deep Learning', 'Computer vision object detection', 'FPV fighter drone AI systems', 'Edge AI model deployment on FC'],
  },
  {
    icon: <Sprout size={32} />,
    branch: 'Other Domains',
    color: '#a78bfa',
    focus: 'Structured Syllabus in Progress',
    topics: ['Civil & environmental monitoring', 'Surveying & mapping drones', 'Medical / disaster response UAVs', 'Custom syllabi being developed ✦'],
  },
]

// ── Component ──────────────────────────────────────────────────
export default function Workshops() {
  const [activeLevel, setActiveLevel] = useState('level1')
  const level = LEVELS.find(l => l.id === activeLevel)

  return (
    <PageWrapper>
      <div className={styles.page}>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className={styles.heroContent}
            >
              <p className={styles.eyebrow}>University &amp; College Workshops</p>
              <h1 className={styles.heroTitle}>
                Learn to <span className="gradient-text">Build</span>, Fly &amp; <span className="gradient-text">Innovate</span>
              </h1>
              <p className={styles.heroSub}>
                Week-based structured drone workshops for universities, engineering colleges,
                aviation students, researchers &amp; hobbyists. Three certification levels —
                simulation to professional.
              </p>

              {/* Audience pills */}
              <div className={styles.audienceRow}>
                {AUDIENCES.map(a => (
                  <span key={a.label} className={styles.audiencePill}>
                    {a.icon} {a.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── CERTIFICATION LEVELS ── */}
        <section className={`section ${styles.levelsSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>🏆 Certification Levels</h2>
            <p className={styles.sectionSub}>Choose the right level for your institution. All programs are 1-week intensive workshops.</p>

            {/* Layout Wrapper */}
            <div className={styles.levelsSplitLayout}>
              <div className={styles.sidebarWrap}>
                <SidebarMenu
                  items={LEVELS.map(l => ({ id: l.id, icon: l.emoji, label: l.title, badge: l.badge, color: l.color }))}
                  activeId={activeLevel}
                  onSelect={setActiveLevel}
                  layoutIdPrefix="workshops"
                  label="Levels"
                />
              </div>

            {/* Level detail card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeLevel}
                className={styles.levelCard}
                style={{ '--level-color': level.color }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35 }}
              >
                <div className={styles.levelCardHeader}>
                  <div>
                    <div className={styles.levelBadgeLarge} style={{ background: level.color }}>
                      {level.badge}
                    </div>
                    <h3 className={styles.levelCardTitle}>{level.title}</h3>
                    <p className={styles.levelCardSub}>{level.subtitle}</p>
                  </div>
                  <div className={styles.levelMeta}>
                    <div className={styles.metaChip}>📅 {level.duration}</div>
                    {level.highlight && (
                      <div className={styles.dgcaChip}>🏛️ {level.highlight}</div>
                    )}
                  </div>
                </div>

                <div className={styles.includeGrid}>
                  {level.includes.map((item, i) => (
                    <motion.div
                      key={i}
                      className={styles.includeItem}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <span className={styles.includeIcon}>{item.icon}</span>
                      <span className={styles.includeText}>{item.text}</span>
                    </motion.div>
                  ))}
                </div>

                <div className={styles.certBanner}>
                  <span className={styles.certIcon}>📜</span>
                  <span className={styles.certText}>Certificate: <strong>{level.cert}</strong></span>
                </div>
              </motion.div>
                </AnimatePresence>
            </div>
          </div>
        </section>

        {/* ── DGCA CALLOUT ── */}
        <section className={styles.dgcaSection}>
          <div className="container">
            <motion.div
              className={styles.dgcaCard}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className={styles.dgcaEmoji}>🏛️</span>
              <div>
                <h3 className={styles.dgcaTitle}>DGCA Certification Pathway</h3>
                <p className={styles.dgcaDesc}>
                  Students who complete the <strong>Level 1 Professional Certificate</strong> are
                  eligible to apply for the <strong>DGCA Remote Pilot Certificate</strong> —
                  India's official drone pilot licence.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── DOMAIN TRACKS ── */}
        <section className={`section ${styles.domainsSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>🎯 Domain-Based Tracks</h2>
            <p className={styles.sectionSub}>Specialised courses built for your engineering branch and career goals.</p>

            <div className={styles.domainsGrid}>
              {DOMAINS.map((d, i) => (
                <motion.div
                  key={d.branch}
                  className={styles.domainCard}
                  style={{ '--domain-color': d.color }}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                >
                  <div className={styles.domainIcon}>{d.icon}</div>
                  <div className={styles.domainBranch}>{d.branch}</div>
                  <div className={styles.domainFocus}>{d.focus}</div>
                  <ul className={styles.domainTopics}>
                    {d.topics.map((t, j) => (
                      <li key={j} className={styles.domainTopic}>
                        <span style={{ color: d.color }}>▸</span> {t}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT / CTA ── */}
        <section className={styles.contactSection}>
          <div className="container">
            <motion.div
              className={styles.contactCard}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className={styles.eyebrow}>Bring Workshops to Your Institution</p>
              <h2 className={styles.contactTitle}>
                Want to conduct a workshop at your<br />
                <span className="gradient-text">College or University?</span>
              </h2>
              <p className={styles.contactSub}>
                We partner with universities and engineering colleges across India to deliver
                hands-on drone education. Reach out to discuss scheduling, requirements, and pricing.
              </p>

              <div className={styles.contactInfoRow}>
                <a
                  href="tel:+919110566354"
                  className={styles.phoneBtn}
                  id="workshop-phone-cta"
                >
                  📞 +91 9110566354
                </a>
                <a
                  href="https://github.com/yogeshjoga"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.githubBtn}
                  id="workshop-github-cta"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  yogeshjoga
                </a>
              </div>

              <div className={styles.founderCredit}>
                <img
                  src="/images/yogesh-joga.jpg"
                  alt="Yogesh Joga"
                  className={styles.founderThumb}
                />
                <div>
                  <p className={styles.founderName}>Yogesh Joga</p>
                  <p className={styles.founderTitle}>Founder — EGIREROBOTICS &amp; urussys.com · DGCA Certified Drone Pilot</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </PageWrapper>
  )
}
