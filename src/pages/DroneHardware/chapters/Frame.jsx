import { useId, useMemo, useState } from 'react'
import { MATERIALS, beamDeflection, offAxisModulus, stiffnessFromThickness, stressStrain, stripMass } from '../hardware.js'
import { Chapter, Choices, Lab, Plot, Readout, Slider, polyline, scale, useClock } from '../parts.jsx'
import styles from '../DroneHardware.module.css'

// The outline of a strip fixed at the left and pushed down at the right. `tip` is how far the free end has dropped, in pixels.
function stripPoints(x0, yCentre, length, thick, tip, steps = 28) {
  const top = []
  const bottom = []
  for (let i = 0; i <= steps; i += 1) {
    const u = i / steps
    const drop = (tip * (3 * u * u - u * u * u)) / 2
    top.push([x0 + u * length, yCentre + drop - thick / 2])
    bottom.push([x0 + u * length, yCentre + drop + thick / 2])
  }
  return [...top, ...bottom.reverse()]
}

// How far a strip has bent, from 0 to 1, over a loop: push on, it springs down and wobbles, push off, it springs back and settles.
function bendOverTime(seconds, wobble) {
  const cycle = 4.2
  const tau = seconds % cycle
  if (tau < 0.4) return 0
  if (tau < 2.5) return 1 - Math.exp(-5 * (tau - 0.4)) * Math.cos(wobble * (tau - 0.4))
  return Math.exp(-5 * (tau - 2.5)) * Math.cos(wobble * (tau - 2.5))
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

function ThicknessLab() {
  const clock = useClock()
  const [mm, setMm] = useState(2)
  const [material, setMaterial] = useState('carbon')
  const m = MATERIALS[material]
  const deflection = beamDeflection({ E: m.E, t: mm })
  const tip = clamp(deflection * 16, 0, 120) * bendOverTime(clock.t, 2 * Math.PI * 1.2 * (mm / 2) ** 1.5)
  const thick = mm * 7
  const yTip = 140 + tip
  return (
    <Lab
      title="Double the thickness, eight times stiffer"
      clock={clock}
      idea={<>A flat plate resists bending much more than you would guess. Its stiffness grows with the <b>cube</b> of its thickness: twice as thick is 2 × 2 × 2 = <b>8 times</b> stiffer, but only 2 times heavier. That is why a frame arm is a thick plate, not a thin one.</>}
      figure={(
        <svg viewBox="0 0 600 280" className={styles.svg} role="img" aria-label={`A ${mm} millimetre strip pushed at its tip, bending and springing back`}>
          <rect x="28" y="40" width="18" height="200" className={styles.softFill} />
          <line x1="46" x2="480" y1="140" y2="140" className={styles.grid} />
          <polygon points={polyline(stripPoints(46, 140, 420, thick, tip))} className={material === 'carbon' ? styles.mutedFill : styles.accentFill} opacity="0.9" />
          <g transform={`translate(466 ${yTip - thick / 2 - 8})`}>
            <line x1="0" x2="0" y1="-52" y2="-6" className={styles.badLine} />
            <polygon points="-8,-8 8,-8 0,4" className={styles.badFill} />
            <text x="12" y="-30" fontSize="13" className={styles.labelStrong}>10 N push</text>
          </g>
          <text x="60" y="262" fontSize="12" className={styles.label}>{m.name}, {mm.toFixed(1)} mm thick, 100 mm long</text>
        </svg>
      )}
      caption="The strip is fixed to the wall at the left, like a frame arm fixed to the body. The dashed line is where it rests."
      controls={(
        <>
          <Slider label="Thickness" value={mm} min={1.5} max={6} step={0.5} onChange={setMm} format={(v) => `${v.toFixed(1)} mm`} />
          <Choices label="Material" value={material} onChange={setMaterial} options={[{ id: 'carbon', label: 'Carbon plate' }, { id: 'aluminium', label: 'Aluminium' }]} />
          <Readout items={[
            { label: 'Tip moves', value: `${deflection.toFixed(2)} mm` },
            { label: 'Stiffness vs 2 mm', value: `${stiffnessFromThickness(mm / 2).toFixed(2)}×`, tone: 'good' },
            { label: 'Weight vs 2 mm', value: `${(mm / 2).toFixed(2)}×`, tone: 'warn' },
          ]} />
        </>
      )}
      notice={[
        <>Slide from 2 mm to 4 mm. The weight doubles but the bend drops to <b>one eighth</b>.</>,
        <>Stiffness goes up faster than weight, so a little more thickness buys a lot of rigidity.</>,
        <>Watch how the springy wobble gets quicker as the strip gets stiffer. That wobble speed is the idea behind resonance, in the next chapter.</>,
      ]}
    />
  )
}

function MaterialLab() {
  const clock = useClock()
  const [mm, setMm] = useState(3)
  const al = MATERIALS.aluminium
  const cf = MATERIALS.carbon
  const dAl = beamDeflection({ E: al.E, t: mm })
  const dCf = beamDeflection({ E: cf.E, t: mm })
  const mAl = stripMass({ rho: al.rho, t: mm })
  const mCf = stripMass({ rho: cf.rho, t: mm })
  const wobble = 2 * Math.PI * 1.2 * (mm / 2) ** 1.5
  const s = bendOverTime(clock.t, wobble)
  const row = (y, name, d, mass, cls, maxMass) => (
    <g>
      <rect x="28" y={y - 40} width="18" height="80" className={styles.softFill} />
      <polygon points={polyline(stripPoints(46, y, 330, mm * 5, clamp(d * 14, 0, 40) * s))} className={cls} opacity="0.9" />
      <text x="46" y={y - 46} fontSize="12" className={styles.labelStrong}>{name}</text>
      <rect x="420" y={y - 10} width={(mass / maxMass) * 150} height="20" className={cls} rx="3" />
      <text x="420" y={y - 16} fontSize="11" className={styles.label}>weight {mass.toFixed(1)} g</text>
    </g>
  )
  return (
    <Lab
      title="Carbon and aluminium are equally stiff. So why carbon?"
      clock={clock}
      idea={<>Surprise: a carbon plate (along its fibres) and an aluminium plate of the same thickness bend almost <b>exactly the same amount</b>. Their stiffness number, Young's modulus, is about <b>70 and 69 GPa</b>. The win is not stiffness. It is that carbon weighs about <b>40 % less</b>, so you get the same rigidity for far less mass on your drone.</>}
      figure={(
        <svg viewBox="0 0 600 280" className={styles.svg} role="img" aria-label="An aluminium strip and a carbon strip of the same thickness bend the same amount, but the carbon one weighs less">
          {row(90, 'Aluminium 6061', dAl, mAl, styles.accentFill, mAl)}
          {row(210, 'Carbon plate', dCf, mCf, styles.mutedFill, mAl)}
        </svg>
      )}
      caption="Same push, same thickness, same size. The bars on the right are the weight of each strip."
      controls={(
        <>
          <Slider label="Thickness of both" value={mm} min={1.5} max={6} step={0.5} onChange={setMm} format={(v) => `${v.toFixed(1)} mm`} />
          <Readout items={[
            { label: 'Aluminium bends', value: `${dAl.toFixed(2)} mm` },
            { label: 'Carbon bends', value: `${dCf.toFixed(2)} mm` },
            { label: 'Carbon is lighter by', value: `${Math.round((1 - mCf / mAl) * 100)} %`, tone: 'good' },
          ]} />
        </>
      )}
      notice={[
        <>The two strips move together. Stiffness is a tie.</>,
        <>Weight is not a tie. On a drone every gram is thrust you have to make, so a lighter frame at the same stiffness flies longer and snappier.</>,
        <>The numbers are textbook values for a plain woven carbon plate pulled along its fibres and for 6061 aluminium.</>,
      ]}
    />
  )
}

function FibreLab() {
  const id = useId().replace(/:/g, '')
  const [angle, setAngle] = useState(45)
  const E = offAxisModulus(angle)
  const curve = useMemo(() => Array.from({ length: 46 }, (_, i) => [i * 2, offAxisModulus(i * 2)]), [])
  const px = scale(0, 90, 340, 620)
  const py = scale(0, 80, 240, 30)
  const lines = Array.from({ length: 15 }, (_, i) => -105 + i * 15)
  return (
    <Lab
      title="Load carbon the wrong way and it loses most of its stiffness"
      idea={<>Carbon plate is made of fibres, and the fibres do the work. A woven plate has fibres running in two directions, side by side and crossed. Pull <b>along</b> the fibres and it is as stiff as aluminium (70 GPa). Turn the load <b>45°</b> off the fibres and the weak epoxy between them has to carry it, and the stiffness falls to about <b>19 GPa</b>, a loss of roughly 70 %.</>}
      figure={(
        <svg viewBox="0 0 640 280" className={styles.svg} role="img" aria-label="A woven carbon plate turned against the pull, and a chart of its stiffness at each angle">
          <defs>
            <clipPath id={`plate${id}`}><rect x="85" y="55" width="170" height="170" rx="4" /></clipPath>
          </defs>
          <g clipPath={`url(#plate${id})`}>
            <rect x="85" y="55" width="170" height="170" className={styles.softFill} />
            <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '170px 140px', transition: 'transform 0.35s ease' }}>
              {lines.map((o) => <line key={`h${o}`} x1="0" x2="340" y1={140 + o} y2={140 + o} className={styles.mutedLine} strokeWidth="5" opacity="0.8" />)}
              {lines.map((o) => <line key={`v${o}`} y1="0" y2="280" x1={170 + o} x2={170 + o} className={styles.ink} strokeWidth="3" opacity="0.7" />)}
            </g>
          </g>
          <rect x="85" y="55" width="170" height="170" rx="4" className={styles.axis} strokeWidth="2" />
          <line x1="80" x2="20" y1="140" y2="140" className={styles.badLine} /><polygon points="12,140 26,132 26,148" className={styles.badFill} />
          <line x1="260" x2="320" y1="140" y2="140" className={styles.badLine} /><polygon points="328,140 314,132 314,148" className={styles.badFill} />
          <text x="170" y="250" textAnchor="middle" fontSize="12" className={styles.label}>pulling the plate; fibres turned {angle}°</text>
          <line x1="340" x2="340" y1="30" y2="240" className={styles.axis} />
          <line x1="340" x2="620" y1="240" y2="240" className={styles.axis} />
          {[0, 45, 90].map((v) => <text key={v} x={px(v)} y="258" textAnchor="middle" fontSize="11" className={styles.label}>{v}°</text>)}
          {[0, 35, 70].map((v) => <text key={v} x="332" y={py(v) + 4} textAnchor="end" fontSize="11" className={styles.label}>{v}</text>)}
          <text x="480" y="276" textAnchor="middle" fontSize="12" className={styles.label}>angle between fibres and pull</text>
          <text x="350" y="22" fontSize="12" className={styles.label}>stiffness (GPa)</text>
          <polyline points={polyline(curve.map(([a, e]) => [px(a), py(e)]))} className={styles.accentLine} />
          <line x1={px(angle)} x2={px(angle)} y1="240" y2={py(E)} className={styles.mutedLine} strokeDasharray="4 4" />
          <circle cx={px(angle)} cy={py(E)} r="7" className={E < 40 ? styles.badFill : styles.goodFill} />
        </svg>
      )}
      caption="The weave is turned against the pull. The dot on the chart is how stiff the plate is at that angle."
      controls={(
        <>
          <Slider label="Fibre angle to the pull" value={angle} min={0} max={90} step={1} onChange={setAngle} format={(v) => `${v}°`} />
          <Readout items={[
            { label: 'Stiffness', value: `${E.toFixed(0)} GPa`, tone: E < 40 ? 'bad' : 'good' },
            { label: 'Lost', value: `${Math.round((1 - E / 70) * 100)} %`, tone: E < 40 ? 'bad' : 'good' },
          ]} />
        </>
      )}
      notice={[
        <>At 0° and 90° the pull runs along one set of fibres, so the plate is stiff both times.</>,
        <>The weak spot is the diagonal. Cut a frame arm so the load runs along the fibres, and the diagonals are where you add layers or choose another weave.</>,
        <>The curve comes from the standard rotation formula for a woven ply, with an epoxy shear stiffness of about 5 GPa.</>,
      ]}
    />
  )
}

