import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CircuitBoard,
  Cpu,
  Building2,
  Flag,
  FlaskConical,
  Gamepad2,
  Globe,
  GraduationCap,
  Landmark,
  Mail,
  Network,
  Package,
  Plane,
  RadioTower,
  ScanSearch,
  Telescope,
  Thermometer,
  WifiOff,
  Zap,
  Cog,
} from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import { CONTACT_EMAIL } from '@config/constants'
import useDocumentMeta from '@lib/useDocumentMeta'
import HeroVisual from './HeroVisual'
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
        plain: 'A hand controller for practising on a computer first, so a pilot can learn without risking a real drone.',
        result: 'A USB controller for flight simulators',
      },
      {
        n: 2,
        icon: <RadioTower size={20} />,
        title: 'ELRS controller',
        plain: 'The hand controller used to fly a real drone. It uses ExpressLRS, an open and widely used long-range radio link.',
        result: 'A radio transmitter for real flights',
      },
      {
        n: 3,
        icon: <Zap size={20} />,
        title: 'ESC (speed controller)',
        plain: 'The small board that tells each motor how fast to spin. It decides how the drone climbs, turns and stops.',
        result: 'Speed controller boards for FPV motors',
      },
      {
        n: 4,
        icon: <CircuitBoard size={20} />,
        title: 'FC (flight controller)',
        plain: 'The drone’s brain. It reads its sensors many times a second and keeps the drone steady and level.',
        result: 'A flight controller board with its own software',
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
        title: 'FC with an AI chip',
        plain: 'The same brain with a small AI computer beside it. The drone can understand what its camera sees without sending video to a ground computer.',
        result: 'A flight controller with on-board AI',
      },
      {
        n: 6,
        icon: <BrainCircuit size={20} />,
        title: 'AI FPV pilot (reinforcement learning)',
        plain: 'Software that learns to fly by practising millions of times in a simulator, rewarded for good flying. It is aimed at the needs of Indian defence.',
        result: 'An autonomous AI pilot for FPV drones',
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
        plain: 'Parts, makers, trainers and pilots working together in India, so an FPV drone can be designed, built and flown without depending on imports.',
        result: 'A connected supply and skills chain in India',
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
        title: 'Heavy-payload drones for enterprise',
        plain: 'Research into larger drones that can lift and carry heavy loads for businesses. “Payload” means whatever the drone carries.',
        result: 'Research on heavy-lift enterprise drones',
      },
    ],
  },
]

const STAGE_COUNT = PHASES.reduce((sum, p) => sum + p.stages.length, 0)

// The words used on this page, in plain language.
const GLOSSARY = [
  { term: 'FPV', text: 'First-person view. The pilot flies by watching live video from the drone’s own camera.' },
  { term: 'Flight controller', text: 'The drone’s brain. It keeps the drone steady in the air.' },
  { term: 'ESC', text: 'Electronic speed controller. It sets how fast each motor spins.' },
  { term: 'ELRS', text: 'ExpressLRS. An open, long-range radio link between the pilot’s controller and the drone.' },
  { term: 'AI chip', text: 'A small computer on the drone that can recognise what the camera sees and decide what to do.' },
  { term: 'Reinforcement learning', text: 'Teaching software by practice. It tries, is scored, and improves, much like a pilot in a simulator.' },
]

// Why we do not simply buy what already exists.
const REASONS = [
  {
    icon: <ScanSearch size={22} />,
    title: 'We cannot see inside what we buy',
    example: 'A ready-made radio or flight controller is a sealed box. You trust what its maker says is inside. For sensitive work, you want to read and check every part yourself.',
    answer: 'Our own controllers and flight software that we can inspect fully (stages 2 to 4).',
  },
  {
    icon: <Globe size={22} />,
    title: 'The parts come from far away',
    example: 'Most flight controllers, speed controllers and radios used for FPV drones are made abroad. If supply is delayed or stopped, every drone that depends on them is delayed too.',
    answer: 'Parts designed and made in India, and a local supply chain (stages 3 and 7).',
  },
  {
    icon: <Thermometer size={22} />,
    title: 'Hobby parts are not built for hard work',
    example: 'Most FPV gear is designed for racing and filming. Heat, dust, cold, shaking and long storage are different problems, and they need parts designed with them in mind.',
    answer: 'Designs made for tougher conditions, tested before they are used (stages 3 to 5).',
  },
  {
    icon: <WifiOff size={22} />,
    title: 'Today’s drone needs a live radio link',
    example: 'If the link between pilot and drone is cut or jammed, a typical FPV drone has no one to guide it and lands or falls. See the diagram below.',
    answer: 'A drone that can keep going by itself with an AI pilot on board (stages 5 and 6).',
  },
  {
    icon: <GraduationCap size={22} />,
    title: 'India needs the skills as well as the parts',
    example: 'Making a drone is more than assembling it. India needs engineers, trainers and pilots who understand every layer, not only people who can fly one.',
    answer: 'Training and research that grow together, as we already do in our workshops (stage 7).',
  },
]

