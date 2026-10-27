import { useMemo, useState } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import CurveChart from '@components/charts/CurveChart'
import { DEFAULT_SLIDERS, HOVER, hoverInducedVelocity, inducedVelocity, powerW } from '../../DroneLesson/physics.js'
import { DRONES, authority, simulate } from '../sim.js'
import { Block, LINE, MetricTable, Section, responseChart } from '../shared.jsx'
import LoopDiagram from './LoopDiagram.jsx'
import styles from './Learn.module.css'

const tune = (changes) => ({ ...DEFAULT_SLIDERS, ...changes })

// a chart of recorded runs, with the numbers underneath
function ResponseCard({ title, text, runs, channel = 'angle', override, takeaway }) {
  const chart = useMemo(() => {
    const c = responseChart(runs, channel)
    return override ? { ...c, ...override } : c
  }, [runs, channel, override])
  return (
    <figure className={styles.card}>
      <figcaption>
        <b>{title}</b>
        <span>{text}</span>
      </figcaption>
      <CurveChart className={styles.chart} label={title} curves={chart.curves} xMax={chart.xMax} yMax={chart.yMax} yMin={chart.yMin} xLabel="time (seconds)" />
      <MetricTable rows={runs} />
      {takeaway && <p className={styles.takeaway}><b>What to take away:</b> {takeaway}</p>}
    </figure>
  )
}

