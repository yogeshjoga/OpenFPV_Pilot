import { MessageCircle, Phone } from 'lucide-react'
import { WHATSAPP } from '@config/constants'
import styles from './WhatsAppButton.module.css'

/** A round green chat button (speech bubble with a handset) that opens a WhatsApp chat with the team. */
export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP.href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.button}
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
    >
      <span className={styles.glyph} aria-hidden="true">
        <MessageCircle size={30} strokeWidth={2.2} className={styles.bubble} />
        <Phone size={13} strokeWidth={0} className={styles.handset} />
      </span>
    </a>
  )
}
