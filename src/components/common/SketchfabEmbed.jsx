import { useEffect, useRef, useState } from 'react'
import styles from './SketchfabEmbed.module.css'

const API_SRC = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js'
const GIVE_UP_MS = 15000
const REVEAL_DELAY_MS = 700

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
  ui_general_controls: 0,
  ui_settings: 0,
  ui_annotations: 0,
  ui_animations: 0,
  ui_fullscreen: 0,
  ui_vr: 0,
  ui_ar: 0,
  ui_sound: 0,
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
 * - `poster` is a still of the model that appears only when the live model cannot start (a phone with no usable graphics, a blocked
 *   network): better a clear picture than a half-drawn or broken viewer. If the live model is only slow, it takes over when ready.
 * - Unless `eager`, nothing is downloaded until the model is close to the screen.
 * - Sketchfab's viewer API tells us when the model is ready, so the swap never shows a loading spinner.
 */
export default function SketchfabEmbed({ uid, title, theme = 'light', poster, posterClassName = '', eager = false }) {
  const wrap = useRef(null)
  const frame = useRef(null)
  const [near, setNear] = useState(eager)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

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
    // the viewer has not started in time: show the picture (or, with no picture, whatever the viewer has)
    const giveUp = setTimeout(() => {
      if (!live) return
      if (poster) setFailed(true)
      else setReady(true)
    }, GIVE_UP_MS)

    // If the API cannot load, try a plain embed URL. A page that failed to load looks the same as one that loaded, so it is never
    // shown on trust: with no picture to fall back on it appears after the wait, with one the picture does.
    const plainEmbed = () => {
      if (!live || !iframe) return
      const query = new URLSearchParams(Object.entries(options).map(([k, v]) => [k, String(v)]))
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
            api.addEventListener('viewerready', () => {
              if (!live) return
              // Sketchfab draws a "touch & drag to rotate" hint over a fresh viewer until someone touches the model.
              // Nobody can drag this model, so one tiny touch is sent for them, then touching is switched off
              // and the model fades in a moment later: no hint, no flash of loading screen.
              api.setUserInteraction(true)
              api.mouseDown(40, 40)
              api.mouseMove(41, 40)
              api.mouseUp(41, 40)
              setTimeout(() => {
                api.setUserInteraction(false)
                if (live) setReady(true)
              }, REVEAL_DELAY_MS)
            })
          },
          error: plainEmbed,
        })
      })
      .catch(plainEmbed)

    return () => {
      live = false
      clearTimeout(giveUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `poster` only says whether a picture exists
  }, [near, uid, theme])

  return (
    <div ref={wrap} className={styles.wrap}>
      {poster && failed && (
        <img
          src={poster}
          alt=""
          className={`${styles.poster} ${posterClassName} ${ready ? styles.posterGone : ''}`}
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
