import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Cable,
  ChevronDown,
  Download,
  FlipHorizontal2,
  FolderOpen,
  GraduationCap,
  Hand,
  Maximize,
  MousePointer2,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Redo2,
  Share2,
  Sparkles,
  SlidersHorizontal,
  Undo2,
  Wand2,
  ZoomIn,
  ZoomOut,
  Zap,
} from 'lucide-react'
import { Background, BackgroundVariant, ConnectionMode, ReactFlow, ReactFlowProvider, useReactFlow, useViewport } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import useDocumentMeta from '@lib/useDocumentMeta'
import { PART_BY_ID, PARTS } from '../Simulator/bench/catalog.js'
import { groupByBrand, groupByCategory } from '../Simulator/bench/browse.js'
import { freeSpot } from '../Simulator/bench/placement.js'
import { PartDefs } from '../Simulator/bench/parts/art.jsx'
import PartNode from '../Simulator/bench/PartNode.jsx'
import { PartActions } from '../Simulator/bench/partActions.js'
import WireEdge, { PendingWire } from '../Simulator/bench/WireEdge.jsx'
import { BuildsPanel, PartsPanel, WiringPanel } from './panels.jsx'
import { useBuilder } from './useBuilder.js'
import styles from './WiringBuilder.module.css'

const nodeTypes = { part: PartNode }
const edgeTypes = { wire: WireEdge }

const RAIL = [
  ['wiring', 'Wiring', Cable],
  ['parts', 'Parts', Package],
  ['builds', 'Builds', FolderOpen],
]

/** Closes a menu when the click lands anywhere else. */
function useDismiss(open, close) {
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => ref.current && !ref.current.contains(e.target) && close()
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])
  return ref
}

