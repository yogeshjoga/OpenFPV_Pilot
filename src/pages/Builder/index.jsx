// ================================
// Component — Builder
// ================================

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '@components/layout/PageWrapper'
import styles from './Builder.module.css'
import { getQuoteDetails, getThrustEstimate } from '../../lib/quoteLogic'
import { exportQuoteToPDF } from '../../lib/pdfGenerator'
import database from '../../data/fpvDatabase.json'

const VIDEO_SYSTEMS = {
  Analog: {
    vtxBrands: ['Eachine', 'TBS', 'Rush', 'SpeedyBee', 'Caddx', 'RunCam'],
    vtxModels: {
      'Eachine': ['TX805'],
      'TBS': ['Unify Pro32 HV'],
      'Rush': ['Tank Ultimate Plus'],
      'SpeedyBee': ['VTX'],
      'Caddx': ['VTX'],
      'RunCam': ['TX200U']
    },
    goggleBrands: ['FatShark', 'Eachine', 'Skyzone', 'BetaFPV', 'Orqa'],
    goggleModels: {
      'FatShark': ['Dominator (HD)', 'HDO+ (HDO Plus)', 'ECHO', 'Recon HD'],
      'Eachine': ['EV800D', 'EV100', 'EV300D'],
      'Skyzone': ['SKY04X Pro', 'SKY04O Pro', 'Cobra X', 'Cobra SD'],
      'BetaFPV': ['VR02', 'VR03'],
      'Orqa': ['FPV.ONE Pilot']
    }
  },
  Digital: {
    vtxBrands: ['DJI', 'Walksnail', 'HDZero'],
    vtxModels: {
      'DJI': ['DJI Air Unit', 'DJI O3 Air Unit', 'Caddx Vista', 'Caddx Vista Polar'],
      'Walksnail': ['Avatar HD VTX V1', 'Avatar HD VTX V2'],
      'HDZero': ['HDZero VTX V1', 'HDZero Freestyle V2']
    },
    goggleBrands: {
      'DJI': ['DJI'],
      'Walksnail': ['Walksnail'],
      'HDZero': ['HDZero']
    },
    goggleModels: {
      'DJI': ['DJI FPV Goggles V2', 'DJI Goggles 2', 'DJI Goggles 3', 'DJI Goggles Integra'],
      'Walksnail': ['Avatar HD Goggles', 'Avatar HD Goggles X', 'Avatar HD Goggles L'],
      'HDZero': ['HDZero Goggle V2', 'HDZero Goggle']
    }
  }
}

const PRESETS = {
  cinewhoop: {
    frameBrand: 'SpeedyBee',
    frameModel: 'Bee25 Wireless Tuning',
    frameSize: '2.5 inch',
    videoSystemType: 'Digital',
    vtxBrand: 'Walksnail',
    vtxModel: 'Avatar HD VTX V2',
    goggleBrand: 'Walksnail',
    goggleModel: 'Avatar HD Goggles X',
    motorBrand: 'EMAX',
    motorSpeed: '14000KV',
    propSize: '2.5 inch',
    propMaterial: 'Polycarbonate',
    stackSize: '16x16mm (Whoop)',
    batteryCell: '4S',
    radioProtocol: 'ExpressLRS (ELRS) 2.4GHz',
    rangeBooster: 'None'
  },
  freestyle: {
    frameBrand: 'iFlight',
    frameModel: 'Nazgul Evoque F5 V3',
    frameSize: '5 inch',
    videoSystemType: 'Digital',
    vtxBrand: 'DJI',
    vtxModel: 'DJI O3 Air Unit',
    goggleBrand: 'DJI',
    goggleModel: 'DJI Goggles 2',
    motorBrand: 'XING',
    motorSpeed: '1800KV',
    propSize: '5.1 inch',
    propMaterial: 'Polycarbonate',
    stackSize: '30.5x30.5mm',
    batteryCell: '6S',
    radioProtocol: 'ExpressLRS (ELRS) 900MHz',
    rangeBooster: '1W Micro TX Module'
  }
}

const DEFAULT_CONFIG = {
  preset: null,
  frameBrand: 'SpeedyBee',
  frameModel: 'Master 5 V2',
  frameSize: '5 inch',
  videoSystemType: 'Analog',
  vtxBrand: 'TBS',
  vtxModel: 'Unify Pro32 HV',
  goggleBrand: 'FatShark',
  goggleModel: 'HDO+ (HDO Plus)',
  motorBrand: 'XING',
  motorSpeed: '1800KV',
  propSize: '5.1 inch',
  propMaterial: 'Polycarbonate',
  stackSize: '30.5x30.5mm',
  batteryCell: '6S',
  radioProtocol: 'ExpressLRS (ELRS) 2.4GHz',
  rangeBooster: 'None'
}

