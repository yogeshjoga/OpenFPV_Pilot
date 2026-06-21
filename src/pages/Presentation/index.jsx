import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ArrowRight, RotateCcw, Play, Compass, Cpu, 
  Gamepad2, Star, Shield, Award, Sparkles, Sliders, Activity 
} from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import DroneScene from '../Assembly3D/components/DroneScene'
import styles from './Presentation.module.css'

// Completed parts list for the 3D showcase
const completedParts = {
  frame: true,
  m1: true,
  m2: true,
  m3: true,
  m4: true,
  esc: true,
  fc: true,
  vtx: true,
  p1: true,
  p2: true,
  p3: true,
  p4: true,
}

// 4 Presentation Decks
const DECKS = [
  {
    id: 'master',
    title: 'FPV Master Syllabus',
    subtitle: '14-Day Comprehensive Program',
    badge: 'Course 1',
    color: '#00d4ff',
    desc: 'From basic electronics and frame building to Acro flight dynamics, dynamic PID tuning, and diagnostics.',
    slides: [
      {
        type: 'title',
        title: 'FPV Drone Engineering & Piloting',
        subtitle: '14-Day Zero-to-Flight Master Curriculum',
        content: (
          <div className={styles.slideCard}>
            <div className={styles.slideCardHeader}>
              <Star size={16} /> Course Blueprint
            </div>
            <p className={styles.slideCardDesc}>
              A comprehensive academic program covering applied electrical physics, structural mechanics, RF link engineering, control loop systems, and manual flight training.
            </p>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Phase 1: Electronics & Frame Building',
        subtitle: 'Days 1 to 3: Core Mechanical & Electrical Assembly',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 1: Electrical Safety</strong> — LiPo battery storage values, charge multipliers, and multimeter short circuit checks.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 2: Frame Dynamics</strong> — Stretched-X carbon fiber structural physics and Arm motor mounting torque.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 3: ESC Wiring</strong> — High-current dome soldering and DShot communications protocols.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Cpu size={16} /> Day 1-3 Lab Kit</div>
              <p className={styles.slideCardDesc}>
                Students assemble EGIRE 3K carbon fiber frames and solder motor terminals directly to 4-in-1 speed controllers (XT60 capacitor rails).
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Phase 2: Flight Control & RF Links',
        subtitle: 'Days 4 to 6: Board Mounting & Receiver Configuration',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 4: Stacking & Damping</strong> — Soft-mounting the flight controller stack with silicone grommets to cancel noise.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 5: RX & VTX Links</strong> — Binding serial UART ExpressLRS receivers and analog/digital video channels.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 6: Betaflight Configuration</strong> — CLI resource remapping and OSD system parameters setup.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Activity size={16} /> Day 4-6 Lab Kit</div>
              <p className={styles.slideCardDesc}>
                Flashing flight controller firmware, assigning serial ports (UARTs), configuring channel mapping (AETR), and testing failsafe options.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Phase 3: High-Fidelity Simulation & Acro',
        subtitle: 'Days 7 to 10: Manual Flight Control Mechanics',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 7: Bench Safety Checks</strong> — Smoke stopper test and failsafe props-off throttle verification.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 8: Sim Rate Mapping</strong> — Gimbal tension calibration and degrees/second rate curves mapping.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 9-10: Acro Attitude Hover</strong> — Yaw-roll coordination figure-8 flight loops without self-leveling.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Gamepad2 size={16} /> Day 7-10 Skill Milestones</div>
              <p className={styles.slideCardDesc}>
                Students successfully translate simulator muscle memory to physical open-field maiden hovers in full manual (Acro) mode.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Phase 4: Tuning, Aerodynamics & Graduation',
        subtitle: 'Days 11 to 14: Log Analysis & Diagnostics',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 11-12: Real Flight & Proximity</strong> — Wind shear compensation and avoiding turbulent prop-wash flows.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 13: PID & Dynamic Filtering</strong> — Gyroscopic noise cleanup using dynamic notch filters.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Day 14: Timed Gate Capstone</strong> — Flying the capstone course, troubleshooting board bugs, and graduation.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Sliders size={16} /> Day 11-14 Skill Milestones</div>
              <p className={styles.slideCardDesc}>
                Mastering Blackbox data analysis, tweaking P, I, D sliders inside Betaflight, and executing timed obstacle tracking courses.
              </p>
            </div>
          </div>
        )
      },
      {
        type: '3d-drone',
        title: 'Interactive 3D Hardware Review',
        subtitle: 'Master Syllabus: Component Layout',
        content: null
      }
    ]
  },
  {
    id: 'level3',
    title: 'Grade 3 Workshop',
    subtitle: 'Simulation & Foundation',
    badge: 'Level 3',
    color: '#22c55e',
    desc: 'Ideal for large introductory groups. Covers basic aerodynamics, regulations, and team-based simulation exercises.',
    slides: [
      {
        type: 'title',
        title: 'Simulation Skill Certificate',
        subtitle: 'Grade 3 Workshop: Group Simulator & Theory',
        content: (
          <div className={styles.slideCard}>
            <div className={styles.slideCardHeader}>
              <Award size={16} /> Syllabus Overview
            </div>
            <p className={styles.slideCardDesc}>
              A 1-week group workshop designed for absolute beginners to master drone flight mechanics, basic airspace safety, and yaw-roll coordinates.
            </p>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Airspace Regulations & Aerodynamics',
        subtitle: 'Understanding Flight Vectors',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Thrust & Lift Vectors</strong> — Applying Newton\'s Third Law and Bernoulli\'s Principle to generate wing lift.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Drag Factors</strong> — Identifying parasitic and induced drag on standard drone profiles.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Airspace Rules</strong> — Understanding local no-fly zones (red/yellow restrictions) and drone classification limits.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Compass size={16} /> Physics Core</div>
              <p className={styles.slideCardDesc}>
                Students learn how counter-rotating props (CW & CCW) cancel frame torque and how changing rotation speeds controls pitch, roll, and yaw.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Team-Based Simulator Drills',
        subtitle: 'Translating Inputs to Motion',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Mode 2 Stick Layout</strong> — Left stick yaw/throttle, right stick pitch/roll.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Altitude Maintenance</strong> — Fine-tuning hover stability by coordinating throttle percentages.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Team Rotation</strong> — Shared controllers encourage group reviews and telemetry correction tips.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Gamepad2 size={16} /> Lab Exercises</div>
              <p className={styles.slideCardDesc}>
                Group simulator challenges: students take turns flying virtual figure-8 courses while team members log apex speeds.
              </p>
            </div>
          </div>
        )
      }
    ]
  },
  {
    id: 'level2',
    title: 'Grade 2 Workshop',
    subtitle: 'Moderate Skill & Cinewhoop',
    badge: 'Level 2',
    color: '#f59e0b',
    desc: 'Combines individual simulator hours with real-world stabilized flying of ducted Cinewhoop drones.',
    slides: [
      {
        type: 'title',
        title: 'Moderate Skill Certificate',
        subtitle: 'Grade 2 Workshop: Individual Control & Cinewhoop Flying',
        content: (
          <div className={styles.slideCard}>
            <div className={styles.slideCardHeader}>
              <Award size={16} /> Syllabus Overview
            </div>
            <p className={styles.slideCardDesc}>
              A 1-week course focused on individual radio controller calibration, advanced simulator maneuvers, and real-world indoor/outdoor Cinewhoop piloting.
            </p>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Individual Simulator Mastery',
        subtitle: 'Acro Mode Attitude & Coordination',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Stationary Acro Hover</strong> — Individual hover tests in full pilot control (no leveling).</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Coordinated Bank Turns</strong> — Blending Yaw and Roll inputs to carve smooth tracks in the wind.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Basic Acrobatics</strong> — Executing Split-S reversals and power loops around virtual obstacles.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Gamepad2 size={16} /> Individual Labs</div>
              <p className={styles.slideCardDesc}>
                1:1 radio controller mapping: every student gets dedicated simulator time to match their custom flight curves.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Cinewhoop Systems & Camera Tilts',
        subtitle: 'Indoor Aerodynamics & Video Links',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Ducted Props</strong> — Shrouded propeller physics: safety, lift optimization, and wall proximity.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Analog vs. Digital VTX</strong> — Penetration capabilities and video channel allocations.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Cinematic Camera Tilts</strong> — How camera tilt offset links speed directly with throttle percentage.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Cpu size={16} /> Hardware Overview</div>
              <p className={styles.slideCardDesc}>
                Inspecting real ducted frames, adjusting camera angles, and configuring telemetry on the OSD before takeoff.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Real-World Flight Operations',
        subtitle: 'Field Safety & Flight Tracking',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Pre-flight Checks</strong> — Motor screw tightness, battery secure strapping, and failsafe arm tests.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Maiden Hover</strong> — Real-world takeoff and landing drift controls in localized wind conditions.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Target Tracking</strong> — Recording smooth video loops while tracking a target model.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Award size={16} /> Graduation Benchmarks</div>
              <p className={styles.slideCardDesc}>
                Complete a physical flight track without crash triggers, demonstrating steady hover and smooth cinematic coordinate turns.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'pid-sandbox',
        title: 'Interactive PID Sandbox Slide',
        subtitle: 'Experiment with Proportional, Integral, and Derivative Values',
        content: null
      }
    ]
  },
  {
    id: 'level1',
    title: 'Grade 1 Workshop',
    subtitle: 'Professional Build & AI',
    badge: 'Level 1',
    color: '#ef4444',
    desc: 'Advanced curriculum. Build a 5" drone from scratch, master advanced soldering, and integrate autonomous AI python code.',
    slides: [
      {
        type: 'title',
        title: 'Professional FPV & Autonomous Build',
        subtitle: 'Grade 1 Workshop: Full Assembly & AI/ML Coding',
        content: (
          <div className={styles.slideCard}>
            <div className={styles.slideCardHeader}>
              <Award size={16} /> Syllabus Overview
            </div>
            <p className={styles.slideCardDesc}>
              A 1-week hardware assembly and software integration course. Students build their own drone from bare frame parts and code OpenCV tracking hooks.
            </p>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Workbench Soldering & Stack Assembly',
        subtitle: 'High-Current Connections & soft-mounting',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Ohm\'s Law in Drones</strong> — Wire gauge (AWG) thickness matching and massive capacitor soldering.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>FC stack mapping</strong> — Vibration soft-mounting and wiring harness pins allocation.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Solder Joint Standards</strong> — Preparing shiny, dome joints on motor pad solder locations.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Cpu size={16} /> Workbench Labs</div>
              <p className={styles.slideCardDesc}>
                Students assemble the frame, solder high-voltage XT60 leads, connect ESC signal pads, and soft-mount flight controller stacks.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Betaflight Programming & Tuning',
        subtitle: 'Sensor Calibrations & ESC Configs',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Board Orientation Offset</strong> — Yaw calibrations when flight controllers are mounted sideways.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Resource Remapping</strong> — Using the command line interface (CLI) to remap damaged motor outputs.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Telemetry & Filters</strong> — Bi-directional DShot setup and active RPM filtering.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Sliders size={16} /> Software Labs</div>
              <p className={styles.slideCardDesc}>
                Configuring motor directions, setting up ARM/flight mode AUX mappings, and tuning sliders to damp propwash vibration.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'content',
        title: 'Autonomous Flight & AI/ML Coding',
        subtitle: 'OpenCV Target Tracking & Companion Boards',
        content: (
          <div className={styles.slideGrid2}>
            <div>
              <ul className={styles.bulletList}>
                <li><span className={styles.bulletDot}>▸</span> <strong>Companion Integration</strong> — Connecting Raspberry Pi boards to FC UART ports using MSP/MAVLink protocols.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>OpenCV Video Pipelines</strong> — Coding python scripts to recognize colors/shapes in the camera feed.</li>
                <li><span className={styles.bulletDot}>▸</span> <strong>Telemetry Override</strong> — Injecting throttle and yaw corrections into the flight loop automatically.</li>
              </ul>
            </div>
            <div className={styles.slideCard}>
              <div className={styles.slideCardHeader}><Sparkles size={16} /> AI Core</div>
              <p className={styles.slideCardDesc}>
                Students code a custom target-following pipeline that allows the quadcopter to maintain a hover lock on a target block autonomously.
              </p>
            </div>
          </div>
        )
      },
      {
        type: 'matrix',
        title: 'Workshops Comparison Matrix',
        subtitle: 'Detailed differences between Grades 3, 2, and 1',
        content: (
          <div className={styles.matrixWrap}>
            <table className={styles.matrixTable}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Grade 3 (L3)</th>
                  <th>Grade 2 (L2)</th>
                  <th>Grade 1 (L1)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Primary Focus</td>
                  <td>Simulation & Foundation</td>
                  <td>Cinewhoop Piloting</td>
                  <td>Hands-on Build & AI</td>
                </tr>
                <tr>
                  <td>Duration</td>
                  <td>1 Week (15 Hours)</td>
                  <td>1 Week (20 Hours)</td>
                  <td>1 Week (30 Hours)</td>
                </tr>
                <tr>
                  <td>Hardware</td>
                  <td>Shared Controller</td>
                  <td>1:1 Controller</td>
                  <td>1:1 Build Bench</td>
                </tr>
                <tr>
                  <td>Soldering Lab</td>
                  <td>No</td>
                  <td>No</td>
                  <td>Yes (FC/ESC/Motors)</td>
                </tr>
                <tr>
                  <td>Coding / AI</td>
                  <td>None</td>
                  <td>None</td>
                  <td>Python Target Tracking</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      }
    ]
  }
]

export default function Presentation() {
  const [activeDeckId, setActiveDeckId] = useState(null)
  const [slideIndex, setSlideIndex] = useState(0)

  // Sandbox PID states
  const [p, setP] = useState(52)
  const [i, setI] = useState(60)
  const [d, setD] = useState(35)
  const [isSimRunning, setIsSimRunning] = useState(false)
  const [points, setPoints] = useState([])
  const [droneAngle, setDroneAngle] = useState(0)
  const [simMessage, setSimMessage] = useState('Click "Run Simulation" to test parameters.')
  const [simStatus, setSimStatus] = useState('idle')

  const simInterval = useRef(null)

  const stopSimulation = () => {
    if (simInterval.current) {
      clearInterval(simInterval.current)
      simInterval.current = null
    }
    setIsSimRunning(false)
    setDroneAngle(0)
    setPoints([])
  }

  const runSimulation = () => {
    stopSimulation()
    setIsSimRunning(true)
    const target = 40
    let current = 0
    let lastError = target - current
    let integral = 0
    const maxSteps = 100
    let step = 0
    const newPoints = []

    const kp = p * 0.04
    const ki = i * 0.002
    const kd = d * 0.2

    simInterval.current = setInterval(() => {
      const error = target - current
      integral += error
      if (integral > 200) integral = 200
      if (integral < -200) integral = -200
      const derivative = error - lastError
      const output = (kp * error) + (ki * integral) + (kd * derivative)
      current += output * 0.15
      lastError = error

      if (isNaN(current) || Math.abs(current) > 200) {
        current = current > 0 ? 200 : -200
      }

      newPoints.push({ x: step, y: current })
      setPoints([...newPoints])
      setDroneAngle(current)

      step++
      if (step >= maxSteps) {
        clearInterval(simInterval.current)
        setIsSimRunning(false)
        evaluateTune(kp, ki, kd, newPoints, target)
      }
    }, 30)
  }

  const evaluateTune = (kp, ki, kd, points, target) => {
    let maxVal = 0
    let crossesTarget = 0
    for (let idx = 1; idx < points.length; idx++) {
      const val = points[idx].y
      if (val > maxVal) maxVal = val
      const prevVal = points[idx-1].y
      if ((prevVal < target && val >= target) || (prevVal > target && val <= target)) {
        crossesTarget++
      }
    }
    const overshootPercent = ((maxVal - target) / target) * 100
    const finalVal = points[points.length - 1].y
    const errorFromTarget = Math.abs(target - finalVal)

    if (maxVal > 80 || crossesTarget > 6) {
      setSimStatus('danger')
      setSimMessage('DANGER: Violent oscillations! Your PID gains are too high, or D-term is too low. High risk of hot motors.')
    } else if (errorFromTarget > 8) {
      setSimStatus('warning')
      setSimMessage('WARNING: Mushy response / steady-state drift. P-gain is too low to fight gravity.')
    } else if (overshootPercent > 25 && crossesTarget > 3) {
      setSimStatus('warning')
      setSimMessage('CAUTION: Propwash shivers detected. Increase D-gain or reduce P.')
    } else {
      setSimStatus('success')
      setSimMessage('EXCELLENT: Responsive locked-in tune. Drone snaps to the setpoint rapidly.')
    }
  }

  useEffect(() => {
    return () => stopSimulation()
  }, [])

  const selectDeck = (deckId) => {
    setActiveDeckId(deckId)
    setSlideIndex(0)
    stopSimulation()
  }

  const currentDeck = DECKS.find(d => d.id === activeDeckId)
  const currentSlide = currentDeck?.slides[slideIndex]

  const handleNext = () => {
    if (slideIndex < currentDeck.slides.length - 1) {
      setSlideIndex(slideIndex + 1)
      stopSimulation()
    }
  }

  const handlePrev = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1)
      stopSimulation()
    }
  }

  return (
    <PageWrapper hideFooter={true}>
      <div className={styles.container}>
        <div className={styles.ambientGlow1} />
        <div className={styles.ambientGlow2} />

        <AnimatePresence mode="wait">
          {!activeDeckId ? (
            /* ── DECK SELECTOR DASHBOARD ── */
            <motion.div 
              className={styles.dashboard}
              key="dashboard"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <h1 className={styles.title}>FPV Course <span className="gradient-text">Slides</span></h1>
              <p className={styles.subtitle}>
                Select an interactive presentation slide deck below to present our curriculum paths and university workshop structures.
              </p>

              <div className={styles.deckGrid}>
                {DECKS.map(deck => (
                  <div 
                    key={deck.id}
                    className={styles.deckCard}
                    onClick={() => selectDeck(deck.id)}
                    style={{ '--deck-color': deck.color }}
                  >
                    <div>
                      <span className={styles.deckBadge}>{deck.badge}</span>
                      <h3 className={styles.deckTitle}>{deck.title}</h3>
                      <p className={styles.deckDesc}>{deck.desc}</p>
                    </div>
                    <div className={styles.deckMeta}>
                      <span>{deck.subtitle}</span>
                      <span>{deck.slides.length} slides →</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* ── ACTIVE DECK PLAYER ── */
            <motion.div
              className={styles.player}
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 70px)' }}
            >
              {/* Header bar */}
              <div className={styles.playerHeader} style={{ '--deck-color': currentDeck.color }}>
                <div className={styles.playerBranding}>
                  <button className={styles.backBtn} onClick={() => setActiveDeckId(null)}>
                    <ArrowLeft size={14} /> Back to Decks
                  </button>
                </div>
                <div className={styles.playerDeckInfo}>
                  <h2 className={styles.playerDeckTitle}>{currentDeck.title}</h2>
                  <span className={styles.playerSlideCount}>Slide {slideIndex + 1} of {currentDeck.slides.length}</span>
                </div>
              </div>

              {/* Slide content viewport */}
              <div className={styles.slideContainer}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideIndex}
                    className={styles.slideWindow}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    style={{ '--deck-color': currentDeck.color }}
                  >
                    <h2 className={styles.slideTitle}>{currentSlide.title}</h2>
                    <p className={styles.slideSubtitle}>{currentSlide.subtitle}</p>

                    {/* RENDER DYNAMIC SLIDE CONTENT */}
                    {currentSlide.type === 'title' && (
                      <div style={{ textAlign: 'center', paddingBlock: 'var(--space-6)' }}>
                        <h3 style={{ fontSize: '2.5rem', marginBottom: 'var(--space-4)', fontWeight: 800 }}>{currentSlide.title}</h3>
                        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.2rem', marginBottom: 'var(--space-8)' }}>{currentSlide.subtitle}</p>
                        {currentSlide.content}
                      </div>
                    )}

                    {currentSlide.type === 'content' && currentSlide.content}

                    {currentSlide.type === 'matrix' && currentSlide.content}

                    {/* Interactive 3D Drone Scene Slide */}
                    {currentSlide.type === '3d-drone' && (
                      <div className={styles.slideGrid2}>
                        <div>
                          <ul className={styles.bulletList}>
                            <li><span className={styles.bulletDot}>▸</span> <strong>Chassis Inspection:</strong> Rotate the carbon fiber base frame to understand motor leverage.</li>
                            <li><span className={styles.bulletDot}>▸</span> <strong>Electronics Layer:</strong> Review the placement of the 4-in-1 ESC and Flight Controller stack blocks.</li>
                            <li><span className={styles.bulletDot}>▸</span> <strong>Propeller Spin Directions:</strong> Observe CW and CCW markings mapped on the propellers.</li>
                          </ul>
                        </div>
                        <div className={styles.slide3DContainer}>
                          <div className={styles.slide3DCanvasWrap}>
                            <DroneScene parts={completedParts} onAttach={() => {}} activePart={null} isComplete={true} />
                          </div>
                          <div className={styles.slide3DOverlay}>
                            Drag to rotate, scroll to zoom. Hover over nodes to inspect FPV components.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive PID Sandbox Slide */}
                    {currentSlide.type === 'pid-sandbox' && (
                      <div className={styles.slidePidWrap}>
                        {/* Sliders panel */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: '#ff4444', fontWeight: 700 }}>P (Proportional)</span>
                            <input 
                              type="range" min="1" max="100" value={p}
                              onChange={(e) => { setP(Number(e.target.value)); stopSimulation(); }}
                              style={{ width: '100%', accentColor: '#ff4444' }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: '#00d4ff', fontWeight: 700 }}>I (Integral)</span>
                            <input 
                              type="range" min="1" max="100" value={i}
                              onChange={(e) => { setI(Number(e.target.value)); stopSimulation(); }}
                              style={{ width: '100%', accentColor: '#00d4ff' }}
                            />
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', color: '#ffcc00', fontWeight: 700 }}>D (Derivative)</span>
                            <input 
                              type="range" min="1" max="100" value={d}
                              onChange={(e) => { setD(Number(e.target.value)); stopSimulation(); }}
                              style={{ width: '100%', accentColor: '#ffcc00' }}
                            />
                          </div>
                          <div style={{ marginTop: '8px' }}>
                            {!isSimRunning ? (
                              <button onClick={runSimulation} className={styles.controlBtn} style={{ width: '100%', justifyContent: 'center' }}>
                                <Play size={14} /> Run Simulation
                              </button>
                            ) : (
                              <button onClick={stopSimulation} className={styles.controlBtn} style={{ width: '100%', justifyContent: 'center' }}>
                                <RotateCcw size={14} /> Reset
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Visualizer output */}
                        <div style={{ display: 'flex', gap: '20px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {/* 2D Drone Box */}
                          <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: '20px' }}>
                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '10px' }}>Tilt Visualizer</span>
                            <div style={{ width: '100px', height: '100px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                              <div style={{ transform: `rotate(${droneAngle}deg)`, transition: 'transform 0.05s' }}>
                                <svg width="70" height="20" viewBox="0 0 70 20">
                                  <line x1="10" y1="10" x2="60" y2="10" stroke="white" strokeWidth="2" />
                                  <circle cx="35" cy="10" r="6" fill="#00d4ff" />
                                  <ellipse cx="10" cy="5" rx="8" ry="2" fill="rgba(0,212,255,0.5)" />
                                  <ellipse cx="60" cy="5" rx="8" ry="2" fill="rgba(0,212,255,0.5)" />
                                </svg>
                              </div>
                            </div>
                            <span style={{ fontSize: '0.75rem', marginTop: '10px', fontFamily: 'monospace' }}>Tilt: {Math.round(droneAngle)}°</span>
                          </div>

                          {/* Response graph / Message */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div style={{ height: '110px', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                              <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
                                <line x1="0" y1="30" x2="100" y2="30" stroke="#00e5ff" strokeWidth="0.5" strokeDasharray="3 3" />
                                {points.length > 1 && (
                                  <path 
                                    d={`M ${points.map(p => `${p.x},${50 - (p.y * 0.5)}`).join(' L ')}`}
                                    fill="none" 
                                    stroke="var(--color-accent-primary)" 
                                    strokeWidth="1" 
                                  />
                                )}
                              </svg>
                              <div style={{ position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-100%)', fontSize: '0.6rem', color: '#00e5ff' }}>Target Setpoint (40°)</div>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: simStatus === 'success' ? '#10b981' : simStatus === 'warning' || simStatus === 'danger' ? '#ef4444' : 'var(--color-text-secondary)', padding: '6px 0 0 0' }}>
                              {simMessage}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Player footer control bar */}
              <div className={styles.playerFooter}>
                <div className={styles.progressTrack}>
                  <div 
                    className={styles.progressBar} 
                    style={{ width: `${((slideIndex + 1) / currentDeck.slides.length) * 100}%` }}
                  />
                </div>

                <div className={styles.footerControls}>
                  <button 
                    className={`${styles.controlBtn} ${styles.controlBtnSec}`}
                    onClick={handlePrev}
                    disabled={slideIndex === 0}
                  >
                    <ArrowLeft size={16} /> Prev
                  </button>
                  <button 
                    className={styles.controlBtn}
                    onClick={handleNext}
                    disabled={slideIndex === currentDeck.slides.length - 1}
                  >
                    Next <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
