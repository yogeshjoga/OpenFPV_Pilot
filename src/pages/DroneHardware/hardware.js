// The numbers behind the Drone Hardware page: frames, vibration, motors and batteries, and radio.
// Pure functions, so they are tested. Each one is a textbook formula, kept simple enough to teach from.

const RAD = Math.PI / 180

// ---------------------------------------------------------------------------------------------------------------
// Frame: stiffness, weight and fibre direction
// ---------------------------------------------------------------------------------------------------------------

// E is Young's modulus in gigapascals: how stiff the material is. rho is the density in grams per cubic centimetre.
export const MATERIALS = {
  aluminium: { id: 'aluminium', name: 'Aluminium 6061', E: 69, rho: 2.7, color: '#8a94a3' },
  carbon: { id: 'carbon', name: 'Woven carbon plate (along the fibres)', E: 70, rho: 1.6, color: '#2b2f36' },
}

// A strip fixed at one end with a push F at the other: the tip moves F L^3 / (3 E I), and I = b t^3 / 12 for a strip b wide and t thick.
// Millimetres, newtons and gigapascals in; millimetres out.
export function beamDeflection({ E, t, b = 20, L = 100, F = 10 }) {
  const I = (b * t ** 3) / 12
  return (F * L ** 3) / (3 * E * 1000 * I)
}

// the mass of that strip, in grams
export const stripMass = ({ rho, t, b = 20, L = 100 }) => (rho * b * t * L) / 1000

// how many times stiffer a plate is when it is `ratio` times thicker
export const stiffnessFromThickness = (ratio) => ratio ** 3

// Woven carbon has fibres in two directions, 0 and 90 degrees. Pushed at an angle to the fibres, the stiffness follows the standard
// rotation formula. Along the fibres E1 = E2 = 70 GPa. Between them the plate depends on the weak shear stiffness G12 of the epoxy.
export function offAxisModulus(thetaDeg, { E1 = 70, E2 = 70, G12 = 5.45, nu12 = 0.05 } = {}) {
  const c = Math.cos(thetaDeg * RAD)
  const s = Math.sin(thetaDeg * RAD)
  const inverse = (c ** 4) / E1 + (1 / G12 - (2 * nu12) / E1) * s * s * c * c + (s ** 4) / E2
  return 1 / inverse
}

// A schematic stress and strain curve, to show the two kinds of failing. Strain is in percent, stress in megapascals.
// Aluminium: stiff, then it yields and keeps bending. Carbon: stiff all the way, then it snaps.
export const stressStrain = {
  aluminium: (strain) => (strain <= 0.4 ? 69000 * (strain / 100) : strain <= 12 ? 276 + 22 * (strain - 0.4) : 0), // yields near 276 MPa, hardens, then breaks
  carbon: (strain) => (strain <= 1.0 ? 70000 * (strain / 100) : 0), // straight up to about 700 MPa, then nothing
}

// ---------------------------------------------------------------------------------------------------------------
// Vibration: resonance, soft mounts and filters
// ---------------------------------------------------------------------------------------------------------------

// A mass on a spring pushed at a steady frequency. r is the push frequency divided by the natural frequency, zeta is the damping.
// The size of the shaking compared with a slow push: huge near r = 1 (resonance).
export const amplification = (r, zeta) => 1 / Math.sqrt((1 - r * r) ** 2 + (2 * zeta * r) ** 2)

// How much of a shake gets through a soft mount: more than 1 near resonance, under 1 only once r passes root two.
export const transmissibility = (r, zeta) => Math.sqrt((1 + (2 * zeta * r) ** 2) / ((1 - r * r) ** 2 + (2 * zeta * r) ** 2))

// Motor speed to shaking frequency: one shake per turn
export const rpmToHz = (rpm) => rpm / 60

// An arm with a motor on the end: the stiffness goes as thickness cubed, the mass mostly stays the motor's, so the natural frequency goes
// as thickness to the power 1.5. 260 Hz at 3 mm is a typical figure for a 5 inch frame, used here as an example.
export const armFrequency = (tMm) => 260 * (tMm / 3) ** 1.5

