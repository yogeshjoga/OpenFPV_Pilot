import PageWrapper from '@components/layout/PageWrapper'
import { CONTACT_EMAIL } from '@config/constants'
import useDocumentMeta from '@lib/useDocumentMeta'
import styles from './Privacy.module.css'

const SECTIONS = [
  {
    title: 'What this website collects',
    body: [
      'This website does not ask you to create an account or fill in a form, so it does not collect your personal details itself. If you email or call us, we use the details you share only to reply to you and to arrange your workshop or enquiry.',
      'We measure visits with cookie-free analytics. It records which pages are viewed and in aggregate, without cookies and without building a profile of you.',
    ],
  },
  {
    title: 'Student reviews',
    body: [
      'Reviews are written by students in the EGIRE Robotics student portal. A review appears on this website only if the student agrees to it, and it is shown with first name and last initial only.',
      'A student can withdraw that permission at any time from the portal, and the review is removed from the website straight away. The overall rating shown on the site is an average and does not identify anyone.',
    ],
  },
  {
    title: 'Photos',
    body: [
      'The gallery shows photos taken at our workshops and events. If you or your child appears in a photo and you would like it removed, email us and we will take it down.',
    ],
  },
  {
    title: 'Other services this site uses',
    body: [
      'Some content is provided by other services: 3D drone models from Sketchfab, fonts from Google Fonts, and site content hosted on Supabase and Vercel. When your browser loads their content, they receive technical information such as your IP address, under their own privacy policies.',
    ],
  },
  {
    title: 'Contact us',
    body: [
      `To ask about your information, or to have something corrected or removed, email ${CONTACT_EMAIL}.`,
    ],
  },
]

export default function Privacy() {
  useDocumentMeta('Privacy policy | EGIRE Robotics', 'How the EGIRE Robotics website handles your information.')

  return (
    <PageWrapper>
      <div className={styles.page}>
        <div className={`container ${styles.container}`}>
          <p className={styles.eyebrow}>Legal</p>
          <h1 className={styles.title}>Privacy policy</h1>
          <p className={styles.updated}>Last updated 10 October 2026</p>

          {SECTIONS.map((section) => (
            <section key={section.title} className={styles.section}>
              <h2 className={styles.heading}>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className={styles.text}>
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