function SnapLab() {
  const clock = useClock()
  const x = scale(0, 12, 52, 584)
  const y = scale(0, 800, 260, 16)
  const al = useMemo(() => Array.from({ length: 121 }, (_, i) => [i * 0.1, stressStrain.aluminium(i * 0.1)]), [])
  const cf = useMemo(() => Array.from({ length: 21 }, (_, i) => [i * 0.05, stressStrain.carbon(i * 0.05)]), [])
  const tau = clock.t % 9
  const strain = 12 * Math.min(1, tau / 6.5) ** 2
  const alStrain = Math.min(12, strain)
  const snapped = strain >= 1
  const cfStrain = Math.min(1, strain)
  return (
    <Lab
      title="Aluminium bends. Carbon snaps."
      clock={clock}
      idea={<>Stretch both materials slowly and plot how hard they pull back. <b>Aluminium</b> gives, then <b>yields</b>: past a point it stays bent and keeps stretching without breaking, which absorbs a crash. <b>Carbon</b> goes straight up, very stiff, and then <b>snaps</b> with no warning, because the fibres cannot stretch. So we design carbon parts around that: thick enough, with the load along the fibres.</>}
      figure={(
        <Plot x={x} y={y} xTicks={[0, 2, 4, 6, 8, 10, 12]} yTicks={[0, 200, 400, 600, 800]} xLabel="stretch (%)" yLabel="pull-back (MPa)" label="Stress and strain curves for aluminium and carbon">
          <polyline points={polyline(al.map(([a, b]) => [x(a), y(b)]))} className={styles.accentLine} />
          <polyline points={polyline(cf.map(([a, b]) => [x(a), y(b)]))} className={styles.mutedLine} strokeWidth="4" />
          <circle cx={x(alStrain)} cy={y(stressStrain.aluminium(alStrain))} r="7" className={styles.accentFill} />
          {!snapped && <circle cx={x(cfStrain)} cy={y(stressStrain.carbon(cfStrain))} r="7" className={styles.mutedFill} />}
          {snapped && (
            <g>
              <text x={x(1) + 12} y={y(700) - 6} fontSize="14" className={styles.labelStrong}>SNAP</text>
              <path d={`M${x(1) - 9},${y(700) - 9} l18,18 m0,-18 l-18,18`} className={styles.badLine} />
            </g>
          )}
          <text x={x(0.4) + 10} y={y(276) + 22} fontSize="12" className={styles.label}>aluminium yields here</text>
          <text x={x(1) + 22} y={y(420)} fontSize="12" className={styles.label}>carbon: stiff, then gone</text>
        </Plot>
      )}
      caption="A teaching sketch, not a lab test. The steepness of each line at the start is the stiffness; both are almost the same."
      controls={(
        <Readout items={[
          { label: 'Aluminium', value: alStrain < 0.4 ? 'springy' : 'bent for good', tone: alStrain < 0.4 ? 'good' : 'warn' },
          { label: 'Carbon', value: snapped ? 'snapped' : 'springy', tone: snapped ? 'bad' : 'good' },
        ]} />
      )}
      notice={[
        <>The first stretch is the same for both: they spring back. That is the stiffness being equal.</>,
        <>After it, aluminium has a long, forgiving path before it fails. Carbon has none.</>,
        <>A bent aluminium arm tells you it was hit. A cracked carbon arm may look fine, so check carbon after every crash.</>,
      ]}
    />
  )
}

