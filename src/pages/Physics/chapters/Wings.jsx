import { useMemo, useState } from 'react'
import { Chapter, Choices, Lab, Plot, Readout, Slider, polyline, scale, useClock, useLive } from '../../DroneHardware/parts.jsx'
import Scene3D from '../../DroneHardware/widgets/Scene3D.jsx'
import dh from '../../DroneHardware/DroneHardware.module.css'
import Formula, { Idea } from '../Formula.jsx'
import FlowLegend from '../FlowLegend.jsx'
import { createAerofoil, createForces } from '../scenes.js'
import styles from '../Physics.module.css'
import { dragCoefficient, dragForce, discArea, inducedVelocity, isStalled, levelTurn, liftCoefficient, liftForce, pitchThrustSplit, reynolds, speedForTilt, thrustForTilt, weight } from '../physics.js'

function AerofoilLab() {
  const clock = useClock()
  const [view, setView] = useState('speed')
  const [alpha, setAlpha] = useState(6)
  const [speed, setSpeed] = useState(15)
  const rho = 1.225
  const chord = 0.12
  const area = 0.06 // a wing 0.5 m wide and 0.12 m deep
  const cl = liftCoefficient(alpha)
  const cd = dragCoefficient(alpha)
  const stalled = isStalled(alpha)
  const L = liftForce({ rho, speed, area, cl })
  const D = dragForce({ rho, speed, cdA: cd * area })
  const state = useLive({ alphaDeg: alpha, cl, cd, stalled, speed, mode: view, paused: !clock.playing })
  const q = 0.5 * rho * speed * speed // the dynamic pressure of the air, in pascals
  const x = scale(-5, 24, 52, 584)
  const y = scale(-0.8, 1.8, 150, 12)
  const curve = useMemo(() => Array.from({ length: 59 }, (_, i) => { const a = -5 + i * 0.5; return [a, liftCoefficient(a)] }), [])
  return (
    <Lab
      title="Wings and blades: lift, drag and the stall"
      clock={clock}
      idea={<>A propeller blade is a small wing. A wing makes lift by turning the air that meets it: the air is bent downward, and the wing is pushed up in reply. The angle between the wing and the oncoming air is the <b>angle of attack</b>. More angle makes more lift, up to about 14°. Past that the air can no longer follow the top surface, it breaks away into a messy wake, lift collapses and drag jumps. That is a <b>stall</b>. The picture is a flow simulation of the air round a real, finite wing, in three dimensions: the coloured lines are streamlines, and the sheet behind them is painted with the air speed or the pressure. Air speeds up over the top, so the pressure there falls; underneath, the pressure rises. The wing is pushed up by that difference.</>}
      figure={(
        <div className={dh.stackTight}>
          <Scene3D create={createAerofoil} stateRef={state} view={[300, 170, 440]} target={[60, 0, 0]} floorY={-190} minDistance={250} maxDistance={900} label="A wing section in moving air, drawn as streamlines coloured by speed with the pressure or speed painted behind" />
          <FlowLegend mode={view} speedMax={speed * 1.7} pressureMax={q * 1.4} />
          <Plot width={600} height={170} top={12} bottom={38} x={x} y={y} xTicks={[0, 5, 10, 14, 20]} yTicks={[0, 0.8, 1.6]} xLabel="angle of attack (degrees)" yLabel="C_L" label="Lift coefficient against angle of attack">
            <polyline points={polyline(curve.map(([a, c]) => [x(a), y(c)]))} className={dh.accentLine} />
            <line x1={x(14)} x2={x(14)} y1="12" y2="132" className={dh.mutedLine} strokeDasharray="4 4" />
            <text x={x(14) + 6} y="26" fontSize="11" className={dh.label}>stall</text>
            <circle cx={x(alpha)} cy={y(cl)} r="7" className={stalled ? dh.badFill : dh.goodFill} />
          </Plot>
        </div>
      )}
      caption="Streamlines show where the air goes, blue when slow and red when fast. Switch to pressure to see suction (blue) over the top and a push (red) at the front and underneath. Above 14° the air tumbles off the top: that is the stall."
      controls={(
        <>
          <Choices label="Colour the air by" options={[{ id: 'speed', label: 'Air speed' }, { id: 'pressure', label: 'Pressure' }]} value={view} onChange={setView} />
          <Slider label="Angle of attack" value={alpha} min={-5} max={22} step={0.5} onChange={setAlpha} format={(v) => `${v.toFixed(1)}°`} />
          <Slider label="Air speed over the wing" value={speed} min={5} max={40} step={1} onChange={setSpeed} format={(v) => `${v} m/s`} />
          <Readout items={[
            { label: 'Lift coefficient', value: cl.toFixed(2), tone: stalled ? 'bad' : 'good' },
            { label: 'Lift', value: `${L.toFixed(1)} N` },
            { label: 'Drag', value: `${D.toFixed(2)} N`, tone: stalled ? 'bad' : undefined },
            { label: 'Average pressure difference', value: `${(L / area).toFixed(0)} Pa` },
            { label: 'Dynamic pressure ½ρV²', value: `${q.toFixed(0)} Pa` },
            { label: 'Lift ÷ drag', value: (L / Math.max(D, 0.001)).toFixed(0), tone: stalled ? 'bad' : 'good' },
            { label: 'Reynolds number', value: Math.round(reynolds(rho, speed, chord)).toLocaleString('en-IN') },
          ]} />
        </>
      )}
      notice={[
        <>Slide the angle slowly past 14°: the air stops following the top, the curve falls and the drag arrow grows.</>,
        <>Drag the picture to look at the wing from behind and from the side. Near each tip the air spills from the high pressure underneath round to the low pressure on top, and rolls up into a spinning tube of air: a <b>wingtip vortex</b>. Between the two tubes the air is pushed down. This is the downwash that holds the wing up, and the same thing happens at the tip of every propeller blade.</>,
        <>Double the air speed and the lift becomes <b>four times</b> bigger, because lift grows with V². That is why a propeller tip makes far more lift than its root.</>,
        <>The wing here is 0.5 m wide and 0.12 m deep, like a small fixed-wing drone's wing. A 5 inch propeller blade works the same way at a smaller size.</>,
      ]}
    />
  )
}

