import { useMemo, useState } from 'react'
import { amplification, armFrequency, filterDelayMs, rpmToHz, transmissibility } from '../hardware.js'
import { Chapter, Lab, Plot, Readout, Slider, polyline, scale, useClock } from '../parts.jsx'
import styles from '../DroneHardware.module.css'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function ResonanceLab() {
  const clock = useClock()
  const [auto, setAuto] = useState(true)
  const [manual, setManual] = useState(250)
  const [arm, setArm] = useState(3)
  const hz = auto ? 50 + 450 * (0.5 - 0.5 * Math.cos(clock.t * 0.35)) : manual
  const fn = armFrequency(arm)
  const zeta = 0.04
  const gain = amplification(hz / fn, zeta)
  const swing = clamp(gain * 2.2, 2, 62)
  const shake = Math.sin(clock.t * 2 * Math.PI * 2.2) * swing // slowed right down so the eye can follow it
  const x = scale(50, 600, 52, 584)
  const y = scale(0, 14, 260, 16)
  const curve = useMemo(() => Array.from({ length: 111 }, (_, i) => { const f = 50 + i * 5; return [f, Math.min(14, amplification(f / fn, zeta))] }), [fn])
  const danger = gain > 3
  return (
    <Lab
      title="A drone is a vibration machine"
      clock={clock}
      idea={<>Every motor spins <b>50 to 600 times a second</b> and none is perfectly balanced, so each one gives the frame a tiny push every turn. Every arm also has a favourite shaking speed, its <b>natural frequency</b>. If the push comes at that speed, each push adds to the last, like pushing a swing at the right moment. That is <b>resonance</b>, and the shaking can be ten times bigger than the push.</>}
      figure={(
        <div>
          <svg viewBox="0 0 600 130" className={styles.svg} role="img" aria-label="A frame arm with a motor on the end, shaking more when the motor speed matches the arm">
            <rect x="30" y="35" width="22" height="70" className={styles.softFill} />
            <polygon points={polyline([[52, 66 + shake * 0.0], [380, 66 + shake * 0.9], [380, 66 + shake * 0.9 + arm * 4], [52, 66 + arm * 4]])} className={styles.mutedFill} opacity="0.85" />
            <g transform={`translate(380 ${70 + shake * 0.9 + arm * 2})`}>
              <rect x="-22" y="-22" width="44" height="44" rx="6" className={danger ? styles.badFill : styles.accentFill} />
              <text y="5" textAnchor="middle" fontSize="12" className={styles.labelStrong} style={{ fill: 'var(--color-on-accent)' }}>motor</text>
            </g>
            <text x="440" y="70" fontSize="12" className={styles.label}>shown in slow motion</text>
          </svg>
          <Plot x={x} y={y} xTicks={[100, 200, 300, 400, 500, 600]} yTicks={[0, 4, 8, 12]} xLabel="motor speed (turns per second = Hz)" yLabel="shaking ×" label="How much an arm shakes at each motor speed">
            <polygon points={polyline([[x(50), y(0)], ...curve.map(([f, a]) => [x(f), y(a)]), [x(600), y(0)]])} className={styles.shade} />
            <polyline points={polyline(curve.map(([f, a]) => [x(f), y(a)]))} className={styles.accentLine} />
            <line x1={x(fn)} x2={x(fn)} y1="16" y2="260" className={styles.mutedLine} strokeDasharray="4 4" />
            <text x={x(fn) + 6} y="30" fontSize="11" className={styles.label}>arm's own speed</text>
            <circle cx={x(hz)} cy={y(Math.min(14, gain))} r="7" className={danger ? styles.badFill : styles.goodFill} />
          </Plot>
        </div>
      )}
      caption="Top: the arm, slowed so you can see it. Bottom: how much it shakes at each motor speed. The dot is where the motor is now."
      controls={(
        <>
          <Slider label="Motor speed" value={Math.round(hz)} min={50} max={600} step={5} onChange={(v) => { setAuto(false); setManual(v) }} format={(v) => `${v} Hz (${Math.round(v * 60).toLocaleString()} rpm)`} />
          <Slider label="Arm thickness" value={arm} min={2} max={6} step={0.5} onChange={setArm} format={(v) => `${v.toFixed(1)} mm`} />
          <button type="button" className={styles.play} onClick={() => setAuto((a) => !a)}>{auto ? 'Stop the automatic sweep' : 'Sweep the motor speed'}</button>
          <Readout items={[
            { label: 'Motor', value: `${Math.round(hz)} Hz` },
            { label: 'Arm likes', value: `${Math.round(fn)} Hz` },
            { label: 'Shaking', value: `${gain.toFixed(1)}×`, tone: danger ? 'bad' : 'good' },
          ]} />
        </>
      )}
      notice={[
        <>Let it sweep. The arm calms down, then goes wild as the motor passes its favourite speed, then calms again.</>,
        <>Make the arm thicker and the favourite speed moves up, away from where the motors mostly run. That is one reason a stiffer frame is quieter.</>,
        <>The arm size and numbers here are an example for a 5 inch frame, not a measurement of any one product.</>,
      ]}
    />
  )
}

