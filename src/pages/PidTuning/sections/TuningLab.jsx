import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import CurveChart from '@components/charts/CurveChart'
import { DEFAULT_BUILD, resolveBuild } from '../../DroneConfigurator/catalog.js'
import { DEFAULT_SLIDERS, DRONES, TESTS, simulate } from '../sim.js'
import { LINE, Section, responseChart } from '../shared.jsx'
import styles from './TuningLab.module.css'

const PRESETS = [
  { id: 'good', label: 'Balanced', sliders: DEFAULT_SLIDERS, note: 'Quick, small overshoot, settles fast.' },
  { id: 'soft', label: 'Soft (low P)', sliders: { p: 18, i: 80, d: 42 }, note: 'P too low: slow and mushy.' },
  { id: 'hot', label: 'Hot (high P)', sliders: { p: 95, i: 80, d: 42 }, note: 'P too high: overshoots and rings.' },
  { id: 'nod', label: 'No D', sliders: { p: 45, i: 80, d: 0 }, note: 'Nothing damps the swing: it shakes.' },
  { id: 'heavyd', label: 'Heavy D', sliders: { p: 45, i: 80, d: 100 }, note: 'Very smooth, but slow. Hot motors in real life.' },
  { id: 'noi', label: 'No I', sliders: { p: 45, i: 0, d: 42 }, note: 'Drifts off target in a steady wind. Try the crosswind test.' },
]

const GAINS = [
  { key: 'p', label: 'P', max: 140, name: 'Proportional', hint: 'Higher: faster and firmer. Too high: it overshoots and shakes.' },
  { key: 'i', label: 'I', max: 150, name: 'Integral', hint: 'Higher: holds against steady wind. Too high: a slow bounce.' },
  { key: 'd', label: 'D', max: 120, name: 'Derivative', hint: 'Higher: calmer and damped. Too high: slow, noisy and hot.' },
]

const SPEEDS = [
  { v: 0.1, label: '0.1x' },
  { v: 0.25, label: '0.25x' },
  { v: 0.5, label: '0.5x' },
  { v: 1, label: '1x (real)' },
]

const SCALE = { '3in': 0.7, '5in': 1, '7in': 1.3 }

function tone(kind, value) {
  if (value == null) return 'bad'
  const rules = { overshoot: [10, 25], rise: [150, 250], settle: [300, 700], short: [3, 8], peak: [6, 12], recover: [250, 600], offset: [1, 3], wobble: [1.5, 4] }
  const [good, warn] = rules[kind]
  const v = Math.abs(value)
  return v <= good ? 'good' : v <= warn ? 'warn' : 'bad'
}

function diagnose(test, m) {
  if (!m) return null
  if (m.kind === 'step') {
    if (!m.settled && m.overshootPct > 40) return { tone: 'bad', title: 'It rings', text: 'It swings well past the target and keeps going. P is too high or D is too low. Lower P or raise D.' }
    if (m.overshootPct > 25) return { tone: 'warn', title: 'Too much overshoot', text: 'It goes noticeably past the target. A little more D, or a little less P, will calm it.' }
    if (!m.settled && Math.abs(m.steadyErrorPct) > 5) return { tone: 'warn', title: 'It stops short', text: 'It has not reached the target. P is low so it is slow, or I is low so it never quite arrives. Raise P or I.' }
    if (m.riseMs != null && m.riseMs > 220) return { tone: 'warn', title: 'Smooth but slow', text: 'The response is gentle and takes a while to arrive. Raise P to make it follow the stick faster.' }
    return { tone: 'good', title: 'A good response', text: 'Quick, with little overshoot, and it settles on the target. This is what a locked-in tune looks like.' }
  }
  if (m.kind === 'gust') {
    if (!m.recovered) return { tone: 'bad', title: 'It will not settle after the gust', text: 'It is still wobbling when the test ends. Raise D, or lower P.' }
    if (m.peakDeg > 12) return { tone: 'warn', title: 'A big knock', text: 'The gust throws it a long way. More P and D resist it better.' }
    if (m.recoverMs > 500) return { tone: 'warn', title: 'Slow to recover', text: 'It takes a while to get back. Check P is not too high (ringing) or too low (soft).' }
    return { tone: 'good', title: 'Recovers well', text: 'A small knock, and it comes straight back on target.' }
  }
  if (m.kind === 'push') {
    if (!m.recovered && Math.abs(m.offsetDeg) > 1) return { tone: 'bad', title: 'It stays tilted', text: 'The steady push leaves it off target. That offset is what the I term removes. Raise I.' }
    if (m.recoverMs > 1500) return { tone: 'warn', title: 'It creeps back slowly', text: 'I is doing its job, slowly. A higher I gets there sooner.' }
    return { tone: 'good', title: 'Holds against the wind', text: 'The I term has pushed the error away, so the drone holds its angle.' }
  }
  if (!m.recovered || m.peakDeg > 8) return { tone: 'bad', title: 'Prop wash shakes it', text: 'The turbulence gets a grip and the shaking grows. Raise D to damp it.' }
  if (m.peakDeg > 5) return { tone: 'warn', title: 'Some shaking', text: 'It copes but is not quiet. A little more D will calm it.' }
  return { tone: 'good', title: 'Calm through the turbulence', text: 'D is damping the shaking well.' }
}