const SHAPES = [
  { id: 'race', label: 'Race quad', cdA: 0.012 },
  { id: 'free', label: 'Freestyle 5 inch', cdA: 0.016 },
  { id: 'whoop', label: 'Cinewhoop (ducts)', cdA: 0.03 },
]

function ForwardLab() {
  const clock = useClock()
  const [shape, setShape] = useState('free')
  const [tilt, setTilt] = useState(30)
  const [massG, setMassG] = useState(700)
  const rho = 1.225
  const cdA = SHAPES.find((s) => s.id === shape).cdA
  const m = massG / 1000
  const speed = speedForTilt({ massKg: m, tiltDeg: tilt, rho, cdA })
  const thrust = thrustForTilt(m, tilt)
  const drag = dragForce({ rho, speed, cdA })
  const split = pitchThrustSplit(tilt)
  const area = discArea(0.127)
  const each = thrust / 4
  const viFront = inducedVelocity(each * split.front, rho, area)
  const viRear = inducedVelocity(each * split.rear, rho, area)
  const rpm = (t) => 60 * Math.sqrt(t / (0.1 * rho * 0.127 ** 4)) // from thrust = 0.1 ρ n² D⁴
  const state = useLive({ tiltDeg: tilt, thrustN: thrust, weightN: weight(m), dragN: drag, airspeed: speed, thrustSplit: split, rate: 50 + 30 * (thrust / weight(m) - 1), paused: !clock.playing })
  return (
    <Lab
      title="Flying forward: tilt, drag and top speed"
      clock={clock}
      idea={<>A quadcopter cannot push sideways, so to move forward it <b>tilts its nose down</b>. The thrust now points a little forward. One part of it still holds the drone up; the other part pushes it forward. The drone speeds up until the air pushes back as hard as the forward part of the thrust. That balance, <b>drag equals the sideways thrust</b>, is its top speed for that tilt. To pitch the nose down, the flight controller spins the <b>rear propellers faster</b> than the front ones, so the rear streams of air are faster and stronger. All four streams lean back as the drone moves, because the air is rushing past.</>}
      figure={(
        <div className={dh.stackTight}>
          <Scene3D create={createForces} stateRef={state} view={[160, 90, 700]} target={[0, -70, 0]} floorY={-300} minDistance={250} maxDistance={1000} label="A drone tilted forward, with thrust, weight and drag arrows and the air from each of the four propellers drawn as streamlines" />
          <FlowLegend mode="speed" speedMax={2.1 * viRear + speed} />
        </div>
      )}
      caption="Watch the thrust arrow lean forward and grow as you tilt. The orange drag arrow pushes back. The streamlines are the air from the four propellers: the rear two, spinning faster, throw faster air. The difference is drawn larger than in a real flight so you can see it."
      controls={(
        <>
          <Choices label="Drone shape" value={shape} onChange={setShape} options={SHAPES.map((s) => ({ id: s.id, label: s.label }))} />
          <Slider label="Tilt angle" value={tilt} min={0} max={70} step={1} onChange={setTilt} format={(v) => `${v}°`} />
          <Slider label="Drone mass" value={massG} min={300} max={1500} step={50} onChange={setMassG} format={(v) => `${v} g`} />
          <Readout items={[
            { label: 'Forward speed', value: `${(speed * 3.6).toFixed(0)} km/h`, tone: 'good' },
            { label: 'Thrust needed', value: `${(thrust / weight(m)).toFixed(2)} × weight`, tone: thrust / weight(m) > 3 ? 'warn' : undefined },
            { label: 'Drag', value: `${drag.toFixed(1)} N` },
            { label: 'Each front propeller', value: `${(each * split.front).toFixed(2)} N at ${Math.round(rpm(each * split.front)).toLocaleString('en-IN')} rpm` },
            { label: 'Each rear propeller', value: `${(each * split.rear).toFixed(2)} N at ${Math.round(rpm(each * split.rear)).toLocaleString('en-IN')} rpm`, tone: tilt > 5 ? 'good' : undefined },
            { label: 'Air speed: front and rear streams', value: `${(2 * viFront).toFixed(1)} and ${(2 * viRear).toFixed(1)} m/s` },
          ]} />
        </>
      )}
      notice={[
        <>Tilt the drone and watch the rear propeller streams turn red and the rear propellers speed up: that extra push at the back is what pitches the nose down.</>,
        <>At 60° the drone needs <b>twice its weight</b> in thrust just to stay level. That is why heavy drones run out of speed first.</>,
        <>A shape with less drag (the race quad) reaches a higher speed at the same tilt. A cinewhoop's ducts add drag.</>,
        <>Speeds here are calm-air numbers from the formula, not a measurement of any drone.</>,
      ]}
    />
  )
}

