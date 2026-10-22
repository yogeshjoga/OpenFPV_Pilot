import { PART_BY_ID } from './catalog.js'

// Workspaces and lesson progress live in the student's browser. Every access is wrapped so private windows and blocked
// storage never break the bench: it just says that changes are not being saved.

const KEY = 'egire.bench.v1'
const VERSION = 1
const MAX_FREE = 30

export const newId = (prefix = 'ws') => `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`

/** A workspace: { id, name, nodes: [{ id, type, x, y, flip? }], wires: [{ id, a: 'node:pad', b: 'node:pad', color? }], updatedAt } */
export const emptyWorkspace = (name = 'My build') => ({ id: newId(), name, nodes: [], wires: [], updatedAt: Date.now() })

/** Drops parts and wires that refer to a part or pad this version of the bench does not know. */
export function cleanWorkspace(ws) {
  const nodes = (ws?.nodes ?? []).filter((n) => n && PART_BY_ID[n.type] && typeof n.id === 'string' && Number.isFinite(n.x) && Number.isFinite(n.y))
  const ids = new Map(nodes.map((n) => [n.id, n]))
  const valid = (key) => {
    const [nodeId, padId] = String(key).split(':')
    const node = ids.get(nodeId)
    return !!node && PART_BY_ID[node.type].pads.some((p) => p.id === padId)
  }
  const wires = (ws?.wires ?? []).filter((w) => w && valid(w.a) && valid(w.b) && w.a !== w.b)
  return { ...ws, nodes, wires }
}

/** A store backed by anything with getItem and setItem (localStorage in the browser, a Map in the tests). */
export function createStore(storage) {
  let saved = true
  const read = () => {
    try {
      const raw = storage?.getItem(KEY)
      const data = raw ? JSON.parse(raw) : null
      if (data && data.v === VERSION) return data
    } catch {
      saved = false
    }
    return { v: VERSION, free: {}, lessons: {}, progress: {} }
  }
  const write = (data) => {
    try {
      storage.setItem(KEY, JSON.stringify(data))
      saved = true
    } catch {
      saved = false
    }
  }
  const update = (change) => {
    const data = read()
    change(data)
    write(data)
  }

  return {
    /** False once a write has failed (storage blocked or full). */
    get saving() {
      return saved && !!storage
    },

    listFree: () => Object.values(read().free).sort((a, b) => b.updatedAt - a.updatedAt),
    getFree: (id) => read().free[id] ?? null,
    putFree: (ws) =>
      update((d) => {
        d.free[ws.id] = { ...ws, updatedAt: Date.now() }
        const all = Object.values(d.free).sort((a, b) => b.updatedAt - a.updatedAt)
        for (const old of all.slice(MAX_FREE)) delete d.free[old.id]
      }),
    removeFree: (id) => update((d) => void delete d.free[id]),

    getLesson: (id) => read().lessons[id] ?? null,
    putLesson: (id, ws) => update((d) => void (d.lessons[id] = { ...ws, updatedAt: Date.now() })),
    resetLesson: (id) => update((d) => void delete d.lessons[id]),

    getProgress: () => read().progress,
    /** Records a power-up on a lesson. When it finishes the lesson, keeps the best time and stars. */
    recordAttempt: (lessonId, { passed, ms }) => {
      let result
      update((d) => {
        const p = d.progress[lessonId] ?? { attempts: 0, done: false, bestMs: null, stars: 0 }
        p.attempts += 1
        if (passed) {
          const stars = p.attempts <= 1 ? 3 : p.attempts <= 3 ? 2 : 1
          p.done = true
          p.bestMs = p.bestMs === null ? ms : Math.min(p.bestMs, ms)
          p.stars = Math.max(p.stars, stars)
        }
        d.progress[lessonId] = p
        result = { ...p }
      })
      return result
    },
    /** Starting a lesson again counts its attempts from zero, but keeps what was already earned. */
    restartAttempts: (lessonId) =>
      update((d) => {
        const p = d.progress[lessonId]
        if (p) p.attempts = 0
      }),
  }
}

export function browserStorage() {
  try {
    const s = globalThis.localStorage
    s.setItem('egire.bench.probe', '1')
    s.removeItem('egire.bench.probe')
    return s
  } catch {
    return null
  }
}

// ---- Share links: the whole build, compactly, in the page address ----

const toBase64Url = (text) => btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const fromBase64Url = (text) => atob(text.replace(/-/g, '+').replace(/_/g, '/'))

export function encodeBuild(ws) {
  const index = new Map(ws.nodes.map((n, i) => [n.id, i]))
  const wires = []
  for (const w of ws.wires) {
    const [na, pa] = w.a.split(':')
    const [nb, pb] = w.b.split(':')
    if (index.has(na) && index.has(nb)) wires.push([index.get(na), pa, index.get(nb), pb])
  }
  const data = { v: 1, n: ws.nodes.map((n) => (n.flip ? [n.type, Math.round(n.x), Math.round(n.y), 1] : [n.type, Math.round(n.x), Math.round(n.y)])), w: wires }
  return toBase64Url(JSON.stringify(data))
}

/** Returns a clean { nodes, wires } or null when the link is damaged or from a newer bench. */
export function decodeBuild(text) {
  try {
    const data = JSON.parse(fromBase64Url(text))
    if (!data || data.v !== 1 || !Array.isArray(data.n) || !Array.isArray(data.w)) return null
    const nodes = data.n.map(([type, x, y, flip], i) => ({ id: `n${i}`, type, x, y, ...(flip ? { flip: true } : {}) }))
    const wires = data.w.map(([ia, pa, ib, pb], i) => ({ id: `w${i}`, a: `n${ia}:${pa}`, b: `n${ib}:${pb}` }))
    return cleanWorkspace({ nodes, wires })
  } catch {
    return null
  }
}
