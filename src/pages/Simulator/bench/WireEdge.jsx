import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { BaseEdge, getSmoothStepPath, useEdges } from '@xyflow/react'
import { exitOf, padOf } from './catalog.js'
import { corridorShift, shifted, slotOf, slotShift } from './lanes.js'
import { hopPath, hopsOver, sample } from './hops.js'
import { otherLines, removeLine, setLine, snapshot, subscribe } from './wireLines.js'
import BenchTip from './BenchTip.jsx'

// How much of each end of a wire cannot be clicked, so a pad that already has a wire on it can still be pointed at
const END_GAP = 18

/**
 * A soldered wire, routed like a wiring diagram: it leaves the part straight out of its edge, turns in neat
 * rounded corners, and ends in a small blob of solder on each pad. Wires from neighbouring pads take their own lane
 * (a turning point of their own) so they run side by side and do not lie on top of each other.
 * The wire is drawn above every part. Pointing at it says what it carries and which wire to use.
 */
export default function WireEdge({ id, source, sourceHandleId, target, targetHandleId, sourceX, sourceY, targetX, targetY, data, selected }) {
  const edges = useEdges()
  const from = data?.from ?? 'bottom'
  const to = data?.to ?? 'bottom'
  const rank = edges.findIndex((e) => e.id === id)

  // wires on the same pad fan out side by side, and each wire has a corridor of its own, so no two wires lie on top of each other
  const a = slotOf(edges, id, source, sourceHandleId)
  const z = slotOf(edges, id, target, targetHandleId)
  const [sx, sy] = shifted(sourceX, sourceY, from, slotShift(a.index, a.count))
  const [tx, ty] = shifted(targetX, targetY, to, slotShift(z.index, z.count))
  const aside = corridorShift(rank)
  const vertical = (side) => side === 'top' || side === 'bottom'
  const [mid] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: from,
    targetX: tx,
    targetY: ty,
    targetPosition: to,
    borderRadius: 12,
    offset: 40 + (Math.max(0, rank) % 9) * 7,
    // the middle stretch runs between the two parts: moved aside by a different amount for each wire
    ...(vertical(from) && vertical(to) ? { centerY: (sy + ty) / 2 + aside } : {}),
    ...(!vertical(from) && !vertical(to) ? { centerX: (sx + tx) / 2 + aside } : {}),
  })
  // the short step sideways at each pad, from the pad itself to the wire's own slot
  const startMoved = sx !== sourceX || sy !== sourceY
  const endMoved = tx !== targetX || ty !== targetY
  const path = `${startMoved ? `M ${sourceX} ${sourceY} ${mid.replace(/^M/, 'L')}` : mid}${endMoved ? ` L ${targetX} ${targetY}` : ''}`
  const width = data?.gauge ?? 3.6
  const color = data?.color ?? '#e5c02a'
  // an end on the side of a part that faces away: the wire goes through the board, so it is faded and dashed
  const through = data?.hidden

  // the part of the wire that can be clicked: all of it except the stretch at each pad
  const hit = useRef(null)
  const [length, setLength] = useState(0)
  const [route, setRoute] = useState([])
  useLayoutEffect(() => {
    const el = hit.current
    setLength(el?.getTotalLength?.() ?? 0)
    // tell the other wires where this one runs, and take the route back off when the wire is removed
    if (el) {
      const points = sample(el)
      setRoute(points)
      setLine(id, points)
    }
    return () => removeLine(id)
  }, [path, id])

  // where this wire crosses another: it hops over, like a wire on paper. Redone whenever another wire moves.
  const version = useSyncExternalStore(subscribe, snapshot)
  const shown = useMemo(() => {
    const hops = route.length ? hopsOver(route, otherLines(id)) : []
    return hops.length ? hopPath(route, hops) : path
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `version` says another wire changed
  }, [route, path, id, version])
  const dash = length > END_GAP * 3 ? `0 ${END_GAP} ${length - END_GAP * 2} ${length}` : undefined

  const [hover, setHover] = useState(null)
  const point = (e) => setHover({ x: e.clientX, y: e.clientY })

  return (
    <g opacity={through ? 0.55 : 1} strokeDasharray={through ? '6 5' : undefined}>
      {(selected || hover) && <path d={shown} fill="none" stroke="var(--color-accent-primary)" strokeOpacity={selected ? 0.35 : 0.25} strokeWidth={width + 7} strokeLinecap="round" style={{ pointerEvents: 'none' }} />}
      <path d={shown} fill="none" stroke="#fff" strokeOpacity="0.8" strokeWidth={width + 2} strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }} />
      <BaseEdge id={id} path={shown} interactionWidth={0} style={{ stroke: color, strokeWidth: width, strokeLinecap: 'round', strokeLinejoin: 'round', pointerEvents: 'none' }} />
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
  const leaves = type ? exitOf(type, fromHandle?.id, !!fromNode.data.flip, fromNode.data.turn ?? 0) : 'bottom'
  const dx = toX - fromX
  const dy = toY - fromY
  // it arrives the way the finished wire would at the pad it is over; in the open it arrives facing the way it came from
  const arrives = toHandle && toNode ? exitOf(toNode.data.type, toHandle.id, !!toNode.data.flip, toNode.data.turn ?? 0) : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'left' : 'right') : dy > 0 ? 'top' : 'bottom'
  const [path] = getSmoothStepPath({ sourceX: fromX, sourceY: fromY, sourcePosition: leaves, targetX: toX, targetY: toY, targetPosition: arrives, borderRadius: 14, offset: 34 })
  const lead = type ? padOf(type, fromHandle?.id)?.lead : null
  const color = lead?.color ?? '#e5b82a'
  const width = Math.max(3.6, lead?.gauge ?? 0)
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
