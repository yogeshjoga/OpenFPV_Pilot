import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Chapter, Lab, Readout, Slider, useClock, useLive } from '../../DroneHardware/parts.jsx'
import Scene3D from '../../DroneHardware/widgets/Scene3D.jsx'
import Formula, { Idea } from '../Formula.jsx'
import { createWindTriangle } from '../scenes.js'
import styles from '../Physics.module.css'
import { atmosphere, windTriangle } from '../physics.js'

const SUBJECTS = [
  {
    c: 'var(--color-accent-primary)',
    title: 'Principles of flight (Technical General)',
    learn: 'Lift, drag, the stall, stability, load factor in turns, and how an aircraft performs.',
    use: 'Everything in chapters 1 to 3 of this page: why a drone tilts to move, why thin air weakens it, why a hard bank needs more thrust.',
  },
  {
    c: 'var(--color-success)',
    title: 'Meteorology',
    learn: 'The atmosphere, pressure, temperature, density altitude, wind and gusts, turbulence, cloud, fog, thunderstorms and visibility, and how to read a weather report.',
    use: 'Deciding whether it is safe to fly, how hot weather and altitude cut your thrust, how cold weakens batteries, and when gusts are stronger than your drone.',
  },
  {
    c: 'var(--color-warning)',
    title: 'Air navigation',
    learn: 'Maps, latitude and longitude, compass headings, track and drift, the wind triangle, flight planning and fuel.',
    use: 'Planning a mapping or inspection mission, setting GPS waypoints, correcting for crosswind on a long flight and keeping a battery reserve to get home.',
  },
  {
    c: 'var(--color-error)',
    title: 'Air regulations',
    learn: 'The rules of the air, airspace classes, who has right of way, licences and permissions.',
    use: 'India\'s Drone Rules 2021, the Digital Sky platform, green, yellow and red zones, and what you may and may not do near an airport.',
  },
  {
    c: 'var(--color-accent-secondary)',
    title: 'Aircraft systems (Technical Specific)',
    learn: 'How the aircraft\'s engines, instruments and systems work and fail.',
    use: 'Motors, ESCs, batteries, the flight controller and its sensors (gyro, accelerometer, barometer, compass, GPS), and what to check before every flight.',
  },
  {
    c: 'var(--color-text-secondary)',
    title: 'Radio telephony and human factors',
    learn: 'Clear radio phrases, and how people make mistakes: fatigue, stress, checklists and decisions.',
    use: 'Radio links and telemetry, speaking clearly to a spotter or to the authorities when you need permission, and the discipline of a pre-flight checklist.',
  },
]

function WindLab() {
  const clock = useClock()
  const [airspeed, setAirspeed] = useState(20)
  const [track, setTrack] = useState(90)
  const [from, setFrom] = useState(180)
  const [wind, setWind] = useState(10)
  const t = windTriangle({ airspeed, trackDeg: track, windFromDeg: from, windSpeed: wind })
  const state = useLive({ headingDeg: t.headingDeg, trackDeg: track, windFromDeg: from, windSpeed: wind, airspeed, groundSpeed: t.groundSpeed, possible: t.possible, paused: !clock.playing })
  const pad = (v) => String(Math.round(v)).padStart(3, '0')
  return (
    <Lab
      title="The wind triangle: flying a straight line in wind"
      clock={clock}
      idea={<>Air is not still. A drone flies through <b>air</b>, but the air itself is moving over the <b>ground</b>. Point the nose where you want to go in a crosswind, and you are pushed off course. To fly a straight line you must point the nose <b>into</b> the wind by a small angle, the <b>wind correction angle</b>. Pilots solve this with the wind triangle: the drone's own velocity through the air, plus the wind's velocity, equals the velocity over the ground. The same triangle is solved in every ground-school navigation class.</>}
      figure={<Scene3D create={createWindTriangle} stateRef={state} view={[0, 430, 250]} target={[0, 0, 0]} floorY={0} minDistance={250} maxDistance={700} label="A map seen from above with the drone's heading, the wind and the path over the ground" />}
      caption="North is at the top. Blue is where the nose points and how fast the drone moves through the air. Teal is the wind pushing it. Yellow is the path it really takes. The streaks are the wind."
      controls={(
        <>
          <Slider label="Drone's air speed" value={airspeed} min={8} max={30} step={1} onChange={setAirspeed} format={(v) => `${v} m/s`} />
          <Slider label="Where you want to go (track)" value={track} min={0} max={359} step={1} onChange={setTrack} format={(v) => `${pad(v)}°`} />
          <Slider label="Wind blowing from" value={from} min={0} max={359} step={1} onChange={setFrom} format={(v) => `${pad(v)}°`} />
          <Slider label="Wind speed" value={wind} min={0} max={25} step={1} onChange={setWind} format={(v) => `${v} m/s`} />
          <Readout items={[
            t.possible
              ? { label: 'Point the nose at', value: `${pad(t.headingDeg)}°`, tone: 'good' }
              : { label: 'Cannot hold this track', value: 'wind too strong', tone: 'bad' },
            { label: 'Correction angle', value: `${t.correctionDeg >= 0 ? '+' : ''}${t.correctionDeg.toFixed(1)}°` },
            { label: 'Speed over the ground', value: t.possible ? `${t.groundSpeed.toFixed(1)} m/s` : '-', tone: t.groundSpeed < airspeed * 0.7 ? 'warn' : undefined },
            { label: t.headwind >= 0 ? 'Head wind' : 'Tail wind', value: `${Math.abs(t.headwind).toFixed(1)} m/s` },
            { label: 'Cross wind', value: `${Math.abs(t.crosswind).toFixed(1)} m/s` },
          ]} />
        </>
      )}
      notice={[
        <>Put the wind from the <b>same direction as your track</b> (both 090): a pure head wind. No correction, but the ground speed drops by the wind speed.</>,
        <>Put it <b>90° off</b> (track 090, wind from 180): the nose swings into the wind, and the ground speed falls even though the wind is not on the nose.</>,
        <>Make the wind stronger than your air speed and the drone simply cannot hold the track. A drone that cannot make headway home will land wherever the wind takes it, so check the wind before every long flight.</>,
      ]}
    />
  )
}

