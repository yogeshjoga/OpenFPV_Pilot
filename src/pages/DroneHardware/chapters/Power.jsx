import { useState } from 'react'
import { CELL_VOLTS, COMMUTATION, commutationStep, motorLoad } from '../hardware.js'
import { Chapter, Lab, Readout, Slider, useClock } from '../parts.jsx'
import styles from '../DroneHardware.module.css'

const BARS = [
  { key: 'speed', label: 'Motor speed', cls: 'accentFill' },
  { key: 'power', label: 'Power', cls: 'warnFill' },
  { key: 'current', label: 'Current', cls: 'warnFill' },
  { key: 'heat', label: 'Heat in the windings', cls: 'badFill' },
]

function VoltageLab() {
  const clock = useClock()
  const [cells, setCells] = useState(6)
  const m = motorLoad(cells)
  const angle = clock.t * 360 * 1.4 * m.speed
  const full = 5.5
  return (
    <Lab
      title="4S motors on 6S. What could go wrong?"
      clock={clock}
      idea={<>Put 50 % more voltage on a motor and it spins about <b>50 % faster</b>. That sounds mild. But a propeller is hungry: the power it takes grows with the <b>cube</b> of its speed. So the current goes up with the <b>square</b> of the voltage, and the heat in the windings goes with the square of the current. Going from 4S to 6S is <b>1.5×</b> the speed, <b>2.25×</b> the current and about <b>5×</b> the heat.</>}
      figure={(
        <svg viewBox="0 0 600 270" className={styles.svg} role="img" aria-label={`Relative speed, power, current and heat on ${cells} cells compared with 4 cells`}>
          {BARS.map((b, i) => {
            const v = m[b.key]
            return (
              <g key={b.key} transform={`translate(24 ${24 + i * 56})`}>
                <text y="0" fontSize="12" className={styles.label}>{b.label}</text>
                <rect y="8" width="330" height="22" rx="4" className={styles.softFill} />
                <rect y="8" width={(Math.min(v, full) / full) * 330} height="22" rx="4" className={styles[b.cls]} style={{ transition: 'width 0.4s ease' }} />
                <line x1={(1 / full) * 330} x2={(1 / full) * 330} y1="4" y2="34" className={styles.mutedLine} strokeDasharray="3 3" />
                <text x={(Math.min(v, full) / full) * 330 + 8} y="25" fontSize="13" className={styles.labelStrong}>{v.toFixed(2)}×</text>
              </g>
            )
          })}
          <text x="24" y="258" fontSize="11" className={styles.label}>dashed line: the same motor on 4S (1×)</text>
          <g transform="translate(490 120)">
            <circle r="76" className={styles.softFill} opacity="0.6" />
            <g transform={`rotate(${angle})`}>
              <ellipse cx="0" cy="-48" rx="9" ry="46" className={styles.mutedFill} />
              <ellipse cx="0" cy="48" rx="9" ry="46" className={styles.mutedFill} />
            </g>
            <circle r="10" className={styles.accentFill} />
            <text y="108" textAnchor="middle" fontSize="12" className={styles.label}>{cells}S: {(cells * CELL_VOLTS).toFixed(1)} V</text>
          </g>
        </svg>
      )}
      caption="Numbers are relative to the same motor and propeller on 4S. It is a simple model that ignores losses, so real motors differ a little."
      controls={(
        <>
          <Slider label="Battery cells" value={cells} min={3} max={6} step={1} onChange={setCells} format={(v) => `${v}S (${(v * CELL_VOLTS).toFixed(1)} V)`} />
          <Readout items={[
            { label: 'Current', value: `${m.current.toFixed(2)}×`, tone: m.current > 1.5 ? 'bad' : 'good' },
            { label: 'Heat', value: `${m.heat.toFixed(1)}×`, tone: m.heat > 2 ? 'bad' : 'good' },
          ]} />
        </>
      )}
      notice={[
        <>Go from 4S to 6S and watch the heat bar. Motors and ESCs are rated for a voltage and a current, and 6S pushes both past it.</>,
        <>That is why a motor says what battery it is made for. KV (turns per volt) alone does not tell you.</>,
        <>Dropping to 3S does the reverse: much cooler, much weaker.</>,
      ]}
    />
  )
}

const POS = { A: [0, 180], B: [120, 300], C: [240, 60] }
const unit = (deg) => [Math.cos((deg * Math.PI) / 180), -Math.sin((deg * Math.PI) / 180)]