export default function Builder() {
  const [activeStep, setActiveStep] = useState(0)

  // Builder State
  const [config, setConfig] = useState(DEFAULT_CONFIG)

  const handleSelect = (key, val) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: val }

      let selectedModel = next.frameModel;

      if (key === 'frameBrand') {
        const firstModel = database.find(item => item.Brand === val)
        selectedModel = firstModel ? firstModel.Model : next.frameModel
        next.frameModel = selectedModel
      }

      if (key === 'frameBrand' || key === 'frameModel') {
        const frameData = database.find(item => item.Model === selectedModel)
        if (frameData) {
          let cleanSize = (frameData.Size || '5"').replace('"', ' inch')
          if (cleanSize.includes('-')) cleanSize = cleanSize.split('-')[0] + ' inch'
          next.frameSize = cleanSize
          next.propSize = cleanSize

          if (cleanSize.includes('1.6') || cleanSize.includes('2 ') || cleanSize.includes('2.5')) {
            next.stackSize = '16x16mm (Whoop)'
            next.batteryCell = '2S'
            next.motorSpeed = '14000KV'
          } else if (cleanSize.includes('3 ') || cleanSize.includes('3.5')) {
            next.stackSize = '20x20mm'
            next.batteryCell = '4S'
            next.motorSpeed = '4000KV'
          } else if (cleanSize.includes('5 ') || cleanSize.includes('5.1')) {
            next.stackSize = '30.5x30.5mm'
            next.batteryCell = '6S'
            next.motorSpeed = '1800KV'
          } else if (cleanSize.includes('7 ') || cleanSize.includes('9 ') || cleanSize.includes('10 ') || cleanSize.includes('15 ')) {
            next.stackSize = '30.5x30.5mm'
            next.batteryCell = '6S'
            next.motorSpeed = '1300KV'
          }
        }
      }

      if (key === 'videoSystemType') {
        if (val === 'Analog') {
          next.vtxBrand = 'TBS'
          next.vtxModel = 'Unify Pro32 HV'
          next.goggleBrand = 'FatShark'
          next.goggleModel = 'HDO+ (HDO Plus)'
        } else {
          next.vtxBrand = 'DJI'
          next.vtxModel = 'DJI O3 Air Unit'
          next.goggleBrand = 'DJI'
          next.goggleModel = 'DJI Goggles 2'
        }
      }

      if (key === 'vtxBrand') {
        const sys = VIDEO_SYSTEMS[next.videoSystemType]
        next.vtxModel = sys.vtxModels[val][0]
        if (next.videoSystemType === 'Digital') {
          // Force goggle ecosystem binding
          next.goggleBrand = sys.goggleBrands[val][0]
          next.goggleModel = sys.goggleModels[sys.goggleBrands[val][0]][0]
        }
      }

      if (key === 'goggleBrand') {
        const sys = VIDEO_SYSTEMS[next.videoSystemType]
        next.goggleModel = sys.goggleModels[val][0]
      }

      return next
    })
  }

  const sys = VIDEO_SYSTEMS[config.videoSystemType]

  // Dynamic Options Definitions
  const OPTIONS = {
    frameBrand: [...new Set(database.map(item => item.Brand))],
    frameModel: database.filter(item => item.Brand === config.frameBrand).map(item => item.Model),
    
    videoSystemType: ['Analog', 'Digital'],
    vtxBrand: sys.vtxBrands,
    vtxModel: sys.vtxModels[config.vtxBrand] || [],
    goggleBrand: config.videoSystemType === 'Analog' ? sys.goggleBrands : sys.goggleBrands[config.vtxBrand] || [],
    goggleModel: sys.goggleModels[config.goggleBrand] || [],

    motorBrand: ['XING', 'T-Motor', 'RCINPOWER', 'EMAX', 'BrotherHobby'],
    motorSpeed: ['1300KV', '1500KV', '1800KV', '1960KV', '2400KV', '2750KV', '4000KV', '14000KV'],
    propSize: ['1.6 inch', '2 inch', '2.5 inch', '3 inch', '3.5 inch', '5 inch', '5.1 inch', '7 inch', '10 inch'],
    propMaterial: ['Polycarbonate', 'Carbon Composite', 'Glass Fiber Nylon'],
    stackSize: ['16x16mm (Whoop)', '20x20mm', '25.5x25.5mm (AIO)', '30.5x30.5mm'],
    batteryCell: ['1S', '2S', '3S', '4S', '6S', '8S'],
    radioProtocol: ['ExpressLRS (ELRS) 2.4GHz', 'ExpressLRS (ELRS) 900MHz', 'TBS Crossfire', 'TBS Tracer', 'FrSky'],
    rangeBooster: ['None', '1W Micro TX Module', '2W Full Size TX Module'],
    goggles: ['Analog Diversity', 'DJI Goggles 2 / Integra', 'Walksnail Avatar Goggles X', 'HDZero Goggles'],
  }

  const steps = [
    { title: 'Frame Base', fields: ['frameBrand', 'frameModel'] },
    { title: 'Motors & Props', fields: ['motorBrand', 'motorSpeed', 'propSize', 'propMaterial'] },
    { title: 'Video System (VTX)', fields: ['videoSystemType', 'vtxBrand', 'vtxModel'] },
    { title: 'Video System (Goggles)', fields: ['goggleBrand', 'goggleModel'] },
    { title: 'Electronics', fields: ['stackSize', 'batteryCell'] },
    { title: 'Control Link', fields: ['radioProtocol', 'rangeBooster'] },
  ]

  const quoteDetails = getQuoteDetails(config)
  const thrustEstimate = getThrustEstimate(config.frameSize)

  const [isExporting, setIsExporting] = useState(false)

  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      exportQuoteToPDF(config, quoteDetails, thrustEstimate)
    } catch (err) {
      console.error('PDF Export failed', err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <PageWrapper fullHeight>
      <div className={styles.layout}>
        {/* LEFT: Configurator Controls */}
        <div className={styles.configurator}>
          <header className={styles.header}>
            <p className={styles.eyebrow}>// Setup Wizard</p>
            <h1 className={styles.title}>FPV Quote <span className="gradient-text">Builder</span></h1>
            <p className={styles.sub}>Design your custom drone from scratch and export a complete parts list.</p>
          </header>

          {/* PRESETS SECTION */}
          <div className={styles.presetSection}>
            <p className={styles.presetTitle}>Quick Start Presets:</p>
            <div className={styles.presetGrid}>
              <button
                className={styles.presetBtn}
                onClick={() => setConfig({ ...PRESETS.cinewhoop, preset: 'cinewhoop' })}
              >
                🚁 Beginner Cinewhoop (Indoor/Park)
              </button>
              <button
                className={styles.presetBtn}
                onClick={() => setConfig({ ...PRESETS.freestyle, preset: 'freestyle' })}
              >
                ⚡ 5" Bando Freestyle (Aggressive)
              </button>
            </div>
          </div>

          <div className={styles.progressTracker}>
            {steps.map((s, i) => (
              <button
                key={i}
                className={`${styles.stepDot} ${activeStep === i ? styles.activeDot : ''}`}
                onClick={() => setActiveStep(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className={styles.stepContent}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className={styles.stepTitle}>{steps[activeStep].title}</h2>
                {/* Temporary placeholder for options */}
                <div className={styles.optionsGrid}>
                  {steps[activeStep].fields.map((field) => (
                    <div key={field} className={styles.fieldGroup}>
                      <label className={styles.fieldLabel}>{field}</label>
                      <select
                        className={styles.fieldSelect}
                        value={config[field]}
                        onChange={(e) => handleSelect(field, e.target.value)}
                      >
                        <option value={config[field]}>{config[field]}</option>
                        {OPTIONS[field]?.filter(opt => opt !== config[field]).map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className={styles.navButtons}>
            <button
              className={styles.ghostBtn}
              disabled={activeStep === 0}
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
            >
              ← Back
            </button>
            {activeStep === steps.length - 1 ? (
              <button
                className={styles.primaryBtn}
                onClick={handleExportPDF}
                disabled={isExporting}
                style={{ background: 'var(--gradient-accent)', border: 'none' }}
              >
                {isExporting ? 'Generating PDF...' : '⬇ Download PDF'}
              </button>
            ) : (
              <button
                className={styles.primaryBtn}
                onClick={() => setActiveStep((prev) => Math.min(steps.length - 1, prev + 1))}
              >
                Next Step →
              </button>
            )}
          </div>
        </div>

        {/* RIGHT: Live Invoice / PDF Preview */}
        <aside className={styles.invoicePanel}>
          <div className={styles.invoiceInner}>
            <h3 className={styles.invoiceTitle}>Build Specification</h3>

            <ul className={styles.invoiceList}>
              {quoteDetails.items.map((item) => (
                <li key={item.id} className={styles.invoiceRow}>
                  <span className={styles.invoiceKey}>{item.type}</span>
                  <span className={styles.invoiceVal}>{item.name}</span>
                </li>
              ))}
            </ul>

            <div className={styles.performanceBox}>
              <p className={styles.perfLabel}>Est. Thrust Output</p>
              <p className={styles.perfVal}>{thrustEstimate}</p>
            </div>

            <div className={styles.invoiceTotal}>
              <p>Est. Total Cost</p>
              <div style={{ textAlign: 'right' }}>
                <p className="gradient-text">${quoteDetails.grandTotal.toFixed(2)}</p>
                <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontFamily: 'var(--font-mono)' }}>
                  ≈ ₹{Math.round(quoteDetails.grandTotalINR).toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <button
              className={styles.exportBtn}
              onClick={handleExportPDF}
              disabled={isExporting}
            >
              {isExporting ? 'Generating PDF...' : '⬇ Download PDF'}
            </button>
            <button
              className={styles.ghostBtn}
              onClick={() => {
                setConfig(DEFAULT_CONFIG)
                setActiveStep(0)
              }}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem', fontSize: '0.85rem' }}
            >
              ⟲ Reset Builder
            </button>
          </div>
        </aside>
      </div>
    </PageWrapper>
  )
}
