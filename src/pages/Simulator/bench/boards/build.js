// Turns the description of a real board into a bench part: its pads, which pads are the same copper, and what each
// pad is for. Plain data, no React and no import of the catalog, so the catalog can import the boards.
import { netKey, semantics } from './semantics.js'

/** Pixels per millimetre on the bench. The board outlines follow the real sizes. */
export const MM = 9

const dedupe = () => {
  const seen = new Map()
  return (base) => {
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return n === 1 ? base : `${base}-${n}`
  }
}

const pad = (id, label, x, y, extra = {}) => ({ id, label, x, y, ...extra })

/**
 * A row of connector pins, as on a stack board. `labels` are in the order they sit along the connector.
 * `along` is the direction the row runs in; `side` is where the printed names go.
 */
export function pinRow({ group, kind, labels, x, y, pitch = 16, along = 'y', side }) {
  const id = dedupe()
  return labels.map((label, i) =>
    pad(id(`${group}.${label}`), label, along === 'y' ? x : x + i * pitch, along === 'y' ? y + i * pitch : y, {
      face: 'front',
      shape: 'pin',
      hit: 15,
      group,
      side,
      ...semantics(label, { kind, group }),
    }),
  )
}

/** Pads on the back of a flight controller. Positions are as seen looking at the back, so they are mirrored here. */
export function backPads({ kind, w, list }) {
  const id = dedupe()
  return list.map(([label, xb, yb]) =>
    pad(id(`B.${label}`), label, w - xb, yb, { face: 'back', shape: 'pad', size: [32, 17], hit: 17, group: 'BACK', ...semantics(label, { kind, group: 'BACK' }) }),
  )
}

/** Pads that carry the same label are the same copper on a flight controller (every GND, every 5V, M1 on the connector and on the back ...). */
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
