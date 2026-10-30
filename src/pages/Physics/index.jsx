import { Link } from 'react-router-dom'
import PageWrapper from '@components/layout/PageWrapper'
import useDocumentMeta from '@lib/useDocumentMeta'
import { PHYSICS_SECTIONS } from '@data/physicsData.jsx'
import Forces from './chapters/Forces.jsx'
import Wings from './chapters/Wings.jsx'
import Rotation from './chapters/Rotation.jsx'
import Air from './chapters/Air.jsx'
import Pilot from './chapters/Pilot.jsx'
import Maths from './chapters/Maths.jsx'
import dh from '../DroneHardware/DroneHardware.module.css'
import styles from './Physics.module.css'

const CHAPTERS = [
  { id: 'forces', n: '1', title: 'Forces and thrust', text: 'Weight, thrust, hovering and how a propeller pushes air.' },
  { id: 'wings', n: '2', title: 'Lift, drag and flying forward', text: 'Wings and blades, the stall, tilted flight and banked turns.' },
  { id: 'rotation', n: '3', title: 'Rotation and frame design', text: 'Torque, yaw, balance and the moment of inertia.' },
  { id: 'air', n: '4', title: 'Air, ground and battery', text: 'Altitude, heat, ground effect and flight time.' },
  { id: 'ground-class', n: '5', title: 'Ground class (CPL)', text: 'What pilots study, and the wind triangle.' },
  { id: 'maths', n: '6', title: 'The maths you need', text: 'Toolkit, formula sheet and worked examples.' },
]

export default function Physics() {
  useDocumentMeta('Drone Physics and Aerodynamics: 3D Lessons, Formulas and Maths | EGIRE Robotics', 'Learn the physics and aerodynamics of drones with 3D animations: thrust, lift, drag, torque, frame balance, altitude, ground effect, battery time, a CPL-style ground class and the maths you need.')
  return (
    <PageWrapper>
      <header className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Flight physics for drone pilots and builders</p>
          <h1 className={styles.title}>How a drone really flies: the physics, the air and the maths</h1>
          <p className={styles.lead}>Every drone motion comes from a few forces acting on a few kilograms of metal and carbon. Move the sliders, watch the 3D drone respond, and learn the formula behind what you see. Start at the top and read down: each chapter builds on the one before.</p>
          <ol className={styles.map}>
            {CHAPTERS.map((c) => (
              <li key={c.id}>
                <a href={`#${c.id}`}>
                  <span className={styles.mapNum}>Chapter {c.n}</span>
                  <b>{c.title}</b>
                  <span>{c.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </header>
      <nav className={dh.subnav} aria-label="Chapters">
        <div className={`container ${dh.subnavInner}`}>
          {CHAPTERS.map((c) => <a key={c.id} className={dh.subnavLink} href={`#${c.id}`}>{c.n} · {c.title}</a>)}
        </div>
      </nav>
      <div>
        <Forces />
        <Wings />
        <Rotation />
        <Air />
        <Pilot />
        <Maths />
      </div>
      <section className="container">
        <p className={styles.older}>
          Looking for the earlier topic notes? {PHYSICS_SECTIONS.flatMap((s) => s.topics.slice(0, 1).map((t) => (
            <Link key={t.id} to={`/physics/${s.id}/${t.id}`}>{s.title}</Link>
          ))).reduce((acc, el, i) => (i === 0 ? [el] : [...acc, ' · ', el]), [])}
        </p>
      </section>
    </PageWrapper>
  )
}
