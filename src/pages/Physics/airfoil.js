// The air around a wing section, from classical potential-flow theory (a Joukowski aerofoil).
// The wing shape and the flow come from the same formula, so the air slides exactly round the surface that is drawn.
// Units here are "chord-ish": the profile is built with c = 1 and is about 4.3 long. Speeds are in units of the free-stream speed U.
// The caller scales and rotates: the aerofoil is horizontal here and the air arrives at the angle of attack.

export const EPS = 0.09 // how fat the section is
const A = 1 + EPS // radius of the circle that is mapped onto the section
const Z0 = -EPS // centre of that circle

const mul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]
const div = (a, b) => {
  const d = b[0] * b[0] + b[1] * b[1]
  return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]
}
const sqrtC = (a) => {
  const m = Math.hypot(a[0], a[1])
  return [Math.sqrt(Math.max(0, (m + a[0]) / 2)), (a[1] < 0 ? -1 : 1) * Math.sqrt(Math.max(0, (m - a[0]) / 2))]
}

/** The outline of the section, as [x, y] points going once round. */
export function outline(n = 160) {
  const pts = []
  for (let i = 0; i < n; i += 1) {
    const phi = (i / n) * 2 * Math.PI
    const zeta = [Z0 + A * Math.cos(phi), A * Math.sin(phi)]
    const inv = div([1, 0], zeta)
    pts.push([zeta[0] + inv[0], zeta[1] + inv[1]])
  }
  return pts
}

const pts0 = outline()
export const X_LEADING = Math.min(...pts0.map((p) => p[0]))
export const X_TRAILING = Math.max(...pts0.map((p) => p[0]))
export const CHORD_RAW = X_TRAILING - X_LEADING
export const THICKNESS = (Math.max(...pts0.map((p) => p[1])) - Math.min(...pts0.map((p) => p[1]))) / CHORD_RAW

/**
 * The air velocity at (x, y) in units of the free-stream speed, for a section at angle of attack `alpha` (radians).
 * `gammaScale` (0 to 1) scales the circulation, which is what makes lift: 1 is the ideal flow, less is a wing that has stalled.
 * Fills out with [u, v] and returns the speed, or -1 if the point is inside the wing.
 */
export function aerofoilVelocity(out, x, y, alpha, gammaScale = 1) {
  const z = [x, y]
  const root = sqrtC([z[0] * z[0] - z[1] * z[1] - 4, 2 * z[0] * z[1]])
  const z1 = [(z[0] + root[0]) / 2, (z[1] + root[1]) / 2]
  const z2 = [(z[0] - root[0]) / 2, (z[1] - root[1]) / 2]
  const zeta = Math.hypot(z1[0] - Z0, z1[1]) >= Math.hypot(z2[0] - Z0, z2[1]) ? z1 : z2
  const q = [zeta[0] - Z0, zeta[1]]
  if (Math.hypot(q[0], q[1]) < A) return -1
  const ca = Math.cos(alpha)
  const sa = Math.sin(alpha)
  const q2 = mul(q, q)
  const doublet = mul([A * A * ca, A * A * sa], div([1, 0], q2))
  const vortex = mul([0, 2 * A * Math.sin(alpha) * gammaScale], div([1, 0], q))
  const dW = [ca - doublet[0] + vortex[0], -sa - doublet[1] + vortex[1]]
  const zeta2 = mul(zeta, zeta)
  const dz = [1 - div([1, 0], zeta2)[0], -div([1, 0], zeta2)[1]]
  const w = div(dW, dz)
  let u = w[0]
  let v = -w[1]
  const speed = Math.hypot(u, v)
  if (speed > 3) { u *= 3 / speed; v *= 3 / speed }
  out[0] = u
  out[1] = v
  return Math.min(speed, 3)
}
