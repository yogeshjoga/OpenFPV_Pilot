import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Sliders, Play, RotateCcw, 
  Cpu, Compass, Activity, ShieldAlert, CheckCircle2 
} from 'lucide-react'
import PageWrapper from '@components/layout/PageWrapper'
import styles from './PidTuning.module.css'

// Preset configurations for educational demonstration
const PRESETS = {
  sluggish: { p: 18, i: 10, d: 8, label: 'Sluggish (Low P)', desc: 'The drone takes too long to correct its orientation. Feels mushy.' },
  oscillating: { p: 95, i: 45, d: 5, label: 'Violent Oscillation (High P, Low D)', desc: 'Over-corrects instantly and oscillates rapidly out of control.' },
  drifting: { p: 35, i: 2, d: 22, label: 'Slow Drift (Very Low I)', desc: 'Reaches the angle, but wind or gravity causes it to drift off target.' },
  propwash: { p: 48, i: 55, d: 15, label: 'Propwash Wobble (Low D)', desc: 'Reaches target quickly but suffers from messy oscillations when stopping.' },
  lockedIn: { p: 52, i: 60, d: 35, label: 'Optimal Tune (Locked In)', desc: 'Reaches target swiftly, dampens overshoot immediately, holds angle perfectly.' }
}

// Wizard Steps for Betaflight configuration
const WIZARD_STEPS = [
  {
    id: 'fc',
    icon: Compass,
    title: 'FC Orientation',
    desc: 'Align and Calibrate Flight Controller',
    content: (
      <div className={styles.wizardContentBlock}>
        <h3>1. Board Alignment & Calibration</h3>
        <p>Before flying, you must align the virtual axes of the gyroscopes with your physical drone frame. Mounting orientation matters!</p>
        <div className={styles.guidelineCard}>
          <ul>
            <li><strong>Mount Arrow:</strong> The flight controller has a printed arrow. Secure it pointing forward towards the front motors.</li>
            <li><strong>Yaw Adjustment:</strong> If your USB port forces you to mount the board sideways, go to Betaflight <strong>Configuration Tab</strong> &rarr; <strong>Board and Sensor Alignment</strong>, and set Yaw offset (e.g., <code>90</code> or <code>270</code> degrees).</li>
            <li><strong>Accelerometer Calibration:</strong> Place the drone on a perfectly flat surface, go to the <strong>Setup Tab</strong>, and click <strong>Calibrate Accelerometer</strong>. Verify that the 3D drone preview matches the real movements.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'motors',
    icon: Cpu,
    title: 'Motor & ESC',
    desc: 'DShot Protocols & Directions',
    content: (
      <div className={styles.wizardContentBlock}>
        <h3>2. Motor Mapping & ESC Configuration</h3>
        <p>Correct ESC protocol and motor direction are critical for flight stabilization. Incorrect mapping causes instant flips on arming.</p>
        <div className={styles.guidelineCard}>
          <ul>
            <li><strong>ESC Protocol:</strong> Use <strong>DSHOT600</strong> or <strong>DSHOT300</strong> for digital ESC telemetry synchronization.</li>
            <li><strong>Bi-directional DShot:</strong> Enable this toggle in the <strong>Motors Tab</strong>. It syncs the ESC telemetry to allow RPM filtering (highly recommended to damp resonance frequencies). Specify the number of motor poles (usually <code>12</code> or <code>14</code>).</li>
            <li><strong>Motor Direction:</strong> FPV builds can run <em>Props Inwards</em> (default) or <em>Props Outwards</em> (cleaner lens/less drag). Toggle the motor direction switches in Betaflight to align with your props.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'receiver',
    icon: Activity,
    title: 'Receiver Setup',
    desc: 'Binds, Protocols, & Mapping',
    content: (
      <div className={styles.wizardContentBlock}>
        <h3>3. Receiver Link & Signal Processing</h3>
        <p>Configuring control inputs from your remote transmitter. Low-latency protocols like ExpressLRS are the current standard.</p>
        <div className={styles.guidelineCard}>
          <ul>
            <li><strong>Protocol Selection:</strong> Go to the <strong>Receiver Tab</strong>, select <strong>Serial-based receiver</strong> (UART), and choose <strong>CRSF</strong> for ExpressLRS/Crossfire receivers.</li>
            <li><strong>Channel Mapping:</strong> Most radios use <strong>AETR1234</strong> (Aileron, Elevator, Throttle, Rudder, AUX channels). Verify in the receiver tab that sliders move according to your sticks.</li>
            <li><strong>Stick Endpoints:</strong> Ensure endpoints scale exactly from <code>1000</code> (lowest) to <code>2000</code> (highest), with stick centers resting precisely at <code>1500</code>. Modify your radio settings (sub-trim/travel) to achieve this.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'modes',
    icon: Sparkles,
    title: 'Modes Mapping',
    desc: 'Switches for Arm, Angle, & Beeper',
    content: (
      <div className={styles.wizardContentBlock}>
        <h3>4. Arming Modes & AUX Configuration</h3>
        <p>Assign physical switches on your transmitter to trigger specific safety and flight control routines inside Betaflight.</p>
        <div className={styles.guidelineCard}>
          <ul>
            <li><strong>ARM Mode:</strong> Assign a two-position switch (preferably on AUX 1) to Arm the quad. Ensure it sits in active yellow range when toggled.</li>
            <li><strong>Flight Modes:</strong> Assign AUX 2 to switch between flight controllers: <strong>Angle Mode</strong> (stabilized level limits, good for beginners) and default <strong>Acro Mode</strong> (pure gyroscopic rates, professional).</li>
            <li><strong>Turtle Mode (Flip Over After Crash):</strong> Assign to an AUX channel to spin motors backwards. Allows you to flip a crashed, upside-down drone back onto its landing gear remotely.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 'pid',
    icon: Sliders,
    title: 'Betaflight PID Tab',
    desc: 'Rate Profiles & Slider Tuning',
    content: (
      <div className={styles.wizardContentBlock}>
        <h3>5. Tuning Sliders & Feedforward</h3>
        <p>Betaflight offers intuitive master sliders to adjust PID gains simultaneously while maintaining proper coefficient ratios.</p>
        <div className={styles.guidelineCard}>
          <ul>
            <li><strong>Dampening Slider (D):</strong> If you get motor oscillations after snapping back to center stick, slide Dampening (D) rightwards slightly.</li>
            <li><strong>Tracking Slider (P & I):</strong> If stick response feels slow or mushy, push Tracking (P) sliders to the right.</li>
            <li><strong>Dynamic Idle:</strong> Enable this in the PID profile tab to set a minimum RPM floor, preventing motor stalls during zero-throttle dives.</li>
          </ul>
        </div>
      </div>
    )
  }
]

export default function PidTuning() {
  const [p, setP] = useState(52)
  const [i, setI] = useState(60)
  const [d, setD] = useState(35)
  const [activeStep, setActiveStep] = useState('fc')
  
  // Simulation states
  const [isRunning, setIsRunning] = useState(false)
  const [points, setPoints] = useState([])
  const [droneAngle, setDroneAngle] = useState(0)
  const [simMessage, setSimMessage] = useState('Click "Run Simulation" to test parameters.')
  const [simStatus, setSimStatus] = useState('idle') // idle, success, warning, danger
  
  const simInterval = useRef(null)

  // Load a preset configuration
  const applyPreset = (key) => {
    const preset = PRESETS[key]
    if (preset) {
      setP(preset.p)
      setI(preset.i)
      setD(preset.d)
      stopSimulation()
    }
  }

  // Stop any active interval loop
  const stopSimulation = () => {
    if (simInterval.current) {
      clearInterval(simInterval.current)
      simInterval.current = null
    }
    setIsRunning(false)
    setDroneAngle(0)
    setPoints([])
  }

  // Run the physics step-response simulation
  const runSimulation = () => {
    stopSimulation()
    setIsRunning(true)
    
    // Target step response: drone starts at 0 degrees and wants to align to 40 degrees
    const target = 40
    let current = 0
    let lastError = target - current
    let integral = 0
    
    const maxSteps = 100
    let step = 0
    const newPoints = []

    // Map user values to mock PID coefficients
    const kp = p * 0.04
    const ki = i * 0.002
    const kd = d * 0.2
    
    // We run an interval loop to animate the drone and graph response curves
    simInterval.current = setInterval(() => {
      const error = target - current
      integral += error
      
      // Cap integral windup
      if (integral > 200) integral = 200
      if (integral < -200) integral = -200
      
      const derivative = error - lastError
      
      // Calculate control PID output force
      const output = (kp * error) + (ki * integral) + (kd * derivative)
      
      // Drone physics loop (simple rotational inertia model)
      current += output * 0.15
      lastError = error
      
      // Clamp values to prevent infinity crashes
      if (isNaN(current) || Math.abs(current) > 200) {
        current = current > 0 ? 200 : -200
      }

      newPoints.push({ x: step, y: current })
      setPoints([...newPoints])
      setDroneAngle(current)
      
      step++
      if (step >= maxSteps) {
        clearInterval(simInterval.current)
        setIsRunning(false)
        evaluateTune(kp, ki, kd, newPoints, target)
      }
    }, 30)
  }

  // Analyze response curve to evaluate tuning safety/quality
  const evaluateTune = (kp, ki, kd, points, target) => {
    // Check for extreme overshoot/oscillation
    let maxVal = 0
    let oscillates = false
    let crossesTarget = 0
    
    for (let index = 1; index < points.length; index++) {
      const val = points[index].y
      if (val > maxVal) maxVal = val
      
      // Count target line crossings (sign changes) to check for oscillation shivers
      const prevVal = points[index-1].y
      if ((prevVal < target && val >= target) || (prevVal > target && val <= target)) {
        crossesTarget++
      }
    }
    
    const overshootPercent = ((maxVal - target) / target) * 100
    const finalVal = points[points.length - 1].y
    const errorFromTarget = Math.abs(target - finalVal)

    if (maxVal > 80 || crossesTarget > 6) {
      setSimStatus('danger')
      setSimMessage('DANGER: Violent oscillations! Your PID gains are too high, or D-term is too low. High risk of burning motors in real flight.')
    } else if (errorFromTarget > 8) {
      setSimStatus('warning')
      setSimMessage('WARNING: Mushy response / steady-state drift. P-gain is too low to fight gravity, or Integral (I) gain needs boosting.')
    } else if (overshootPercent > 25 && crossesTarget > 3) {
      setSimStatus('warning')
      setSimMessage('CAUTION: Slow propwash shivers detected. Drone overshoots and wobbles before settling. Increase D-gain or reduce P.')
    } else {
      setSimStatus('success')
      setSimMessage('EXCELLENT: Responsive locked-in tune. Drone snaps to the setpoint rapidly with minimal overshoot and zero oscillation.')
    }
  }

  useEffect(() => {
    return () => stopSimulation()
  }, [])

  return (
    <PageWrapper hideFooter={true}>
      <div className={styles.container}>
        <div className={styles.ambientGlow1} />
        <div className={styles.ambientGlow2} />

        <div className={`container ${styles.layoutGrid}`}>
          
          {/* LEFT COLUMN: Educational Explainer & Interactive Simulator */}
          <div className={styles.leftCol}>
            
            {/* Header branding */}
            <div className={styles.headerBlock}>
              <div className={styles.badge}>ACADEMY LAB</div>
              <h1 className={styles.pageTitle}>
                Betaflight <span className="gradient-text">PID Tuning</span>
              </h1>
              <p className={styles.introText}>
                PID loops stabilize your FPV quadcopter. By checking gyroscopic angular rates thousands of times per second, the flight controller adjusts motor spin speeds dynamically. Learn how <strong>P</strong>, <strong>I</strong>, and <strong>D</strong> coefficients alter flight physics.
              </p>
            </div>

            {/* Presets & Simulator panel */}
            <div className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <Sliders size={20} className={styles.headerIcon} />
                <h2>1. Interactive PID Sandbox</h2>
              </div>
              <p className={styles.cardDesc}>
                Adjust the sliders or load a preset, then run the simulation. Watch how the drone responds to a <strong>40° Step Command</strong>.
              </p>

              {/* Presets List */}
              <div className={styles.presetsGroup}>
                {Object.keys(PRESETS).map((key) => (
                  <button 
                    key={key}
                    type="button"
                    className={styles.presetBtn}
                    onClick={() => applyPreset(key)}
                  >
                    {PRESETS[key].label}
                  </button>
                ))}
              </div>

              {/* Sliders */}
              <div className={styles.slidersWrapper}>
                <div className={styles.sliderRow}>
                  <div className={styles.sliderInfo}>
                    <span className={`${styles.sliderLabel} ${styles.colorP}`}>P (Proportional)</span>
                    <span className={styles.sliderVal}>{p}</span>
                  </div>
                  <input 
                    type="range" min="1" max="100" value={p}
                    onChange={(e) => { setP(Number(e.target.value)); stopSimulation(); }}
                    className={`${styles.rangeInput} ${styles.rangeP}`}
                  />
                  <span className={styles.metricExplanation}>Reacts to current error. Higher = stiffer, faster snap response; Too high = oscillations.</span>
                </div>

                <div className={styles.sliderRow}>
                  <div className={styles.sliderInfo}>
                    <span className={`${styles.sliderLabel} ${styles.colorI}`}>I (Integral)</span>
                    <span className={styles.sliderVal}>{i}</span>
                  </div>
                  <input 
                    type="range" min="1" max="100" value={i}
                    onChange={(e) => { setI(Number(e.target.value)); stopSimulation(); }}
                    className={`${styles.rangeInput} ${styles.rangeI}`}
                  />
                  <span className={styles.metricExplanation}>Corrects accumulated error over time. Holds attitude against wind, payload, or momentum.</span>
                </div>

                <div className={styles.sliderRow}>
                  <div className={styles.sliderInfo}>
                    <span className={`${styles.sliderLabel} ${styles.colorD}`}>D (Derivative)</span>
                    <span className={styles.sliderVal}>{d}</span>
                  </div>
                  <input 
                    type="range" min="1" max="100" value={d}
                    onChange={(e) => { setD(Number(e.target.value)); stopSimulation(); }}
                    className={`${styles.rangeInput} ${styles.rangeD}`}
                  />
                  <span className={styles.metricExplanation}>Predicts future error (dampens overshoot). Prevents wobble when stopping; Too high = hot motors.</span>
                </div>
              </div>

              {/* Controls */}
              <div className={styles.simulationControls}>
                {!isRunning ? (
                  <button onClick={runSimulation} className={styles.runBtn}>
                    <Play size={16} />
                    <span>Run Simulation</span>
                  </button>
                ) : (
                  <button onClick={stopSimulation} className={styles.stopBtn}>
                    <RotateCcw size={16} />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Chart & Physics Animation */}
            <div className={styles.panelCard}>
              <div className={styles.visualGrid}>
                {/* 2D Drone stabilizer visualizer */}
                <div className={styles.droneBox}>
                  <span className={styles.visualTitle}>2D Quadcopter Attitude</span>
                  <div className={styles.physicsWindow}>
                    <div className={styles.targetHorizonLine} />
                    {/* The Drone SVG rotated by current simulation angle */}
                    <div 
                      className={styles.simDrone}
                      style={{ transform: `rotate(${droneAngle}deg)` }}
                    >
                      <svg width="120" height="40" viewBox="0 0 120 40">
                        <line x1="20" y1="20" x2="100" y2="20" stroke="var(--color-text-secondary)" strokeWidth="4" />
                        <rect x="50" y="10" width="20" height="20" rx="4" fill="var(--color-accent-primary)" />
                        {/* Propellers */}
                        <ellipse cx="20" cy="10" rx="15" ry="3" fill="rgba(0, 212, 255, 0.4)" stroke="var(--color-accent-primary)" strokeWidth="1" />
                        <ellipse cx="100" cy="10" rx="15" ry="3" fill="rgba(0, 212, 255, 0.4)" stroke="var(--color-accent-primary)" strokeWidth="1" />
                        {/* Motor Mounts */}
                        <rect x="15" y="15" width="10" height="10" fill="#2e303a" />
                        <rect x="95" y="15" width="10" height="10" fill="#2e303a" />
                      </svg>
                    </div>
                  </div>
                  <span className={styles.droneAngleIndicator}>Current Tilt: {Math.round(droneAngle)}°</span>
                </div>

                {/* Response plot */}
                <div className={styles.chartBox}>
                  <span className={styles.visualTitle}>Step Response Waveform</span>
                  <div className={styles.chartWindow}>
                    <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#1f2937" strokeDasharray="2" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#1f2937" strokeDasharray="2" />
                      {/* Target line (40 degree command) */}
                      <line x1="0" y1="30" x2="100" y2="30" stroke="var(--color-success)" strokeWidth="1" strokeDasharray="4 2" />
                      
                      {/* Actual Response Curve */}
                      {points.length > 1 && (
                        <path 
                          d={`M ${points.map(p => `${p.x},${50 - (p.y * 0.5)}`).join(' L ')}`}
                          fill="none" 
                          stroke="var(--color-accent-primary)" 
                          strokeWidth="1.5" 
                        />
                      )}
                    </svg>
                    <div className={styles.chartTargetLabel}>Setpoint (40°)</div>
                    <div className={styles.chartZeroLabel}>Baseline (0°)</div>
                  </div>
                </div>
              </div>

              {/* Status banner */}
              <div className={`${styles.statusBanner} ${styles[simStatus]}`}>
                {simStatus === 'success' && <CheckCircle2 size={20} className={styles.statusIcon} />}
                {simStatus === 'warning' && <ShieldAlert size={20} className={styles.statusIcon} />}
                {simStatus === 'danger' && <ShieldAlert size={20} className={styles.statusIcon} />}
                <p>{simMessage}</p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Betaflight Setup wizard */}
          <div className={styles.rightCol}>
            <div className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <Cpu size={20} className={styles.headerIcon} />
                <h2>2. Betaflight Custom Build Wizard</h2>
              </div>
              <p className={styles.cardDesc}>
                Walk through the core setup parameters required to safely configure and arm a newly assembled FPV racing drone.
              </p>

              {/* Wizard Nav Steps */}
              <div className={styles.wizardNav}>
                {WIZARD_STEPS.map((step) => {
                  const IconComp = step.icon
                  return (
                    <button
                      key={step.id}
                      type="button"
                      className={`${styles.wizardNavBtn} ${activeStep === step.id ? styles.activeNavBtn : ''}`}
                      onClick={() => setActiveStep(step.id)}
                    >
                      <IconComp size={16} />
                      <span>{step.title}</span>
                    </button>
                  )
                })}
              </div>

              {/* Active Wizard Page */}
              <div className={styles.wizardDisplay}>
                {WIZARD_STEPS.find(s => s.id === activeStep)?.content}
              </div>
            </div>

            {/* Mock Betaflight PID Controller Tab */}
            <div className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <Sliders size={20} className={styles.headerIcon} />
                <h2>3. Betaflight PID Interface Mockup</h2>
              </div>
              <div className={styles.mockBfWindow}>
                <div className={styles.mockBfHeader}>
                  <div className={styles.bfDot} />
                  <span>Betaflight Configurator — PID Tuning Profile 1</span>
                </div>
                <div className={styles.bfTuningTable}>
                  <div className={styles.bfRowHeader}>
                    <span>Axis</span>
                    <span>Proportional (P)</span>
                    <span>Integral (I)</span>
                    <span>Derivative (D)</span>
                  </div>
                  
                  <div className={styles.bfRow}>
                    <span className={styles.bfAxisLabel}>ROLL</span>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value={Math.round(p * 0.9)} />
                    </div>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value={Math.round(i * 0.85)} />
                    </div>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value={Math.round(d * 0.95)} />
                    </div>
                  </div>

                  <div className={styles.bfRow}>
                    <span className={styles.bfAxisLabel}>PITCH</span>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value={Math.round(p)} />
                    </div>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value={Math.round(i)} />
                    </div>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value={Math.round(d)} />
                    </div>
                  </div>

                  <div className={styles.bfRow}>
                    <span className={styles.bfAxisLabel}>YAW</span>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value={Math.round(p * 1.15)} />
                    </div>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value={Math.round(i * 1.05)} />
                    </div>
                    <div className={styles.bfCell}>
                      <input type="text" readOnly value="0" className={styles.disabledVal} />
                    </div>
                  </div>
                </div>
                <div className={styles.mockBfFooter}>
                  <span>* Values in the table sync dynamically based on your sandbox sliders above.</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageWrapper>
  )
}
