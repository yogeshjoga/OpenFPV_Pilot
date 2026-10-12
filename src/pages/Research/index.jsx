import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BrainCircuit, CheckCircle2, CircuitBoard, Cpu, FlaskConical, Gamepad2, Network, Package, RadioTower, Telescope, Zap } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import { CONTACT_EMAIL } from '@config/constants'
import useDocumentMeta from '@lib/useDocumentMeta'
import styles from './Research.module.css'

// The five-year plan, in the order we intend to build it, grouped into four phases.
const PHASES = [
  {
    label: 'Phase 1',
    title: 'Own the hardware',
    blurb: 'Design the controllers and electronics that sit between a pilot and a drone.',
    stages: [
      {
        n: 1,
        icon: <Gamepad2 size={20} />,
        title: 'Simulator controller',
        text: 'Our own USB controller for flight simulators. Every pilot we train starts in a simulator, so this is where our hardware starts too.',
        result: 'A USB flight simulator controller',
        focus: 'USB input, ergonomics, simulator support',
      },
      {
        n: 2,
        icon: <RadioTower size={20} />,
        title: 'ELRS controller',
        text: 'Our own radio transmitter for real flights, built on ExpressLRS, the open long-range control link.',
        result: 'An ExpressLRS radio transmitter',
        focus: 'Radio link, firmware, antenna, housing',
      },
      {
        n: 3,
        icon: <Zap size={20} />,
        title: 'ESC',
        text: 'Electronic speed controllers designed for FPV motors, so the power side of the drone is ours as well.',
        result: 'Speed controller boards for FPV motors',
        focus: 'Power electronics, motor control firmware',
      },
      {
        n: 4,
        icon: <CircuitBoard size={20} />,
        title: 'Flight controller',
        text: 'Our own flight controller board and its firmware, the brain that keeps the drone stable in the air.',
        result: 'A flight controller board with firmware',
        focus: 'Sensors, flight firmware, board design',
      },
    ],
  },
  {
    label: 'Phase 2',
    title: 'Add intelligence',
    blurb: 'Bring artificial intelligence onto the drone, then teach it to fly.',
    stages: [
      {
        n: 5,
        icon: <Cpu size={20} />,
        title: 'Flight controller with an AI chip',
        text: 'The flight controller with an AI processor beside it, so a drone can run vision and decision models on board instead of relying on a ground computer.',
        result: 'A flight controller with on-board AI',
        focus: 'On-board inference, camera input, low latency',
      },
      {
        n: 6,
        icon: <BrainCircuit size={20} />,
        title: 'Reinforcement learning FPV AI pilot',
        text: 'An autonomous FPV pilot trained with reinforcement learning, first in simulation and then on real drones, aimed at the needs of Indian defence.',
        result: 'An autonomous AI FPV pilot',
        focus: 'Reinforcement learning, simulation training, transfer to real flight',
      },
    ],
  },
  {
    label: 'Phase 3',
    title: 'Build the ecosystem',
    blurb: 'Connect the parts, the people and the training into one Indian FPV industry.',
    stages: [
      {
        n: 7,
        icon: <Network size={20} />,
        title: 'An India-based FPV drone ecosystem',
        text: 'Controllers, electronics, training and builders working together in India, so an FPV drone can be designed, built and flown without depending on imports.',
        result: 'A connected FPV supply and skills chain in India',
        focus: 'Components, training, builders, partners',
      },
    ],
  },
  {
    label: 'Phase 4',
    title: 'Go heavy',
    blurb: 'Take what we learn to larger aircraft for enterprise work.',
    stages: [
      {
        n: 8,
        icon: <Package size={20} />,
        title: 'Enterprise heavy-payload drones',
        text: 'Deeper research into heavy-lift drones for enterprise work, carrying larger payloads than FPV drones can.',
        result: 'Research findings on heavy-lift enterprise drones',
        focus: 'Heavy-lift design, payload handling, reliability',
      },
    ],
  },
]

const STAGE_COUNT = PHASES.reduce((sum, p) => sum + p.stages.length, 0)

