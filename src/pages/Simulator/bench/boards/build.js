// Turns the description of a real board into a bench part: its pads, which pads are the same copper, and what each
// pad is for. Plain data, no React and no import of the catalog, so the catalog can import the boards.
import { netKey, semantics } from './semantics.js'

/** Pixels per millimetre on the bench. The board outlines follow the real sizes. */
export const MM = 9
export const mm = (v) => Math.round(v * MM)

const dedupe = () => {
  const seen = new Map()
  return (base) => {
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  }
}

const pad = (id, label, x, y, extra = {}) => ({ id, label, x, y, ...extra })

const names = (text) => (Array.isArray(text) ? text : String(text).trim().split(/\s+/))

/**
 * Connector pins along the four edges, as on a stack board. `front` is
 *   { left: [[group, 'NAME NAME ...'], ...], right: [...], top: [...], bottom: [...] }
 * with every group's pins in the order they sit along the edge (top to bottom, or left to right). The groups of an edge
 * are centred along it. The printed names go inside the board.
 */
export function frontPins(front, { w, h, kind }) {
  const out = []
  const PITCH = 16
  const GAP = 12
  const edges = {
    left: { len: h, at: (c) => ({ x: 14, y: c }), side: 'left' },
    right: { len: h, at: (c) => ({ x: w - 14, y: c }), side: 'right' },
    top: { len: w, at: (c) => ({ x: c, y: 14 }), side: 'down' },
    bottom: { len: w, at: (c) => ({ x: c, y: h - 14 }), side: 'up' },
  }
  for (const [edge, spec] of Object.entries(edges)) {
    const groups = (front[edge] ?? []).map(([group, labels]) => [group, names(labels)])
    if (!groups.length) continue
    const count = groups.reduce((n, [, l]) => n + l.length, 0)
    const room = spec.len - 88 - (groups.length - 1) * GAP
    const pitch = Math.max(14, Math.min(PITCH, room / Math.max(1, count - 1)))
    const span = (count - 1) * pitch + (groups.length - 1) * GAP
    let c = (spec.len - span) / 2
    const id = dedupe()
    groups.forEach(([group, labels], gi) => {
      labels.forEach((label, i) => {
        const { x, y } = spec.at(Math.round(c))
        out.push(pad(id(`${group}.${label}`), label, x, y, { face: 'front', shape: 'pin', hit: 14, group, side: spec.side, ...semantics(label, { kind, group }) }))
        c += i < labels.length - 1 ? pitch : pitch + (gi < groups.length - 1 ? GAP : 0)
      })
    })
  }
  // two connectors can share a group name ("ESC" on the second ESC link): make the ids unique over the whole board
  const seen = new Map()
  return out.map((p) => {
    const n = (seen.get(p.id) ?? 0) + 1
    seen.set(p.id, n)
    return n === 1 ? p : { ...p, id: `${p.id}~${n}` }
  })
}

/**
 * Solder pads on the back, as the manual draws the back. `back` is
 *   { left: ['OUTER INNER', ...], right: ['INNER OUTER', ...], top: ['A B ...'], bottom: ['A B ...'] }
 * A name of '-' is an empty place. A row with one name has it on the outer column. Positions are as seen looking at the
 * back, so they are mirrored into the front's frame here.
 */
export function backPads(back, { w, h, kind }) {
  const list = []
  const rowsL = (back.left ?? []).map(names)
  const rowsR = (back.right ?? []).map(names)
  const top = names(back.top ?? [])
  const bottom = names(back.bottom ?? [])
  const y0 = top.length ? 58 : 50
  const y1 = h - (bottom.length ? 58 : 50)
  const side = (rows, cols) => {
    const pitch = rows.length > 1 ? Math.min(22, (y1 - y0) / (rows.length - 1)) : 0
    rows.forEach((row, i) => {
      const y = Math.round(y0 + i * pitch)
      row.forEach((name, c) => {
        if (name !== '-') list.push([name, cols[c], y, [32, 17]])
      })
    })
  }
  // left rows are (outer, inner), right rows are (inner, outer) as printed; a lone name sits on the outer column
  side(rowsL, [34, 74])
  side(rowsR.map((r) => (r.length === 2 ? [r[1], r[0]] : r)), [w - 34, w - 74])
  const row = (labels, y) => {
    const n = labels.length
    const pitch = n > 8 ? 24 : 27
    const width = n > 8 ? 22 : 26
    labels.forEach((label, i) => {
      if (label === '-') return
      list.push([label, Math.round(w / 2 + (i - (n - 1) / 2) * pitch), y, [width, 17]])
    })
  }
  row(top, 26)
  row(bottom, h - 26)
  const id = dedupe()
  return list.map(([label, xb, yb, size]) =>
    pad(id(`B.${label}`), label, w - xb, yb, { face: 'back', shape: 'pad', size, hit: 16, group: 'BACK', ...semantics(label, { kind, group: 'BACK' }) }),
  )
}

/** Pads that carry the same name are the same copper on a flight controller (every GND, every 5V, M1 on the connector and on the back ...). */
export function joinByLabel(pads) {
  const by = new Map()
  for (const p of pads) {
    const key = netKey(p.label)
    if (key === 'NC') continue
    if (!by.has(key)) by.set(key, [])
    by.get(key).push(p.id)
  }
  return [...by.values()].filter((ids) => ids.length > 1)
}

/** The fields every brand part carries, so the catalog and the panels treat all parts alike. */
export function part(info) {
  return { internal: [], ...info }
}
