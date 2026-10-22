import { PART_BY_ID } from './catalog.js'

/**
 * One row per placed part for the Wiring panel: how much of it is connected and whether it needs attention.
 *   status 'attention'  something is wired wrongly
 *          'open'       not finished yet (a loose wire, or nothing connected)
 *          'ok'         finished and nothing wrong
 *          'unchecked'  no report to judge by (manual mode before the check)
 * `connected` and `total` count the wires of a part that has leads (motor 2/3); `wires` counts the wires on a board.
 */
export function summarize(nodes, wires, report) {
  const touched = new Map()
  for (const w of wires) {
    for (const key of [w.a, w.b]) {
      const [nodeId, padId] = key.split(':')
      if (!touched.has(nodeId)) touched.set(nodeId, new Map())
      const pads = touched.get(nodeId)
      pads.set(padId, (pads.get(padId) ?? 0) + 1)
    }
  }
  return nodes.map((node) => {
    const part = PART_BY_ID[node.type]
    const pads = touched.get(node.id) ?? new Map()
    const leads = part.pads.filter((p) => p.lead)
    const hasLeads = leads.length > 0
    const connected = hasLeads ? leads.filter((p) => pads.has(p.id)).length : pads.size
    const total = hasLeads ? leads.length : null
    const wireCount = [...pads.values()].reduce((a, b) => a + b, 0)
    const notes = report ? report.items.filter((i) => i.kind !== 'ok' && i.nodes.includes(node.id)) : []
    const unfinished = hasLeads ? connected < total : connected === 0
    let status = 'unchecked'
    if (report) {
      if (notes.some((n) => n.kind === 'fault')) status = 'attention'
      else if (unfinished || notes.some((n) => n.kind === 'todo')) status = 'open'
      else status = 'ok'
    }
    return { id: node.id, type: node.type, name: part.name, connected, total, wires: wireCount, notes, status }
  })
}
