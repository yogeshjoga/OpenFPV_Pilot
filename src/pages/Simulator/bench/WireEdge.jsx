import { BaseEdge } from '@xyflow/react'
import { wirePath } from './wirePath.js'

/**
 * A soldered wire: insulation in the colour and thickness of the lead it came from, a highlight along it, and a
 * blob of solder where each end meets a pad.
 */
export default function WireEdge({ id, sourceX, sourceY, targetX, targetY, data, selected }) {
  const path = wirePath(sourceX, sourceY, targetX, targetY)
  const width = data?.gauge ?? 2.6
  const color = data?.color ?? '#e5c02a'
  return (
    <g>
      <path d={path} fill="none" stroke="#000" strokeOpacity="0.28" strokeWidth={width + 3} strokeLinecap="round" transform="translate(0 3)" style={{ pointerEvents: 'none' }} />
      {selected && <path d={path} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth={width + 5} strokeLinecap="round" strokeDasharray="2 8" style={{ pointerEvents: 'none' }} />}
      <BaseEdge id={id} path={path} interactionWidth={18} style={{ stroke: color, strokeWidth: width, strokeLinecap: 'round' }} />
      <path d={path} fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth={Math.max(0.8, width * 0.3)} strokeLinecap="round" transform="translate(-0.6 -0.8)" style={{ pointerEvents: 'none' }} />
      {[
        [sourceX, sourceY],
        [targetX, targetY],
      ].map(([x, y], i) => (
        <g key={i} style={{ pointerEvents: 'none' }}>
          <circle cx={x} cy={y} r={width * 1.15 + 2} fill="url(#bn-tin)" stroke="#5a626c" strokeWidth="0.8" />
          <circle cx={x - width * 0.3} cy={y - width * 0.3} r={Math.max(1, width * 0.35)} fill="#fff" opacity="0.8" />
        </g>
      ))}
    </g>
  )
}

/** What shows while a wire is being dragged from a tip. */
export function PendingWire({ fromX, fromY, toX, toY }) {
  return (
    <g>
      <path d={wirePath(fromX, fromY, toX, toY)} fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="3" strokeDasharray="6 6" strokeLinecap="round" />
      <circle cx={toX} cy={toY} r="6" fill="none" stroke="#ffffff" strokeWidth="2" />
    </g>
  )
}
