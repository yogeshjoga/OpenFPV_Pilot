import { useState } from 'react'
import { Chapter, Lab, Plot, Readout, Slider, polyline, scale, useClock, useLive } from '../../DroneHardware/parts.jsx'
import Scene3D from '../../DroneHardware/widgets/Scene3D.jsx'
import dh from '../../DroneHardware/DroneHardware.module.css'
import Formula, { Idea } from '../Formula.jsx'
import { createBalance, createTorque } from '../scenes.js'
import styles from '../Physics.module.css'
import { G, angularAcceleration, centreOfGravity, quadInertia, quadMoments } from '../physics.js'

const PRESETS = [
  { id: 'hover', label: 'Hover', thrusts: [5, 5, 5, 5] },
  { id: 'pitch', label: 'Nose down', thrusts: [4, 4, 6, 6] },
  { id: 'roll', label: 'Roll right', thrusts: [4, 6, 4, 6] },
  { id: 'yaw', label: 'Yaw clockwise', thrusts: [6, 4, 4, 6] },
]
const MOTORS = ['Front right', 'Front left', 'Rear right', 'Rear left']
const ARM = 0.11 // metres from the centre to each motor

function TorqueLab() {
  const clock = useClock()
  const [thrusts, setThrusts] = useState([5, 5, 5, 5])
  const moments = quadMoments({ thrusts, arm: ARM })
  const inertia = quadInertia({ motorMassKg: 0.032, armM: ARM, bodyMassKg: 0.45, bodyRadiusM: 0.045 })
  const deg = (v) => (v * 180) / Math.PI
  const state = useLive({ thrusts, moments, paused: !clock.playing })
  const set = (i, v) => setThrusts((list) => list.map((t, k) => (k === i ? v : t)))
  const mNm = (v) => `${(v * 1000).toFixed(0)} mN·m`
  return (
    <Lab
      title="Roll, pitch and yaw from four motors"
      clock={clock}
      idea={<>A drone has no rudder or flaps. It steers only by making its four motors push <b>unequally</b>. More thrust on one side tips the drone the other way, like pressing one end of a seesaw: that turning effect is a <b>torque</b>, a force times its distance from the centre. Yaw is different. Each propeller twists the air one way, so the air twists the drone the other way. Two motors turn clockwise and two anticlockwise, so in a hover the twists cancel. Speed up one pair and they do not, and the drone spins.</>}
      figure={<Scene3D create={createTorque} stateRef={state} view={[250, 190, 320]} target={[0, 50, 0]} floorY={-30} minDistance={220} maxDistance={700} label="A drone tilting and turning as the four motors push unequally" />}
      caption="Green arrows are each motor's thrust. The purple arcs are the twisting reaction of each propeller on the drone. The drone responds so you can see what each slider does."
      controls={(
        <>
          <div className={dh.choices} role="group" aria-label="Examples">
            {PRESETS.map((p) => <button key={p.id} type="button" onClick={() => setThrusts(p.thrusts)}>{p.label}</button>)}
          </div>
          {MOTORS.map((name, i) => <Slider key={name} label={name} value={thrusts[i]} min={2} max={8} step={0.25} onChange={(v) => set(i, v)} format={(v) => `${v.toFixed(2)} N`} />)}
          <Readout items={[
            { label: 'Pitch torque', value: mNm(moments.pitch), tone: Math.abs(moments.pitch) > 0.01 ? 'warn' : 'good' },
            { label: 'Roll torque', value: mNm(moments.roll), tone: Math.abs(moments.roll) > 0.01 ? 'warn' : 'good' },
            { label: 'Yaw torque', value: mNm(moments.yaw), tone: Math.abs(moments.yaw) > 0.01 ? 'warn' : 'good' },
            { label: 'Pitch acceleration', value: `${deg(angularAcceleration(moments.pitch, inertia.roll)).toFixed(0)} °/s²` },
            { label: 'Yaw acceleration', value: `${deg(angularAcceleration(moments.yaw, inertia.yaw)).toFixed(0)} °/s²` },
          ]} />
        </>
      )}
      notice={[
        <>Try <b>Nose down</b>: the rear motors push harder, the tail lifts and the drone tips forward. That is how it starts to fly forward.</>,
        <>Try <b>Yaw clockwise</b>: the total lift stays the same, so the drone does not climb, but the twists no longer cancel and it spins.</>,
        <>The same torque turns a light drone much faster than a heavy one: angular acceleration = torque ÷ moment of inertia.</>,
      ]}
    />
  )
}