// A first-order low-pass filter (as in a gyro filter) delays a signal by about 1 / (2 pi fc) seconds
export const filterDelayMs = (cutoffHz) => 1000 / (2 * Math.PI * cutoffHz)

// ---------------------------------------------------------------------------------------------------------------
// Motors and batteries
// ---------------------------------------------------------------------------------------------------------------

export const CELL_VOLTS = 3.7 // nominal volts a LiPo cell gives, so 4S is 14.8 V and 6S is 22.2 V

// The motor wants to turn at KV times the volts, with no load. A propeller soaks up power with the cube of its speed, so
// compared with a 4S baseline, more volts means a lot more power and current. Relative numbers (baseline = 1).
export function motorLoad(cells, baselineCells = 4) {
  const volts = cells * CELL_VOLTS
  const speed = cells / baselineCells // the speed relative to the baseline
  const power = speed ** 3
  const current = power / speed // power is volts times current, and the volts rose by the same ratio as the speed
  const heat = current ** 2 // the heat in the windings goes as current squared
  return { volts, speed, power, current, heat }
}

export const noLoadRpm = (kv, cells) => kv * cells * CELL_VOLTS

// The six steps an ESC steps through to turn a three-wire motor, each one 60 electrical degrees. The two named coils carry the
// current: it flows in at the first and out at the second.
export const COMMUTATION = [
  { step: 1, from: 'A', to: 'B' },
  { step: 2, from: 'A', to: 'C' },
  { step: 3, from: 'B', to: 'C' },
  { step: 4, from: 'B', to: 'A' },
  { step: 5, from: 'C', to: 'A' },
  { step: 6, from: 'C', to: 'B' },
]
export const commutationStep = (electricalDeg) => Math.floor((((electricalDeg % 360) + 360) % 360) / 60)

// ---------------------------------------------------------------------------------------------------------------
// Radio
// ---------------------------------------------------------------------------------------------------------------

export const SPEED_OF_LIGHT = 299792458
export const wavelengthM = (hz) => SPEED_OF_LIGHT / hz

// Free-space path loss in decibels, with the distance in kilometres and the frequency in megahertz
export const pathLossDb = (km, mhz) => 20 * Math.log10(km) + 20 * Math.log10(mhz) + 32.44

export const dbmToMw = (dbm) => 10 ** (dbm / 10)
export const mwToDbm = (mw) => 10 * Math.log10(mw)

// the power that reaches the receiver, in dBm
export const receivedDbm = ({ txDbm, gainsDbi = 4, km, mhz }) => txDbm + gainsDbi - pathLossDb(km, mhz)

// the distance at which a link with this sensitivity runs out of signal, in kilometres
export const rangeKm = ({ txDbm, gainsDbi = 4, mhz, sensitivityDbm }) => 10 ** ((txDbm + gainsDbi - sensitivityDbm - 32.44 - 20 * Math.log10(mhz)) / 20)

// the noise from a receiver's own electronics: -174 dBm per hertz, plus 10 log10 of the bandwidth
export const noiseFloorDbm = (bandwidthHz, noiseFigureDb = 6) => -174 + 10 * Math.log10(bandwidthHz) + noiseFigureDb

// A small, repeatable random number generator, so the same noise shows every time the page is drawn
export function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function gaussian(random) {
  const u = Math.max(random(), 1e-12)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random())
}

// An in-place radix-2 FFT of separate real and imaginary arrays (length a power of two)
export function fft(re, im) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]] }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len
    const wr = Math.cos(angle)
    const wi = Math.sin(angle)
    for (let i = 0; i < n; i += len) {
      let cr = 1
      let ci = 0
      for (let k = 0; k < len / 2; k += 1) {
        const a = i + k
        const b = a + len / 2
        const tr = re[b] * cr - im[b] * ci
        const ti = re[b] * ci + im[b] * cr
        re[b] = re[a] - tr
        im[b] = im[a] - ti
        re[a] += tr
        im[a] += ti
        const next = cr * wr - ci * wi
        ci = cr * wi + ci * wr
        cr = next
      }
    }
  }
}

