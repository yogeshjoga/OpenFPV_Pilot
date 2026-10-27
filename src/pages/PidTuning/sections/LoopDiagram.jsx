import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import styles from './Learn.module.css'

// The control loop as an animated diagram: signals travel round it, and each stage says what physics it stands for.
const NODES = [
  { id: 'stick', label: 'Stick', sub: 'setpoint', x: 90, y: 80, color: '#ff8a3d', title: 'Stick: what you ask for', text: 'Your stick position becomes a target: an angle in Angle mode, or a rotation speed in Acro mode, which is how freestyle is flown. The radio link sends it 50 to 1000 times a second.' },
  { id: 'error', label: 'Error', sub: 'target - actual', x: 250, y: 80, color: '#a371f7', title: 'Error: the gap between what you asked and what is happening', text: 'error = target - measured. Everything the PID does starts from this one number, updated thousands of times a second.' },
  { id: 'pid', label: 'PID', sub: 'P + I + D', x: 410, y: 80, color: '#3e8ef7', title: 'PID: three reactions added together', text: 'P reacts to the error now, I to how long it has lasted, and D to how fast it is changing. Their sum is the correction. This is the part you tune.' },
  { id: 'mixer', label: 'Mixer', sub: 'one command, four motors', x: 570, y: 80, color: '#12b5cb', title: 'Mixer: turns one command into four motor speeds', text: 'A pitch-forward command becomes "front motors slower, rear motors faster". Roll, yaw and throttle are added to the same four numbers.' },
  { id: 'motors', label: 'Motors', sub: 'thrust', x: 730, y: 80, color: '#30a46c', title: 'Motors and props: thrust (Newton 3)', text: 'Props push air down, and the air pushes the drone up. Thrust grows with speed squared (T ∝ n²), and a motor needs 10 to 30 ms to change speed. That delay matters a lot for tuning.' },
  { id: 'drone', label: 'Drone', sub: 'physics', x: 890, y: 80, color: '#f5a524', title: 'The drone: torque makes it turn', text: 'Unequal thrust makes torque about the centre (τ = r × F). Torque divided by the moment of inertia gives the angular acceleration (α = τ / I). A light 3-inch quad turns fast. A heavy 7-inch quad is slow to start and slow to stop.' },
  { id: 'gyro', label: 'Gyro', sub: 'measures rotation', x: 890, y: 230, color: '#e5484d', title: 'Gyro: feels how fast the drone is turning', text: 'A tiny MEMS chip measures rotation speed using the Coriolis effect on a vibrating mass. The flight controller reads it up to 8000 times a second.' },
  { id: 'filter', label: 'Filters', sub: 'clean the signal', x: 570, y: 230, color: '#8b5cf6', title: 'Filters: remove noise, add delay', text: 'Motor vibration fills the gyro signal with noise. Filters clean it, but every filter delays the signal a little. D amplifies noise the most, so filter choice and the amount of D you can use are tied together.' },
]
const W = 152
const H = 62
const FLOW = 'M90 80 H890 V230 H250 V112'

export default function LoopDiagram() {
  const calm = useReducedMotion()
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(true)

  useEffect(() => {
    if (!playing || calm) return undefined
    const id = setInterval(() => setActive((a) => (a + 1) % NODES.length), 3200)
    return () => clearInterval(id)
  }, [playing, calm])

  const node = NODES[active]
  return (
    <figure className={styles.loop}>
      <svg viewBox="0 0 980 310" className={styles.loopSvg} role="img" aria-label="The control loop: stick, error, PID, mixer, motors, drone, gyro and filters, and back to the error.">
        <defs>
          <marker id="loop-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0L10 5L0 10z" className={styles.loopArrow} />
          </marker>
        </defs>
        {/* the arrows between the stages */}
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${NODES[i].x + W / 2} 80 H${NODES[i + 1].x - W / 2 - 4}`} className={styles.loopLine} markerEnd="url(#loop-arrow)" />
        ))}
        <path d={`M890 ${80 + H / 2} V${230 - H / 2 - 4}`} className={styles.loopLine} markerEnd="url(#loop-arrow)" />
        <path d={`M${890 - W / 2} 230 H${570 + W / 2 + 4}`} className={styles.loopLine} markerEnd="url(#loop-arrow)" />
        <path d={`M${570 - W / 2} 230 H250 V${80 + H / 2 + 4}`} className={styles.loopLine} markerEnd="url(#loop-arrow)" />
        <text x="270" y="190" fontSize="13" className={styles.loopNote}>feedback: what actually happened</text>

        {/* the stages */}
        {NODES.map((n, i) => (
          <g key={n.id} transform={`translate(${n.x - W / 2} ${n.y - H / 2})`} className={styles.loopNode} data-active={i === active} onClick={() => { setActive(i); setPlaying(false) }} tabIndex={0} role="button" aria-label={n.title} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(i); setPlaying(false) } }}>
            <rect width={W} height={H} rx="12" className={styles.loopBox} style={{ '--c': n.color }} />
            <rect width="6" height={H} rx="3" fill={n.color} />
            <text x={W / 2 + 3} y="28" fontSize="19" className={styles.loopLabel}>{n.label}</text>
            <text x={W / 2 + 3} y="47" fontSize="11" className={styles.loopSub}>{n.sub}</text>
          </g>
        ))}

        {/* signals travelling round the loop */}
        {!calm && [0, 2.6, 5.2, 7.8].map((begin) => (
          <circle key={begin} r="5" className={styles.loopDot}>
            <animateMotion dur="10.4s" begin={`${begin}s`} repeatCount="indefinite" path={FLOW} />
          </circle>
        ))}
      </svg>

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
              <button key={n.id} type="button" role="tab" aria-selected={i === active} aria-label={n.label} className={styles.dot} onClick={() => { setActive(i); setPlaying(false) }} />
            ))}
          </div>
        </div>
      </motion.figcaption>
    </figure>
  )
}
