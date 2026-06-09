import styles from '../Simulator.module.css'

export default function Sidebar() {
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow/type', nodeType)
    event.dataTransfer.setData('application/reactflow/label', label)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>Parts Library</div>
      <div className={styles.sidebarDesc}>Drag parts to the canvas. Select and press Delete to remove.</div>
      
      <div className={styles.nodeList}>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'frame', 'Carbon Fiber Frame')} 
          draggable
        >
          Carbon Fiber Frame
        </div>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'esc', '4-in-1 ESC')} 
          draggable
        >
          4-in-1 ESC
        </div>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'fc', 'Flight Controller')} 
          draggable
        >
          Flight Controller
        </div>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'motor', 'Motor')} 
          draggable
        >
          Motor
        </div>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'battery', 'Battery (XT60)')} 
          draggable
        >
          Battery (XT60)
        </div>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'capacitor', 'Capacitor')} 
          draggable
        >
          Capacitor
        </div>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'gps', 'GPS Module')} 
          draggable
        >
          GPS Module
        </div>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'vtx', 'Video Transmitter')} 
          draggable
        >
          Video Transmitter
        </div>
        <div 
          className={styles.dndNode} 
          onDragStart={(event) => onDragStart(event, 'camera', 'FPV Camera')} 
          draggable
        >
          FPV Camera
        </div>
      </div>
    </aside>
  )
}