function BalanceLab() {
  const clock = useClock()
  const [batteryX, setBatteryX] = useState(0)
  const [batteryG, setBatteryG] = useState(180)
  const [arm, setArm] = useState(120)
  const bodyG = 420 // the frame, motors, flight controller and camera, with their balance point at the centre
  const cg = centreOfGravity([{ massG: bodyG, x: 0 }, { massG: batteryG, x: batteryX }])
  const W = ((bodyG + batteryG) / 1000) * G
  const d = arm / Math.SQRT2 // distance of a motor pair from the centre, in mm
  // the front and rear pairs must balance the weight and the turning effect of the shifted balance point
  const front = Math.max(0, (W / 2) * (1 + cg / d))
  const rear = Math.max(0, (W / 2) * (1 - cg / d))
  const worst = Math.max(front, rear)
  const wasted = Math.round(((worst - W / 2) / (W / 2)) * 100)
  const state = useLive({ batteryX, cgX: cg, frontThrustN: front, rearThrustN: rear, weightN: W, paused: !clock.playing })
  const x = scale(60, 200, 52, 584)
  const y = scale(0, 3, 150, 12)
  const ix = (a) => quadInertia({ motorMassKg: 0.032, armM: a / 1000, bodyMassKg: 0.45, bodyRadiusM: 0.045 }).roll * 1000
  const curve = Array.from({ length: 29 }, (_, i) => { const a = 60 + i * 5; return [a, ix(a)] })
  return (
    <Lab
      title="Frame design: balance and the moment of inertia"
      clock={clock}
      idea={<>A drone flies best when its <b>centre of gravity</b>, the balance point of all its parts, sits in the middle of the four motors. If the battery is pushed forward, the balance point moves forward too, and the front motors have to work harder than the rear ones just to keep the drone level. They run out of spare power sooner, and every manoeuvre feels uneven. Frame designers also care about how far the weight sits from the centre. Weight far out (long arms, heavy motors) is hard to start and stop turning: that resistance is the <b>moment of inertia</b>.</>}
      figure={(
        <div className={dh.stackTight}>
          <Scene3D create={createBalance} stateRef={state} view={[190, 150, 260]} target={[0, 20, 0]} floorY={-40} minDistance={180} maxDistance={600} label="A drone with its battery moved along the frame, showing the balance point and the motor thrusts" />
          <Plot width={600} height={170} top={12} bottom={38} x={x} y={y} xTicks={[60, 100, 140, 180]} yTicks={[0, 1, 2, 3]} xLabel="motor distance from the centre (mm)" yLabel="g·m²" label="Moment of inertia against arm length">
            <polyline points={polyline(curve.map(([a, v]) => [x(a), y(v)]))} className={dh.accentLine} />
            <circle cx={x(arm)} cy={y(ix(arm))} r="7" className={dh.goodFill} />
            <text x="60" y="26" fontSize="11" className={dh.label}>resistance to rolling (×0.001 kg·m²)</text>
          </Plot>
        </div>
      )}
      caption="The red ball is the balance point, the green ring is the middle of the motors. When they do not line up, the thrust arrows show the front and rear motors working unequally."
      controls={(
        <>
          <Slider label="Battery position (+ is forward)" value={batteryX} min={-40} max={40} step={1} onChange={setBatteryX} format={(v) => `${v} mm`} />
          <Slider label="Battery weight" value={batteryG} min={80} max={320} step={10} onChange={setBatteryG} format={(v) => `${v} g`} />
          <Slider label="Arm length (motor distance)" value={arm} min={60} max={200} step={5} onChange={setArm} format={(v) => `${v} mm`} />
          <Readout items={[
            { label: 'Balance point', value: `${cg.toFixed(1)} mm`, tone: Math.abs(cg) < 2 ? 'good' : 'warn' },
            { label: 'Front motors', value: `${front.toFixed(1)} N` },
            { label: 'Rear motors', value: `${rear.toFixed(1)} N` },
            { label: 'Busiest motors are', value: wasted > 0 ? `${wasted} % over share` : 'balanced', tone: wasted > 8 ? 'bad' : wasted > 2 ? 'warn' : 'good' },
          ]} />
        </>
      )}
      notice={[
        <>Slide the battery forward: the red ball moves ahead of the green ring and the <b>front motors</b> take extra load. They hit full power first.</>,
        <>A longer arm gives more leverage, so the same motor difference turns the drone faster. But it also adds inertia, which fights the turn. Designers balance the two.</>,
        <>Rolling resistance grows with the <b>square</b> of the arm length: double the arms and the inertia is about four times as big.</>,
      ]}
    />
  )
}

export default function Rotation() {
  return (
    <Chapter
      id="rotation"
      kicker="Chapter 3 · Rotation and frame design"
      title="How a drone turns, and why the frame shape matters"
      lead="Steering is nothing but unequal thrust. Understand torque, moment of inertia and balance and you understand why frames are built the way they are."
    >
      <TorqueLab />
      <div className={styles.ideas}>
        <Formula
          name="Torque from thrust"
          expr={<>τ = F × d &nbsp;&nbsp; α = τ ÷ I</>}
          symbols={[['τ', 'torque, newton-metres'], ['F', 'the difference in thrust, newtons'], ['d', 'distance from the centre, metres'], ['I', 'moment of inertia, kg·m²'], ['α', 'angular acceleration, rad/s²']]}
          note="For an X-shaped quad the motors sit L ÷ √2 from each axis, where L is the arm length."
        />
        <Formula
          name="Yaw from reaction torque"
          expr={<>Q = P ÷ (2π n) &nbsp;&nbsp; τ<sub>yaw</sub> = ΣQ<sub>CCW</sub> − ΣQ<sub>CW</sub></>}
          symbols={[['Q', 'torque each propeller needs, N·m'], ['P', 'shaft power, W'], ['n', 'turns per second']]}
          note="Newton's third law again: the motor twists the propeller, so the propeller twists the drone the opposite way."
        />
      </div>
      <BalanceLab />
      <div className={styles.ideas}>
        <Formula
          name="Balance point and moment of inertia"
          expr={<>x<sub>cg</sub> = Σ(m x) ÷ Σm &nbsp;&nbsp; I = Σ m r²</>}
          symbols={[['x_cg', 'position of the balance point'], ['m', 'mass of each part'], ['r', 'distance of that part from the axis']]}
          note="Because r is squared, weight at the arm tips costs far more than weight near the centre."
        />
        <Idea title="What this means when you design a frame">
          <ul>
            <li>Put the heaviest parts (battery, flight controller) at the centre, and line up their balance point with the middle of the motors.</li>
            <li>Keep the arms as short as the propellers allow: less inertia means quicker turns.</li>
            <li>Make the arms stiff, so the thrust differences become turning, not bending. The hardware page shows what happens when they flex.</li>
            <li>Lighter motors on the arm tips help even more than a lighter body.</li>
          </ul>
        </Idea>
      </div>
    </Chapter>
  )
}
