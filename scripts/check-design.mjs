// Fails when off-scale values creep back in. Run with: npm run check:design
//
// Rules (see src/styles/tokens.css for the scale):
//   - font sizes, spacing and radii come from tokens, never px/rem literals
//   - font weights come from tokens
//   - uppercase only on 12px labels
//   - no backdrop blur, gradient text or the retired cyan/purple brand colours
//   - no colourful emoji in UI code
//   - inline styles follow the same size/spacing/radius rules
//
// Files that draw their own artwork are listed in ALLOW and skipped on purpose.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src')

const ALLOW = [
  'Certificate', // printed document with its own typography
  'Simulator/components/Nodes.jsx', // wiring-sim parts are colour-coded
  'Assembly3D/components/DroneScene.jsx', // 3D scene
  'Presentation/index.jsx', // slide decks carry their own colours
  'components/three/', // 3D materials
]
const skip = (file) => ALLOW.some((a) => file.replaceAll('\\', '/').includes(a))

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })

const files = walk(SRC)
const cssFiles = files.filter((f) => f.endsWith('.css') && !skip(f))
const codeFiles = files.filter((f) => /\.(jsx|js)$/.test(f) && !skip(f) && !/inject|test_|parse_/.test(f))

const problems = []
const report = (file, line, msg) => problems.push(`${path.relative(SRC, file).replaceAll('\\', '/')}:${line}  ${msg}`)

const toPx = (num, unit) => parseFloat(num) * (unit === 'rem' ? 16 : 1)
const SPACING = /^(padding|margin|gap|row-gap|column-gap)(-(top|right|bottom|left|inline|block|inline-start|inline-end|block-start|block-end))?$/
const RADIUS = /^border(-(top|bottom|start|end)-(left|right|start|end))?-radius$/

const tokensFile = path.join(SRC, 'styles', 'tokens.css')

for (const file of cssFiles) {
  if (file === tokensFile || file.endsWith(path.join('styles', 'globals.css'))) continue
  const text = fs.readFileSync(file, 'utf8')
  const lineOf = (index) => text.slice(0, index).split('\n').length

  for (const block of text.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const body = block[2]
    const start = block.index + block[1].length + 1
    const decls = [...body.matchAll(/(?:^|;|\n)\s*([-\w]+)\s*:\s*([^;]+?)\s*(?=;|$)/g)].map((m) => ({
      prop: m[1],
      value: m[2],
      line: lineOf(start + m.index),
    }))
    const get = (p) => decls.find((d) => d.prop === p)?.value

    for (const { prop, value, line } of decls) {
      if (prop === 'font-size' && /^[\d.]+(px|rem)\b/.test(value)) report(file, line, `font-size ${value} is not a token`)
      if (prop === 'font-weight' && !value.startsWith('var(') && value !== 'inherit') report(file, line, `font-weight ${value} is not a token`)
      if (prop === 'font-family' && !/var\(--font-|inherit/.test(value)) report(file, line, `font-family ${value} is not a token`)
      if (SPACING.test(prop)) {
        for (const part of value.split(/\s+(?![^(]*\))/)) {
          const m = part.match(/^(\d*\.?\d+)(px|rem)$/)
          if (m && toPx(m[1], m[2]) >= 4) report(file, line, `${prop} ${part} is not a token`)
        }
      }
      if (RADIUS.test(prop)) {
        for (const part of value.split(/\s+/)) {
          const m = part.match(/^(\d*\.?\d+)(px|rem)$/)
          if (m && toPx(m[1], m[2]) > 3) report(file, line, `${prop} ${part} is not a token`)
        }
      }
      if (prop === 'backdrop-filter' || prop === '-webkit-backdrop-filter') report(file, line, 'backdrop blur is not part of the style')
      if (/background-clip/.test(prop) && value === 'text') report(file, line, 'gradient text is not part of the style')
      if (prop === 'text-transform' && value === 'uppercase' && get('font-size') !== 'var(--text-xs)') {
        report(file, line, 'uppercase is only for 12px labels')
      }
      if (/0,\s*212,\s*255|124,\s*58,\s*237|#00d4ff|#7c3aed/i.test(value)) report(file, line, `retired brand colour in ${prop}`)
    }
  }
}

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2728}✅❌]️?/gu
const SYMBOLS_OK = new Set(['✓', '★', '☆', '✕', '◇', '□', '◎', '◈', '⊡', '◉', '▸'])
const INLINE_SIZE = /\b(fontSize|borderRadius|padding|margin|gap|rowGap|columnGap|marginTop|marginBottom|marginLeft|marginRight|paddingTop|paddingBottom|paddingLeft|paddingRight):\s*('[^']*'|"[^"]*"|\d+(?:\.\d+)?)/g

for (const file of codeFiles) {
  const text = fs.readFileSync(file, 'utf8')
  const lineOf = (index) => text.slice(0, index).split('\n').length

  for (const m of text.matchAll(EMOJI)) {
    if (!SYMBOLS_OK.has(m[0].replace('️', ''))) report(file, lineOf(m.index), `emoji ${m[0]} in UI code`)
  }

  for (const block of text.matchAll(/style=\{\{(.*?)\}\}/gs)) {
    for (const m of block[1].matchAll(INLINE_SIZE)) {
      const raw = m[2].replace(/^['"]|['"]$/g, '')
      if (raw.startsWith('var(')) continue
      const hasSize = raw.split(/\s+/).some((p) => {
        const px = p.match(/^(\d*\.?\d+)(px|rem)?$/)
        if (!px) return false
        const v = toPx(px[1], px[2])
        return m[1] === 'fontSize' ? true : m[1] === 'borderRadius' ? v > 3 : v >= 4
      })
      if (hasSize) report(file, lineOf(block.index + m.index), `inline ${m[1]}: ${raw} is not a token`)
    }
    for (const m of block[1].matchAll(/#[0-9a-fA-F]{3,6}\b/g)) {
      report(file, lineOf(block.index + m.index), `inline colour ${m[0]} is not a token`)
    }
  }
}

if (problems.length) {
  console.error(`Design check failed: ${problems.length} problem(s)\n`)
  console.error(problems.slice(0, 80).join('\n'))
  if (problems.length > 80) console.error(`… and ${problems.length - 80} more`)
  process.exit(1)
}
console.log(`Design check passed (${cssFiles.length} stylesheets, ${codeFiles.length} code files).`)
