import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import styles from './Learn.module.css'

// The control loop as a block diagram: eight numbered stages joined by labelled arrows. The top row is what you ask for,
// the bottom row is what comes back. Signals travel along the arrows behind the boxes, and each stage says what physics it stands for.
const CX = [110, 330, 550, 770, 990]
const TOP = 96
const BOT = 300
const W = 140
const H = 92
const GAP_BEFORE = 4 // space between a box and the start of its arrow
const GAP_AFTER = 10 // space left for the arrow head

const NODES = [
  { id: 'stick', label: 'Stick', lines: ['your target'], x: CX[0], y: TOP, color: '#ff8a3d', title: 'Stick: what you ask for', text: 'Your stick position becomes a target: an angle in Angle mode, or a rotation speed in Acro mode, which is how freestyle is flown. The radio link sends it 50 to 1000 times a second.' },
  { id: 'error', label: 'Error', lines: ['target minus', 'what is happening'], x: CX[1], y: TOP, color: '#a371f7', title: 'Error: the gap between what you asked and what is happening', text: 'error = target - measured. Everything the PID does starts from this one number, updated thousands of times a second.' },
  { id: 'pid', label: 'PID', lines: ['P + I + D'], x: CX[2], y: TOP, color: '#3e8ef7', title: 'PID: three reactions added together', text: 'P reacts to the error now, I to how long it has lasted, and D to how fast it is changing. Their sum is the correction. This is the part you tune.' },
  { id: 'mixer', label: 'Mixer', lines: ['one command,', 'four motors'], x: CX[3], y: TOP, color: '#12b5cb', title: 'Mixer: turns one command into four motor speeds', text: 'A pitch-forward command becomes "front motors slower, rear motors faster". Roll, yaw and throttle are added to the same four numbers.' },
  { id: 'motors', label: 'Motors', lines: ['spin the props'], x: CX[4], y: TOP, color: '#30a46c', title: 'Motors and props: thrust (Newton 3)', text: 'Props push air down, and the air pushes the drone up. Thrust grows with speed squared (T ∝ n²), and a motor needs 10 to 30 ms to change speed. That delay matters a lot for tuning.' },
  { id: 'drone', label: 'Drone', lines: ['torque turns', 'the frame'], x: CX[4], y: BOT, color: '#f5a524', title: 'The drone: torque makes it turn', text: 'Unequal thrust makes torque about the centre (τ = r × F). Torque divided by the moment of inertia gives the angular acceleration (α = τ / I). A light 3-inch quad turns fast. A heavy 7-inch quad is slow to start and slow to stop.' },
  { id: 'gyro', label: 'Gyro', lines: ['measures how', 'fast it turns'], x: CX[3], y: BOT, color: '#e5484d', title: 'Gyro: feels how fast the drone is turning', text: 'A tiny MEMS chip measures rotation speed using the Coriolis effect on a vibrating mass. The flight controller reads it up to 8000 times a second.' },
  { id: 'filter', label: 'Filters', lines: ['remove noise', '(adds delay)'], x: CX[2], y: BOT, color: '#8b5cf6', title: 'Filters: remove noise, add delay', text: 'Motor vibration fills the gyro signal with noise. Filters clean it, but every filter delays the signal a little. D amplifies noise the most, so filter choice and the amount of D you can use are tied together.' },
]

// the arrow that leaves each stage, with the name of the signal it carries
const hx = (from, to) => `M${from + W / 2 + GAP_BEFORE} ${TOP} H${to - W / 2 - GAP_AFTER}`
const ARROWS = [
  { d: hx(CX[0], CX[1]), label: 'target', lx: (CX[0] + CX[1]) / 2, ly: TOP - 14, anchor: 'middle' },
  { d: hx(CX[1], CX[2]), label: 'error', lx: (CX[1] + CX[2]) / 2, ly: TOP - 14, anchor: 'middle' },
  { d: hx(CX[2], CX[3]), label: 'command', lx: (CX[2] + CX[3]) / 2, ly: TOP - 14, anchor: 'middle' },
  { d: hx(CX[3], CX[4]), label: '4 speeds', lx: (CX[3] + CX[4]) / 2, ly: TOP - 14, anchor: 'middle' },
  { d: `M${CX[4]} ${TOP + H / 2 + GAP_BEFORE} V${BOT - H / 2 - GAP_AFTER}`, label: 'thrust', lx: CX[4] + 14, ly: (TOP + BOT) / 2 + 4, anchor: 'start' },
  { d: `M${CX[4] - W / 2 - GAP_BEFORE} ${BOT} H${CX[3] + W / 2 + GAP_AFTER}`, label: 'rotation', lx: (CX[3] + CX[4]) / 2, ly: BOT - 14, anchor: 'middle', feedback: true },
  { d: `M${CX[3] - W / 2 - GAP_BEFORE} ${BOT} H${CX[2] + W / 2 + GAP_AFTER}`, label: 'raw rate', lx: (CX[2] + CX[3]) / 2, ly: BOT - 14, anchor: 'middle', feedback: true },
  { d: `M${CX[2] - W / 2 - GAP_BEFORE} ${BOT} H${CX[1]} V${TOP + H / 2 + GAP_AFTER}`, label: 'measured', lx: CX[1] + 14, ly: (TOP + BOT) / 2 + 4, anchor: 'start', feedback: true },
]
// the route a signal takes round the whole loop
const FLOW = `M${CX[0]} ${TOP} H${CX[4]} V${BOT} H${CX[1]} V${TOP + H / 2}`

