import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Plane, Microscope, Gamepad2, Building2, MonitorPlay, BookOpen, Atom, Wind, FileText, Wrench, Bot, Settings, Battery, Flame, Award, Lightbulb, PenTool, BatteryCharging, Plug, Zap, Sprout, Calendar, Landmark, Phone, ChevronRight, ArrowRight, MapPin, Users, Code, Cpu, Brain, Eye, Sliders, Download, Map } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import SidebarMenu from '@components/common/SidebarMenu'
import styles from './Workshops.module.css'
import useDocumentMeta from '@lib/useDocumentMeta'

// ── Data ──────────────────────────────────────────────────────
const AUDIENCES = [
  { icon: <GraduationCap size={18} />, label: 'B.Tech / B.E / B.Sc Students' },
  { icon: <Plane size={18} />, label: 'Aviation Students' },
  { icon: <Microscope size={18} />, label: 'Researchers' },
  { icon: <Gamepad2 size={18} />, label: 'Hobbyists' },
  { icon: <Building2 size={18} />, label: 'Universities & Colleges' },
  { icon: <Users size={18} />, label: 'Learners aged 5 to 45' },
]

const LEVELS = [
  {
    id: 'special',
    badge: '90 Days',
    emoji: <Award size={24} />,
    title: 'EGIRE Robotics Special Course',
    subtitle: 'Complete 90-Day Course • Drones, AI & Robotics',
    color: '#3e6aa8',
    duration: '90 Days',
    includes: [
      { icon: <Settings size={16} />, text: 'Basics of engineering' },
      { icon: <Zap size={16} />, text: 'Basics of electronics' },
      { icon: <Code size={16} />, text: 'Moderate knowledge of coding in C++ and Python' },
      { icon: <Bot size={16} />, text: 'ROS 2 and NVIDIA Isaac robotics' },
      { icon: <Lightbulb size={16} />, text: 'Robotics projects' },
      { icon: <Cpu size={16} />, text: 'Develop your own FC and ESC for an FPV drone' },
      { icon: <Brain size={16} />, text: 'AI integration' },
      { icon: <Eye size={16} />, text: 'Computer vision, YOLO and Roboflow' },
      { icon: <MonitorPlay size={16} />, text: 'Angle, Acro and 3D mode simulation practice: 60 hours' },
      { icon: <Plane size={16} />, text: 'Free flying: tiny whoops, cinewoops, freestyle FPV and DJI drones' },
      { icon: <Map size={16} />, text: 'Advanced cinematography, mapping, surveillance and security, 3D mapping, thermal scanning and GIS scanning' },
      { icon: <PenTool size={16} />, text: 'Build end-to-end FPV drones' },
      { icon: <Sliders size={16} />, text: 'PID configuration' },
      { icon: <Download size={16} />, text: 'Betaflight, INAV and all firmware flashing software' },
      { icon: <Wrench size={16} />, text: 'Repair of all types of drones and sensors' },
    ],
  },
  {
    id: 'level3',
    badge: 'Grade 3',
    emoji: <Award size={24} />,
    title: 'Simulation Skill Certificate',
    subtitle: 'Team-Based • Group Controllers',
    color: '#4f8a4b',
    duration: '1 Week',
    cert: 'Simulation Based Skill Certificate',
    includes: [
      { icon: <Gamepad2 size={16} />, text: 'Shared controller, team-wise rotation' },
      { icon: <MonitorPlay size={16} />, text: 'Full simulation practice sessions' },
      { icon: <BookOpen size={16} />, text: 'Theory: Drone fundamentals & regulations' },
      { icon: <Atom size={16} />, text: 'Physics of flight & UAV mechanics' },
      { icon: <Wind size={16} />, text: 'Aerodynamics principles' },
      { icon: <FileText size={16} />, text: 'Grade 3 Simulation Skill Certificate' },
    ],
  },
  {
    id: 'level2',
    badge: 'Grade 2',
    emoji: <Award size={24} />,
    title: 'Moderate Skill Certificate',
    subtitle: 'Individual Controller • Cinewoop Flying',
    color: '#b8862b',
    duration: '1 Week',
    cert: 'Moderate Skill Certificate',
    includes: [
      { icon: <Gamepad2 size={16} />, text: 'Personal controller for each student' },
      { icon: <MonitorPlay size={16} />, text: '1-week simulation training' },
      { icon: <Plane size={16} />, text: 'Cinewoop indoor + outdoor practice' },
      { icon: <BookOpen size={16} />, text: 'Theory: Drone systems & components' },
      { icon: <Atom size={16} />, text: 'Physics & flight dynamics' },
      { icon: <Wind size={16} />, text: 'Aerodynamics principles' },
      { icon: <FileText size={16} />, text: 'Grade 2 Moderate Skill Certificate' },
    ],
  },
  {
    id: 'level1',
    badge: 'Grade 1',
    emoji: <Award size={24} />,
    title: 'Professional Certificate',
    subtitle: 'Full Build • AI Integration • Pro Certificate',
    color: '#b94a3c',
    duration: '1 Week',
    cert: 'Professional Certificate',
    highlight: 'Certification Included',
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
      { icon: <Award size={16} />, text: 'Professional Certificate' },
    ],
  },
]

