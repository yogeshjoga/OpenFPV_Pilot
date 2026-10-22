// Top-view artwork for each part of the bench. Drawn from common standard layouts (30.5 mm stack boards, XT60,
// 2306 motors), in the part's own pixel box from catalog.js. Colours are the colours of the real things (PCB
// soldermask, gold pads, silicone wire), not interface colours.
import { LEAD_SCALE, PART_BY_ID } from '../catalog.js'

/** Gradients shared by every part. Render once on the page. */
export function PartDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bn-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7dc73" />
          <stop offset="0.55" stopColor="#d7a935" />
          <stop offset="1" stopColor="#a87a22" />
        </linearGradient>
        <linearGradient id="bn-tin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f8fa" />
          <stop offset="0.5" stopColor="#c5ccd4" />
          <stop offset="1" stopColor="#8d96a1" />
        </linearGradient>
        <linearGradient id="bn-esc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#434a54" />
          <stop offset="1" stopColor="#2f353d" />
        </linearGradient>
        <linearGradient id="bn-fc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#35618f" />
          <stop offset="1" stopColor="#25446a" />
        </linearGradient>
        <linearGradient id="bn-chip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b4149" />
          <stop offset="1" stopColor="#1d2025" />
        </linearGradient>
        <radialGradient id="bn-bell" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#5d8cf2" />
          <stop offset="0.6" stopColor="#2352c4" />
          <stop offset="1" stopColor="#15327f" />
        </radialGradient>
        <linearGradient id="bn-lipo" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1b2f5c" />
          <stop offset="0.5" stopColor="#2c4a8c" />
          <stop offset="1" stopColor="#172850" />
        </linearGradient>
        <linearGradient id="bn-can" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0d0f12" />
          <stop offset="0.35" stopColor="#3a414b" />
          <stop offset="1" stopColor="#0d0f12" />
        </linearGradient>
        <radialGradient id="bn-lens" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#6c86b8" />
          <stop offset="0.4" stopColor="#1d2a46" />
          <stop offset="1" stopColor="#05070c" />
        </radialGradient>
        <linearGradient id="bn-sink" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2c3037" />
          <stop offset="0.5" stopColor="#4a515b" />
          <stop offset="1" stopColor="#252a30" />
        </linearGradient>
        <linearGradient id="bn-xt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4d24a" />
          <stop offset="1" stopColor="#c99a14" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const silk = '#e6ebf0'

const Pad = ({ x, y, w = 24, h = 20, big = false, label, labelAt = 'below', tin = false }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={big ? 6 : 4} fill={tin ? 'url(#bn-tin)' : 'url(#bn-gold)'} stroke="#7d5a14" strokeWidth="0.8" />
    <ellipse cx={x} cy={y} rx={w * 0.22} ry={h * 0.22} fill="#12151a" opacity="0.55" />
    {label && (
      <text x={x} y={labelAt === 'below' ? y + h / 2 + 10 : y - h / 2 - 4} fontSize="9" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="600">
        {label}
      </text>
    )}
  </g>
)

const Hole = ({ x, y }) => (
  <g>
    <circle cx={x} cy={y} r="8" fill="url(#bn-gold)" stroke="#7d5a14" strokeWidth="0.6" />
    <circle cx={x} cy={y} r="4.4" fill="#f4f6f8" stroke="#2a2f36" strokeWidth="0.8" />
  </g>
)

const Chip = ({ x, y, w, h, text, pins = 8 }) => (
  <g>
    {Array.from({ length: pins }).map((_, i) => (
      <g key={i}>
        <rect x={x + 4 + (i * (w - 8)) / pins} y={y - 3} width="2.4" height="4" fill="#c9ced6" />
        <rect x={x + 4 + (i * (w - 8)) / pins} y={y + h - 1} width="2.4" height="4" fill="#c9ced6" />
      </g>
    ))}
    <rect x={x} y={y} width={w} height={h} rx="3" fill="url(#bn-chip)" stroke="#3a414b" strokeWidth="0.8" />
    <circle cx={x + 7} cy={y + 7} r="2.2" fill="#8b929c" />
    {text && (
      <text x={x + w / 2} y={y + h / 2 + 3} fontSize="9" fill="#9aa3ad" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
        {text}
      </text>
    )}
  </g>
)

