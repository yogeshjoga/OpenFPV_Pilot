import { useEffect, useRef, useState } from 'react'
import styles from './SketchfabEmbed.module.css'

const API_SRC = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js'
const GIVE_UP_MS = 15000

// A viewer with no on-screen controls: it spins on its own and ignores the mouse.
const VIEWER_OPTIONS = {
  autostart: 1,
  autospin: 1,
  transparent: 1,
  dnt: 1,
  ui_infos: 0,
  ui_watermark: 0,
  ui_watermark_link: 0,
  ui_hint: 0,
  ui_stop: 0,
  ui_controls: 0,
  ui_inspector: 0,
  ui_help: 0,
}

let apiPromise
/** Loads Sketchfab's viewer API once for the whole page. */
function loadApi() {
  if (window.Sketchfab) return Promise.resolve(window.Sketchfab)
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = API_SRC
      script.async = true
      script.onload = () => resolve(window.Sketchfab)
      script.onerror = () => {
        apiPromise = undefined
        reject(new Error('Sketchfab API failed to load'))
      }
      document.head.appendChild(script)
    })
  }
  return apiPromise
}

/**
 * A Sketchfab model that loads without slowing the page.
 * - `poster` shows a still of the model straight away and fades out the moment the live model is ready.
 * - Unless `eager`, nothing is downloaded until the model is close to the screen.
 * - Sketchfab's viewer API tells us when the model is ready, so the swap never shows a loading spinner.
 */
export default function SketchfabEmbed({ uid, title, theme = 'light', poster, posterClassName = '', eager = false }) {
  const wrap = useRef(null)
  const frame = useRef(null)
  const [near, setNear] = useState(eager)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (near) return undefined
    const el = wrap.current
    if (!el || !('IntersectionObserver' in window)) {
      setNear(true)
      return undefined
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true)
          observer.disconnect()
        }
      },
      { rootMargin: '500px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [near])

  useEffect(() => {
    if (!near) return undefined
    let live = true
    const iframe = frame.current
    const options = { ...VIEWER_OPTIONS, ui_theme: theme }
    const giveUp = setTimeout(() => live && setReady(true), GIVE_UP_MS)

    // If the API cannot load, fall back to a plain embed URL so the model still appears.
    const plainEmbed = () => {
      if (!live || !iframe) return
      const query = new URLSearchParams(Object.entries(options).map(([k, v]) => [k, String(v)]))
      iframe.addEventListener('load', () => live && setReady(true), { once: true })
      iframe.src = `https://sketchfab.com/models/${uid}/embed?${query}`
    }

    loadApi()
      .then((Sketchfab) => {
        if (!live) return
        const client = new Sketchfab(iframe)
        client.init(uid, {
          ...options,
          success: (api) => {
            api.start()
            api.addEventListener('viewerready', () => live && setReady(true))
          },
          error: plainEmbed,
        })
      })
      .catch(plainEmbed)

    return () => {
      live = false
      clearTimeout(giveUp)
    }
  }, [near, uid, theme])

  return (
    <div ref={wrap} className={styles.wrap}>
      {poster && (
        <img
          src={poster}
          alt=""
          className={`${styles.poster} ${posterClassName} ${ready ? styles.posterGone : ''}`}
          fetchPriority="high"
          decoding="async"
        />
      )}
      <iframe
        ref={frame}
        title={title}
        className={`${styles.frame} ${ready ? styles.frameReady : ''}`}
        allow="autoplay; fullscreen; xr-spatial-tracking"
        tabIndex={-1}
      />
    </div>
  )
}
