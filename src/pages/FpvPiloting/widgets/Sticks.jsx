import { describeStick } from '../sim.js'
import styles from './Sticks.module.css'

// The two sticks of a radio (Mode 2): the left one is throttle (up, down) and yaw (left, right), the right one is pitch (up, down)
// and roll (left, right). Each axis has its own colour, used again in the words below, so a student can link the name to the move.
export const AXIS = {
  throttle: { color: '#ff8a3d', label: 'Throttle' },
  yaw: { color: '#a371f7', label: 'Yaw' },
  pitch: { color: '#30a46c', label: 'Pitch' },
  roll: { color: '#3e8ef7', label: 'Roll' },
}

const SIZE = 150
const MID = SIZE / 2
const TRAVEL = 54

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function Gimbal({ title, xAxis, yAxis, x, y, spring, interactive, highlight, centreMark, onMove }) {
  // x and y are -1..1
  const point = (event) => {
    const box = event.currentTarget.getBoundingClientRect()
    const px = ((event.clientX - box.left) / box.width) * SIZE
    const py = ((event.clientY - box.top) / box.height) * SIZE
    return { x: clamp((px - MID) / TRAVEL, -1, 1), y: clamp(-(py - MID) / TRAVEL, -1, 1) }
  }
  const down = (event) => {
    if (!interactive) return
    event.currentTarget.setPointerCapture(event.pointerId)
    onMove(point(event))
  }
  const move = (event) => {
    if (!interactive || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    onMove(point(event))
  }
  const up = () => { if (interactive) onMove({ x: spring.x ? 0 : undefined, y: spring.y ? 0 : undefined }, true) }
  const key = (event) => {
    if (!interactive) return
    const step = event.shiftKey ? 0.25 : 0.1
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[event.key]
    if (event.key === ' ' || event.key === '0') { event.preventDefault(); onMove({ x: spring.x ? 0 : x, y: spring.y ? 0 : y }, true); return }
    if (!delta) return
    event.preventDefault()
    onMove({ x: clamp(x + delta[0], -1, 1), y: clamp(y + delta[1], -1, 1) })
  }
  const cx = MID + x * TRAVEL
  const cy = MID - y * TRAVEL
  const xColor = AXIS[xAxis].color
  const yColor = AXIS[yAxis].color
  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className={`${styles.gimbal} ${interactive ? styles.live : ''}`}
      role="group"
      tabIndex={interactive ? 0 : undefined}
      aria-label={`${title}. ${AXIS[yAxis].label} up and down, ${AXIS[xAxis].label} left and right.${interactive ? ' Drag it, or use the arrow keys.' : ''}`}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      onKeyDown={key}
    >
      <rect x="6" y="6" width={SIZE - 12} height={SIZE - 12} rx="18" className={styles.well} />
      {centreMark && <line x1="6" x2={SIZE - 6} y1={MID} y2={MID} className={styles.zero} />}
      <line x1={MID - TRAVEL} x2={MID + TRAVEL} y1={MID} y2={MID} stroke={xColor} className={`${styles.axisLine} ${highlight === xAxis ? styles.hot : ''}`} />
      <line x1={MID} x2={MID} y1={MID - TRAVEL} y2={MID + TRAVEL} stroke={yColor} className={`${styles.axisLine} ${highlight === yAxis ? styles.hot : ''}`} />
      <text x={MID} y="19" textAnchor="middle" fontSize="10" fill={yColor} className={styles.axisText}>{yAxis === 'throttle' ? 'UP' : 'FWD'}</text>
      <text x={MID} y={SIZE - 10} textAnchor="middle" fontSize="10" fill={yColor} className={styles.axisText}>{yAxis === 'throttle' ? 'DOWN' : 'BACK'}</text>
      <text x="14" y={MID + 4} fontSize="10" fill={xColor} className={styles.axisText}>L</text>
      <text x={SIZE - 14} y={MID + 4} textAnchor="end" fontSize="10" fill={xColor} className={styles.axisText}>R</text>
      <line x1={MID} y1={MID} x2={cx} y2={cy} className={styles.arm} />
      <circle cx={cx} cy={cy} r="14" className={styles.knob} />
      <circle cx={cx} cy={cy} r="5" className={styles.knobDot} />
    </svg>
  )
}

// values: { throttle (0..1), yaw, pitch, roll (-1..1) }
export default function Sticks({ values, onChange, interactive = false, mode3d = false, highlight = null, words = true }) {
  const set = (patch) => onChange?.(patch)
  return (
    <div className={styles.wrap}>
      <div className={styles.pair}>
        <figure className={styles.unit}>
          <Gimbal
            title="Left stick"
            xAxis="yaw"
            yAxis="throttle"
            x={values.yaw}
            y={values.throttle * 2 - 1}
            spring={{ x: true, y: false }}
            interactive={interactive}
            highlight={highlight}
            centreMark={mode3d}
            onMove={(p) => set({ ...(p.x !== undefined && { yaw: p.x }), ...(p.y !== undefined && { throttle: (p.y + 1) / 2 }) })}
          />
          <figcaption>Left stick</figcaption>
        </figure>
        <figure className={styles.unit}>
          <Gimbal
            title="Right stick"
            xAxis="roll"
            yAxis="pitch"
            x={values.roll}
            y={values.pitch}
            spring={{ x: true, y: true }}
            interactive={interactive}
            highlight={highlight}
            onMove={(p) => set({ ...(p.x !== undefined && { roll: p.x }), ...(p.y !== undefined && { pitch: p.y }) })}
          />
          <figcaption>Right stick</figcaption>
        </figure>
      </div>
      {words && (
        <ul className={styles.words} aria-label="What each stick is doing">
          {['throttle', 'yaw', 'pitch', 'roll'].map((name) => (
            <li key={name} className={highlight === name ? styles.wordHot : ''}>
              <i style={{ background: AXIS[name].color }} aria-hidden="true" />
              <b>{AXIS[name].label}</b>
              <span>{describeStick(name, values[name])}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
