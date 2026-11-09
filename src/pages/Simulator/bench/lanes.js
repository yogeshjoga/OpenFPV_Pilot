// Where each wire runs, so that no two wires lie on top of each other. Plain functions, no React.
//
// Two things make wires overlap: several wires on one pad (the battery lead and the capacitor leg on BAT+) leave it along the
// same line, and wires with a similar route use the same corridor between the parts. So every wire gets
//   a slot at each pad it is on: wires on one pad fan out side by side, SLOT apart;
//   a corridor of its own: the middle stretch of the wire is moved aside by a different amount for each wire.

/** The distance between two neighbouring wires, in pixels of the canvas. */
export const SLOT = 14

/** How far to move the wire at index `index` of `count` wires that share a pad, so that the group is centred on the pad. */
export const slotShift = (index, count) => (index - (count - 1) / 2) * SLOT

/** The place of one wire among the wires on one pad: { index, count }. `edges` are the flow edges. */
export function slotOf(edges, id, nodeId, handleId) {
  const sharing = edges.filter((e) => (e.source === nodeId && e.sourceHandle === handleId) || (e.target === nodeId && e.targetHandle === handleId))
  return { index: Math.max(0, sharing.findIndex((e) => e.id === id)), count: Math.max(1, sharing.length) }
}

/** How far the middle stretch of the wire with this rank (its place in the list of wires) is moved aside. Nine corridors. */
export const corridorShift = (rank) => ((Math.max(0, rank) % 9) - 4) * SLOT

/** The point `distance` away from (x, y), moved sideways across the way the wire leaves (a wire leaving down moves along x). */
export function shifted(x, y, side, distance) {
  return side === 'top' || side === 'bottom' ? [x + distance, y] : [x, y + distance]
}
