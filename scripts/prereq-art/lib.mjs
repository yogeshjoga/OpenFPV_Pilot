// Drawing helpers for the build-prerequisite illustrations. Every picture is an 800 x 520 vector drawing of the part itself, in one flat style,
// with a few labelled callouts. The files are a few kilobytes each, so they load at once and stay sharp on any screen.

export const C = {
  ink: '#1f3a5f',
  navy: '#2b4c7e',
  steel: '#b6c0cc',
  steelD: '#7e8a99',
  steelL: '#dfe5ec',
  dark: '#262b33',
  dark2: '#3a414c',
  orange: '#ff6a1a',
  yellow: '#f2b705',
  red: '#d64545',
  blue: '#3e8ef7',
  green: '#2f9e6a',
  copper: '#c9793a',
  white: '#ffffff',
  paper: '#f6f3ec',
  amber: '#e8a317',
  teal: '#14b8a6',
  pcb: '#1d6b4f',
  pcbD: '#154d39',
  gold: '#d8b04a',
}

// the outline every shape gets, unless the shape sets its own (an attribute may appear only once in the file)
const OUTLINE = { stroke: C.ink, 'stroke-width': '3', 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }
const st = (extra) => Object.entries(OUTLINE).filter(([k]) => !new RegExp(`(^|\\s)${k}=`).test(extra)).map(([k, v]) => `${k}="${v}"`).join(' ')

/** A rectangle with rounded corners and an outline. */
export const rr = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${st(extra)} ${extra}/>`
/** A rectangle without an outline. */
export const rn = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" ${extra}/>`
export const ci = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${st(extra)} ${extra}/>`
export const cn = (cx, cy, r, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`
export const el = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${st(extra)} ${extra}/>`
export const pa = (d, fill = 'none', extra = '') => `<path d="${d}" fill="${fill}" ${st(extra)} ${extra}/>`
export const ln = (x1, y1, x2, y2, stroke = C.ink, w = 3, extra = '') => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`
export const wire = (d, color, w = 10) => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w + 4}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`
export const g = (transform, body) => `<g transform="${transform}">${body}</g>`
export const text = (x, y, content, size = 28, fill = C.ink, anchor = 'middle', extra = '') =>
  `<text x="${x}" y="${y}" font-family="ui-monospace,Consolas,monospace" font-weight="700" font-size="${size}" fill="${fill}" text-anchor="${anchor}" ${extra}>${content}</text>`

/**
 * A callout: a dot on the part at (px, py), a line to the words at (tx, ty).
 * `anchor` says which side of (tx, ty) the words sit on: 'start', 'middle' or 'end'.
 */
export const label = (px, py, tx0, ty, words, anchor = 'start') => {
  // keep the words inside the picture: about 13 units for each letter at this size
  const w = String(words).length * 13.2
  const tx = anchor === 'middle' ? Math.min(Math.max(tx0, 14 + w / 2), 786 - w / 2) : anchor === 'start' ? Math.min(tx0, 786 - w) : Math.max(tx0, 14 + w)
  return `<g>${ln(px, py, tx, py > ty ? ty + 18 : ty - 12, C.ink, 2.5)}${cn(px, py, 7, C.orange, `stroke="${C.white}" stroke-width="3"`)}<text x="${tx}" y="${ty + 10}" font-family="system-ui,Segoe UI,Arial,sans-serif" font-weight="700" font-size="25" fill="${C.ink}" text-anchor="${anchor}" stroke="${C.paper}" stroke-width="7" paint-order="stroke" stroke-linejoin="round">${words}</text></g>`
}

/** A soft backdrop so every part sits on the same quiet plate. */
const backdrop = `<circle cx="400" cy="250" r="226" fill="${C.white}" opacity="0.7"/><ellipse cx="400" cy="462" rx="260" ry="24" fill="#1b2430" opacity="0.08"/>`

export const art = (...body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520" role="img" aria-hidden="true">${backdrop}${body.join('')}</svg>\n`

/** Cross-hatch of a carbon-fibre weave inside a clip path. */
export const weave = (id, x, y, w, h) =>
  `<defs><pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#23272e"/><path d="M0 0h7v7H0zM7 7h7v7H7z" fill="#383e48"/></pattern></defs>`

export const zigzag = (x, y, w, h, n) => {
  const pts = []
  for (let i = 0; i <= n; i += 1) pts.push(`${x + (w * i) / n},${y + (i % 2 ? h : 0)}`)
  return `<polyline points="${pts.join(' ')}" fill="none" ${st("")}/>`
}
