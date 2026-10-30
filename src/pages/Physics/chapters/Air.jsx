import { useState } from 'react'
import { Chapter, Choices, Lab, Plot, Readout, Slider, polyline, scale, useClock, useLive } from '../../DroneHardware/parts.jsx'
import Scene3D from '../../DroneHardware/widgets/Scene3D.jsx'
import dh from '../../DroneHardware/DroneHardware.module.css'
import Formula, { Idea } from '../Formula.jsx'
import { createAtmosphere, createGroundEffect } from '../scenes.js'
import styles from '../Physics.module.css'
import FlowLegend from '../FlowLegend.jsx'
import { AIR_DENSITY, floorPressure, floorWindSpeed } from '../flow.js'
import { atmosphere, batteryEnergyWh, discArea, flightTimeMin, groundEffect, hoverElectricalPower, inducedVelocity, weight } from '../physics.js'

const PLACES = [
  { id: 'vizag', label: 'Visakhapatnam (sea level)', alt: 5 },
  { id: 'hyd', label: 'Hyderabad (540 m)', alt: 540 },
  { id: 'blr', label: 'Bengaluru (920 m)', alt: 920 },
  { id: 'shimla', label: 'Shimla (2,200 m)', alt: 2200 },
  { id: 'leh', label: 'Leh (3,500 m)', alt: 3500 },
]

function AtmosphereLab() {
  const clock = useClock()
  const [alt, setAlt] = useState(5)
  const [hotter, setHotter] = useState(0)
  const air = atmosphere(alt, hotter)
  const thrustSame = air.ratio // thrust at the same motor speed, compared with sea level
  const rpmNeeded = 1 / Math.sqrt(air.ratio) // motor speed needed for the same thrust
  // to hold up the same weight in thinner air each propeller must throw the air down faster
  const discA = discArea(0.127)
  const thrustEach = weight(0.7) / 4
  const viSea = inducedVelocity(thrustEach, AIR_DENSITY, discA)
  const vi = inducedVelocity(thrustEach, air.density, discA)
  const state = useLive({ ratio: air.ratio, spin: Math.min(2.4, rpmNeeded), hotter: Math.min(1, hotter / 25), vi, viSea, paused: !clock.playing })
  const x = scale(0, 5500, 52, 584)
  const y = scale(0, 1.3, 150, 12)
  const curve = Array.from({ length: 56 }, (_, i) => { const h = i * 100; return [h, atmosphere(h).density] })
  return (
    <Lab
      title="Thin air: altitude and heat"
      clock={clock}
      idea={<>Thrust, lift and drag all depend on <b>air density</b>, how many air molecules fill each cubic metre. A propeller can only push on the air that is there. Climb a mountain, or fly on a hot day, and the same box of air holds fewer molecules, so the same motor speed makes less thrust. The flight controller answers by spinning the motors faster, so that each propeller throws the thinner air down <b>faster</b> and the same weight is still held up. Watch the streams from the propellers: in thin air they turn redder. That uses more power and leaves less in reserve. This is why a drone that is lively in Visakhapatnam can feel weak in Leh.</>}
      figure={(
        <div className={dh.stackTight}>
          <Scene3D create={createAtmosphere} stateRef={state} view={[720, 430, 720]} target={[0, 150, 0]} floorY={0} minDistance={300} maxDistance={1200} label="A box of air with fewer molecules at altitude, and the air streams from a hovering drone's propellers drawn as coloured streamlines" />
          <FlowLegend mode="speed" speedMax={2.1 * viSea * 1.3} />
          <Plot width={600} height={170} top={12} bottom={38} x={x} y={y} xTicks={[0, 1000, 2000, 3000, 4000, 5000]} yTicks={[0, 0.5, 1]} xLabel="altitude (m)" yLabel="kg/m³" label="Air density against altitude">
            <polyline points={polyline(curve.map(([h, r]) => [x(h), y(r)]))} className={dh.accentLine} />
            <circle cx={x(alt)} cy={y(air.density)} r="7" className={dh.goodFill} />
          </Plot>
        </div>
      )}
      caption="Each blue dot is a bunch of air molecules in a sample of air. Fewer dots means thinner air. The coloured lines are the air each propeller throws down to hold the drone up: blue is slow, red is fast. The same drone has to throw the thin air faster."
      controls={(
        <>
          <Choices label="Place" value={PLACES.find((p) => Math.abs(p.alt - alt) < 1)?.id ?? ''} onChange={(id) => setAlt(PLACES.find((p) => p.id === id).alt)} options={PLACES} />
          <Slider label="Altitude" value={alt} min={0} max={5500} step={50} onChange={setAlt} format={(v) => `${v.toLocaleString('en-IN')} m`} />
          <Slider label="Hotter than a standard day by" value={hotter} min={0} max={25} step={1} onChange={setHotter} format={(v) => `${v} °C`} />
          <Readout items={[
            { label: 'Air density', value: `${air.density.toFixed(3)} kg/m³` },
            { label: 'Compared with sea level', value: `${(air.ratio * 100).toFixed(0)} %`, tone: air.ratio < 0.8 ? 'warn' : 'good' },
            { label: 'Thrust at the same rpm', value: `${(thrustSame * 100).toFixed(0)} %`, tone: thrustSame < 0.8 ? 'bad' : 'good' },
            { label: 'Motor speed needed to hover', value: `${(rpmNeeded * 100).toFixed(0)} %`, tone: rpmNeeded > 1.15 ? 'warn' : 'good' },
            { label: 'Air thrown down by each propeller', value: `${(2 * vi).toFixed(1)} m/s`, tone: vi > viSea * 1.1 ? 'warn' : 'good' },
            { label: 'Thrown-air speed vs sea level', value: `${((vi / viSea) * 100).toFixed(0)} %` },
          ]} />
        </>
      )}
      notice={[
        <>Choose <b>Leh</b>: the air has only about 70 % of its sea-level density, so thrust drops by almost a third at the same motor speed.</>,
        <>Add a hot afternoon (+20 °C) and it thins further. In the real world this is called <b>density altitude</b>: the altitude the aircraft "feels".</>,
        <>This is standard-atmosphere data, the same table pilots use in ground school.</>,
      ]}
    />
  )
}

