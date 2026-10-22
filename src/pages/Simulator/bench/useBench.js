import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import { PART_BY_ID } from './catalog.js'
import { fromFlow, lookOf, redrawEdges, toFlowEdges, toFlowNodes } from './flowModel.js'
import { runChecks } from './checks.js'
import { LESSON_BY_ID, LESSONS, lessonGoals } from './lessons.js'
import { browserStorage, cleanWorkspace, createStore, decodeBuild, emptyWorkspace, encodeBuild, newId } from './workspaces.js'

const freshLesson = (lesson) => ({
  nodes: lesson.nodes.map((n) => ({ ...n })),
  wires: lesson.prewired.map((w, i) => ({ id: `pre${i}`, a: w.a, b: w.b })),
})

const solved = (lesson) => {
  const list = lesson.solutionIsComplete ? lesson.solution : [...lesson.prewired, ...lesson.solution]
  return { nodes: lesson.nodes.map((n) => ({ ...n })), wires: list.map((w, i) => ({ id: `sol${i}`, a: w.a, b: w.b })) }
}

/** Everything the bench page needs: the build on the bench, workspaces, lessons, the power-up report. */
export function useBench() {
  const store = useMemo(() => createStore(browserStorage()), [])
  const [mode, setMode] = useState({ kind: 'lesson', id: LESSONS[0].id })
  const [freeName, setFreeName] = useState('')
  const [lastLesson, setLastLesson] = useState(LESSONS[0].id)
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [report, setReport] = useState(null)
  const [outcome, setOutcome] = useState(null)
  const [answerShown, setAnswerShown] = useState(false) // a revealed answer is not the student's own work
  const [freeList, setFreeList] = useState(() => store.listFree())
  const [progress, setProgress] = useState(() => store.getProgress())
  const [notice, setNotice] = useState('')
  const startedAt = useRef(null)
  const loaded = useRef(false)

  const lesson = mode.kind === 'lesson' ? LESSON_BY_ID[mode.id] : null

  // ---- loading a lesson or a workspace onto the bench ----
  const put = useCallback(
    (model, deletable) => {
      loaded.current = false
      const clean = cleanWorkspace(model)
      setNodes(toFlowNodes(clean.nodes, deletable))
      setEdges(toFlowEdges(clean.nodes, clean.wires))
      setReport(null)
      setOutcome(null)
      startedAt.current = null
      setAnswerShown(false)
      requestAnimationFrame(() => (loaded.current = true))
    },
    [],
  )

  const openLesson = useCallback(
    (id) => {
      const def = LESSON_BY_ID[id]
      if (!def) return
      const saved = store.getLesson(id)
      setMode({ kind: 'lesson', id })
      setLastLesson(id)
      put(saved ?? freshLesson(def), false)
    },
    [put, store],
  )

  const openFree = useCallback(
    (id) => {
      const ws = store.getFree(id)
      if (!ws) return
      setMode({ kind: 'free', id })
      setFreeName(ws.name)
      put(ws, true)
    },
    [put, store],
  )

  const newFree = useCallback(
    (name = 'My build', model) => {
      const ws = { ...emptyWorkspace(name), ...(model ?? {}) }
      store.putFree(ws)
      setFreeList(store.listFree())
      setMode({ kind: 'free', id: ws.id })
      setFreeName(ws.name)
      put(ws, true)
    },
    [put, store],
  )

  // A shared link opens as a new workspace, both when the page loads and when a link is pasted into the open page
  const importShared = useCallback(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : ''
    if (!hash.startsWith('#b=')) return false
    const model = decodeBuild(hash.slice(3))
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    if (model && model.nodes.length) {
      newFree('Shared build', model)
      setNotice('Opened the shared build as a new workspace.')
    } else {
      setNotice('That share link could not be opened. It may be damaged.')
    }
    return !!(model && model.nodes.length)
  }, [newFree])

  // First load: a shared link, else the first lesson
  const booted = useRef(null) // remembered, so React's double run of effects in development does not undo an imported link
  useEffect(() => {
    if (booted.current === null) booted.current = importShared()
    if (!booted.current) openLesson(LESSONS[0].id)
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
    if (!loaded.current || !nodes.length) return undefined
    const t = setTimeout(() => {
      const model = fromFlow(nodes, edges)
      if (mode.kind === 'lesson') store.putLesson(mode.id, { id: mode.id, name: lesson.title, ...model })
      else {
        store.putFree({ id: mode.id, name: freeName || 'My build', ...model })
        setFreeList(store.listFree())
      }
    }, 500)
    return () => clearTimeout(t)
  }, [nodes, edges, mode, freeName, lesson, store])

  // ---- live checks, only recomputed when the wiring changes, not when a part is dragged ----
  const wiringKey = nodes.map((n) => `${n.id}.${n.data.type}`).join() + '|' + edges.map((e) => `${e.source}${e.sourceHandle}${e.target}${e.targetHandle}`).join()
  const live = useMemo(() => {
    const model = fromFlow(nodes, edges)
    return runChecks(model.nodes, model.wires)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wiringKey])

  const taskState = lesson ? lesson.tasks.map((t) => ({ ...t, done: !!live.goals[t.goal] })) : []

  // ---- editing ----
  const clearEffects = useCallback(() => {
    setReport(null)
    setOutcome(null)
    setNodes((ns) => ns.map((n) => (n.data.smoke || n.data.running ? { ...n, data: { ...n.data, smoke: false, running: false } } : n)))
  }, [])

  const touch = () => {
    if (startedAt.current === null) startedAt.current = Date.now()
  }

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((ns) => applyNodeChanges(changes, ns))
      if (changes.some((c) => c.type === 'remove')) clearEffects()
    },
    [clearEffects],
  )
  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((es) => applyEdgeChanges(changes, es))
      if (changes.some((c) => c.type === 'remove')) {
        touch()
        clearEffects()
      }
    },
    [clearEffects],
  )

  const connect = useCallback(
    (c) => {
      if (!c.source || !c.target || (c.source === c.target && c.sourceHandle === c.targetHandle)) return
      const a = `${c.source}:${c.sourceHandle}`
      const b = `${c.target}:${c.targetHandle}`
      touch()
      setEdges((es) => {
        if (es.some((e) => (`${e.source}:${e.sourceHandle}` === a && `${e.target}:${e.targetHandle}` === b) || (`${e.source}:${e.sourceHandle}` === b && `${e.target}:${e.targetHandle}` === a))) return es
        const byId = new Map(nodes.map((n) => [n.id, { id: n.id, type: n.data.type, flip: n.data.flip }]))
        return [...es, { id: newId('w'), source: c.source, sourceHandle: c.sourceHandle, target: c.target, targetHandle: c.targetHandle, type: 'wire', data: lookOf(byId, a, b, es.length) }]
      })
      clearEffects()
    },
    [clearEffects, nodes],
  )

  const addPart = useCallback(
    (type, position) => {
      if (!PART_BY_ID[type] || mode.kind !== 'free') return
      touch()
      setNodes((ns) => [...ns, { id: newId('p'), type: 'part', position, data: { type }, deletable: true }])
      clearEffects()
    },
    [clearEffects, mode.kind],
  )

  // Turn parts over to reach the pads on their back (the selected parts, or the one given)
  const flip = useCallback(
    (id) => {
      if (mode.kind !== 'free') return
      const ids = new Set(id ? [id] : nodes.filter((n) => n.selected).map((n) => n.id))
      if (!ids.size) return
      touch()
      const next = nodes.map((n) => (ids.has(n.id) ? { ...n, data: { ...n.data, flip: !n.data.flip, mates: undefined } } : n))
      setNodes(next)
      setEdges((es) => redrawEdges(next, es))
      clearEffects()
    },
    [clearEffects, mode.kind, nodes],
  )

  const removeSelected = useCallback(() => {
    setEdges((es) => es.filter((e) => !e.selected))
    if (mode.kind === 'free') {
      setNodes((ns) => ns.filter((n) => !n.selected))
      setEdges((es) => {
        const gone = new Set(nodes.filter((n) => n.selected).map((n) => n.id))
        return es.filter((e) => !gone.has(e.source) && !gone.has(e.target))
      })
    }
    touch()
    clearEffects()
  }, [clearEffects, mode.kind, nodes])

  // ---- power up ----
  const powerUp = useCallback(() => {
    const model = fromFlow(nodes, edges)
    const result = runChecks(model.nodes, model.wires)
    setReport(result)
    setNodes((ns) =>
      ns.map((n) => ({ ...n, data: { ...n.data, smoke: result.smoke.includes(n.id), running: !!result.spins[n.id], dir: result.spins[n.id] } })),
    )
    if (lesson && !answerShown) {
      const passed = lessonGoals(lesson).every((g) => result.goals[g])
      const ms = startedAt.current ? Date.now() - startedAt.current : 0
      const p = store.recordAttempt(lesson.id, { passed, ms })
      setProgress(store.getProgress())
      setOutcome(passed ? { passed: true, stars: p.stars, ms, attempts: p.attempts } : { passed: false, attempts: p.attempts })
    }
  }, [answerShown, edges, lesson, nodes, store])

  // ---- lessons ----
  const restartLesson = useCallback(() => {
    if (!lesson) return
    store.resetLesson(lesson.id)
    store.restartAttempts(lesson.id)
    setProgress(store.getProgress())
    put(freshLesson(lesson), false)
  }, [lesson, put, store])

  const showAnswer = useCallback(() => {
    if (!lesson) return
    put(solved(lesson), false)
    setAnswerShown(true)
    setNotice('This is the finished wiring. Restart the lesson to try it yourself.')
  }, [lesson, put])

  // ---- free workspaces ----
  const renameFree = useCallback(
    (name) => {
      if (mode.kind !== 'free') return
      setFreeName(name)
    },
    [mode.kind],
  )
  const duplicateFree = useCallback(() => {
    if (mode.kind !== 'free') return
    const model = fromFlow(nodes, edges)
    newFree(`${freeName || 'My build'} copy`, model)
  }, [edges, freeName, mode.kind, newFree, nodes])
  const deleteFree = useCallback(() => {
    if (mode.kind !== 'free') return
    store.removeFree(mode.id)
    const rest = store.listFree()
    setFreeList(rest)
    if (rest.length) openFree(rest[0].id)
    else newFree('My build')
  }, [mode, newFree, openFree, store])

  const shareLink = useCallback(() => {
    const model = fromFlow(nodes, edges)
    return `${window.location.origin}/simulator#b=${encodeBuild(model)}`
  }, [edges, nodes])

  // ---- what each placed part is called ----
  const labels = useMemo(() => {
    const count = {}
    const out = {}
    for (const n of nodes) {
      const name = PART_BY_ID[n.data.type]?.name ?? n.data.type
      count[n.data.type] = (count[n.data.type] ?? 0) + 1
      out[n.id] = { name, n: count[n.data.type] }
    }
    const total = (type) => nodes.filter((n) => n.data.type === type).length
    return Object.fromEntries(nodes.map((n) => [n.id, total(n.data.type) > 1 ? `${out[n.id].name} ${out[n.id].n}` : out[n.id].name]))
  }, [nodes])
  const shownNodes = useMemo(() => nodes.map((n) => ({ ...n, data: { ...n.data, label: labels[n.id] } })), [nodes, labels])

  return {
    mode, lesson, lastLesson, nodes: shownNodes, edges, report, outcome, live, taskState, progress, freeList, freeName, notice, saving: store.saving,
    setNotice, onNodesChange, onEdgesChange, connect, addPart, removeSelected, flip, powerUp, openLesson, openFree, newFree, renameFree, duplicateFree,
    deleteFree, restartLesson, showAnswer, shareLink, setMode,
  }
}