function Builder({ embedded }) {
  const builder = useBuilder()
  const { screenToFlowPosition, fitView, zoomIn, zoomOut, setCenter } = useReactFlow()
  const { zoom } = useViewport()
  const canvas = useRef(null)
  const [tab, setTab] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches ? null : 'wiring'))
  const [menu, setMenu] = useState(null) // 'insert' | 'mode' | null
  const closeMenu = useCallback(() => setMenu(null), [])
  const menuRef = useDismiss(!!menu, closeMenu)

  const place = (type, point) => {
    const part = PART_BY_ID[type]
    const at = screenToFlowPosition(point)
    builder.addPart(type, { x: at.x - part.w / 2, y: at.y - part.h / 2 })
  }
  const addAtCentre = (type) => {
    const box = canvas.current.getBoundingClientRect()
    const centre = screenToFlowPosition({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
    builder.addPart(type, freeSpot(centre, PART_BY_ID[type], builder.nodes))
    setMenu(null)
  }
  const onDrop = (e) => {
    e.preventDefault()
    const type = e.dataTransfer.getData('application/x-bench-part')
    if (type) place(type, { x: e.clientX, y: e.clientY })
  }

  const focusPart = (id) => {
    const node = builder.nodes.find((n) => n.id === id)
    if (!node) return
    const part = PART_BY_ID[node.data.type]
    builder.select(id)
    setCenter(node.position.x + part.w / 2, node.position.y + part.h / 2, { zoom: Math.max(zoom, 0.9), duration: 350 })
  }

  const share = async () => {
    const link = builder.shareLink()
    try {
      await navigator.clipboard.writeText(link)
      builder.setNotice('Link copied. Anyone who opens it gets this build as their own copy.')
    } catch {
      window.prompt('Copy this link to share your build', link)
    }
  }

  const download = async () => {
    fitView({ padding: 0.12, duration: 0 })
    await new Promise((r) => setTimeout(r, 250))
    try {
      const { default: domtoimage } = await import('dom-to-image-more')
      const url = await domtoimage.toPng(canvas.current, { bgcolor: '#ffffff', filter: (n) => !(n.classList && n.classList.contains(styles.exportHide)) })
      const a = document.createElement('a')
      a.href = url
      a.download = `${(builder.current.name || 'wiring-build').replace(/[^\w-]+/g, '-')}.png`
      a.click()
    } catch {
      builder.setNotice('The picture could not be made in this browser.')
    }
  }

  // Undo and redo from the keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable) return
      const key = e.key.toLowerCase()
      if (key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        builder.flip()
        return
      }
      if (!(e.ctrlKey || e.metaKey)) return
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault()
        builder.undo()
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault()
        builder.redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [builder])

  const hand = builder.tool === 'hand'
  const actions = useMemo(() => ({ flip: builder.flip }), [builder.flip])

  return (
    <div className={`${styles.app} ${embedded ? styles.embedded : ''}`}>
      <PartDefs />
      <header className={styles.header}>
        {!embedded && (
          <>
            <Link to="/" className={styles.brand} aria-label="EGIRE Robotics home">
              <img src="/images/logo-egire-robotics.png" alt="EGIRE Robotics" height="26" />
            </Link>
            <span className={styles.product}>Wiring Builder</span>
          </>
        )}
        <input
          className={styles.nameInput}
          value={builder.current.name}
          onChange={(e) => builder.rename(e.target.value.slice(0, 40))}
          aria-label="Build name"
          placeholder="Name your build"
        />
        <div className={styles.headerActions}>
          {!embedded && (
            <Link to="/wiring-lab/lessons" className={styles.ghost}>
              <GraduationCap size={16} aria-hidden="true" /> <span className={styles.label}>Lessons</span>
            </Link>
          )}
          <button type="button" className={styles.ghost} onClick={share}>
            <Share2 size={16} aria-hidden="true" /> <span className={styles.label}>Share</span>
          </button>
          <button type="button" className={styles.primary} onClick={builder.powerUp} disabled={!builder.nodes.length}>
            <Zap size={16} aria-hidden="true" /> <span className={styles.label}>Power up</span>
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.rail} aria-label="Builder sections">
          {RAIL.map(([id, label, Icon]) => (
            <button key={id} type="button" className={`${styles.railBtn} ${tab === id ? styles.railOn : ''}`} onClick={() => setTab(tab === id ? null : id)} aria-pressed={tab === id} title={label}>
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {tab && (
          <aside className={styles.panel} aria-label={RAIL.find((r) => r[0] === tab)[1]}>
            <div className={styles.panelHead}>
              <h2>{RAIL.find((r) => r[0] === tab)[1]}</h2>
              <button type="button" className={styles.iconBtn} onClick={() => setTab(null)} aria-label="Close the panel">
                <PanelLeftClose size={16} aria-hidden="true" />
              </button>
            </div>
            {tab === 'wiring' && <WiringPanel builder={builder} onFocus={focusPart} />}
            {tab === 'parts' && <PartsPanel onAdd={addAtCentre} />}
            {tab === 'builds' && <BuildsPanel builder={builder} />}
          </aside>
        )}

        <div className={`${styles.canvas} ${hand ? styles.canvasHand : ''} ${builder.soldering ? styles.soldering : ''}`} ref={canvas} onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' }}>
          <PartActions.Provider value={actions}>
          <ReactFlow
            nodes={builder.nodes}
            edges={builder.edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={builder.onNodesChange}
            onEdgesChange={builder.onEdgesChange}
            onNodeDragStart={builder.onNodeDragStart}
            onConnect={builder.connect}
            onConnectStart={builder.onConnectStart}
            onConnectEnd={builder.onConnectEnd}
            connectionMode={ConnectionMode.Loose}
            connectionLineComponent={PendingWire}
            connectionRadius={22}
            nodesDraggable={!hand}
            nodesConnectable={!hand}
            elementsSelectable={!hand}
            deleteKeyCode={['Backspace', 'Delete']}
            minZoom={0.15}
            maxZoom={2}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#d5d9df" />
          </ReactFlow>
          </PartActions.Provider>

          {!tab && (
            <button type="button" className={`${styles.openPanel} ${styles.exportHide}`} onClick={() => setTab('wiring')} aria-label="Open the panel">
              <PanelLeftOpen size={18} aria-hidden="true" />
            </button>
          )}

          {builder.notice && (
            <p className={`${styles.toast} ${styles.exportHide}`} role="status">
              {builder.notice}
            </p>
          )}
          {!builder.saving && <p className={`${styles.unsaved} ${styles.exportHide}`}>Not being saved in this browser</p>}
          {!builder.nodes.length && (
            <div className={`${styles.emptyCanvas} ${styles.exportHide}`}>
              <h2>Start your build</h2>
              <p>Add a part, then drag from a wire tip or a pad to another pad to solder them together.</p>
              <button type="button" className={styles.primary} onClick={() => setTab('parts')}>
                <Plus size={16} aria-hidden="true" /> Add the first part
              </button>
            </div>
          )}

          <div className={`${styles.toolbar} ${styles.exportHide}`} ref={menuRef}>
            <div className={styles.menuWrap}>
              <button type="button" className={styles.toolText} onClick={() => setMenu(menu === 'insert' ? null : 'insert')} aria-expanded={menu === 'insert'}>
                <Plus size={16} aria-hidden="true" /> <span className={styles.label}>Insert part</span>
              </button>
              {menu === 'insert' && (
                <ul className={styles.menu} role="menu">
                  {groupByBrand(PARTS).map((g) => (
                    <li key={g.brand} role="none">
                      <p className={styles.menuHead}>{g.brand}</p>
                      {groupByCategory(g.parts).map((c) => (
                        <ul key={c.category} role="group" aria-label={`${g.brand} ${c.category}`}>
                          {g.parts.length > 12 && <li className={styles.menuSub}>{c.category}</li>}
                          {c.parts.map((p) => (
                            <li key={p.id}>
                              <button type="button" role="menuitem" onClick={() => addAtCentre(p.id)}>
                                {p.brand === 'Generic' ? p.name : p.model}
                              </button>
                            </li>
                          ))}
                        </ul>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className={styles.menuWrap}>
              <button type="button" className={styles.toolText} onClick={() => setMenu(menu === 'mode' ? null : 'mode')} aria-expanded={menu === 'mode'}>
                {builder.mode === 'assisted' ? <Sparkles size={16} aria-hidden="true" /> : <SlidersHorizontal size={16} aria-hidden="true" />}
                <span className={styles.label}>{builder.mode === 'assisted' ? 'Assisted' : 'Manual'}</span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              {menu === 'mode' && (
                <ul className={styles.menu} role="menu">
                  <li>
                    <button type="button" role="menuitemradio" aria-checked={builder.mode === 'assisted'} onClick={() => { builder.setMode('assisted'); setMenu(null) }}>
                      <strong>Assisted</strong>
                      <small>Live checks, and the pads that fit light up while you wire.</small>
                    </button>
                  </li>
                  <li>
                    <button type="button" role="menuitemradio" aria-checked={builder.mode === 'manual'} onClick={() => { builder.setMode('manual'); setMenu(null) }}>
                      <strong>Manual</strong>
                      <small>No help while you wire. Check when you are ready.</small>
                    </button>
                  </li>
                </ul>
              )}
            </div>
            <span className={styles.sep} />
            <button type="button" className={`${styles.tool} ${!hand ? styles.toolOn : ''}`} onClick={() => builder.setTool('select')} aria-pressed={!hand} title="Select and wire" aria-label="Select and wire">
              <MousePointer2 size={18} aria-hidden="true" />
            </button>
            <button type="button" className={`${styles.tool} ${hand ? styles.toolOn : ''}`} onClick={() => builder.setTool('hand')} aria-pressed={hand} title="Move around the canvas" aria-label="Move around the canvas">
              <Hand size={18} aria-hidden="true" />
            </button>
            <button type="button" className={styles.toolText} onClick={() => builder.flip()} disabled={!builder.nodes.length} title="Turn the selected part over to its other side (F)">
              <FlipHorizontal2 size={16} aria-hidden="true" /> <span className={styles.label}>Turn over</span>
            </button>
            <button
              type="button"
              className={styles.toolText}
              onClick={() => {
                builder.tidy()
                setTimeout(() => fitView({ padding: 0.15, duration: 350 }), 60)
              }}
              disabled={!builder.nodes.length}
              title="Arrange the parts like a wiring diagram"
            >
              <Wand2 size={16} aria-hidden="true" /> <span className={styles.label}>Tidy up</span>
            </button>
            <span className={styles.sep} />
            <button type="button" className={styles.tool} onClick={builder.undo} disabled={!builder.canUndo} title="Undo (Ctrl+Z)" aria-label="Undo">
              <Undo2 size={18} aria-hidden="true" />
            </button>
            <button type="button" className={styles.tool} onClick={builder.redo} disabled={!builder.canRedo} title="Redo (Ctrl+Shift+Z)" aria-label="Redo">
              <Redo2 size={18} aria-hidden="true" />
            </button>
            <span className={styles.sep} />
            <button type="button" className={`${styles.tool} ${styles.wide}`} onClick={() => zoomOut({ duration: 200 })} title="Zoom out" aria-label="Zoom out">
              <ZoomOut size={18} aria-hidden="true" />
            </button>
            <span className={`${styles.zoom} ${styles.wide}`}>{Math.round(zoom * 100)}%</span>
            <button type="button" className={`${styles.tool} ${styles.wide}`} onClick={() => zoomIn({ duration: 200 })} title="Zoom in" aria-label="Zoom in">
              <ZoomIn size={18} aria-hidden="true" />
            </button>
            <button type="button" className={styles.tool} onClick={() => fitView({ padding: 0.15, duration: 300 })} title="Fit everything in view" aria-label="Fit everything in view">
              <Maximize size={18} aria-hidden="true" />
            </button>
            <span className={styles.sep} />
            <button type="button" className={styles.tool} onClick={download} title="Download a picture" aria-label="Download a picture" disabled={!builder.nodes.length}>
              <Download size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// embedded: the builder is shown inside the Wiring lab, which supplies the navigation and the lessons switch
export default function WiringBuilder({ embedded = false }) {
  useDocumentMeta('Wiring Builder | EGIRE Robotics', 'Build an FPV drone wiring diagram: add real parts, solder wires pad to pad, and see what is connected, what is missing and what would burn.')
  return (
    <ReactFlowProvider>
      <Builder embedded={embedded} />
    </ReactFlowProvider>
  )
}
