import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { LOOPS, STICKS } from '../data/loops.js'
import { LOOPS as SHAPES, initialState, poseFor, routeFor, sampleAt, stepMode, sticksFor } from '../sim.js'
import { sceneTrack } from '../maneuvers.js'
import { Block, Section, useFrame } from '../shared.jsx'
import DroneStage from '../widgets/DroneStage.jsx'
import Sticks, { AXIS } from '../widgets/Sticks.jsx'
import styles from './Loops.module.css'

const RAD = Math.PI / 180
const PHASE_COLORS = ['#3e8ef7', '#30a46c', '#f5a524', '#e5484d', '#a371f7']
const PHASE_HEX = PHASE_COLORS.map((c) => parseInt(c.slice(1), 16))
const DRONE_SCALE = 0.5 // the 3D drone is drawn larger than life on the path, so it can be seen

// ---- the four stick movements, each shown on its own ----

function StickGuide() {
  const [axis, setAxis] = useState('throttle')
  const [values, setValues] = useState({ throttle: 0.4, yaw: 0, pitch: 0, roll: 0 })
  const poseRef = useRef({})
  const simRef = useRef(initialState(2))
  const clock = useRef(0)
  const tick = useRef(0)
  const calm = useReducedMotion()

  const pick = (id) => { setAxis(id); simRef.current = initialState(2); clock.current = 0 }

  useFrame((dt) => {
    clock.current += dt
    const wave = Math.sin(clock.current * 1.5)
    const input = { throttle: 0.4, yaw: 0, pitch: 0, roll: 0 }
    if (axis === 'throttle') input.throttle = 0.4 + 0.12 * wave
    else input[axis] = 0.6 * wave
    const sim = stepMode(simRef.current, input, 'angle', dt)
    // keep the drone in view: bring it back to the middle of the mat slowly when it is high or low
    simRef.current = sim
    poseRef.current = { pitch: sim.pitch * RAD, roll: sim.roll * RAD, yaw: sim.yaw * RAD, height: sim.alt * 40 }
    tick.current += 1
    if (tick.current % 3 === 0) setValues(input)
  }, !calm)

  const info = STICKS.find((s) => s.id === axis)
  const dirWord = { throttle: ['down', 'up'], yaw: ['left', 'right'], pitch: ['back', 'forward'], roll: ['left', 'right'] }[axis]
  const value = values[axis]
  const centre = axis === 'throttle' ? 0.4 : 0
  const now = Math.abs(value - centre) < 0.02 ? 'centre' : value > centre ? dirWord[1] : dirWord[0]

  return (
    <div className={styles.guide}>
      <DroneStage poseRef={poseRef} label="The 3D drone showing one stick movement" className={styles.guideStage} view={[640, 280, -130]} target={[0, 130, 0]}>
        <div className={styles.now} style={{ '--c': AXIS[axis].color }}>
          <span>{AXIS[axis].label}</span>
          <b>{now === 'centre' ? 'centre' : `stick ${now}`}</b>
        </div>
      </DroneStage>
      <div className={styles.guidePanel}>
        <div className={styles.axisTabs} role="tablist" aria-label="Choose a stick movement">
          {STICKS.map((s) => (
            <button key={s.id} type="button" role="tab" aria-selected={axis === s.id} onClick={() => pick(s.id)} style={{ '--c': AXIS[s.id].color }}>{s.name}</button>
          ))}
        </div>
        <Sticks values={values} highlight={axis} />
        <div className={styles.axisCard} style={{ '--c': AXIS[axis].color }}>
          <h4>{info.name} <small>{info.stick}</small></h4>
          <p>{info.moves}</p>
          <p><b>How it feels:</b> {info.feel}</p>
          <p><b>What it does:</b> {info.effect}</p>
        </div>
      </div>
    </div>
  )
}

// ---- the loop patterns: the path from above, the sticks, and the 3D drone, all moving together ----

function PathView({ route, loop, time, phase }) {
  const box = useMemo(() => {
    const xs = route.map((p) => p.x)
    const ys = route.map((p) => p.y)
    const pad = 4
    const x0 = Math.min(...xs) - pad
    const x1 = Math.max(...xs) + pad
    const y0 = Math.min(...ys) - pad
    const y1 = Math.max(...ys) + pad
    return { x0, y0, w: x1 - x0, h: y1 - y0 }
  }, [route])
  // one polyline per part of the route, so each part has its own colour
  const parts = useMemo(() => loop.segments.map((_, k) => route.filter((p) => p.phase === k)), [route, loop])
  const here = sampleAt(route, time)
  const flown = route.filter((p) => p.t <= time)
  const toPoints = (list) => list.map((p) => `${(p.x - box.x0).toFixed(2)},${(box.h - (p.y - box.y0)).toFixed(2)}`).join(' ')
  const hx = here.x - box.x0
  const hy = box.h - (here.y - box.y0)
  return (
    <svg viewBox={`0 0 ${box.w} ${box.h}`} className={styles.path} role="img" aria-label="The path of the pattern, seen from above, with the drone on it">
      <rect width={box.w} height={box.h} className={styles.grid} />
      {parts.map((list, k) => (
        <polyline key={k} points={toPoints(list)} fill="none" stroke={PHASE_COLORS[k % PHASE_COLORS.length]} strokeWidth={k === phase ? 0.9 : 0.5} strokeLinecap="round" strokeLinejoin="round" opacity={k === phase ? 1 : 0.35} />
      ))}
      <polyline points={toPoints(flown)} fill="none" className={styles.trail} strokeWidth="0.35" strokeDasharray="0.1 0.8" strokeLinecap="round" />
      <g transform={`translate(${hx} ${hy}) rotate(${-here.heading + 90})`}>
        <circle r="1.9" className={styles.droneHalo} />
        <path d="M0 -2.1 L1.4 1.5 L0 0.8 L-1.4 1.5 Z" className={styles.droneArrow} />
      </g>
    </svg>
  )
}

