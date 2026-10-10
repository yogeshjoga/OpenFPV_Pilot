import { CONTACT_EMAIL } from '@config/constants'

/**
 * A mailto link with the subject and a short form pre-filled, so an enquiry arrives with the
 * details we need. This is the interim way to enquire until the CRM enquiry form is built.
 */
export function enquiryLink(subject, interest = '') {
  const body = [
    'Name:',
    'College / organisation:',
    'Phone:',
    `Interested in: ${interest}`,
    '',
  ].join('\n')
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