const Wire = ({ d, color, width: full, tip }) => {
  const width = full * LEAD_SCALE
  return (
    <g>
      <path d={d} fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth={width + 1.2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      {tip && <rect x={tip[0] - width * 0.7} y={tip[1] - 7} width={width * 1.4} height="8" rx={width * 0.5} fill="url(#bn-tin)" stroke="#6f7782" strokeWidth="0.5" />}
    </g>
  )
}

// ---------------------------------------------------------------------------------------------------------------

export function EscArt() {
  const mosfets = (x0, y0) =>
    Array.from({ length: 6 }).map((_, i) => (
      <g key={`${x0}-${y0}-${i}`}>
        <rect x={x0 + (i % 3) * 18} y={y0 + Math.floor(i / 3) * 14} width="14" height="10" rx="1.5" fill="url(#bn-chip)" stroke="#3a414b" strokeWidth="0.6" />
        <circle cx={x0 + 3 + (i % 3) * 18} cy={y0 + 3 + Math.floor(i / 3) * 14} r="1" fill="#8b929c" />
      </g>
    ))
  return (
    <svg viewBox="0 0 280 280" width="280" height="280" aria-hidden="true">
      <rect x="1" y="1" width="278" height="278" rx="12" fill="url(#bn-esc)" stroke="#0a0c0f" strokeWidth="2" />
      <rect x="7" y="7" width="266" height="266" rx="9" fill="none" stroke={silk} strokeOpacity="0.22" strokeWidth="0.8" />
      {[[18, 18], [262, 18], [18, 262], [262, 262]].map(([x, y]) => (
        <Hole key={`${x}${y}`} x={x} y={y} />
      ))}
      {mosfets(58, 78)}
      {mosfets(172, 78)}
      {mosfets(58, 158)}
      {mosfets(172, 158)}
      <Chip x={116} y={120} w={48} h={48} text="MCU" pins={10} />
      <rect x="84" y="128" width="20" height="14" rx="2" fill="#7a5a28" stroke="#4d3913" strokeWidth="0.6" />
      <rect x="176" y="128" width="20" height="14" rx="2" fill="#7a5a28" stroke="#4d3913" strokeWidth="0.6" />
      <text x="140" y="104" fontSize="15" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        4-IN-1 ESC
      </text>
      <text x="140" y="276" fontSize="7" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" opacity="0.7">
        45A  30.5 x 30.5
      </text>
      {/* motor pads */}
      {PART_BY_ID.esc.pads
        .filter((p) => p.motor)
        .map((p) => (
          <Pad key={p.id} x={p.x} y={p.y} w={26} h={20} />
        ))}
      {[['M4', 28, 100, 'start'], ['M3', 28, 204, 'start'], ['M2', 252, 100, 'end'], ['M1', 252, 204, 'end']].map(([n, x, y, a]) => (
        <text key={n} x={a === 'start' ? x + 20 : x - 20} y={y - 20} fontSize="12" fill={silk} textAnchor={a} fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
          {n}
        </text>
      ))}
      {/* power pads */}
      <Pad x={112} y={206} w={30} h={22} label="CAP+" labelAt="above" />
      <Pad x={168} y={206} w={30} h={22} label="CAP-" labelAt="above" />
      <Pad x={112} y={246} w={40} h={28} big tin />
      <Pad x={168} y={246} w={40} h={28} big tin />
      <text x="112" y="232" fontSize="10" fill="#ff8a80" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        BAT+
      </text>
      <text x="168" y="232" fontSize="10" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        BAT-
      </text>
      {/* signal row */}
      {PART_BY_ID.esc.pads
        .filter((p) => p.signal)
        .map((p) => (
          <g key={p.id}>
            <Pad x={p.x} y={p.y} w={13} h={17} />
            <text x={p.x} y={p.y + 21} fontSize="7" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
              {p.label}
            </text>
          </g>
        ))}
    </svg>
  )
}

export function FcArt() {
  const group = (x, y, w, h, title, side) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="6" fill="none" stroke={silk} strokeOpacity="0.28" strokeDasharray="3 3" />
      <text x={side === 'left' ? x + w + 6 : x - 6} y={y + 10} fontSize="8" fill={silk} opacity="0.8" textAnchor={side === 'left' ? 'start' : 'end'} fontFamily="'IBM Plex Mono', monospace">
        {title}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 280 280" width="280" height="280" aria-hidden="true">
      <rect x="1" y="1" width="278" height="278" rx="12" fill="url(#bn-fc)" stroke="#06090d" strokeWidth="2" />
      <rect x="7" y="7" width="266" height="266" rx="9" fill="none" stroke={silk} strokeOpacity="0.22" strokeWidth="0.8" />
      {[[18, 18], [262, 18], [18, 262], [262, 262]].map(([x, y]) => (
        <Hole key={`${x}${y}`} x={x} y={y} />
      ))}
      <Chip x={104} y={104} w={72} h={72} text="STM32F405" pins={12} />
      <Chip x={62} y={196} w={30} h={22} text="IMU" pins={4} />
      <Chip x={190} y={196} w={26} h={20} text="OSD" pins={4} />
      <rect x="112" y="244" width="56" height="30" rx="4" fill="url(#bn-tin)" stroke="#6f7782" />
      <rect x="120" y="252" width="40" height="12" rx="3" fill="#15181c" />
      <text x="140" y="238" fontSize="8" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
        USB-C
      </text>
      <rect x="198" y="232" width="14" height="12" rx="2" fill="#2d333b" stroke="#69727e" />
      <text x="205" y="253" fontSize="7" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
        BOOT
      </text>
      <circle cx="82" cy="238" r="3" fill="#5de07a" />
      <circle cx="94" cy="238" r="3" fill="#6bb6ff" />
      <text x="140" y="94" fontSize="10.5" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        F405 FLIGHT CONTROLLER
      </text>
      {group(14, 70, 44, 82, 'VTX', 'left')}
      {group(14, 162, 44, 82, 'CAM', 'left')}
      {group(222, 56, 44, 100, 'UART1', 'right')}
      {group(222, 162, 44, 100, 'UART3', 'right')}
      {PART_BY_ID.fc.pads.map((p) =>
        p.signal ? (
          <g key={p.id}>
            <Pad x={p.x} y={p.y} w={13} h={17} />
            <text x={p.x} y={p.y + 21} fontSize="7" fill={silk} textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
              {p.label}
            </text>
          </g>
        ) : (
          <g key={p.id}>
            <Pad x={p.x} y={p.y} w={24} h={18} />
            <text x={p.x < 140 ? p.x + 18 : p.x - 18} y={p.y + 3.5} fontSize="9" fill={silk} textAnchor={p.x < 140 ? 'start' : 'end'} fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
              {p.label}
            </text>
          </g>
        ),
      )}
    </svg>
  )
}

