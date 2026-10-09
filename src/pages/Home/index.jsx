
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Wrench, MonitorPlay, Gamepad2, PackageCheck, Rocket, Dices, ArrowRight, ArrowLeft, Atom, Map, Brain, Sprout, CircuitBoard, Check } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import SketchfabEmbed from '@components/common/SketchfabEmbed'
import ReviewsSection from '@components/sections/ReviewsSection'
import PartnersSection from '@components/sections/PartnersSection'
import { PREREQUISITES_DATA } from '@data/prerequisites'
import styles from './Home.module.css'

const ALL_PREREQS = PREREQUISITES_DATA.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category })));

const STATS = [
  { value: '10 days', label: 'Hands-on piloting workshop' },
  { value: 'Sim + real', label: 'Simulator and real FPV flying' },
  { value: '1st in India', label: 'Workshop of its kind' },
  { value: '8', label: 'Drone part categories in the catalog' },
]

const LEARNING_AREAS = [
  {
    icon: <Atom size={24} />,
    title: 'Flight science',
    items: ['Physics of flight', 'Aerodynamics', 'Everything related to flying'],
  },
  {
    icon: <Map size={24} />,
    title: 'Sensing and mapping',
    items: ['GIS and sensor mapping', 'LiDAR and 3D mapping', 'Thermal camera integration'],
  },
  {
    icon: <Brain size={24} />,
    title: 'AI and vision',
    items: ['AI integration', 'Computer vision', 'YOLO model integration'],
  },
  {
    icon: <Sprout size={24} />,
    title: 'Real-world uses',
    items: ['Agriculture drones', 'Cinematic drone shoots', 'Defence drones'],
  },
  {
    icon: <CircuitBoard size={24} />,
    title: 'Build and research',
    items: ['PCB design', 'Drone research', 'And much more'],
  },
]

const ROADMAP_STEPS = [
  {
    icon: <Wrench size={32} />,
    tagline: 'Step 01 - Component Selection',
    title: 'Digital Blueprint',
    description: 'Select components from our extensive database to create your perfect digital FPV build. Our builder ensures all parts are compatible.'
  },
  {
    icon: <MonitorPlay size={32} />,
    tagline: 'Step 02 - Virtual Configuration',
    title: 'Virtual Tuning',
    description: 'Learn to master the Betaflight Configurator. Sync your digital build and tune PIDs for maximum performance before touching a single wire.'
  },
  {
    icon: <Gamepad2 size={32} />,
    tagline: 'Step 03 - Flight Proficiency',
    title: 'Simulation Mastery',
    description: 'Connect your radio and log hours in the sim. Master freestyle and racing in a risk-free digital environment until it feels like second nature.'
  },
  {
    icon: <PackageCheck size={32} />,
    tagline: 'Step 04 - Precise Procurement',
    title: 'Procurement',
    description: 'Download your precision BOM file for local ordering or visit our partner e-com site to get everything you need in one organized shipment.'
  },
  {
    icon: <Rocket size={32} />,
    tagline: 'Step 05 - Manifest Reality',
    title: 'The Real Deal',
    description: 'Follow our step-by-step soldering and assembly guides to bring your digital build into the physical world and take your first real flight.'
  }
]

