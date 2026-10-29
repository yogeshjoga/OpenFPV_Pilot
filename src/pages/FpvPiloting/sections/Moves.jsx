import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Lightbulb, Pause, Play, RotateCcw } from 'lucide-react'
import CurveChart from '@components/charts/CurveChart'
import { MOVES, MOVE_GROUPS } from '../data/moves.js'
import { flyManeuver, maneuverPose, phaseStart, sceneTrack } from '../maneuvers.js'
import { Block, Section, useFrame } from '../shared.jsx'
import DroneStage from '../widgets/DroneStage.jsx'
import Sticks, { AXIS } from '../widgets/Sticks.jsx'
import loop from './Loops.module.css'
import styles from './Moves.module.css'

const PHASE_COLORS = ['#3e8ef7', '#30a46c', '#f5a524', '#e5484d', '#a371f7', '#14b8a6']
const PHASE_HEX = PHASE_COLORS.map((c) => parseInt(c.slice(1), 16))
const DRONE_SCALE = 0.5 // the 3D drone is drawn larger than life on the path, so it can be seen

// the path of the move, with the drone on it. Side view: along the ground and up. Top view: from above.
function MovePath({ samples, view, time, phase }) {
  const box = useMemo(() => {
    const xs = samples.map((p) => p.x)
    const ys = samples.map((p) => p.y)
    const pad = 5
    const x0 = Math.min(...xs) - pad
    const x1 = Math.max(...xs) + pad
    let y0 = Math.min(...ys) - pad
    let y1 = Math.max(...ys) + pad
    // a flat path (a roll or a flip) still needs room to show the drone turning
    const minHeight = (x1 - x0) * 0.4
    if (y1 - y0 < minHeight) { const c = (y0 + y1) / 2; y0 = c - minHeight / 2; y1 = c + minHeight / 2 }
    return { x0, y0, w: x1 - x0, h: y1 - y0 }
  }, [samples])
  const parts = useMemo(() => {
    const out = []
    samples.forEach((p) => { (out[p.phase] ||= []).push(p) })
    return out
  }, [samples])
  const here = samples.reduce((best, p) => (p.t <= time ? p : best), samples[0])
  const flown = samples.filter((p) => p.t <= time)
  const X = (p) => (p.x - box.x0).toFixed(2)
  const Y = (p) => (box.h - (p.y - box.y0)).toFixed(2)
  const points = (list) => list.map((p) => `${X(p)},${Y(p)}`).join(' ')
  const size = Math.max(box.w, box.h * 1.6) / 22
  const angle = here.nose
  // which side of the arrow the top of the drone is on: upside down puts it on the other side, and so does having turned round
  const topSide = (Math.cos((here.roll * Math.PI) / 180) >= 0 ? -1 : 1) * (Math.cos((here.yaw * Math.PI) / 180) >= 0 ? 1 : -1)
  return (
    <svg viewBox={`0 0 ${box.w} ${box.h}`} className={loop.path} role="img" aria-label={view === 'side' ? 'The path of the move, seen from the side, with the drone on it' : 'The path of the move, seen from above, with the drone on it'}>
      <rect width={box.w} height={box.h} className={loop.grid} />
      {view === 'side' && <line x1="0" x2={box.w} y1={box.h - (0 - box.y0)} y2={box.h - (0 - box.y0)} className={styles.ground} strokeWidth={size * 0.08} />}
      {parts.map((list, k) => (
        <polyline key={k} points={points(list)} fill="none" stroke={PHASE_COLORS[k % PHASE_COLORS.length]} strokeWidth={k === phase ? size * 0.4 : size * 0.22} strokeLinecap="round" strokeLinejoin="round" opacity={k === phase ? 1 : 0.35} />
      ))}
      <polyline points={points(flown)} fill="none" className={loop.trail} strokeWidth={size * 0.14} strokeDasharray={`${size * 0.05} ${size * 0.4}`} strokeLinecap="round" />
      <g transform={`translate(${X(here)} ${Y(here)}) rotate(${90 - angle}) scale(${size / 2})`}>
        <circle r="1.9" className={loop.droneHalo} />
        <path d="M0 -2.1 L1.4 1.5 L0 0.8 L-1.4 1.5 Z" className={loop.droneArrow} />
        {view === 'side' && <circle cx={topSide * 1.7} cy="0.2" r="0.55" className={styles.topMark} />}
      </g>
    </svg>
  )
}

