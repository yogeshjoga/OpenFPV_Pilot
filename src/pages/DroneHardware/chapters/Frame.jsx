import { useMemo, useState } from 'react'
import { MATERIALS, beamDeflection, offAxisModulus, stiffnessFromThickness, stressStrain, stripMass } from '../hardware.js'
import { Chapter, Choices, Lab, Plot, Readout, Slider, polyline, scale, useClock, useLive } from '../parts.jsx'
import Scene3D from '../widgets/Scene3D.jsx'
import { createBeams, createPlate, createThread } from '../widgets/scenes.js'
import styles from '../DroneHardware.module.css'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const EXAGGERATE = 5 // the bending is drawn five times larger than it is, so it can be seen

// How far a strip has bent, from 0 to 1, over a loop: push on, it springs down and wobbles, push off, it springs back and settles.
function bendOverTime(seconds, wobble) {
  const cycle = 4.2
  const tau = seconds % cycle
  if (tau < 0.4) return 0
  if (tau < 2.5) return 1 - Math.exp(-5 * (tau - 0.4)) * Math.cos(wobble * (tau - 0.4))
  return Math.exp(-5 * (tau - 2.5)) * Math.cos(wobble * (tau - 2.5))
}
const pushed = (seconds) => { const tau = seconds % 4.2; return tau >= 0.4 && tau < 2.5 }

const BEAM_VIEW = { view: [92, 62, 190], target: [50, -4, 0], floorY: -66, minDistance: 90, maxDistance: 420 }

