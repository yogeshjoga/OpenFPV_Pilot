// Drawing the air like a CFD picture: streamline trails coloured by speed, and flat slices painted with speed or pressure.
// The flow itself comes from flow.js. These helpers take { THREE } like the scenes do.
import { pressureColor, speedColor } from './flow.js'

/**
 * Many short trails that follow the air. Each one is a particle that is carried by the flow, with its last `length` positions drawn as a
 * line that fades towards the tail and is coloured by the speed of the air.
 * field(out, x, y, z) fills out with the velocity (m/s) and returns the speed. spawn(index, out) puts a new particle at out = [x, y, z].
 * keep(x, y, z) says whether a particle may stay. mmPerSecond is how many millimetres a particle moves each second for 1 m/s of air.
 */
export function makeStreamlines(THREE, { count, length = 26, field, spawn, keep, mmPerSecond = 18, life = 4, floorY = 1.5 }) {
  const trail = new Float32Array(count * length * 3)
  const speeds = new Float32Array(count * length)
  const ages = new Float32Array(count)
  const segments = count * (length - 1)
  const geo = new THREE.BufferGeometry()
  const position = new THREE.BufferAttribute(new Float32Array(segments * 2 * 3), 3)
  const color = new THREE.BufferAttribute(new Float32Array(segments * 2 * 4), 4)
  geo.setAttribute('position', position)
  geo.setAttribute('color', color)
  const material = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false })
  const lines = new THREE.LineSegments(geo, material)
  lines.frustumCulled = false
  lines.renderOrder = 4
  const v = [0, 0, 0]
  const p = [0, 0, 0]
  const rgb = [0, 0, 0]
  const TICK = 1 / 40
  const step = new Float32Array(count * 3) // how far each particle moved in its last step
  const drawn = new Float32Array(length * 3)
  let clock = 0
  const fades = Float32Array.from({ length }, (_, k) => (1 - k / (length - 1)) ** 1.3)

  const place = (i) => {
    spawn(i, p)
    const base = i * length * 3
    for (let j = 0; j < length; j += 1) {
      trail[base + j * 3] = p[0]
      trail[base + j * 3 + 1] = p[1]
      trail[base + j * 3 + 2] = p[2]
      speeds[i * length + j] = 0
    }
    step[i * 3] = step[i * 3 + 1] = step[i * 3 + 2] = 0
  }
  for (let i = 0; i < count; i += 1) { place(i); ages[i] = Math.random() * life }

  return {
    object: lines,
    /** Moves the particles on by `dt` seconds and redraws the trails. `speedMax` (m/s) is the speed drawn as red. */
    update(dt, speedMax) {
      // The particles are moved in small fixed steps, so a trail is the same length however fast the screen draws. What is drawn is
      // blended between one step and the next, so the motion is smooth at any frame rate.
      clock = Math.min(clock + dt, TICK * 8)
      let ticks = 0
      while (clock >= TICK) { clock -= TICK; ticks += 1 }
      const phase = clock / TICK
      const h = TICK * mmPerSecond
      for (let i = 0; i < count; i += 1) {
        const base = i * length * 3
        for (let t = 0; t < ticks; t += 1) {
          let x = trail[base]
          let y = trail[base + 1]
          let z = trail[base + 2]
          const speed = field(v, x, y, z)
          let dx = v[0] * h
          let dy = v[1] * h
          const dz = v[2] * h
          x += dx
          y += dy
          z += dz
          if (y < floorY) { dy += floorY - y; y = floorY }
          ages[i] += TICK
          if (ages[i] > life || !keep(x, y, z)) { place(i); ages[i] = 0; break }
          trail.copyWithin(base + 3, base, base + (length - 1) * 3)
          speeds.copyWithin(i * length + 1, i * length, i * length + length - 1)
          trail[base] = x
          trail[base + 1] = y
          trail[base + 2] = z
          speeds[i * length] = speed
          step[i * 3] = dx
          step[i * 3 + 1] = dy
          step[i * 3 + 2] = dz
        }
      }
      let a = 0
      let c = 0
      const inverse = 1 / speedMax
      for (let i = 0; i < count; i += 1) {
        const base = i * length * 3
        // where each point of the trail is drawn: the head runs on ahead by the part of a step that has passed, and every other point
        // slides towards the place of the point in front of it
        drawn[0] = trail[base] + step[i * 3] * phase
        drawn[1] = trail[base + 1] + step[i * 3 + 1] * phase
        drawn[2] = trail[base + 2] + step[i * 3 + 2] * phase
        for (let k = 1; k < length; k += 1) {
          const o = base + k * 3
          drawn[k * 3] = trail[o] + (trail[o - 3] - trail[o]) * phase
          drawn[k * 3 + 1] = trail[o + 1] + (trail[o - 2] - trail[o + 1]) * phase
          drawn[k * 3 + 2] = trail[o + 2] + (trail[o - 1] - trail[o + 2]) * phase
        }
        // a new particle starts as a dot and grows into a trail, and an old one fades out
        const life01 = Math.min(1, ages[i] / 0.4) * Math.max(0, Math.min(1, (life - ages[i]) / 0.5)) * 0.95
        for (let j = 0; j < length - 1; j += 1) {
          for (let end = 0; end < 2; end += 1) {
            const k = j + end
            position.array[a++] = drawn[k * 3]
            position.array[a++] = drawn[k * 3 + 1]
            position.array[a++] = drawn[k * 3 + 2]
            speedColor(speeds[i * length + k] * inverse, rgb)
            const fade = fades[k]
            color.array[c++] = rgb[0] + (1 - rgb[0]) * 0.28 // a little lighter than the cloud, so the lines stand out
            color.array[c++] = rgb[1] + (1 - rgb[1]) * 0.28
            color.array[c++] = rgb[2] + (1 - rgb[2]) * 0.28
            color.array[c++] = life01 * fade
          }
        }
      }
      position.needsUpdate = true
      color.needsUpdate = true
    },
    dispose() { geo.dispose(); material.dispose() },
  }
}

