import { useLayoutEffect, useRef, useState } from 'react'
import { BaseEdge, getSmoothStepPath } from '@xyflow/react'
import { wirePath } from './wirePath.js'
import BenchTip from './BenchTip.jsx'

// How much of each end of a wire cannot be clicked, so a pad that already has a wire on it can still be pointed at
const END_GAP = 18

/**
 * A soldered wire, routed like a wiring diagram: it leaves the part straight out of its edge, turns in neat
 * rounded corners, and ends in a small blob of solder on each pad. Wires from neighbouring pads take their own lane
 * (a turning point of their own) so they run side by side and do not lie on top of each other.
 * The wire is drawn above every part. Pointing at it says what it carries and which wire to use.
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
    offset: 20 + ((data?.lane ?? data?.seed ?? 0) % 6) * 9,
  })
  const width = data?.gauge ?? 1.8
  const color = data?.color ?? '#e5c02a'
  // an end on the side of a part that faces away: the wire goes through the board, so it is faded and dashed
  const through = data?.hidden

  // the part of the wire that can be clicked: all of it except the stretch at each pad
  const hit = useRef(null)
  const [length, setLength] = useState(0)
  useLayoutEffect(() => {
    setLength(hit.current?.getTotalLength?.() ?? 0)
  }, [path])
  const dash = length > END_GAP * 3 ? `0 ${END_GAP} ${length - END_GAP * 2} ${length}` : undefined

  const [hover, setHover] = useState(null)
  const point = (e) => setHover({ x: e.clientX, y: e.clientY })

  return (
    <g opacity={through ? 0.55 : 1} strokeDasharray={through ? '6 5' : undefined}>
      {(selected || hover) && <path d={path} fill="none" stroke="var(--color-accent-primary)" strokeOpacity={selected ? 0.35 : 0.25} strokeWidth={width + 7} strokeLinecap="round" style={{ pointerEvents: 'none' }} />}
      <path d={path} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth={width + 1.4} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }} />
      <BaseEdge id={id} path={path} interactionWidth={0} style={{ stroke: color, strokeWidth: width, strokeLinecap: 'round', strokeLinejoin: 'round', pointerEvents: 'none' }} />
      {[
        [sourceX, sourceY],
        [targetX, targetY],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={width * 0.9 + 1.4} fill="#d9dde2" stroke="#8a929c" strokeWidth="0.7" style={{ pointerEvents: 'none' }} />
      ))}
      <path
        ref={hit}
        className="react-flow__edge-interaction"
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(14, width + 8)}
        strokeLinecap="butt"
        strokeDasharray={dash}
        style={{ pointerEvents: 'stroke' }}
        onMouseEnter={point}
        onMouseMove={point}
        onMouseLeave={() => setHover(null)}
      />
      {hover && data?.tip && <BenchTip tip={data.tip} at={hover} />}
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