function MountLab() {
  const [mount, setMount] = useState(90)
  const [damping, setDamping] = useState(0.15)
  const x = scale(0, 600, 52, 584)
  const y = scale(0, 4, 260, 16)
  const curve = useMemo(() => Array.from({ length: 121 }, (_, i) => { const f = i * 5; return [f, Math.min(4, transmissibility(f / mount, damping))] }), [mount, damping])
  const cross = mount * Math.SQRT2
  const lowest = rpmToHz(3000) // a slow idle
  return (
    <Lab
      title="What rubber grommets are really for"
      idea={<>Soft rubber mounts do <b>not</b> stop vibration. A soft mount is a spring with its own natural frequency. Shake it <b>slowly</b> and the part follows, and near its own speed it shakes <b>more</b>. Only when the shaking is faster than about <b>1.4 times</b> its natural frequency does the mount start to hold the part still. So a mount only helps if it is much softer than the vibration is fast, and it never helps with slow shaking.</>}
      figure={(
        <Plot x={x} y={y} xTicks={[100, 200, 300, 400, 500, 600]} yTicks={[0, 1, 2, 3, 4]} xLabel="shaking frequency (Hz)" yLabel="how much passes through" label="How much shaking a soft mount lets through at each frequency">
          <rect x={x(0)} y={y(4)} width={x(cross) - x(0)} height={y(0) - y(4)} className={styles.shade} />
          <rect x={x(cross)} y={y(4)} width={x(600) - x(cross)} height={y(0) - y(4)} className={styles.shadeGood} />
          <line x1="52" x2="584" y1={y(1)} y2={y(1)} className={styles.mutedLine} strokeDasharray="5 5" />
          <text x="590" y={y(1) - 4} textAnchor="end" fontSize="11" className={styles.label}>1 = no help</text>
          <polyline points={polyline(curve.map(([f, t]) => [x(f), y(t)]))} className={styles.accentLine} />
          <text x={x(cross / 2)} y="34" textAnchor="middle" fontSize="12" className={styles.label}>makes it worse</text>
          <text x={(x(cross) + x(600)) / 2} y="34" textAnchor="middle" fontSize="12" className={styles.label}>helps</text>
        </Plot>
      )}
      caption="Above the line at 1, the mount passes along more shaking than went in. Below it, the mount is working."
      controls={(
        <>
          <Slider label="Mount natural frequency" value={mount} min={30} max={200} step={5} onChange={setMount} format={(v) => `${v} Hz`} />
          <Slider label="Rubber damping" value={damping} min={0.05} max={0.5} step={0.05} onChange={setDamping} format={(v) => v.toFixed(2)} />
          <Readout items={[
            { label: 'Starts to help above', value: `${Math.round(cross)} Hz`, tone: 'good' },
            { label: 'Slow shaking (idle)', value: `${transmissibility(lowest / mount, damping).toFixed(1)}×`, tone: transmissibility(lowest / mount, damping) > 1 ? 'bad' : 'good' },
          ]} />
        </>
      )}
      notice={[
        <>Make the mount softer (a lower number) and the green "helps" region grows. But a softer mount lets the part move more.</>,
        <>More damping tames the peak, but lets more shaking through at high speed. Rubber is a compromise.</>,
        <>This is the textbook curve for a mass on a spring and damper. It is the physics, not a test of a particular grommet.</>,
      ]}
    />
  )
}