export function MotorArt({ running = false, dir = 'cw', spinCw, spinCcw }) {
  const spin = dir === 'cw' ? spinCw : spinCcw
  const wires = [
    ['M75 128 C75 150 40 160 40 184', '#2f6fdd', [40, 184]],
    ['M75 128 C75 150 75 160 75 184', '#e5c02a', [75, 184]],
    ['M75 128 C75 150 110 160 110 184', '#32a852', [110, 184]],
  ]
  return (
    <svg viewBox="0 0 150 190" width="150" height="190" aria-hidden="true">
      {wires.map(([d, color, tip]) => (
        <Wire key={color} d={d} color={color} width={3.6} tip={tip} />
      ))}
      <circle cx="75" cy="72" r="60" fill="#0d1014" opacity="0.35" transform="translate(2,4)" />
      <g className={running ? spin : undefined} style={{ transformOrigin: '75px 72px' }}>
        <circle cx="75" cy="72" r="60" fill="url(#bn-bell)" stroke="#0e1f55" strokeWidth="2" />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="73" y="14" width="4" height="9" rx="1.5" fill="#0e1f55" opacity="0.55" transform={`rotate(${i * 30} 75 72)`} />
        ))}
        <circle cx="75" cy="72" r="43" fill="none" stroke="#fff" strokeOpacity="0.2" />
        <circle cx="75" cy="72" r="34" fill="#1a3e9c" stroke="#0e1f55" />
        {[0, 90, 180, 270].map((a) => (
          <circle key={a} cx="75" cy="44" r="3.4" fill="#0a1230" transform={`rotate(${a} 75 72)`} />
        ))}
        <circle cx="75" cy="72" r="13" fill="url(#bn-tin)" stroke="#5a626c" />
        <polygon points="75,63 83,67.5 83,76.5 75,81 67,76.5 67,67.5" fill="#6f7782" />
      </g>
      <text x="75" y="106" fontSize="8" fill="#dbe6ff" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" opacity="0.9">
        2306
      </text>
      {running && (
        <g className={spin} style={{ transformOrigin: '75px 72px' }} opacity="0.55">
          <ellipse cx="75" cy="72" rx="70" ry="8" fill="#d8dee6" />
          <ellipse cx="75" cy="72" rx="8" ry="70" fill="#d8dee6" />
        </g>
      )}
    </svg>
  )
}

