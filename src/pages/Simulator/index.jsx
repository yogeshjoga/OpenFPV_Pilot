import { useCallback, useRef } from 'react'
import { Maximize2, Share2, Trash2, Zap } from 'lucide-react'
import { Background, BackgroundVariant, Controls, ConnectionMode, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import PageWrapper from '@components/layout/PageWrapper'
import useDocumentMeta from '@lib/useDocumentMeta'
import { PART_BY_ID } from './bench/catalog.js'
import { freeSpot } from './bench/placement.js'
import { PartDefs } from './bench/parts/art.jsx'
import PartNode from './bench/PartNode.jsx'
import WireEdge, { PendingWire } from './bench/WireEdge.jsx'
import { FreePanel, LessonPanel, ReportPanel } from './bench/panels.jsx'
import { useBench } from './bench/useBench.js'
import styles from './Simulator.module.css'

const nodeTypes = { part: PartNode }
const edgeTypes = { wire: WireEdge }

function PendingLine({ fromX, fromY, toX, toY }) {
  return <PendingWire fromX={fromX} fromY={fromY} toX={toX} toY={toY} />
}

function Bench() {
  const bench = useBench()
  const { screenToFlowPosition, fitView } = useReactFlow()
  const wrap = useRef(null)

  const place = useCallback(
    (type, point) => {
      const part = PART_BY_ID[type]
      const at = screenToFlowPosition(point)
      bench.addPart(type, { x: at.x - part.w / 2, y: at.y - part.h / 2 })
    },
    [bench, screenToFlowPosition],
  )

  const addAtCentre = (type) => {
    const box = wrap.current.getBoundingClientRect()
    const centre = screenToFlowPosition({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
    bench.addPart(type, freeSpot(centre, PART_BY_ID[type], bench.nodes))
  }

  const onDrop = (e) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/x-bench-part')
    if (type) place(type, { x: e.clientX, y: e.clientY })
  }

  const share = async () => {
    const link = bench.shareLink()
    try {
      await navigator.clipboard.writeText(link)
      bench.setNotice('Link copied. Anyone who opens it gets this build as their own copy.')
    } catch {
      window.prompt('Copy this link to share your build', link)
    }
  }

  const switchMode = (kind) => {
    if (kind === bench.mode.kind) return
    if (kind === 'lesson') bench.openLesson(bench.lastLesson)
    else if (bench.freeList.length) bench.openFree(bench.freeList[0].id)
    else bench.newFree('My build')
  }

  return (
    <div className={styles.layout}>
      <PartDefs />
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Wiring <span className="gradient-text">Bench</span></h1>
          <p className={styles.subtitle}>Solder real parts together, power them up, and learn from what burns.</p>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Mode">
          {[['lesson', 'Lessons'], ['free', 'Free build']].map(([kind, label]) => (
            <button key={kind} type="button" role="tab" aria-selected={bench.mode.kind === kind} className={`${styles.tab} ${bench.mode.kind === kind ? styles.tabActive : ''}`} onClick={() => switchMode(kind)}>
              {label}
            </button>
          ))}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.btnGhost} onClick={share}>
            <Share2 size={16} aria-hidden="true" /> Share
          </button>
          <button type="button" className={styles.btnPrimary} onClick={bench.powerUp} disabled={!bench.nodes.length}>
            <Zap size={16} aria-hidden="true" /> Power up
          </button>
        </div>
      </header>

      {(bench.notice || !bench.saving) && (
        <p className={styles.notice} role="status">
          {bench.notice || 'Changes are not being saved in this browser. Your build still works, but it will be lost when you close the page.'}
        </p>
      )}

      <div className={styles.workspace}>
        <aside className={styles.sidebar} aria-label={bench.mode.kind === 'lesson' ? 'Lessons' : 'Parts and workspaces'}>
          {bench.mode.kind === 'lesson' ? <LessonPanel bench={bench} /> : <FreePanel bench={bench} onAdd={addAtCentre} />}
        </aside>

        <div className={styles.benchCol}>
          <div className={styles.benchWrap} ref={wrap} onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}>
            <ReactFlow
              key={`${bench.mode.kind}:${bench.mode.id}`}
              nodes={bench.nodes}
              edges={bench.edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onNodesChange={bench.onNodesChange}
              onEdgesChange={bench.onEdgesChange}
              onConnect={bench.connect}
              connectionMode={ConnectionMode.Loose}
              connectionLineComponent={PendingLine}
              connectionRadius={22}
              deleteKeyCode={['Backspace', 'Delete']}
              minZoom={0.2}
              maxZoom={2}
              fitView
              fitViewOptions={{ padding: 0.12 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Lines} gap={32} lineWidth={1} color="rgba(255,255,255,0.05)" />
              <Controls showInteractive={false} />
            </ReactFlow>
            <div className={styles.benchTools}>
              <button type="button" className={styles.iconBtn} onClick={() => fitView({ padding: 0.12, duration: 300 })} title="Fit everything in view" aria-label="Fit everything in view">
                <Maximize2 size={16} aria-hidden="true" />
              </button>
              <button type="button" className={styles.iconBtn} onClick={bench.removeSelected} title="Delete the selected wire or part" aria-label="Delete the selected wire or part">
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
            {!bench.nodes.length && bench.mode.kind === 'free' && <p className={styles.benchEmpty}>The bench is empty. Add a part from the list on the left.</p>}
          </div>
          <ReportPanel bench={bench} />
        </div>
      </div>
    </div>
  )
}

export default function Simulator() {
  useDocumentMeta('Wiring Bench | EGIRE Robotics', 'Practise soldering an FPV drone on a realistic bench: ESC, flight controller, motors, receiver, camera and VTX, with lessons and your own workspaces.')
  return (
    <PageWrapper fullHeight>
      <ReactFlowProvider>
        <Bench />
      </ReactFlowProvider>
    </PageWrapper>
  )
}
