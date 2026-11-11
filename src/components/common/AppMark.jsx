import { Download } from 'lucide-react'

/**
 * The mixed logo for the app download button: our drone mark beside an Android head, then a download arrow.
 * The Android head is a plain drawing (a half circle, two feelers, two eyes); the drone mark is the website's own icon.
 */
export default function AppMark({ className = '', markClassName = '', headClassName = '' }) {
  return (
    <span className={className} aria-hidden="true">
      <img className={markClassName} src="/icon-192.png" alt="" width="24" height="24" decoding="async" />
      <svg className={headClassName} viewBox="0 0 24 24" width="22" height="22" focusable="false">
        <path d="M6 17a6 6 0 0 1 12 0z" fill="currentColor" />
        <path d="M8 6.5 6.6 4.2M16 6.5l1.4-2.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="9.6" cy="14" r="0.9" fill="var(--appmark-eye, #fff)" />
        <circle cx="14.4" cy="14" r="0.9" fill="var(--appmark-eye, #fff)" />
      </svg>
      <Download size={16} />
    </span>
  )
}
