import { useState } from 'react'
import { Chapter, Choices, Lab, Plot, Readout, Slider, polyline, scale, useClock, useLive } from '../../DroneHardware/parts.jsx'
import Scene3D from '../../DroneHardware/widgets/Scene3D.jsx'
import dh from '../../DroneHardware/DroneHardware.module.css'
import Formula, { Idea } from '../Formula.jsx'
import FlowLegend from '../FlowLegend.jsx'
import { createAirflow, createForces } from '../scenes.js'
import styles from '../Physics.module.css'
import {
  G, discArea, hoverThrottle, idealHoverPower, inducedVelocity, propellerPower, propellerThrust, tipMach, tipSpeed, weight,
} from '../physics.js'

function ForcesLab() {
  const clock = useClock()
  const [massG, setMassG] = useState(700)
  const [twr, setTwr] = useState(6)
  const [throttle, setThrottle] = useState(41)
  const W = weight(massG / 1000)
  // thrust grows with the square of motor speed, and motor speed follows the throttle
  const thrust = twr * W * (throttle / 100) ** 2
  const net = thrust - W
  const accel = net / (massG / 1000)
  const hover = hoverThrottle(twr) * 100
  const state = useLive({ tiltDeg: 0, thrustN: thrust, weightN: W, dragN: 0, wind: 0, rate: 20 + 70 * (throttle / 100), paused: !clock.playing })
  const verdict = Math.abs(net) < 0.03 * W ? 'Hovering' : net > 0 ? 'Climbing' : 'Falling'
  return (
    <Lab
      title="Four forces, one drone"
      clock={clock}
      idea={<>A hovering drone is in a tug of war. <b>Weight</b> pulls it down with the force W = m × g. The four propellers push it up with <b>thrust</b>. When thrust equals weight the drone hovers. A little more thrust and it climbs; a little less and it falls. The size of the push needed is set by the drone's weight, which is why a heavier battery asks for more throttle just to stay in the air.</>}
      figure={<Scene3D create={createForces} stateRef={state} view={[250, 150, 400]} target={[0, 40, 0]} floorY={-70} minDistance={200} maxDistance={700} label="A drone with arrows showing thrust going up and weight going down" />}
      caption="Green is thrust, red is weight. The arrows are drawn to scale, so you can see the tug of war."
      controls={(
        <>
          <Slider label="Drone mass" value={massG} min={300} max={1500} step={50} onChange={setMassG} format={(v) => `${v} g`} />
          <Slider label="Motor power: full-throttle thrust ÷ weight" value={twr} min={2} max={12} step={0.5} onChange={setTwr} format={(v) => `${v.toFixed(1)} : 1`} />
          <Slider label="Throttle" value={throttle} min={0} max={100} step={1} onChange={setThrottle} format={(v) => `${v} %`} />
          <Readout items={[
            { label: 'Weight', value: `${W.toFixed(1)} N` },
            { label: 'Thrust', value: `${thrust.toFixed(1)} N` },
            { label: verdict, value: `${accel >= 0 ? '+' : ''}${accel.toFixed(1)} m/s²`, tone: verdict === 'Hovering' ? 'good' : 'warn' },
            { label: 'Throttle to hover', value: `${hover.toFixed(0)} %`, tone: 'good' },
          ]} />
        </>
      )}
      notice={[
        <>Move the throttle to about <b>{hover.toFixed(0)} %</b> and the arrows match: that is hover.</>,
        <>Raise the motor power ratio (a lighter frame or stronger motors) and the hover throttle falls, so the stick feels more sensitive near the middle.</>,
        <>Net force ÷ mass is the acceleration, from Newton's second law: F = m a.</>,
      ]}
    />
  )
}

const PROP_INCH = 25.4

function PropellerLab() {
  const clock = useClock()
  const [view, setView] = useState('speed')
  const [inches, setInches] = useState(5)
  const [rpm, setRpm] = useState(28000)
  const rho = 1.225
  const D = (inches * PROP_INCH) / 1000
  const rps = rpm / 60
  const thrust = propellerThrust({ rho, rps, diameterM: D })
  const area = discArea(D)
  const vi = inducedVelocity(thrust, rho, area)
  const shaft = propellerPower({ rho, rps, diameterM: D })
  const state = useLive({ diameterMm: D * 1000, vi, thrustN: thrust, spin: rps * 0.12, mode: view, paused: !clock.playing })
  const jump = thrust / area // the pressure step across the disc, in pascals
  const pushDown = rho * area * vi // kilograms of air thrown down every second
  // the least power to hover a 1 kg drone on four propellers of each size
  const x = scale(3, 10, 52, 584)
  const y = scale(0, 220, 150, 12)
  const curve = Array.from({ length: 36 }, (_, i) => { const d = 3 + i * 0.2; return [d, idealHoverPower(weight(1), rho, discArea(d * PROP_INCH / 1000, 4))] })
  const here = idealHoverPower(weight(1), rho, discArea(D, 4))
  return (
    <Lab
      title="How a propeller makes thrust"
      clock={clock}
      idea={<>A propeller is a spinning wing. Each blade bites into the air and throws it downward. By Newton's third law, throwing air down pushes the drone up. This picture shows the air the way an engineer's flow simulation (CFD) does. The coloured lines are <b>streamlines</b>: the path a bit of air follows, coloured by its speed. The coloured sheet behind them is a slice through the air. The air is drawn in slowly from above, where the pressure is <b>lower</b> than in the room. It speeds up through the disc, and leaves as a <b>narrower, faster stream</b> where the pressure just below the propeller is <b>higher</b>. That pressure difference across the disc, spread over its area, is the thrust.</>}
      figure={(
        <div className={dh.stackTight}>
          <Scene3D create={createAirflow} stateRef={state} view={[330, 40, 330]} target={[0, -60, 0]} floorY={-395} minDistance={200} maxDistance={700} label="A propeller pulling air down through its disc, drawn as streamlines coloured by air speed" />
          <FlowLegend mode={view} speedMax={2.1 * vi} pressureMax={1.5 * rho * vi * vi} />
          <Plot width={600} height={170} top={12} bottom={38} x={x} y={y} xTicks={[3, 5, 7, 10]} yTicks={[0, 100, 200]} xLabel="propeller size (inches)" yLabel="W" label="The least power to hover a 1 kilogram drone, for each propeller size">
            <polyline points={polyline(curve.map(([d, p]) => [x(d), y(p)]))} className={dh.accentLine} />
            <circle cx={x(inches)} cy={y(here)} r="7" className={dh.goodFill} />
            <text x="60" y="30" fontSize="11" className={dh.label}>power to hover a 1 kg drone on 4 propellers</text>
          </Plot>
        </div>
      )}
      caption="Blue is slow air, red is the fastest. Switch to pressure to see suction (blue) above the propeller and a push (red) just below it. The chart shows why long-range builds use big, slow propellers: a bigger disc moves more air more gently, which wastes less power."
      controls={(
        <>
          <Choices label="Colour the air by" options={[{ id: 'speed', label: 'Air speed' }, { id: 'pressure', label: 'Pressure' }]} value={view} onChange={setView} />
          <Slider label="Propeller diameter" value={inches} min={3} max={10} step={0.5} onChange={setInches} format={(v) => `${v.toFixed(1)} inch`} />
          <Slider label="Motor speed" value={rpm} min={8000} max={40000} step={500} onChange={setRpm} format={(v) => `${v.toLocaleString('en-IN')} rpm`} />
          <Readout items={[
            { label: 'Thrust (one propeller)', value: `${thrust.toFixed(1)} N`, tone: 'good' },
            { label: 'Same as lifting', value: `${Math.round((thrust / G) * 1000)} g` },
            { label: 'Air speed through disc', value: `${vi.toFixed(1)} m/s` },
            { label: 'Fast stream below', value: `${(2 * vi).toFixed(1)} m/s (${Math.round(2 * vi * 3.6)} km/h)` },
            { label: 'Pressure step across the disc', value: `${jump.toFixed(0)} Pa`, tone: 'good' },
            { label: 'Air thrown down each second', value: `${pushDown.toFixed(2)} kg` },
            { label: 'Shaft power', value: `${shaft.toFixed(0)} W` },
            { label: 'Tip speed', value: `${tipSpeed(rps, D).toFixed(0)} m/s`, tone: tipMach(rps, D) > 0.7 ? 'bad' : 'good' },
          ]} />
        </>
      )}
      notice={[
        <>Switch to <b>Pressure</b>: the pressure step across the disc is the thrust divided by the disc area. A bigger disc needs a smaller step for the same thrust.</>,
        <>Double the motor speed and thrust becomes <b>four times</b> bigger, but the power needed becomes <b>eight times</b> bigger. Speed is expensive.</>,
        <>Double the diameter and thrust grows sixteen times (D⁴), which is why a bigger propeller can turn slower and still lift more.</>,
        <>The tip speed turns red above about 0.7 of the speed of sound (about 240 m/s): blade tips get noisy and lose efficiency.</>,
      ]}
    />
  )
}

export default function Forces() {
  return (
    <Chapter
      id="forces"
      kicker="Chapter 1 · Forces and thrust"
      title="What holds a drone in the air"
      lead="Every drone motion comes from four forces: weight, thrust, drag and lift. Start with the simplest one, hovering, then see where thrust really comes from."
    >
      <ForcesLab />
      <div className={styles.ideas}>
        <Formula
          name="Weight and the force law"
          expr={<>W = m × g &nbsp;&nbsp; F = m × a</>}
          symbols={[['W', 'weight, in newtons (N)'], ['m', 'mass, in kilograms (kg)'], ['g', 'gravity, 9.81 m/s²'], ['a', 'acceleration, m/s²']]}
          note="A 700 g drone weighs 0.7 × 9.81 = 6.9 N. To hover, the four propellers must push up with a total of 6.9 N."
        />
        <Formula
          name="Thrust to weight and hover throttle"
          expr={<>TWR = T<sub>max</sub> ÷ W &nbsp;&nbsp; throttle<sub>hover</sub> ≈ √(1 ÷ TWR)</>}
          symbols={[['TWR', 'thrust-to-weight ratio'], ['T', 'total thrust, newtons']]}
          note="Thrust grows with the square of motor speed, so a drone with a TWR of 4 hovers at about half throttle (√¼ = 0.5)."
        />
      </div>
      <PropellerLab />
      <div className={styles.ideas}>
        <Formula
          name="Momentum theory (the ideal rotor)"
          expr={<>v<sub>i</sub> = √( T ÷ 2ρA ) &nbsp;&nbsp; P<sub>ideal</sub> = T × v<sub>i</sub></>}
          symbols={[['v_i', 'speed of air through the disc, m/s'], ['ρ', 'air density, 1.225 kg/m³ at sea level'], ['A', 'disc area = π (D/2)², m²'], ['P', 'power, watts']]}
          note="This is the least power any rotor needs. Real propellers and motors need more, because of friction, spin in the wake and motor heat."
        />
        <Formula
          name="Propeller laws"
          expr={<>T = C<sub>T</sub> ρ n² D⁴ &nbsp;&nbsp; P = C<sub>P</sub> ρ n³ D⁵</>}
          symbols={[['n', 'turns per second (rpm ÷ 60)'], ['D', 'propeller diameter, m'], ['C_T', 'thrust coefficient, about 0.1 for a 5 inch propeller'], ['C_P', 'power coefficient, about 0.045']]}
          note="These are the formulas behind every thrust chart. They also say why thin air (small ρ) gives less thrust."
        />
      </div>
      <div className={styles.ideas}>
        <Idea title="Why a bigger, slower propeller is more efficient">
          <p>Thrust is the air's change of momentum: mass of air per second × the speed you give it. You can get the same thrust by throwing a little air very fast or a lot of air gently. The energy spent goes with the <b>square of the speed</b> you give the air, so the gentle way wastes far less. That is why a long-range drone uses big propellers and why a tiny whoop drains its battery fast.</p>
        </Idea>
        <Idea title="What the motor has to fight">
          <p>The propeller pushes air down, and the air pushes the propeller back with a twisting force, <b>torque</b>. The motor must overcome it and it is also what turns the whole drone the other way. The next chapters use this to explain how a drone yaws.</p>
        </Idea>
      </div>
    </Chapter>
  )
}