const DOMAINS = [
  {
    icon: <MonitorPlay size={32} />,
    branch: 'CSE / Computer Science',
    color: '#3e6aa8',
    focus: 'Drone Monitoring & Dashboard Development',
    topics: ['Drone telemetry dashboards', 'Agriculture drone monitoring', 'Domain-specific data pipelines', 'Real-time sensor visualization'],
  },
  {
    icon: <Zap size={32} />,
    branch: 'ECE / EEE',
    color: '#b8862b',
    focus: 'Drone Repair, ESC & FC Board Design',
    topics: ['Drone troubleshooting & repair', 'ESC design & programming', 'FC board layout & soldering', 'Signal & power management'],
  },
  {
    icon: <Settings size={32} />,
    branch: 'Mechanical Engineering',
    color: '#4f8a4b',
    focus: 'Frame Design, Fabrication & 3D Printing',
    topics: ['Drone frame structural analysis', 'CAD modelling & 3D printing', 'Material selection & fabrication', 'Weight-to-thrust optimization'],
  },
  {
    icon: <Bot size={32} />,
    branch: 'AI / ML / CS (Advanced)',
    color: '#3e6aa8',
    focus: 'Autonomous Drones with AI / ML / DL',
    topics: ['Autopilot using AI/ML/Deep Learning', 'Computer vision object detection', 'FPV fighter drone AI systems', 'Edge AI model deployment on FC'],
  },
  {
    icon: <Sprout size={32} />,
    branch: 'Other Domains',
    color: '#8a5a9e',
    focus: 'Structured Syllabus in Progress',
    topics: ['Civil & environmental monitoring', 'Surveying & mapping drones', 'Medical / disaster response UAVs', 'Custom syllabi being developed'],
  },
]

