import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { PART_BY_ID } from './catalog.js'
import { ART } from './parts/registry.js'
import styles from '../Simulator.module.css'

/**
 * One placed part: its artwork, with a connection point over every pad and every wire tip.
 * Drag from a tip or a pad to another to solder a wire between them.
 */
function PartNode({ data, selected }) {
  const part = PART_BY_ID[data.type]
  const Art = ART[data.type]
  if (!part || !Art) return null
  const artProps = data.type === 'motor' ? { running: data.running, dir: data.dir, spinCw: styles.spinCw, spinCcw: styles.spinCcw } : {}

  return (
    <div className={`${styles.part} ${selected ? styles.partSelected : ''} ${data.smoke ? styles.partBurnt : ''}`} style={{ width: part.w, height: part.h }}>
      <Art {...artProps} />
      {part.pads.map((pad) => (
        <Handle
          key={pad.id}
          id={pad.id}
          type="source"
          position={Position.Top}
          className={`${styles.pad} ${pad.lead ? styles.padTip : ''} ${data.mates?.includes(pad.id) ? styles.padMate : ''}`}
          style={{ left: pad.x, top: pad.y }}
          title={`${part.name}: ${pad.label}`}
        />
      ))}
      <span className={styles.partLabel}>{data.label}</span>
      {data.smoke && (
        <span className={styles.smoke} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </div>
  )
}

export default memo(PartNode)