// A LoRa-style chirp: a tone whose frequency sweeps up across the whole band, with the start shifted by `symbol` steps
// (that shift is how the data is carried). n samples, so n possible symbols.
export function chirp(n, symbol = 0) {
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  for (let i = 0; i < n; i += 1) {
    const k = (i + symbol) % n
    const phase = Math.PI * (k * k) / n
    re[i] = Math.cos(phase)
    im[i] = Math.sin(phase)
  }
  return { re, im }
}

// Receive a chirp in noise. snrDb is the signal power against the noise power in the same band; it can be well below zero.
// The receiver multiplies by a chirp running the other way, which turns the signal into one steady tone, and an FFT then
// piles that tone into one bin, while the noise stays spread out. Returns the spectra before and after, and the peak.
export function receiveChirp({ n = 256, symbol = 37, snrDb = -10, seed = 7 } = {}) {
  const random = mulberry32(seed)
  const sig = chirp(n, symbol)
  const sigma = Math.sqrt(1 / 10 ** (snrDb / 10) / 2)
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  for (let i = 0; i < n; i += 1) {
    re[i] = sig.re[i] + sigma * gaussian(random)
    im[i] = sig.im[i] + sigma * gaussian(random)
  }
  const spectrum = (r, m) => {
    const a = Float64Array.from(r)
    const b = Float64Array.from(m)
    fft(a, b)
    return Array.from(a, (x, i) => Math.hypot(x, b[i]) / n)
  }
  const before = spectrum(re, im)
  // multiply by the conjugate of the plain chirp (symbol 0)
  const base = chirp(n, 0)
  const dr = new Float64Array(n)
  const di = new Float64Array(n)
  for (let i = 0; i < n; i += 1) {
    dr[i] = re[i] * base.re[i] + im[i] * base.im[i]
    di[i] = im[i] * base.re[i] - re[i] * base.im[i]
  }
  const after = spectrum(dr, di)
  let peak = 0
  for (let i = 1; i < n; i += 1) if (after[i] > after[peak]) peak = i
  const others = after.filter((_, i) => i !== peak)
  const noise = others.reduce((s, v) => s + v, 0) / others.length
  return { before, after, peak, symbol, peakToNoise: after[peak] / (noise || 1e-9), processingGainDb: 10 * Math.log10(n) }
}

// The shapes of a signal, drawn as points: the grid of a QAM constellation with `order` points (4, 16, 64, 256), each axis from -1 to 1
export function constellation(order) {
  const side = Math.sqrt(order)
  const levels = Array.from({ length: side }, (_, i) => (2 * i - (side - 1)) / (side - 1))
  const points = []
  for (const q of levels) for (const i of levels) points.push({ i, q })
  return points
}

// Send random symbols with this QAM, add noise at this SNR, and count the symbols decided wrongly. The average symbol power is
// normalised, so the same noise hurts a crowded constellation more.
export function symbolErrors({ order, snrDb, count = 4000, seed = 11 }) {
  const random = mulberry32(seed)
  const points = constellation(order)
  const power = points.reduce((s, p) => s + p.i * p.i + p.q * p.q, 0) / points.length
  const sigma = Math.sqrt(power / 10 ** (snrDb / 10) / 2)
  const side = Math.sqrt(order)
  const step = 2 / (side - 1)
  let wrong = 0
  const cloud = []
  for (let n = 0; n < count; n += 1) {
    const p = points[Math.floor(random() * points.length)]
    const ri = p.i + sigma * gaussian(random)
    const rq = p.q + sigma * gaussian(random)
    // the nearest grid point
    const di = Math.min(side - 1, Math.max(0, Math.round((ri + 1) / step)))
    const dq = Math.min(side - 1, Math.max(0, Math.round((rq + 1) / step)))
    const guess = { i: -1 + di * step, q: -1 + dq * step }
    if (Math.abs(guess.i - p.i) > 1e-9 || Math.abs(guess.q - p.q) > 1e-9) wrong += 1
    if (cloud.length < 500) cloud.push({ i: ri, q: rq })
  }
  return { rate: wrong / count, cloud }
}

// the most crowded constellation that still works (under the error rate) at this SNR, like Wi-Fi falling back to a slower code
export function bestOrder(snrDb, maxRate = 0.05) {
  let best = 4
  for (const order of [4, 16, 64, 256]) if (symbolErrors({ order, snrDb, count: 1500 }).rate <= maxRate) best = order
  return best
}
