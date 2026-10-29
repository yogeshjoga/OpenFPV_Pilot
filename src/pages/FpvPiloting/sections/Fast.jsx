import { useMemo, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import CurveChart, { niceMax } from '@components/charts/CurveChart'
import { FAST } from '../data/skills.js'
import { stopping } from '../sim.js'
import { Block, Section } from '../shared.jsx'
import Pages from '../widgets/Pages.jsx'
import styles from './Fast.module.css'

const COLOR = { reaction: '#f5a524', braking: '#3e8ef7', total: '#e5484d' }
const GATE_SPACING = 8 // metres between gates on a typical track

// Move the sliders and see how much room a drone needs at speed: the distance you cover while you see and decide,
// plus the distance it takes to slow down.
function Calculator() {
  const [kmh, setKmh] = useState(100)
  const [reaction, setReaction] = useState(0.4)
  const [brake, setBrake] = useState(55)
  const now = stopping(kmh, reaction, brake)

  const curves = useMemo(() => {
    const xs = Array.from({ length: 41 }, (_, k) => (k * 200) / 40)
    const rows = xs.map((v) => stopping(v, reaction, brake))
    return [
      { xs, ys: rows.map((r) => r.reaction), color: COLOR.reaction, label: 'while you react (m)' },
      { xs, ys: rows.map((r) => r.braking), color: COLOR.braking, label: 'while you brake (m)' },
      { xs, ys: rows.map((r) => r.total), color: COLOR.total, label: 'total to stop (m)', width: 3 },
    ]
  }, [reaction, brake])
  const yMax = niceMax(Math.max(...curves[2].ys))

  const share = (now.reaction / now.total) * 100
  return (
    <div className={styles.calc}>
      <div className={styles.inputs}>
        <label>
          <span>Speed <b>{kmh} km/h</b></span>
          <input type="range" min="20" max="200" step="5" value={kmh} onChange={(e) => setKmh(Number(e.target.value))} />
        </label>
        <label>
          <span>Your reaction time <b>{reaction.toFixed(2)} s</b></span>
          <input type="range" min="0.2" max="0.8" step="0.05" value={reaction} onChange={(e) => setReaction(Number(e.target.value))} />
          <small>From seeing it to your thumb moving. Most people need 0.3 to 0.5 seconds, more when tired.</small>
        </label>
        <label>
          <span>How far you tip back to brake <b>{brake}°</b></span>
          <input type="range" min="30" max="70" step="1" value={brake} onChange={(e) => setBrake(Number(e.target.value))} />
          <small>Steeper is a harder brake, but needs a powerful drone to hold its height.</small>
        </label>
      </div>

      <div className={styles.results}>
        <div className={styles.cards}>
          <div><span>Speed</span><b>{now.v.toFixed(1)} m/s</b><small>metres every second</small></div>
          <div style={{ '--c': COLOR.reaction }}><span>You react</span><b>{now.reaction.toFixed(0)} m</b><small>gone before your thumb moves</small></div>
          <div style={{ '--c': COLOR.braking }}><span>You brake</span><b>{now.braking.toFixed(0)} m</b><small>slowing at {now.decel.toFixed(0)} m/s²</small></div>
          <div style={{ '--c': COLOR.total }}><span>To stop</span><b>{now.total.toFixed(0)} m</b><small>about {(now.total / GATE_SPACING).toFixed(1)} gates ({GATE_SPACING} m apart)</small></div>
        </div>
        <div className={styles.bar} role="img" aria-label={`You travel ${now.reaction.toFixed(0)} metres while reacting, then ${now.braking.toFixed(0)} metres braking`}>
          <span style={{ width: `${share}%`, background: COLOR.reaction }}>react</span>
          <span style={{ width: `${100 - share}%`, background: COLOR.braking }}>brake</span>
        </div>
        <p className={styles.read}>
          <b>What this means:</b> to be able to stop, you must see a problem at least <b>{now.total.toFixed(0)} metres</b> away, which is <b>{now.seconds.toFixed(1)} seconds</b> ahead at this speed.
          Look at least that far ahead.
        </p>
        <p className={styles.small}>A careful estimate: it ignores drag and wind, which help a little. It assumes the drone can hold its height while tipped back.</p>
      </div>

      <div className={styles.chart}>
        <h5>Speed against the room needed to stop</h5>
        <CurveChart curves={curves} xMax={200} yMax={yMax} dot={{ x: kmh, y: now.total, color: COLOR.total }} xLabel="speed (km/h)" label="How the distance needed to stop grows with speed" />
        <p>Double the speed and the braking distance is <b>four times</b> as long. That is the reason fast flying is about looking further ahead, not about faster hands.</p>
      </div>
    </div>
  )
}

function Cards({ items }) {
  return (
    <div className={styles.items}>
      {items.map((i) => (
        <article key={i.title}>
          <h5>{i.title}</h5>
          <p>{i.text}</p>
        </article>
      ))}
    </div>
  )
}

export default function Fast() {
  const { decisions, braking, speedControl, quick } = FAST
  return (
    <Section
      id="fast"
      kicker="Part 5 · Flying fast"
      title="Decisions, braking and speed at 100+ km/h"
      intro={FAST.intro}
    >
      <p className={styles.safety}><TriangleAlert size={18} aria-hidden="true" /> {FAST.safety}</p>

      <Pages label="Flying fast" items={[
      { id: 'room', label: 'How much room', node: (
        <Block title="How much room do you need?" intro="Try it. This is the number that changes how you fly.">
        <Calculator />
      </Block>
      ) },

      { id: 'decide', label: 'Decisions at speed', node: (
        <Block title={decisions.title}>
        <ol className={styles.steps}>
          {decisions.steps.map((s) => (
            <li key={s.n}>
              <span>{s.n}</span>
              <div>
                <h5>{s.title}</h5>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </Block>
      ) },

      { id: 'brake', label: 'Braking', node: (
        <Block title={braking.title} intro={braking.intro}><Cards items={braking.items} /></Block>
      ) },
      { id: 'speed', label: 'Speed control', node: (
        <Block title={speedControl.title}><Cards items={speedControl.items} /></Block>
      ) },
      { id: 'quick', label: 'Fast decisions', node: (
        <Block title={quick.title}><Cards items={quick.items} /></Block>
      ) },
      ]} />
    </Section>
  )
}
