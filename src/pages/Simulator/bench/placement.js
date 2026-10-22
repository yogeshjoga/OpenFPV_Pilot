import { PART_BY_ID } from './catalog.js'

/** The first spot, spiralling out from `centre`, where a part of this size does not sit on top of another. */
export function freeSpot(centre, part, placed) {
  const gap = 36
  const clear = (x, y) =>
    placed.every((n) => {
      const other = PART_BY_ID[n.data.type]
      return x + part.w + gap <= n.position.x || n.position.x + other.w + gap <= x || y + part.h + gap <= n.position.y || n.position.y + other.h + gap <= y
    })
  const x0 = centre.x - part.w / 2
  const y0 = centre.y - part.h / 2
  for (let ring = 0; ring < 40; ring++) {
    for (let step = 0; step < Math.max(1, ring * 8); step++) {
      const angle = (step / Math.max(1, ring * 8)) * Math.PI * 2
      const x = x0 + Math.cos(angle) * ring * 60
      const y = y0 + Math.sin(angle) * ring * 60
      if (clear(x, y)) return { x, y }
    }
  }
  return { x: x0, y: y0 }
}

/**
 * A tidy arrangement of a whole build, like a wiring diagram: the ESC in the middle with a motor at each corner
 * (each on the side of the output it is wired to), the flight controller above it, the camera, VTX, receiver and
 * GPS around the flight controller, and the battery and capacitor underneath. Spacing follows the size of each part,
 * so big brand boards get the room they need.
 * `nodes`: [{ id, type }]   `wires`: [{ a: 'node:pad', b: 'node:pad' }]   Returns { [id]: { x, y } }
 */
export function tidyLayout(nodes, wires) {
  const at = {}
  const kindOf = (n) => PART_BY_ID[n.type]?.kind ?? n.type
  const sizeOf = (n) => PART_BY_ID[n.type] ?? { w: 150, h: 150 }
  const firstOf = (kind) => nodes.find((n) => kindOf(n) === kind)
  const esc = firstOf('esc') ? sizeOf(firstOf('esc')) : { w: 280, h: 280 }
  const fc = firstOf('fc') ? sizeOf(firstOf('fc')) : { w: 280, h: 280 }
  const motorSize = PART_BY_ID.motor
  const gap = 80
  const used = {}
  const next = (kind) => (used[kind] = (used[kind] ?? -1) + 1)

  const slot = {
    M4: { x: -(motorSize.w + gap), y: 20 },
    M3: { x: -(motorSize.w + gap), y: 20 + motorSize.h + 30 },
    M2: { x: esc.w + gap, y: 20 },
    M1: { x: esc.w + gap, y: 20 + motorSize.h + 30 },
  }
  const free = ['M4', 'M2', 'M3', 'M1']
  const groupOf = (motorId) => {
    for (const w of wires) {
      for (const [mine, other] of [[w.a, w.b], [w.b, w.a]]) {
        const [id] = mine.split(':')
        const [otherId, padId] = other.split(':')
        const target = nodes.find((n) => n.id === otherId)
        if (id === motorId && target && kindOf(target) === 'esc') {
          const m = /^(m[1-4])[abc]$/.exec(padId)
          if (m) return m[1].toUpperCase()
        }
      }
    }
    return null
  }
  const motors = nodes.filter((n) => kindOf(n) === 'motor')
  const taken = new Set()
  for (const m of motors) {
    const g = groupOf(m.id)
    if (g && !taken.has(g)) {
      at[m.id] = slot[g]
      taken.add(g)
      free.splice(free.indexOf(g), 1)
    }
  }
  let extra = 0
  for (const m of motors) {
    if (at[m.id]) continue
    const g = free.shift()
    at[m.id] = g ? slot[g] : { x: -(motorSize.w + gap) * 2, y: 20 + (motorSize.h + 30) * extra++ }
  }

  const top = -(fc.h + gap + 60)
  for (const n of nodes) {
    const kind = kindOf(n)
    const i = next(kind)
    const size = sizeOf(n)
    if (kind === 'motor') continue
    else if (kind === 'esc') at[n.id] = { x: 0, y: (esc.h + gap) * i }
    else if (kind === 'fc') at[n.id] = { x: 0, y: top - (fc.h + gap) * i }
    else if (kind === 'battery') at[n.id] = { x: 40 + (size.w + 50) * i, y: esc.h + gap + 80 }
    else if (kind === 'capacitor') at[n.id] = { x: esc.w + gap + (size.w + 40) * i, y: esc.h + gap + 110 }
    else if (kind === 'receiver') at[n.id] = { x: fc.w + gap, y: top + (size.h + 50) * i }
    else if (kind === 'gps') at[n.id] = { x: fc.w + gap + 170, y: top + (size.h + 50) * i }
    else if (kind === 'vtx') at[n.id] = { x: -(size.w + gap), y: top - (size.h + 50) * i }
    else if (kind === 'camera') at[n.id] = { x: -(size.w + gap) - 190, y: top - (size.h + 50) * i }
  }
  return at
}