const TERMS = [
  {
    id: 'P',
    name: 'P: proportional',
    senses: 'The present: how wrong the angle is right now.',
    formula: 'P = Kp × error',
    analogy: 'Steering a car: the further you are from the middle of the lane, the harder you turn the wheel.',
    physics: 'Alone, P acts like a spring. The drone gets pulled back to the target, shoots past it, is pulled back again, and swings for a long time. That is why P needs D.',
    pros: ['A fast, direct response', 'Strong hold against gusts'],
    cons: ['Too high: overshoot, a fast shake, hot motors', 'Makes vibration and noise worse'],
    tooLow: 'Soft, slow and mushy. Gusts push the drone around.',
    tooHigh: 'A fast wobble, an audible buzz, hot motors, overshoot after every move.',
    charts: [
      { test: 'step', title: 'Stick step, with three values of P', text: 'The stick asks for 15 degrees at 0.1 seconds. Same I and D every time.', runs: [{ label: 'P 15 (low)', sliders: tune({ p: 15 }), color: LINE.warn }, { label: 'P 45 (good)', sliders: tune({}), color: LINE.good }, { label: 'P 100 (high)', sliders: tune({ p: 100 }), color: LINE.bad }], takeaway: 'More P makes the first part of the move faster, but past a point the overshoot just grows and the drone rings.' },
      { test: 'gust', title: 'A gust of wind, with three values of P', text: 'The stick stays centred. A short push knocks the drone over.', runs: [{ label: 'P 15', sliders: tune({ p: 15 }), color: LINE.warn }, { label: 'P 45', sliders: tune({}), color: LINE.good }, { label: 'P 100', sliders: tune({ p: 100 }), color: LINE.bad }], takeaway: 'A very high P does not help against a gust: the extra swinging makes it recover later.' },
    ],
  },
  {
    id: 'I',
    name: 'I: integral',
    senses: 'The past: how long the error has lasted.',
    formula: 'I = Ki × (error added up over time)',
    analogy: 'Leaning into a steady wind: if you have been pushed off course for a while, you lean harder until you are back on track.',
    physics: 'A steady force, such as wind, an uneven battery or a heavy camera, needs a steady correction. P alone only gives a correction when there is an error, so it always settles a little off target. I keeps adding until the error is zero.',
    pros: ['Removes steady offsets', 'Keeps the attitude locked through long turns'],
    cons: ['Too high: a slow bounce back and forth', 'Can wind up during fast moves'],
    tooLow: 'The drone drifts or sags when something pushes it steadily.',
    tooHigh: 'A slow, lazy bounce after flips and rolls.',
    charts: [
      { test: 'push', title: 'A steady crosswind, with three values of I', text: 'A constant push starts at 0.1 seconds and does not stop.', runs: [{ label: 'I 0', sliders: tune({ i: 0 }), color: LINE.bad }, { label: 'I 80 (good)', sliders: tune({}), color: LINE.good }, { label: 'I 150', sliders: tune({ i: 150 }), color: LINE.blue }], takeaway: 'Without I the drone settles tilted. With I it creeps back to the target. More I gets there sooner.' },
      { test: 'step', title: 'Stick step, with three values of I', text: 'I barely changes a quick move, which is why P and D are tuned first.', runs: [{ label: 'I 0', sliders: tune({ i: 0 }), color: LINE.bad }, { label: 'I 80', sliders: tune({}), color: LINE.good }, { label: 'I 150', sliders: tune({ i: 150 }), color: LINE.blue }], takeaway: 'For quick moves I changes little. Its job is the slow, steady part.' },
    ],
  },
  {
    id: 'D',
    name: 'D: derivative',
    senses: 'The future: how fast the error is changing.',
    formula: 'D = −Kd × (how fast the angle is changing)',
    analogy: 'Braking before a corner: the faster you approach the target, the earlier and harder you ease off.',
    physics: 'D acts like friction on the rotation, so it takes energy out of the swing. It makes the quad slow down before it reaches the target, instead of crashing through it. But it reacts to the signal\'s slope, so it also amplifies noise.',
    pros: ['Damps overshoot and wobble', 'Calms prop wash and the end of flips'],
    cons: ['Amplifies noise: hot motors', 'Too high: slow, numb and a high-pitched buzz'],
    tooLow: 'Overshoot and ringing after every stick move, and bad prop wash.',
    tooHigh: 'Slow and numb, hot motors and sometimes a buzz.',
    charts: [
      { test: 'step', title: 'Stick step, with three values of D', text: 'The same stick snap, with only D changed.', runs: [{ label: 'D 0 (none)', sliders: tune({ d: 0 }), color: LINE.bad }, { label: 'D 42 (good)', sliders: tune({}), color: LINE.good }, { label: 'D 100 (high)', sliders: tune({ d: 100 }), color: LINE.blue }], takeaway: 'Without D the drone rings and never settles. A lot of D is smooth but slow. The best value is in between.' },
      { test: 'propwash', title: 'Prop wash, with three values of D', text: 'Turbulence from the drone\'s own props shakes it for half a second.', runs: [{ label: 'D 12 (low)', sliders: tune({ d: 12 }), color: LINE.bad }, { label: 'D 42 (good)', sliders: tune({}), color: LINE.good }, { label: 'D 100 (high)', sliders: tune({ d: 100 }), color: LINE.blue }], takeaway: 'D is the term that fights prop wash. Too little and the shaking grows.' },
    ],
  },
  {
    id: 'ALL',
    name: 'All three together',
    senses: 'The present, the past and the future, added up.',
    formula: 'output = P + I + D',
    analogy: 'A good driver uses all three at once: steer for where you are, lean into the wind you have felt, and ease off as you approach.',
    physics: 'The three terms are added into one motor command. P sets how strongly it pulls toward the target, D sets how much it is damped, and I removes the steady error. They are not independent: raising P needs more D.',
    pros: ['A response that is both quick and calm', 'Works on every size of drone with the right numbers'],
    cons: ['The three interact, so change one thing at a time'],
    tooLow: 'Too little of everything: slow, soft and drifting.',
    tooHigh: 'Too much of everything: shaking, buzzing and hot motors.',
    charts: [
      { test: 'step', title: 'Three complete tunes', text: 'A soft, a balanced and a hot tune, on the same stick step.', runs: [{ label: 'Soft (20, 60, 25)', sliders: { p: 20, i: 60, d: 25 }, color: LINE.warn }, { label: 'Balanced (45, 80, 42)', sliders: tune({}), color: LINE.good }, { label: 'Hot (85, 100, 20)', sliders: { p: 85, i: 100, d: 20 }, color: LINE.bad }], takeaway: 'High P with low D is the classic bad tune: fast, but it rings.' },
      { test: 'step', channel: 'terms', title: 'What each term does during the balanced tune', text: 'The three terms over time, for the balanced tune and the stick step.', runs: [{ label: 'Balanced', sliders: tune({}), color: LINE.good }], takeaway: 'P jumps first, D fights it as the drone speeds up, and I creeps up slowly in the background. The sum is the motor command.' },
    ],
  },
]

