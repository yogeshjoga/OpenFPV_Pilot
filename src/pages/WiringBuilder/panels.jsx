import { useMemo, useState } from 'react'
import { ChevronRight, CircleAlert, CircleCheck, CircleDashed, Circle, Copy, GraduationCap, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PARTS, PART_BY_ID } from '../Simulator/bench/catalog.js'
import { brandsOf, categoriesOf, findParts } from '../Simulator/bench/browse.js'
import { ART } from '../Simulator/bench/parts/registry.jsx'
import styles from './WiringBuilder.module.css'

const STATUS_ICON = { ok: CircleCheck, attention: CircleAlert, open: CircleDashed, unchecked: Circle }

/** The wires on one part, in words: "BAT+ to LiPo 4S + XT60 lead +". */
function wireLines(builder, nodeId) {
  const byId = new Map(builder.nodes.map((n) => [n.id, n]))
  const pad = (key) => {
    const [id, padId] = key.split(':')
    const node = byId.get(id)
    const p = node && PART_BY_ID[node.data.type].pads.find((x) => x.id === padId)
    return { node, label: p?.label ?? padId }
  }
  const lines = []
  for (const e of builder.edges) {
    const a = pad(`${e.source}:${e.sourceHandle}`)
    const b = pad(`${e.target}:${e.targetHandle}`)
    if (a.node?.id === nodeId) lines.push(`${a.label} to ${b.node?.data.label ?? '?'} ${b.label}`)
    else if (b.node?.id === nodeId) lines.push(`${b.label} to ${a.node?.data.label ?? '?'} ${a.label}`)
  }
  return lines
}

export function WiringPanel({ builder, onFocus }) {
  const [filter, setFilter] = useState('all')
  const [openId, setOpenId] = useState(null)
  const { rows } = builder
  const count = { all: rows.length, attention: rows.filter((r) => r.status === 'attention').length, open: rows.filter((r) => r.status === 'open').length }
  const shown = rows.filter((r) => filter === 'all' || r.status === filter)
  const manual = builder.mode === 'manual'

  return (
    <div className={styles.panelInner}>
      <div className={styles.chips} role="tablist" aria-label="Filter parts">
        {[['all', 'All'], ['attention', 'Attention'], ['open', 'Open']].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={filter === id} className={`${styles.chip} ${filter === id ? styles.chipOn : ''}`} onClick={() => setFilter(id)}>
            {label} <span>{count[id]}</span>
          </button>
        ))}
      </div>

      {manual && (
        <div className={styles.manualBar}>
          <span>Manual mode: checks run when you ask.</span>
          <button type="button" className={styles.linkBtn} onClick={builder.check}>
            Check wiring
          </button>
        </div>
      )}

      {!rows.length ? (
        <p className={styles.empty}>No parts yet. Open <strong>Parts</strong> on the left and add your first one.</p>
      ) : (
        <ul className={styles.rows}>
          {shown.map((r) => {
            const Icon = STATUS_ICON[r.status]
            const expanded = openId === r.id
            const lines = expanded ? wireLines(builder, r.id) : []
            return (
              <li key={r.id} className={styles.row}>
                <div className={styles.rowHead}>
                  <button type="button" className={styles.rowToggle} onClick={() => setOpenId(expanded ? null : r.id)} aria-expanded={expanded} aria-label={`Details of ${r.label}`}>
                    <ChevronRight size={14} className={expanded ? styles.turned : ''} aria-hidden="true" />
                  </button>
                  <Icon size={16} className={styles[`status_${r.status}`]} aria-hidden="true" />
                  <button type="button" className={styles.rowName} onClick={() => onFocus(r.id)} title="Show on the canvas">
                    {r.label}
                  </button>
                  <span className={styles.rowCount}>{r.total ? `${r.connected}/${r.total}` : `${r.wires} wire${r.wires === 1 ? '' : 's'}`}</span>
                </div>
                {expanded && (
                  <div className={styles.rowBody}>
                    {r.notes.map((n, i) => (
                      <p key={i} className={`${styles.note} ${n.kind === 'fault' ? styles.noteBad : ''}`}>
                        <strong>{n.title}.</strong> {n.detail}
                      </p>
                    ))}
                    {!r.notes.length && r.status === 'ok' && <p className={styles.note}>Everything on this part is wired correctly.</p>}
                    {r.status === 'unchecked' && <p className={styles.note}>Press Check wiring to see how this part is doing.</p>}
                    {lines.length > 0 && (
                      <ul className={styles.wireList}>
                        {lines.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ul>
                    )}
                    {!lines.length && <p className={styles.note}>No wires yet.</p>}
                  </div>
                )}
              </li>
            )
          })}
          {!shown.length && <li className={styles.empty}>Nothing here. {filter === 'attention' ? 'No part needs attention.' : 'Every part is finished.'}</li>}
        </ul>
      )}
    </div>
  )
}

