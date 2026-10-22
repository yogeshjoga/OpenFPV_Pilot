// Top-view drawings of each part, in a light, clean diagram style: pale boards, dark components, gold pads, thin wires.
// Drawn from common standard layouts (30.5 mm stack boards, XT60, 2306 motors) in the part's own pixel box from
// catalog.js. They are our own drawings of typical parts, not any maker's artwork.
import { LEAD_SCALE, PART_BY_ID } from '../catalog.js'

const INK = '#2a2e35'
const BOARD = '#f7f7f4'
const EDGE = '#a9adb5'
const SILK = '#3a3f47'
const FONT = "'IBM Plex Mono', monospace"

/** Gradients shared by every part. Render once on the page. */
export function PartDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bn-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2d577" />
          <stop offset="1" stopColor="#cfa233" />
        </linearGradient>
        <linearGradient id="bn-tin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f5f7" />
          <stop offset="1" stopColor="#aab1ba" />
        </linearGradient>
        <linearGradient id="bn-xt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d84f" />
          <stop offset="1" stopColor="#dcae1c" />
        </linearGradient>
        <radialGradient id="bn-lens" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#7a8aa6" />
          <stop offset="0.5" stopColor="#2b3447" />
          <stop offset="1" stopColor="#0d1118" />
        </radialGradient>
      </defs>
    </svg>
  )
}

const Pad = ({ x, y, w = 24, h = 20, big = false, tin = false }) => (
  <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={big ? 6 : 4} fill={tin ? 'url(#bn-tin)' : 'url(#bn-gold)'} stroke="#9a7620" strokeWidth="0.7" />
)

const Text = ({ x, y, size = 9, anchor = 'middle', weight = 600, fill = SILK, children, rotate }) => (
  <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontFamily={FONT} fontWeight={weight} transform={rotate ? `rotate(${rotate} ${x} ${y})` : undefined}>
    {children}
  </text>
)

const Hole = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r="9" fill="#fff" stroke={EDGE} strokeWidth="1.2" />
    <circle cx={x} cy={y} r="5" fill="#eceef1" stroke="#c4c8ce" />
  </g>
)

const Board = ({ r = 16 }) => (
  <g>
    <rect x="1" y="1" width="278" height="278" rx={r} fill={BOARD} stroke={EDGE} strokeWidth="1.5" />
    {[[20, 20], [260, 20], [20, 260], [260, 260]].map(([x, y]) => (
      <Hole key={`${x}${y}`} x={x} y={y} />
    ))}
  </g>
)

const Chip = ({ x, y, w, h, dot = true, die }) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx="3" fill={INK} />
    {die && <rect x={x + w * 0.3} y={y + h * 0.3} width={w * 0.4} height={h * 0.4} rx="2" fill="#3f78c8" />}
    {dot && <circle cx={x + 6} cy={y + 6} r="1.8" fill="#aab1ba" />}
  </g>
)

const Wire = ({ d, color, width: full, tip }) => {
  const width = full * LEAD_SCALE
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      {tip && <rect x={tip[0] - width * 0.7} y={tip[1] - 6} width={width * 1.4} height="7" rx={width * 0.5} fill="url(#bn-tin)" stroke="#8b929c" strokeWidth="0.5" />}
    </g>
  )
}

// ---------------------------------------------------------------------------------------------------------------

