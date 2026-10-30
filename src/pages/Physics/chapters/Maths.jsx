import { Chapter } from '../../DroneHardware/parts.jsx'
import styles from '../Physics.module.css'
import {
  atmosphere, discArea, hoverElectricalPower, idealHoverPower, inducedVelocity, speedForTilt, weight, windTriangle,
} from '../physics.js'

const TOOLKIT = [
  { title: 'Units and conversion', level: 'Class 6 to 8', text: 'Metres, kilograms, seconds, newtons, watts. Mixing grams with kilograms or inches with metres is the most common mistake in every drone calculation.', use: 'Turn 700 g into 0.7 kg, a 5 inch propeller into 0.127 m, 1500 mAh into watt-hours.' },
  { title: 'Algebra: rearranging formulas', level: 'Class 8 to 9', text: 'Move terms across an equals sign to make the quantity you want stand alone.', use: 'From T = m g to m = T ÷ g, or from V = √(2W tan θ ÷ ρ CdA) to the tilt you need for a given speed.' },
  { title: 'Squares, cubes and roots', level: 'Class 8 to 9', text: 'When one quantity is squared or cubed, doubling the input does much more than double the output.', use: 'Thrust ∝ speed², power ∝ speed³, drag ∝ speed², stiffness ∝ thickness³, hover throttle = √(1 ÷ TWR).' },
  { title: 'Trigonometry', level: 'Class 9 to 10', text: 'Sine, cosine and tangent split a slanted force into an up part and a sideways part.', use: 'Tilted thrust: up = T cos θ, forward = T sin θ. Wind correction: sin(WCA) = (W ÷ V) sin β.' },
  { title: 'Vectors', level: 'Class 11', text: 'Quantities with size and direction add head to tail, like the sides of a triangle.', use: 'Air velocity + wind velocity = ground velocity. Resolving thrust, weight and drag on the 3D drone.' },
  { title: 'Exponentials and logarithms', level: 'Class 11', text: 'Growth or fall that is proportional to the current amount, and the decibel scale that turns big ratios into small numbers.', use: 'Air density falls roughly exponentially with height. Radio signal strength in dB.' },
  { title: 'Calculus ideas', level: 'Class 11 to 12', text: 'A rate of change (derivative) and a running total (integral). You can start with the ideas, using graphs, before the symbols.', use: 'Velocity is the rate of change of position, acceleration of velocity. The flight controller integrates the gyro to find the angle, and PID uses an integral and a derivative.' },
  { title: 'Rotation and torque', level: 'Class 11 to 12', text: 'Force times distance, moment of inertia and angular acceleration: the rotational twin of F = m a.', use: 'Roll, pitch and yaw, frame arm length and why a lighter drone responds faster.' },
]

const SHEET = [
  ['W = m g', 'Weight', 'N'],
  ['F = m a', "Newton's second law", 'N'],
  ['TWR = T ÷ W', 'Thrust-to-weight ratio', '-'],
  ['v_i = √(T ÷ 2ρA)', 'Air speed through a hovering rotor', 'm/s'],
  ['P = T v_i', 'Ideal hover power', 'W'],
  ['T = C_T ρ n² D⁴', 'Propeller thrust', 'N'],
  ['P = C_P ρ n³ D⁵', 'Propeller power', 'W'],
  ['L = ½ ρ V² S C_L', 'Lift', 'N'],
  ['D = ½ ρ V² C_D A', 'Drag', 'N'],
  ['tan θ = D ÷ W', 'Tilt for a steady speed', '-'],
  ['n = 1 ÷ cos φ', 'Load factor in a level turn', 'g'],
  ['r = V² ÷ (g tan φ)', 'Turn radius', 'm'],
  ['τ = F d', 'Torque', 'N·m'],
  ['α = τ ÷ I', 'Angular acceleration', 'rad/s²'],
  ['ρ = p ÷ (R T)', 'Air density', 'kg/m³'],
  ['t = E × 0.8 ÷ P', 'Flight time', 'h'],
  ['sin WCA = (W ÷ V) sin β', 'Wind correction angle', '-'],
]

const PATH = [
  ['Units, fractions and percentages.', 'Convert every number to SI before you calculate.'],
  ['Algebra and rearranging formulas.', 'Solve T = m g for each letter in turn.'],
  ['Squares, cubes and roots.', 'Work out why doubling the motor speed gives four times the thrust.'],
  ['Right-angle trigonometry.', 'Resolve the tilted thrust of a drone into its up and forward parts.'],
  ['Vectors in two dimensions.', 'Add air velocity and wind velocity to find the ground track.'],
  ['Graphs, rates of change and areas.', 'Read speed from a position graph and distance from a speed graph.'],
  ['Forces, torque and moment of inertia.', 'Explain roll, pitch and yaw in your own words.'],
  ['Introductory calculus and simple simulation.', 'Write ten lines of code that fly a drone up and down under gravity and thrust.'],
]

