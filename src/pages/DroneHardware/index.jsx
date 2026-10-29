import PageWrapper from '@components/layout/PageWrapper'
import useDocumentMeta from '@lib/useDocumentMeta'
import Frame from './chapters/Frame.jsx'
import Vibration from './chapters/Vibration.jsx'
import Power from './chapters/Power.jsx'
import Radio from './chapters/Radio.jsx'
import Story from './chapters/Story.jsx'
import styles from './DroneHardware.module.css'

const CHAPTERS = [
  { id: 'frame', label: '1 · Frame' },
  { id: 'vibration', label: '2 · Vibration' },
  { id: 'power', label: '3 · Motors and power' },
  { id: 'radio', label: '4 · Radio' },
  { id: 'story', label: '5 · The story' },
  { id: 'sources', label: 'The Shorts' },
]

export default function DroneHardware() {
  useDocumentMeta('Drone Hardware from Scratch | EGIRE Robotics', 'Animated lessons on how drone hardware works: carbon fibre frames, vibration and resonance, motors, ESCs and power, and radio from 2.4 GHz to LoRa chirps, built around the topics of the OpenDrone YouTube Shorts.')
  return (
    <PageWrapper>
      <header className={styles.hero}>
        <div className="container">
          <p className={styles.eyebrow}>Drone hardware, from scratch</p>
          <h1 className={styles.title}>How a drone's hardware really works</h1>
          <p className={styles.subtitle}>Why frames are carbon, why drones shake, why 6S cooks 4S motors, and how a radio hears a signal quieter than the noise. Every idea is an animation you can move with a slider.</p>
          <p className={styles.credit}>
            The topics follow the YouTube Shorts of <a href="https://www.youtube.com/@opendrone/shorts" target="_blank" rel="noopener noreferrer">OpenDrone</a>, an open-source FPV hardware project. The explanations and animations are written by us from standard physics. See the last chapter for what we could and could not read of their videos.
          </p>
        </div>
      </header>
      <nav className={styles.subnav} aria-label="Chapters">
        <div className={`container ${styles.subnavInner}`}>
          {CHAPTERS.map((c) => <a key={c.id} className={styles.subnavLink} href={`#${c.id}`}>{c.label}</a>)}
        </div>
      </nav>
      <div>
        <Frame />
        <Vibration />
        <Power />
        <Radio />
        <Story />
      </div>
    </PageWrapper>
  )
}