function GroundEffectLab() {
  const clock = useClock()
  const [h, setH] = useState(60)
  const [grams, setGrams] = useState(700)
  const [view, setView] = useState('speed')
  const R = 0.0635
  const gain = groundEffect(R, h / 1000)
  // in a hover each of the four propellers carries a quarter of the weight; the air through each disc moves at the induced speed
  const thrustEach = weight(grams / 1000) / 4
  const vi = inducedVelocity(thrustEach, AIR_DENSITY, discArea(2 * R))
  const rotor = { x: 0, y: h, z: 0, R: R * 1000, vi, floor: true }
  const underPressure = floorPressure(0, 0, [rotor])
  const floorWind = floorWindSpeed(rotor)
  const state = useLive({ heightMm: h, gain, vi, mode: view, paused: !clock.playing })
  const x = scale(30, 300, 52, 584)
  const y = scale(1, 1.4, 150, 12)
  const curve = Array.from({ length: 28 }, (_, i) => { const z = 30 + i * 10; return [z, groundEffect(R, z / 1000)] })
  return (
    <Lab
      title="Ground effect: why landing feels soft"
      clock={clock}
      idea={<>Within about one propeller diameter of the floor, the stream of air coming off the propellers hits the ground and cannot escape quickly. It piles up under the drone and raises the pressure there, so each propeller makes <b>more thrust for the same power</b>. The picture shows the air the way an engineer's flow simulation (CFD) does: coloured streamlines for the speed of the air, and a pressure map painted on the floor. Pilots feel it as a cushion when they land and a float when they take off. It also makes a drone harder to hold steady when it hovers a few centimetres above the ground.</>}
      figure={(
        <div className={dh.stackTight}>
          <Scene3D create={createGroundEffect} stateRef={state} view={[330, 190, 380]} target={[0, 60, 0]} floorY={0} minDistance={220} maxDistance={700} label="A drone hovering above the ground, with streamlines coloured by air speed and a map of the pressure on the floor" />
          <FlowLegend mode={view} speedMax={2.1 * vi} pressureMax={underPressure * 1.05} />
          <Plot width={600} height={170} top={12} bottom={38} x={x} y={y} xTicks={[50, 100, 200, 300]} yTicks={[1, 1.2, 1.4]} xLabel="rotor height above the floor (mm)" yLabel="thrust ×" label="Extra thrust against height above the ground">
            <polyline points={polyline(curve.map(([z, g]) => [x(z), y(g)]))} className={dh.accentLine} />
            <circle cx={x(h)} cy={y(gain)} r="7" className={dh.goodFill} />
          </Plot>
        </div>
      )}
      caption="The lines are air, blue when slow and red when fast: it speeds up through each propeller, hits the floor and rushes out sideways. The patches on the floor are the pressure of the air pushing down on it, brightest red right under each propeller. Lower the drone and the patches get stronger and merge into one cushion."
      controls={(
        <>
          <Choices label="Colour the slice of air by" options={[{ id: 'speed', label: 'Air speed' }, { id: 'pressure', label: 'Pressure' }]} value={view} onChange={setView} />
          <Slider label="Weight of the drone" value={grams} min={300} max={1500} step={50} onChange={setGrams} format={(v) => `${v} g`} />
          <Slider label="Height of the propellers" value={h} min={35} max={300} step={5} onChange={setH} format={(v) => `${v} mm`} />
          <Readout items={[
            { label: 'Extra thrust', value: `+${((gain - 1) * 100).toFixed(1)} %`, tone: gain > 1.05 ? 'good' : undefined },
            { label: 'Hover throttle change', value: `-${((1 - 1 / Math.sqrt(gain)) * 100).toFixed(1)} %` },
            { label: 'Air speed leaving each propeller', value: `${(2 * vi).toFixed(1)} m/s (${Math.round(2 * vi * 3.6)} km/h)` },
            { label: 'Pressure on the floor under it', value: `${underPressure.toFixed(0)} Pa`, tone: 'good' },
            { label: 'Wind blown along the floor', value: `${Math.round(floorWind * 3.6)} km/h` },
            { label: 'Push on the floor (all of the weight)', value: `${weight(grams / 1000).toFixed(1)} N` },
          ]} />
        </>
      )}
      notice={[
        <>Lower the drone to 30 mm: the extra thrust climbs to more than a tenth. At 300 mm it has almost gone.</>,
        <>Make the drone heavier: each propeller must throw more air down, faster, so the pressure on the floor and the wind along it both grow. That is why a heavy drone blows grass flat and kicks up dust.</>,
        <>The pressure is small next to the 101,325 Pa of the air around us, but a drone only needs a few hundred pascals under its propellers to hold itself up.</>,
        <>Ground effect is why a drone can jump off a table, then settle and sink as it leaves the cushion behind.</>,
        <>The formula is for a single rotor and is a good rule of thumb; real quads vary with frame and propeller layout.</>,
      ]}
    />
  )
}

function PowerLab() {
  const [mah, setMah] = useState(1500)
  const [cells, setCells] = useState(4)
  const [baseG, setBaseG] = useState(450)
  const rho = 1.225
  const area = discArea(0.127, 4)
  // a battery weighs about 0.03 g for every mAh in every cell, and the drone must carry it
  const massKg = (g) => (baseG + 0.03 * g * cells) / 1000
  const time = (g) => flightTimeMin({ energyWh: batteryEnergyWh(g, cells), powerW: hoverElectricalPower({ massKg: massKg(g), rho, areaM2: area }) })
  const power = hoverElectricalPower({ massKg: massKg(mah), rho, areaM2: area })
  const x = scale(500, 6000, 52, 584)
  const maxT = Math.max(...Array.from({ length: 12 }, (_, i) => time(500 + i * 500)))
  const y = scale(0, Math.ceil(maxT / 2) * 2, 150, 12)
  const curve = Array.from({ length: 23 }, (_, i) => { const g = 500 + i * 250; return [g, time(g)] })
  return (
    <Lab
      title="Power, battery and flight time"
      idea={<>Flight time is simple in words: <b>energy in the battery ÷ power the drone uses</b>. The catch is that a bigger battery also adds weight, and a heavier drone needs more power to hover. So there is a point where adding battery stops adding time. This chart uses the hover power from momentum theory, with a typical efficiency for the propellers and motors, so the numbers are a guide to the shape, not a promise.</>}
      figure={(
        <Plot width={600} height={230} top={14} bottom={40} x={x} y={y} xTicks={[1000, 2000, 3000, 4000, 5000, 6000]} yTicks={[0, 4, 8, 12]} xLabel="battery size (mAh)" yLabel="minutes" label="Hover flight time against battery size">
          <polyline points={polyline(curve.map(([g, t]) => [x(g), y(t)]))} className={dh.accentLine} />
          <circle cx={x(mah)} cy={y(time(mah))} r="7" className={dh.goodFill} />
          <text x="60" y="30" fontSize="11" className={dh.label}>hover time with a 5 inch drone</text>
        </Plot>
      )}
      controls={(
        <>
          <Slider label="Battery size" value={mah} min={500} max={6000} step={100} onChange={setMah} format={(v) => `${v} mAh`} />
          <Slider label="Cells in series" value={cells} min={3} max={6} step={1} onChange={setCells} format={(v) => `${v}S`} />
          <Slider label="Drone without battery" value={baseG} min={250} max={800} step={10} onChange={setBaseG} format={(v) => `${v} g`} />
          <Readout items={[
            { label: 'Battery energy', value: `${batteryEnergyWh(mah, cells).toFixed(1)} Wh` },
            { label: 'Drone weight', value: `${Math.round(massKg(mah) * 1000)} g` },
            { label: 'Hover power', value: `${power.toFixed(0)} W` },
            { label: 'Hover time', value: `${time(mah).toFixed(1)} min`, tone: 'good' },
          ]} />
        </>
      )}
      notice={[
        <>Double the battery and the time does <b>not</b> double: the extra weight eats part of the gain.</>,
        <>Fast, aggressive flying uses several times the hover power, so real flights are much shorter than hover time.</>,
      ]}
    />
  )
}

export default function Air() {
  return (
    <Chapter
      id="air"
      kicker="Chapter 4 · The air, the ground and the battery"
      title="Altitude, ground effect and flight time"
      lead="Where you fly changes how the drone behaves. Air thins with height and heat, the ground helps a drone near it, and the battery decides how long you get to enjoy it."
    >
      <AtmosphereLab />
      <div className={styles.ideas}>
        <Formula
          name="Air density"
          expr={<>ρ = p ÷ (R T)</>}
          symbols={[['p', 'air pressure, pascals'], ['R', '287 J/(kg·K) for air'], ['T', 'temperature in kelvin (°C + 273.15)'], ['ρ', 'density, kg/m³']]}
          note="Pressure falls with height and heat lowers density, so both reduce thrust. At sea level on a standard day ρ = 1.225 kg/m³."
        />
        <Idea title="Standard atmosphere, the pilot's table">
          <p>Ground school uses the <b>International Standard Atmosphere</b>: 15 °C and 1013 hPa at sea level, with the temperature falling 6.5 °C for every 1,000 m. It gives everyone the same starting point for comparing days and places.</p>
        </Idea>
      </div>
      <GroundEffectLab />
      <div className={styles.ideas}>
        <Formula
          name="Ground effect"
          expr={<>T<sub>in</sub> ÷ T<sub>out</sub> = 1 ÷ (1 − (R ÷ 4z)²)</>}
          symbols={[['R', 'rotor radius'], ['z', 'height of the rotor above the ground'], ['T in / T out', 'thrust near the ground compared with far from it']]}
          note="At one rotor radius of height (z = R) the gain is about 7 %. At half a radius it is about 33 %."
        />
        <Formula
          name="Flight time"
          expr={<>t = E × usable ÷ P &nbsp;&nbsp; E = (mAh ÷ 1000) × cells × 3.7</>}
          symbols={[['E', 'battery energy, watt-hours'], ['P', 'average power, watts'], ['usable', 'fraction you actually use, about 0.8']]}
        />
      </div>
      <PowerLab />
    </Chapter>
  )
}