function Thumb({ type, w, h }) {
  const Art = ART[type]
  const k = Math.min(56 / w, 56 / h)
  return (
    <span className={styles.thumb} aria-hidden="true">
      <span className={styles.thumbInner} style={{ width: w, height: h, transform: `translate(-50%, -50%) scale(${k})` }}>
        <Art />
      </span>
    </span>
  )
}

export function PartsPanel({ onAdd }) {
  const [query, setQuery] = useState('')
  const [brand, setBrand] = useState('all')
  const [category, setCategory] = useState('all')
  const brands = useMemo(() => brandsOf(PARTS), [])
  // only the kinds of part that exist for the chosen brand
  const categories = useMemo(() => categoriesOf(PARTS.filter((p) => brand === 'all' || p.brand === brand)), [brand])
  const list = useMemo(() => findParts(PARTS, { query, brand, category }), [query, brand, category])
  const chip = (value, current, set, label) => (
    <button key={value} type="button" className={`${styles.chip} ${current === value ? styles.chipOn : ''}`} aria-pressed={current === value} onClick={() => set(value)}>
      {label}
    </button>
  )
  return (
    <div className={styles.panelInner}>
      <label className={styles.search}>
        <Search size={15} aria-hidden="true" />
        <input type="search" placeholder="Search parts" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search parts" />
      </label>
      <div className={styles.facets}>
        <span className={styles.facetLabel}>Brand</span>
        {[chip('all', brand, (v) => { setBrand(v); setCategory('all') }, 'All'), ...brands.map((b) => chip(b, brand, (v) => { setBrand(v); setCategory('all') }, b))]}
      </div>
      <div className={styles.facets}>
        <span className={styles.facetLabel}>Kind</span>
        {[chip('all', category, setCategory, 'All'), ...categories.map((c) => chip(c, category, setCategory, c))]}
      </div>
      <p className={styles.hint}>Click a part to add it to the canvas, or drag it across. Select a part and press F to turn it over.</p>
      <ul className={styles.parts}>
        {list.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className={styles.part}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('application/x-bench-part', p.id)
                e.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => onAdd(p.id)}
            >
              <Thumb type={p.id} w={p.w} h={p.h} />
              <span>
                <strong>
                  {p.brand !== 'Generic' && <em className={styles.brandTag}>{p.brand}</em>}
                  {p.brand !== 'Generic' ? p.model : p.name}
                </strong>
                <small>{p.blurb}</small>
                {p.specs?.length > 0 && <small className={styles.specs}>{p.specs.slice(0, 3).join(' · ')}</small>}
              </span>
            </button>
          </li>
        ))}
        {!list.length && <li className={styles.empty}>No part matches. Try another brand or kind.</li>}
      </ul>
    </div>
  )
}

export function BuildsPanel({ builder }) {
  const { builds, current } = builder
  return (
    <div className={styles.panelInner}>
      <div className={styles.buildActions}>
        <button type="button" className={styles.primary} onClick={() => builder.create('New build')}>
          <Plus size={15} aria-hidden="true" /> New build
        </button>
        <button type="button" className={styles.iconBtn} onClick={builder.duplicate} title="Duplicate this build" aria-label="Duplicate this build">
          <Copy size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => {
            const name = window.prompt('Name this build', current.name)
            if (name && name.trim()) builder.rename(name.trim().slice(0, 40))
          }}
          title="Rename this build"
          aria-label="Rename this build"
        >
          <Pencil size={15} aria-hidden="true" />
        </button>
        <button type="button" className={styles.iconBtn} onClick={() => window.confirm(`Delete "${current.name}"? This cannot be undone.`) && builder.remove()} title="Delete this build" aria-label="Delete this build">
          <Trash2 size={15} aria-hidden="true" />
        </button>
      </div>
      <ul className={styles.buildList}>
        {builds.map((b) => (
          <li key={b.id}>
            <button type="button" className={`${styles.buildItem} ${b.id === current.id ? styles.buildOn : ''}`} onClick={() => builder.open(b.id)}>
              <strong>{b.name}</strong>
              <small>
                {b.nodes.length} part{b.nodes.length === 1 ? '' : 's'}, {b.wires.length} wire{b.wires.length === 1 ? '' : 's'}
              </small>
            </button>
          </li>
        ))}
      </ul>
      <Link to="/simulator" className={styles.lessonLink}>
        <GraduationCap size={16} aria-hidden="true" /> Practise with guided lessons
      </Link>
    </div>
  )
}
