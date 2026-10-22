import { memo, useContext } from 'react'
import { Handle, NodeToolbar, Position } from '@xyflow/react'
import { FlipHorizontal2 } from 'lucide-react'
import { PART_BY_ID, onFace, padAt } from './catalog.js'
import { PartActions } from './partActions.js'
import { ART } from './parts/registry.jsx'
import styles from '../Simulator.module.css'

/**
 * One placed part: its artwork, with a connection point over every pad and every wire tip.
 * Drag from a tip or a pad to another to solder a wire between them. A part can be turned over to reach its back.
 */
function PartNode({ id, data, selected }) {
  const part = PART_BY_ID[data.type]
  const Art = ART[data.type]
  const actions = useContext(PartActions)
  if (!part || !Art) return null
  const flip = !!data.flip
  const artProps = data.type === 'motor' ? { running: data.running, dir: data.dir, spinCw: styles.spinCw, spinCcw: styles.spinCcw } : {}

  return (
    <div className={`${styles.part} ${selected ? styles.partSelected : ''} ${data.smoke ? styles.partBurnt : ''}`} style={{ width: part.w, height: part.h }}>
      {actions && (
        <NodeToolbar isVisible={selected} position={Position.Top} offset={14}>
          <button type="button" className={styles.flipBtn} onClick={() => actions.flip(id)} title="Turn over (F)">
            <FlipHorizontal2 size={15} aria-hidden="true" /> {flip ? 'Show front' : 'Show back'}
          </button>
        </NodeToolbar>
      )}
      <div className={`${styles.face} ${flip ? styles.mirror : ''}`}>
        <Art flip={flip} {...artProps} />
      </div>
      {part.pads.map((pad) => {
        const at = padAt(part, pad, flip)
        const near = onFace(pad, flip)
        const size = pad.hit
        return (
          <Handle
            key={pad.id}
            id={pad.id}
            type="source"
            position={Position.Top}
            className={`${styles.pad} ${pad.lead ? styles.padTip : ''} ${near ? '' : styles.padFar} ${data.mates?.includes(pad.id) ? styles.padMate : ''}`}
            style={{ left: at.x, top: at.y, ...(size ? { width: size, height: size } : {}) }}
            title={near ? `${part.name}: ${pad.label}` : undefined}
          />
        )
      })}
      {(flip || part.brand !== 'Generic') && (
        <span className={styles.sideTag} aria-hidden="true">
          {flip ? 'Back' : 'Front'}
        </span>
      )}
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
