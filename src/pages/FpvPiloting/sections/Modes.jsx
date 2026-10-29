import { useCallback, useRef, useState } from 'react'
import { Check, RotateCcw, X } from 'lucide-react'
import { COMPARE, MODES, MODE_BY_ID, WHEN } from '../data/modes.js'
import { initialState, liftNow, stepMode, tiltDeg } from '../sim.js'
import { Block, Section, useFrame } from '../shared.jsx'
import DroneStage from '../widgets/DroneStage.jsx'
import Sticks from '../widgets/Sticks.jsx'
import Pages from '../widgets/Pages.jsx'
import styles from './Modes.module.css'

const RAD = Math.PI / 180
const hoverStick = (mode) => (mode === '3d' ? 0.75 : 0.4) // the throttle stick that holds the drone up
const centred = (mode) => ({ roll: 0, pitch: 0, yaw: 0, throttle: hoverStick(mode) })

// Four short tests. Each plays a scripted set of stick moves, and says what to look for in each mode.
const TESTS = [
  {
    id: 'tap',
    label: 'Tap the roll stick',
    duration: 3,
    input: (t) => ({ roll: t < 0.35 ? 1 : 0 }),
    says: {
      angle: 'The roll stick sets a tilt, so the drone tipped over to the side. When the stick came back to the centre, it levelled itself again.',
      horizon: 'A full tap is at the end of the stick, so it rolled. After the tap it levelled itself, because the sticks were in the centre.',
      acro: 'The stick set a rotation speed, so the drone rolled for as long as you pushed. When you let go it stopped turning, but it stays tilted.',
      '3d': 'Just as in Acro: it rotates while you push and stays tilted when you let go. Only the throttle works differently.',
    },
  },
  {
    id: 'hold',
    label: 'Hold roll for one second',
    duration: 3.5,
    input: (t) => ({ roll: t < 1 ? 1 : 0 }),
    says: {
      angle: 'It tipped to its limit (about 55 degrees) and stayed there while you held the stick. Then it levelled. Angle can never flip.',
      horizon: 'Held to the end, it behaved like Acro and rolled right round. Then, with the stick centred, it levelled itself out again.',
      acro: 'Holding the stick makes it spin faster and faster round. After one second it has turned more than once, and it stays wherever you left it.',
      '3d': 'The same as Acro: it spun round and stayed where it ended. Nothing levels it for you.',
    },
  },
  {
    id: 'tilted',
    label: 'Start tilted, then let go',
    duration: 3,
    start: { roll: 40 },
    input: () => ({}),
    says: {
      angle: 'With the sticks centred the target is level, so it brought itself back to flat in a moment.',
      horizon: 'The same: the sticks are in the middle, so it levelled itself.',
      acro: 'It stays tilted. The stick means "do not rotate", so nothing brings it back. In real flight it would slide sideways. You must roll it back yourself.',
      '3d': 'It stays tilted, as in Acro. You must roll it back yourself.',
    },
  },
  {
    id: 'flip',
    label: 'Flip upside down',
    duration: 4,
    start: { alt: 3 },
    // in 3D mode the throttle goes to the middle as the drone passes on its side, then below it once it is upside down
    input: (t, mode) => ({ roll: t < 0.3 ? 1 : 0, throttle: mode !== '3d' || t < 0.1 ? hoverStick(mode) : t < 0.3 ? 0.5 : t < 1.2 ? 0.22 : 0.25 }),
    says: {
      angle: 'It could not flip. Angle stops at about 55 degrees, so this move is not possible in Angle mode.',
      horizon: 'It flipped halfway, then, with the stick centred, rolled back to level. In Horizon, a flip is something you must keep holding.',
      acro: 'It flipped and stayed upside down. The thrust now pushes the drone DOWN, so with the same throttle it fell and crashed. In Acro you must flip back, or crash.',
      '3d': 'It flipped, and then the throttle went below the middle, so the motors spun backwards and pushed it UP. It holds its height upside down. This is 3D mode.',
    },
  },
]