export default function Home() {
  return (
    <PageWrapper fullHeight>
      {/* ======= HERO ======= */}
      <section className={styles.hero}>
        {/* Sketchfab 3D Embed */}
        <div className={styles.canvasArea}>
          <SketchfabEmbed
            uid="d6d764a022a94736b9f80ccd45cee754"
            title="Game Ready iFlight Nazgul Evoque F6X FPV Drone"
            poster="/images/hero-drone-poster-2.webp"
            posterClassName={styles.heroPoster}
            eager
          />
        </div>

        {/* Hero Content */}
        <div className={`container ${styles.heroContent}`} style={{ pointerEvents: 'none' }}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className={styles.eyebrow}>India&apos;s first hands-on FPV drone workshop</p>
            <h1 className={styles.headline}>
              Fly Beyond<br />
              <span className="gradient-text">Limits</span>
            </h1>
            <p className={styles.sub}>
              Fly real FPV drones, not just watch. Learn the engineering behind them in a
              10-day workshop that starts in the simulator and ends in the air.
            </p>
            <div className={styles.heroActions} style={{ pointerEvents: 'auto' }}>
              <Link to="/workshops" className={styles.primaryBtn}>
                See workshops
              </Link>
              <Link to="/catalog" className={styles.ghostBtn}>
                Explore parts <ArrowRight size={16} style={{ marginLeft: 'var(--space-2)' }} />
              </Link>
            </div>
          </motion.div>
        </div>

      </section>

      {/* ======= TEAM ======= */}
      <section className={`section ${styles.teamSection}`}>
        <div className={`container ${styles.teamGrid}`}>
          <motion.div
            className={styles.teamPhoto}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="/gallery/workshop-1/full/roph9613.webp"
              alt="The EGIRE Robotics team with FPV goggles and a radio controller"
              width="3200"
              height="2133"
              loading="lazy"
            />
          </motion.div>
          <motion.div
            className={styles.teamText}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className={styles.sectionEyebrow}>Our team</p>
            <h2 className={styles.teamTitle}>A controller and a drone in every student&apos;s hands</h2>
            <p className={styles.teamCopy}>
              We are the first company in India to put a controller and a drone directly in students&apos;
              hands for flight practice. No one else runs a workshop like this across the country.
            </p>
            <ul className={styles.teamPoints}>
              <li><Check size={18} /> Simulator practice first, then real FPV piloting</li>
              <li><Check size={18} /> A 10-day piloting workshop, not only theory</li>
              <li><Check size={18} /> Real engineering skills, not drone explainers</li>
            </ul>
            <div className={styles.heroActions}>
              <Link to="/about" className={styles.ghostBtn}>
                Meet the team <ArrowRight size={16} style={{ marginLeft: 'var(--space-2)' }} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ======= WHAT YOU LEARN ======= */}
      <section className={`section ${styles.learnSection}`}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className={styles.sectionEyebrow}>What you will learn</p>
            <h2 className={styles.sectionTitle}>Real engineering skills, not just flying</h2>
            <p className={styles.sectionSub}>
              We are not here to explain drones. The workshop goes deep into the engineering behind them.
            </p>
          </motion.div>

          <div className={styles.learnGrid}>
            {LEARNING_AREAS.map((area, index) => (
              <motion.div
                key={area.title}
                className={styles.learnCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div className={styles.learnIcon}>{area.icon}</div>
                <h3 className={styles.learnTitle}>{area.title}</h3>
                <ul className={styles.learnList}>
                  {area.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= ROADMAP ======= */}
      <section className={`section ${styles.roadmapSection}`}>
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className={styles.sectionEyebrow}>Your Journey</p>
            <h2 className={styles.sectionTitle}>FPV Pilot Roadmap</h2>
            <p className={styles.sectionSub}>From the first click to the first real flight. Follow the path to becoming a pro pilot.</p>
          </motion.div>

          <div className={styles.roadmapContainer}>
            <div className={styles.roadmapConnector} />
            <div className={styles.roadmapGrid}>
              {ROADMAP_STEPS.map((step, index) => (
                <motion.div
                  key={index}
                  className={styles.roadmapStep}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-10% 0px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={styles.roadmapIconWrapper}>
                    {step.icon}
                  </div>
                  <div className={styles.roadmapContent}>
                    <span className={styles.roadmapStepTagline}>{step.tagline}</span>
                    <h3 className={styles.roadmapStepTitle}>{step.title}</h3>
                    <p className={styles.roadmapStepDesc}>{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======= STATS ======= */}
      <section className={`section ${styles.statsSection}`}>
        <div className="container">
          <div className={styles.statsGrid}>
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                className={styles.statCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======= PREREQUISITES SLIDER ======= */}
      <PrerequisitesSlider />

      {/* ======= REVIEWS ======= */}
      <ReviewsSection />

      {/* ======= PARTNERS ======= */}
      <PartnersSection />

      <section className={`section ${styles.ctaBanner}`}>
        <div className="container">
          <motion.div
            className={styles.bannerInner}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.bannerContent}>
              <h2 className={styles.bannerTitle}>
                Ready to <span className="gradient-text">Take Flight?</span>
              </h2>
              <p className={styles.bannerSub}>
                Start your FPV journey today, build, tune, and fly your first freestyle drone. Master the basics before taking to the real skies.
              </p>
              <Link to="/builder" className={styles.primaryBtn}>
                Quote Your First Build <ArrowRight size={16} style={{ marginLeft: 'var(--space-2)' }} />
              </Link>
            </div>

            <div className={styles.banner3D}>
              <div className={styles.sketchfabWrapper}>
                <SketchfabEmbed uid="15dd7ffce5724af0afcc62b00545c401" title="Tiny Whoop FPV drone" theme="dark" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageWrapper>
  )
}

function PrerequisitesSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleRandom = () => {
    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * ALL_PREREQS.length);
    } while (randomIndex === currentIndex && ALL_PREREQS.length > 1);
    setCurrentIndex(randomIndex);
  };

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % ALL_PREREQS.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + ALL_PREREQS.length) % ALL_PREREQS.length);

  const currentItem = ALL_PREREQS[currentIndex];

  // Dynamic image matching based on item name
  const getPrereqImage = (name) => {
    const assetMap = {
      'Soldering iron (temperature controlled)': '/images/soldering_iron.png',
      'Solder wire (lead / lead-free)': '/images/solder_wire.png',
      'Flux': '/images/flux.png',
      'Multimeter': '/images/multimeter.png',
      'Battery': '/images/Battery_4S_1.png',
      'Motor': '/images/Motor.png',
      'Frame': '/images/Frame_x5_1.png',
      'ESC': '/images/ESC_STACK_1.png',
      'Props': '/images/propellers.png',
      'Goggles': '/images/goggles.png',
      'Radio': '/images/controller.png',
      'VTX': '/images/vtx.png',
      'FC': '/images/FC.png',
      'Helping hands / PCB holder': '/images/Helping_hands.png',
      'Heat gun / lighter': '/images/Heat_gun.png',
      'Wire stripper': '/images/Wire_stripper.png',
      'Wire cutter (flush cutter)': '/images/Wire_cutter.png',
      'Needle nose pliers': '/images/Neddle_nose_plier.png',
      'Hex driver set (1.5mm / 2mm / 2.5mm)': '/images/Hex_drivers.png',
      'Screwdriver set': '/images/Screw_driver_kit.png',
      'Solder wick (desoldering braid)': '/images/Solder_sucker.png',
      'Solder sucker': '/images/Solder_sucker.png',
      'Smoke Stopper': '/images/Smoke_stopper.png',
      'LiPo Battery Charger': '/images/LiPo_Battery_Charger.png',
      'Tweezers': '/images/Tweezers.png',
      'Zip ties': '/images/Zip_ties.png',
      'Digital Caliper': '/images/Digital_caliper.png',
      'Hot glue gun / Conformal Coating': '/images/Hot_glue_gun.png',
      'Double-sided tape': '/images/Double_sided_tape.png',
      'Electrical tape': '/images/Electrical_tape.png',
      'Heat shrink tubing': '/images/Heat_shrink_tubing.png',
    };

    // Try to find a match in the keys
    const match = Object.keys(assetMap).find(key => name.toLowerCase().includes(key.toLowerCase()));
    return assetMap[match] || '/images/Motor.png'; // Fallback to Motor
  };

  const currentImage = getPrereqImage(currentItem.name);

  return (
    <section className={`section ${styles.prereqSection}`}>
      <div className="container">
        <motion.div
          className={styles.sectionHeader}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className={styles.sectionEyebrow}>Learn & Build</p>
          <h2 className={styles.sectionTitle}>Drone Build Prerequisites</h2>
          <p className={styles.sectionSub}>Get familiar with every tool and component before touching a soldering iron.</p>
        </motion.div>

        <div className={styles.sliderContainer}>
          <button className={styles.sliderNavBtn} onClick={handlePrev} aria-label="Previous"><ArrowLeft size={24} /></button>

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={styles.prereqCardLarge}
          >
            <div className={styles.prereqCardLeft}>
              <div className={styles.prereqCategoryTag}>{currentItem.category}</div>
              <h3 className={styles.prereqCardTitle}>{currentItem.name}</h3>
              <p className={styles.prereqCardDesc}>{currentItem.description}</p>

              <div className={styles.prereqGridList}>
                <div className={styles.prereqDetailItem}>
                  <span className={styles.detailLabel}>When:</span>
                  <span className={styles.detailValue}>{currentItem.whenToUse}</span>
                </div>
                <div className={styles.prereqDetailItem}>
                  <span className={styles.detailLabel}>Where:</span>
                  <span className={styles.detailValue}>{currentItem.whereToUse}</span>
                </div>
                <div className={styles.prereqDetailItem}>
                  <span className={styles.detailLabel}>Why:</span>
                  <span className={styles.detailValue}>{currentItem.whyToUse}</span>
                </div>
                <div className={styles.prereqDetailItem}>
                  <span className={styles.detailLabel}>Impact:</span>
                  <span className={`${styles.detailValue} ${styles.impactText}`}>{currentItem.impact}</span>
                </div>
              </div>
            </div>
            <div className={styles.prereqCardRight}>
              <div className={styles.prereqImageWrapper}>
                <img src={currentImage} alt={currentItem.name} className={styles.prereqImage} />
              </div>
              <div className={styles.prereqControlsRight}>
                <span className={styles.sliderCountCompact}>{currentIndex + 1} / {ALL_PREREQS.length}</span>
                <button className={styles.shuffleBtn} onClick={handleRandom} title="Shuffle to a random card">
                  <Dices size={18} />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>
          </motion.div>

          <button className={styles.sliderNavBtn} onClick={handleNext} aria-label="Next"><ArrowRight size={24} /></button>
        </div>
      </div>
    </section>
  )
}

