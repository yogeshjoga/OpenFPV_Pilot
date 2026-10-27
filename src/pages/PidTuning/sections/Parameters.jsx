import { useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Check, ChevronDown, Search, TriangleAlert } from 'lucide-react'
import { GROUPS, PARAMETERS } from '../data/parameters.js'
import { Section } from '../shared.jsx'
import styles from './Parameters.module.css'

export default function Parameters() {
  const calm = useReducedMotion()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [open, setOpen] = useState(() => new Set(['p']))

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return PARAMETERS.filter((p) => (group === 'all' || p.group === group) && (!q || `${p.name} ${p.short} ${p.where}`.toLowerCase().includes(q)))
  }, [query, group])

  const toggle = (id) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const allOpen = shown.length > 0 && shown.every((p) => open.has(p.id))
  const groupLabel = (id) => GROUPS.find((g) => g.id === id)?.label

  return (
    <Section
      id="parameters"
      kicker="Part 3 · Reference"
      title="Every tuning parameter, explained"
      intro="What each setting does, what happens when you raise or lower it, the pros and cons, a typical value to start from, and where to find it in Betaflight Configurator. Typical values are for a 5-inch freestyle quad."
    >
      <div className={styles.tools}>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <input type="search" placeholder="Search a parameter, for example D or filter" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search parameters" />
        </label>
        <div className={styles.groups} role="tablist" aria-label="Parameter groups">
          <button type="button" role="tab" aria-selected={group === 'all'} onClick={() => setGroup('all')}>All ({PARAMETERS.length})</button>
          {GROUPS.map((g) => (
            <button key={g.id} type="button" role="tab" aria-selected={group === g.id} onClick={() => setGroup(g.id)}>
              {g.label} ({PARAMETERS.filter((p) => p.group === g.id).length})
            </button>
          ))}
        </div>
        <button type="button" className={styles.expandAll} onClick={() => setOpen(allOpen ? new Set() : new Set(shown.map((p) => p.id)))}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      {shown.length === 0 && <p className={styles.none}>No parameter matches. Try a shorter word.</p>}

      <ul className={styles.list}>
        {shown.map((p) => {
          const isOpen = open.has(p.id)
          return (
            <li key={p.id} className={styles.item} data-open={isOpen}>
              <button type="button" className={styles.head} aria-expanded={isOpen} aria-controls={`param-${p.id}`} onClick={() => toggle(p.id)}>
                <span className={styles.headMain}>
                  <b>{p.name}</b>
                  <span className={styles.short}>{p.short}</span>
                </span>
                <span className={styles.chip}>{groupLabel(p.group)}</span>
                <ChevronDown size={18} aria-hidden="true" className={styles.chevron} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`param-${p.id}`}
                    className={styles.bodyWrap}
                    initial={calm ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={calm ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className={styles.body}>
                      <div className={styles.updown}>
                        <div className={styles.up}><h4>Turn it up</h4><p>{p.increase}</p></div>
                        <div className={styles.down}><h4>Turn it down</h4><p>{p.decrease}</p></div>
                      </div>
                      <div className={styles.proscons}>
                        <div>
                          <h4>Pros</h4>
                          <ul>{p.pros.map((x) => <li key={x}><Check size={14} aria-hidden="true" />{x}</li>)}</ul>
                        </div>
                        <div>
                          <h4>Cons</h4>
                          <ul>{p.cons.map((x) => <li key={x}><TriangleAlert size={14} aria-hidden="true" />{x}</li>)}</ul>
                        </div>
                      </div>
                      <dl className={styles.meta}>
                        <div><dt>Typical value</dt><dd>{p.typical}</dd></div>
                        <div><dt>Where to find it</dt><dd>{p.where}</dd></div>
                      </dl>
                      <p className={styles.tip}><b>Tip.</b> {p.tip}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
