import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import styles from './Pages.module.css'

// A section split into short pages: one shows at a time, with numbered tabs on top and a "next" button at the bottom,
// so the student sees one idea at a time instead of scrolling a long page.
// items: [{ id, label, node }]
export default function Pages({ items, label = 'Pages' }) {
  const [current, setCurrent] = useState(items[0].id)
  const top = useRef(null)
  const index = Math.max(0, items.findIndex((i) => i.id === current))
  const next = items[index + 1]

  const show = (id) => {
    setCurrent(id)
    // bring the tabs back to the top of the screen, so the new page starts at its beginning
    requestAnimationFrame(() => top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  return (
    <div className={styles.pages}>
      <div ref={top} className={styles.tabsAnchor}>
        <div className={styles.tabs} role="tablist" aria-label={label}>
          {items.map((item, i) => (
            <button key={item.id} type="button" role="tab" id={`tab-${item.id}`} aria-selected={i === index} aria-controls={`page-${item.id}`} onClick={() => show(item.id)}>
              <span>{i + 1}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" id={`page-${items[index].id}`} aria-labelledby={`tab-${items[index].id}`} className={styles.panel}>
        {items[index].node}
      </div>
      {next && (
        <button type="button" className={styles.next} onClick={() => show(next.id)}>
          Next: {next.label} <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
