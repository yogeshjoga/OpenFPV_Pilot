import { Clock, Eye, Hand } from 'lucide-react'
import { FOCUS, MUSCLE } from '../data/skills.js'
import { Block, Section } from '../shared.jsx'
import styles from './Mind.module.css'

export default function Mind() {
  return (
    <Section
      id="mind"
      kicker="Part 4 · Hands and head"
      title="Build muscle memory fast, and keep your focus"
      intro="Good pilots are not born with quick thumbs. They practise in the right way, and they fly with a calm, clear head. Both can be trained."
    >
      <Block title="How to build muscle memory fast" intro={MUSCLE.intro}>
        <div className={styles.principles}>
          {MUSCLE.principles.map((p) => (
            <article key={p.title}>
              <h4>{p.title}</h4>
              <p>{p.text}</p>
            </article>
          ))}
        </div>

        <h4 className={styles.sub}><Hand size={18} aria-hidden="true" /> Exercises you can do yourself</h4>
        <div className={styles.exercises}>
          {MUSCLE.exercises.map((e) => (
            <article key={e.title} className={styles.exercise}>
              <header>
                <h5>{e.title}</h5>
                <span><Clock size={12} aria-hidden="true" /> {e.time}</span>
              </header>
              <p>{e.text}</p>
              <p className={styles.for}><b>Builds:</b> {e.for}</p>
            </article>
          ))}
        </div>

        <h4 className={styles.sub}>A simple four-week plan</h4>
        <ol className={styles.plan}>
          {MUSCLE.plan.map((w) => (
            <li key={w.week}>
              <b>{w.week}</b>
              <strong>{w.focus}</strong>
              <span>{w.work}</span>
            </li>
          ))}
        </ol>
      </Block>

      <Block title="How to improve your focus" intro={FOCUS.intro}>
        <div className={styles.routine}>
          {FOCUS.routine.map((r) => (
            <article key={r.title}>
              <h4><Eye size={16} aria-hidden="true" /> {r.title}</h4>
              <ul>{r.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className={styles.habits}>
          {FOCUS.habits.map((h) => (
            <article key={h.title}>
              <h5>{h.title}</h5>
              <p>{h.text}</p>
            </article>
          ))}
        </div>
      </Block>
    </Section>
  )
}
