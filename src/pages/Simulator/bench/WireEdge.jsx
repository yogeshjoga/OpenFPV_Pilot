import { useLayoutEffect, useRef, useState } from 'react'
import { BaseEdge, getSmoothStepPath } from '@xyflow/react'
import { exitOf, padOf } from './catalog.js'
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
    offset: 46 + ((data?.lane ?? data?.seed ?? 0) % 6) * 10,
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
        strokeWidth={Math.max(10, width + 6)}
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

/**
 * What shows while a wire is being dragged from a pad or a tip. It is drawn the way the finished wire will be: in the colour of
 * the lead, leaving the part the way the wire will, with square turns, ending in a solder blob. Near a pad it snaps onto it and
 * the ring turns green, so it is clear which pad will take the wire when the mouse button is let go.
 */
export function PendingWire({ fromX, fromY, toX, toY, fromNode, fromHandle, toNode, toHandle, connectionStatus }) {
  const type = fromNode?.data?.type
  const leaves = type ? exitOf(type, fromHandle?.id, !!fromNode.data.flip) : 'bottom'
  const dx = toX - fromX
  const dy = toY - fromY
  // it arrives the way the finished wire would at the pad it is over; in the open it arrives facing the way it came from
  const arrives = toHandle && toNode ? exitOf(toNode.data.type, toHandle.id, !!toNode.data.flip) : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : dy > 0 ? 'top' : 'bottom'
  const [path] = getSmoothStepPath({ sourceX: fromX, sourceY: fromY, sourcePosition: leaves, targetX: toX, targetY: toY, targetPosition: arrives, borderRadius: 14, offset: 34 })
  const lead = type ? padOf(type, fromHandle?.id)?.lead : null
  const color = lead?.color ?? '#e5b82a'
  const width = Math.max(2.2, lead?.gauge ?? 0)
  const ok = !!toHandle && connectionStatus !== 'invalid'
  return (
    <g style={{ pointerEvents: 'none' }}>
      <path d={path} fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth={width + 2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={path} fill="none" stroke={color} strokeOpacity="0.9" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={fromX} cy={fromY} r={width * 0.9 + 1.4} fill="#d9dde2" stroke="#8a929c" strokeWidth="0.7" />
      <circle cx={toX} cy={toY} r={ok ? 11 : 8} fill={ok ? 'rgba(47, 125, 79, 0.18)' : 'none'} stroke={ok ? 'var(--color-success)' : 'var(--color-accent-primary)'} strokeWidth="2" />
    </g>
  )
}