function Node({ icon, name, text, stage, className = '' }) {
  return (
    <div className={`${styles.node} ${className}`}>
      <span className={styles.nodeIcon} aria-hidden="true">
        {icon}
      </span>
      <h4 className={styles.nodeName}>{name}</h4>
      <p className={styles.nodeText}>{text}</p>
      <span className={styles.nodeStage}>{stage}</span>
    </div>
  )
}

function FlowLink({ label }) {
  return (
    <div className={styles.link} aria-hidden="true">
      <span className={styles.linkLine} />
      <span className={styles.linkDot} />
      {label && <span className={styles.linkLabel}>{label}</span>}
    </div>
  )
}

export default function Research() {
  useDocumentMeta(
    'Research | EGIRE Robotics',
    'The EGIRE Robotics five-year research roadmap: from our own simulator and ELRS controllers, ESC and flight controllers, to an AI FPV pilot and an India-based FPV drone ecosystem.',
  )

  return (
    <PageWrapper>
      <div className={styles.page}>
        <div className="container">
          <header className={styles.hero}>
            <div className={styles.heroText}>
              <p className={styles.eyebrow}>
                <Telescope size={16} aria-hidden="true" /> Research
              </p>
              <h1 className={styles.title}>Research roadmap: the next five years</h1>
              <p className={styles.lead}>
                In five years we plan to design India’s own FPV drone parts, put artificial intelligence on the drone, and help build the industry around them.
                This page explains what we will build, in what order, and why.
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
            </div>
            <HeroVisual />
          </header>

          <section className={styles.block} aria-labelledby="how-title">
            <p className={styles.kicker}>Start here</p>
            <h2 id="how-title" className={styles.h2}>How a drone is flown, and where we fit in</h2>
            <p className={styles.sectionLead}>
              Every drone is a chain of parts. The pilot’s commands travel along it to the motors. We plan to design the parts marked with a stage number.
            </p>

            <figure className={styles.diagram}>
              <div className={styles.chain}>
                <Node icon={<RadioTower size={22} />} name="Pilot’s controller" text="Held in the pilot’s hands. Sends the commands." stage="Stages 1 and 2" />
                <FlowLink label="Radio link" />
                <Node icon={<CircuitBoard size={22} />} name="Flight controller" text="The drone’s brain. Keeps it steady." stage="Stage 4" />
                <Node
                  className={styles.aiNode}
                  icon={<Cpu size={22} />}
                  name="AI chip"
                  text="An optional second brain that can fly the drone by itself."
                  stage="Stages 5 and 6"
                />
                <FlowLink />
                <Node icon={<Zap size={22} />} name="Speed controller (ESC)" text="Sets how fast each motor spins." stage="Stage 3" />
                <FlowLink />
                <Node icon={<Cog size={22} />} name="Motors and propellers" text="Spin to lift and move the drone." stage="Existing parts" />
              </div>
              <figcaption className={styles.caption}>
                The moving dots show commands travelling from the pilot to the motors. Stage 7 connects all of this into one Indian industry, and stage 8 applies it to larger drones.
              </figcaption>
            </figure>
          </section>

          <section className={styles.block} aria-labelledby="why-title">
            <p className={styles.kicker}>The question we are asked most</p>
            <h2 id="why-title" className={styles.h2}>Why research new parts when drones already exist?</h2>
            <p className={styles.sectionLead}>
              Good FPV technology already exists, and we use it where it is good. For example, we build on the open ExpressLRS radio link rather than inventing a new one.
              We research where today’s parts leave a gap for India. These are the five gaps, each with an example.
            </p>

            <ol className={styles.reasons}>
              {REASONS.map((r, i) => (
                <li key={r.title} className={styles.reason}>
                  <span className={styles.reasonIcon} aria-hidden="true">
                    {r.icon}
                  </span>
                  <div>
                    <h3 className={styles.reasonTitle}>
                      <span className={styles.reasonNum}>{i + 1}.</span> {r.title}
                    </h3>
                    <p className={styles.reasonText}>
                      <strong>Example. </strong>
                      {r.example}
                    </p>
                    <p className={styles.reasonAnswer}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>
                        <strong>Our plan. </strong>
                        {r.answer}
                      </span>
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <figure className={styles.diagram}>
              <h3 className={styles.diagramTitle}>What happens when the radio link is lost</h3>
              <div className={styles.lanes}>
                <div className={styles.lane}>
                  <p className={styles.laneLabel}>Today</p>
                  <div className={`${styles.track} ${styles.trackLost}`} aria-hidden="true">
                    <span className={styles.trackLine} />
                    <span className={styles.drone}>
                      <Plane size={18} />
                    </span>
                    <span className={styles.jam}>
                      <WifiOff size={18} />
                    </span>
                    <span className={styles.goal}>
                      <Flag size={18} />
                    </span>
                  </div>
                  <p className={styles.laneText}>The link is cut. Nobody is guiding the drone, so it stops short of its goal and lands or falls.</p>
                </div>
                <div className={styles.lane}>
                  <p className={styles.laneLabel}>With an AI pilot on board</p>
                  <div className={`${styles.track} ${styles.trackAi}`} aria-hidden="true">
                    <span className={styles.trackLine} />
                    <span className={styles.drone}>
                      <Plane size={18} />
                    </span>
                    <span className={styles.jam}>
                      <WifiOff size={18} />
                    </span>
                    <span className={styles.goal}>
                      <Flag size={18} />
                    </span>
                  </div>
                  <p className={styles.laneText}>The link is cut, but the drone’s own AI keeps flying and carries on towards its goal.</p>
                </div>
              </div>
            </figure>
          </section>

          <section className={styles.block} aria-labelledby="words-title">
            <p className={styles.kicker}>Plain-English guide</p>
            <h2 id="words-title" className={styles.h2}>The words used on this page</h2>
            <dl className={styles.glossary}>
              {GLOSSARY.map((g) => (
                <div key={g.term} className={styles.term}>
                  <dt>{g.term}</dt>
                  <dd>{g.text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={styles.block} aria-labelledby="roadmap-title">
            <p className={styles.kicker}>The plan</p>
            <h2 id="roadmap-title" className={styles.h2}>The eight stages, in order</h2>
            <p className={styles.sectionLead}>Each stage builds on the one before it. We start with the controllers a pilot holds and finish with larger drones for enterprise work.</p>

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

            {PHASES.map((phase) => (
              <div key={phase.label} className={styles.phase}>
                <div className={styles.phaseHead}>
                  <p className={styles.phaseLabel}>{phase.label}</p>
                  <h3 className={styles.phaseTitle}>{phase.title}</h3>
                  <p className={styles.phaseBlurb}>{phase.blurb}</p>
                </div>

                <ol className={styles.stages}>
                  {phase.stages.map((stage) => (
                    <li key={stage.n} className={styles.stage}>
                      <div className={styles.stageNum} aria-hidden="true">
                        {String(stage.n).padStart(2, '0')}
                      </div>
                      <div className={styles.stageBody}>
                        <div className={styles.stageHeading}>
                          <span className={styles.icon} aria-hidden="true">
                            {stage.icon}
                          </span>
                          <h4 className={styles.stageTitle}>
                            <span className={styles.srOnly}>Stage {stage.n}: </span>
                            {stage.title}
                          </h4>
                          <span className={styles.status}>Planned</span>
                        </div>
                        <p className={styles.stageText}>{stage.plain}</p>
                        <p className={styles.stageResult}>
                          <CheckCircle2 size={14} aria-hidden="true" />
                          <span>
                            <strong>Result: </strong>
                            {stage.result}
                          </span>
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </section>

          <p className={styles.disclaimer}>This is a plan, not a list of finished products. Each stage builds on the one before it, and timings will move as the research does.</p>

          <section className={styles.cta} aria-labelledby="research-cta-title">
            <div className={styles.ctaMain}>
              <p className={styles.ctaKicker}>Collaborate</p>
              <h2 id="research-cta-title" className={styles.ctaTitle}>Work with us on this</h2>
              <p className={styles.ctaText}>Tell us which stage you would like to work on and what you can bring. We reply to every enquiry.</p>
              <ul className={styles.ctaWho}>
                <li>
                  <GraduationCap size={16} aria-hidden="true" /> Students
                </li>
                <li>
                  <Building2 size={16} aria-hidden="true" /> Colleges
                </li>
                <li>
                  <FlaskConical size={16} aria-hidden="true" /> Researchers
                </li>
                <li>
                  <Landmark size={16} aria-hidden="true" /> Industry and government
                </li>
              </ul>
            </div>
            <div className={styles.ctaActions}>
              <Link to="/enquire?type=general&from=research" className={styles.ctaButton}>
                Send an enquiry <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <a href={`mailto:${CONTACT_EMAIL}`} className={styles.ctaMail}>
                <Mail size={16} aria-hidden="true" /> {CONTACT_EMAIL}
              </a>
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  )
}
