import { MessageCircle } from 'lucide-react'
import { WHATSAPP } from '@config/constants'
import styles from './WhatsAppButton.module.css'

/** A fixed button that opens a WhatsApp chat with the team. */
export default function WhatsAppButton() {
  return (
    <a href={WHATSAPP.href} target="_blank" rel="noopener noreferrer" className={styles.button} aria-label="Chat with us on WhatsApp">
      <MessageCircle size={22} aria-hidden="true" />
      <span className={styles.label}>WhatsApp</span>
    </a>
  )
}
