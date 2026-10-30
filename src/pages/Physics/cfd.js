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
  const TICK = 1 / 45
  let clock = 0

  const place = (i) => {
    spawn(i, p)
    const base = i * length * 3
    for (let j = 0; j < length; j += 1) {
      trail[base + j * 3] = p[0]
      trail[base + j * 3 + 1] = p[1]
      trail[base + j * 3 + 2] = p[2]
      speeds[i * length + j] = 0
    }
  }
  for (let i = 0; i < count; i += 1) { place(i); ages[i] = Math.random() * life }

  return {
    object: lines,
    /** Moves the particles on by `dt` seconds and redraws the trails. `speedMax` (m/s) is the speed drawn as red. */
    update(dt, speedMax) {
      // the particles move in small fixed steps, so a trail is the same length however fast the screen draws
      clock = Math.min(clock + dt, TICK * 4)
      let ticks = 0
      while (clock >= TICK) { clock -= TICK; ticks += 1 }
      const h = TICK * mmPerSecond
      for (let i = 0; i < count; i += 1) {
        const base = i * length * 3
        for (let t = 0; t < ticks; t += 1) {
          let x = trail[base]
          let y = trail[base + 1]
          let z = trail[base + 2]
          const speed = field(v, x, y, z)
          x += v[0] * h
          y += v[1] * h
          z += v[2] * h
          if (y < floorY) y = floorY
          ages[i] += TICK
          if (ages[i] > life || !keep(x, y, z)) { place(i); ages[i] = 0; break }
          trail.copyWithin(base + 3, base, base + (length - 1) * 3)
          speeds.copyWithin(i * length + 1, i * length, i * length + length - 1)
          trail[base] = x
          trail[base + 1] = y
          trail[base + 2] = z
          speeds[i * length] = speed
        }
      }
      let a = 0
      let c = 0
      for (let i = 0; i < count; i += 1) {
        const base = i * length * 3
        // a new particle starts as a dot and grows into a trail, and an old one fades out
        const born = Math.min(1, ages[i] / 0.4)
        const dying = Math.min(1, (life - ages[i]) / 0.5)
        for (let j = 0; j < length - 1; j += 1) {
          for (let end = 0; end < 2; end += 1) {
            const k = j + end
            position.array[a++] = trail[base + k * 3]
            position.array[a++] = trail[base + k * 3 + 1]
            position.array[a++] = trail[base + k * 3 + 2]
            speedColor(speeds[i * length + k] / speedMax, rgb)
            for (let q = 0; q < 3; q += 1) rgb[q] += (1 - rgb[q]) * 0.12 // a little lighter than the slice, so the lines stand out
            const fade = (1 - k / (length - 1)) ** 1.3
            color.array[c++] = rgb[0]
            color.array[c++] = rgb[1]
            color.array[c++] = rgb[2]
            color.array[c++] = 0.95 * fade * born * Math.max(0, dying)
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