// ── Component ──────────────────────────────────────────────────
export default function Workshops() {
  useDocumentMeta('College Drone, AI & Robotics Workshops | EGIRE Robotics', 'Hands-on FPV drone, AI and robotics workshops and a 90-day course for universities, engineering colleges and learners aged 5 to 45.')
  const [activeLevel, setActiveLevel] = useState('special')
  const level = LEVELS.find(l => l.id === activeLevel)

  return (
    <PageWrapper>
      <div className={styles.page}>

        {/* ── HERO ── */}
        <section className={styles.hero}>
          <div className={`container ${styles.heroGrid}`}>
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
                Structured, hands-on drone workshops for universities and engineering colleges, with
                three certification grades that take students from simulation to professional flying.
              </p>

              <div className={styles.heroCtas}>
                <Link to="/enquire?type=college&from=workshops-hero" className={styles.ctaPrimary}>
                  Book a workshop <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a href="#grades" className={styles.ctaSecondary}>
                  View certification grades
                </a>
              </div>

              <div className={styles.designedFor}>
                <span className={styles.designedForLabel}>Designed for</span>
                <ul className={styles.designedForList}>
                  {AUDIENCES.map(a => (
                    <li key={a.label}>
                      {a.icon} {a.label}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.figure
              className={styles.heroPhoto}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              <img
                src="/gallery/sivani-srikakulam/thumb/sivani-group.webp"
                alt="Students and the EGIRE Robotics team at a drone workshop"
                width="800"
                height="450"
                fetchPriority="high"
                decoding="async"
              />
              <figcaption>
                <MapPin size={16} aria-hidden="true" />
                Workshop at Sivani Engineering College, Srikakulam
              </figcaption>
            </motion.figure>
          </div>
        </section>

        {/* ── CERTIFICATION LEVELS ── */}
        <section id="grades" className={`section ${styles.levelsSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Programs and certification grades</h2>
            <p className={styles.sectionSub}>Choose the right program for your institution. The three certification grades are 1-week intensive workshops, and the special course runs for 90 days.</p>

            {/* Layout Wrapper */}
            <div className={styles.levelsSplitLayout}>
              <div className={styles.sidebarWrap}>
                <SidebarMenu
                  items={LEVELS.map(l => ({ id: l.id, icon: l.emoji, label: l.title, badge: l.badge, color: l.color }))}
                  activeId={activeLevel}
                  onSelect={setActiveLevel}
                  layoutIdPrefix="workshops"
                  label="Programs"
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
                    <div className={styles.levelBadgeLarge} style={{ '--level-color': level.color }}>
                      {level.badge}
                    </div>
                    <h3 className={styles.levelCardTitle}>{level.title}</h3>
                    <p className={styles.levelCardSub}>{level.subtitle}</p>
                  </div>
                  <div className={styles.levelMeta}>
                    <div className={styles.metaChip}><Calendar size={14} /> {level.duration}</div>
                    {level.highlight && (
                      <div className={styles.dgcaChip}><Landmark size={14} /> {level.highlight}</div>
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

                {level.cert && (
                  <div className={styles.certBanner}>
                    <span className={styles.certIcon}><Award size={20} /></span>
                    <span className={styles.certText}>Certificate: <strong>{level.cert}</strong></span>
                  </div>
                )}
              </motion.div>
                </AnimatePresence>
            </div>
          </div>
        </section>



        {/* ── DOMAIN TRACKS ── */}
        <section className={`section ${styles.domainsSection}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>Domain-based tracks</h2>
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
                        <span style={{ color: `color-mix(in srgb, ${d.color} 50%, var(--color-text-primary))` }}><ChevronRight size={14} aria-hidden="true" /></span> {t}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT / CTA ── */}
        <section id="contact" className={styles.contactSection}>
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
                <Link to="/enquire?type=college&from=workshops-contact" className={styles.phoneBtn} id="workshop-enquire-cta">
                  Request a proposal <ArrowRight size={16} aria-hidden="true" />
                </Link>
                <a
                  href="tel:+919110566354"
                  className={styles.phoneBtn}
                  id="workshop-phone-cta"
                >
                  <Phone size={16} /> +91 9110566354
                </a>
                <a
                  href="https://www.linkedin.com/in/yogeshjoga/"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.websiteBtn}
                  id="workshop-linkedin-cta"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 'var(--space-2)' }}>
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                  LinkedIn
                </a>
              </div>

              <div className={styles.founderCredit}>
                <img
                  src="/gallery/workshop-1/thumb/roph9642.webp"
                  alt="Yogesh Joga"
                  className={styles.founderThumb}
                />
                <div>
                  <p className={styles.founderName}>Yogesh Joga</p>
                  <p className={styles.founderTitle}>Founder, EGIREROBOTICS &amp; urussys.com, DGCA Certified Drone Pilot</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </PageWrapper>
  )
}