export function BatteryArt() {
  return (
    <svg viewBox="0 0 150 250" width="150" height="250" aria-hidden="true">
      <Wire d="M50 8 C50 40 62 50 62 76" color="#d92d2d" width={5.5} tip={[50, 8]} />
      <Wire d="M100 8 C100 40 88 50 88 76" color="#15181c" width={5.5} tip={[100, 8]} />
      <rect x="46" y="66" width="58" height="44" rx="6" fill="url(#bn-xt)" stroke="#8a6a0d" strokeWidth="1.2" />
      <rect x="56" y="76" width="16" height="24" rx="3" fill="#7a5a0d" opacity="0.55" />
      <rect x="78" y="76" width="16" height="24" rx="3" fill="#7a5a0d" opacity="0.55" />
      <text x="75" y="104" fontSize="7" fill="#5a3f06" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        XT60
      </text>
      <rect x="18" y="108" width="114" height="136" rx="10" fill="url(#bn-lipo)" stroke="#0b1634" strokeWidth="1.5" />
      <rect x="30" y="126" width="90" height="62" rx="4" fill="#eef2f8" opacity="0.92" />
      <text x="75" y="148" fontSize="15" fill="#18284a" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        4S
      </text>
      <text x="75" y="164" fontSize="9" fill="#18284a" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace">
        1500mAh 100C
      </text>
      <text x="75" y="178" fontSize="8" fill="#b02121" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        14.8V LiPo
      </text>
      <rect x="40" y="208" width="70" height="4" rx="2" fill="#fff" opacity="0.18" />
    </svg>
  )
}

export function CapacitorArt() {
  return (
    <svg viewBox="0 0 90 150" width="90" height="150" aria-hidden="true">
      <Wire d="M28 8 L28 70" color="#c9ced6" width={2.4} tip={[28, 8]} />
      <Wire d="M62 8 L62 70" color="#c9ced6" width={2.4} tip={[62, 8]} />
      <ellipse cx="45" cy="142" rx="34" ry="6" fill="#0a0c0f" opacity="0.4" />
      <rect x="12" y="62" width="66" height="78" rx="6" fill="url(#bn-can)" stroke="#06080a" strokeWidth="1.2" />
      <ellipse cx="45" cy="62" rx="33" ry="7" fill="#444b55" stroke="#06080a" />
      <path d="M40 58 L50 66 M50 58 L40 66" stroke="#2b3037" strokeWidth="1.4" />
      <rect x="58" y="64" width="16" height="74" rx="3" fill="#dfe5ec" opacity="0.92" />
      {[78, 94, 110, 126].map((y) => (
        <text key={y} x="66" y={y} fontSize="14" fill="#14181d" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
          -
        </text>
      ))}
      <text x="31" y="102" fontSize="9" fill="#cfd6de" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" transform="rotate(-90 31 102)">
        1000uF 35V
      </text>
    </svg>
  )
}

export function ReceiverArt() {
  const leads = [
    [20, '#d92d2d'],
    [47, '#15181c'],
    [73, '#e5c02a'],
    [100, '#f1f1f1'],
  ]
  return (
    <svg viewBox="0 0 140 150" width="140" height="150" aria-hidden="true">
      <path d="M112 36 C112 18 120 12 120 4" fill="none" stroke="#f1f1f1" strokeWidth="2" strokeLinecap="round" />
      <rect x="116" y="1" width="8" height="9" rx="2" fill="#e5d9c4" stroke="#b9a98c" />
      {leads.map(([x, color]) => (
        <Wire key={x} d={`M${x} 92 C${x} 116 ${x} 124 ${x} 144`} color={color} width={2.2} tip={[x, 144]} />
      ))}
      <rect x="12" y="34" width="116" height="60" rx="5" fill="#16365e" stroke="#0a1b33" strokeWidth="1.4" />
      <rect x="22" y="42" width="46" height="34" rx="2" fill="url(#bn-tin)" stroke="#6f7782" />
      <text x="45" y="63" fontSize="8" fill="#39424d" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        ELRS
      </text>
      <Chip x={76} y={44} w={26} h={24} pins={4} />
      <circle cx="112" cy="76" r="3" fill="#5de07a" />
      {leads.map(([x]) => (
        <Pad key={x} x={x} y={90} w={14} h={9} />
      ))}
    </svg>
  )
}

