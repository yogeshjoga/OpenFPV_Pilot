// The route of every wire on the canvas, shared between the wires so each one can tell where it crosses another (see hops.js).
// A wire reports its route when it is drawn; the others are told only if the route really changed, so this settles at once.

const lines = new Map() // wire id -> { key, points }
const listeners = new Set()
let version = 0

const notify = () => {
  version += 1
  listeners.forEach((fn) => fn())
}

/** A wire reports its route (a list of [x, y]). */
export function setLine(id, points) {
  const key = points.length ? `${points.length}:${points[0]}:${points[Math.floor(points.length / 2)]}:${points[points.length - 1]}` : ''
  if (lines.get(id)?.key === key) return
  lines.set(id, { key, points })
  notify()
}

/** A wire is gone. */
export function removeLine(id) {
  if (lines.delete(id)) notify()
}

/** The routes of all the other wires. */
export const otherLines = (id) => [...lines.entries()].filter(([k]) => k !== id).map(([, v]) => v.points)

// for useSyncExternalStore
export const subscribe = (fn) => {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
export const snapshot = () => version