function FilterLab() {
  const clock = useClock()
  const [noise, setNoise] = useState(0.6)
  const noiseHz = 300
  const target = 0.08
  const cutoff = noise <= target ? 600 : clamp(noiseHz / Math.sqrt((noise / target) ** 2 - 1), 20, 600)
  const delay = filterDelayMs(cutoff)
  const left = noise / Math.sqrt(1 + (noiseHz / cutoff) ** 2)
  // a stick that moves back and forth, with the motor noise on top of what the gyro sees, and the same signal after the filter
  const dt = 0.0001 // 0.1 ms steps; the picture shows 80 ms
  const steps = 800
  const warm = 200
  const T = 0.2 + clock.t * 0.012 // so 1 second on screen is 12 ms of flying
  const stick = (time) => (Math.floor(time / 0.04) % 2 === 0 ? 1 : -1)
  const smooth = (2 * Math.PI * cutoff * dt) / (2 * Math.PI * cutoff * dt + 1)
  const raw = []
  const filtered = []
  const t0 = T - (steps + warm) * dt
  let state = stick(t0)
  for (let i = 0; i < steps + warm; i += 1) {
    const time = t0 + i * dt
    const value = stick(time) + noise * 0.5 * Math.sin(2 * Math.PI * noiseHz * time)
    state += smooth * (value - state)
    if (i >= warm && i % 2 === 0) { raw.push(value); filtered.push(state) }
  }
  const px = scale(0, raw.length - 1, 52, 584)
  const py = scale(-1.6, 1.6, 240, 20)
  return (
    <Lab
      title="Why Betaflight still wants a stiff frame"
      clock={clock}
      idea={<>The flight controller reads a gyro, and motor shaking rides on top of the real movement as noise. A <b>filter</b> smooths it out, but every filter makes the answer arrive <b>late</b>. The more noise there is, the harder you must filter, and the later the flight controller hears the truth. A stiff frame makes less noise at the source, so you can filter lightly, with less delay.</>}
      figure={(
        <svg viewBox="0 0 600 270" className={styles.svg} role="img" aria-label="The gyro signal with motor noise, and the filtered signal that arrives late">
          <line x1="52" x2="584" y1={py(0)} y2={py(0)} className={styles.grid} />
          <polyline points={polyline(raw.map((v, i) => [px(i), py(v)]))} className={styles.mutedLine} opacity="0.7" />
          <polyline points={polyline(filtered.map((v, i) => [px(i), py(v)]))} className={styles.accentLine} />
          <text x="60" y="258" fontSize="12" className={styles.label}>grey: what the gyro sees   blue: after the filter</text>
        </svg>
      )}
      caption="Slowed down a great deal. The blue line follows the grey one a moment later."
      controls={(
        <>
          <Slider label="Noise from the frame" value={noise} min={0.05} max={1} step={0.05} onChange={setNoise} format={(v) => (v < 0.3 ? `${v.toFixed(2)} (stiff frame)` : v > 0.7 ? `${v.toFixed(2)} (loose frame)` : v.toFixed(2))} />
          <Readout items={[
            { label: 'Filter needed', value: `${Math.round(cutoff)} Hz` },
            { label: 'Delay added', value: `${delay.toFixed(2)} ms`, tone: delay > 1.2 ? 'bad' : 'good' },
            { label: 'Noise left', value: `${Math.round((left / noise) * 100)} %` },
          ]} />
        </>
      )}
      notice={[
        <>Slide the noise down. The filter can open up, and the blue line hugs the grey one.</>,
        <>An RPM filter cuts the noise at the motors' own speed, but it also adds delay. Fixing the shaking at the source is better than filtering it later.</>,
        <>The filter here is a simple one-step low-pass. Real Betaflight stacks several, but the trade is the same: quieter or quicker, not both.</>,
      ]}
    />
  )
}

export default function Vibration() {
  return (
    <Chapter
      id="vibration"
      kicker="Chapter 2 · Vibration"
      title="Shaking: where it comes from and why it matters"
      lead="A drone's gyro feels everything. Motors shake the frame, the frame shakes the gyro, and the flight controller has to tell shaking from flying. Understand where the shaking comes from and the rest of the tuning makes sense."
    >
      <ResonanceLab />
      <MountLab />
      <FilterLab />
    </Chapter>
  )
}