export function VtxArt() {
  const leads = [
    [30, '#d92d2d'],
    [75, '#15181c'],
    [120, '#e5c02a'],
  ]
  return (
    <svg viewBox="0 0 150 150" width="150" height="150" aria-hidden="true">
      {leads.map(([x, color]) => (
        <Wire key={x} d={`M${x} 92 C${x} 116 ${x} 124 ${x} 144`} color={color} width={x === 120 ? 2 : 2.4} tip={[x, 144]} />
      ))}
      <rect x="12" y="12" width="126" height="84" rx="6" fill="#161a20" stroke="#07090c" strokeWidth="1.5" />
      <rect x="20" y="20" width="110" height="68" rx="3" fill="url(#bn-sink)" stroke="#12151a" />
      {Array.from({ length: 10 }).map((_, i) => (
        <line key={i} x1={26 + i * 11} y1="22" x2={26 + i * 11} y2="86" stroke="#14181d" strokeWidth="2" />
      ))}
      <text x="75" y="58" fontSize="12" fill="#dfe5ec" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        5.8G VTX
      </text>
      <rect x="132" y="42" width="16" height="16" rx="3" fill="url(#bn-gold)" stroke="#7d5a14" />
      <circle cx="140" cy="50" r="3.4" fill="#12151a" />
      {leads.map(([x]) => (
        <Pad key={x} x={x} y={96} w={14} h={9} />
      ))}
    </svg>
  )
}

export function CameraArt() {
  const leads = [
    [20, '#d92d2d'],
    [60, '#15181c'],
    [100, '#e5c02a'],
  ]
  return (
    <svg viewBox="0 0 120 160" width="120" height="160" aria-hidden="true">
      {leads.map(([x, color]) => (
        <Wire key={x} d={`M${x} 88 C${x} 120 ${x} 130 ${x} 154`} color={color} width={x === 100 ? 2 : 2.2} tip={[x, 154]} />
      ))}
      <rect x="14" y="6" width="92" height="84" rx="10" fill="#1b1e24" stroke="#07090c" strokeWidth="1.6" />
      <rect x="20" y="12" width="80" height="72" rx="7" fill="#262b32" />
      {[[26, 18], [94, 18], [26, 78], [94, 78]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#0a0c10" stroke="#555d68" />
      ))}
      <circle cx="60" cy="48" r="31" fill="#0b0d11" stroke="#3a414b" strokeWidth="2" />
      <circle cx="60" cy="48" r="25" fill="url(#bn-lens)" stroke="#05070c" strokeWidth="1.5" />
      <circle cx="52" cy="40" r="6" fill="#fff" opacity="0.35" />
      <circle cx="60" cy="48" r="9" fill="#05070c" opacity="0.7" />
    </svg>
  )
}

export function GpsArt() {
  const leads = [
    [18, '#d92d2d'],
    [49, '#15181c'],
    [80, '#32a852'],
    [111, '#f1f1f1'],
  ]
  return (
    <svg viewBox="0 0 130 150" width="130" height="150" aria-hidden="true">
      {leads.map(([x, color]) => (
        <Wire key={x} d={`M${x} 104 C${x} 124 ${x} 130 ${x} 144`} color={color} width={2.2} tip={[x, 144]} />
      ))}
      <rect x="10" y="8" width="110" height="96" rx="8" fill="#20252c" stroke="#07090c" strokeWidth="1.5" />
      <rect x="22" y="18" width="86" height="76" rx="4" fill="#d9d2c1" stroke="#a59c85" strokeWidth="1.2" />
      <rect x="30" y="26" width="70" height="60" rx="3" fill="#e9e3d3" stroke="#bdb49b" />
      <circle cx="65" cy="56" r="7" fill="#b8ae94" />
      <text x="65" y="98" fontSize="8" fill="#cfd6de" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontWeight="700">
        GPS
      </text>
      {leads.map(([x]) => (
        <Pad key={x} x={x} y={104} w={14} h={9} />
      ))}
    </svg>
  )
}
