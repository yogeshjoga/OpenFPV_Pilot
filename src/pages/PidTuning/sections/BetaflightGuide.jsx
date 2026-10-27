import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ListChecks, Pause, Play, TriangleAlert } from 'lucide-react'
import { CHECKLIST, CLI_COMMANDS, FLASH_STEPS, OTHER_FIRMWARE } from '../data/betaflight.js'
import { Block, Section } from '../shared.jsx'
import ConfiguratorMock from './ConfiguratorMock.jsx'
import FlashMock from './FlashMock.jsx'
import styles from './Guide.module.css'

function FlashGuide() {
  const calm = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(true)
  const step = FLASH_STEPS[index]

  useEffect(() => {
    if (!playing || calm) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % FLASH_STEPS.length), 9000)
    return () => clearInterval(id)
  }, [playing, calm])

  return (
    <div className={styles.flashGuide}>
      <ol className={styles.steps}>
        {FLASH_STEPS.map((s, i) => (
          <li key={s.id}>
            <button type="button" aria-current={i === index ? 'step' : undefined} data-done={i < index} onClick={() => { setIndex(i); setPlaying(false) }}>
              <span className={styles.stepNum}>{i + 1}</span>
              <span>{s.title}</span>
            </button>
          </li>
        ))}
        <li>
          <button type="button" className={styles.playBtn} onClick={() => setPlaying((p) => !p)}>
            {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
            {playing ? 'Pause' : 'Play'}
          </button>
        </li>
      </ol>
      <AnimatePresence mode="wait">
        <motion.div key={step.id} className={styles.stepBody} initial={calm ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={calm ? { opacity: 0 } : { opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>
          <div className={styles.stepText}>
            <h4>Step {index + 1}: {step.title}</h4>
            <p className={styles.stepSummary}>{step.summary}</p>
            <ul>{step.points.map((p) => <li key={p}>{p}</li>)}</ul>
            <p className={styles.warn}><TriangleAlert size={16} aria-hidden="true" /><span>{step.warn}</span></p>
          </div>
          <FlashMock kind={step.id} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default function BetaflightGuide() {
  return (
    <Section
      id="betaflight"
      kicker="Part 4 · Betaflight"
      title="Betaflight Configurator: flash it and set it up"
      intro="Betaflight is the flight-control firmware on most FPV drones. Here is how to put it on a board, and what every tab in the Configurator is for. The drawings below are our own, not screenshots, and they move so you can see how each screen is used."
    >
      <Block title="How to flash it" intro="Six steps, in this order. Pick a step, or let the animation play.">
        <FlashGuide />
      </Block>

      <Block title="A tour of the Configurator" intro="Click a tab on the left, or let the tour play. Hover a numbered note to see which part of the screen it means.">
        <ConfiguratorMock />
      </Block>

      <div className={styles.two}>
        <Block title="The CLI, in nine commands" intro="The command line is the best way to back up and share a setup.">
          <dl className={styles.cmds}>
            {CLI_COMMANDS.map((c) => <div key={c.cmd}><dt><code>{c.cmd}</code></dt><dd>{c.text}</dd></div>)}
          </dl>
        </Block>
        <Block title="Before the first flight" intro="Check every one of these with the props OFF.">
          <ul className={styles.checklist}>
            {CHECKLIST.map((c) => <li key={c}><ListChecks size={16} aria-hidden="true" />{c}</li>)}
          </ul>
        </Block>
      </div>

      <Block title="Other firmware" intro="More are on the way. We will explain each in the same way.">
        <ul className={styles.other}>
          {OTHER_FIRMWARE.map((f) => (
            <li key={f.name}>
              <b>{f.name}</b>
              <span className={styles.soon}>Coming soon</span>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </Block>

      <p className={styles.legal}>Betaflight is open-source software made by its own community. We are not affiliated with it, and this page is an independent learning guide. Menu names can change a little between versions, so check the official documentation for your version.</p>
    </Section>
  )
}
