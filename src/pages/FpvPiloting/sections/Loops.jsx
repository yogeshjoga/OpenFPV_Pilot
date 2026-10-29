import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'
import { LOOPS, STICKS } from '../data/loops.js'
import { COMBOS } from '../data/combos.js'
import { LOOPS as SHAPES, compass, describeFlight, flyCombo, headingDeg, initialFlight, poseFor, routeFor, sampleAt, speedOf, stepFlight, sticksFor } from '../sim.js'
import { sceneTrack } from '../maneuvers.js'
import { Block, Section, useFrame } from '../shared.jsx'
import Cockpit from '../widgets/Cockpit.jsx'
import DroneStage from '../widgets/DroneStage.jsx'
import { PlayerControls, StepNow } from '../widgets/PlayerParts.jsx'
import Sticks, { AXIS } from '../widgets/Sticks.jsx'
import Pages from '../widgets/Pages.jsx'
import { MovePath } from './Moves.jsx'
import moveStyles from './Moves.module.css'
import styles from './Loops.module.css'

const RAD = Math.PI / 180
const PHASE_COLORS = ['#3e8ef7', '#30a46c', '#f5a524', '#e5484d', '#a371f7']
const PHASE_HEX = PHASE_COLORS.map((c) => parseInt(c.slice(1), 16))
const DRONE_SCALE = 0.5 // the 3D drone is drawn larger than life on the path, so it can be seen

// ---- the four stick movements, each shown on its own, and then in combination ----

// the way the drone is going, in words: the first thing a student should see when a stick moves
function movingWords(state, input = {}) {
  const parts = []
  if (input.yaw > 0.05) parts.push('turning right')
  else if (input.yaw < -0.05) parts.push('turning left')
  if (state.vz > 0.4) parts.push('going up')
  else if (state.vz < -0.4) parts.push('going down')
  if (state.vf > 0.5) parts.push('flying forward')
  else if (state.vf < -0.5) parts.push('flying backward')
  if (state.vr > 0.5) parts.push('sliding right')
  else if (state.vr < -0.5) parts.push('sliding left')
  return parts.length ? parts.join(' and ') : 'hovering'
}

const TILT_MM = 25 // millimetres on the mat for each metre flown, when the drone is shown on its own