export default function Maths() {
  const m = 0.7
  const A = discArea(0.127, 4)
  const W = weight(m)
  const vi = inducedVelocity(W, 1.225, A)
  const ideal = idealHoverPower(W, 1.225, A)
  const elec = hoverElectricalPower({ massKg: m, rho: 1.225, areaM2: A })
  const v40 = speedForTilt({ massKg: m, tiltDeg: 40, rho: 1.225, cdA: 0.016 })
  const leh = atmosphere(3500)
  const wt = windTriangle({ airspeed: 20, trackDeg: 90, windFromDeg: 180, windSpeed: 10 })
  return (
    <Chapter
      id="maths"
      kicker="Chapter 6 · The maths you need"
      title="From school maths to drone physics"
      lead="You do not need university mathematics to understand how a drone flies. You need a handful of school topics, used well. Here they are, with where each one shows up on a drone, a formula sheet and four worked examples with real numbers."
    >
      <div className={styles.toolkit}>
        {TOOLKIT.map((t) => (
          <article key={t.title} className={styles.tool}>
            <span className={styles.tag}>{t.level}</span>
            <h3>{t.title}</h3>
            <p>{t.text}</p>
            <p><b>On a drone:</b> {t.use}</p>
          </article>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Formula</th><th>What it gives</th><th>Unit</th></tr></thead>
          <tbody>{SHEET.map(([f, what, unit]) => <tr key={f}><td>{f}</td><td>{what}</td><td>{unit}</td></tr>)}</tbody>
        </table>
      </div>

      <div className={styles.ideas}>
        <article className={styles.worked}>
          <h3>Worked example 1: power to hover</h3>
          <ol>
            <li>A 700 g drone weighs W = 0.7 × 9.81 = <b>{W.toFixed(2)} N</b>.</li>
            <li>Four 5 inch propellers (D = 0.127 m) have a disc area of 4 × π × 0.0635² = <b>{A.toFixed(4)} m²</b>.</li>
            <li>The air speed through the discs is √(W ÷ 2ρA) = √({W.toFixed(2)} ÷ (2 × 1.225 × {A.toFixed(4)})) = <b>{vi.toFixed(1)} m/s</b>.</li>
            <li>The ideal power is W × v_i = <b>{ideal.toFixed(0)} W</b>. Real propellers and motors are about half as efficient: <b>{elec.toFixed(0)} W</b>.</li>
          </ol>
          <p className={styles.answer}>Hover power ≈ {elec.toFixed(0)} W</p>
        </article>
        <article className={styles.worked}>
          <h3>Worked example 2: top speed at a tilt</h3>
          <ol>
            <li>Tilt the same drone 40° (tan 40° = 0.839). Its drag area is C_D A = 0.016 m².</li>
            <li>At a steady speed the sideways thrust equals drag: W tan θ = ½ ρ V² C_D A.</li>
            <li>So V = √(2 × {W.toFixed(2)} × 0.839 ÷ (1.225 × 0.016)) = <b>{v40.toFixed(1)} m/s</b>.</li>
          </ol>
          <p className={styles.answer}>V ≈ {(v40 * 3.6).toFixed(0)} km/h in calm air</p>
        </article>
        <article className={styles.worked}>
          <h3>Worked example 3: thrust in Leh</h3>
          <ol>
            <li>At 3,500 m the standard density is {leh.density.toFixed(3)} kg/m³, compared with 1.225 at sea level.</li>
            <li>Thrust is proportional to density at the same motor speed: {leh.density.toFixed(3)} ÷ 1.225 = <b>{leh.ratio.toFixed(2)}</b>.</li>
            <li>To get the same thrust the motors must turn faster by 1 ÷ √{leh.ratio.toFixed(2)} = <b>{(1 / Math.sqrt(leh.ratio)).toFixed(2)}×</b>.</li>
          </ol>
          <p className={styles.answer}>About {Math.round((1 - leh.ratio) * 100)} % less thrust, {Math.round((1 / Math.sqrt(leh.ratio) - 1) * 100)} % more rpm to hover</p>
        </article>
        <article className={styles.worked}>
          <h3>Worked example 4: flying east in a crosswind</h3>
          <ol>
            <li>Air speed V = 20 m/s, track 090°, wind from 180° at 10 m/s. The wind is 90° off the track: β = 90°.</li>
            <li>sin(WCA) = (10 ÷ 20) × sin 90° = 0.5, so WCA = <b>{wt.correctionDeg.toFixed(0)}°</b>.</li>
            <li>Heading = 090° + {wt.correctionDeg.toFixed(0)}° = <b>{String(Math.round(wt.headingDeg)).padStart(3, '0')}°</b>.</li>
            <li>Ground speed = 20 × cos {wt.correctionDeg.toFixed(0)}° − 10 × cos 90° = <b>{wt.groundSpeed.toFixed(1)} m/s</b>.</li>
          </ol>
          <p className={styles.answer}>Point the nose at {String(Math.round(wt.headingDeg)).padStart(3, '0')}°, travel at {wt.groundSpeed.toFixed(1)} m/s</p>
        </article>
      </div>

      <h3 className={styles.sectionHeading}>A learning path</h3>
      <ol className={styles.steps}>
        {PATH.map(([title, task]) => <li key={title}><b>{title}</b> {task}</li>)}
      </ol>
    </Chapter>
  )
}
