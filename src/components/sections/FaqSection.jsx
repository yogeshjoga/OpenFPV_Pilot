import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { CONTACT_EMAIL, CONTACT_PHONE, FEES, WHATSAPP } from '@config/constants'
import styles from './FaqSection.module.css'

const FAQS = [
  {
    q: 'Do I need prior experience?',
    a: 'No. The workshops start from the basics and begin in the simulator, so you learn to fly before touching a real drone. The programs go up to advanced levels, so experienced learners are covered too.',
  },
  {
    q: 'Who can join?',
    a: 'Learners from age 5 to 45: school students, college students, researchers, professionals and hobbyists.',
  },
  {
    q: 'Will I fly real drones?',
    a: 'Yes. We provide the drones and controllers, and students get hands-on flying time after simulator practice. In the Simulation grade, controllers are shared in teams.',
  },
  {
    q: 'Can I build my own drone?',
    a: 'Yes. The Professional grade includes building an FPV drone from scratch, and the 90-day course covers building FPV drones end to end.',
  },
  {
    q: 'Will I get a certificate?',
    a: 'Yes. Each certification grade comes with a certificate: Simulation Skill (Grade 3), Moderate Skill (Grade 2) and Professional (Grade 1).',
  },
  {
    q: 'What is the fee?',
    a: `Fees start from ${FEES.workshopFrom} per person and depend on the program and the number of students. Call ${CONTACT_PHONE.display}, WhatsApp ${WHATSAPP.display} or email ${CONTACT_EMAIL} for the exact fee.`,
  },
  {
    q: 'Can I try a session before joining?',
    a: `Yes. You can book a demo session for ${FEES.demo}. Send an enquiry and we will arrange it.`,
  },
  {
    q: 'Can you run a workshop at our college?',
    a: 'Yes. We run workshops at universities and engineering colleges, for example at Sri Sivani Engineering College Etcherla. Contact us to discuss the schedule and requirements.',
  },
  {
    q: 'What can I do after the training?',
    a: 'The skills apply to drone cinematography, agriculture, 3D mapping and GIS, surveillance and security, sports broadcast, and drone and robotics engineering.',
  },
  {
    q: 'Do you teach more than drones?',
    a: 'Yes. We also teach AI and machine learning, LLMs and AI agents, robotics with ROS 2, Linux, Python, C++, Embedded C and PCB design.',
  },
]

// The same questions in a form search engines can show directly in results
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}

/** Answers to the questions a new student or parent asks before enquiring. */
export default function FaqSection() {
  return (
    <section className={`section ${styles.section}`} aria-labelledby="faq-title">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
      <div className="container">
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.eyebrow}>Questions</p>
          <h2 id="faq-title" className={styles.title}>Frequently asked questions</h2>
        </motion.div>

        <div className={styles.list}>
          {FAQS.map((item) => (
            <details key={item.q} className={styles.item}>
              <summary className={styles.question}>
                {item.q}
                <ChevronDown size={20} className={styles.chevron} aria-hidden="true" />
              </summary>
              <p className={styles.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