function ThicknessLab() {
  const clock = useClock()
  const [mm, setMm] = useState(2)
  const [material, setMaterial] = useState('carbon')
  const m = MATERIALS[material]
  const deflection = beamDeflection({ E: m.E, t: mm })
  const bend = bendOverTime(clock.t, 2 * Math.PI * 1.2 * (mm / 2) ** 1.5)
  const stateRef = useLive({ beams: [{ name: `${material === 'carbon' ? 'Carbon' : 'Aluminium'}, ${mm.toFixed(1)} mm`, material, thick: mm, tip: clamp(deflection * EXAGGERATE, 0, 40) * bend, load: pushed(clock.t) ? 1 : 0, broken: 0 }] })
  return (
    <Lab
      title="Thickness: why a plate gets stiff so fast"
      clock={clock}
      idea={<>A flat plate resists bending much more than you would guess. Its stiffness grows with the <b>cube</b> of its thickness: twice as thick is 2 × 2 × 2 = <b>8 times</b> stiffer, but only 2 times heavier. That is why a frame arm is a thick plate, not a thin one.</>}
      figure={<Scene3D create={createBeams} stateRef={stateRef} label={`A ${mm} millimetre strip fixed to a wall and pushed at its tip`} {...BEAM_VIEW} />}
      caption="The strip is fixed to the wall like a frame arm to the body, and pushed by 10 N at the tip. The bend is drawn 5 times bigger than real."
      controls={(
        <>
          <Slider label="Thickness" value={mm} min={1.5} max={6} step={0.5} onChange={setMm} format={(v) => `${v.toFixed(1)} mm`} />
          <Choices label="Material" value={material} onChange={setMaterial} options={[{ id: 'carbon', label: 'Carbon plate' }, { id: 'aluminium', label: 'Aluminium' }]} />
          <Readout items={[
            { label: 'Tip moves (real)', value: `${deflection.toFixed(2)} mm` },
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
  const bend = bendOverTime(clock.t, 2 * Math.PI * 1.2 * (mm / 2) ** 1.5)
  const load = pushed(clock.t) ? 1 : 0
  const stateRef = useLive({
    beams: [
      { name: 'Aluminium 6061', material: 'aluminium', thick: mm, tip: clamp(dAl * EXAGGERATE, 0, 40) * bend, load, broken: 0 },
      { name: 'Carbon plate', material: 'carbon', thick: mm, tip: clamp(dCf * EXAGGERATE, 0, 40) * bend, load, broken: 0 },
    ],
  })
  return (
    <Lab
      title="Same stiffness, less weight"
      clock={clock}
      idea={<>Surprise: a carbon plate (along its fibres) and an aluminium plate of the same thickness bend almost <b>exactly the same amount</b>. Their stiffness number, Young's modulus, is about <b>70 and 69 GPa</b>. The win is not stiffness. It is that carbon weighs about <b>40 % less</b>, so you get the same rigidity for far less mass on your drone.</>}
      figure={(
        <div className={styles.stackTight}>
          <Scene3D create={createBeams} stateRef={stateRef} label="An aluminium strip and a carbon strip of the same thickness bend the same amount" {...BEAM_VIEW} view={[96, 64, 200]} />
          <svg viewBox="0 0 400 86" className={styles.svg} role="img" aria-label="The weight of each strip">
            <text x="8" y="26" fontSize="12" className={styles.label}>Aluminium</text>
            <rect x="86" y="12" width={(mAl / mAl) * 230} height="18" rx="3" className={styles.accentFill} />
            <text x={86 + 236} y="26" fontSize="12" className={styles.labelStrong}>{mAl.toFixed(1)} g</text>
            <text x="8" y="62" fontSize="12" className={styles.label}>Carbon</text>
            <rect x="86" y="48" width={(mCf / mAl) * 230} height="18" rx="3" className={styles.mutedFill} />
            <text x={86 + (mCf / mAl) * 230 + 6} y="62" fontSize="12" className={styles.labelStrong}>{mCf.toFixed(1)} g</text>
          </svg>
        </div>
      )}
      caption="Same push, same thickness, same size. The bend is drawn 5 times bigger than real. The bars are the weight of each strip."
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
  const clock = useClock()
  const [angle, setAngle] = useState(45)
  const E = offAxisModulus(angle)
  const curve = useMemo(() => Array.from({ length: 46 }, (_, i) => [i * 2, offAxisModulus(i * 2)]), [])
  const stateRef = useLive({ angle, stretch: clamp(0.03 + (70 / E - 1) * 0.12, 0, 0.5), paused: !clock.playing })
  const x = scale(0, 90, 52, 584)
  const y = scale(0, 80, 134, 12)
  return (
    <Lab
      title="Fibre direction decides how stiff carbon is"
      clock={clock}
      idea={<>Carbon plate is made of fibres, and the fibres do the work. A woven plate has fibres running in two directions, side by side and crossed. Pull <b>along</b> the fibres and it is as stiff as aluminium (70 GPa). Turn the plate <b>45°</b> off the pull and the weak epoxy between the fibres has to carry it, and the stiffness falls to about <b>19 GPa</b>, a loss of roughly 70 %.</>}
      figure={(
        <div className={styles.stackTight}>
          <Scene3D create={createPlate} stateRef={stateRef} view={[0, 120, 130]} target={[0, 6, 0]} floorY={0} minDistance={80} maxDistance={420} label={`A woven carbon plate with its fibres turned ${angle} degrees to the pull`} />
          <Plot width={600} height={170} top={12} bottom={36} x={x} y={y} xTicks={[0, 45, 90]} yTicks={[0, 35, 70]} xLabel="angle between fibres and pull (degrees)" yLabel="GPa" label="Stiffness of the plate at each angle">
            <polyline points={polyline(curve.map(([a, e]) => [x(a), y(e)]))} className={styles.accentLine} />
            <line x1={x(angle)} x2={x(angle)} y1="134" y2={y(E)} className={styles.mutedLine} strokeDasharray="4 4" />
            <circle cx={x(angle)} cy={y(E)} r="7" className={E < 40 ? styles.badFill : styles.goodFill} />
          </Plot>
        </div>
      )}
      caption="The red arrows pull the plate. It stretches more when the weave is turned away from the pull, so you can see it is less stiff. The stretch is drawn much bigger than real."
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
  const y = scale(0, 800, 210, 12)
  const al = useMemo(() => Array.from({ length: 121 }, (_, i) => [i * 0.1, stressStrain.aluminium(i * 0.1)]), [])
  const cf = useMemo(() => Array.from({ length: 21 }, (_, i) => [i * 0.05, stressStrain.carbon(i * 0.05)]), [])
  const tau = clock.t % 9
  const strain = 12 * Math.min(1, tau / 6.5) ** 2
  const alStrain = Math.min(12, strain)
  const snapped = strain >= 1
  const cfStrain = Math.min(1, strain)
  const tauBreak = 6.5 * Math.sqrt(1 / 12)
  const stateRef = useLive({
    beams: [
      { name: 'Aluminium', material: 'aluminium', thick: 3, tip: (alStrain / 12) * 40, load: 1, broken: 0 },
      { name: 'Carbon', material: 'carbon', thick: 3, tip: snapped ? 0 : cfStrain * 5, load: snapped ? 0 : 1, broken: snapped ? clamp((tau - tauBreak) / 0.7, 0, 1) : 0 },
    ],
  })
  return (
    <Lab
      title="Bend or break"
      clock={clock}
      idea={<>Stretch both materials slowly and plot how hard they pull back. <b>Aluminium</b> gives, then <b>yields</b>: past a point it stays bent and keeps stretching without breaking, which absorbs a crash. <b>Carbon</b> goes straight up, very stiff, and then <b>snaps</b> with no warning, because the fibres cannot stretch. So we design carbon parts around that: thick enough, with the load along the fibres.</>}
      figure={(
        <div className={styles.stackTight}>
          <Scene3D create={createBeams} stateRef={stateRef} label="An aluminium strip bending and a carbon strip snapping under a growing push" {...BEAM_VIEW} view={[96, 64, 200]} />
          <Plot width={600} height={250} top={12} bottom={40} x={x} y={y} xTicks={[0, 2, 4, 6, 8, 10, 12]} yTicks={[0, 400, 800]} xLabel="stretch (%)" yLabel="pull-back (MPa)" label="Stress and strain curves for aluminium and carbon">
            <polyline points={polyline(al.map(([a, b]) => [x(a), y(b)]))} className={styles.accentLine} />
            <polyline points={polyline(cf.map(([a, b]) => [x(a), y(b)]))} className={styles.mutedLine} strokeWidth="4" />
            <circle cx={x(alStrain)} cy={y(stressStrain.aluminium(alStrain))} r="7" className={styles.accentFill} />
            {!snapped && <circle cx={x(cfStrain)} cy={y(stressStrain.carbon(cfStrain))} r="7" className={styles.mutedFill} />}
            {snapped && <path d={`M${x(1) - 9},${y(700) - 9} l18,18 m0,-18 l-18,18`} className={styles.badLine} />}
            <text x={x(0.4) + 10} y={y(276) + 22} fontSize="12" className={styles.label}>aluminium yields here</text>
            <text x={x(1) + 14} y={y(520)} fontSize="12" className={styles.label}>carbon: stiff, then snaps</text>
          </Plot>
        </div>
      )}
      caption="A teaching sketch, not a lab test. Bending is drawn bigger than real. The first, steep part of both curves is almost the same: equal stiffness."
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
  const stateRef = useLive({ paused: !clock.playing })
  return (
    <Lab
      title="Making carbon fibre"
      clock={clock}
      idea={<>Carbon fibre starts as a <b>plastic thread</b>. It is heated in an oven past <b>1000 °C with no oxygen</b>, so it cannot burn. Everything except the carbon atoms is driven off, and what is left is a thread of almost pure carbon, about <b>a tenth as thick as a human hair</b>. Thousands of threads are bundled into a tow, woven into cloth, then soaked in epoxy and baked flat into a plate.</>}
      figure={<Scene3D create={createThread} stateRef={stateRef} view={[40, 70, 190]} target={[0, 8, 20]} floorY={-2} minDistance={90} maxDistance={460} label="A plastic thread goes through an oven and comes out as a black carbon thread, next to a hair ten times thicker" />}
      caption="The white thread enters the oven and a black one leaves. The hair and the single fibre are drawn to the same scale."
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
