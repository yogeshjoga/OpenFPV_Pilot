import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PREREQUISITES_DATA } from './prerequisites.js'

const parts = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'images', 'parts')
const items = PREREQUISITES_DATA.flatMap((c) => c.items)

test('there are 47 build prerequisite cards', () => {
  assert.equal(items.length, 47)
})

test('every card names its own picture, and no two cards share one', () => {
  const names = items.map((i) => i.art)
  assert.ok(names.every(Boolean), `missing: ${items.filter((i) => !i.art).map((i) => i.name).join(', ')}`)
  assert.equal(new Set(names).size, names.length, 'two cards use the same picture')
})

test('every picture exists, is a real SVG, and is small enough to load at once', () => {
  for (const item of items) {
    const file = path.join(parts, `${item.art}.svg`)
    assert.ok(fs.existsSync(file), `${item.name}: ${item.art}.svg is missing`)
    const svg = fs.readFileSync(file, 'utf8')
    assert.ok(svg.startsWith('<svg') && svg.trim().endsWith('</svg>'), `${item.art}.svg is not an SVG`)
    assert.ok(svg.length < 12 * 1024, `${item.art}.svg is ${svg.length} bytes`)
    // an attribute may appear once on an element, or the browser refuses the whole picture
    for (const tag of svg.match(/<[a-z][^>]*>/g) ?? []) {
      const names = [...tag.matchAll(/\s([a-z-]+)="/g)].map((m) => m[1])
      assert.equal(new Set(names).size, names.length, `${item.art}.svg repeats an attribute in ${tag.slice(0, 60)}`)
    }
  }
})
