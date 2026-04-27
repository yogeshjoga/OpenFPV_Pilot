// ================================
// Page — Home
// ================================

import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import PageWrapper from '@components/layout/PageWrapper'
import { PREREQUISITES_DATA } from '@data/prerequisites'
import styles from './Home.module.css'

const ALL_PREREQS = PREREQUISITES_DATA.flatMap(cat => cat.items.map(item => ({ ...item, category: cat.category })));

const STATS = [
  { value: '8', label: 'Part Categories' },
  { value: '7-Day', label: 'Build Bootcamp' },
  { value: '100%', label: 'Free & Open Source' },
  { value: '14-Day', label: 'Pilot Program' },
]

const ROADMAP_STEPS = [
  {
    icon: '🛠️',
    tagline: 'Step 01 // Component Selection',
    title: 'Digital Blueprint',
    description: 'Select components from our extensive open-source database to create your perfect digital FPV build. Our builder ensures all parts are compatible.'
  },
  {
    icon: '💻',
    tagline: 'Step 02 // Virtual Configuration',
    title: 'Virtual Tuning',
    description: 'Learn to master the Betaflight Configurator. Sync your digital build and tune PIDs for maximum performance before touching a single wire.'
  },
  {
    icon: '🎮',
    tagline: 'Step 03 // Flight Proficiency',
    title: 'Simulation Mastery',
    description: 'Connect your radio and log hours in the sim. Master freestyle and racing in a risk-free digital environment until it feels like second nature.'
  },
  {
    icon: '📦',
    tagline: 'Step 04 // Precise Procurement',
    title: 'Procurement',
    description: 'Download your precision BOM file for local ordering or visit our partner e-com site to get everything you need in one organized shipment.'
  },
  {
    icon: '🚀',
    tagline: 'Step 05 // Manifest Reality',
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
          <div className="sketchfab-embed-wrapper" style={{ width: '100%', height: '100%' }}>
            <iframe
              title="Game Ready iFlight Nazgul Evoque F6X FPV Drone"
              frameBorder="0"
              allowFullScreen
              mozallowfullscreen="true"
              webkitallowfullscreen="true"
              allow="autoplay; fullscreen; xr-spatial-tracking"
              xr-spatial-tracking="true"
              execution-while-out-of-viewport="true"
              execution-while-not-rendered="true"
              web-share="true"
              src="https://sketchfab.com/models/d6d764a022a94736b9f80ccd45cee754/embed?autostart=1&transparent=1&ui_theme=light&ui_infos=0&ui_watermark=0&ui_watermark_link=0&ui_hint=0&ui_stop=0&autospin=1"
            ></iframe>
          </div>
        </div>

        {/* Grid overlay */}
        <div className={styles.grid} aria-hidden="true" />

        {/* Hero Content */}
        <div className={`container ${styles.heroContent}`} style={{ pointerEvents: 'none' }}>
          <motion.div
            className={styles.heroText}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <p className={styles.eyebrow}>// Open Source FPV Learning</p>
            <h1 className={styles.headline}>
              Fly Beyond<br />
              <span className="gradient-text">Limits</span>
            </h1>
            <p className={styles.sub}>
              Build your own FPV drone from scratch. Learn to fly freestyle,
              cinematic &amp; racing — all in one free, open-source platform.
            </p>
            <div className={styles.heroActions} style={{ pointerEvents: 'auto' }}>
              <Link to="/catalog" className={styles.primaryBtn}>
                Explore Parts
              </Link>
              <Link to="/about" className={styles.ghostBtn}>
                Learn More →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className={styles.scrollIndicator}
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ↓
        </motion.div>
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
            <p className={styles.sectionEyebrow}>// Your Journey</p>
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
                Start your FPV journey today — build, tune, and fly your first freestyle drone for free. Master the basics before taking to the real skies.
              </p>
              <Link to="/builder" className={styles.primaryBtn}>
                Quote Your First Build →
              </Link>
            </div>

            <div className={styles.banner3D}>
              <div className={styles.sketchfabWrapper}>
                <iframe
                  title="Tiny Whoop FPV drone"
                  frameBorder="0"
                  allowFullScreen
                  mozallowfullscreen="true"
                  webkitallowfullscreen="true"
                  allow="autoplay; fullscreen; xr-spatial-tracking"
                  xr-spatial-tracking="true"
                  execution-while-out-of-viewport="true"
                  execution-while-not-rendered="true"
                  web-share="true"
                  src="https://sketchfab.com/models/15dd7ffce5724af0afcc62b00545c401/embed?autostart=1&transparent=1&ui_theme=dark&ui_infos=0&ui_watermark=0&ui_watermark_link=0&ui_hint=0&ui_stop=0&ui_controls=0&ui_inspector=0&ui_help=0&autospin=1"
                ></iframe>
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
      'Soldering iron (temperature controlled)': '/src/assets/images/soldering_iron.png',
      'Solder wire (lead / lead-free)': '/src/assets/images/solder_wire.png',
      'Flux': '/src/assets/images/flux.png',
      'Multimeter': '/src/assets/images/multimeter.png',
      'Battery': '/src/assets/images/Battery_4S_1.png',
      'Motor': '/src/assets/images/Motor.png',
      'Frame': '/src/assets/images/Frame_x5_1.png',
      'ESC': '/src/assets/images/ESC_STACK_1.png',
      'Props': '/src/assets/images/propellers.png',
      'Goggles': '/src/assets/images/goggles.png',
      'Radio': '/src/assets/images/controller.png',
      'VTX': '/src/assets/images/vtx.png',
      'FC': '/src/assets/images/FC.png',
      'Helping hands / PCB holder': '/src/assets/images/Helping_hands.png',
      'Heat gun / lighter': '/src/assets/images/Heat_gun.png',
      'Wire stripper': '/src/assets/images/Wire_stripper.png',
      'Wire cutter (flush cutter)': '/src/assets/images/Wire_cutter.png',
      'Needle nose pliers': '/src/assets/images/Neddle_nose_plier.png',
      'Hex driver set (1.5mm / 2mm / 2.5mm)': '/src/assets/images/Hex_drivers.png',
      'Screwdriver set': '/src/assets/images/Screw_driver_kit.png',
      'Solder wick (desoldering braid)': '/src/assets/images/Solder_sucker.png',
      'Solder sucker': '/src/assets/images/Solder_sucker.png',
      'Smoke Stopper': '/src/assets/images/Smoke_Stopper.png',
      'LiPo Battery Charger': '/src/assets/images/LiPo_Battery_Charger.png',
      'Tweezers': '/src/assets/images/Tweezers.png',
      'Zip ties': '/src/assets/images/Zip_ties.png',
      'Digital Caliper': '/src/assets/images/Digital_caliper.png',
      'Hot glue gun / Conformal Coating': '/src/assets/images/Hot_glue_gun.png',
      'Double-sided tape': '/src/assets/images/Double_sided_tape.png',
      'Electrical tape': '/src/assets/images/Electrical_tape.png',
      'Heat shrink tubing': '/src/assets/images/Heat_shrink_tubing.png',




    };

    // Try to find a match in the keys
    const match = Object.keys(assetMap).find(key => name.toLowerCase().includes(key.toLowerCase()));
    return assetMap[match] || '/src/assets/images/Motor.png'; // Fallback to Motor
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
          <p className={styles.sectionEyebrow}>// Learn & Build</p>
          <h2 className={styles.sectionTitle}>Drone Build Prerequisites</h2>
          <p className={styles.sectionSub}>Get familiar with every tool and component before touching a soldering iron.</p>
        </motion.div>

        <div className={styles.sliderContainer}>
          <button className={styles.sliderNavBtn} onClick={handlePrev} aria-label="Previous">←</button>

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
              <img src={currentImage} alt={currentItem.name} className={styles.prereqImage} />
            </div>
          </motion.div>

          <button className={styles.sliderNavBtn} onClick={handleNext} aria-label="Next">→</button>
        </div>

        <div className={styles.randomBtnContainer}>
          <button className={styles.primaryBtn} onClick={handleRandom}>
            🎲 Random Learning
          </button>
          <p className={styles.sliderCount}>{currentIndex + 1} / {ALL_PREREQS.length}</p>
        </div>
      </div>
    </section>
  )
}

