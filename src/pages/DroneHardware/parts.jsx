import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { useFrame } from '../FpvPiloting/shared.jsx'
import styles from './DroneHardware.module.css'

export function Chapter({ id, kicker, title, lead, children }) {
  const calm = useReducedMotion()
  return (
    <section id={id} className={styles.chapter} aria-labelledby={`${id}-title`}>
      <div className="container">
        <motion.header
          className={styles.chapterHead}
          initial={calm ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <p className={styles.kicker}>{kicker}</p>
          <h2 id={`${id}-title`} className={styles.chapterTitle}>{title}</h2>
          <p className={styles.lead}>{lead}</p>
        </motion.header>
        <div className={styles.stack}>{children}</div>
      </div>
    </section>
  )
}

// A seconds clock for an animation. Someone who asks for reduced motion starts paused and can press play.
export function useClock(startPlaying = true) {
  const calm = useReducedMotion()
  const [playing, setPlaying] = useState(startPlaying && !calm)
  const [t, setT] = useState(0)
  useFrame((dt) => setT((v) => v + dt), playing)
  return { t, playing, toggle: () => setPlaying((p) => !p) }
}

// a ref that always holds the latest value, for a 3D scene that reads it every frame
export function useLive(value) {
  const ref = useRef(value)
  useLayoutEffect(() => { ref.current = value })
  return ref
}

export function PlayButton({ clock }) {
  return (
    <button type="button" className={styles.play} onClick={clock.toggle} aria-pressed={clock.playing}>
      {clock.playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
      {clock.playing ? 'Pause' : 'Play'}
    </button>
  )
}

// One lesson: the idea in plain words, the picture, the controls, and what to notice.
export function Lab({ title, idea, clock, figure, caption, controls, notice }) {
  return (
    <article className={styles.lab}>
      <header className={styles.labHead}>
        <h3 className={styles.labTitle}>{title}</h3>
        {clock && <PlayButton clock={clock} />}
      </header>
      <p className={styles.idea}>{idea}</p>
      <figure className={styles.figure}>
        {figure}
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
      <div className={styles.side}>
        {controls}
        {notice && <ul className={styles.notice}>{notice.map((n, i) => <li key={i}>{n}</li>)}</ul>}
      </div>
    </article>
  )
}

export function Slider({ label, value, onChange, min, max, step = 1, format = (v) => v }) {
  return (
    <label className={styles.slider}>
      <span className={styles.sliderTop}>{label}<b>{format(value)}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  )
}

export function Choices({ label, options, value, onChange }) {
  return (
    <div>
      {label && <p className={styles.choiceLabel}>{label}</p>}
      <div className={styles.choices} role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={value === o.id} onClick={() => onChange(o.id)}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}

export function Readout({ items }) {
  return (
    <div className={styles.readout}>
      {items.map((it) => (
        <div key={it.label} data-tone={it.tone}>
          <span>{it.label}</span>
          <b>{it.value}</b>
        </div>
      ))}
    </div>
  )
}

// a chart frame: axis lines, light grid, and labels, in a width x height box. Children draw inside.
export function Plot({ width = 600, height = 300, left = 52, right = 16, top = 16, bottom = 40, xLabel, yLabel, xTicks = [], yTicks = [], x, y, children, label }) {
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg} role="img" aria-label={label}>
      {yTicks.map((v) => (
        <g key={`y${v}`}>
          <line x1={left} x2={width - right} y1={y(v)} y2={y(v)} className={styles.grid} />
          <text x={left - 8} y={y(v) + 4} textAnchor="end" fontSize="11" className={styles.label}>{v}</text>
        </g>
      ))}
      {xTicks.map((v) => (
        <g key={`x${v}`}>
          <line x1={x(v)} x2={x(v)} y1={top} y2={height - bottom} className={styles.grid} />
          <text x={x(v)} y={height - bottom + 16} textAnchor="middle" fontSize="11" className={styles.label}>{v}</text>
        </g>
      ))}
      <line x1={left} x2={left} y1={top} y2={height - bottom} className={styles.axis} />
      <line x1={left} x2={width - right} y1={height - bottom} y2={height - bottom} className={styles.axis} />
      {xLabel && <text x={(left + width - right) / 2} y={height - 6} textAnchor="middle" fontSize="12" className={styles.label}>{xLabel}</text>}
      {yLabel && <text x={14} y={(top + height - bottom) / 2} textAnchor="middle" fontSize="12" className={styles.label} transform={`rotate(-90 14 ${(top + height - bottom) / 2})`}>{yLabel}</text>}
      {children}
    </svg>
  )
}

// a linear scale from a data range to a pixel range
export const scale = (d0, d1, p0, p1) => (v) => p0 + ((v - d0) / (d1 - d0)) * (p1 - p0)

export const polyline = (points) => points.map(([px, py]) => `${px.toFixed(1)},${py.toFixed(1)}`).join(' ')