function SingleStick({ axis }) {
  const [values, setValues] = useState({ throttle: 0.4, yaw: 0, pitch: 0, roll: 0 })
  const [hud, setHud] = useState({ alt: 2, heading: 0, speed: 0, moving: 'hovering' })
  const poseRef = useRef({})
  const simRef = useRef(initialFlight(2))
  const clock = useRef(0)
  const tick = useRef(0)
  const calm = useReducedMotion()

  // a new stick starts again from a hover
  useEffect(() => { simRef.current = initialFlight(2); clock.current = 0 }, [axis])

  useFrame((dt) => {
    clock.current += dt
    const wave = Math.sin(clock.current * 1.5)
    const input = { throttle: 0.4, yaw: 0, pitch: 0, roll: 0 }
    if (axis === 'throttle') input.throttle = 0.4 + 0.12 * wave
    else input[axis] = 0.6 * wave
    // a tilted drone holds itself up less, so for pitch and roll the demo adds the throttle a pilot would, to keep the height
    if (axis === 'pitch' || axis === 'roll') {
      const was = simRef.current
      input.throttle = Math.min(0.62, 0.4 / Math.max(0.5, Math.cos(was.pitch * RAD) * Math.cos(was.roll * RAD)))
    }
    const sim = stepFlight(simRef.current, input, dt)
    simRef.current = sim
    // the drone really moves: east to the right of the mat, north away from the viewer
    poseRef.current = { pitch: sim.pitch * RAD, roll: sim.roll * RAD, yaw: sim.yaw * RAD, height: sim.alt * 40, x: sim.e * TILT_MM, z: -sim.n * TILT_MM }
    tick.current += 1
    if (tick.current % 3 === 0) {
      setValues(input)
      setHud({ alt: sim.alt, heading: headingDeg(sim), speed: speedOf(sim), moving: movingWords(sim, input) })
    }
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
        <FlightReadout alt={hud.alt} heading={hud.heading} speed={hud.speed} moving={hud.moving} />
      </DroneStage>
      <div className={styles.guidePanel}>
        <Sticks values={values} highlight={axis} compact big />
        <div className={styles.axisCard} style={{ '--c': AXIS[axis].color }}>
          <h4>{info.name} <small>{info.stick}</small></h4>
          <p>{info.moves}</p>
          <p className={styles.feel}><b>How it feels:</b> {info.feel}</p>
          <p><b>What it does:</b> {info.effect}</p>
          {(axis === 'pitch' || axis === 'roll') && <p className={styles.feel}><b>In this demo</b> the throttle rises a little as the drone tilts, to hold the height, as a pilot would.</p>}
        </div>
      </div>
    </div>
  )
}

// the height, the direction and the speed of the drone, over the 3D view
function FlightReadout({ alt, heading, speed, moving }) {
  return (
    <div className={styles.readout} aria-live="off">
      <span className={styles.readTitle}>{moving}</span>
      <div><span>Height</span><b>{alt.toFixed(1)} m</b></div>
      <div><span>Nose points</span><b>{compass(heading)} ({Math.round(heading)}°)</b></div>
      <div><span>Speed</span><b>{speed.toFixed(1)} m/s</b></div>
    </div>
  )
}

// a combination of stick moves, flown from a hover: the path is drawn in the 3D view, with the height as well as the direction
function ComboPlayer() {
  const calm = useReducedMotion()
  const [id, setId] = useState(COMBOS[0].id)
  const [playing, setPlaying] = useState(!calm)
  const [speed, setSpeed] = useState(1)
  const [time, setTime] = useState(0)
  const poseRef = useRef({})
  const combo = COMBOS.find((c) => c.id === id)
  const samples = useMemo(() => flyCombo(combo.steps), [combo])
  const duration = samples[samples.length - 1].t
  const result = useMemo(() => describeFlight(samples), [samples])
  const track = useMemo(() => sceneTrack(samples, 'free', { rigY: 36 * DRONE_SCALE, colors: PHASE_HEX }), [samples])

  useEffect(() => { setTime(0); setPlaying(!calm) }, [combo, calm])
  useFrame((dt) => {
    setTime((t) => {
      const next = t + dt * speed
      return next > duration + 1 ? 0 : next
    })
  }, playing)

  const now = Math.min(time, duration)
  const sample = samples.reduce((best, p) => (p.t <= now ? p : best), samples[0])
  useEffect(() => {
    poseRef.current = { pitch: -sample.pitchUp * RAD, roll: sample.roll * RAD, yaw: sample.yaw * RAD, ...track.place(sample), phase: sample.phase }
  }, [sample, track])

  const goStep = (k) => { setPlaying(false); setTime((samples.find((p) => p.phase === k) ?? samples[0]).t) }
  const steps = combo.steps.length
  const step = combo.steps[sample.phase]
  const climb = sample.alt - result.altStart
  const moving = sample.speed < 0.3 ? 'hovering' : `flying ${compass(sample.bearing)}`

  return (
    <div className={styles.player} style={{ '--lab-h': 'clamp(320px, calc(var(--fit) - var(--head) - 120px), 1100px)' }}>
      <div className={moveStyles.moves} role="radiogroup" aria-label="Choose a combination">
        {COMBOS.map((c) => (
          <button key={c.id} type="button" role="radio" aria-checked={id === c.id} onClick={() => setId(c.id)}><b>{c.name}</b></button>
        ))}
      </div>
      <Cockpit
        color={PHASE_COLORS[sample.phase % PHASE_COLORS.length]}
        intro={<><b>{combo.uses}.</b> {combo.why}</>}
        stage={(
          <DroneStage poseRef={poseRef} label={`The 3D drone flying: ${combo.name}`} scale={DRONE_SCALE} track={track}>
            <FlightReadout alt={sample.alt} heading={sample.bearing} speed={sample.speed} moving={moving} />
          </DroneStage>
        )}
        controls={(
          <PlayerControls
            playing={playing}
            onToggle={() => setPlaying((p) => !p)}
            onAgain={() => { setTime(0); setPlaying(true) }}
            onPrev={() => goStep(Math.max(0, sample.phase - 1))}
            onNext={() => goStep(Math.min(steps - 1, sample.phase + 1))}
            time={now}
            duration={duration}
            onScrub={(t) => { setPlaying(false); setTime(t) }}
            speed={speed}
            onSpeed={setSpeed}
            label="Move along the combination"
          />
        )}
        step={<StepNow index={sample.phase} total={steps} title={step.title} text={step.text} />}
        sticks={<Sticks values={sample.sticks} compact side />}
        path={(
          <figure className={moveStyles.pathBox}>
            <MovePath samples={samples} view="top" time={now} phase={sample.phase} />
            <figcaption>Seen from above, north at the top. The arrow is the drone and its nose.</figcaption>
          </figure>
        )}
        tabs={[
          {
            id: 'result',
            label: 'What happened',
            node: (
              <ul className={styles.plainList}>
                <li>The drone started at <b>{result.altStart.toFixed(1)} m</b> high and finished at <b>{result.altEnd.toFixed(1)} m</b>. Its highest point was <b>{result.altMax.toFixed(1)} m</b>.</li>
                <li>{result.direction ? <>It ended <b>{result.distance.toFixed(0)} metres {result.direction}</b> of where it began.</> : <>It ended back near where it began.</>}</li>
                <li>Right now ({now.toFixed(1)} s in): {climb > 0.3 ? 'it is ' + climb.toFixed(1) + ' m higher' : climb < -0.3 ? 'it is ' + (-climb).toFixed(1) + ' m lower' : 'it is at about the starting height'}, and {moving}.</li>
              </ul>
            ),
          },
          {
            id: 'steps',
            label: 'All the steps',
            node: (
              <ol className={styles.phases}>
                {combo.steps.map((p, k) => (
                  <li key={p.title} className={k === sample.phase ? styles.activePhase : ''} style={{ '--c': PHASE_COLORS[k % PHASE_COLORS.length] }}>
                    <button type="button" onClick={() => goStep(k)}>
                      <span className={styles.phaseNum}>{k + 1}</span>
                      <span>
                        <b>{p.title}</b>
                        <span className={styles.phaseText}>{p.text}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            ),
          },
        ]}
      />
    </div>
  )
}

function StickGuide() {
  const [axis, setAxis] = useState('throttle')
  return (
    <div className={styles.guideShell} style={{ '--lab-h': 'clamp(320px, calc(var(--fit) - var(--head) - 50px), 1100px)' }}>
      <div className={styles.axisTabs} role="tablist" aria-label="Choose a stick movement">
        {STICKS.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={axis === s.id} onClick={() => setAxis(s.id)} style={{ '--c': AXIS[s.id].color }}>{s.name}</button>
        ))}
        <button type="button" role="tab" aria-selected={axis === 'combos'} onClick={() => setAxis('combos')} className={styles.comboTab}>Combinations</button>
      </div>
      {axis === 'combos' ? <ComboPlayer /> : <SingleStick axis={axis} />}
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

  const goStep = (k) => { const first = route.find((q) => q.phase === k); setPlaying(false); setTime(first ? first.t : 0) }
  const steps = loop.phases.length
  const at = Math.min(sample.phase, steps - 1)

  return (
    // this page also has the row of patterns to choose from, so the player gets a little less height
    <div className={styles.player} style={{ '--lab-h': 'clamp(320px, calc(var(--fit) - var(--head) - 85px), 1100px)' }}>
      <div className={styles.glyphs} role="radiogroup" aria-label="Choose a pattern">
        {LOOPS.map((l) => (
          <button key={l.id} type="button" role="radio" aria-checked={id === l.id} onClick={() => choose(l.id)}>
            <span className={styles.glyph}>{l.symbol}</span>
            <span>{l.name}<small>{l.level}</small></span>
          </button>
        ))}
      </div>

      <Cockpit
        intro={<><b>What it teaches:</b> {loop.teaches}</>}
        color={PHASE_COLORS[at % PHASE_COLORS.length]}
        stage={<DroneStage poseRef={poseRef} label="The 3D drone flying the pattern" scale={DRONE_SCALE} track={track} />}
        controls={(
          <PlayerControls
            playing={playing}
            onToggle={() => setPlaying((p) => !p)}
            onAgain={() => { setTime(0); setPlaying(true) }}
            onPrev={() => goStep(Math.max(0, at - 1))}
            onNext={() => goStep(Math.min(steps - 1, at + 1))}
            time={Math.min(time, duration)}
            duration={duration}
            onScrub={(t) => { setPlaying(false); setTime(t) }}
            speed={speed}
            onSpeed={setSpeed}
            label="Move along the pattern"
          />
        )}
        step={<StepNow index={at} total={steps} title={loop.phases[at].title} text={loop.phases[at].text} />}
        sticks={<Sticks values={sticks} compact side />}
        path={(
          <figure className={styles.pathCard}>
            <PathView route={route} loop={shape} time={time} phase={sample.phase} />
            <figcaption>Seen from above. The arrow is the drone and its nose.</figcaption>
          </figure>
        )}
        tabs={[
          {
            id: 'steps',
            label: 'All the steps',
            node: (
              <ol className={styles.phases}>
                {loop.phases.map((p, k) => (
                  <li key={p.title} className={k === sample.phase ? styles.activePhase : ''} style={{ '--c': PHASE_COLORS[k % PHASE_COLORS.length] }}>
                    <button type="button" onClick={() => goStep(k)}>
                      <span className={styles.phaseNum}>{k + 1}</span>
                      <span>
                        <b>{p.title}</b>
                        <span className={styles.phaseText}>{p.text}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            ),
          },
          { id: 'mistakes', label: 'Common mistakes', node: <ul className={styles.plainList}>{loop.mistakes.map((m) => <li key={m}>{m}</li>)}</ul> },
          { id: 'practice', label: 'Practice it', node: <ul className={styles.plainList}>{loop.drill.map((d) => <li key={d}>{d}</li>)}</ul> },
        ]}
      />
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
      <Pages label="Sticks and loops" items={[
      { id: 'sticks', label: 'The four sticks', node: (
        <Block quiet title="The four stick movements" intro="Every move on a drone is one of these four, or a mix. Choose one: the drone and the stick show it slowly, back and forth.">
        <StickGuide />
      </Block>
      ) },
      { id: 'patterns', label: 'Patterns 0, 8, 6, 7', node: (
        <Block quiet title="Practice patterns: 0, 8, 6 and 7" intro="Press play. The drone flies the pattern from above, the 3D drone leans and turns, and the sticks move as yours should. Pause at any time, or drag the bar to look at one moment.">
        <LoopPlayer />
      </Block>
      ) },
      ]} />
    </Section>
  )
}
