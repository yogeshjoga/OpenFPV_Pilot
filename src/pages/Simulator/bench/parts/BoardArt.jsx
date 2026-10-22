// Draws a brand board from its description (bench/boards): the outline, the parts on it and every pad, for the front and
// for the back. Everything is drawn as seen from the front; turning the part over mirrors the whole drawing (the part
// node does that) and the writing is turned back so it still reads the right way.
import { onFace } from '../catalog.js'

const INK = '#2a2e35'
const BOARD = '#f7f7f4'
const BOARD_BACK = '#eeefea'
const EDGE = '#a9adb5'
const SILK = '#3a3f47'
const FONT = "'IBM Plex Mono', monospace"

/** Writing. Turned text sits in a group the stylesheet can find, so it is un-mirrored the right way when a part is flipped. */
const T = ({ x, y, size = 9, anchor = 'middle', weight = 600, fill = SILK, rotate, opacity, children }) => {
  const text = (
    <text x={x} y={y} fontSize={size} fill={fill} fillOpacity={opacity} textAnchor={anchor} fontFamily={FONT} fontWeight={weight}>
      {children}
    </text>
  )
  return rotate ? (
    <g className="vtext" transform={`rotate(${rotate} ${x} ${y})`}>
      {text}
    </g>
  ) : (
    text
  )
}

function Feature({ f, front, model }) {
  switch (f.t) {
    case 'chip':
      return (
        <g>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill={INK} />
          {f.die && <rect x={f.x + f.w * 0.28} y={f.y + f.h * 0.22} width={f.w * 0.44} height={f.h * 0.44} rx="2" fill="#3f78c8" />}
          <circle cx={f.x + 6} cy={f.y + 6} r="1.8" fill="#aab1ba" />
          {f.label && (
            <T x={f.x + f.w / 2} y={f.y + f.h - 5} size={f.w > 50 ? 8 : 6} fill="#cfd5de" weight={500}>
              {f.label}
            </T>
          )}
        </g>
      )
    case 'fet':
      return (
        <g>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill={INK} />
          <rect x={f.x + 6} y={f.y + 6} width={f.w - 12} height={f.h - 12} rx="2" fill="#3a3f47" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={f.x + 12 + i * ((f.w - 30) / 2)} y={f.y + f.h - 5} width="6" height="5" fill="#9aa0a9" />
          ))}
        </g>
      )
    case 'coil':
      return (
        <g>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="5" fill="#5d636c" />
          <rect x={f.x + 5} y={f.y + 5} width={f.w - 10} height={f.h - 10} rx="3" fill="#8b9099" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <circle cx={f.x} cy={f.y} r={f.r} fill="#d7dbe0" stroke="#8a929c" strokeWidth="1" />
          <circle cx={f.x} cy={f.y} r={f.r * 0.62} fill="#eceef1" stroke="#c4c8ce" />
          <path d={`M ${f.x - f.r * 0.5} ${f.y - f.r * 0.5} L ${f.x + f.r * 0.5} ${f.y + f.r * 0.5} M ${f.x + f.r * 0.5} ${f.y - f.r * 0.5} L ${f.x - f.r * 0.5} ${f.y + f.r * 0.5}`} stroke="#aab1ba" strokeWidth="1" />
        </g>
      )
    case 'usb': {
      // drawn for the bottom edge, then turned for the others
      const turn = { bottom: 0, top: 180, left: 90, right: -90 }[f.side ?? 'bottom']
      return (
        <g>
          <g transform={`rotate(${turn} ${f.x} ${f.y})`}>
            <rect x={f.x - 33} y={f.y - 12} width="66" height="26" rx="4" fill="url(#bn-tin)" stroke="#8b929c" />
            <rect x={f.x - 23} y={f.y - 4} width="46" height="9" rx="4.5" fill={INK} />
          </g>
        </g>
      )
    }
    case 'button':
      return (
        <g>
          <rect x={f.x - 9} y={f.y - 9} width="18" height="18" rx="3" fill="#d7dbe0" stroke="#8a929c" />
          <circle cx={f.x} cy={f.y} r="5" fill={INK} />
          <T x={f.x} y={f.y - 14} size={6.5} opacity={0.8}>
            BOOT
          </T>
        </g>
      )
    case 'led':
      return <circle cx={f.x} cy={f.y} r="4" fill="#38a869" stroke="#2f7d4f" />
    case 'module':
      return (
        <g>
          <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="3" fill="#d7dbe0" stroke="#8a929c" />
          <T x={f.x + f.w / 2} y={f.y + f.h / 2 + 3} size={9} fill={INK}>
            {f.label}
          </T>
        </g>
      )
    case 'ghost':
      return <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="4" fill="none" stroke="#c4c8ce" strokeDasharray="4 4" />
    case 'title':
      return (
        <g>
          <T x={f.x} y={f.y} size={12} weight={700} opacity={0.8}>
            {f.text}
          </T>
          {front && f.sub !== false && (
            <T x={f.x} y={f.y + 14} size={8} weight={500} opacity={0.7}>
              {model}
            </T>
          )}
        </g>
      )
    default:
      return null
  }
}

