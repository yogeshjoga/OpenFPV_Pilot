import { BaseEdge, getSmoothStepPath } from '@xyflow/react'
import { wirePath } from './wirePath.js'

/**
 * A soldered wire, routed like a wiring diagram: it leaves the part straight out of its edge, turns in neat
 * rounded corners, and ends in a small blob of solder on each pad. Wires that start close together are given
 * different turning points so they do not lie on top of each other.
 */
export default function WireEdge({ id, sourceX, sourceY, targetX, targetY, data, selected }) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition: data?.from ?? 'bottom',
    targetX,
    targetY,
    targetPosition: data?.to ?? 'bottom',
    borderRadius: 14,
    offset: 22 + ((data?.seed ?? 0) % 6) * 8,
  })
  const width = data?.gauge ?? 1.8
  const color = data?.color ?? '#e5c02a'
  return (
    <g>
      {selected && <path d={path} fill="none" stroke="var(--color-accent-primary)" strokeOpacity="0.35" strokeWidth={width + 7} strokeLinecap="round" style={{ pointerEvents: 'none' }} />}
      <path d={path} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth={width + 1.4} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }} />
      <BaseEdge id={id} path={path} interactionWidth={16} style={{ stroke: color, strokeWidth: width, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
      {[
        [sourceX, sourceY],
        [targetX, targetY],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={width * 0.9 + 1.4} fill="#d9dde2" stroke="#8a929c" strokeWidth="0.7" style={{ pointerEvents: 'none' }} />
      ))}
    </g>
  )
}

/** What shows while a wire is being dragged from a tip. */
export function PendingWire({ fromX, fromY, toX, toY }) {
  return (
    <g>
      <path d={wirePath(fromX, fromY, toX, toY)} fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeDasharray="5 5" strokeLinecap="round" />
      <circle cx={toX} cy={toY} r="7" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" />
    </g>
  )
}