const SIZES = DRONES.map((d, i) => ({ ...d, color: [LINE.blue, LINE.good, LINE.bad][i] }))

export default function Learn() {
  const [term, setTerm] = useState('P')
  const current = TERMS.find((t) => t.id === term)

  // every experiment is run once from the real physics (see ../sim.js)
  const termRuns = useMemo(
    () => current.charts.map((c) => ({ ...c, runs: c.runs.map((r) => ({ ...r, result: simulate({ test: c.test, sliders: r.sliders }) })) })),
    [current],
  )
  const why = useMemo(() => [
    { label: 'No PID (all zero)', color: LINE.bad, result: simulate({ test: 'gust', sliders: { p: 0, i: 0, d: 0 } }) },
    { label: 'Balanced PID', color: LINE.good, result: simulate({ test: 'gust' }) },
  ], [])
  const hot = { p: 70, i: 60, d: 35 }
  const throttle = useMemo(() => [
    { label: 'Throttle 25%', color: LINE.good, result: simulate({ test: 'step', sliders: hot, base: 0.25, lagS: 0.035 }) },
    { label: 'Throttle 55%', color: LINE.warn, result: simulate({ test: 'step', sliders: hot, base: 0.55, lagS: 0.035 }) },
    { label: 'Throttle 90%', color: LINE.bad, result: simulate({ test: 'step', sliders: hot, base: 0.9, lagS: 0.035 }) },
  ], [])
  const lag = useMemo(() => [
    { label: 'Delay 10 ms', color: LINE.good, result: simulate({ test: 'step', lagS: 0.01 }) },
    { label: 'Delay 25 ms', color: LINE.warn, result: simulate({ test: 'step', lagS: 0.025 }) },
    { label: 'Delay 45 ms', color: LINE.bad, result: simulate({ test: 'step', lagS: 0.045 }) },
  ], [])
  const size = useMemo(() => SIZES.map((d) => ({ label: d.name, color: d.color, result: simulate({ test: 'step', drone: d.id }) })), [])
  const wind = useMemo(() => [
    { label: 'No I', color: LINE.bad, result: simulate({ test: 'push', sliders: tune({ i: 0 }) }) },
    { label: 'I 80', color: LINE.good, result: simulate({ test: 'push' }) },
  ], [])
  const wash = useMemo(() => [
    { label: 'D 12', color: LINE.bad, result: simulate({ test: 'propwash', sliders: tune({ d: 12 }) }) },
    { label: 'D 42', color: LINE.good, result: simulate({ test: 'propwash' }) },
  ], [])
  const authLine = useMemo(() => {
    const xs = Array.from({ length: 21 }, (_, k) => (0.1 + (k / 20) * 0.9))
    return { xs, ys: xs.map((t) => authority(DRONES[0], t)) }
  }, [])
  const airSpeeds = useMemo(() => {
    const xs = Array.from({ length: 41 }, (_, k) => k)
    return { xs, ys: xs.map((v) => inducedVelocity(v)), rows: [0, 8, 16, 24].map((v) => ({ v, vi: inducedVelocity(v), p: powerW(v).total })) }
  }, [])

  return (
    <Section
      id="learn"
      kicker="Part 1 · Learn"
      title="Learn how PID tuning works, and why"
      intro="Before you touch a slider, understand what the controller is doing. Every graph on this page is made by the same physics: thrust, torque, inertia and delay. Nothing here is drawn by hand."
    >
      <Block title="Why a quad needs a controller" intro="A quad has no wings or tail to make it settle. Push it, and it keeps turning.">
        <div className={styles.two}>
          <ul className={styles.facts}>
            <li><b>Newton’s first law, for rotation.</b> Once a drone starts to rotate, it keeps rotating until a torque stops it. There is no air-spring to bring it back.</li>
            <li><b>Torque comes from unequal thrust.</b> Speed up two motors and slow the other two, and the thrust difference twists the drone: τ = r × F. Its resistance to turning is the moment of inertia I, so the turning acceleration is α = τ / I.</li>
            <li><b>A pilot is far too slow.</b> A person reacts in about 200 ms. A drone that tips 400 degrees per second needs a correction in a few milliseconds. The flight controller makes that correction 4,000 to 8,000 times a second.</li>
          </ul>
          <ResponseCard
            title="The same gust, without and with a controller"
            text="A short push knocks the drone over. The chart is cut off at 60 degrees."
            runs={why}
            override={{ yMax: 60, yMin: -20 }}
            takeaway="With no controller the drone just keeps turning. With PID it is back on target in a fraction of a second."
          />
        </div>
      </Block>

      <Block title="The control loop" intro="Every loop of the controller does the same eight things. Click a stage, or let the tour run.">
        <LoopDiagram />
      </Block>

      <Block title="P, I and D, one at a time" intro="Pick a term. Each graph below comes from running the real simulation with only that term changed.">
        <div role="tablist" aria-label="PID terms" className={styles.tabs}>
          {TERMS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={term === t.id} className={styles.tab} onClick={() => setTerm(t.id)}>{t.name}</button>
          ))}
        </div>
        <div className={styles.termGrid}>
          <aside className={styles.termInfo}>
            <p className={styles.sense}>{current.senses}</p>
            <code className={styles.formula}>{current.formula}</code>
            <p><b>Think of it like this.</b> {current.analogy}</p>
            <p><b>The physics.</b> {current.physics}</p>
            <div className={styles.proscons}>
              <div>
                <h5>Pros</h5>
                <ul>{current.pros.map((p) => <li key={p}><Check size={14} aria-hidden="true" />{p}</li>)}</ul>
              </div>
              <div>
                <h5>Cons</h5>
                <ul>{current.cons.map((p) => <li key={p}><TriangleAlert size={14} aria-hidden="true" />{p}</li>)}</ul>
              </div>
            </div>
            <dl className={styles.symptoms}>
              <div><dt>Too low</dt><dd>{current.tooLow}</dd></div>
              <div><dt>Too high</dt><dd>{current.tooHigh}</dd></div>
            </dl>
          </aside>
          <div className={styles.termCharts}>
            {termRuns.map((c) => (
              <ResponseCard key={c.title} title={c.title} text={c.text} runs={c.runs} channel={c.channel} takeaway={c.takeaway} />
            ))}
          </div>
        </div>
      </Block>

      <Block title="Where physics meets aerodynamics" intro="A tune does not work in a vacuum. It works on a body that is pushed by air, powered by motors that take time to react, and sized to its props. Each card links one real effect to a graph and to the Betaflight setting that deals with it.">
        <div className={styles.cards}>
          <figure className={styles.card}>
            <figcaption>
              <b>1. Thrust grows with speed squared, so control grows with throttle</b>
              <span>Thrust ∝ n². A small change in motor command changes thrust more when the motors are already fast, so the loop has more punch at high throttle. The first chart is how much torque a full PID output makes at each throttle.</span>
            </figcaption>
            <CurveChart className={styles.chartShort} label="Control authority against throttle" curves={[{ xs: authLine.xs, ys: authLine.ys, color: LINE.good, width: 2.6, label: 'torque from full PID output (N m)' }]} xMax={1} yMax={0.6} xLabel="throttle (0 to 1)" markers={[{ x: HOVER, label: 'hover', color: LINE.warn }]} />
            <CurveChart className={styles.chart} label="The same hot tune at three throttle levels" curves={responseChart(throttle).curves} xMax={responseChart(throttle).xMax} yMax={responseChart(throttle).yMax} yMin={responseChart(throttle).yMin} xLabel="time (seconds)" />
            <MetricTable rows={throttle} />
            <p className={styles.takeaway}><b>What to take away:</b> The same tune feels sharper and rings more at full throttle, because the loop is stronger there. That is what <b>TPA</b>, <b>thrust linearization</b> and <b>anti-gravity</b> are for.</p>
          </figure>

          <ResponseCard
            title="2. Delay is the enemy of D"
            text="Motors need time to change speed, and every filter adds delay too. Here the same balanced tune meets 10, 25 and 45 milliseconds of delay."
            runs={lag}
            takeaway="The more delay, the later the braking arrives, and the more the drone overshoots. That is why modern Betaflight uses the RPM filter (it removes noise with almost no delay) so that D can stay high."
          />
          <ResponseCard
            title="3. Size and inertia"
            text="The same tune on a 3-inch, a 5-inch and a 7-inch drone. Bigger drones are heavier and have longer arms, so they resist turning more."
            runs={size}
            takeaway="A heavy 7-inch drone is slower to start and to stop, and overshoots more with a tune made for a 5-inch. Big drones usually want lower P and more D. Small ones are quick and forgiving."
          />
          <ResponseCard
            title="4. Steady wind and the I term"
            text="A crosswind, an off-centre battery or a camera hanging on one side pushes steadily on the drone."
            runs={wind}
            takeaway="Without I the drone settles tilted. I keeps adding until the error is gone. This is also why the I-term relax setting exists: so that I does not wind up during fast moves."
          />
          <ResponseCard
            title="5. Prop wash"
            text="When a drone falls or turns hard, it flies into its own downwash. The air is turbulent, and the drone gets shaken."
            runs={wash}
            takeaway="D is what quietens the shaking. Dynamic idle (it keeps the motors spinning at least this fast) and a clean RPM filter also help."
          />
          <figure className={styles.card}>
            <figcaption>
              <b>6. Why the feel changes with speed</b>
              <span>Momentum theory for the props: the air pushed down by the props moves more slowly through them when the drone is flying forward. The chart shows the average speed of that air for this 5-inch drone.</span>
            </figcaption>
            <CurveChart className={styles.chart} label="Speed of the air pushed down against forward speed" curves={[{ xs: airSpeeds.xs, ys: airSpeeds.ys, color: LINE.blue, width: 2.6, label: 'air pushed down (m/s)' }]} xMax={40} yMax={Math.ceil(hoverInducedVelocity() + 1)} xLabel="forward speed (m/s)" />
            <div className={styles.tableWrap}>
              <table className={styles.metricTable}>
                <thead><tr><th scope="col">Forward speed</th><th scope="col">Air pushed down</th><th scope="col">Power</th></tr></thead>
                <tbody>
                  {airSpeeds.rows.map((r) => <tr key={r.v}><th scope="row">{r.v} m/s</th><td>{r.vi.toFixed(1)} m/s</td><td>{r.p.toFixed(0)} W</td></tr>)}
                </tbody>
              </table>
            </div>
            <p className={styles.takeaway}><b>What to take away:</b> In a hover the props push through still, turbulent air. At speed the air is already moving, so there is less turbulence and less prop wash. Prop wash is worst when you slow down and drop, which is why it shows up at the end of a dive.</p>
          </figure>
        </div>
      </Block>

      <Block title="How to read the numbers" intro="Four numbers describe almost every response. You will see them again in the tuning lab.">
        <dl className={styles.glossary}>
          <div><dt>Rise time</dt><dd>How long it takes to get 90% of the way to the target. Shorter is snappier.</dd></div>
          <div><dt>Overshoot</dt><dd>How far it goes past the target, as a percentage of the move. A little (under 10%) is normal. A lot means ringing.</dd></div>
          <div><dt>Settling time</dt><dd>How long until it stays within 5% of the target. It tells you how calm the tune is.</dd></div>
          <div><dt>Steady error</dt><dd>How far from the target it ends up. It should be close to zero. If not, the I term is too low.</dd></div>
        </dl>
      </Block>
    </Section>
  )
}