export default function Pilot() {
  const rows = [0, 1000, 2000, 3000, 4000, 5000].map((h) => ({ h, ...atmosphere(h) }))
  return (
    <Chapter
      id="ground-class"
      kicker="Chapter 5 · Ground class for drone pilots"
      title="What a CPL ground class teaches, and why drone pilots should learn it"
      lead="A Commercial Pilot Licence (CPL) is the licence for flying manned aircraft for a living. Before any flying, a CPL student spends months in ground classes learning the science and the rules of flight. A drone remote pilot certificate is a different, shorter licence, but the same ground subjects are the foundation of safe, skilled drone flying."
    >
      <p className={styles.callout}>
        <b>Plain honesty:</b> a CPL is not a drone licence, and learning these subjects does not give you one. In India, commercial drone pilots train with an approved training organisation and get a remote pilot certificate under the DGCA's drone rules. The exact syllabus can change, so check the Digital Sky platform and the DGCA website. What follows is the knowledge, not the paperwork.
      </p>
      <div className={styles.subjects}>
        {SUBJECTS.map((s) => (
          <article key={s.title} className={styles.subject} style={{ '--c': s.c }}>
            <h3>{s.title}</h3>
            <h4>What you learn</h4>
            <p>{s.learn}</p>
            <h4>Where a drone pilot uses it</h4>
            <p>{s.use}</p>
          </article>
        ))}
      </div>
      <WindLab />
      <div className={styles.ideas}>
        <Formula
          name="The wind triangle"
          expr={<>sin(WCA) = (W ÷ V) × sin β &nbsp;&nbsp; GS = V cos(WCA) − W cos β</>}
          symbols={[['V', "the drone's speed through the air"], ['W', 'wind speed'], ['β', 'angle between the track and the direction the wind blows from'], ['WCA', 'wind correction angle'], ['GS', 'ground speed']]}
          note="Heading = track + WCA. If W sin β is bigger than V, the sine would be more than 1: there is no heading that holds the track."
        />
        <Idea title="Compass words you will hear">
          <ul>
            <li><b>Track</b>: the line you want to follow over the ground.</li>
            <li><b>Heading</b>: where the nose points. Not always the same as the track.</li>
            <li><b>Drift</b>: how far the wind pushes you off the track.</li>
            <li><b>Wind from 180°</b>: the wind blows <i>from</i> the south, towards the north. Wind is always named by where it comes from.</li>
          </ul>
        </Idea>
      </div>
      <div className={styles.ideas}>
        <Idea title="Meteorology in numbers: the standard atmosphere">
          <p>Pilots start from a standard day and measure how today differs. Density, which sets thrust and lift, falls quickly with height:</p>
          <div className={styles.tableWrap}>
            <table className={`${styles.table} ${styles.tight}`}>
              <thead><tr><th>Height</th><th>Temperature</th><th>Pressure</th><th>Density</th><th>Of sea level</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.h}>
                    <td>{r.h.toLocaleString('en-IN')} m</td>
                    <td>{(r.temperatureK - 273.15).toFixed(1)} °C</td>
                    <td>{(r.pressurePa / 100).toFixed(0)} hPa</td>
                    <td>{r.density.toFixed(3)} kg/m³</td>
                    <td>{Math.round(r.ratio * 100)} %</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Idea>
      </div>
      <div className={styles.ideas}>
        <Idea title="Before every flight: the weather check">
          <ul>
            <li>Wind speed and gusts, compared with what your drone can hold.</li>
            <li>Temperature and height: thinner air means less thrust.</li>
            <li>Rain, fog and low cloud: they ruin the camera view and can cause failures.</li>
            <li>Storms: stay on the ground. Lightning and strong gusts are not worth a flight.</li>
            <li>Sunlight and heat: batteries and electronics both suffer in the heat.</li>
          </ul>
        </Idea>
        <Idea title="Rules and where to read them">
          <p>Air regulations decide where you may fly at all. Read our guide to the <Link to="/blog/drone-rules-india">drone rules in India</Link> and check the airspace map on the Digital Sky platform before you fly.</p>
        </Idea>
      </div>
    </Chapter>
  )
}