export function EscArt() {
  return (
    <svg viewBox="0 0 280 280" width="280" height="280" aria-hidden="true">
      <Board />
      {/* power stages: big black blocks either side, small parts down the middle */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="56" y={72 + i * 32} width="44" height="26" rx="3" fill={INK} />
          <rect x="180" y={72 + i * 32} width="44" height="26" rx="3" fill={INK} />
        </g>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x="128" y={74 + i * 14} width="24" height="8" rx="1.5" fill="#6a6f78" />
      ))}
      <Chip x={113} y={178} w={54} h={20} dot={false} />
      <Text x={140} y={60} size={12} weight={700}>
        4-IN-1 ESC
      </Text>
      {PART_BY_ID.esc.pads
        .filter((p) => p.motor)
        .map((p) => (
          <Pad key={p.id} x={p.x} y={p.y} w={26} h={20} />
        ))}
      {[['M4', 44, 74, -90], ['M3', 44, 196, -90], ['M2', 236, 74, 90], ['M1', 236, 196, 90]].map(([n, x, y, rot]) => (
        <Text key={n} x={x} y={y} size={11} weight={700} rotate={rot}>
          {n}
        </Text>
      ))}
      <Pad x={112} y={206} w={30} h={22} />
      <Pad x={168} y={206} w={30} h={22} />
      <Text x={112} y={193} size={9}>
        CAP+
      </Text>
      <Text x={168} y={193} size={9}>
        CAP-
      </Text>
      <Pad x={112} y={246} w={40} h={28} big tin />
      <Pad x={168} y={246} w={40} h={28} big tin />
      <Text x={112} y={230} size={10} fill="#c0392b" weight={700}>
        BAT+
      </Text>
      <Text x={168} y={230} size={10} weight={700}>
        BAT-
      </Text>
      {PART_BY_ID.esc.pads
        .filter((p) => p.signal)
        .map((p) => (
          <g key={p.id}>
            <Pad x={p.x} y={p.y} w={13} h={17} />
            <Text x={p.x} y={p.y + 21} size={7}>
              {p.label}
            </Text>
          </g>
        ))}
    </svg>
  )
}

export function FcArt() {
  const group = (x, y, w, h, title, side) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill="none" stroke="#d3d6db" strokeDasharray="3 3" />
      <Text x={side === 'left' ? x + w + 5 : x - 5} y={y + 10} size={7.5} weight={500} anchor={side === 'left' ? 'start' : 'end'}>
        {title}
      </Text>
    </g>
  )
  return (
    <svg viewBox="0 0 280 280" width="280" height="280" aria-hidden="true">
      <Board />
      <Chip x={106} y={106} w={68} h={68} die />
      <rect x="96" y="76" width="24" height="16" rx="2" fill={INK} />
      <rect x="160" y="76" width="24" height="16" rx="2" fill={INK} />
      <rect x="64" y="196" width="26" height="20" rx="2" fill={INK} />
      <rect x="192" y="196" width="26" height="20" rx="2" fill={INK} />
      <rect x="112" y="244" width="56" height="30" rx="4" fill="url(#bn-tin)" stroke="#8b929c" />
      <rect x="120" y="252" width="40" height="12" rx="3" fill={INK} />
      <Text x={140} y={238} size={8} weight={500}>
        USB-C
      </Text>
      <Text x={140} y={64} size={10.5} weight={700}>
        F405 FLIGHT CONTROLLER
      </Text>
      {group(14, 70, 44, 82, 'VTX', 'left')}
      {group(14, 162, 44, 82, 'CAM', 'left')}
      {group(222, 56, 44, 100, 'UART1', 'right')}
      {group(222, 162, 44, 100, 'UART3', 'right')}
      {PART_BY_ID.fc.pads.map((p) =>
        p.signal ? (
          <g key={p.id}>
            <Pad x={p.x} y={p.y} w={13} h={17} />
            <Text x={p.x} y={p.y + 21} size={7}>
              {p.label}
            </Text>
          </g>
        ) : (
          <g key={p.id}>
            <Pad x={p.x} y={p.y} w={24} h={18} />
            <Text x={p.x < 140 ? p.x + 18 : p.x - 18} y={p.y + 3.5} size={9} anchor={p.x < 140 ? 'start' : 'end'} weight={700}>
              {p.label}
            </Text>
          </g>
        ),
      )}
    </svg>
  )
}

