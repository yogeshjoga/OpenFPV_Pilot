import { useState, useCallback, useRef } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import PageWrapper from '@components/layout/PageWrapper'
import { ESCNode, MotorNode, BatteryNode, CapacitorNode, FCNode, GPSNode, VTXNode, CameraNode, FrameNode } from './components/Nodes'
import Sidebar from './components/Sidebar'
import styles from './Simulator.module.css'

const nodeTypes = {
  esc: ESCNode,
  motor: MotorNode,
  battery: BatteryNode,
  capacitor: CapacitorNode,
  fc: FCNode,
  gps: GPSNode,
  vtx: VTXNode,
  camera: CameraNode,
  frame: FrameNode,
}

const scenarios = {
  powerLoop: {
    name: 'Step 1: Power Loop',
    nodes: [],
  },
  flightController: {
    name: 'Step 2: Flight Controller',
    nodes: [
      { id: 'esc', type: 'esc', position: { x: 400, y: 250 }, data: {} },
      { id: 'm1', type: 'motor', position: { x: 700, y: 100 }, data: { label: 'Motor 1', align: 'left', spinDir: 'ccw', isRunning: false } },
      { id: 'm2', type: 'motor', position: { x: 700, y: 400 }, data: { label: 'Motor 2', align: 'left', spinDir: 'cw', isRunning: false } },
      { id: 'm3', type: 'motor', position: { x: 100, y: 400 }, data: { label: 'Motor 3', align: 'right', spinDir: 'ccw', isRunning: false } },
      { id: 'm4', type: 'motor', position: { x: 100, y: 100 }, data: { label: 'Motor 4', align: 'right', spinDir: 'cw', isRunning: false } },
      { id: 'bat', type: 'battery', position: { x: 450, y: 550 }, data: {} },
      { id: 'cap', type: 'capacitor', position: { x: 350, y: 550 }, data: {} },
    ]
  },
  sandbox: {
    name: 'Full FPV Build Sandbox',
    nodes: [],
  }
}

let idCounter = 0;
const getId = () => `dndnode_${idCounter++}`;

