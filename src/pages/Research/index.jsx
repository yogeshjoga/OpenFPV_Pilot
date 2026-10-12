import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, CircuitBoard, Cpu, Gamepad2, Network, Package, RadioTower, Telescope, Zap } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import { CONTACT_EMAIL } from '@config/constants'
import useDocumentMeta from '@lib/useDocumentMeta'
import styles from './Research.module.css'

// The five-year plan, in the order we intend to build it. Each stage builds on the one before.
const STAGES = [
  {
    icon: <Gamepad2 size={22} />,
    kind: 'Hardware',
    title: 'Simulator controller',
    text: 'Our own USB controller for flight simulators. It is where every pilot we train starts, so it is where our hardware starts too.',
  },
  {
    icon: <RadioTower size={22} />,
    kind: 'Hardware',
    title: 'ELRS controller',
    text: 'Our own radio transmitter for real flights, built on ExpressLRS, the open long-range control link.',
  },
  {
    icon: <Zap size={22} />,
    kind: 'Hardware',
    title: 'ESC',
    text: 'Electronic speed controllers designed for FPV motors, so the power side of the drone is ours as well.',
  },
  {
    icon: <CircuitBoard size={22} />,
    kind: 'Hardware',
    title: 'Flight controller',
    text: 'Our own flight controller board and its firmware, the brain that keeps the drone stable.',
  },
  {
    icon: <Cpu size={22} />,
    kind: 'Hardware and AI',
    title: 'Flight controller with an AI chip',
    text: 'The flight controller with an AI processor beside it, so a drone can run vision and decision models on board instead of relying on a ground computer.',
  },
  {
    icon: <BrainCircuit size={22} />,
    kind: 'Autonomy',
    title: 'Reinforcement learning FPV AI pilot',
    text: 'An autonomous FPV pilot trained with reinforcement learning, first in simulation and then on real drones, aimed at the needs of Indian defence.',
  },
  {
    icon: <Network size={22} />,
    kind: 'Ecosystem',
    title: 'An India-based FPV drone ecosystem',
    text: 'Controllers, electronics, training and builders working together in India, so an FPV drone can be designed, built and flown without depending on imports.',
  },
  {
    icon: <Package size={22} />,
    kind: 'Enterprise',
    title: 'Enterprise heavy-payload drones',
    text: 'Deeper research into heavy-lift drones for enterprise work, carrying larger payloads than FPV drones can.',
  },
]

export default function Research() {
  useDocumentMeta(
    'Research | EGIRE Robotics',
    'The EGIRE Robotics five-year research roadmap: from our own simulator and ELRS controllers, ESC and flight controllers, to an AI FPV pilot and an India-based FPV drone ecosystem.',
  )

  return (
    <PageWrapper>
      <div className={styles.page}>
        <div className="container">
          <header className={styles.header}>
            <p className={styles.eyebrow}>
              <Telescope size={16} aria-hidden="true" /> Research
            </p>
            <h1 className={styles.title}>Our research roadmap for the next five years</h1>
            <p className={styles.lead}>
              We teach drone piloting and engineering today. Over the next five years we want to design the hardware ourselves, add artificial intelligence to it, and help build an FPV drone ecosystem in India.
              These are the eight stages, in the order we plan to take them.
            </p>
            <p className={styles.note}>This is a plan, not a list of finished products. Each stage builds on the one before it, and timings will move as the research does.</p>
          </header>

          <ol className={styles.roadmap}>
            {STAGES.map((stage, i) => (
              <motion.li
                key={stage.title}
                className={styles.stage}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
              >
                <span className={styles.node} aria-hidden="true">
                  {i + 1}
                </span>
                <div className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.icon} aria-hidden="true">
                      {stage.icon}
                    </span>
                    <div>
                      <p className={styles.stageLabel}>
                        Stage {i + 1} of {STAGES.length} · {stage.kind}
                      </p>
                      <h2 className={styles.stageTitle}>{stage.title}</h2>
                    </div>
                  </div>
                  <p className={styles.stageText}>{stage.text}</p>
                </div>
              </motion.li>
            ))}
          </ol>

          <section className={styles.cta} aria-labelledby="research-cta-title">
            <div>
              <h2 id="research-cta-title" className={styles.ctaTitle}>Want to be part of it?</h2>
              <p className={styles.ctaText}>
                We welcome students, colleges, researchers and partners who want to work on any of these stages. Tell us what you can bring, or write to us at{' '}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
            </div>
            <Link to="/enquire?type=general&from=research" className={styles.ctaButton}>
              Get in touch <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    </PageWrapper>
  )
}
