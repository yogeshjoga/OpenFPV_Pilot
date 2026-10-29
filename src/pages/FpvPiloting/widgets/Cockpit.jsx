import { useState } from 'react'
import styles from './Cockpit.module.css'

// The player screen: everything a student needs to follow a move at a glance, without scrolling.
//   left:  the 3D drone and its controls
//   right: the step the drone is on (in words), and the sticks
//   corner of the 3D view: a small map of the path, seen from above or the side
//   below: tabs for the things to read afterwards (all the steps, the stick chart, mistakes, practice)
export default function Cockpit({ stage, controls, step, sticks, path, tabs, color }) {
  const [current, setCurrent] = useState(tabs[0].id)
  const active = tabs.find((t) => t.id === current) ?? tabs[0]
  return (
    <div className={styles.cockpit}>
      <div className={styles.left}>
        <div className={styles.stage}>
          {stage}
          <div className={styles.minimap}>{path}</div>
        </div>
        {controls}
      </div>
      <div className={styles.right}>
        <section className={styles.step} style={{ '--c': color }} aria-live="polite">{step}</section>
        <section className={styles.card} aria-label="The sticks">{sticks}</section>
      </div>
      <div className={styles.below}>
        <div className={styles.tabs} role="tablist" aria-label="More about this move">
          {tabs.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={t.id === active.id} onClick={() => setCurrent(t.id)}>{t.label}</button>
          ))}
        </div>
        <div role="tabpanel" className={styles.panel}>{active.node}</div>
      </div>
    </div>
  )
}
