import { useMemo, useState } from 'react'
import { bestOrder, constellation, pathLossDb, rangeKm, receiveChirp, receivedDbm, symbolErrors, wavelengthM } from '../hardware.js'
import { Chapter, Choices, Lab, Plot, Readout, Slider, polyline, scale, useClock, useLive } from '../parts.jsx'
import Scene3D from '../widgets/Scene3D.jsx'
import { createBoard, createWave } from '../widgets/scenes.js'
import styles from '../DroneHardware.module.css'

// ---------------------------------------------------------------------------------------------------------------
// Why 2.4 GHz goes through walls and light does not
// ---------------------------------------------------------------------------------------------------------------

// Typical loss through each wall at 2.4 GHz, in dB. Rough figures: real walls vary a lot with what is inside them and how wet they are.
const WALLS = [
  { id: 'glass', label: 'Window glass', radio: 2, light: 0.5, color: 0x9fd6e8 },
  { id: 'drywall', label: 'Plasterboard', radio: 3, light: 100, color: 0xe8e2d6 },
  { id: 'brick', label: 'Brick', radio: 8, light: 100, color: 0xb5523b },
  { id: 'concrete', label: 'Concrete', radio: 13, light: 100, color: 0x8d9096 },
  { id: 'metal', label: 'Metal sheet', radio: 100, light: 100, color: 0xc7ccd4 },
]
const BANDS = [
  { id: 900, label: '900 MHz', mhz: 900 },
  { id: 2400, label: '2.4 GHz', mhz: 2400 },
  { id: 5800, label: '5.8 GHz', mhz: 5800 },
]

function WaveLab() {
  const clock = useClock()
  const [kind, setKind] = useState('radio')
  const [wallId, setWallId] = useState('drywall')
  const [band, setBand] = useState(2400)
  const wall = WALLS.find((w) => w.id === wallId)
  const mhz = BANDS.find((b) => b.id === band).mhz
  const loss = kind === 'radio' ? Math.min(100, wall.radio * Math.sqrt(mhz / 2400)) : wall.light
  const through = loss >= 60 ? 0 : 10 ** (-loss / 20)
  const powerLeft = loss >= 60 ? 0 : 10 ** (-loss / 10)
  const lambda = kind === 'radio' ? 90 * (2400 / mhz) : 9
  const stateRef = useLive({ kind, through, lambda, wallColor: wall.color, paused: !clock.playing })
  return (
    <Lab
      title="Radio through walls, light stopped by them"
      clock={clock}
      idea={<>Radio and light are the same kind of wave. The difference is size. A 2.4 GHz wave is about <b>{(wavelengthM(2.4e9) * 100).toFixed(1)} cm</b> long. Visible light is about 500 nanometres, roughly <b>250,000 times shorter</b>. A wall is made of atoms that happen to soak up and block light, but they barely interact with the long radio wave, so most of it carries on. Not all of it: every wall costs some strength. And a sheet of <b>metal</b> reflects radio waves, which is why a metal case kills your signal.</>}
      figure={(
        <Scene3D create={createWave} stateRef={stateRef} view={[90, 100, 270]} target={[0, 14, 0]} floorY={-26} minDistance={120} maxDistance={600} label={`A ${kind === 'radio' ? 'radio' : 'light'} wave meeting a wall of ${wall.label}, and what comes out the other side`} />
      )}
      caption={kind === 'radio' ? `The wave comes in from the left and meets the wall. How tall it is on the right is how much is left. A real ${(wavelengthM(mhz * 1e6) * 100).toFixed(1)} cm wave is drawn at its true size.` : 'Light is drawn about 250,000 times longer than real so you can see it. A solid wall absorbs or reflects all of it.'}
      controls={(
        <>
          <Choices label="Wave" value={kind} onChange={setKind} options={[{ id: 'radio', label: 'Radio' }, { id: 'light', label: 'Visible light' }]} />
          <Choices label="Wall" value={wallId} onChange={setWallId} options={WALLS.map((w) => ({ id: w.id, label: w.label }))} />
          {kind === 'radio' && <Choices label="Radio band" value={band} onChange={setBand} options={BANDS} />}
          <Readout items={[
            { label: 'Wall costs', value: loss >= 60 ? 'blocked' : `${loss.toFixed(1)} dB`, tone: loss >= 60 ? 'bad' : loss > 6 ? 'warn' : 'good' },
            { label: 'Power left', value: `${(powerLeft * 100).toFixed(powerLeft < 0.1 ? 1 : 0)} %` },
          ]} />
        </>
      )}
      notice={[
        <>Choose <b>Light</b> and any solid wall: it stops. Switch to <b>Radio</b> and plasterboard lets half the power through.</>,
        <>Every 3 dB lost is half the power. Brick takes most of it away, concrete nearly all, yet a good receiver can still hear what is left.</>,
        <>Higher bands lose a little more in a wall, and are blocked by water and metal sooner. The wall losses here are typical, not exact.</>,
      ]}
    />
  )
}

