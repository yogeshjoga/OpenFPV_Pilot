import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowRight, Cable, Check, CircleAlert, Fan, Info, Layers, Link2, OctagonAlert, RotateCcw } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import { estimate } from './calc'
import { CATEGORIES, DEFAULT_BUILD, FRAME, resolveBuild } from './catalog'
import styles from './DroneConfigurator.module.css'

const KEYS = Object.keys(DEFAULT_BUILD)
const STORE_KEY = 'droneConfiguratorBuild'

const validId = (category, id) => CATEGORIES.find((c) => c.id === category).options.some((o) => o.id === id)

function readSaved() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
  } catch {
    return {}
  }
}

// The build comes from the link if it has one, then from the last visit, then the default.
function initialBuild(params) {
  const saved = readSaved()
  const hasLink = KEYS.some((k) => params.get(k))
  const source = hasLink ? (k) => params.get(k) : (k) => saved[k]
  return Object.fromEntries(KEYS.map((k) => [k, validId(k, source(k)) ? source(k) : DEFAULT_BUILD[k]]))
}

const fmt = (n, digits = 0) => n.toLocaleString('en-IN', { minimumFractionDigits: digits, maximumFractionDigits: digits })

// What each number means, and the scale of its bar.
const STATS = [
  { id: 'weight', label: 'Weight', unit: 'g', max: 800, value: (r) => r.weightG, show: (r) => fmt(r.weightG), note: 'Everything on the drone, battery included.' },
  { id: 'thrust', label: 'Max thrust', unit: 'kg', max: 9, value: (r) => r.maxThrustKg, show: (r) => fmt(r.maxThrustKg, 1), note: 'What the four motors can push up with, at full throttle.' },
  { id: 'twr', label: 'Thrust-to-weight', unit: ': 1', max: 16, value: (r) => r.twr, show: (r) => fmt(r.twr, 1), note: 'Thrust divided by weight. Above 1 the drone can lift off.' },
  { id: 'hover', label: 'Hover throttle', unit: '%', max: 100, value: (r) => r.hoverThrottle * 100, show: (r) => fmt(r.hoverThrottle * 100), note: 'How far the throttle stick is to just hold the drone in the air.' },
  { id: 'speed', label: 'Top speed', unit: 'km/h', max: 220, value: (r) => r.topSpeedKmh, show: (r) => fmt(r.topSpeedKmh), note: 'An estimate from motor speed and prop pitch.' },
  { id: 'hovertime', label: 'Hover time', unit: 'min', max: 25, value: (r) => r.hoverMin, show: (r) => fmt(r.hoverMin, 1), note: 'How long it could hover, using 80% of the battery.' },
  { id: 'flight', label: 'Freestyle flight', unit: 'min', max: 12, value: (r) => r.flightMin, show: (r) => fmt(r.flightMin, 1), note: 'Flying hard takes about 2.5 times the power of hovering.' },
]

const WEIGHT_ROWS = [
  ['frame', 'Frame'],
  ['motors', 'Motors (4)'],
  ['props', 'Propellers (4)'],
  ['battery', 'Battery'],
  ['video', 'Video'],
  ['stack', 'Flight controller and speed controller'],
  ['extras', 'Receiver, antennas, wires, screws'],
]

// The wire colours in the 3D view, with the usual motor numbers and spin directions for a quad with props in
const MOTOR_KEY = [
  { name: 'Motor 2: front right, clockwise', color: 'var(--wire-front-right)' },
  { name: 'Motor 4: front left, anticlockwise', color: 'var(--wire-front-left)' },
  { name: 'Motor 1: rear right, anticlockwise', color: 'var(--wire-rear-right)' },
  { name: 'Motor 3: rear left, clockwise', color: 'var(--wire-rear-left)' },
]

const LEVEL_ICON = { error: OctagonAlert, warn: CircleAlert, info: Info }

