import { useState } from 'react'
import PageWrapper from '@components/layout/PageWrapper'
import DroneScene from './components/DroneScene'
import styles from './Assembly3D.module.css'

export default function Assembly3D() {
  const [parts, setParts] = useState({
    frame: false,
    m1: false,
    m2: false,
    m3: false,
    m4: false,
    esc: false,
    fc: false,
  })

  const [activePart, setActivePart] = useState(null)

  const handleAttach = (partId) => {
    // If the user selected the part in the sidebar OR if they just click the ghost, let's attach it.
    // For simplicity, clicking the ghost attaches it immediately.
    setParts(prev => ({ ...prev, [partId]: true }))
    setActivePart(null)
  }

  const handleAddPart = (partId) => {
    if (partId === 'frame' && !parts.frame) {
      setParts(prev => ({ ...prev, frame: true }))
    } else {
      setActivePart(partId)
    }
  }

  const resetAssembly = () => {
    setParts({
      frame: false,
      m1: false,
      m2: false,
      m3: false,
      m4: false,
      esc: false,
      fc: false,
    })
    setActivePart(null)
  }

  return (
    <PageWrapper fullHeight>
      <div className={styles.layout}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>3D <span className="gradient-text">Assembly</span></h1>
            <p className={styles.subtitle}>Click the ghost sockets to snap parts into place.</p>
          </div>
          <div className={styles.controls}>
            <button className={styles.btn} onClick={resetAssembly}>Reset</button>
          </div>
        </header>

        <div className={styles.workspace}>
          <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>Inventory</div>
            <div className={styles.sidebarDesc}>Select a part, then click a ghost socket on the drone to attach it.</div>
            
            <div className={styles.partList}>
              <button 
                className={styles.partBtn} 
                onClick={() => handleAddPart('frame')}
                disabled={parts.frame}
              >
                1. Carbon Frame
              </button>
              <button 
                className={styles.partBtn} 
                onClick={() => setActivePart('motor')}
                disabled={!parts.frame || (parts.m1 && parts.m2 && parts.m3 && parts.m4)}
                style={{ borderColor: activePart === 'motor' ? '#00ffcc' : '' }}
              >
                2. Motors
              </button>
              <button 
                className={styles.partBtn} 
                onClick={() => setActivePart('esc')}
                disabled={!parts.frame || parts.esc}
                style={{ borderColor: activePart === 'esc' ? '#00ffcc' : '' }}
              >
                3. 4-in-1 ESC
              </button>
              <button 
                className={styles.partBtn} 
                onClick={() => setActivePart('fc')}
                disabled={!parts.esc || parts.fc}
                style={{ borderColor: activePart === 'fc' ? '#00ffcc' : '' }}
              >
                4. Flight Controller
              </button>
            </div>
          </aside>

          <div className={styles.canvasWrap}>
            {activePart && (
              <div className={styles.overlay}>
                Select a ghost socket to attach the {activePart}.
              </div>
            )}
            <DroneScene parts={parts} onAttach={handleAttach} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