export default function LoopDiagram() {
  const calm = useReducedMotion()
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing || calm) return undefined
    const id = setInterval(() => setActive((a) => (a + 1) % NODES.length), 3600)
    return () => clearInterval(id)
  }, [playing, calm])

  const pick = (i) => { setActive(i); setPlaying(false) }
  const node = NODES[active]
  return (
    <figure className={styles.loop}>
      <div className={styles.loopScroll}>
      <svg viewBox="0 0 1100 400" className={styles.loopSvg} role="img" aria-label="The control loop: stick, error, PID, mixer and motors along the top, then drone, gyro and filters back along the bottom, and the measured rate returns to the error stage.">
        <defs>
          <marker id="loop-head" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0 0L12 6L0 12z" className={styles.headForward} />
          </marker>
          <marker id="loop-head-back" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="14" markerHeight="14" markerUnits="userSpaceOnUse" orient="auto">
            <path d="M0 0L12 6L0 12z" className={styles.headBack} />
          </marker>
        </defs>

        {/* the key */}
        <g transform="translate(40 26)" className={styles.loopKey}>
          <line x1="0" y1="0" x2="34" y2="0" className={styles.keyForward} />
          <text x="44" y="4" fontSize="13">what you asked for</text>
          <line x1="230" y1="0" x2="264" y2="0" className={styles.keyBack} />
          <text x="274" y="4" fontSize="13">what actually happened (feedback)</text>
        </g>

        {/* signals travelling along the arrows, drawn behind the boxes */}
        {!calm && [0, 3, 6, 9].map((begin) => (
          <circle key={begin} r="6" className={styles.loopDot}>
            <animateMotion dur="12s" begin={`${begin}s`} repeatCount="indefinite" path={FLOW} />
          </circle>
        ))}

        {/* the arrows */}
        {ARROWS.map((a, i) => (
          <g key={a.label} className={styles.loopArrowGroup} data-active={i === active} style={{ '--c': NODES[i].color }}>
            <path d={a.d} className={a.feedback ? styles.arrowBack : styles.arrowForward} markerEnd={a.feedback ? 'url(#loop-head-back)' : 'url(#loop-head)'} />
            <text x={a.lx} y={a.ly} textAnchor={a.anchor} fontSize="13" className={styles.arrowLabel}>{a.label}</text>
          </g>
        ))}

        {/* the stages */}
        {NODES.map((n, i) => (
          <g
            key={n.id}
            transform={`translate(${n.x - W / 2} ${n.y - H / 2})`}
            className={styles.loopNode}
            data-active={i === active}
            style={{ '--c': n.color }}
            onClick={() => pick(i)}
            tabIndex={0}
            role="button"
            aria-label={`Stage ${i + 1}: ${n.title}`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(i) } }}
          >
            <rect width={W} height={H} rx="14" className={styles.loopBox} />
            <circle cx="22" cy="22" r="12" fill={n.color} />
            <text x="22" y="27" textAnchor="middle" fontSize="14" className={styles.loopNum}>{i + 1}</text>
            <text x={W / 2 + 8} y="30" textAnchor="middle" fontSize="20" className={styles.loopLabel}>{n.label}</text>
            {n.lines.map((line, k) => (
              <text key={line} x={W / 2} y={(n.lines.length === 1 ? 64 : 56) + k * 16} textAnchor="middle" fontSize="12" className={styles.loopSub}>{line}</text>
            ))}
          </g>
        ))}
      </svg>
      </div>

      <motion.figcaption key={node.id} className={styles.loopCaption} initial={calm ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ '--c': node.color }}>
        <div className={styles.loopStep}>Stage {active + 1} of {NODES.length}</div>
        <h4>{node.title}</h4>
        <p>{node.text}</p>
        <div className={styles.loopControls}>
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause the tour' : 'Play the tour'}>
            {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            {playing ? 'Pause tour' : 'Play tour'}
          </button>
          <div className={styles.dots} role="tablist" aria-label="Stages">
            {NODES.map((n, i) => (
              <button key={n.id} type="button" role="tab" aria-selected={i === active} aria-label={`${i + 1}: ${n.label}`} className={styles.dot} onClick={() => pick(i)} />
            ))}
          </div>
        </div>
      </motion.figcaption>
    </figure>
  )
}
