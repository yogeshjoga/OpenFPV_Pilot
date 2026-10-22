import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import { PART_BY_ID } from '../Simulator/bench/catalog.js'
import { runChecks } from '../Simulator/bench/checks.js'
import { fromFlow, labelNodes, lookOf, redrawEdges, toFlowEdges, toFlowNodes } from '../Simulator/bench/flowModel.js'
import { matesFor } from '../Simulator/bench/mates.js'
import { tidyLayout } from '../Simulator/bench/placement.js'
import { summarize } from '../Simulator/bench/summary.js'
import { browserStorage, cleanWorkspace, createStore, decodeBuild, emptyWorkspace, encodeBuild, newId } from '../Simulator/bench/workspaces.js'

const HISTORY = 60

/** Everything the builder page needs: the build on the canvas, saved builds, undo and redo, and the wiring checks. */
export function useBuilder() {
  const store = useMemo(() => createStore(browserStorage()), [])
  const [builds, setBuilds] = useState(() => store.listFree())
  const [current, setCurrent] = useState({ id: '', name: '' })
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [past, setPast] = useState([])
  const [future, setFuture] = useState([])
  const [mode, setMode] = useState('assisted') // assisted: live checks and matching pads lit; manual: checks only on request
  const [tool, setTool] = useState('select') // select, or hand to move around without changing anything
  const [checked, setChecked] = useState(null)
  const [notice, setNotice] = useState('')
  const [soldering, setSoldering] = useState(false) // a wire is being dragged from a pad: the pointer becomes a soldering iron
  const latest = useRef({ nodes: [], edges: [] })
  const ready = useRef(false)

  useEffect(() => {
    latest.current = { nodes, edges }
  })

  const load = useCallback((model) => {
    ready.current = false
    const clean = cleanWorkspace(model)
    setNodes(toFlowNodes(clean.nodes, true))
    setEdges(toFlowEdges(clean.nodes, clean.wires))
    setPast([])
    setFuture([])
    setChecked(null)
    requestAnimationFrame(() => (ready.current = true))
  }, [])

  // ---- builds ----
  const open = useCallback(
    (id) => {
      const ws = store.getFree(id)
      if (!ws) return
      setCurrent({ id: ws.id, name: ws.name })
      load(ws)
    },
    [load, store],
  )
  const create = useCallback(
    (name = 'My build', model) => {
      const ws = { ...emptyWorkspace(name), ...(model ?? {}) }
      store.putFree(ws)
      setBuilds(store.listFree())
      setCurrent({ id: ws.id, name: ws.name })
      load(ws)
    },
    [load, store],
  )

  const importShared = useCallback(() => {
    const hash = window.location.hash
    if (!hash.startsWith('#b=')) return false
    const model = decodeBuild(hash.slice(3))
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    if (model && model.nodes.length) {
      create('Shared build', model)
      setNotice('Opened the shared build as a new build.')
      return true
    }
    setNotice('That share link could not be opened. It may be damaged.')
    return false
  }, [create])

  const booted = useRef(null) // remembered, so React's double run of effects in development does not undo an imported link
  useEffect(() => {
    if (booted.current === null) booted.current = importShared()
    if (!booted.current) {
      const all = store.listFree()
      if (all.length) open(all[0].id)
      else create('My first build')
    }
    window.addEventListener('hashchange', importShared)
    return () => window.removeEventListener('hashchange', importShared)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!notice) return undefined
    const t = setTimeout(() => setNotice(''), 4500)
    return () => clearTimeout(t)
  }, [notice])

  // ---- autosave ----
  useEffect(() => {
    if (!ready.current || !current.id) return undefined
    const t = setTimeout(() => {
      store.putFree({ id: current.id, name: current.name || 'My build', ...fromFlow(nodes, edges) })
      setBuilds(store.listFree())
    }, 500)
    return () => clearTimeout(t)
  }, [nodes, edges, current, store])

  // ---- history ----
  const commit = useCallback(() => {
    const { nodes: n, edges: e } = latest.current
    setPast((p) => [...p.slice(-(HISTORY - 1)), fromFlow(n, e)])
    setFuture([])
  }, [])

  const restore = (model) => {
    setNodes(toFlowNodes(model.nodes, true))
    setEdges(toFlowEdges(model.nodes, model.wires))
    setChecked(null)
  }
  const undo = useCallback(() => {
    if (!past.length) return
    const { nodes: n, edges: e } = latest.current
    setFuture((f) => [...f, fromFlow(n, e)])
    restore(past[past.length - 1])
    setPast((p) => p.slice(0, -1))
  }, [past])
  const redo = useCallback(() => {
    if (!future.length) return
    const { nodes: n, edges: e } = latest.current
    setPast((p) => [...p, fromFlow(n, e)])
    restore(future[future.length - 1])
    setFuture((f) => f.slice(0, -1))
  }, [future])

  // ---- editing ----
  const clearEffects = useCallback(() => {
    setChecked(null)
    setNodes((ns) => ns.map((n) => (n.data.smoke || n.data.running || n.data.mates ? { ...n, data: { ...n.data, smoke: false, running: false, mates: undefined } } : n)))
  }, [])

  const onNodesChange = useCallback(
    (changes) => {
      const removing = changes.some((c) => c.type === 'remove')
      if (removing) commit()
      setNodes((ns) => applyNodeChanges(changes, ns))
      if (removing) clearEffects()
    },
    [clearEffects, commit],
  )
  const onEdgesChange = useCallback(
    (changes) => {
      const removing = changes.some((c) => c.type === 'remove')
      if (removing) commit()
      setEdges((es) => applyEdgeChanges(changes, es))
      if (removing) clearEffects()
    },
    [clearEffects, commit],
  )
  const onNodeDragStart = useCallback(() => commit(), [commit])

  const connect = useCallback(
    (c) => {
      if (!c.source || !c.target || (c.source === c.target && c.sourceHandle === c.targetHandle)) return
      const a = `${c.source}:${c.sourceHandle}`
      const b = `${c.target}:${c.targetHandle}`
      const { nodes: n, edges: es } = latest.current
      const same = (e, x, y) => `${e.source}:${e.sourceHandle}` === x && `${e.target}:${e.targetHandle}` === y
      if (es.some((e) => same(e, a, b) || same(e, b, a))) return
      commit()
      const byId = new Map(n.map((x) => [x.id, { id: x.id, type: x.data.type, flip: x.data.flip }]))
      setEdges((list) => [...list, { id: newId('w'), source: c.source, sourceHandle: c.sourceHandle, target: c.target, targetHandle: c.targetHandle, type: 'wire', data: lookOf(byId, a, b, list.length) }])
      clearEffects()
    },
    [clearEffects, commit],
  )

  const addPart = useCallback(
    (type, position) => {
      if (!PART_BY_ID[type]) return
      commit()
      setNodes((ns) => [...ns.map((n) => (n.selected ? { ...n, selected: false } : n)), { id: newId('p'), type: 'part', position, data: { type }, deletable: true, selected: true }])
      clearEffects()
    },
    [clearEffects, commit],
  )

  const removeSelected = useCallback(() => {
    const { nodes: n, edges: es } = latest.current
    const gone = new Set(n.filter((x) => x.selected).map((x) => x.id))
    if (!gone.size && !es.some((e) => e.selected)) return
    commit()
    setNodes((ns) => ns.filter((x) => !gone.has(x.id)))
    setEdges((list) => list.filter((e) => !e.selected && !gone.has(e.source) && !gone.has(e.target)))
    clearEffects()
  }, [clearEffects, commit])

  // Arranges the whole build like a wiring diagram
  const tidy = useCallback(() => {
    const { nodes: n, edges: es } = latest.current
    if (!n.length) return
    commit()
    const model = fromFlow(n, es)
    const at = tidyLayout(model.nodes, model.wires)
    setNodes((ns) => ns.map((x) => (at[x.id] ? { ...x, position: at[x.id] } : x)))
  }, [commit])

  // Turn parts over to reach the pads on their back. Without ids it turns the selected parts.
  const flip = useCallback(
    (id) => {
      const { nodes: n, edges: es } = latest.current
      const picked = id ? [id] : n.filter((x) => x.selected).map((x) => x.id)
      // nothing picked: a lone part is the obvious one, otherwise ask
      if (!picked.length && n.length === 1) picked.push(n[0].id)
      if (!picked.length) {
        if (n.length) setNotice('Click a part first, then turn it over.')
        return
      }
      const ids = new Set(picked)
      commit()
      const next = n.map((x) => (ids.has(x.id) ? { ...x, data: { ...x.data, flip: !x.data.flip, mates: undefined } } : x))
      setNodes(next)
      setEdges(redrawEdges(next, es))
    },
    [commit],
  )

  const select = useCallback((id) => setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === id }))), [])

  // Assisted mode: while a wire is dragged from a pad, light up the pads that fit it
  const onConnectStart = useCallback(
    (_, { nodeId, handleId }) => {
      setSoldering(true)
      if (mode !== 'assisted' || !nodeId) return
      const model = fromFlow(latest.current.nodes, latest.current.edges)
      const mates = matesFor(model.nodes, nodeId, handleId)
      setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, mates: mates[n.id] } })))
    },
    [mode],
  )
  const onConnectEnd = useCallback(() => {
    setSoldering(false)
    setNodes((ns) => ns.map((n) => (n.data.mates ? { ...n, data: { ...n.data, mates: undefined } } : n)))
  }, [])

  // ---- checking ----
  const wiringKey = nodes.map((n) => `${n.id}.${n.data.type}`).join() + '|' + edges.map((e) => `${e.source}${e.sourceHandle}${e.target}${e.targetHandle}`).join()
  const live = useMemo(() => {
    const model = fromFlow(nodes, edges)
    return runChecks(model.nodes, model.wires)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wiringKey])
  const report = mode === 'assisted' ? live : checked
  const rows = useMemo(() => {
    const model = fromFlow(nodes, edges)
    return summarize(model.nodes, model.wires, report)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wiringKey, report])

  const check = useCallback(() => setChecked(live), [live])
  const powerUp = useCallback(() => {
    const spinning = Object.keys(live.spins).length
    setChecked(live)
    setNodes((ns) => ns.map((n) => ({ ...n, data: { ...n.data, smoke: live.smoke.includes(n.id), running: !!live.spins[n.id], dir: live.spins[n.id] } })))
    if (live.faults) setNotice('Something would burn. See the Wiring list.')
    else if (spinning) setNotice(`Powered up. ${spinning} motor${spinning > 1 ? 's are' : ' is'} spinning.`)
    else setNotice('Powered up. No motors are wired to spin yet.')
  }, [live])

  // ---- builds ----
  const rename = useCallback((name) => setCurrent((c) => ({ ...c, name })), [])
  const duplicate = useCallback(() => create(`${current.name || 'My build'} copy`, fromFlow(nodes, edges)), [create, current.name, edges, nodes])
  const remove = useCallback(() => {
    store.removeFree(current.id)
    const rest = store.listFree()
    setBuilds(rest)
    if (rest.length) open(rest[0].id)
    else create('My first build')
  }, [create, current.id, open, store])
  const shareLink = useCallback(() => `${window.location.origin}/wiring-builder#b=${encodeBuild(fromFlow(nodes, edges))}`, [edges, nodes])

  const named = useMemo(() => labelNodes(nodes, (type) => PART_BY_ID[type]?.name ?? type), [nodes])
  const nameOf = useMemo(() => Object.fromEntries(named.map((n) => [n.id, n.data.label])), [named])
  const rowsNamed = useMemo(() => rows.map((r) => ({ ...r, label: nameOf[r.id] ?? r.name })), [rows, nameOf])

  return {
    builds, current, nodes: named, edges, rows: rowsNamed, report, live, mode, tool, notice, soldering, saving: store.saving, canUndo: past.length > 0, canRedo: future.length > 0,
    setMode, setTool, setNotice, onNodesChange, onEdgesChange, onNodeDragStart, onConnectStart, onConnectEnd, connect, addPart, removeSelected, flip, select, tidy, undo, redo, check, powerUp,
    open, create, rename, duplicate, remove, shareLink,
  }
}
