import { Chapter } from '../parts.jsx'
import styles from '../DroneHardware.module.css'

const STORY = [
  {
    title: 'A Wii remote started FPV drones',
    colour: 'var(--color-accent-primary)',
    text: 'The Wii MotionPlus add-on had a tiny, cheap gyro. Hobbyists wired it to a small board and wrote open flight software for it, called MultiWii. Once a gyro cost a few dollars, a drone that could hold itself level was something anyone could build.',
  },
  {
    title: 'How freestyle was born',
    colour: 'var(--color-success)',
    text: 'Racing was about the fastest lap. Freestyle was about flying a drone like an acrobat: flips, power loops and dives around buildings. It began with a few people experimenting on weekends, and teams such as Rotor Riot showed it to a much wider audience.',
  },
  {
    title: 'Open software, closed hardware',
    colour: 'var(--color-warning)',
    text: 'Flight software such as Betaflight is open: anyone can read it, change it and share the change. The circuit boards it runs on mostly are not. There is hardly any open reference design you can read, repair and improve the same way.',
  },
  {
    title: 'ESC firmware: open or switched off',
    colour: 'var(--color-error)',
    text: 'The ESC runs its own firmware (chapter 3). KISS was closed: you could fly it but not fork it. BLHeli_32 was widely used, and when the company behind it shut down in 2024, owners were left with firmware nobody could take forward. AM32 is the open-source answer: anyone can read it, fix it and move it to new chips.',
  },
  {
    title: 'Hobbyists built a radio that beat everyone',
    colour: 'var(--color-accent-primary)',
    text: 'ExpressLRS began as an open project by hobbyists. Using the LoRa chirp idea from chapter 4, it gave fast, long-range control links, and because it is open, many makers could build compatible parts. It showed that a community can out-engineer a closed product.',
  },
  {
    title: 'How hobby drones became military hardware',
    colour: 'var(--color-text-secondary)',
    text: 'The parts developed for racing and freestyle are small, cheap, fast and well supported by open software. Those same strengths made them attractive for military use. It is a reminder that open hobby technology does not stay inside the hobby.',
  },
  {
    title: "Your drone isn't just yours any more",
    colour: 'var(--color-warning)',
    text: 'In many countries a drone now has to announce who it is and where it is, a rule called Remote ID. It helps aviation authorities see what is in the sky, but it changes what building and flying your own drone means. Check the rules where you fly.',
  },
]

export default function Story() {
  return (
    <>
      <Chapter
        id="story"
        kicker="Chapter 5 · The story and the rules"
        title="How the hobby got here, and who owns the parts"
        lead="Hardware does not come from nowhere. A few cheap parts, some open software and a lot of curious people built FPV. The same history explains why open hardware, firmware and radio matter."
      >
        <div className={styles.cards}>
          {STORY.map((s) => (
            <article key={s.title} className={styles.card} style={{ '--c': s.colour }}>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </article>
          ))}
        </div>
      </Chapter>
    </>
  )
}
