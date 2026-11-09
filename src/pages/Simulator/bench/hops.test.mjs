import { test } from 'node:test'
import assert from 'node:assert/strict'
import { HOP, cross, hopPath, hopsOver } from './hops.js'

// a wire as a polyline with a point every 2 px
const line = (x1, y1, x2, y2) => {
  const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 2)
  return Array.from({ length: n + 1 }, (_, i) => [x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n])
}

test('two segments that cross are found where they cross', () => {
  const c = cross([0, 0], [10, 0], [5, -5], [5, 5])
  assert.deepEqual([c.x, c.y], [5, 0])
  assert.equal(cross([0, 0], [10, 0], [0, 5], [10, 5]), null, 'parallel')
  assert.equal(cross([0, 0], [10, 0], [20, -5], [20, 5]), null, 'too far')
})

test('the sideways wire hops over the up and down wire', () => {
  const sideways = line(0, 50, 100, 50)
  const upDown = line(50, 0, 50, 100)
  const hops = hopsOver(sideways, [upDown])
  assert.equal(hops.length, 1)
  assert.ok(Math.abs(hops[0].x - 50) < 0.1 && Math.abs(hops[0].y - 50) < 0.1)
  assert.deepEqual(hopsOver(upDown, [sideways]), [], 'the up and down wire does not hop')
})

test('a crossing near the end of a wire, or at a corner, is not a hop', () => {
  assert.deepEqual(hopsOver(line(0, 50, 100, 50), [line(3, 0, 3, 100)]), [])
  const corner = [...line(0, 50, 50, 50), ...line(50, 50, 50, 120)]
  assert.deepEqual(hopsOver(corner, [line(48, 0, 48, 100)]), [])
})

test('the hop is a small arc over the crossing, and the path goes on to the end', () => {
  const sideways = line(0, 50, 100, 50)
  const hops = hopsOver(sideways, [line(50, 0, 50, 100)])
  const path = hopPath(sideways, hops)
  assert.match(path, new RegExp(`A ${HOP} ${HOP} 0 0 1 `), 'left to right goes clockwise over the top')
  assert.ok(path.endsWith('L 100 50'))
  const back = [...sideways].reverse()
  assert.match(hopPath(back, hopsOver(back, [line(50, 0, 50, 100)])), new RegExp(`A ${HOP} ${HOP} 0 0 0 `), 'right to left goes anticlockwise over the top')
  assert.equal(hopPath(sideways, []).startsWith('M 0 50 L'), true)
})

test('two crossings side by side make one hop, and far apart make two', () => {
  const sideways = line(0, 50, 200, 50)
  assert.equal(hopsOver(sideways, [line(80, 0, 80, 100), line(85, 0, 85, 100)]).length, 1)
  assert.equal(hopsOver(sideways, [line(60, 0, 60, 100), line(140, 0, 140, 100)]).length, 2)
})