export function MotorArt({ running = false, dir = 'cw', spinCw, spinCcw }) {
  const wires = [
    ['M75 128 C75 150 40 160 40 184', '#4b7bec', [40, 184]],
    ['M75 128 C75 150 75 160 75 184', '#e5b82a', [75, 184]],
    ['M75 128 C75 150 110 160 110 184', '#38a869', [110, 184]],
  ]
  const spin = dir === 'cw' ? spinCw : spinCcw
  return (
    <svg viewBox="0 0 150 190" width="150" height="190" aria-hidden="true">
      {wires.map(([d, color, tip]) => (
        <Wire key={color} d={d} color={color} width={3.6} tip={tip} />
      ))}
      <g className={running ? spin : undefined} style={{ transformOrigin: '75px 72px' }}>
        <circle cx="75" cy="72" r="60" fill="#d9dce1" stroke="#7b8089" strokeWidth="1.6" />
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x="71" y="22" width="8" height="14" rx="2" fill="#7b8089" transform={`rotate(${(i * 360) / 14} 75 72)`} />
        ))}
        <circle cx="75" cy="72" r="38" fill="#eef0f3" stroke="#9aa0a9" />
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={i} cx="75" cy="50" r="4" fill="#9aa0a9" transform={`rotate(${i * 60} 75 72)`} />
        ))}
        <circle cx="75" cy="72" r="13" fill="#6b7078" stroke="#4a4f57" />
        <circle cx="75" cy="72" r="5" fill="#c9ccd2" />
      </g>
      {running && (
        <g className={spin} style={{ transformOrigin: '75px 72px' }} opacity="0.5">
          <ellipse cx="75" cy="72" rx="70" ry="7" fill="#b9bec6" />
          <ellipse cx="75" cy="72" rx="7" ry="70" fill="#b9bec6" />
        </g>
      )}
    </svg>
  )
}

export function BatteryArt() {
  return (
    <svg viewBox="0 0 150 250" width="150" height="250" aria-hidden="true">
      <Wire d="M50 8 C50 40 62 50 62 76" color="#d6455d" width={5.5} tip={[50, 8]} />
      <Wire d="M100 8 C100 40 88 50 88 76" color="#2a2e35" width={5.5} tip={[100, 8]} />
      <rect x="46" y="66" width="58" height="44" rx="6" fill="url(#bn-xt)" stroke="#a98511" strokeWidth="1" />
      <rect x="56" y="76" width="16" height="24" rx="3" fill="#8c6c0c" opacity="0.5" />
      <rect x="78" y="76" width="16" height="24" rx="3" fill="#8c6c0c" opacity="0.5" />
      <Text x={75} y={104} size={7} fill="#6b5206" weight={700}>
        XT60
      </Text>
      <rect x="18" y="108" width="114" height="136" rx="10" fill="#dfe6f3" stroke="#8d9ab4" strokeWidth="1.5" />
      <rect x="30" y="124" width="90" height="62" rx="4" fill="#fff" stroke="#c9d1e2" />
      <Text x={75} y={146} size={15} fill="#1f3a5f" weight={700}>
        4S
      </Text>
      <Text x={75} y={162} size={9} fill="#1f3a5f" weight={500}>
        1500mAh 100C
      </Text>
      <Text x={75} y={177} size={8} fill="#b02121" weight={700}>
        14.8V LiPo
      </Text>
    </svg>
  )
}

export function CapacitorArt() {
  return (
    <svg viewBox="0 0 90 150" width="90" height="150" aria-hidden="true">
      <Wire d="M28 8 L28 70" color="#aab1ba" width={2.4} tip={[28, 8]} />
      <Wire d="M62 8 L62 70" color="#aab1ba" width={2.4} tip={[62, 8]} />
      <rect x="12" y="62" width="66" height="78" rx="6" fill="#4a4f57" stroke="#2a2e35" strokeWidth="1.2" />
      <ellipse cx="45" cy="62" rx="33" ry="7" fill="#7b8089" stroke="#2a2e35" />
      <rect x="58" y="64" width="16" height="74" rx="3" fill="#e6e9ee" />
      {[78, 94, 110, 126].map((y) => (
        <Text key={y} x={66} y={y} size={14} fill={INK} weight={700}>
          -
        </Text>
      ))}
      <Text x={31} y={102} size={9} fill="#e6e9ee" weight={500} rotate={-90}>
        1000uF 35V
      </Text>
    </svg>
  )
}

