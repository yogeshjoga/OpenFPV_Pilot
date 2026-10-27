import { motion, useReducedMotion } from 'framer-motion'
import styles from './PidTuning.module.css'

// colours for the chart lines
export const LINE = { setpoint: '#7a8494', good: '#30a46c', warn: '#f5a524', bad: '#e5484d', blue: '#3e8ef7', violet: '#a371f7', ink: '#1b2430', P: '#3e8ef7', I: '#30a46c', D: '#e5484d' }

export function Section({ id, kicker, title, intro, children }) {
  const calm = useReducedMotion()
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className="container">
        <motion.header
          className={styles.sectionHead}
          initial={calm ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
        >
          <p className={styles.kicker}>{kicker}</p>
          <h2 id={`${id}-title`} className={styles.sectionTitle}>{title}</h2>
          {intro && <p className={styles.sectionIntro}>{intro}</p>}
        </motion.header>
        {children}
      </div>
    </section>
  )
}

// a heading inside a section
export function Block({ title, intro, children }) {
  return (
    <div className={styles.block}>
      <h3 className={styles.blockTitle}>{title}</h3>
      {intro && <p className={styles.blockIntro}>{intro}</p>}
      {children}
    </div>
  )
}

const num = (v, d = 0) => (v == null || !Number.isFinite(v) ? '–' : v.toFixed(d))

// the numbers that describe how a response went, one row per run
export function MetricTable({ rows }) {
  const kind = rows[0]?.result.metrics?.kind
  const head = kind === 'step'
    ? ['', 'Rise time', 'Overshoot', 'Settles in', 'Left short by']
    : kind === 'push'
      ? ['', 'Biggest tilt', 'Offset at the end', 'Back on target in']
      : ['', 'Biggest tilt', 'Back on target in', 'Average wobble']
  return (
    <div className={styles.tableWrap}>
      <table className={styles.metricTable}>
        <thead>
          <tr>{head.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map(({ label, color, result }) => {
            const m = result.metrics
            if (!m) return null
            const cells = kind === 'step'
              ? [m.riseMs == null ? '–' : `${num(m.riseMs)} ms`, `${num(m.overshootPct)}%`, m.settled ? `${num(m.settleMs)} ms` : 'does not settle', `${num(m.steadyErrorPct)}%`]
              : kind === 'push'
                ? [`${num(m.peakDeg, 1)}°`, `${num(m.offsetDeg, 1)}°`, m.recovered ? `${num(m.recoverMs)} ms` : 'not yet']
                : [`${num(m.peakDeg, 1)}°`, m.recovered ? `${num(m.recoverMs)} ms` : 'does not recover', `${num(m.rmsDeg, 1)}°`]
            return (
              <tr key={label}>
                <th scope="row"><span className={styles.swatch} style={{ background: color }} />{label}</th>
                {cells.map((c, i) => <td key={i}>{c}</td>)}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const niceUp = (v) => {
  if (v <= 0) return 1
  const mag = 10 ** Math.floor(Math.log10(v))
  const n = v / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag
}

// turns recorded runs into the props the chart needs
// runs: [{ label, color, result, dash?, width? }]; channel: 'angle' | 'rate' | 'terms' | 'torque'
export function responseChart(runs, channel = 'angle', { showTarget = true } = {}) {
  const first = runs[0].result
  const curves = []
  if (channel === 'angle' && showTarget && first.setpoint.some((v) => v !== 0)) {
    curves.push({ xs: first.t, ys: first.setpoint, color: LINE.setpoint, dash: [5, 3], width: 1.6, label: 'stick asks' })
  }
  for (const r of runs) {
    if (channel === 'terms') {
      curves.push({ xs: r.result.t, ys: r.result.p, color: LINE.P, label: 'P' }, { xs: r.result.t, ys: r.result.i, color: LINE.I, label: 'I' }, { xs: r.result.t, ys: r.result.d, color: LINE.D, label: 'D' })
    } else {
      curves.push({ xs: r.result.t, ys: r.result[channel], color: r.color, dash: r.dash, width: r.width || 2.4, label: r.label })
    }
  }
  const all = curves.flatMap((c) => c.ys)
  const lo = Math.min(0, ...all)
  const hi = Math.max(0.0001, ...all)
  const span = niceUp(Math.max(hi, -lo) * 1.1)
  const yMax = hi > 0 ? (lo < 0 ? span : niceUp(hi * 1.1)) : span
  const yMin = lo < 0 ? -(lo < -hi * 0.05 ? niceUp(-lo * 1.1) : span * 0.05) : 0
  return { curves, xMax: first.t[first.t.length - 1], yMax, yMin }
}
