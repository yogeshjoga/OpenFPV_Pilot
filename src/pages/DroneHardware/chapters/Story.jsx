import { Cpu, Flag, Flame, Gamepad2, MapPin, RadioTower, Shield, Unlock } from 'lucide-react'
import { Chapter } from '../parts.jsx'
import styles from '../DroneHardware.module.css'

// Small pictures for each stop on the road. Each is drawn in a 96 by 64 box with the site's own colours.
const dark = { fill: 'var(--color-text-primary)' }
const Wii = () => (
  <g>
    <rect x="22" y="4" width="24" height="56" rx="6" className={styles.softFill} stroke="var(--color-text-secondary)" strokeWidth="2" />
    <path d="M34 14v10M29 19h10" className={styles.ink} />
    <circle cx="34" cy="36" r="4" className={styles.badFill} />
    <circle cx="34" cy="48" r="3" className={styles.mutedFill} />
    <rect x="58" y="22" width="22" height="22" rx="3" className={styles.accentFill} />
    <path d="M62 18v4M69 18v4M76 18v4M62 44v4M69 44v4M76 44v4" className={styles.ink} />
    <text x="69" y="37" textAnchor="middle" fontSize="9" style={{ fill: 'var(--color-on-accent)' }}>gyro</text>
  </g>
)
const Board = () => (
  <g>
    <rect x="16" y="8" width="64" height="48" rx="4" className={styles.goodFill} opacity="0.85" />
    <rect x="36" y="20" width="24" height="24" rx="2" style={dark} />
    <path d="M40 16v4M48 16v4M56 16v4M40 44v4M48 44v4M56 44v4M32 26h4M32 34h4M60 26h4M60 34h4" className={styles.ink} />
    {[[22, 14], [74, 14], [22, 50], [74, 50]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.5" className={styles.softFill} />)}
  </g>
)
const Loop = () => (
  <g>
    <path d="M26 46a24 24 0 1 1 8 8" className={styles.accentLine} strokeWidth="3" fill="none" />
    <path d="M30 56l-6-10 11-1z" className={styles.accentFill} />
    <path d="M38 22l20 20M58 22L38 42" className={styles.ink} />
    {[[38, 22], [58, 22], [38, 42], [58, 42]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="5" className={styles.warnFill} />)}
    <rect x="44" y="28" width="8" height="8" rx="2" style={dark} />
  </g>
)
const Firmware = () => (
  <g>
    <rect x="30" y="10" width="36" height="28" rx="3" style={dark} />
    <text x="48" y="28" textAnchor="middle" fontSize="10" style={{ fill: 'var(--color-bg-card)' }}>ESC</text>
    <path d="M36 6v4M48 6v4M60 6v4M36 38v4M48 38v4M60 38v4" className={styles.ink} />
    <rect x="12" y="46" width="16" height="12" rx="2" className={styles.badFill} />
    <path d="M15 46v-4a5 5 0 0 1 10 0v4" className={styles.badLine} fill="none" strokeWidth="2.5" />
    <rect x="68" y="46" width="16" height="12" rx="2" className={styles.goodFill} />
    <path d="M71 46v-4a5 5 0 0 1 10 0" className={styles.goodLine} fill="none" strokeWidth="2.5" />
  </g>
)
const Link = () => (
  <g>
    <path d="M48 24v36M40 60l8-28 8 28M42 50h12" className={styles.ink} strokeWidth="2.5" />
    <circle cx="48" cy="22" r="4" className={styles.accentFill} />
    <path d="M36 14a16 16 0 0 0 0 16M60 14a16 16 0 0 1 0 16M28 8a26 26 0 0 0 0 28M68 8a26 26 0 0 1 0 28" className={styles.accentLine} strokeWidth="2.5" fill="none" />
  </g>
)
const Military = () => (
  <g>
    <path d="M48 5l28 8v18c0 14-11 24-28 29C31 55 20 45 20 31V13z" className={styles.softFill} stroke="var(--color-text-secondary)" strokeWidth="2.5" />
    <path d="M38 22l20 20M58 22L38 42" className={styles.ink} />
    {[[38, 22], [58, 22], [38, 42], [58, 42]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4.5" className={styles.mutedFill} />)}
    <rect x="44" y="28" width="8" height="8" rx="2" className={styles.badFill} />
  </g>
)
const RemoteId = () => (
  <g>
    <path d="M36 28l16 16M52 28L36 44" className={styles.ink} />
    {[[36, 28], [52, 28], [36, 44], [52, 44]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="4" className={styles.mutedFill} />)}
    <rect x="40" y="32" width="8" height="8" rx="2" style={dark} />
    <path d="M70 10a12 12 0 0 1 12 12c0 9-12 22-12 22S58 31 58 22a12 12 0 0 1 12-12z" className={styles.badFill} />
    <circle cx="70" cy="22" r="4" className={styles.softFill} />
    <path d="M24 16a24 24 0 0 1 14-8M18 22a32 32 0 0 1 8-12" className={styles.accentLine} strokeWidth="2.5" fill="none" />
  </g>
)

const STOPS = [
  { Icon: Gamepad2, Pic: Wii, tag: 'Sensors get cheap', colour: 'var(--color-accent-primary)', title: 'A game controller carries a tiny gyro', text: 'The Wii MotionPlus add-on had a cheap gyro inside. Hobbyists could now buy a sensor that feels turning for a few dollars.' },
  { Icon: Cpu, Pic: Board, tag: 'Open software', colour: 'var(--color-success)', title: 'MultiWii: a small board that levels itself', text: 'Makers wired that gyro to a small board and shared the flight code, called MultiWii. A drone that held itself level became something anyone could build.' },
  { Icon: Flame, Pic: Loop, tag: 'A new way to fly', colour: 'var(--color-warning)', title: 'Freestyle: flying like an acrobat', text: 'Racing was about the fastest lap. Freestyle was flips, power loops and dives. It began as weekend experiments, and teams like Rotor Riot showed it to the world.' },
  { Icon: Unlock, Pic: Firmware, tag: 'Who owns the code', colour: 'var(--color-error)', title: 'ESC firmware: closed, open, or switched off', text: 'KISS was closed: fly it, but never fork it. BLHeli_32 was everywhere, until its company shut down in 2024. AM32 is the open answer anyone can read and fix.' },
  { Icon: RadioTower, Pic: Link, tag: 'Hobbyists win', colour: 'var(--color-accent-primary)', title: 'ExpressLRS: a radio built by hobbyists', text: 'Using the chirp idea from chapter 4, an open project gave fast, long-range control links. A community out-engineered closed products.' },
  { Icon: Shield, Pic: Military, tag: 'Beyond the hobby', colour: 'var(--color-text-secondary)', title: 'Hobby drones become military hardware', text: 'Small, cheap, fast and well supported by open software: the same strengths that make FPV fun made these drones useful in war.' },
  { Icon: MapPin, Pic: RemoteId, tag: 'The rules', colour: 'var(--color-warning)', title: 'Remote ID: your drone says who and where', text: 'In many countries a drone must now broadcast its identity and position. Check the rules where you fly.' },
]

export default function Story() {
  return (
    <Chapter
      id="story"
      kicker="Chapter 5 · The story"
      title="The road from a game controller to your drone"
      lead="Seven stops on the road that brought FPV here. Follow it from the top: each stop was a new idea that made the next one possible."
    >
      <ol className={styles.road}>
        <li className={styles.roadEnd}>
          <span className={styles.roadFlag}><Flag size={22} aria-hidden="true" /></span>
          <b>Start</b>
          <span>Sensors are big, costly and only for aircraft</span>
        </li>
        {STOPS.map(({ Icon, Pic, tag, colour, title, text }, i) => (
          <li key={title} className={styles.stop} data-side={i % 2 === 0 ? 'left' : 'right'} style={{ '--c': colour }}>
            <span className={styles.badge}><Icon size={26} aria-hidden="true" /></span>
            <article className={styles.stopCard}>
              <svg viewBox="0 0 96 64" className={styles.pic} role="img" aria-label={title}><Pic /></svg>
              <div>
                <p className={styles.stopTag}>Stop {i + 1} · {tag}</p>
                <h4>{title}</h4>
                <p>{text}</p>
              </div>
            </article>
          </li>
        ))}
        <li className={styles.roadEnd}>
          <span className={styles.roadFlag}><Flag size={22} aria-hidden="true" /></span>
          <b>Today</b>
          <span>You can build, tune and fly your own</span>
        </li>
      </ol>
    </Chapter>
  )
}
