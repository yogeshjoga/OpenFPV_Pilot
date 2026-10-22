import { PART_BY_ID } from './catalog.js'

/** The key of one connection point on the bench: a pad of one placed part. */
export const terminalKey = (nodeId, padId) => `${nodeId}:${padId}`

/**
 * Turns the placed parts and the wires between them into electrical nets: groups of pads that are joined together,
 * either by a wire or because they are the same copper on a board.
 *
 * `nodes`: [{ id, type }]   `wires`: [{ a: 'nodeId:padId', b: 'nodeId:padId' }]
 * Returns { nets, netOf(nodeId, padId) }. A net is { id, terminals: [{ nodeId, type, padId, pad }] }.
 */
export function buildNets(nodes, wires) {
  const terminals = []
  const indexOf = new Map()
  for (const node of nodes) {
    const part = PART_BY_ID[node.type]
    if (!part) continue
    for (const pad of part.pads) {
      indexOf.set(terminalKey(node.id, pad.id), terminals.length)
      terminals.push({ nodeId: node.id, type: node.type, padId: pad.id, pad })
    }
  }

  const parent = terminals.map((_, i) => i)
  const find = (i) => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]]
      i = parent[i]
    }
    return i
  }
  const union = (a, b) => {
    if (a === undefined || b === undefined) return
    parent[find(a)] = find(b)
  }

  for (const node of nodes) {
    const part = PART_BY_ID[node.type]
    if (!part) continue
    for (const group of part.internal) {
      const first = indexOf.get(terminalKey(node.id, group[0]))
      for (const padId of group.slice(1)) union(first, indexOf.get(terminalKey(node.id, padId)))
    }
  }
  for (const wire of wires) union(indexOf.get(wire.a), indexOf.get(wire.b))

  const byRoot = new Map()
  terminals.forEach((t, i) => {
    const root = find(i)
    if (!byRoot.has(root)) byRoot.set(root, { id: root, terminals: [] })
    byRoot.get(root).terminals.push(t)
  })
  const nets = [...byRoot.values()]
  const netOfIndex = new Map()
  for (const net of nets) for (const t of net.terminals) netOfIndex.set(terminalKey(t.nodeId, t.padId), net)

  return { nets, netOf: (nodeId, padId) => netOfIndex.get(terminalKey(nodeId, padId)) ?? null }
}
