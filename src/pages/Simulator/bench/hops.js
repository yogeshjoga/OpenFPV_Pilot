// Wires that cross each other: the way a circuit is drawn on paper, the horizontal wire hops over the vertical one with a small
// arc, so it is clear the two are not joined. Plain functions on lists of points, no React, so the tests can check them.
//
// A wire is a polyline: [[x, y], ...] with the points a few pixels apart (the path of the wire, sampled).

/** Half the width of a hop, in pixels of the canvas. */
export const HOP = 8

const len = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1])

/** The distance along the polyline of each point, from its start. */
export function distances(points) {
  const out = [0]
  for (let i = 1; i < points.length; i++) out.push(out[i - 1] + len(points[i - 1], points[i]))
  return out
}

/** Where the segment a1-a2 crosses b1-b2: { x, y, t } with t from 0 to 1 along a1-a2, or null. */
export function cross(a1, a2, b1, b2) {
  const rx = a2[0] - a1[0]
  const ry = a2[1] - a1[1]
  const sx = b2[0] - b1[0]
  const sy = b2[1] - b1[1]
  const den = rx * sy - ry * sx
  if (Math.abs(den) < 1e-9) return null // parallel
  const t = ((b1[0] - a1[0]) * sy - (b1[1] - a1[1]) * sx) / den
  const u = ((b1[0] - a1[0]) * ry - (b1[1] - a1[1]) * rx) / den
  if (t < 0 || t > 1 || u < 0 || u > 1) return null
  return { x: a1[0] + t * rx, y: a1[1] + t * ry, t }
}

const horizontal = (a, b) => Math.abs(b[0] - a[0]) > Math.abs(b[1] - a[1]) * 2
const vertical = (a, b) => Math.abs(b[1] - a[1]) > Math.abs(b[0] - a[0]) * 2

/** The point at distance d along the polyline (given its distances). */
export function pointAt(points, dist, d) {
  if (d <= 0) return points[0]
  for (let i = 1; i < points.length; i++) {
    if (dist[i] >= d) {
      const f = (d - dist[i - 1]) / Math.max(1e-9, dist[i] - dist[i - 1])
      return [points[i - 1][0] + (points[i][0] - points[i - 1][0]) * f, points[i - 1][1] + (points[i][1] - points[i - 1][1]) * f]
    }
  }
  return points[points.length - 1]
}

/**
 * Where this wire has to hop over another: the crossings where it runs sideways and the other runs up or down, along a straight
 * stretch long enough for the hop. Returns [{ d, x, y }] sorted by d, d being the distance along this wire.
 * `others` is a list of polylines.
 */
export function hopsOver(points, others, hop = HOP) {
  if (points.length < 2) return []
  const dist = distances(points)
  const total = dist[dist.length - 1]
  const found = []
  for (let i = 1; i < points.length; i++) {
    if (!horizontal(points[i - 1], points[i])) continue
    for (const other of others) {
      for (let j = 1; j < other.length; j++) {
        if (!vertical(other[j - 1], other[j])) continue
        const c = cross(points[i - 1], points[i], other[j - 1], other[j])
        if (!c) continue
        const d = dist[i - 1] + c.t * (dist[i] - dist[i - 1])
        // clear of the ends of the wire, and the wire runs straight and sideways over the whole hop
        if (d < hop * 2.5 || d > total - hop * 2.5) continue
        const before = pointAt(points, dist, d - hop)
        const after = pointAt(points, dist, d + hop)
        if (Math.abs(after[1] - before[1]) > 1.5 || Math.abs(after[0] - before[0]) < hop * 1.6) continue
        found.push({ d, x: c.x, y: c.y })
      }
    }
  }
  found.sort((p, q) => p.d - q.d)
  // two crossings too close for two hops make one hop
  return found.filter((h, k) => k === 0 || h.d - found[k - 1].d > hop * 2.4)
}

const fmt = (n) => Math.round(n * 100) / 100

/** The path of the wire with its hops: straight bits between them and a small arc over each crossing (always up). */
export function hopPath(points, hops, hop = HOP) {
  if (!hops.length) return `M ${points.map((p) => `${fmt(p[0])} ${fmt(p[1])}`).join(' L ')}`
  const dist = distances(points)
  let d = `M ${fmt(points[0][0])} ${fmt(points[0][1])}`
  let at = 0
  const goto = (to) => {
    for (let i = 1; i < points.length; i++) {
      if (dist[i] <= at) continue
      if (dist[i] > to) break
      d += ` L ${fmt(points[i][0])} ${fmt(points[i][1])}`
    }
  }
  for (const h of hops) {
    goto(h.d - hop)
    const a = pointAt(points, dist, h.d - hop)
    const b = pointAt(points, dist, h.d + hop)
    // left to right, clockwise on the screen goes over the top; right to left, anticlockwise does
    const sweep = b[0] >= a[0] ? 1 : 0
    d += ` L ${fmt(a[0])} ${fmt(a[1])} A ${hop} ${hop} 0 0 ${sweep} ${fmt(b[0])} ${fmt(b[1])}`
    at = h.d + hop
  }
  goto(Infinity)
  const last = points[points.length - 1]
  return `${d} L ${fmt(last[0])} ${fmt(last[1])}`
}

/** The wire's path sampled as a polyline: `pathEl` is an SVG path element, `step` the distance between points. */
export function sample(pathEl, step = 2) {
  const total = pathEl.getTotalLength()
  const count = Math.max(2, Math.ceil(total / step))
  const out = []
  for (let i = 0; i <= count; i++) {
    const p = pathEl.getPointAtLength((total * i) / count)
    out.push([fmt(p.x), fmt(p.y)])
  }
  return out
}
