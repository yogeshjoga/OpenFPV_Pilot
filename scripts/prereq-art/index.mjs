// Draws the illustrations for the "Drone Build Prerequisites" cards. Run with: node scripts/prereq-art/index.mjs
// Each picture is written to public/images/parts/<name>.svg.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { tools } from './tools.mjs'
import { parts } from './parts.mjs'

const out = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'images', 'parts')
fs.mkdirSync(out, { recursive: true })
const all = { ...tools, ...parts }
let bytes = 0
for (const [name, draw] of Object.entries(all)) {
  const svg = draw()
  fs.writeFileSync(path.join(out, `${name}.svg`), svg)
  bytes += svg.length
}
console.log(`${Object.keys(all).length} pictures, ${(bytes / 1024).toFixed(0)} KB in total, ${(bytes / Object.keys(all).length / 1024).toFixed(1)} KB each`)
