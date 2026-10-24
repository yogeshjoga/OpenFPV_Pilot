import { useEffect, useRef } from 'react'
import useUIStore from '@store/useUIStore'

// A fixed curve (x against y) on a canvas, with optional vertical markers and a dot for the value the student picked.
// curves: [{ xs, ys, color, label, width, dash }]   markers: [{ x, label, color, row }]   dot: { x, y, color }

const niceStep = (span) => {
  const raw = span / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const n = raw / mag
  return (n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10) * mag
}
const fmt = (v) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2).replace(/\.?0+$/, ''))
const token = (el, name, fallback) => getComputedStyle(el).getPropertyValue(name).trim() || fallback

// round a maximum up to a tidy axis end
export function niceMax(v) {
  if (!(v > 0)) return 1
  const mag = 10 ** Math.floor(Math.log10(v))
  const n = v / mag
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * mag
}

export default function CurveChart({ curves, xMax, yMax, markers = [], dot = null, xLabel = '', label, className }) {
  const ref = useRef(null)
  const theme = useUIStore((s) => s.theme)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return undefined
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
      const g = canvas.getContext('2d')
      const ink = token(canvas, '--color-text-secondary', '#55606e')
      const faint = token(canvas, '--color-border', '#e4ddd0')
      const strong = token(canvas, '--color-text-primary', '#1b2430')
      g.clearRect(0, 0, w, h)
      g.font = `${11 * dpr}px ui-monospace, Consolas, monospace`

      // the legend wraps onto more rows when the labels do not fit on one
      const L = 40 * dpr, R = 12 * dpr, B = 38 * dpr
      const legend = []
      let rows = 0
      let lx = L
      for (const c of curves) {
        if (!c.label) continue
        const width = g.measureText(c.label).width + 30 * dpr
        if (lx + width > w - R && lx > L) { rows += 1; lx = L }
        legend.push({ c, x: lx, row: rows })
        lx += width
      }
      const T = (12 + 16 * (rows + 1)) * dpr
      const X = (x) => L + (x / xMax) * (w - L - R)
      const Y = (y) => T + (1 - y / yMax) * (h - T - B)

      g.lineWidth = dpr
      g.strokeStyle = faint
      g.fillStyle = ink
      g.textAlign = 'right'
      const ys = niceStep(yMax)
      for (let v = 0; v <= yMax + 1e-9; v += ys) {
        g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(w - R, Y(v)); g.stroke()
        g.fillText(fmt(v), L - 6 * dpr, Y(v) + 4 * dpr)
      }
      g.textAlign = 'center'
      const xs = niceStep(xMax)
      for (let v = 0; v <= xMax + 1e-9; v += xs) {
        g.beginPath(); g.moveTo(X(v), T); g.lineTo(X(v), h - B); g.stroke()
        g.fillText(fmt(v), X(v), h - B + 15 * dpr)
      }
      if (xLabel) {
        g.textAlign = 'right'
        g.fillText(xLabel, w - R, h - 6 * dpr)
      }
      for (const m of markers) {
        g.strokeStyle = m.color
        g.setLineDash([4 * dpr, 3 * dpr])
        g.beginPath(); g.moveTo(X(m.x), T); g.lineTo(X(m.x), h - B); g.stroke()
        g.setLineDash([])
        g.fillStyle = m.color
        g.textAlign = X(m.x) > w * 0.7 ? 'right' : 'left'
        g.fillText(m.label, X(m.x) + (g.textAlign === 'right' ? -4 : 4) * dpr, T + (13 + 14 * (m.row || 0)) * dpr)
      }
      for (const c of curves) {
        g.strokeStyle = c.color
        g.lineWidth = (c.width || 2) * dpr
        g.setLineDash(c.dash ? c.dash.map((d) => d * dpr) : [])
        g.beginPath()
        c.xs.forEach((x, i) => {
          const px = X(x)
          const py = Y(Math.min(c.ys[i], yMax * 1.02))
          if (i === 0) g.moveTo(px, py); else g.lineTo(px, py)
        })
        g.stroke()
      }
      g.setLineDash([])
      if (dot) {
        g.fillStyle = dot.color || strong
        g.beginPath(); g.arc(X(dot.x), Y(dot.y), 5.5 * dpr, 0, Math.PI * 2); g.fill()
        g.strokeStyle = strong; g.lineWidth = 1.5 * dpr; g.stroke()
      }
      g.textAlign = 'left'
      for (const { c, x, row } of legend) {
        g.fillStyle = c.color
        g.fillRect(x, (8 + 16 * row) * dpr, 9 * dpr, 9 * dpr)
        g.fillStyle = strong
        g.fillText(c.label, x + 13 * dpr, (16 + 16 * row) * dpr)
      }
    }
    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [curves, xMax, yMax, markers, dot, xLabel, theme])

  return <canvas ref={ref} className={className} role="img" aria-label={label} />
}