function EscLab() {
  const clock = useClock()
  const [speed, setSpeed] = useState(0.25)
  const phi = ((clock.t * speed * 360) % 360 + 360) % 360
  const step = commutationStep(phi)
  const { from, to } = COMMUTATION[step]
  const state = (p) => (p === from ? 1 : p === to ? -1 : 0)
  const cx = 170
  const cy = 150
  // the angle the energised coils pull towards, a step of 60 degrees at a time
  const fieldAngle = 60 * step - 30
  const [fx, fy] = unit(fieldAngle)
  const rotor = phi - 120
  const teeth = []
  Object.entries(POS).forEach(([p, [a, b]]) => {
    teeth.push({ p, deg: a, s: state(p) }, { p, deg: b, s: -state(p) })
  })
  return (
    <Lab
      title="How the ESC spins a motor"
      clock={clock}
      idea={<>A drone motor has no brushes. Its magnets are on the spinning part and the coils are fixed. The <b>ESC</b> has to switch current between the three wires (A, B and C) so the coils always pull the magnet round to the next position. It does it in <b>six steps</b> for every full electrical turn: current goes in one wire, out another, and the third is left floating. Do it fast enough and the motor spins smoothly.</>}
      figure={(
        <svg viewBox="0 0 640 300" className={styles.svg} role="img" aria-label={`A motor with three coil pairs. Step ${step + 1} of 6: current flows in wire ${from} and out of wire ${to}`}>
          <circle cx={cx} cy={cy} r="118" className={styles.axis} />
          {teeth.map((t, i) => {
            const [ux, uy] = unit(t.deg)
            const cls = t.s > 0 ? styles.accentFill : t.s < 0 ? styles.warnFill : styles.softFill
            return (
              <g key={i}>
                <circle cx={cx + ux * 118} cy={cy + uy * 118} r="23" className={cls} stroke="var(--color-border)" strokeWidth="1.5" style={{ transition: 'fill 0.15s' }} />
                <text x={cx + ux * 118} y={cy + uy * 118 + 5} textAnchor="middle" fontSize="14" className={styles.labelStrong} style={t.s === 0 ? undefined : { fill: 'var(--color-on-accent)' }}>{t.p}{t.s > 0 ? ' N' : t.s < 0 ? ' S' : ''}</text>
              </g>
            )
          })}
          <g transform={`rotate(${-rotor} ${cx} ${cy})`}>
            <path d={`M${cx},${cy - 50} A50 50 0 0 1 ${cx},${cy + 50} Z`} className={styles.badFill} opacity="0.85" />
            <path d={`M${cx},${cy - 50} A50 50 0 0 0 ${cx},${cy + 50} Z`} className={styles.mutedFill} opacity="0.7" />
          </g>
          <line x1={cx} y1={cy} x2={cx + fx * 92} y2={cy + fy * 92} className={styles.goodLine} strokeWidth="4" />
          <circle cx={cx + fx * 92} cy={cy + fy * 92} r="6" className={styles.goodFill} />
          <text x={cx} y={cy + 4} textAnchor="middle" fontSize="12" className={styles.labelStrong} style={{ fill: 'var(--color-on-accent)' }}>magnet</text>
          {['A', 'B', 'C'].map((p, r) => (
            <g key={p} transform={`translate(360 ${52 + r * 56})`}>
              <text x="-16" y="22" fontSize="14" className={styles.labelStrong}>{p}</text>
              {COMMUTATION.map((c, k) => {
                const v = c.from === p ? 1 : c.to === p ? -1 : 0
                return (
                  <g key={k} transform={`translate(${k * 44} 0)`}>
                    <rect width="40" height="34" rx="4" className={v > 0 ? styles.accentFill : v < 0 ? styles.warnFill : styles.softFill} opacity={k === step ? 1 : 0.45} stroke={k === step ? 'var(--color-text-primary)' : 'none'} strokeWidth="2" />
                    <text x="20" y="22" textAnchor="middle" fontSize="15" className={styles.labelStrong} style={v === 0 ? undefined : { fill: 'var(--color-on-accent)' }}>{v > 0 ? 'in' : v < 0 ? 'out' : '—'}</text>
                  </g>
                )
              })}
            </g>
          ))}
          {COMMUTATION.map((c, k) => <text key={k} x={380 + k * 44} y="236" textAnchor="middle" fontSize="11" className={styles.label}>step {k + 1}</text>)}
          <text x="500" y="266" textAnchor="middle" fontSize="12" className={styles.label}>current in, current out, or floating (—)</text>
        </svg>
      )}
      caption="Left: the motor. The green arrow is where the energised coils pull; the red and grey disc is the magnet. Right: what the ESC does to each wire in each of the six steps."
      controls={(
        <>
          <Slider label="Speed" value={speed} min={0.05} max={1} step={0.05} onChange={setSpeed} format={(v) => `${v.toFixed(2)} turns/s`} />
          <Readout items={[
            { label: 'Step', value: `${step + 1} of 6` },
            { label: 'Current', value: `${from} → ${to}`, tone: 'good' },
            { label: 'Left floating', value: ['A', 'B', 'C'].find((p) => p !== from && p !== to) },
          ]} />
        </>
      )}
      notice={[
        <>Every 60° of turn the pattern moves on: the pull jumps ahead of the magnet, the magnet chases it, then it jumps again.</>,
        <>The floating wire is useful. The ESC reads its voltage to find out where the magnet is, with no extra sensor.</>,
        <>All of this is software inside the ESC, called firmware. Who can read, change and share that firmware is a big part of the story in chapter 5.</>,
      ]}
    />
  )
}

export default function Power() {
  return (
    <Chapter
      id="power"
      kicker="Chapter 3 · Motors and power"
      title="Volts, amps, heat and the little computer in the ESC"
      lead="Power electronics decide how hard a motor can work before it cooks. Two ideas explain most of it: how fast power grows with voltage, and how an ESC turns a battery into a spinning motor."
    >
      <VoltageLab />
      <EscLab />
    </Chapter>
  )
}