export function ReceiverArt() {
  const leads = [
    [20, '#d6455d'],
    [47, '#2a2e35'],
    [73, '#38a869'],
    [100, '#4b7bec'],
  ]
  return (
    <svg viewBox="0 0 140 150" width="140" height="150" aria-hidden="true">
      <path d="M112 36 C112 18 120 12 120 4" fill="none" stroke="#9aa0a9" strokeWidth="1.6" strokeLinecap="round" />
      <rect x="116" y="1" width="8" height="9" rx="2" fill="#e8e2d2" stroke="#b9b09a" />
      {leads.map(([x, color]) => (
        <Wire key={x} d={`M${x} 92 C${x} 116 ${x} 124 ${x} 144`} color={color} width={2.2} tip={[x, 144]} />
      ))}
      <rect x="12" y="34" width="116" height="60" rx="5" fill={BOARD} stroke={EDGE} strokeWidth="1.4" />
      <rect x="22" y="42" width="40" height="30" rx="2" fill="#d9dce1" stroke="#9aa0a9" />
      <Text x={42} y={61} size={8} fill={INK} weight={700}>
        ELRS
      </Text>
      <Chip x={76} y={44} w={30} h={28} dot />
      {leads.map(([x]) => (
        <Pad key={x} x={x} y={90} w={14} h={9} />
      ))}
    </svg>
  )
}

export function VtxArt() {
  const leads = [
    [30, '#d6455d'],
    [75, '#2a2e35'],
    [120, '#e5b82a'],
  ]
  return (
    <svg viewBox="0 0 150 150" width="150" height="150" aria-hidden="true">
      {leads.map(([x, color]) => (
        <Wire key={x} d={`M${x} 92 C${x} 116 ${x} 124 ${x} 144`} color={color} width={x === 120 ? 2 : 2.4} tip={[x, 144]} />
      ))}
      <rect x="12" y="12" width="126" height="84" rx="6" fill={BOARD} stroke={EDGE} strokeWidth="1.4" />
      <rect x="22" y="22" width="70" height="64" rx="3" fill={INK} />
      <Text x={57} y={58} size={10} fill="#e6e9ee" weight={700}>
        5.8G VTX
      </Text>
      <Chip x={100} y={26} w={28} h={24} dot={false} />
      <rect x="132" y="42" width="16" height="16" rx="3" fill="url(#bn-gold)" stroke="#9a7620" />
      <circle cx="140" cy="50" r="3.4" fill={INK} />
      {leads.map(([x]) => (
        <Pad key={x} x={x} y={96} w={14} h={9} />
      ))}
    </svg>
  )
}

export function CameraArt() {
  const leads = [
    [20, '#d6455d'],
    [60, '#2a2e35'],
    [100, '#e5b82a'],
  ]
  return (
    <svg viewBox="0 0 120 160" width="120" height="160" aria-hidden="true">
      {leads.map(([x, color]) => (
        <Wire key={x} d={`M${x} 88 C${x} 120 ${x} 130 ${x} 154`} color={color} width={x === 100 ? 2 : 2.2} tip={[x, 154]} />
      ))}
      <rect x="14" y="6" width="92" height="84" rx="12" fill="#5a606a" stroke="#2a2e35" strokeWidth="1.4" />
      <circle cx="60" cy="48" r="30" fill="#2a2e35" />
      <circle cx="60" cy="48" r="24" fill="url(#bn-lens)" />
      <circle cx="52" cy="40" r="5" fill="#fff" opacity="0.4" />
    </svg>
  )
}

export function GpsArt() {
  const leads = [
    [18, '#d6455d'],
    [49, '#2a2e35'],
    [80, '#38a869'],
    [111, '#4b7bec'],
  ]
  return (
    <svg viewBox="0 0 130 150" width="130" height="150" aria-hidden="true">
      {leads.map(([x, color]) => (
        <Wire key={x} d={`M${x} 104 C${x} 124 ${x} 130 ${x} 144`} color={color} width={2.2} tip={[x, 144]} />
      ))}
      <rect x="10" y="8" width="110" height="96" rx="8" fill="#c9ccd2" stroke="#7b8089" strokeWidth="1.4" />
      <rect x="24" y="22" width="82" height="68" rx="4" fill="#e9ebee" stroke="#9aa0a9" />
      <rect x="40" y="36" width="50" height="40" rx="3" fill="#d4d7dc" />
      <Text x={65} y={100} size={8} fill={INK} weight={700}>
        GPS
      </Text>
      {leads.map(([x]) => (
        <Pad key={x} x={x} y={104} w={14} h={9} />
      ))}
    </svg>
  )
}