function LoopPlayer() {
  const calm = useReducedMotion()
  const [id, setId] = useState('0')
  const [playing, setPlaying] = useState(!calm)
  const [speed, setSpeed] = useState(1)
  const [time, setTime] = useState(0)
  const poseRef = useRef({})
  const loop = LOOPS_BY_ID[id]
  const shape = SHAPES[id]
  const route = useMemo(() => routeFor(id), [id])
  const duration = route[route.length - 1].t

  const choose = (next) => { setId(next); setTime(0); setPlaying(!calm) }

  useFrame((dt) => {
    setTime((t) => {
      const next = t + dt * speed
      return next > duration + 0.9 ? 0 : next // a short pause at the end, then round again
    })
  }, playing)

  const sample = sampleAt(route, Math.min(time, duration))
  const sticks = sticksFor(sample)
  // the flight laid out in the 3D scene: the path is drawn there and the drone flies along it
  const track = useMemo(() => sceneTrack(route, 'top', { rigY: 36 * DRONE_SCALE, colors: PHASE_HEX }), [route])
  useEffect(() => { poseRef.current = { ...poseFor(sample), ...track.place(sample), phase: sample.phase } }, [sample, track])

  return (
    <div className={styles.player}>
      <div className={styles.glyphs} role="radiogroup" aria-label="Choose a pattern">
        {LOOPS.map((l) => (
          <button key={l.id} type="button" role="radio" aria-checked={id === l.id} onClick={() => choose(l.id)}>
            <span className={styles.glyph}>{l.symbol}</span>
            <span>{l.name}<small>{l.level}</small></span>
          </button>
        ))}
      </div>

      <p className={styles.teaches}><b>What it teaches:</b> {loop.teaches}</p>

      <div className={styles.views}>
        <figure className={styles.pathFigure}>
          <PathView route={route} loop={shape} time={time} phase={sample.phase} />
          <figcaption>Seen from above. The arrow is the drone and its nose.</figcaption>
        </figure>
        <DroneStage poseRef={poseRef} label="The 3D drone flying the pattern" className={styles.loopStage} scale={DRONE_SCALE} track={track} />
        <div className={styles.sticksCol}>
          <Sticks values={sticks} />
        </div>
      </div>

      <div className={styles.controls}>
        <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button type="button" onClick={() => { setTime(0); setPlaying(true) }}><RotateCcw size={16} aria-hidden="true" /> Again</button>
        <input type="range" min="0" max={duration} step="0.02" value={Math.min(time, duration)} onChange={(e) => { setPlaying(false); setTime(Number(e.target.value)) }} aria-label="Move along the pattern" className={styles.scrub} />
        <label className={styles.speed}>
          Speed
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
            <option value={0.25}>0.25x (slow)</option>
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
          </select>
        </label>
      </div>

      <ol className={styles.phases}>
        {loop.phases.map((p, k) => (
          <li key={p.title} className={k === sample.phase ? styles.activePhase : ''} style={{ '--c': PHASE_COLORS[k % PHASE_COLORS.length] }}>
            <button type="button" onClick={() => { const first = route.find((q) => q.phase === k); setPlaying(false); setTime(first ? first.t : 0) }}>
              <span className={styles.phaseNum}>{k + 1}</span>
              <span>
                <b>{p.title}</b>
                <span className={styles.phaseText}>{p.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.cols}>
        <section>
          <h4>Common mistakes</h4>
          <ul>{loop.mistakes.map((m) => <li key={m}>{m}</li>)}</ul>
        </section>
        <section>
          <h4>Practice it</h4>
          <ul>{loop.drill.map((d) => <li key={d}>{d}</li>)}</ul>
        </section>
      </div>
    </div>
  )
}

const LOOPS_BY_ID = Object.fromEntries(LOOPS.map((l) => [l.id, l]))

export default function Loops() {
  return (
    <Section
      id="loops"
      kicker="Part 3 · Loops and stick moves"
      title="Learn every stick move, then fly the 0, 8, 6 and 7"
      intro="First see what each of the four stick movements does on its own. Then watch the drone fly the four practice patterns while the sticks move with it, so you see exactly what to do with your thumbs."
    >
      <Block title="The four stick movements" intro="Every move on a drone is one of these four, or a mix. Choose one: the drone and the stick show it slowly, back and forth.">
        <StickGuide />
      </Block>
      <Block title="Practice patterns: 0, 8, 6 and 7" intro="Press play. The drone flies the pattern from above, the 3D drone leans and turns, and the sticks move as yours should. Pause at any time, or drag the bar to look at one moment.">
        <LoopPlayer />
      </Block>
    </Section>
  )
}
