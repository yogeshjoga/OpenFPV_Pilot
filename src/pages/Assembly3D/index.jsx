import { useState } from 'react'
import { motion } from 'framer-motion'
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
    vtx: false,
    p1: false,
    p2: false,
    p3: false,
    p4: false,
  })

  const [activePart, setActivePart] = useState(null)
  
  const isComplete = Object.values(parts).every(Boolean)

  const handleAttach = (partId) => {
    setParts(prev => {
      const nextParts = { ...prev, [partId]: true }
      
      if (partId === 'frame') {
        setActivePart('motor')
      }
      else if (partId.startsWith('m')) {
        if (nextParts.m1 && nextParts.m2 && nextParts.m3 && nextParts.m4) {
          setActivePart('esc')
        }
      }
      else if (partId === 'esc') {
        setActivePart('fc')
      }
      else if (partId === 'fc') {
        setActivePart('vtx')
      }
      else if (partId === 'vtx') {
        setActivePart('prop')
      }
      else if (partId.startsWith('p')) {
        if (nextParts.p1 && nextParts.p2 && nextParts.p3 && nextParts.p4) {
          setActivePart(null) // Done!
        }
      }
      
      return nextParts
    })
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
      vtx: false,
      p1: false,
      p2: false,
      p3: false,
      p4: false,
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
                disabled={!parts.m1 || !parts.m2 || !parts.m3 || !parts.m4 || parts.esc}
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
              <button 
                className={styles.partBtn} 
                onClick={() => setActivePart('vtx')}
                disabled={!parts.fc || parts.vtx}
                style={{ borderColor: activePart === 'vtx' ? '#00ffcc' : '' }}
              >
                5. VTX / Camera
              </button>
              <button 
                className={styles.partBtn} 
                onClick={() => setActivePart('prop')}
                disabled={!parts.vtx || (parts.p1 && parts.p2 && parts.p3 && parts.p4)}
                style={{ borderColor: activePart === 'prop' ? '#00ffcc' : '' }}
              >
                6. Propellers
              </button>
            </div>
          </aside>

          <div className={styles.canvasWrap}>
            {activePart && !isComplete && (
              <div className={styles.overlay}>
                Select a ghost socket to attach the {activePart}.
              </div>
            )}
            {isComplete && (
              <motion.div 
                className={styles.overlaySuccess}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <h2 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Drone Fully Assembled!</h2>
                <p>Ready for Betaflight tuning and first flight.</p>
              </motion.div>
            )}
            <DroneScene parts={parts} onAttach={handleAttach} activePart={activePart} isComplete={isComplete} />
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