function ModeLab() {
  const [mode, setMode] = useState('angle')
  const [shown, setShown] = useState(centred('angle'))
  const [hud, setHud] = useState({ tilt: 0, alt: 2, lift: 0.4, crashed: false })
  const [test, setTest] = useState(null)
  const poseRef = useRef({})
  const simRef = useRef(initialState())
  const inputRef = useRef(centred('angle'))
  const testRef = useRef(null)
  const tickRef = useRef(0)

  const reset = useCallback((nextMode, start = {}) => {
    simRef.current = { ...initialState(start.alt ?? 2), ...start }
    inputRef.current = centred(nextMode)
    testRef.current = null
    setShown(centred(nextMode))
  }, [])

  const chooseMode = (id) => { setMode(id); setTest(null); reset(id) }
  const runTest = (t) => {
    reset(mode, t.start)
    testRef.current = { test: t, time: 0 }
    setTest(t.id)
  }
  const userMove = (patch) => { inputRef.current = { ...inputRef.current, ...patch }; testRef.current = null; setTest(null) }

  useFrame((dt) => {
    let input = inputRef.current
    const run = testRef.current
    if (run) {
      run.time += dt
      input = { ...input, ...run.test.input(run.time, mode) }
      if (run.time > run.test.duration) {
        testRef.current = null
        inputRef.current = { ...inputRef.current, throttle: input.throttle } // keep the throttle where the test left it
      }
    }
    const sim = stepMode(simRef.current, input, mode, dt)
    simRef.current = sim
    poseRef.current = { pitch: sim.pitch * RAD, roll: sim.roll * RAD, yaw: sim.yaw * RAD, height: sim.alt * 40 }
    tickRef.current += 1
    if (tickRef.current % 3 === 0) {
      setShown(input)
      setHud({ tilt: tiltDeg(sim), alt: sim.alt, lift: liftNow(sim, mode, input.throttle), crashed: sim.crashed })
    }
  })

  const info = MODE_BY_ID[mode]
  const activeTest = TESTS.find((t) => t.id === test)
  const lastTest = activeTest

  return (
    <div className={styles.lab}>
      <DroneStage poseRef={poseRef} label="The 3D drone, reacting to the sticks" className={styles.labStage} view={[640, 280, -130]} target={[0, 130, 0]}>
        <div className={styles.hud} aria-live="off">
          <span className={styles.hudMode} style={{ '--c': info.color }}>{info.name} mode</span>
          <div className={styles.hudRow}><span>Tilt</span><b>{hud.tilt.toFixed(0)}°</b></div>
          <div className={styles.hudRow}><span>Height</span><b>{hud.alt.toFixed(1)} m</b></div>
          <div className={styles.hudRow}>
            <span>Thrust</span>
            <b>{Math.abs(hud.lift) < 0.05 ? 'none' : hud.lift > 0 ? 'pushing up' : 'pushing down'}</b>
          </div>
        </div>
        {hud.crashed && <p className={styles.crash} role="status">Crash! The drone hit the ground. Press Reset.</p>}
        {lastTest && (
          <p className={styles.result} role="status">
            <b>What you see in {info.name}:</b> {lastTest.says[mode]}
          </p>
        )}
      </DroneStage>

      <div className={styles.panel}>
        <div className={styles.pills} role="radiogroup" aria-label="Flight mode">
          {MODES.map((m) => (
            <button key={m.id} type="button" role="radio" aria-checked={mode === m.id} onClick={() => chooseMode(m.id)} style={{ '--c': m.color }}>
              {m.name}
            </button>
          ))}
        </div>

        <div className={styles.modeCard} style={{ '--c': info.color }}>
          <h4>{info.name}: {info.nick}</h4>
          <p><b>The stick:</b> {info.stick}</p>
          <p><b>Let go of the sticks:</b> {info.letGo}</p>
        </div>

        <div className={styles.sticksCol}>
        <Sticks values={shown} onChange={userMove} interactive mode3d={mode === '3d'} compact big />
        {mode === '3d' && <p className={styles.hint}>The dashed line is the middle of the throttle: zero thrust.</p>}
        </div>

        <div className={styles.tests} role="group" aria-label="Try a test">
          {TESTS.map((t) => (
            <button key={t.id} type="button" aria-pressed={test === t.id} onClick={() => runTest(t)}>{t.label}</button>
          ))}
          <button type="button" className={styles.reset} onClick={() => { setTest(null); reset(mode) }}>
            <RotateCcw size={14} aria-hidden="true" /> Reset
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Modes() {
  const [situation, setSituation] = useState(WHEN[0].id)
  const pick = WHEN.find((w) => w.id === situation)
  const recommended = MODE_BY_ID[pick.mode]

  return (
    <Section
      id="modes"
      kicker="Part 1 · Flight modes"
      title="What a flight mode is, and which one to use"
      intro="The sticks on a radio always do the same job: they send a number. A flight mode decides what that number means to the drone. Angle, Acro and 3D are three different meanings."
    >
      <Pages label="Flight modes" items={[
      { id: 'what', label: 'What is a mode', node: (
        <Block title="What is a flight mode?" intro="A flight mode is the way the flight controller reads your sticks. The drone is the same, the sticks are the same, but the meaning changes.">
        <div className={styles.meaning}>
          <article>
            <b className={styles.tag} style={{ '--c': MODE_BY_ID.angle.color }}>Angle</b>
            <p>"Tilt to <em>this angle</em>." Stick halfway means halfway tilted. Stick centred means level.</p>
          </article>
          <article>
            <b className={styles.tag} style={{ '--c': MODE_BY_ID.acro.color }}>Acro</b>
            <p>"Turn at <em>this speed</em>." Stick halfway means rotate at half speed, for as long as you hold it. Stick centred means stop turning.</p>
          </article>
          <article>
            <b className={styles.tag} style={{ '--c': MODE_BY_ID['3d'].color }}>3D</b>
            <p>"Push <em>this way</em>." The throttle can push up or down. Centre is no push. It is Acro for the turning, plus thrust both ways.</p>
          </article>
        </div>
      </Block>
      ) },

      { id: 'how', label: 'How each works', node: (
        <Block title="How each mode works" intro="Choose a mode and try the same sticks in each. Drag the sticks yourself, or press a test and watch the drone. The 3D drone below is the one from the lesson.">
        <ModeLab />
        <div className={styles.how}>
          {MODES.map((m) => (
            <article key={m.id} className={styles.howCard} style={{ '--c': m.color }}>
              <h4>{m.name}</h4>
              <ol>{m.how.map((step) => <li key={step}>{step}</li>)}</ol>
            </article>
          ))}
        </div>
      </Block>
      ) },

      { id: 'compare', label: 'Compare', node: (
        <Block title="Compare all the modes" intro="The same things, side by side.">
        <div className={styles.tableWrap}>
          <table className={styles.compare}>
            <thead>
              <tr>
                <th scope="col"><span className={styles.visually}>Question</span></th>
                {MODES.map((m) => <th key={m.id} scope="col" style={{ '--c': m.color }}><span className={styles.colTag}>{m.name}</span></th>)}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row) => (
                <tr key={row.row}>
                  <th scope="row">{row.row}</th>
                  {MODES.map((m) => <td key={m.id}>{row.values[m.id]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.proscons}>
          {MODES.map((m) => (
            <article key={m.id} className={styles.pcCard} style={{ '--c': m.color }}>
              <h4>{m.name}</h4>
              <ul className={styles.pros}>{m.pros.map((p) => <li key={p}><Check size={14} aria-hidden="true" />{p}</li>)}</ul>
              <ul className={styles.cons}>{m.cons.map((c) => <li key={c}><X size={14} aria-hidden="true" />{c}</li>)}</ul>
            </article>
          ))}
        </div>
      </Block>
      ) },

      { id: 'when', label: 'When to use which', node: (
        <Block title="When to use which" intro="Pick what you are doing, and see the mode that fits.">
        <div className={styles.chooser}>
          <div className={styles.situations} role="radiogroup" aria-label="What are you doing?">
            {WHEN.map((w) => (
              <button key={w.id} type="button" role="radio" aria-checked={situation === w.id} onClick={() => setSituation(w.id)}>{w.situation}</button>
            ))}
          </div>
          <div className={styles.answer} style={{ '--c': recommended.color }} aria-live="polite">
            <span className={styles.answerLabel}>Use</span>
            <strong>{recommended.name}</strong>
            <p>{pick.why}</p>
          </div>
        </div>
        <p className={styles.tip}><b>A habit worth having:</b> put Angle on a switch on your radio. If you ever lose control, flip it, let go of the sticks, and the drone levels itself.</p>
      </Block>
      ) },
      ]} />
    </Section>
  )
}
