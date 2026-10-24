// One propeller blade, built from the way a real one is shaped (three.js geometry, units are millimetres).
//   - the chord (blade width) is narrow at the root, widest around the middle and rounded off at the tip
//   - the twist follows the pitch: near the hub the blade stands steep, near the tip it is almost flat
//   - the planform sweeps back against the direction of travel, like a scimitar
//   - every section is a cambered airfoil, thick at the root and thin at the tip
// The blade lies along +x, its thickness is along y and the direction of travel is along z (z is the sign of `dir`).
import * as THREE from 'three'

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))
const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

// the hub the blades grow out of, as a profile to spin (radius, height); its bottom is 1.2 mm under the blade plane
export const HUB_PROFILE = [[0, -1.2], [7.4, -1.2], [8.4, -0.3], [8.4, 1.6], [7.2, 3.0], [5.0, 3.8], [0, 3.8]]

export function makeBlade({ radiusMm, pitchIn, dir = 1, blades = 3 }) {
  const R = radiusMm
  const r0 = 5.5 // the blade starts inside the hub
  const N = 30 // stations along the blade
  const M = 14 // points along each side of the airfoil
  const chordScale = blades === 2 ? 1.12 : 1
  const camber = 0.07
  const pivot = 0.35 // the twist turns about this fraction of the chord behind the leading edge
  const motion = dir > 0 ? 1 : -1
  const sweepBack = R * 0.26

  const section = []
  for (let k = 0; k <= M; k++) {
    const x = (1 - Math.cos((Math.PI * k) / M)) / 2
    const half = 5 * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4)
    section.push({ x, half, mid: 4 * camber * x * (1 - x) })
  }
  // up the top surface from the leading edge to the trailing edge, then back along the bottom
  const order = [...section.map((p, k) => [k, 1]), ...section.slice(1, M).reverse().map((p) => [section.indexOf(p), -1])]
  const P = order.length

  const pos = []
  for (let i = 0; i <= N; i++) {
    const u = i / N
    const r = r0 + (R - r0) * u
    let c = (7.5 + 7 * smooth(0, 0.55, u)) * chordScale
    c *= 1 - 0.22 * smooth(0.5, 0.92, u)
    if (u > 0.9) {
      const q = (u - 0.9) / 0.1
      c *= Math.sqrt(Math.max(0.04, 1 - q * q * 0.96)) // round off the tip
    }
    const tmax = 0.3 - 0.24 * smooth(0, 0.5, u) - 0.01 * smooth(0.5, 1, u) // thick root, thin tip (fraction of chord)
    const beta = clamp(Math.atan(pitchIn / (2 * Math.PI * (r / 25.4))), 0.14, 0.7)
    const sb = Math.sin(beta)
    const cb = Math.cos(beta)
    const sweep = -sweepBack * u ** 2.2
    for (const [k, side] of order) {
      const s = section[k]
      const a = (pivot - s.x) * c // along the chord, positive toward the leading edge
      const b = (s.mid + side * s.half * tmax) * c
      const along = a * cb - b * sb + sweep
      const up = a * sb + b * cb
      pos.push(r, up, along * motion)
    }
  }

  const index = []
  for (let i = 0; i < N; i++) {
    for (let j = 0; j < P; j++) {
      const a = i * P + j
      const b = i * P + ((j + 1) % P)
      const c = (i + 1) * P + j
      const d = (i + 1) * P + ((j + 1) % P)
      if (motion > 0) index.push(a, c, b, b, c, d)
      else index.push(a, b, c, b, d, c)
    }
  }
  // close the tip with a fan
  let cx = 0, cy = 0, cz = 0
  for (let j = 0; j < P; j++) {
    const o = (N * P + j) * 3
    cx += pos[o]; cy += pos[o + 1]; cz += pos[o + 2]
  }
  const centre = pos.length / 3
  pos.push(cx / P, cy / P, cz / P)
  for (let j = 0; j < P; j++) {
    const a = N * P + j
    const b = N * P + ((j + 1) % P)
    if (motion > 0) index.push(a, b, centre)
    else index.push(a, centre, b)
  }

  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(index)
  g.computeVertexNormals()
  return g
}
