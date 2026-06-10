import { motion } from 'framer-motion'
import { Target, Video, Bird, Flag, Mountain } from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import styles from './Intro.module.css'

const DRONE_TYPES = [
  {
    id: 'tinywhoop',
    name: 'Tiny Whoops',
    icon: <Target size={32} />,
    desc: 'Small, lightweight (under 50g), and equipped with propeller guards (ducts). Perfect for flying indoors, safely around people, and learning the basics without risk of damage.',
    specs: ['Size: 65mm - 85mm', 'Battery: 1S - 2S LiPo', 'Use Case: Indoor, Safe'],
  },
  {
    id: 'cinewhoop',
    name: 'Cinewhoops',
    icon: <Video size={32} />,
    desc: 'Larger than Tiny Whoops and designed specifically to carry action cameras like GoPros. Their ducted design makes them safe to fly near subjects for cinematic video production.',
    specs: ['Size: 2.5" - 3.5"', 'Battery: 4S - 6S LiPo', 'Use Case: Cinematic, Real Estate'],
  },
  {
    id: 'freestyle',
    name: 'Freestyle (5-inch)',
    icon: <Bird size={32} />,
    desc: 'The gold standard of FPV. Open-propeller design for maximum thrust and agility. Built for acrobatic maneuvers, diving buildings, and raw power.',
    specs: ['Size: 5"', 'Battery: 4S - 6S LiPo', 'Use Case: Acrobatics, Bando flying'],
  },
  {
    id: 'racer',
    name: 'Racers',
    icon: <Flag size={32} />,
    desc: 'Stripped down to the bare minimum weight for pure speed. Highly aerodynamic frames designed for navigating tight tracks at 100+ mph.',
    specs: ['Size: 5"', 'Battery: 6S LiPo', 'Use Case: Professional Racing'],
  },
  {
    id: 'macro',
    name: 'Long Range / Macro',
    icon: <Mountain size={32} />,
    desc: 'Large drones built for efficiency and stability. Equipped with GPS and high-capacity batteries to fly miles away for mountain surfing.',
    specs: ['Size: 7" - 10"', 'Battery: 6S Li-Ion', 'Use Case: Mountain surfing, Exploration'],
  }
]

const BRANDS = [
  {
    id: 'dji',
    name: 'DJI',
    tagline: 'The Industry Giant',
    desc: 'Dominates the digital video transmission space (DJI O3 Air Unit) and sells premium pre-built drones like the DJI Avata 2 and FPV.',
    color: '#E0E0E0'
  },
  {
    id: 'iflight',
    name: 'iFlight',
    tagline: 'Premium Bind-and-Fly',
    desc: 'Famous for the Nazgul series. Produces incredibly high-quality pre-built drones, frames, and motors loved by beginners and pros alike.',
    color: '#00d4ff'
  },
  {
    id: 'radiomaster',
    name: 'RadioMaster',
    tagline: 'The Control Standard',
    desc: 'The undisputed king of FPV controllers. Makers of the TX16S, Boxer, and Pocket radios running EdgeTX firmware.',
    color: '#ff4b4b'
  },
  {
    id: 'betafpv',
    name: 'BetaFPV',
    tagline: 'Micro Drone Leaders',
    desc: 'Pioneers in the Tiny Whoop and micro drone categories. Excellent entry-level kits and ELRS hardware.',
    color: '#0055ff'
  },
  {
    id: 'tbs',
    name: 'Team BlackSheep',
    tagline: 'Long Range Pioneers',
    desc: 'Legendary brand that pioneered the Crossfire long-range control link and the iconic TBS Tango 2 controller.',
    color: '#ffa500'
  }
]

export default function IntroToDrones() {
  return (
    <PageWrapper>
      {/* HEADER SECTION */}
      <section className={styles.heroSection}>
        <div className="container">
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className={styles.eyebrow}>Academy</p>
            <h1 className={styles.title}>Intro to Drones</h1>
            <p className={styles.subtitle}>
              Understanding the different classes of FPV drones and the major brands that power the industry.
            </p>
          </motion.div>
        </div>
      </section>

      {/* TYPES OF DRONES */}
      <section className={`section ${styles.typesSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Types of Drones</h2>
            <p>From tiny indoor fliers to long-range mountain surfers.</p>
          </div>
          
          <div className={styles.grid}>
            {DRONE_TYPES.map((type, idx) => (
              <motion.div
                key={type.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className={styles.cardIcon}>{type.icon}</div>
                <h3 className={styles.cardTitle}>{type.name}</h3>
                <p className={styles.cardDesc}>{type.desc}</p>
                <ul className={styles.specList}>
                  {type.specs.map((spec, i) => (
                    <li key={i}><span>▸</span> {spec}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BRANDS SHOWCASE */}
      <section className={`section ${styles.brandsSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Major Brands</h2>
            <p>The top manufacturers in the FPV space.</p>
          </div>

          <div className={styles.brandList}>
            {BRANDS.map((brand, idx) => (
              <motion.div
                key={brand.id}
                className={styles.brandItem}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                style={{ '--brand-color': brand.color }}
              >
                <div className={styles.brandLogoPlaceholder}>
                  {brand.name.toUpperCase()}
                </div>
                <div className={styles.brandInfo}>
                  <h3>{brand.name}</h3>
                  <span className={styles.brandTagline}>{brand.tagline}</span>
                  <p>{brand.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </PageWrapper>
  )
}