export default function DroneConfigurator() {
  const [params, setParams] = useSearchParams()
  const [build, setBuild] = useState(() => initialBuild(params))
  const [category, setCategory] = useState('motor')
  const [spin, setSpin] = useState(false)
  const [wiring, setWiring] = useState(false)
  const [explode, setExplode] = useState(0)
  const [glow, setGlow] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)
  const viewRef = useRef(null)
  const stageRef = useRef(null)
  const initialBuildRef = useRef(null)

  const result = useMemo(() => estimate(build), [build])
  const parts = useMemo(() => resolveBuild(build), [build])
  initialBuildRef.current = build // the 3D view starts from whatever is chosen when it finishes loading

  // keep the link and the saved build in step with the choices
  useEffect(() => {
    setParams(new URLSearchParams(build), { replace: true })
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(build))
    } catch {
      // the build just is not remembered
    }
  }, [build, setParams])

  // the 3D view loads on its own, only when this page is opened
  useEffect(() => {
    let cancelled = false
    let observer
    let resize
    import('@components/three/DroneBuilder')
      .then(({ createDroneBuilder }) => {
        if (cancelled || !canvasRef.current) return
        const view = createDroneBuilder(canvasRef.current, { onPick: (id) => setCategory(id === 'frame' ? 'frame' : id) })
        viewRef.current = view
        view.size()
        view.setBuild(resolveBuild(initialBuildRef.current))
        resize = new ResizeObserver(() => view.size())
        resize.observe(canvasRef.current)
        observer = new IntersectionObserver((entries) => view.setActive(entries[entries.length - 1].isIntersecting), { rootMargin: '80px' })
        observer.observe(stageRef.current)
      })
      .catch(() => {
        if (!cancelled) setError('Your browser could not start the 3D view. The numbers and parts still work.')
      })
    return () => {
      cancelled = true
      observer?.disconnect()
      resize?.disconnect()
      viewRef.current?.dispose()
      viewRef.current = null
    }
  }, [])

  useEffect(() => { viewRef.current?.setBuild(parts) }, [parts])
  useEffect(() => { viewRef.current?.setSpin(spin) }, [spin])
  useEffect(() => { viewRef.current?.setReveal(wiring) }, [wiring, parts])
  useEffect(() => { viewRef.current?.setExplode(explode) }, [explode])
  useEffect(() => { viewRef.current?.highlight(glow) }, [glow])

  const choose = (cat, id) => setBuild((b) => ({ ...b, [cat]: id }))
  const reset = () => setBuild({ ...DEFAULT_BUILD })
  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [])

  const current = CATEGORIES.find((c) => c.id === category)
  const selected = category === 'frame' ? FRAME : parts[category]
  const tabs = [{ id: 'frame', label: 'Frame' }, ...CATEGORIES.map((c) => ({ id: c.id, label: c.label }))]

  return (
    <PageWrapper>
      <section className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Drone configurator</p>
          <h1 className={styles.title}>Build your own 5-inch freestyle drone</h1>
          <p className={styles.subtitle}>
            Pick the motors, propellers, battery and video system. The 3D drone changes, and the numbers show how it would fly.
            Click a part on the drone to change it.
          </p>
        </div>
      </section>

      <section className={styles.main}>
        <div className={`container ${styles.grid}`}>
          <div className={styles.viewer}>
            <div ref={stageRef} className={styles.stage}>
              <canvas ref={canvasRef} className={styles.canvas} aria-label="3D view of your drone. Drag to look around, scroll to zoom, double click to reset." />
              {error && <p className={styles.canvasError} role="status">{error}</p>}
              <div className={styles.tools}>
                <button type="button" className={styles.tool} aria-pressed={spin} onClick={() => setSpin((s) => !s)}>
                  <Fan size={16} aria-hidden="true" />
                  Spin props
                </button>
                <button type="button" className={styles.tool} aria-pressed={wiring} onClick={() => setWiring((w) => !w)}>
                  <Cable size={16} aria-hidden="true" />
                  Show wiring
                </button>
                <label className={styles.explode}>
                  <Layers size={16} aria-hidden="true" />
                  Exploded view
                  <input type="range" min="0" max="1" step="0.01" value={explode} onChange={(e) => setExplode(Number(e.target.value))} />
                </label>
                <button type="button" className={styles.tool} onClick={() => viewRef.current?.resetView()}>
                  <RotateCcw size={16} aria-hidden="true" />
                  Reset view
                </button>
              </div>
            </div>
            {wiring && (
              <div className={styles.wiring}>
                <p>
                  Each motor has three wires. They run from the motor, along the arm, over the edge of the plate and are soldered to that motor's three
                  pads on the speed controller (ESC). Swap any two of a motor's wires and it spins the other way.
                </p>
                <ul className={styles.motorKey}>
                  {MOTOR_KEY.map((k) => (
                    <li key={k.name}>
                      <span className={styles.chip} style={{ background: k.color }} />
                      {k.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <p className={styles.legend}>
              Drag to look around, scroll to zoom. Orange props spin clockwise and blue props spin anticlockwise, so their twisting forces cancel.
            </p>

            <div className={styles.picker}>
              <div className={styles.tabs} role="tablist" aria-label="Part type">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={category === t.id}
                    className={styles.tab}
                    onClick={() => setCategory(t.id)}
                    onMouseEnter={() => t.id !== 'frame' && setGlow(t.id)}
                    onMouseLeave={() => setGlow(null)}
                    onFocus={() => t.id !== 'frame' && setGlow(t.id)}
                    onBlur={() => setGlow(null)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {category === 'frame' ? (
                <p className={styles.fixed}>
                  This version has one frame: the {FRAME.name}. It takes props up to {FRAME.maxPropIn} inches, motors on a {FRAME.motorMount} mount and a {FRAME.stackMount} stack.
                </p>
              ) : (
                <div className={category === 'color' ? styles.swatches : styles.options} role="radiogroup" aria-label={current.label}>
                  {current.options.map((o) => {
                    const on = build[category] === o.id
                    return category === 'color' ? (
                      <button
                        key={o.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        className={styles.swatch}
                        onClick={() => choose(category, o.id)}
                        title={o.name}
                      >
                        <span className={styles.chip} style={{ background: `#${o.hex.toString(16).padStart(6, '0')}` }} />
                        {o.name}
                        {on && <Check size={14} aria-hidden="true" />}
                      </button>
                    ) : (
                      <button key={o.id} type="button" role="radio" aria-checked={on} className={styles.option} onClick={() => choose(category, o.id)}>
                        <span className={styles.optionName}>{o.name}</span>
                        <span className={styles.optionShort}>{o.short}</span>
                        <span className={styles.optionWeight}>{o.weightG} g</span>
                      </button>
                    )
                  })}
                </div>
              )}

              <div className={styles.learn}>
                <h2 className={styles.learnTitle}>{category === 'frame' ? FRAME.name : `${current.label}: ${selected.name}`}</h2>
                <p>{selected.learn}</p>
              </div>
            </div>
          </div>

          <aside className={styles.side}>
            <section className={styles.panel} aria-labelledby="stats-title">
              <h2 id="stats-title" className={styles.panelTitle}>How it would fly</h2>
              <ul className={styles.stats}>
                {STATS.map((s) => (
                  <li key={s.id} className={styles.stat}>
                    <div className={styles.statHead}>
                      <span>{s.label}</span>
                      <span className={styles.statValue}>
                        {s.show(result)} <span className={styles.unit}>{s.unit}</span>
                      </span>
                    </div>
                    <div className={styles.bar} role="presentation">
                      <span className={styles.fill} style={{ width: `${Math.min(100, (s.value(result) / s.max) * 100)}%` }} />
                    </div>
                    <p className={styles.note}>{s.note}</p>
                  </li>
                ))}
              </ul>
              <p className={styles.fine}>
                Estimates from simple physics and typical, rounded part figures, for learning. A real build can differ.
              </p>
            </section>

            <section className={styles.panel} aria-labelledby="check-title">
              <h2 id="check-title" className={styles.panelTitle}>Does it work together?</h2>
              {result.warnings.length === 0 ? (
                <p className={styles.good}>
                  <Check size={16} aria-hidden="true" /> Every part fits and nothing is over its limit.
                </p>
              ) : (
                <ul className={styles.warnings}>
                  {result.warnings.map((w) => {
                    const Icon = LEVEL_ICON[w.level]
                    return (
                      <li key={w.id} className={styles[w.level]}>
                        <Icon size={16} aria-hidden="true" />
                        <span>{w.text}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            <section className={styles.panel} aria-labelledby="weight-title">
              <h2 id="weight-title" className={styles.panelTitle}>Where the weight goes</h2>
              <table className={styles.weights}>
                <tbody>
                  {WEIGHT_ROWS.map(([key, label]) => (
                    <tr key={key}>
                      <th scope="row">{label}</th>
                      <td>{fmt(result.weights[key], key === 'props' ? 1 : 0)} g</td>
                    </tr>
                  ))}
                  <tr className={styles.total}>
                    <th scope="row">Total</th>
                    <td>{fmt(result.weightG)} g</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <div className={styles.actions}>
              <button type="button" className={styles.tool} onClick={copyLink}>
                <Link2 size={16} aria-hidden="true" />
                {copied ? 'Link copied' : 'Copy link to this build'}
              </button>
              <button type="button" className={styles.tool} onClick={reset}>
                <RotateCcw size={16} aria-hidden="true" />
                Start again
              </button>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.next}>
        <div className="container">
          <p>Want to build and fly one with a coach next to you?</p>
          <Link to="/workshops" className={styles.cta}>
            See the workshops <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </PageWrapper>
  )
}
