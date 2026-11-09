import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './BenchTip.module.css'

const EDGE = 12 // never closer than this to the edge of the window
const OFFSET = 18 // gap between the pointer and the card

/**
 * The card that follows the pointer while it is over a pad, a wire or a part of a board: a title, a coloured badge that says
 * what the thing carries, and a few short rows. It is drawn on the page itself (not inside the zoomed canvas), so it stays
 * the same size however far the canvas is zoomed.
 * tip: see tips.js   at: { x, y } the pointer in window pixels
 */
export default function BenchTip({ tip, at }) {
  const card = useRef(null)
  const [pos, setPos] = useState({ left: at.x + OFFSET, top: at.y + OFFSET })

  // keep the whole card on screen: flip it to the other side of the pointer when it would run off
  useLayoutEffect(() => {
    const el = card.current
    if (!el) return
    const { width, height } = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    let left = at.x + OFFSET
    let top = at.y + OFFSET
    if (left + width > vw - EDGE) left = Math.max(EDGE, at.x - OFFSET - width)
    if (top + height > vh - EDGE) top = Math.max(EDGE, at.y - OFFSET - height)
    setPos({ left, top })
  }, [at.x, at.y, tip])

  if (typeof document === 'undefined') return null
  return createPortal(
    <div ref={card} className={styles.card} style={pos} role="tooltip">
      <p className={styles.part}>{tip.part}</p>
      <div className={styles.head}>
        <h4 className={styles.title}>{tip.title}</h4>
        <span className={`${styles.badge} ${styles[tip.tone] ?? ''}`}>{tip.badge}</span>
      </div>
      <dl className={styles.rows}>
        {tip.rows.map(([heading, text]) => (
          <div key={heading} className={styles.row}>
            <dt>{heading}</dt>
            <dd>{text}</dd>
          </div>
        ))}
      </dl>
    </div>,
    document.body,
  )
}