function MakingLab() {
  const clock = useClock()
  const glow = 0.25 + 0.15 * Math.sin(clock.t * 2.2)
  const offset = -clock.t * 70
  return (
    <Lab
      title="How a plastic thread becomes carbon fibre"
      clock={clock}
      idea={<>Carbon fibre starts as a <b>plastic thread</b>. It is heated in an oven past <b>1000 °C with no oxygen</b>, so it cannot burn. Everything except the carbon atoms is driven off, and what is left is a thread of almost pure carbon, about <b>a tenth as thick as a human hair</b>. Thousands of threads are bundled into a tow, woven into cloth, then soaked in epoxy and baked flat into a plate.</>}
      figure={(
        <svg viewBox="0 0 600 230" className={styles.svg} role="img" aria-label="A plastic thread moves through an oven and comes out as a black carbon thread, next to a hair a tenth as thick">
          <line x1="20" x2="225" y1="100" y2="100" className={styles.mutedLine} strokeWidth="5" strokeDasharray="14 8" strokeDashoffset={offset} />
          <rect x="225" y="48" width="150" height="104" rx="8" className={styles.warnFill} opacity={glow} />
          <rect x="225" y="48" width="150" height="104" rx="8" className={styles.ink} />
          <line x1="375" x2="580" y1="100" y2="100" className={styles.ink} strokeWidth="5" strokeDasharray="14 8" strokeDashoffset={offset} style={{ stroke: 'var(--color-text-primary)' }} />
          <text x="120" y="78" textAnchor="middle" fontSize="12" className={styles.label}>plastic thread</text>
          <text x="300" y="40" textAnchor="middle" fontSize="12" className={styles.labelStrong}>over 1000 °C, no oxygen</text>
          <text x="480" y="78" textAnchor="middle" fontSize="12" className={styles.label}>carbon thread</text>
          <circle cx="360" cy="188" r="28" className={styles.softFill} stroke="var(--color-text-muted)" strokeWidth="1.5" />
          <circle cx="520" cy="188" r="2.8" className={styles.labelStrong} style={{ fill: 'var(--color-text-primary)' }} />
          <text x="360" y="226" textAnchor="middle" fontSize="11" className={styles.label}>human hair, about 70 µm</text>
          <text x="520" y="226" textAnchor="middle" fontSize="11" className={styles.label}>one fibre, about 7 µm</text>
        </svg>
      )}
      caption="Moving dashes show the thread being pulled through the oven. The circles are drawn to the same scale."
      notice={[
        <><b>1.</b> A polymer thread is stretched and stabilised.</>,
        <><b>2.</b> It is baked with no oxygen, so it turns to carbon instead of burning.</>,
        <><b>3.</b> A few thousand threads are bundled into a tow and woven into cloth.</>,
        <><b>4.</b> Cloth and epoxy are pressed and cured into a flat plate. A CNC cuts the frame from it.</>,
        <>Cutting carbon is not like cutting aluminium. The fibres are hard and tiny, so tools need many small teeth, not a few big ones.</>,
      ]}
    />
  )
}

export default function Frame() {
  return (
    <Chapter
      id="frame"
      kicker="Chapter 1 · The frame"
      title="Why drone frames are carbon, and how it behaves"
      lead="A frame has two jobs: hold everything in the right place, and not shake. Start with the one rule that explains most frames, then see why carbon and not metal, and what its weaknesses are."
    >
      <ThicknessLab />
      <MaterialLab />
      <FibreLab />
      <SnapLab />
      <MakingLab />
    </Chapter>
  )
}
