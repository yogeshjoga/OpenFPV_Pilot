import { Link } from 'react-router-dom'
import { ArrowRight, Bot, Building2, MonitorPlay, Plane } from 'lucide-react'
import styles from './ProgramsComingSoon.module.css'

// The other kinds of program we run or are preparing, so a visitor sees the whole list in one place.
// `open: true` means it can be booked now; everything else is announced ahead of time.
const NEXT = [
  {
    id: 'college',
    icon: Building2,
    status: 'Book for your college',
    open: true,
    title: 'Workshops for colleges',
    text: 'A short hands-on workshop at your campus, from the simulator to real flying, with certificates.',
    cta: 'See the workshop grades',
    to: '#grades',
  },
  {
    id: 'dgca',
    icon: Plane,
    status: 'Coming soon',
    title: 'DGCA drone pilot training',
    text: 'Training towards the official drone pilot licence, for students and working professionals.',
    cta: 'Tell me when it opens',
    to: '/enquire?from=programs-dgca',
  },
  {
    id: 'robotics-ai',
    icon: Bot,
    status: 'Coming soon',
    title: 'Robotics and AI engineering',
    text: 'Build robots and AI systems with ROS 2, Python and computer vision, project by project.',
    cta: 'Tell me when it opens',
    to: '/enquire?from=programs-robotics-ai',
  },
  {
    id: 'internships',
    icon: MonitorPlay,
    status: 'More coming',
    title: 'More online internships',
    text: 'New topics beyond drone technology, taught online so you can join from anywhere.',
    cta: 'Tell me when it opens',
    to: '/enquire?from=programs-internships',
  },
]

export default function ProgramsComingSoon({ id = 'coming-soon' }) {
  return (
    <section id={id} className={`section ${styles.section}`} aria-labelledby={`${id}-title`}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>What is next</p>
          <h2 id={`${id}-title`} className={styles.title}>More programs are on the way</h2>
          <p className={styles.sub}>Leave your details and we will message you the day a new program opens.</p>
        </div>

        <ul className={styles.grid}>
          {NEXT.map(({ id: key, icon: Icon, status, open, title, text, cta, to }) => (
            <li key={key} className={styles.card}>
              <div className={styles.top}>
                <span className={styles.icon}><Icon size={22} aria-hidden="true" /></span>
                <span className={open ? styles.open : styles.soon}>{status}</span>
              </div>
              <h3 className={styles.name}>{title}</h3>
              <p className={styles.text}>{text}</p>
              {to.startsWith('#')
                ? <a className={styles.link} href={to}>{cta} <ArrowRight size={16} aria-hidden="true" /></a>
                : <Link className={styles.link} to={to}>{cta} <ArrowRight size={16} aria-hidden="true" /></Link>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
