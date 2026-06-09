import { Handle, Position, useReactFlow } from '@xyflow/react'
import styles from '../Simulator.module.css'

export function ESCNode({ data }) {
  return (
    <div className={styles.escNode}>
      <div className={styles.nodeLabel}>4-in-1 ESC</div>
      
      {/* Battery Pads */}
      <div className={styles.padGroupBattery}>
        <div className={styles.padWrap}>
          <div className={styles.padLabel}>BAT+</div>
          <Handle type="target" position={Position.Bottom} id="bat_pos" className={`${styles.pad} ${styles.padRed}`} />
        </div>
        <div className={styles.padWrap}>
          <div className={styles.padLabel}>BAT-</div>
          <Handle type="target" position={Position.Bottom} id="bat_neg" className={`${styles.pad} ${styles.padBlack}`} />
        </div>
      </div>

      {/* Capacitor Pads */}
      <div className={styles.padGroupCap}>
        <div className={styles.padWrap}>
          <div className={styles.padLabel}>CAP+</div>
          <Handle type="target" position={Position.Bottom} id="cap_pos" className={`${styles.pad} ${styles.padRed}`} />
        </div>
        <div className={styles.padWrap}>
          <div className={styles.padLabel}>CAP-</div>
          <Handle type="target" position={Position.Bottom} id="cap_neg" className={`${styles.pad} ${styles.padBlack}`} />
        </div>
      </div>

      {/* Motor 1 Pads */}
      <div className={`${styles.padGroupMotor} ${styles.m1Pads}`}>
        <div className={styles.motorLabel}>M1</div>
        <Handle type="target" position={Position.Right} id="m1_1" className={styles.pad} style={{ top: 10 }} />
        <Handle type="target" position={Position.Right} id="m1_2" className={styles.pad} style={{ top: 30 }} />
        <Handle type="target" position={Position.Right} id="m1_3" className={styles.pad} style={{ top: 50 }} />
      </div>

      {/* Motor 2 Pads */}
      <div className={`${styles.padGroupMotor} ${styles.m2Pads}`}>
        <div className={styles.motorLabel}>M2</div>
        <Handle type="target" position={Position.Right} id="m2_1" className={styles.pad} style={{ top: 10 }} />
        <Handle type="target" position={Position.Right} id="m2_2" className={styles.pad} style={{ top: 30 }} />
        <Handle type="target" position={Position.Right} id="m2_3" className={styles.pad} style={{ top: 50 }} />
      </div>

      {/* Motor 3 Pads */}
      <div className={`${styles.padGroupMotor} ${styles.m3Pads}`}>
        <div className={styles.motorLabel}>M3</div>
        <Handle type="target" position={Position.Left} id="m3_1" className={styles.pad} style={{ top: 10 }} />
        <Handle type="target" position={Position.Left} id="m3_2" className={styles.pad} style={{ top: 30 }} />
        <Handle type="target" position={Position.Left} id="m3_3" className={styles.pad} style={{ top: 50 }} />
      </div>

      {/* Motor 4 Pads */}
      <div className={`${styles.padGroupMotor} ${styles.m4Pads}`}>
        <div className={styles.motorLabel}>M4</div>
        <Handle type="target" position={Position.Left} id="m4_1" className={styles.pad} style={{ top: 10 }} />
        <Handle type="target" position={Position.Left} id="m4_2" className={styles.pad} style={{ top: 30 }} />
        <Handle type="target" position={Position.Left} id="m4_3" className={styles.pad} style={{ top: 50 }} />
      </div>
    </div>
  )
}

export function MotorNode({ id, data }) {
  const { setNodes } = useReactFlow();

  const handleFlip = () => {
    setNodes((nds) => 
      nds.map((n) => {
        if (n.id === id) {
          return { ...n, data: { ...n.data, align: n.data.align === 'right' ? 'left' : 'right' } }
        }
        return n;
      })
    );
  };

  // Motor nodes have 3 wires out.
  const handlePosition = data.align === 'right' ? Position.Right : Position.Left;
  return (
    <div className={styles.motorNode} onDoubleClick={handleFlip}>
      {data.isRunning && (
        <div className={`${styles.propeller} ${data.spinDir === 'cw' ? styles.spinCW : styles.spinCCW}`} />
      )}
      <button className={styles.flipBtn} onClick={handleFlip}>Flip</button>
      <div className={styles.nodeLabel}>{data.label || 'Motor'}</div>
      <Handle type="source" position={handlePosition} id="wire1" className={styles.padOut} style={{ top: 15 }} />
      <Handle type="source" position={handlePosition} id="wire2" className={styles.padOut} style={{ top: 35 }} />
      <Handle type="source" position={handlePosition} id="wire3" className={styles.padOut} style={{ top: 55 }} />
    </div>
  )
}

export function BatteryNode() {
  return (
    <div className={styles.batteryNode}>
      <div className={styles.nodeLabel}>XT60 (Battery)</div>
      <div className={styles.padWrap}>
        <div className={styles.padLabel}>+</div>
        <Handle type="source" position={Position.Top} id="bat_pos" className={`${styles.padOut} ${styles.padRed}`} style={{ left: '30%' }} />
      </div>
      <div className={styles.padWrap}>
        <div className={styles.padLabel}>-</div>
        <Handle type="source" position={Position.Top} id="bat_neg" className={`${styles.padOut} ${styles.padBlack}`} style={{ left: '70%' }} />
      </div>
    </div>
  )
}

