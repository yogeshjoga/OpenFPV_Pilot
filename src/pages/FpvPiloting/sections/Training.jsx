import { useEffect, useState } from 'react'
import { ShieldCheck } from 'lucide-react'
import { MODES, MODE_BY_ID } from '../data/modes.js'
import { TRAINING } from '../data/training.js'
import { Section } from '../shared.jsx'
import styles from './Training.module.css'

const KEY = 'egire-fpv-training'

// the ticked tasks are kept in this browser only
function load() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export default function Training() {
  const [mode, setMode] = useState('angle')
  const [done, setDone] = useState(load)
  useEffect(() => {
    try { window.localStorage.setItem(KEY, JSON.stringify(done)) } catch { /* private window: the ticks last until the page closes */ }
  }, [done])

  const plan = TRAINING[mode]
  const info = MODE_BY_ID[mode]
  const finished = plan.tasks.filter((t) => done.includes(t.id)).length
  const toggle = (id) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  const next = plan.tasks.find((t) => !done.includes(t.id))

  return (
    <Section
      id="training"
      kicker="Part 2 · Train each mode"
      title="A ladder of tasks for every mode"
      intro="Work down the list one step at a time. Each task says what to do and how you know it is done. Tick it off when it feels easy, then move on."
    >
      <div className={styles.tabs} role="tablist" aria-label="Choose a mode to train">
        {MODES.map((m) => (
          <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} onClick={() => setMode(m.id)} style={{ '--c': m.color }}>
            {m.name}
            <small>{TRAINING[m.id].tasks.filter((t) => done.includes(t.id)).length}/{TRAINING[m.id].tasks.length}</small>
          </button>
        ))}
      </div>

      <div className={styles.layout} style={{ '--c': info.color }}>
        <aside className={styles.side}>
          <h3>{info.name} training</h3>
          <p>{plan.intro}</p>
          <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={plan.tasks.length} aria-valuenow={finished} aria-label={`${finished} of ${plan.tasks.length} tasks done`}>
            <span style={{ width: `${(finished / plan.tasks.length) * 100}%` }} />
          </div>
          <p className={styles.count}>{finished} of {plan.tasks.length} tasks done</p>
          {next && <p className={styles.next}><b>Next up:</b> {next.title}</p>}
          <div className={styles.rules}>
            <h4><ShieldCheck size={16} aria-hidden="true" /> Rules for this stage</h4>
            <ul>{plan.rules.map((r) => <li key={r}>{r}</li>)}</ul>
          </div>
        </aside>

        <ol className={styles.tasks}>
          {plan.tasks.map((task, i) => {
            const ticked = done.includes(task.id)
            return (
              <li key={task.id} className={`${styles.task} ${ticked ? styles.ticked : ''}`}>
                <label className={styles.check}>
                  <input type="checkbox" checked={ticked} onChange={() => toggle(task.id)} />
                  <span className={styles.num}>{i + 1}</span>
                  <span className="sr-only">Mark "{task.title}" as done</span>
                </label>
                <div className={styles.body}>
                  <div className={styles.head}>
                    <h4>{task.title}</h4>
                    <span className={styles.level} data-level={task.level}>{task.level}</span>
                    <span className={styles.time}>{task.time}</span>
                  </div>
                  <p>{task.how}</p>
                  <p className={styles.goal}><b>Done when:</b> {task.goal}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </Section>
  )
}