const PRINCIPLES = [
  { title: 'Simulation first', text: 'We test ideas in a simulator before they go near a real drone, the same way we teach our students.' },
  { title: 'Open standards', text: 'We build on open standards such as ExpressLRS where they exist, so our work fits the wider FPV community.' },
  { title: 'Learn from the classroom', text: 'What our trainers and students find difficult in workshops tells us what to build next.' },
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
            <h1 className={styles.title}>Research roadmap: the next five years</h1>
            <p className={styles.lead}>
              We teach drone piloting and engineering today. Over the next five years we plan to design the hardware ourselves, add artificial intelligence to it, and help build an FPV drone
              ecosystem in India.
            </p>
            <dl className={styles.facts}>
              <div>
                <dt>Duration</dt>
                <dd>5 years</dd>
              </div>
              <div>
                <dt>Stages</dt>
                <dd>{STAGE_COUNT}</dd>
              </div>
              <div>
                <dt>Phases</dt>
                <dd>{PHASES.length}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>Planned</dd>
              </div>
            </dl>
          </header>

          <section className={styles.overview} aria-label="Roadmap at a glance">
            <h2 className={styles.overviewTitle}>The roadmap at a glance</h2>
            <div className={styles.phaseGrid}>
              {PHASES.map((phase) => (
                <div key={phase.label} className={styles.phaseCard}>
                  <p className={styles.phaseLabel}>{phase.label}</p>
                  <h3 className={styles.phaseCardTitle}>{phase.title}</h3>
                  <ol className={styles.miniList}>
                    {phase.stages.map((s) => (
                      <li key={s.n}>
                        <span className={styles.miniNum}>{s.n}</span>
                        {s.title}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          {PHASES.map((phase) => (
            <section key={phase.label} className={styles.phase} aria-labelledby={`phase-${phase.label}`}>
              <div className={styles.phaseHead}>
                <p className={styles.phaseLabel}>{phase.label}</p>
                <h2 id={`phase-${phase.label}`} className={styles.phaseTitle}>{phase.title}</h2>
                <p className={styles.phaseBlurb}>{phase.blurb}</p>
              </div>

              <ol className={styles.stages}>
                {phase.stages.map((stage) => (
                  <motion.li
                    key={stage.n}
                    className={styles.stage}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className={styles.stageNum} aria-hidden="true">
                      {String(stage.n).padStart(2, '0')}
                    </div>
                    <div className={styles.stageBody}>
                      <div className={styles.stageHeading}>
                        <span className={styles.icon} aria-hidden="true">
                          {stage.icon}
                        </span>
                        <h3 className={styles.stageTitle}>
                          <span className={styles.srOnly}>Stage {stage.n}: </span>
                          {stage.title}
                        </h3>
                        <span className={styles.status}>Planned</span>
                      </div>
                      <p className={styles.stageText}>{stage.text}</p>
                    </div>
                    <dl className={styles.meta}>
                      <div>
                        <dt>Result</dt>
                        <dd>
                          <CheckCircle2 size={14} aria-hidden="true" /> {stage.result}
                        </dd>
                      </div>
                      <div>
                        <dt>Focus</dt>
                        <dd>{stage.focus}</dd>
                      </div>
                    </dl>
                  </motion.li>
                ))}
              </ol>
            </section>
          ))}

          <section className={styles.principles} aria-labelledby="principles-title">
            <h2 id="principles-title" className={styles.overviewTitle}>
              <FlaskConical size={20} aria-hidden="true" /> How we plan to work
            </h2>
            <div className={styles.principleGrid}>
              {PRINCIPLES.map((p) => (
                <div key={p.title} className={styles.principle}>
                  <h3 className={styles.principleTitle}>{p.title}</h3>
                  <p className={styles.principleText}>{p.text}</p>
                </div>
              ))}
            </div>
          </section>

          <p className={styles.disclaimer}>This is a plan, not a list of finished products. Each stage builds on the one before it, and timings will move as the research does.</p>

          <section className={styles.cta} aria-labelledby="research-cta-title">
            <div>
              <h2 id="research-cta-title" className={styles.ctaTitle}>Work with us on this</h2>
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