/**
 * A flat sheet painted with a colour map: a slice through the air. `plane` is the size of the sheet in millimetres.
 * paint(a, b) gets the position on the sheet (a to the right, b upwards, from the middle) and returns [r, g, b, alpha] with 0 to 1 values.
 */
export function makeSlice(THREE, { width, height, res = 96 }) {
  const cols = res
  const rows = Math.max(8, Math.round((res * height) / width))
  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  const g = canvas.getContext('2d')
  const image = g.createImageData(cols, rows)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.magFilter = THREE.LinearFilter
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide })
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material)
  mesh.renderOrder = 2
  return {
    mesh,
    paint(colorAt) {
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const a = ((col + 0.5) / cols - 0.5) * width
          const b = (0.5 - (row + 0.5) / rows) * height
          const c = colorAt(a, b)
          const o = (row * cols + col) * 4
          image.data[o] = c[0] * 255
          image.data[o + 1] = c[1] * 255
          image.data[o + 2] = c[2] * 255
          image.data[o + 3] = c[3] * 255
        }
      }
      g.putImageData(image, 0, 0)
      texture.needsUpdate = true
    },
    dispose() { mesh.geometry.dispose(); texture.dispose(); material.dispose() },
  }
}

// colour for a slice by speed: dim where the air is still, brighter as it speeds up
export function speedPixel(speed, speedMax, out = [0, 0, 0, 0]) {
  const t = Math.min(1, speed / speedMax)
  speedColor(t, out)
  out[3] = 0.12 + 0.3 * Math.min(1, t * 1.4)
  return out
}

// colour for a slice by pressure: blue is suction, red is push, nothing where the air is at room pressure
export function pressurePixel(pressure, pressureMax, out = [0, 0, 0, 0]) {
  return pressureColor(pressure / pressureMax, out)
}

/**
 * A 3D cloud of soft points that fills a box of air. Where the quantity is strong there are more points, and they are coloured by it,
 * so the whole volume of the flow can be seen from any side, not just a flat slice of it.
 * fill(min, max, sample): sample(x, y, z, rgba) puts a colour in rgba and returns how likely a point is to be placed there (0 to 1).
 */
export function makeCloud(THREE, { count = 7000, size = 11 }) {
  const position = new THREE.BufferAttribute(new Float32Array(count * 3), 3)
  const color = new THREE.BufferAttribute(new Float32Array(count * 4), 4)
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', position)
  geo.setAttribute('color', color)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 64
  const g = canvas.getContext('2d')
  const glow = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  glow.addColorStop(0, 'rgba(255,255,255,1)')
  glow.addColorStop(0.5, 'rgba(255,255,255,0.45)')
  glow.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = glow
  g.fillRect(0, 0, 64, 64)
  const sprite = new THREE.CanvasTexture(canvas)
  const material = new THREE.PointsMaterial({ size, sizeAttenuation: true, map: sprite, vertexColors: true, transparent: true, depthWrite: false })
  const points = new THREE.Points(geo, material)
  points.frustumCulled = false
  points.renderOrder = 1
  const rgba = [0, 0, 0, 0]
  let seed = 1
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
  return {
    object: points,
    fill(min, max, sample) {
      seed = 12345 // the same points every time, so the picture does not flicker as a slider moves
      let placed = 0
      for (let tries = 0; placed < count && tries < count * 60; tries += 1) {
        const x = min[0] + random() * (max[0] - min[0])
        const y = min[1] + random() * (max[1] - min[1])
        const z = min[2] + random() * (max[2] - min[2])
        const chance = sample(x, y, z, rgba)
        if (random() < chance) {
          position.setXYZ(placed, x, y, z)
          color.setXYZW(placed, rgba[0], rgba[1], rgba[2], rgba[3])
          placed += 1
        }
      }
      for (; placed < count; placed += 1) color.setXYZW(placed, 0, 0, 0, 0)
      position.needsUpdate = true
      color.needsUpdate = true
    },
    dispose() { geo.dispose(); material.dispose(); sprite.dispose() },
  }
}

// no points at all where the air is hardly disturbed, then more and more as the effect grows
export const thresholded = (t) => Math.min(1, Math.max(0, (t - 0.2) / 0.55) ** 1.1)

// ready-made samples for makeCloud: how likely a point is, and its colour, for a speed or a pressure
export function speedSample(speed, speedMax, out) {
  const t = Math.min(1, speed / speedMax)
  speedColor(t, out)
  out[3] = 0.55
  return thresholded(t)
}

export function pressureSample(pressure, pressureMax, out) {
  const t = Math.max(-1, Math.min(1, pressure / pressureMax))
  pressureColor(t, out)
  out[3] = 0.55
  return thresholded(Math.abs(t))
}
