import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, GraduationCap } from 'lucide-react'
import styles from './CrmButton.module.css'

// The CRM button for people an admin has accepted. Pressing it never goes straight to the CRM: it asks first whether the person means
// the CRM or the Academy, and only the "Go to the CRM" button takes them there (in a new tab, so the Academy stays open).
export default function CrmButton({ className, href }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const stayRef = useRef(null)

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return undefined
    stayRef.current?.focus() // the safe choice is the one under the cursor of the keyboard
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() } }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button ref={triggerRef} type="button" className={className} onClick={() => setOpen(true)} aria-haspopup="dialog">
        <ExternalLink size={14} aria-hidden="true" /> CRM
      </button>
      {open && createPortal(
        <div className={styles.overlay} onClick={close}>
          <div className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="crm-confirm-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="crm-confirm-title" className={styles.title}>Where do you want to go?</h2>
            <p className={styles.text}>
              You are signed in to the Academy. The CRM is a separate site for accepted students and staff, and it opens in a new tab.
            </p>
            <div className={styles.actions}>
              <a className={styles.primary} href={href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
                <ExternalLink size={16} aria-hidden="true" /> Go to the CRM
              </a>
              <button ref={stayRef} type="button" className={styles.secondary} onClick={close}>
                <GraduationCap size={16} aria-hidden="true" /> Stay in the Academy
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