export default function TuningLab() {
  const [sliders, setSliders] = useState(DEFAULT_SLIDERS)
  const [drone, setDrone] = useState('5in')
  const [test, setTest] = useState('step')
  const [base, setBase] = useState(0.4)
  const [lag, setLag] = useState(20)
  const [speed, setSpeed] = useState(0.25)
  const [playing, setPlaying] = useState(true)
  const [time, setTime] = useState(0)
  const [note, setNote] = useState(PRESETS[0].note)
  const [error, setError] = useState('')
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const viewRef = useRef(null)

  const result = useMemo(() => simulate({ sliders, drone, test, base, lagS: lag / 1000 }), [sliders, drone, test, base, lag])
  const duration = result.t[result.t.length - 1]
  const diagnosis = diagnose(test, result.metrics)

  // any change restarts the replay, so you see what the change did
  useEffect(() => { setTime(0); setPlaying(true) }, [result])

  // the replay clock
  useEffect(() => {
    if (!playing) return undefined
    let last = performance.now()
    let frame = 0
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      setTime((t) => {
        const next = t + dt * speed
        if (next >= duration) { setPlaying(false); return duration }
        return next
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, duration, result])

  // the 3D drone
  useEffect(() => {
    let cancelled = false
    let observer
    let resize
    import('@components/three/DroneBuilder')
      .then(({ createDroneBuilder }) => {
        if (cancelled || !canvasRef.current) return
        const view = createDroneBuilder(canvasRef.current, {})
        viewRef.current = view
        view.size()
        view.setBuild(resolveBuild(DEFAULT_BUILD))
        view.setSpin(true)
        view.setAutoRotate(false)
        view.setView([430, 140, -30], [0, 48, 0])
        resize = new ResizeObserver(() => view.size())
        resize.observe(canvasRef.current)
        observer = new IntersectionObserver((entries) => view.setActive(entries[entries.length - 1].isIntersecting), { rootMargin: '80px' })
        observer.observe(stageRef.current)
      })
      .catch(() => { if (!cancelled) setError('Your browser could not start the 3D view. The charts and numbers still work.') })
    return () => {
      cancelled = true
      observer?.disconnect()
      resize?.disconnect()
      viewRef.current?.dispose()
      viewRef.current = null
    }
  }, [])
  useEffect(() => { viewRef.current?.setScale(SCALE[drone]) }, [drone])

  const index = Math.min(result.t.length - 1, Math.max(0, Math.round(time / (duration / (result.t.length - 1)))))
  const angle = result.angle[index]
  const target = result.setpoint[index]
  useEffect(() => {
    viewRef.current?.setPose({ pitch: (angle * Math.PI) / 180 })
  }, [angle])

  const choose = (key, value) => { setSliders((s) => ({ ...s, [key]: value })); setNote('Custom tune.') }
  const applyPreset = (p) => { setSliders(p.sliders); setNote(p.note) }
  const replay = useCallback(() => { setTime(0); setPlaying(true) }, [])

  const run = useMemo(() => [{ label: 'Your tune', color: LINE.good, result }], [result])
  const angleChart = useMemo(() => responseChart(run, 'angle'), [run])
  const termsChart = useMemo(() => responseChart(run, 'terms'), [run])
  const rateChart = useMemo(() => responseChart(run, 'rate'), [run])
  const torqueChart = useMemo(() => responseChart([{ label: 'motor torque (N m)', color: LINE.bad, result }], 'torque'), [result])

  const m = result.metrics
  const cards = m.kind === 'step'
    ? [['Rise time', m.riseMs == null ? '–' : `${m.riseMs.toFixed(0)} ms`, tone('rise', m.riseMs), 'How fast it gets 90% of the way there'], ['Overshoot', `${m.overshootPct.toFixed(0)}%`, tone('overshoot', m.overshootPct), 'How far it goes past the target'], ['Settles in', m.settled ? `${m.settleMs.toFixed(0)} ms` : 'not settled', m.settled ? tone('settle', m.settleMs) : 'bad', 'Time to stay within 5%'], ['Left short by', `${m.steadyErrorPct.toFixed(0)}%`, tone('short', m.steadyErrorPct), 'How far off at the end']]
    : m.kind === 'push'
      ? [['Biggest tilt', `${m.peakDeg.toFixed(1)}°`, tone('peak', m.peakDeg), 'The worst the wind did'], ['Offset at the end', `${m.offsetDeg.toFixed(1)}°`, tone('offset', m.offsetDeg), 'Still tilted by this much'], ['Back on target in', m.recovered ? `${m.recoverMs.toFixed(0)} ms` : 'not yet', m.recovered ? tone('recover', m.recoverMs) : 'bad', 'Time to get within 1 degree'], ['Average wobble', `${m.rmsDeg.toFixed(1)}°`, tone('wobble', m.rmsDeg), 'Typical distance from level']]
      : [['Biggest tilt', `${m.peakDeg.toFixed(1)}°`, tone('peak', m.peakDeg), 'How far it was knocked'], ['Back on target in', m.recovered ? `${m.recoverMs.toFixed(0)} ms` : 'not yet', m.recovered ? tone('recover', m.recoverMs) : 'bad', 'Time to get within 1 degree'], ['Average wobble', `${m.rmsDeg.toFixed(1)}°`, tone('wobble', m.rmsDeg), 'Typical distance from level'], ['Final offset', `${m.offsetDeg.toFixed(1)}°`, tone('offset', m.offsetDeg), 'Where it ended up']]

  const testInfo = TESTS.find((t) => t.id === test)
  const droneInfo = DRONES.find((d) => d.id === drone)

  return (
    <Section
      id="tune"
      kicker="Part 2 · Tune"
      title="Tune it yourself"
      intro="Move the sliders and watch the same drone from the lesson respond. The replay is in slow motion so you can see it. Everything on the right is computed from the same physics as the graphs above."
    >
      <div className={styles.top}>
        <div className={styles.stage} ref={stageRef}>
          <canvas ref={canvasRef} className={styles.canvas} aria-label="3D drone tilting in response to the test" />
          {error && <p className={styles.error} role="status">{error}</p>}
          <div className={styles.hud} aria-live="off">
            <div><span>Drone angle</span><b>{angle.toFixed(1)}°</b></div>
            <div><span>Stick asks</span><b>{target.toFixed(1)}°</b></div>
            <div><span>Time</span><b>{(time * 1000).toFixed(0)} ms</b></div>
          </div>
          <div className={styles.player}>
            <button type="button" onClick={() => (playing ? setPlaying(false) : time >= duration ? replay() : setPlaying(true))} aria-label={playing ? 'Pause' : time >= duration ? 'Replay' : 'Play'}>
              {playing ? <Pause size={16} aria-hidden="true" /> : time >= duration ? <RotateCcw size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
              {playing ? 'Pause' : time >= duration ? 'Replay' : 'Play'}
            </button>
            <label className={styles.speed}>
              <span>Speed</span>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                {SPEEDS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
              </select>
            </label>
            <input className={styles.scrub} type="range" min="0" max={duration} step={duration / 200} value={time} onChange={(e) => { setPlaying(false); setTime(Number(e.target.value)) }} aria-label="Time in the replay" />
          </div>
        </div>

        <div className={styles.panel}>
          <fieldset className={styles.group}>
            <legend>1. Choose a drone</legend>
            <div className={styles.pills} role="radiogroup">
              {DRONES.map((d) => <button key={d.id} type="button" role="radio" aria-checked={drone === d.id} onClick={() => setDrone(d.id)}>{d.name}</button>)}
            </div>
            <p className={styles.hint}>{droneInfo.note}</p>
          </fieldset>

          <fieldset className={styles.group}>
            <legend>2. Choose a test</legend>
            <div className={styles.pills} role="radiogroup">
              {TESTS.map((t) => <button key={t.id} type="button" role="radio" aria-checked={test === t.id} onClick={() => setTest(t.id)}>{t.label}</button>)}
            </div>
            <p className={styles.hint}>{testInfo.text}</p>
          </fieldset>

          <fieldset className={styles.group}>
            <legend>3. Tune it</legend>
            {GAINS.map((g) => (
              <label key={g.key} className={styles.gain}>
                <span className={styles.gainHead}><b>{g.label}</b> {g.name}<output>{sliders[g.key]}</output></span>
                <input type="range" min="0" max={g.max} step="1" value={sliders[g.key]} onChange={(e) => choose(g.key, Number(e.target.value))} />
                <span className={styles.hint}>{g.hint}</span>
              </label>
            ))}
            <div className={styles.presets} role="group" aria-label="Example tunes">
              {PRESETS.map((p) => <button key={p.id} type="button" onClick={() => applyPreset(p)}>{p.label}</button>)}
            </div>
            <p className={styles.hint}>{note}</p>
          </fieldset>

          <details className={styles.advanced}>
            <summary>Advanced: throttle and motor delay</summary>
            <label className={styles.gain}>
              <span className={styles.gainHead}>Throttle level<output>{Math.round(base * 100)}%</output></span>
              <input type="range" min="0.2" max="0.95" step="0.01" value={base} onChange={(e) => setBase(Number(e.target.value))} />
              <span className={styles.hint}>Thrust grows with speed squared, so control is stronger at high throttle.</span>
            </label>
            <label className={styles.gain}>
              <span className={styles.gainHead}>Motor and filter delay<output>{lag} ms</output></span>
              <input type="range" min="5" max="50" step="1" value={lag} onChange={(e) => setLag(Number(e.target.value))} />
              <span className={styles.hint}>More delay means the braking arrives late.</span>
            </label>
          </details>
        </div>
      </div>

      <div className={styles.results}>
        <div className={styles.cards}>
          {cards.map(([label, value, t, text]) => (
            <div key={label} className={styles.metric} data-tone={t}>
              <span className={styles.metricLabel}>{label}</span>
              <b>{value}</b>
              <span className={styles.metricText}>{text}</span>
            </div>
          ))}
        </div>
        {diagnosis && (
          <div className={styles.diagnosis} data-tone={diagnosis.tone} role="status">
            <b>{diagnosis.title}</b>
            <p>{diagnosis.text}</p>
          </div>
        )}
        <div className={styles.charts}>
          <figure className={styles.chartCard}>
            <figcaption><b>The angle follows the stick</b><span>The dashed line is what the stick asks for. The solid line is the drone.</span></figcaption>
            <CurveChart className={styles.chart} label="The drone's angle against the stick" curves={angleChart.curves} xMax={angleChart.xMax} yMax={angleChart.yMax} yMin={angleChart.yMin} cursor={time} xLabel="time (seconds)" />
          </figure>
          <figure className={styles.chartCard}>
            <figcaption><b>What each term is doing</b><span>P reacts now, I builds slowly and D brakes. The motor command is their sum, limited to the range the motors can give.</span></figcaption>
            <CurveChart className={styles.chart} label="The P, I and D terms" curves={termsChart.curves} xMax={termsChart.xMax} yMax={termsChart.yMax} yMin={termsChart.yMin} cursor={time} xLabel="time (seconds)" />
          </figure>
          <figure className={styles.chartCard}>
            <figcaption><b>Rotation rate (what the gyro measures)</b><span>D uses this to brake. Sharp changes are the drone speeding up and slowing down.</span></figcaption>
            <CurveChart className={styles.chart} label="The rotation rate" curves={rateChart.curves} xMax={rateChart.xMax} yMax={rateChart.yMax} yMin={rateChart.yMin} cursor={time} xLabel="time (seconds)" />
          </figure>
          <figure className={styles.chartCard}>
            <figcaption><b>Torque from the motors</b><span>The motor command speeds up one pair of motors and slows the other. That difference twists the drone: torque = I × angular acceleration.</span></figcaption>
            <CurveChart className={styles.chart} label="The torque from the motors" curves={torqueChart.curves} xMax={torqueChart.xMax} yMax={torqueChart.yMax} yMin={torqueChart.yMin} cursor={time} xLabel="time (seconds)" />
          </figure>
        </div>
        <p className={styles.fine}>This is a simplified model of one axis (pitch or roll), with typical, rounded numbers. A real drone adds noise, filters, a battery that sags and air that moves. Use it to build intuition, then confirm with a Blackbox log.</p>
      </div>
    </Section>
  )
}