function TurnLab() {
  const [kmh, setKmh] = useState(60)
  const [bank, setBank] = useState(45)
  const turn = levelTurn({ speed: kmh / 3.6, bankDeg: bank })
  return (
    <Lab
      title="Banked turns"
      idea={<>To turn, a drone banks: it tilts sideways so part of the thrust pulls it round the curve. The harder the bank, the more thrust it needs to keep its height (the <b>load factor</b>) and the tighter the turn. These are the same numbers a pilot learns for any aircraft.</>}
      figure={(
        <div className={styles.worked}>
          <h3>A turn at {kmh} km/h and {bank}° of bank</h3>
          <p className={styles.answer}>load factor n = {turn.loadFactor.toFixed(2)} g &nbsp;·&nbsp; radius = {turn.radiusM.toFixed(0)} m &nbsp;·&nbsp; turn rate = {turn.rateDegPerS.toFixed(0)}°/s</p>
        </div>
      )}
      controls={(
        <>
          <Slider label="Speed" value={kmh} min={20} max={160} step={5} onChange={setKmh} format={(v) => `${v} km/h`} />
          <Slider label="Bank angle" value={bank} min={10} max={75} step={1} onChange={setBank} format={(v) => `${v}°`} />
        </>
      )}
      notice={[<>At 60° of bank the thrust must be <b>twice</b> the weight: the drone feels 2 g.</>, <>The radius grows with the square of the speed: a drone twice as fast needs four times the room.</>]}
    />
  )
}

export default function Wings() {
  return (
    <Chapter
      id="wings"
      kicker="Chapter 2 · Aerodynamics"
      title="Lift, drag and moving through air"
      lead="Air is a fluid, and a fast-moving object feels it. Learn how a wing or blade makes lift, why it stalls, and how a drone trades thrust between holding itself up and going forward."
    >
      <AerofoilLab />
      <div className={styles.ideas}>
        <Formula
          name="Lift and drag"
          expr={<>L = ½ ρ V² S C<sub>L</sub> &nbsp;&nbsp; D = ½ ρ V² S C<sub>D</sub></>}
          symbols={[['ρ', 'air density, kg/m³'], ['V', 'speed through the air, m/s'], ['S', 'wing area, m²'], ['C_L, C_D', 'lift and drag coefficients']]}
          note="The ½ρV² part is the dynamic pressure, the push of moving air. Double the speed, quadruple the force."
        />
        <Formula
          name="Lift coefficient of a thin wing"
          expr={<>C<sub>L</sub> ≈ 2π α &nbsp;&nbsp; (α in radians, up to about 14°)</>}
          symbols={[['α', 'angle of attack'], ['2π', 'about 6.28 per radian, or 0.11 per degree']]}
          note="At 5° the lift coefficient is about 0.55. Past the stall angle the real curve falls instead of rising."
        />
      </div>
      <ForwardLab />
      <div className={styles.ideas}>
        <Formula
          name="Tilted flight"
          expr={<>T cos θ = W &nbsp;&nbsp; T sin θ = D &nbsp;&nbsp; tan θ = D ÷ W</>}
          symbols={[['θ', 'tilt angle from level'], ['T', 'thrust'], ['W', 'weight'], ['D', 'drag']]}
          note="Resolve the thrust into an up part and a forward part. Hold height (T cos θ = W) and the forward part (T sin θ) is what fights drag."
        />
        <Formula
          name="Top speed at a tilt"
          expr={<>V = √( 2 W tan θ ÷ ρ C<sub>D</sub>A )</>}
          symbols={[['C_D A', 'drag area of the whole drone, m²'], ['V', 'speed in calm air, m/s']]}
          note="More tilt, thinner air or a cleaner shape all raise the speed."
        />
      </div>
      <TurnLab />
      <div className={styles.ideas}>
        <Formula
          name="Level turn"
          expr={<>n = 1 ÷ cos φ &nbsp;&nbsp; r = V² ÷ (g tan φ)</>}
          symbols={[['φ', 'bank angle'], ['n', 'load factor, in g'], ['r', 'turn radius, m']]}
        />
        <Idea title="Why this matters for racing">
          <p>The same thrust that holds a drone up has to turn it too. A drone with a thrust-to-weight ratio of 5 cannot bank more than about 78° before it starts to sink. Power-to-weight, not just top speed, decides who wins the corners.</p>
        </Idea>
      </div>
    </Chapter>
  )
}
