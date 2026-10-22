import { useMemo, useState } from 'react'
import { AlertTriangle, BookOpen, CheckCircle2, Circle, Copy, Flame, Info, Lightbulb, Pencil, Plus, RotateCcw, Star, Trash2, XCircle, Zap } from 'lucide-react'
import { brandsOf, categoriesOf, findParts } from './browse.js'
import { PARTS } from './catalog.js'
import { LESSONS } from './lessons.js'
import { ART } from './parts/registry.jsx'
import styles from '../Simulator.module.css'

const Stars = ({ n = 0 }) => (
  <span className={styles.stars} aria-label={`${n} of 3 stars`}>
    {[1, 2, 3].map((i) => (
      <Star key={i} size={14} className={i <= n ? styles.starOn : styles.starOff} aria-hidden="true" />
    ))}
  </span>
)

const formatTime = (ms) => {
  const s = Math.round(ms / 1000)
  return s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`
}

export function LessonPanel({ bench }) {
  const { lesson, taskState, progress } = bench
  const [hint, setHint] = useState({ id: null, shown: 0 })
  const shown = hint.id === lesson.id ? hint.shown : 0
  return (
    <div className={styles.panelBody}>
      <section className={styles.card} aria-labelledby="lesson-title">
        <h2 id="lesson-title" className={styles.cardTitle}>{lesson.title}</h2>
        <p className={styles.cardText}>{lesson.summary}</p>
        <ul className={styles.tasks}>
          {taskState.map((t) => (
            <li key={t.goal} className={t.done ? styles.taskDone : ''}>
              {t.done ? <CheckCircle2 size={16} aria-hidden="true" /> : <Circle size={16} aria-hidden="true" />}
              <span>{t.text}</span>
            </li>
          ))}
        </ul>
        {shown > 0 && (
          <ol className={styles.hints}>
            {lesson.hints.slice(0, shown).map((h) => (
              <li key={h}>
                <Lightbulb size={14} aria-hidden="true" /> {h}
              </li>
            ))}
          </ol>
        )}
        <div className={styles.cardActions}>
          {shown < lesson.hints.length && (
            <button type="button" className={styles.btnGhost} onClick={() => setHint({ id: lesson.id, shown: shown + 1 })}>
              <Lightbulb size={15} aria-hidden="true" /> {shown ? 'Another hint' : 'Show a hint'}
            </button>
          )}
          <button type="button" className={styles.btnGhost} onClick={bench.restartLesson}>
            <RotateCcw size={15} aria-hidden="true" /> Restart
          </button>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => window.confirm('Show the finished wiring? Your own wiring will be replaced, and this try will not count towards your stars.') && bench.showAnswer()}
          >
            <BookOpen size={15} aria-hidden="true" /> Show answer
          </button>
        </div>
      </section>

      <h3 className={styles.panelHeading}>All lessons</h3>
      <ol className={styles.lessonList}>
        {LESSONS.map((l, i) => {
          const p = progress[l.id]
          return (
            <li key={l.id}>
              <button type="button" className={`${styles.lessonItem} ${l.id === lesson.id ? styles.lessonActive : ''}`} onClick={() => bench.openLesson(l.id)}>
                <span className={styles.lessonNum}>{p?.done ? <CheckCircle2 size={18} aria-hidden="true" /> : i + 1}</span>
                <span className={styles.lessonText}>
                  <strong>{l.title}</strong>
                  <small>{l.level}</small>
                </span>
                {p?.done && <Stars n={p.stars} />}
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function Thumb({ type, w, h }) {
  const Art = ART[type]
  const k = Math.min(64 / w, 64 / h)
  return (
    <span className={styles.thumb} aria-hidden="true">
      <span className={styles.thumbInner} style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${k})` }}>
        <Art />
      </span>
    </span>
  )
}