export function CapacitorNode() {
  return (
    <div className={styles.capacitorNode}>
      <div className={styles.nodeLabel}>Capacitor</div>
      <div className={styles.capStripe}>-</div>
      <Handle type="source" position={Position.Top} id="cap_pos" className={`${styles.padOut} ${styles.padRed}`} style={{ left: '25%' }} />
      <Handle type="source" position={Position.Top} id="cap_neg" className={`${styles.padOut} ${styles.padBlack}`} style={{ left: '75%' }} />
    </div>
  )
}

export function FCNode() {
  return (
    <div className={styles.fcNode}>
      <div className={styles.nodeLabel}>Flight Controller</div>
      
      <div className={styles.padGroupTop}>
        <Handle type="source" position={Position.Top} id="cam_5v" className={styles.pad} style={{ left: 20 }} />
        <Handle type="source" position={Position.Top} id="cam_gnd" className={styles.pad} style={{ left: 40 }} />
        <Handle type="source" position={Position.Top} id="cam_vid" className={styles.pad} style={{ left: 60 }} />
      </div>

      <div className={styles.padGroupBottom}>
        <Handle type="source" position={Position.Bottom} id="esc_vbat" className={styles.pad} style={{ left: 20 }} />
        <Handle type="source" position={Position.Bottom} id="esc_gnd" className={styles.pad} style={{ left: 40 }} />
        <Handle type="source" position={Position.Bottom} id="esc_m1" className={styles.pad} style={{ left: 60 }} />
        <Handle type="source" position={Position.Bottom} id="esc_m2" className={styles.pad} style={{ left: 80 }} />
        <Handle type="source" position={Position.Bottom} id="esc_m3" className={styles.pad} style={{ left: 100 }} />
        <Handle type="source" position={Position.Bottom} id="esc_m4" className={styles.pad} style={{ left: 120 }} />
      </div>

      <div className={styles.padGroupRight}>
        <Handle type="source" position={Position.Right} id="vtx_bat" className={styles.pad} style={{ top: 20 }} />
        <Handle type="source" position={Position.Right} id="vtx_gnd" className={styles.pad} style={{ top: 40 }} />
        <Handle type="source" position={Position.Right} id="vtx_vid" className={styles.pad} style={{ top: 60 }} />
        <Handle type="source" position={Position.Right} id="vtx_tx" className={styles.pad} style={{ top: 80 }} />
      </div>

      <div className={styles.padGroupLeft}>
        <Handle type="source" position={Position.Left} id="gps_5v" className={styles.pad} style={{ top: 20 }} />
        <Handle type="source" position={Position.Left} id="gps_gnd" className={styles.pad} style={{ top: 40 }} />
        <Handle type="source" position={Position.Left} id="gps_rx" className={styles.pad} style={{ top: 60 }} />
        <Handle type="source" position={Position.Left} id="gps_tx" className={styles.pad} style={{ top: 80 }} />
      </div>
    </div>
  )
}

export function CameraNode() {
  return (
    <div className={styles.cameraNode}>
      <div className={styles.lens}></div>
      <Handle type="source" position={Position.Bottom} id="cam_5v" className={`${styles.padOut} ${styles.padRed}`} style={{ left: 20 }} />
      <Handle type="source" position={Position.Bottom} id="cam_gnd" className={`${styles.padOut} ${styles.padBlack}`} style={{ left: 40 }} />
      <Handle type="source" position={Position.Bottom} id="cam_vid" className={styles.padOut} style={{ left: 60 }} />
    </div>
  )
}

export function VTXNode() {
  return (
    <div className={styles.vtxNode}>
      <div className={styles.nodeLabel}>VTX</div>
      <Handle type="source" position={Position.Left} id="vtx_bat" className={`${styles.padOut} ${styles.padRed}`} style={{ top: 20 }} />
      <Handle type="source" position={Position.Left} id="vtx_gnd" className={`${styles.padOut} ${styles.padBlack}`} style={{ top: 40 }} />
      <Handle type="source" position={Position.Left} id="vtx_vid" className={styles.padOut} style={{ top: 60 }} />
      <Handle type="source" position={Position.Left} id="vtx_rx" className={styles.padOut} style={{ top: 80 }} />
    </div>
  )
}

export function GPSNode() {
  return (
    <div className={styles.gpsNode}>
      <div className={styles.nodeLabel}>GPS</div>
      <Handle type="source" position={Position.Right} id="gps_5v" className={`${styles.padOut} ${styles.padRed}`} style={{ top: 20 }} />
      <Handle type="source" position={Position.Right} id="gps_gnd" className={`${styles.padOut} ${styles.padBlack}`} style={{ top: 40 }} />
      <Handle type="source" position={Position.Right} id="gps_tx" className={styles.padOut} style={{ top: 60 }} />
      <Handle type="source" position={Position.Right} id="gps_rx" className={styles.padOut} style={{ top: 80 }} />
    </div>
  )
}

export function FrameNode() {
  return (
    <div className={styles.frameNode}>
      <div className={styles.frameArm} style={{ transform: 'rotate(45deg)' }}></div>
      <div className={styles.frameArm} style={{ transform: 'rotate(-45deg)' }}></div>
      <div className={styles.frameCenter}></div>
    </div>
  )
}
