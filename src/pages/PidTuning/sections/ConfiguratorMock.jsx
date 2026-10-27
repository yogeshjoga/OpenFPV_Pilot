import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  Activity, BatteryCharging, Cable, ChevronLeft, ChevronRight, Compass, Fan, HardDrive, Layers, MonitorPlay, Pause, Play, Radio, RadioTower,
  Settings2, ShieldAlert, SlidersHorizontal, Sliders, Terminal, ToggleRight,
} from 'lucide-react'
import { TABS } from '../data/betaflight.js'
import styles from './Guide.module.css'

const ICONS = { Compass, Cable, Settings2, BatteryCharging, ShieldAlert, Layers, SlidersHorizontal, Radio, ToggleRight, Sliders, Fan, MonitorPlay, RadioTower, Activity, HardDrive, Terminal }

// our own drawing of the screens: a few widgets, animated, with numbered callouts that match the list on the right
function Badge({ n, hot }) {
  if (!n) return null
  return <span className={styles.badge} data-hot={hot}>{n}</span>
}

// a quad seen from above that tilts in 3D, for the Setup tab
function Model() {
  return (
    <div className={styles.modelStage}>
      <div className={styles.model}>
        {[[18, 18], [82, 18], [18, 82], [82, 82]].map(([x, y]) => (
          <span key={`${x}-${y}`} className={styles.rotor} style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        <span className={styles.armA} />
        <span className={styles.armB} />
        <span className={styles.body}><b>FRONT</b></span>
      </div>
    </div>
  )
}

function Rates() {
  // an actual rate curve: slow near the middle of the stick, fast at the ends
  const pts = Array.from({ length: 21 }, (_, k) => {
    const x = k / 20
    const y = 0.25 * x + 0.75 * x ** 3.2
    return `${(10 + x * 180).toFixed(1)},${(90 - y * 80).toFixed(1)}`
  }).join(' ')
  return (
    <svg viewBox="0 0 200 100" className={styles.rates} role="img" aria-label="Rate curve">
      <rect x="10" y="10" width="180" height="80" className={styles.rateBox} />
      <polyline points={pts} className={styles.rateLine} />
      <circle r="3.5" className={styles.rateDot}>
        <animateMotion dur="4s" repeatCount="indefinite" path="M10 90 C 70 82, 120 70, 190 10" />
      </circle>
      <text x="14" y="20" fontSize="8" className={styles.rateText}>max 800 deg/s</text>
    </svg>
  )
}

function Graph() {
  const wave = (seed, amp) => Array.from({ length: 60 }, (_, k) => `${k * 6},${(30 + Math.sin(k * 0.7 + seed) * amp + Math.sin(k * 2.3 + seed * 3) * amp * 0.4).toFixed(1)}`).join(' ')
  return (
    <div className={styles.graph}>
      <svg viewBox="0 0 360 60" preserveAspectRatio="none">
        <g className={styles.scroll}>
          <polyline points={wave(0, 8)} stroke="#ff8a3d" />
          <polyline points={wave(2, 6)} stroke="#3e8ef7" />
          <polyline points={wave(4, 5)} stroke="#30a46c" />
        </g>
      </svg>
      <span>gyro roll, pitch, yaw</span>
    </div>
  )
}

function Widget({ w, active }) {
  const hot = active === w.n
  switch (w.type) {
    case 'slider':
      return (
        <div className={styles.wRow} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          <span className={styles.wLabel}>{w.label}</span>
          <div className={styles.track}><i className={w.animate ? styles.drift : undefined} style={{ width: `${w.value * 100}%` }} /></div>
          <em>{Math.round(w.value * 100)}</em>
        </div>
      )
    case 'switch':
      return (
        <div className={styles.wRow} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          <span className={styles.wLabel}>{w.label}</span>
          <span className={styles.switch} data-on={w.on}><i /></span>
        </div>
      )
    case 'select':
      return (
        <div className={styles.wRow} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          <span className={styles.wLabel}>{w.label}</span>
          <span className={styles.select}>{w.value}</span>
        </div>
      )
    case 'button':
      return (
        <div className={styles.wRow} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          <span className={styles.button}>{w.label}</span>
        </div>
      )
    case 'list':
      return (
        <div className={styles.wList} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          {w.items.map(([a, b]) => <div key={a}><span>{a}</span><em>{b}</em></div>)}
        </div>
      )
    case 'table':
      return (
        <div className={styles.wTable} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          <div className={styles.tr} data-head="true">{w.head.map((h) => <span key={h}>{h}</span>)}</div>
          {w.rows.map((r) => <div key={r[0]} className={styles.tr}>{r.map((c, i) => <span key={i} data-on={c === 'on'}>{c === 'on' ? '●' : c}</span>)}</div>)}
        </div>
      )
    case 'bars':
      return (
        <div className={styles.wBars} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          {w.labels.map((l, i) => (
            <div key={l} className={styles.barRow}>
              <span>{l}</span>
              <div className={styles.track}><i className={styles.sweep} style={{ animationDuration: `${3 + i * 0.7}s`, animationDelay: `${-i * 0.9}s` }} /></div>
              <em>{1000 + ((i * 187) % 1000)}</em>
            </div>
          ))}
        </div>
      )
    case 'ranges':
      return (
        <div className={styles.wRanges} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          {w.items.map(([name, aux, from, to], i) => (
            <div key={name} className={styles.rangeRow}>
              <b>{name}</b>
              <span>{aux}</span>
              <div className={styles.track}>
                <i className={styles.segment} style={{ left: `${from * 100}%`, width: `${(to - from) * 100}%` }} />
                <u className={styles.marker} style={{ animationDuration: `${4 + i}s` }} />
              </div>
            </div>
          ))}
        </div>
      )
    case 'motors':
      return (
        <div className={styles.wMotors} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          <div className={styles.motorSliders}>
            {['M1', 'M2', 'M3', 'M4'].map((m, i) => (
              <div key={m}>
                <div className={styles.vtrack}><i className={styles.vthumb} style={{ animationDelay: `${-i * 0.8}s` }} /></div>
                <span>{m}</span>
              </div>
            ))}
          </div>
          <svg viewBox="0 0 120 120" className={styles.quad} role="img" aria-label="Motor numbering: M1 rear right, M2 front right, M3 rear left, M4 front left">
            <path d="M30 30 L90 90 M90 30 L30 90" className={styles.quadArm} />
            {[[90, 90, 'M1'], [90, 30, 'M2'], [30, 90, 'M3'], [30, 30, 'M4']].map(([x, y, l]) => (
              <g key={l} transform={`translate(${x} ${y})`}>
                <circle r="15" className={styles.quadRing} />
                <path d="M-13 0H13M0 -13V13" className={styles.quadBlade} />
                <text y="4" textAnchor="middle" fontSize="10" className={styles.quadText}>{l}</text>
              </g>
            ))}
            <path d="M60 52 L55 64 H65Z" className={styles.quadNose} />
          </svg>
        </div>
      )
    case 'osd':
      return (
        <div className={styles.osd} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          <span className={styles.osdTL}>6S 22.4V</span>
          <span className={styles.osdTR}>LQ 100</span>
          <span className={styles.osdBL}>FT 03:21</span>
          <span className={styles.osdBR}>ARMED</span>
          <span className={styles.osdC}>+</span>
        </div>
      )
    case 'graph':
      return (
        <div data-hot={hot} className={styles.graphWrap}>
          <Badge n={w.n} hot={hot} />
          <Graph />
        </div>
      )
    case 'cli':
      return (
        <div className={styles.cli} data-hot={hot}>
          <Badge n={w.n} hot={hot} />
          <p style={{ '--n': 18 }}># diff all</p>
          <p style={{ '--n': 28 }}>set gyro_lpf1_static_hz = 0</p>
          <p style={{ '--n': 24 }}>set dshot_bidir = ON</p>
          <p style={{ '--n': 22 }}>set motor_poles = 14</p>
          <p style={{ '--n': 6 }}># save</p>
        </div>
      )
    case 'rates':
      return (
        <div data-hot={hot} className={styles.graphWrap}>
          <Badge n={w.n} hot={hot} />
          <Rates />
        </div>
      )
    case 'model':
      return (
        <div data-hot={hot} className={styles.graphWrap}>
          <Badge n={w.n} hot={hot} />
          <Model />
        </div>
      )
    default:
      return null
  }
}

export default function ConfiguratorMock() {
  const calm = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [hot, setHot] = useState(null)
  const tab = TABS[index]

  useEffect(() => {
    if (!playing || calm) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % TABS.length), 8000)
    return () => clearInterval(id)
  }, [playing, calm])
  useEffect(() => { setHot(null) }, [index])

  const select = (i) => { setIndex(i); setPlaying(false) }
  const groups = TABS.reduce((acc, t, i) => { (acc[t.group] ||= []).push({ ...t, i }); return acc }, {})

  return (
    <div className={styles.tour}>
      <div className={styles.window} role="group" aria-label="A drawing of the Betaflight Configurator window">
        <div className={styles.titlebar}>
          <span className={styles.dots}><i /><i /><i /></span>
          <span className={styles.titleText}>Configurator</span>
          <span className={styles.connect}><i />Connected</span>
        </div>
        <div className={styles.windowBody}>
          <nav className={styles.menu} aria-label="Configurator tabs">
            {Object.entries(groups).map(([group, items]) => (
              <div key={group} className={styles.menuGroup}>
                <span>{group}</span>
                {items.map((t) => {
                  const Icon = ICONS[t.icon] || Settings2
                  return (
                    <button key={t.id} type="button" className={styles.menuItem} aria-current={t.i === index ? 'page' : undefined} onClick={() => select(t.i)}>
                      {t.i === index && <motion.i layoutId="menu-active" className={styles.menuActive} transition={{ duration: calm ? 0 : 0.25 }} />}
                      <Icon size={15} aria-hidden="true" />
                      <span>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>
          <div className={styles.screen}>
            <AnimatePresence mode="wait">
              <motion.div key={tab.id} initial={calm ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={calm ? { opacity: 0 } : { opacity: 0, x: -18 }} transition={{ duration: 0.22 }}>
                <h4 className={styles.screenTitle}>{tab.label}</h4>
                <div className={styles.widgets}>
                  {tab.widgets.map((w, i) => <Widget key={`${tab.id}-${i}`} w={w} active={hot} />)}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <aside className={styles.explain} aria-live="polite">
        <div className={styles.explainHead}>
          <span className={styles.step}>{index + 1} of {TABS.length}</span>
          <h4>{tab.label}</h4>
          <p>{tab.summary}</p>
        </div>
        <ol className={styles.callouts}>
          {tab.callouts.map((c) => (
            <li key={c.n} onMouseEnter={() => setHot(c.n)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(c.n)} onBlur={() => setHot(null)} tabIndex={0} data-hot={hot === c.n}>
              <span className={styles.badge} data-hot={hot === c.n}>{c.n}</span>
              <div><b>{c.title}</b><p>{c.text}</p></div>
            </li>
          ))}
        </ol>
        <p className={styles.tipBox}><b>Tip.</b> {tab.tip}</p>
        <div className={styles.tourControls}>
          <button type="button" onClick={() => select((index - 1 + TABS.length) % TABS.length)} aria-label="Previous tab"><ChevronLeft size={16} aria-hidden="true" /></button>
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the tour' : 'Play the tour'}>
            {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            {playing ? 'Pause tour' : 'Play tour'}
          </button>
          <button type="button" onClick={() => select((index + 1) % TABS.length)} aria-label="Next tab"><ChevronRight size={16} aria-hidden="true" /></button>
        </div>
      </aside>
    </div>
  )
}