export function FreePanel({ bench, onAdd }) {
  const [brand, setBrand] = useState('all')
  const [category, setCategory] = useState('all')
  const brands = useMemo(() => brandsOf(PARTS), [])
  const categories = useMemo(() => categoriesOf(PARTS.filter((p) => brand === 'all' || p.brand === brand)), [brand])
  const list = useMemo(() => findParts(PARTS, { brand, category }), [brand, category])
  return (
    <div className={styles.panelBody}>
      <div className={styles.wsBar}>
        <label className={styles.wsLabel} htmlFor="ws-select">Workspace</label>
        <select id="ws-select" className={styles.select} value={bench.mode.id} onChange={(e) => bench.openFree(e.target.value)}>
          {bench.freeList.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
        <div className={styles.wsActions}>
          <button type="button" className={styles.iconBtn} onClick={() => bench.newFree('My build')} title="New workspace" aria-label="New workspace">
            <Plus size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => {
              const name = window.prompt('Name this workspace', bench.freeName)
              if (name && name.trim()) bench.renameFree(name.trim().slice(0, 40))
            }}
            title="Rename"
            aria-label="Rename workspace"
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button type="button" className={styles.iconBtn} onClick={bench.duplicateFree} title="Duplicate" aria-label="Duplicate workspace">
            <Copy size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => window.confirm(`Delete "${bench.freeName}"? This cannot be undone.`) && bench.deleteFree()}
            title="Delete"
            aria-label="Delete workspace"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        <label>
          <span>Brand</span>
          <select className={styles.select} value={brand} onChange={(e) => { setBrand(e.target.value); setCategory('all') }}>
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Kind</span>
          <select className={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All kinds</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className={styles.panelNote}>Drag a part onto the bench, or tap it to add. Select a part and press F to turn it over. Click a wire and press Delete to remove it.</p>
      <ul className={styles.tray}>
        {list.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={styles.trayItem}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-bench-part', p.id)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => onAdd(p.id)}
            >
              <Thumb type={p.id} w={p.w} h={p.h} />
              <span className={styles.trayText}>
                <strong>{p.brand !== 'Generic' ? `${p.brand} ${p.model}` : p.name}</strong>
                <small>{p.blurb}</small>
              </span>
            </button>
          </li>
        ))}
        {!list.length && <li className={styles.panelNote}>No part matches. Try another brand or kind.</li>}
      </ul>
    </div>
  )
}

const ICON = { critical: Flame, warn: AlertTriangle, info: Info, ok: CheckCircle2 }
const LEVEL = { critical: 'reportCritical', warn: 'reportWarn', info: 'reportInfo', ok: 'reportOk' }

export function ReportPanel({ bench }) {
  const { report, outcome, lesson } = bench
  if (!report) {
    return (
      <div className={styles.report}>
        <p className={styles.reportEmpty}>
          <Zap size={16} aria-hidden="true" /> Solder your wires, then press <strong>Power up</strong>. The report tells you what is right and what is wrong.
        </p>
      </div>
    )
  }
  const problems = report.items.filter((i) => i.level === 'critical' || i.level === 'warn').length
  const spinning = Object.keys(report.spins).length
  return (
    <div className={styles.report} role="status">
      <div className={styles.reportHead}>
        {report.faults ? (
          <strong className={styles.reportBad}>
            <Flame size={18} aria-hidden="true" /> Magic smoke. Something burnt.
          </strong>
        ) : problems ? (
          <strong className={styles.reportBad}>
            <XCircle size={18} aria-hidden="true" /> {problems} thing{problems > 1 ? 's' : ''} to fix
          </strong>
        ) : (
          <strong className={styles.reportGood}>
            <CheckCircle2 size={18} aria-hidden="true" /> {spinning ? `Powered up. ${spinning} motor${spinning > 1 ? 's are' : ' is'} spinning.` : 'Powered up. No problems found.'}
          </strong>
        )}
        {lesson && outcome?.passed && (
          <span className={styles.reportWin}>
            Lesson complete <Stars n={outcome.stars} /> in {outcome.attempts} {outcome.attempts === 1 ? 'try' : 'tries'}
            {outcome.ms ? `, ${formatTime(outcome.ms)}` : ''}
          </span>
        )}
      </div>
      <ul className={styles.reportList}>
        {report.items.map((item, i) => {
          const Icon = ICON[item.level]
          return (
            <li key={i} className={`${styles.reportItem} ${styles[LEVEL[item.level]]}`}>
              <Icon size={16} aria-hidden="true" />
              <div>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
            </li>
          )
        })}
        {!report.items.length && <li className={styles.reportItem}><Info size={16} aria-hidden="true" /><div><strong>Nothing to check yet</strong><span>Add parts and wires first.</span></div></li>}
      </ul>
    </div>
  )
}