function SimulatorInner() {
  const reactFlowWrapper = useRef(null)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [diagnostics, setDiagnostics] = useState(null)
  const [scenario, setScenario] = useState('sandbox')
  const { screenToFlowPosition } = useReactFlow()

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  )
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  )
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    []
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow/type')
      const label = event.dataTransfer.getData('application/reactflow/label')

      if (typeof type === 'undefined' || !type) {
        return
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      })
      
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${label}` },
      }

      setNodes((nds) => nds.concat(newNode))
    },
    [screenToFlowPosition]
  )

  const handleScenarioChange = (e) => {
    const key = e.target.value
    setScenario(key)
    setNodes(scenarios[key].nodes.map(n => ({...n}))) // Clone array
    setEdges([])
    setDiagnostics(null)
  }

  const runDiagnostics = () => {
    const results = []
    
    // Check if empty
    if (nodes.length === 0) {
      setDiagnostics([{ type: 'warning', msg: 'The canvas is empty. Drag some parts from the library!' }])
      return
    }

    // Helper to find node by type
    const escNode = nodes.find(n => n.type === 'esc')
    const fcNode = nodes.find(n => n.type === 'fc')
    const motors = nodes.filter(n => n.type === 'motor')
    const batNode = nodes.find(n => n.type === 'battery')
    const capNode = nodes.find(n => n.type === 'capacitor')
    const gpsNode = nodes.find(n => n.type === 'gps')
    const vtxNode = nodes.find(n => n.type === 'vtx')
    const camNode = nodes.find(n => n.type === 'camera')

    // Polarity Check
    if (batNode && escNode) {
      const batPosEdge = edges.find(e => e.source === batNode.id && e.sourceHandle === 'bat_pos')
      const batNegEdge = edges.find(e => e.source === batNode.id && e.sourceHandle === 'bat_neg')
      if (batPosEdge && batNegEdge) {
        if (batPosEdge.targetHandle === 'bat_pos' && batNegEdge.targetHandle === 'bat_neg') {
          results.push({ type: 'success', msg: 'Battery polarity correct.' })
        } else {
          results.push({ type: 'error', msg: 'CRITICAL: Battery reversed! Magic smoke imminent.' })
        }
      } else {
        results.push({ type: 'warning', msg: 'Battery is not fully wired.' })
      }
    }

    if (capNode && escNode) {
      const capPosEdge = edges.find(e => e.source === capNode.id && e.sourceHandle === 'cap_pos')
      const capNegEdge = edges.find(e => e.source === capNode.id && e.sourceHandle === 'cap_neg')
      if (capPosEdge && capNegEdge) {
        if (capPosEdge.targetHandle === 'cap_pos' && capNegEdge.targetHandle === 'cap_neg') {
          results.push({ type: 'success', msg: 'Capacitor polarity correct.' })
        } else if (capPosEdge.targetHandle === 'cap_neg' || capNegEdge.targetHandle === 'cap_pos') {
          results.push({ type: 'error', msg: 'CRITICAL: Capacitor reversed! It will explode.' })
        }
      } else {
        results.push({ type: 'warning', msg: 'Capacitor missing or not fully wired.' })
      }
    }

    // Check Motors
    if (escNode) {
      motors.forEach((m, index) => {
        const motorEdges = edges.filter(e => e.source === m.id)
        if (motorEdges.length < 3) {
          results.push({ type: 'error', msg: `${m.data.label || 'A Motor'} is missing wires.` })
        } else {
          results.push({ type: 'success', msg: `${m.data.label || 'A Motor'} is fully wired to ESC.` })
        }
      })
    }

    if (fcNode && escNode) {
      const fcEscChecks = ['vbat', 'gnd', 'm1', 'm2', 'm3', 'm4']
      let fcEscMissing = false
      fcEscChecks.forEach(pad => {
        const isConnected = edges.some(e => 
          (e.source === fcNode.id && e.sourceHandle === `esc_${pad}` && e.target === escNode.id && e.targetHandle.includes(pad)) ||
          (e.target === fcNode.id && e.targetHandle === `esc_${pad}` && e.source === escNode.id && e.sourceHandle.includes(pad))
        )
        if (!isConnected) fcEscMissing = true
      })
      if (fcEscMissing) {
        results.push({ type: 'error', msg: 'FC to ESC wiring incomplete. Need VBAT, GND, and M1-M4 signals.' })
      } else {
        results.push({ type: 'success', msg: 'FC to ESC wiring correct.' })
      }
    }

    if (gpsNode && fcNode) {
      const gps5v = edges.find(e => (e.source === gpsNode.id && e.sourceHandle === 'gps_5v' && e.targetHandle === 'gps_5v') || (e.target === gpsNode.id && e.targetHandle === 'gps_5v' && e.sourceHandle === 'gps_5v'))
      const gpsGnd = edges.find(e => (e.source === gpsNode.id && e.sourceHandle === 'gps_gnd' && e.targetHandle === 'gps_gnd') || (e.target === gpsNode.id && e.targetHandle === 'gps_gnd' && e.sourceHandle === 'gps_gnd'))
      const gpsTxToRx = edges.find(e => (e.source === gpsNode.id && e.sourceHandle === 'gps_tx' && e.targetHandle === 'gps_rx') || (e.target === gpsNode.id && e.targetHandle === 'gps_tx' && e.sourceHandle === 'gps_rx'))
      const gpsRxToTx = edges.find(e => (e.source === gpsNode.id && e.sourceHandle === 'gps_rx' && e.targetHandle === 'gps_tx') || (e.target === gpsNode.id && e.targetHandle === 'gps_rx' && e.sourceHandle === 'gps_tx'))
      
      if (gps5v && gpsGnd && gpsTxToRx && gpsRxToTx) {
        results.push({ type: 'success', msg: 'GPS wired correctly (Cross-over TX->RX).' })
      } else {
        results.push({ type: 'error', msg: 'GPS is wired incorrectly. Remember TX goes to RX!' })
      }
    }

    let isSuccess = false
    if (results.every(r => r.type === 'success') && results.length > 0) {
      results.unshift({ type: 'success', msg: '🎉 PERFECT BUILD! Props are spinning!' })
      isSuccess = true
    } else {
      results.unshift({ type: 'error', msg: 'Build Incomplete or Errors found.' })
    }

    // Update Motor Nodes to spin
    setNodes(nds => nds.map(n => {
      if (n.type === 'motor') {
        // assign alternating spin direction if not set
        const spinDir = n.data.spinDir || (Math.random() > 0.5 ? 'cw' : 'ccw');
        return { ...n, data: { ...n.data, spinDir, isRunning: isSuccess } }
      }
      return n
    }))

    setDiagnostics(results)
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Wiring <span className="gradient-text">Simulator</span></h1>
          <p className={styles.subtitle}>Drag wires between components to practice soldering maps.</p>
        </div>
        <div className={styles.controls}>
          <select className={styles.scenarioSelect} value={scenario} onChange={handleScenarioChange}>
            {Object.keys(scenarios).map(key => (
              <option key={key} value={key}>{scenarios[key].name}</option>
            ))}
          </select>
          <button className={styles.btn} onClick={runDiagnostics}>Check Connections</button>
        </div>
      </header>
      
      <div className={styles.workspace}>
        <Sidebar />
        <div className={styles.canvasWrap} ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            defaultEdgeOptions={{ style: { strokeWidth: 4, stroke: '#8b9ab4' } }}
          >
            <Background color="#2a2e38" gap={20} />
            <Controls />
          </ReactFlow>

          {diagnostics && (
            <div className={styles.diagnostics}>
              <button className={styles.closeBtn} onClick={() => setDiagnostics(null)}>✖</button>
              <h3 className={styles.diagTitle}>Diagnostics Report</h3>
              <ul className={styles.diagList}>
                {diagnostics.map((d, i) => (
                  <li key={i} className={`${styles.diagItem} ${
                    d.type === 'error' ? styles.diagError :
                    d.type === 'success' ? styles.diagSuccess : styles.diagWarning
                  }`}>
                    {d.type === 'error' && '❌ '}
                    {d.type === 'success' && '✅ '}
                    {d.type === 'warning' && '⚠️ '}
                    {d.msg}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Simulator() {
  return (
    <PageWrapper fullHeight>
      <ReactFlowProvider>
        <SimulatorInner />
      </ReactFlowProvider>
    </PageWrapper>
  )
}
