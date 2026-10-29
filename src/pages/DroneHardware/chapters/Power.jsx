import { useState } from 'react'
import { CELL_VOLTS, COMMUTATION, commutationStep, motorLoad } from '../hardware.js'
import { Chapter, Lab, Readout, Slider, useClock, useLive } from '../parts.jsx'
import Scene3D from '../widgets/Scene3D.jsx'
import { createPowerChain } from '../widgets/scenes.js'
import styles from '../DroneHardware.module.css'

const BARS = [
  { key: 'speed', label: 'Motor speed', cls: 'accentFill' },
  { key: 'power', label: 'Power', cls: 'warnFill' },
  { key: 'current', label: 'Current', cls: 'warnFill' },
  { key: 'heat', label: 'Heat in the windings', cls: 'badFill' },
]

function VoltageLab() {
  const [cells, setCells] = useState(6)
  const m = motorLoad(cells)
  const chainRef = useLive({ cells, current: m.current, glow: Math.min(1, Math.max(0, (m.heat - 1.5) / 3.5)), spin: 40 * m.speed, paused: false })
  const full = 5.5
  return (
    <Lab
      title="More cells, more heat: 4S motors on 6S"
      idea={<>Put 50 % more voltage on a motor and it spins about <b>50 % faster</b>. That sounds mild. But a propeller is hungry: the power it takes grows with the <b>cube</b> of its speed. So the current goes up with the <b>square</b> of the voltage, and the heat in the windings goes with the square of the current. Going from 4S to 6S is <b>1.5×</b> the speed, <b>2.25×</b> the current and about <b>5×</b> the heat.</>}
      figure={(
        <div className={styles.stackTight}>
          <Scene3D create={createPowerChain} stateRef={chainRef} view={[10, 120, 310]} target={[-5, 10, 0]} floorY={-12} minDistance={140} maxDistance={520} label={`A ${cells}S battery, an ESC and one motor joined by wires, with current flowing and the parts glowing as they heat up`} />
          <svg viewBox="0 0 520 230" className={styles.svg} role="img" aria-label={`Relative speed, power, current and heat on ${cells} cells compared with 4 cells`}>
            {BARS.map((b, i) => {
              const v = m[b.key]
              return (
                <g key={b.key} transform={`translate(24 ${24 + i * 50})`}>
                  <text y="0" fontSize="12" className={styles.label}>{b.label}</text>
                  <rect y="8" width="400" height="22" rx="4" className={styles.softFill} />
                  <rect y="8" width={(Math.min(v, full) / full) * 400} height="22" rx="4" className={styles[b.cls]} style={{ transition: 'width 0.4s ease' }} />
                  <line x1={(1 / full) * 400} x2={(1 / full) * 400} y1="4" y2="34" className={styles.mutedLine} strokeDasharray="3 3" />
                  <text x={(Math.min(v, full) / full) * 400 + 8} y="25" fontSize="13" className={styles.labelStrong}>{v.toFixed(2)}×</text>
                </g>
              )
            })}
            <text x="24" y="224" fontSize="11" className={styles.label}>dashed line: the same motor on 4S (1×)</text>
          </svg>
        </div>
      )}
      caption="The power chain: the battery (one block per cell), the ESC and one motor. The yellow dots are current: they flow faster on more cells, and the ESC, wires and motor glow red as the heat climbs. The bars are relative to the same motor and propeller on 4S, with a simple model that ignores losses."
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

function EscLab() {
  const clock = useClock()
  const [speed, setSpeed] = useState(0.25)
  const phi = ((clock.t * speed * 360) % 360 + 360) % 360
  const step = commutationStep(phi)
  const { from, to } = COMMUTATION[step]
  const escRef = useLive({ cells: 4, current: 1, glow: 0, spin: speed * 2 * Math.PI, phase: { from, to }, paused: !clock.playing })
  const floating = ['A', 'B', 'C'].find((p) => p !== from && p !== to)
  return (
    <Lab
      title="How the ESC spins a motor"
      clock={clock}
      idea={<>A drone motor has no brushes. Its magnets are on the spinning part (the bell) and the coils are fixed (the stator). The <b>ESC</b> has to switch current between the three wires (A, B and C) so the coils always pull the magnet round to the next position. It does it in <b>six steps</b> for every full electrical turn: current goes in one wire, out another, and the third is left floating. Do it fast enough and the motor spins smoothly.</>}
      figure={(
        <div className={styles.stackTight}>
          <Scene3D create={createPowerChain} stateRef={escRef} view={[40, 105, 250]} target={[40, 14, 0]} floorY={-12} minDistance={120} maxDistance={480} label="A battery, an ESC and a motor, with current going in along one motor wire, out along another, and the third left floating" />
          <svg viewBox="0 0 330 150" className={styles.svg} role="img" aria-label={`The six steps. Step ${step + 1}: current flows in wire ${from} and out of wire ${to}`}>
            {['A', 'B', 'C'].map((p, r) => (
              <g key={p} transform={`translate(34 ${10 + r * 42})`}>
                <text x="-18" y="22" fontSize="14" className={styles.labelStrong}>{p}</text>
                {COMMUTATION.map((c, k) => {
                  const v = c.from === p ? 1 : c.to === p ? -1 : 0
                  return (
                    <g key={k} transform={`translate(${k * 48} 0)`}>
                      <rect width="44" height="34" rx="4" className={v > 0 ? styles.accentFill : v < 0 ? styles.warnFill : styles.softFill} opacity={k === step ? 1 : 0.45} stroke={k === step ? 'var(--color-text-primary)' : 'none'} strokeWidth="2" />
                      <text x="22" y="22" textAnchor="middle" fontSize="15" className={styles.labelStrong} style={v === 0 ? undefined : { fill: 'var(--color-on-accent)' }}>{v > 0 ? 'in' : v < 0 ? 'out' : '—'}</text>
                    </g>
                  )
                })}
              </g>
            ))}
            {COMMUTATION.map((c, k) => <text key={k} x={56 + k * 48} y="146" textAnchor="middle" fontSize="11" className={styles.label}>step {k + 1}</text>)}
          </svg>
        </div>
      )}
      caption="Top: the battery, the ESC and one motor. The yellow dots are current: in along one motor wire, out along another, and the third wire fades because it is floating. Bottom: what the ESC does to each of the three wires in each of the six steps. The motor is slowed right down so you can follow the steps."
      controls={(
        <>
          <Slider label="Speed" value={speed} min={0.05} max={1} step={0.05} onChange={setSpeed} format={(v) => `${v.toFixed(2)} turns/s`} />
          <Readout items={[
            { label: 'Step', value: `${step + 1} of 6` },
            { label: 'Current', value: `${from} → ${to}`, tone: 'good' },
            { label: 'Left floating', value: floating },
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
