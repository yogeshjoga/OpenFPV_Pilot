import { PART_BY_ID, exitOf, onFace, padAt, padOf } from './catalog.js'
import { padTip, wireTip } from './tips.js'
import { withMotorTurns } from './placement.js'

/** Wires are drawn above every part, so they are never hidden behind a board. */
export const WIRE_LAYER = 2000

// The bench model (what is saved) <-> what React Flow draws

/**
 * Colour and thickness of a wire: that of the lead it starts from, else a plain signal wire.
 * Also which way it leaves each end (it depends on which side of the part is up), and whether an end is on the side
 * of a part that is facing away, which draws the wire faded and dashed.
 * `nodesById` maps an id to { id, type, flip? }.
 */
export function lookOf(nodesById, a, b, seed = 0) {
  const info = (key) => {
    const [nodeId, padId] = key.split(':')
    const node = nodesById.get(nodeId)
    const pad = node && padOf(node.type, padId)
    return { node, pad, padId }
  }
  const ends = [info(a), info(b)]
  const route = ({ node, padId }) => (node ? exitOf(node.type, padId, !!node.flip, node.turn ?? 0) : 'bottom')
  const hidden = ends.some(({ node, pad }) => node && pad && !onFace(pad, !!node.flip))
  // which place in the row of pads on its side this pad has: wires from neighbouring pads take their own lane
  const lane = ({ node, pad }) => {
    if (!node || !pad) return 0
    const part = PART_BY_ID[node.type]
    const flip = !!node.flip
    const turn = node.turn ?? 0
    const side = exitOf(node.type, pad.id, flip, turn)
    const along = (p) => {
      const at = padAt(part, p, flip, turn)
      return side === 'top' || side === 'bottom' ? at.x : at.y
    }
    const same = part.pads.filter((p) => onFace(p, flip) && exitOf(node.type, p.id, flip, turn) === side).sort((p, q) => along(p) - along(q))
    return Math.max(0, same.findIndex((p) => p.id === pad.id))
  }
  const describe = ({ node, pad }) => {
    if (!node || !pad) return null
    const part = PART_BY_ID[node.type]
    const tip = padTip(part, pad)
    // a battery or capacitor lead is best named by what it is ("Battery + (red lead)"); a pad by its printed name
    return { padLabel: pad.role ? tip.title : pad.label, partName: part.name, tip }
  }
  const [from, to] = ends.map(describe)
  const look = { color: '#e5b82a', gauge: 3.6, from: route(ends[0]), to: route(ends[1]), seed, lane: lane(ends[0]), hidden, tip: from && to ? wireTip(from, to) : null }
  for (const { pad } of ends) {
    if (pad?.lead) return { ...look, color: pad.lead.color, gauge: pad.lead.gauge }
  }
  return look
}

export const toFlowNodes = (nodes, deletable) =>
  nodes.map((n) => ({ id: n.id, type: 'part', position: { x: n.x, y: n.y }, data: { type: n.type, flip: !!n.flip, ...(n.turn ? { turn: n.turn } : {}) }, deletable }))

/** A saved model as the flow wants it: the nodes with each motor turned to face its ESC, and the wires drawn for that. */
export function flowFromModel(nodes, wires, deletable) {
  const flow = withMotorTurns(toFlowNodes(nodes, deletable))
  const turned = nodes.map((n) => ({ ...n, turn: flow.find((f) => f.id === n.id)?.data.turn }))
  return { nodes: flow, edges: toFlowEdges(turned, wires) }
}

export const toFlowEdges = (nodes, wires) => {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  return wires.map((w, i) => {
    const [source, sourceHandle] = w.a.split(':')
    const [target, targetHandle] = w.b.split(':')
    return { id: w.id, source, sourceHandle, target, targetHandle, type: 'wire', zIndex: WIRE_LAYER, data: lookOf(byId, w.a, w.b, i) }
  })
}

/** The wires again, drawn for the way each part is now facing. Used after a part is turned over. */
export const redrawEdges = (flowNodes, edges) => {
  const byId = new Map(flowNodes.map((n) => [n.id, { id: n.id, type: n.data.type, flip: n.data.flip, turn: n.data.turn }]))
  return edges.map((e, i) => ({ ...e, data: { ...e.data, ...lookOf(byId, `${e.source}:${e.sourceHandle}`, `${e.target}:${e.targetHandle}`, e.data?.seed ?? i) } }))
}

export const fromFlow = (nodes, edges) => ({
  nodes: nodes.map((n) => ({ id: n.id, type: n.data.type, x: Math.round(n.position.x), y: Math.round(n.position.y), ...(n.data.flip ? { flip: true } : {}) })),
  wires: edges.map((e) => ({ id: e.id, a: `${e.source}:${e.sourceHandle}`, b: `${e.target}:${e.targetHandle}` })),
})

/** Gives every placed part a name for the bench: the part's name, numbered when there are several of the same kind. */
export function labelNodes(nodes, nameOf) {
  const total = {}
  for (const n of nodes) total[n.data.type] = (total[n.data.type] ?? 0) + 1
  const seen = {}
  return nodes.map((n) => {
    seen[n.data.type] = (seen[n.data.type] ?? 0) + 1
    const name = nameOf(n.data.type)
    return { ...n, data: { ...n.data, label: total[n.data.type] > 1 ? `${name} ${seen[n.data.type]}` : name } }
  })
}