function MovePlayer({ move }) {
  const calm = useReducedMotion()
  const [playing, setPlaying] = useState(!calm)
  const [speed, setSpeed] = useState(1)
  const [time, setTime] = useState(0)
  const poseRef = useRef({})
  const samples = useMemo(() => flyManeuver(move.phases, { view: move.view, speed: move.speed, lean: move.lean ?? 15 }), [move])
  const duration = samples[samples.length - 1].t

  useEffect(() => { setTime(0); setPlaying(!calm) }, [move, calm])

  useFrame((dt) => {
    setTime((t) => {
      const next = t + dt * speed
      return next > duration + 1 ? 0 : next // a short pause at the end, then again
    })
  }, playing)

  const now = Math.min(time, duration)
  const sample = samples.reduce((best, p) => (p.t <= now ? p : best), samples[0])
  // the flight laid out in the 3D scene: the path is drawn there and the drone flies along it
  const track = useMemo(() => sceneTrack(samples, move.view, { rigY: 36 * DRONE_SCALE, colors: PHASE_HEX }), [samples, move.view])
  useEffect(() => { poseRef.current = { ...maneuverPose(sample, move.view), ...track.place(sample), phase: sample.phase } }, [sample, move.view, track])

  const chart = useMemo(() => {
    const xs = samples.filter((_, i) => i % 3 === 0).map((p) => p.t)
    const pick = (f) => samples.filter((_, i) => i % 3 === 0).map(f)
    return [
      { xs, ys: pick((p) => p.sticks.throttle * 2 - 1), color: AXIS.throttle.color, label: 'throttle' },
      { xs, ys: pick((p) => p.sticks.yaw), color: AXIS.yaw.color, label: 'yaw' },
      { xs, ys: pick((p) => p.sticks.pitch), color: AXIS.pitch.color, label: 'pitch' },
      { xs, ys: pick((p) => p.sticks.roll), color: AXIS.roll.color, label: 'roll' },
    ]
  }, [samples])

  const turned = (deg) => `${Math.round(deg)}°`
  return (
    <div className={loop.player}>
      <p className={loop.teaches}>{move.blurb}</p>

      <div className={`${loop.views} ${move.view === 'side' ? styles.sideLayout : ''}`}>
        <figure className={loop.pathFigure}>
          <MovePath samples={samples} view={move.view} time={now} phase={sample.phase} />
          <figcaption>{move.view === 'side' ? 'Seen from the side. The dot marks the top of the drone.' : 'Seen from above. The arrow is the drone and its nose.'}</figcaption>
        </figure>
        <DroneStage poseRef={poseRef} label={`The 3D drone flying the ${move.name}`} className={loop.loopStage} scale={DRONE_SCALE} track={track}>
          <div className={styles.read}>
            <span>Rolled <b>{turned(sample.roll)}</b></span>
            {move.view === 'side' && <span>Nose turned <b>{turned(sample.pitchUp + 15)}</b></span>}
            <span>Speed <b>{sample.speed.toFixed(0)} m/s</b></span>
          </div>
        </DroneStage>
        <div className={loop.sticksCol}>
          <Sticks values={sample.sticks} />
        </div>
      </div>

      <div className={loop.controls}>
        <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={() => { setTime(0); setPlaying(true) }}><RotateCcw size={16} aria-hidden="true" /> Again</button>
        <input type="range" min="0" max={duration} step="0.02" value={now} onChange={(e) => { setPlaying(false); setTime(Number(e.target.value)) }} aria-label="Move along the stunt" className={loop.scrub} />
        <label className={loop.speed}>
          Speed
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value={0.25}>0.25x (slow)</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
          </select>
        </label>
      </div>

      <figure className={styles.timeline}>
        <figcaption><b>The sticks through the whole move.</b> Each line is one stick: up on the chart means up or forward or right. The vertical line is where the drone is now.</figcaption>
        <CurveChart curves={chart} xMax={duration} yMin={-1} yMax={1} cursor={now} xLabel="time (s)" label="How the four sticks move during the stunt" className={styles.chart} />
      </figure>

      <ol className={loop.phases}>
        {move.phases.map((p, k) => (
          <li key={p.title} className={k === sample.phase ? loop.activePhase : ''} style={{ '--c': PHASE_COLORS[k % PHASE_COLORS.length] }}>
            <button type="button" onClick={() => { setPlaying(false); setTime(phaseStart(samples, k).t) }}>
              <span className={loop.phaseNum}>{k + 1}</span>
              <span>
                <b>{p.title}</b>
                <span className={loop.phaseText}>{p.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className={loop.cols}>
        <section>
          <h4>Common mistakes</h4>
          <ul>{move.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
        </section>
        <section>
          <h4>Practice it</h4>
          <ul>{move.drill.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>
      </div>
      <p className={styles.tip}><Lightbulb size={18} aria-hidden="true" /> <span><b>Tip:</b> {move.tip}</span></p>
    </div>
  )
}

export default function Moves() {
  const [group, setGroup] = useState('stunt')
  const [id, setId] = useState('roll')
  const inGroup = MOVES.filter((m) => m.group === group)
  const move = MOVES.find((m) => m.id === id) ?? inGroup[0]
  const info = MOVE_GROUPS.find((g) => g.id === group)

  const chooseGroup = (g) => { setGroup(g); setId(MOVES.find((m) => m.group === g).id) }

  return (
    <Section
      id="moves"
      kicker="Part 6 · Race moves and stunts"
      title="Flips, rolls, loops and race turns, with the sticks"
      intro="Pick a move and press play. The drone flies it from the side or from above, the 3D drone turns, and the sticks move exactly as your thumbs should. Every move is split into short steps you can click."
    >
      <Block title="Choose a move" intro={`${info.text} These moves are flown in Acro mode. Learn them in a simulator first, with plenty of height.`}>
        <div className={styles.groups} role="tablist" aria-label="Stunts or racing">
          {MOVE_GROUPS.map((g) => (
            <button key={g.id} type="button" role="tab" aria-selected={group === g.id} onClick={() => chooseGroup(g.id)}>{g.label}</button>
          ))}
        </div>
        <div className={styles.moves} role="radiogroup" aria-label="Choose a move">
          {inGroup.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={move.id === m.id} onClick={() => setId(m.id)}>
              <b>{m.name}</b>
              <small>{m.level}</small>
            </button>
          ))}
        </div>
        <MovePlayer move={move} />
      </Block>
    </Section>
  )
}
