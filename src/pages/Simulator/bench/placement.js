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
 * GPS around the flight controller, and the battery and capacitor underneath.
 * `nodes`: [{ id, type }]   `wires`: [{ a: 'node:pad', b: 'node:pad' }]   Returns { [id]: { x, y } }
 */
export function tidyLayout(nodes, wires) {
  const at = {}
  const used = { esc: 0, fc: 0, battery: 0, capacitor: 0, receiver: 0, camera: 0, vtx: 0, gps: 0 }
  const row = (type, x, y, dx = 0, dy = 330) => {
    const i = used[type]++
    return { x: x + dx * i, y: y + dy * i }
  }
  const slot = { M4: { x: -230, y: -10 }, M3: { x: -230, y: 200 }, M2: { x: 360, y: -10 }, M1: { x: 360, y: 200 } }
  const free = ['M4', 'M2', 'M3', 'M1']
  const groupOf = (motorId) => {
    for (const w of wires) {
      for (const [mine, other] of [[w.a, w.b], [w.b, w.a]]) {
        const [id] = mine.split(':')
        const [otherId, padId] = other.split(':')
        const target = nodes.find((n) => n.id === otherId)
        if (id === motorId && target?.type === 'esc') {
          const m = /^(m[1-4])[abc]$/.exec(padId)
          if (m) return m[1].toUpperCase()
        }
      }
    }
    return null
  }
  const motors = nodes.filter((n) => n.type === 'motor')
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
    at[m.id] = g ? slot[g] : { x: -440, y: -10 + 190 * extra++ }
  }
  for (const n of nodes) {
    if (n.type === 'motor') continue
    if (n.type === 'esc') at[n.id] = row('esc', 0, 0, 0, 320)
    else if (n.type === 'fc') at[n.id] = row('fc', 0, -390, 0, -320)
    else if (n.type === 'battery') at[n.id] = row('battery', 40, 400, 200, 0)
    else if (n.type === 'capacitor') at[n.id] = row('capacitor', 420, 430, 120, 0)
    else if (n.type === 'receiver') at[n.id] = row('receiver', 360, -430, 0, 200)
    else if (n.type === 'gps') at[n.id] = row('gps', 540, -430, 0, 200)
    else if (n.type === 'vtx') at[n.id] = row('vtx', -230, -420, 0, -200)
    else if (n.type === 'camera') at[n.id] = row('camera', -410, -410, 0, -200)
  }
  return at
}