// ---------------------------------------------------------------------------------------------------------------
// How far a link reaches
// ---------------------------------------------------------------------------------------------------------------

const RADIOS = [
  { id: 'wifi', label: 'Wi-Fi at its slowest', dbm: -92 },
  { id: 'elrs500', label: 'ExpressLRS fast (500 Hz)', dbm: -105 },
  { id: 'elrs150', label: 'ExpressLRS 150 Hz', dbm: -112 },
  { id: 'elrs50', label: 'ExpressLRS long range (50 Hz)', dbm: -117 },
]

function RangeLab() {
  const clock = useClock()
  const [tx, setTx] = useState(20)
  const [mhz, setMhz] = useState(2400)
  const [radio, setRadio] = useState('elrs150')
  const sens = RADIOS.find((r) => r.id === radio).dbm
  const reach = rangeKm({ txDbm: tx, mhz, sensitivityDbm: sens })
  const x = (km) => scale(-2, 2, 52, 584)(Math.log10(km))
  const y = scale(-130, -20, 260, 16)
  const curve = Array.from({ length: 81 }, (_, i) => { const km = 10 ** (-2 + i * 0.05); return [km, Math.max(-130, receivedDbm({ txDbm: tx, km, mhz }))] })
  const km = 10 ** (-2 + 4 * ((clock.t * 0.1) % 1))
  const here = receivedDbm({ txDbm: tx, km, mhz })
  const ok = here >= sens
  return (
    <Lab
      title="How far a radio link reaches"
      clock={clock}
      idea={<>A radio signal spreads out as it travels, so it gets weaker as the distance grows: every time the distance <b>doubles</b>, you lose <b>6 dB</b>. The link works as long as what arrives is stronger than the radio's <b>sensitivity</b>, the faintest signal it can still decode. Each <b>6 dB</b> of extra sensitivity <b>doubles the range</b>. That is the whole trick behind long range radios: not more power, but ears that hear fainter signals.</>}
      figure={(
        <Plot x={x} y={y} xTicks={[0.01, 0.1, 1, 10, 100]} yTicks={[-120, -100, -80, -60, -40]} xLabel="distance (km, log scale)" yLabel="signal arriving (dBm)" label="Signal strength against distance, and the faintest signal the radio can hear">
          <rect x="52" y={y(sens)} width="532" height={260 - y(sens)} className={styles.shade} />
          <line x1="52" x2="584" y1={y(sens)} y2={y(sens)} className={styles.badLine} strokeDasharray="6 5" strokeWidth="2" />
          <text x="58" y={y(sens) - 6} fontSize="11" className={styles.label}>faintest the radio can hear ({sens} dBm)</text>
          <polyline points={polyline(curve.map(([d, v]) => [x(d), y(v)]))} className={styles.accentLine} />
          <line x1={x(reach)} x2={x(reach)} y1="16" y2="260" className={styles.mutedLine} strokeDasharray="4 4" />
          <text x={x(reach) + (reach > 20 ? -6 : 6)} y="30" textAnchor={reach > 20 ? 'end' : 'start'} fontSize="12" className={styles.labelStrong}>range {reach >= 10 ? reach.toFixed(0) : reach.toFixed(1)} km</text>
          <circle cx={x(km)} cy={y(Math.max(-130, here))} r="7" className={ok ? styles.goodFill : styles.badFill} />
        </Plot>
      )}
      caption="Seen end to end: a straight line with nothing in the way. In a forest, behind buildings or near the ground, the real range is far shorter."
      controls={(
        <>
          <Choices label="Radio" value={radio} onChange={setRadio} options={RADIOS} />
          <Slider label="Transmit power" value={tx} min={10} max={30} step={1} onChange={setTx} format={(v) => `${v} dBm (${Math.round(10 ** (v / 10))} mW)`} />
          <Choices label="Frequency" value={mhz} onChange={setMhz} options={[{ id: 915, label: '915 MHz' }, { id: 2400, label: '2.4 GHz' }]} />
          <Readout items={[
            { label: 'Range (clear line)', value: `${reach >= 10 ? reach.toFixed(0) : reach.toFixed(1)} km`, tone: 'good' },
            { label: 'Loss at 1 km', value: `${pathLossDb(1, mhz).toFixed(0)} dB` },
          ]} />
        </>
      )}
      notice={[
        <>Move from the Wi-Fi radio to the 50 Hz long range setting: 25 dB better hearing, so about 18 times the range with the same power. Ears, not a louder voice.</>,
        <>Add 6 dB of power and the range doubles too. But doubling the power is only 3 dB, so power is the expensive way.</>,
        <>The low frequency (915 MHz) goes further than 2.4 GHz, because the signal spreads less before it arrives. The sensitivity values are typical published figures, rounded.</>,
      ]}
    />
  )
}

// ---------------------------------------------------------------------------------------------------------------
// LoRa: hearing a signal below the noise
// ---------------------------------------------------------------------------------------------------------------

function Spectrum({ values, top, height, max, peak, name }) {
  const px = scale(0, values.length - 1, 52, 584)
  const py = (v) => top + height - Math.min(1, v / max) * height
  const d = values.map((v, i) => `M${px(i).toFixed(1)} ${top + height}V${py(v).toFixed(1)}`).join('')
  return (
    <g>
      <line x1="52" x2="584" y1={top + height} y2={top + height} className={styles.axis} />
      <path d={d} className={styles.mutedLine} strokeWidth="1.5" opacity="0.9" />
      {peak !== undefined && <path d={`M${px(peak).toFixed(1)} ${top + height}V${py(values[peak]).toFixed(1)}`} className={styles.goodLine} strokeWidth="4" />}
      <text x="58" y={top + 12} fontSize="12" className={styles.labelStrong}>{name}</text>
    </g>
  )
}

function ChirpLab() {
  const clock = useClock()
  const [symbol, setSymbol] = useState(37)
  const [snr, setSnr] = useState(-12)
  const seed = 7 + (clock.playing ? Math.floor(clock.t / 0.9) : 0)
  const r = useMemo(() => receiveChirp({ n: 256, symbol, snrDb: snr, seed }), [symbol, snr, seed])
  const s = symbol / 256
  const u = (clock.t * 0.35) % 1
  const f = (s + u) % 1
  const tx = scale(0, 1, 52, 584)
  const ty = scale(0, 1, 104, 12)
  const max = 1.15
  return (
    <Lab
      title="Hearing a signal below the noise: chirps"
      clock={clock}
      idea={<>A LoRa radio sends its data as a <b>chirp</b>: a tone that sweeps up through the whole band, like a bird call. The data is where the chirp <b>starts</b>. The receiver multiplies what it hears by a chirp sweeping the opposite way. The wanted chirp collapses into one steady tone, and a Fourier transform (FFT) puts all its energy into <b>one bin</b>, while the noise stays spread across all of them. With 256 bins that boosts the signal by about <b>24 dB</b>, so it can be picked out even when the noise is louder than the signal.</>}
      figure={(
        <svg viewBox="0 0 600 380" className={styles.svg} role="img" aria-label="The chirp, what the receiver hears in noise, and the single peak found after multiplying by the reverse chirp">
          <text x="58" y="10" fontSize="12" className={styles.labelStrong}>1. The signal sent: a tone that sweeps up, starting at {symbol}</text>
          <line x1="52" x2="52" y1="12" y2="104" className={styles.axis} />
          <line x1="52" x2="584" y1="104" y2="104" className={styles.axis} />
          <polyline points={polyline([[tx(0), ty(s)], [tx(1 - s), ty(1)]])} className={styles.accentLine} />
          <polyline points={polyline([[tx(1 - s), ty(0)], [tx(1), ty(s)]])} className={styles.accentLine} />
          <circle cx={tx(u)} cy={ty(f)} r="6" className={styles.warnFill} />
          <text x="580" y="120" textAnchor="end" fontSize="11" className={styles.label}>time</text>
          <text x="46" y="20" textAnchor="end" fontSize="11" className={styles.label}>pitch</text>
          <Spectrum values={r.before} top={140} height={80} max={max} name={`2. What the receiver hears (signal ${snr > 0 ? '+' : ''}${snr} dB against the noise)`} />
          <Spectrum values={r.after} top={262} height={96} max={max} peak={r.peak} name="3. After multiplying by the reverse chirp and the FFT" />
          <text x="580" y="374" textAnchor="end" fontSize="11" className={styles.label}>bin number, 0 to 255</text>
        </svg>
      )}
      caption="Move the signal strength down below zero. In picture 2 you cannot see the signal. In picture 3 it still stands out."
      controls={(
        <>
          <Slider label="Signal against noise" value={snr} min={-20} max={10} step={1} onChange={setSnr} format={(v) => `${v > 0 ? '+' : ''}${v} dB`} />
          <Slider label="Data sent (where the chirp starts)" value={symbol} min={0} max={255} step={1} onChange={setSymbol} />
          <Readout items={[
            { label: 'Receiver reads', value: `${r.peak}`, tone: r.peak === symbol ? 'good' : 'bad' },
            { label: 'Sent', value: `${symbol}` },
            { label: 'Peak over noise', value: `${r.peakToNoise.toFixed(1)}×` },
          ]} />
        </>
      )}
      notice={[
        <>At 0 dB the signal is as loud as the noise. At −15 dB the noise is 30 times stronger in power, yet the green peak still lands on the right bin.</>,
        <>The noise is re-rolled every second while it plays, so you see it is not luck.</>,
        <>Push to −20 dB and now and then it reads the wrong bin. There is a limit; spreading just moves it a long way down.</>,
      ]}
    />
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Wi-Fi: why it slows when the signal is poor
// ---------------------------------------------------------------------------------------------------------------

const ORDERS = [
  { order: 4, bits: 2, name: 'QPSK' },
  { order: 16, bits: 4, name: '16-QAM' },
  { order: 64, bits: 6, name: '64-QAM' },
  { order: 256, bits: 8, name: '256-QAM' },
]

function ModulationLab() {
  const clock = useClock()
  const [auto, setAuto] = useState(true)
  const [manual, setManual] = useState(20)
  const snr = Math.round(auto ? 17 + 15 * Math.sin(clock.t * 0.35) : manual)
  const results = useMemo(() => ORDERS.map((o) => ({ ...o, ...symbolErrors({ order: o.order, snrDb: snr, count: 1200 }) })), [snr])
  const chosen = useMemo(() => bestOrder(snr, 0.02), [snr])
  const speed = ORDERS.find((o) => o.order === chosen).bits / 2
  return (
    <Lab
      title="Why a weak link slows down"
      clock={clock}
      idea={<>A radio sends data by choosing between a set of signal shapes. Picture them as dots on a grid. More dots means more bits per symbol (faster), but the dots sit closer together, so a little noise can push one to look like its neighbour. When the signal is strong, the router uses a crowded grid and the link is fast. As you move away, noise starts to win, and it <b>falls back to a sparser grid</b>: slower, but every symbol is still read correctly.</>}
      figure={(
        <div className={styles.minis}>
          {results.map((r) => {
            const pts = constellation(r.order)
            const m = scale(-1.5, 1.5, 4, 96)
            return (
              <div key={r.order} className={styles.mini} data-chosen={r.order === chosen}>
                <svg viewBox="0 0 100 100" role="img" aria-label={`${r.name}: ${Math.round(r.rate * 100)} per cent of symbols misread`}>
                  <rect width="100" height="100" className={styles.softFill} />
                  {r.cloud.slice(0, 260).map((p, i) => <circle key={i} cx={m(p.i)} cy={m(-p.q)} r="1.2" className={styles.mutedFill} opacity="0.7" />)}
                  {pts.map((p, i) => <circle key={i} cx={m(p.i)} cy={m(-p.q)} r="1.8" className={r.rate > 0.02 ? styles.badFill : styles.goodFill} />)}
                </svg>
                <b>{r.name}</b>
                <span>{r.bits} bits per symbol</span>
                <span>misread: {r.rate < 0.001 ? 'almost none' : `${Math.round(r.rate * 100)} %`}</span>
              </div>
            )
          })}
        </div>
      )}
      caption="Each box is the receiver's view. Coloured dots are where the symbols should be; the small grey dots are what arrived, smeared by noise."
      controls={(
        <>
          <Slider label="Signal against noise" value={snr} min={0} max={35} step={1} onChange={(v) => { setAuto(false); setManual(v) }} format={(v) => `${v} dB`} />
          <button type="button" className={styles.play} onClick={() => setAuto((a) => !a)}>{auto ? 'Stop the automatic walk away and back' : 'Walk away and back automatically'}</button>
          <Readout items={[
            { label: 'Radio picks', value: ORDERS.find((o) => o.order === chosen).name, tone: 'good' },
            { label: 'Speed', value: `${speed}×`, tone: speed >= 3 ? 'good' : speed >= 2 ? 'warn' : 'bad' },
          ]} />
        </>
      )}
      notice={[
        <>The green box is the grid the radio chooses: the densest one that still reads nearly every symbol.</>,
        <>When the noise rises, the dots in the crowded boxes smear into each other and turn red. The radio steps down a box.</>,
        <>Real Wi-Fi also adds error-correcting codes and has many more steps. The idea is the same: slow and right beats fast and wrong.</>,
      ]}
    />
  )
}

// ---------------------------------------------------------------------------------------------------------------
// Current flows in circles
// ---------------------------------------------------------------------------------------------------------------

function ReturnLab() {
  const clock = useClock()
  const [cut, setCut] = useState(false)
  const stateRef = useLive({ cut, paused: !clock.playing })
  return (
    <Lab
      title="Return current: it always has to come back"
      clock={clock}
      idea={<>Current cannot just go somewhere and stay there. It has to <b>come back</b>. On a circuit board a fast signal runs along a copper trace, and its return current flows in the ground layer right <b>underneath</b> the trace, taking the shortest path back. That keeps the loop tiny, so little energy escapes as noise. Cut the ground under the trace and the current must detour round the cut, the loop gets large, and the board becomes an antenna.</>}
      figure={(
        <Scene3D create={createBoard} stateRef={stateRef} view={[45, 88, 170]} target={[0, 0, 6]} floorY={-14} minDistance={90} maxDistance={420} label="A circuit board with a signal trace on top and the return current flowing in the ground layer beneath, or detouring round a cut in it" />
      )}
      caption="Blue is the signal going out along the trace. Orange is the same current coming back in the ground layer under the board. Press the button to cut the ground under the trace."
      controls={(
        <>
          <button type="button" className={styles.play} onClick={() => setCut((c) => !c)}>{cut ? 'Mend the ground' : 'Cut the ground under the trace'}</button>
          <Readout items={[
            { label: 'Loop size', value: cut ? 'large' : 'tiny', tone: cut ? 'bad' : 'good' },
            { label: 'Noise escaping', value: cut ? 'much more' : 'little', tone: cut ? 'bad' : 'good' },
          ]} />
        </>
      )}
      notice={[
        <>At low speed, current takes the easiest route in terms of resistance. At radio speeds it takes the route that keeps the loop smallest.</>,
        <>That is why you never route a fast trace across a gap in the ground, and why antennas are connected with great care.</>,
      ]}
    />
  )
}

export default function Radio() {
  return (
    <Chapter
      id="radio"
      kicker="Chapter 4 · Radio"
      title="How a drone talks, and how far"
      lead="Your sticks and your video are both radio. A few ideas explain nearly everything about it: wave size, how signal fades with distance, how noise is beaten, and why circuits are drawn the way they are."
    >
      <WaveLab />
      <RangeLab />
      <ChirpLab />
      <ModulationLab />
      <ReturnLab />
      <div className={styles.cards}>
        <article className={styles.card} style={{ '--c': 'var(--color-accent-primary)' }}>
          <h4>Why everything in RF is 50 ohms</h4>
          <p>It is a compromise from the early days of coaxial cable. An air-filled cable carries the most power at about 30 ohms and loses the least signal at about 77 ohms. The middle of those, near 50, gives a cable that is good at both. The standard stuck, so antennas, cables, filters and chips are all designed for 50 ohms, and they only pass power cleanly when they match.</p>
          <small>Standard history, simplified.</small>
        </article>
        <article className={styles.card} style={{ '--c': 'var(--color-warning)' }}>
          <h4>An RF design rule worth measuring</h4>
          <p>A common rule says never put a via, a hole that takes the signal from one layer to the next, in an RF trace, because it adds a small bump the signal can reflect from. The lesson is not "ignore the rule" and not "the rule is always right". At some frequencies and trace lengths the bump is too small to matter, and the only way to know is to measure.</p>
          <small>Rules of thumb are shortcuts for measurements you have not made yet.</small>
        </article>
      </div>
    </Chapter>
  )
}