/** The plastic housing around a connector, and its name. */
function Housings({ pads, w }) {
  const groups = new Map()
  for (const p of pads) {
    if (p.shape !== 'pin') continue
    if (!groups.has(p.group)) groups.set(p.group, [])
    groups.get(p.group).push(p)
  }
  return [...groups.entries()].map(([name, list]) => {
    const xs = list.map((p) => p.x)
    const ys = list.map((p) => p.y)
    const x0 = Math.min(...xs) - 8
    const x1 = Math.max(...xs) + 8
    const y0 = Math.min(...ys) - 8
    const y1 = Math.max(...ys) + 8
    const side = list[0].side
    return (
      <g key={name}>
        <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx="3" fill="#e6e8ec" stroke="#b9bec6" />
        {side !== 'down' && side !== 'up' && (
          <T x={side === 'left' ? 68 : w - 68} y={(y0 + y1) / 2} size={9} weight={700} rotate={-90} opacity={0.75}>
            {name}
          </T>
        )}
      </g>
    )
  })
}

function PadArt({ p }) {
  if (p.shape === 'pin') {
    const { side } = p
    return (
      <g>
        <rect x={p.x - 3.5} y={p.y - 5.5} width="7" height="11" rx="1.5" fill="url(#bn-gold)" stroke="#9a7620" strokeWidth="0.6" />
        {side === 'left' && (
          <T x={p.x + 13} y={p.y + 3} size={8} anchor="start">
            {p.label}
          </T>
        )}
        {side === 'right' && (
          <T x={p.x - 13} y={p.y + 3} size={8} anchor="end">
            {p.label}
          </T>
        )}
        {side === 'down' && (
          <T x={p.x + 3} y={p.y + 12} size={8} anchor="start" rotate={90}>
            {p.label}
          </T>
        )}
        {side === 'up' && (
          <T x={p.x + 3} y={p.y - 12} size={8} anchor="start" rotate={-90}>
            {p.label}
          </T>
        )}
      </g>
    )
  }
  const [pw, ph] = p.size ?? [30, 20]
  if (p.shape === 'round') {
    return (
      <g>
        <circle cx={p.x} cy={p.y} r={pw / 2} fill="url(#bn-gold)" stroke="#9a7620" strokeWidth="0.7" />
        <circle cx={p.x} cy={p.y} r={pw / 5} fill="#fff" stroke="#9a7620" strokeWidth="0.6" />
        <T x={p.x} y={p.y - pw / 2 - 4} size={8}>
          {p.label}
        </T>
      </g>
    )
  }
  const plus = p.label.endsWith('+')
  return (
    <g>
      <rect x={p.x - pw / 2} y={p.y - ph / 2} width={pw} height={ph} rx={p.big ? 7 : 4} fill={p.tin ? 'url(#bn-tin)' : 'url(#bn-gold)'} stroke={p.tin ? '#8b929c' : '#9a7620'} strokeWidth="0.7" />
      <T x={p.x} y={p.y + (p.big ? 4 : 3)} size={p.big ? 11 : pw < 26 ? 7 : 8} weight={700} fill={p.big && plus ? '#a8281c' : INK}>
        {p.label}
      </T>
    </g>
  )
}

export default function BoardArt({ part, flip = false }) {
  const { w, h, art } = part
  const front = !flip
  const pads = part.pads.filter((p) => onFace(p, flip))
  const features = front ? art.features : art.backFeatures
  const fill = front ? BOARD : BOARD_BACK
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      {art.outline ? <path d={art.outline} fill={fill} stroke={EDGE} strokeWidth="1.5" strokeLinejoin="round" /> : <rect x="1" y="1" width={w - 2} height={h - 2} rx={art.radius} fill={fill} stroke={EDGE} strokeWidth="1.5" />}
      {art.holes.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="9" fill="#fff" stroke={EDGE} strokeWidth="1.2" />
          <circle cx={x} cy={y} r="5" fill="#eceef1" stroke="#c4c8ce" />
        </g>
      ))}
      {features.map((f, i) => (
        <Feature key={i} f={f} front={front} model={art.title} />
      ))}
      {front && <Housings pads={pads} w={w} />}
      {pads.map((p) => (
        <PadArt key={p.id} p={p} />
      ))}
    </svg>
  )
}
