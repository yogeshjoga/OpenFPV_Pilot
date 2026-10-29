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
    text: 'Flight software such as Betaflight is open: anyone can read it, change it and share the change. The circuit boards it runs on mostly are not. There is hardly any open reference design you can read, repair and improve the same way. That gap is what projects like OpenDrone are trying to close.',
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

const SOURCES = [
  {
    chapter: 'Chapter 1 · Frame',
    items: [
      'What rubber grommets are really for',
      'One carbon fibre is a tenth of a human hair',
      'Why carbon is not cut like aluminium',
      'Load carbon the wrong way and it loses 70 % of its stiffness',
      'Carbon does not bend, it breaks. So we design around it',
      'Double the thickness, 8 times stiffer',
      'Aluminium bends, carbon snaps',
      'How a plastic thread becomes carbon fibre',
      'Carbon and aluminium are equally stiff. So why carbon?',
      'It survived the crash. Would you fly it again?',
    ],
  },
  {
    chapter: 'Chapter 2 · Vibration',
    items: ['A drone is a vibration machine', 'Why Betaflight still wants a stiff frame', 'What rubber grommets are really for'],
  },
  {
    chapter: 'Chapter 3 · Motors and power',
    items: ['4S motors on 6S. What could go wrong?', 'ESC Thermal Test', 'The ESC firmware that just switched off', 'You could fly it, but you couldn’t fork it'],
  },
  {
    chapter: 'Chapter 4 · Radio',
    items: [
      'Why 2.4 GHz goes through walls and light doesn’t',
      'Why your Wi-Fi gets slow far from the router',
      'How LoRa hears a signal below the noise',
      'Kilometres away, a forest in the way, still connected',
      'Current flows in circles',
      'Why everything in RF is 50 ohms',
      'This receiver breaks an RF design rule',
    ],
  },
  {
    chapter: 'Chapter 5 · The story',
    items: [
      'How a Wii remote started FPV drones',
      'The weekend freestyle FPV was born',
      'The software is open. The hardware is not.',
      'Hobbyists built a radio that beat everyone',
      'How hobby drones became military hardware',
      'Your drone isn’t just yours anymore',
    ],
  },
  {
    chapter: 'Behind the scenes and tests (no new idea to teach)',
    items: [
      'We flew our carbon frame into a concrete pillar',
      'Pushing the FPV Cinelifter to the max!',
      'Testing and quality control',
      'Life as a factory worker',
      'This is Thomas',
      'Four short clips with only a date or hashtags as the title',
    ],
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
      <Chapter
        id="sources"
        kicker="Where the topics come from"
        title="The 37 Shorts, and where each is explained"
        lead="This page follows the topics of OpenDrone's YouTube Shorts. Here is every Short we found, and the chapter that teaches its idea."
      >
        <p className={styles.honest}>
          <b>What we could and could not read.</b> We could read each Short's title, length and short description. We could not read the spoken words or the on-screen test data, so the explanations, numbers and animations on this page are our own, built from standard physics and engineering. They are not copies of OpenDrone's scripts. For their own tests and measurements, watch the originals at <a href="https://www.youtube.com/@opendrone/shorts" target="_blank" rel="noopener noreferrer">youtube.com/@opendrone</a>.
        </p>
        <div className={styles.sources}>
          {SOURCES.map((g) => (
            <section key={g.chapter}>
              <h4>{g.chapter}</h4>
              <ul>{g.items.map((t) => <li key={t}>{t}</li>)}</ul>
            </section>
          ))}
        </div>
      </Chapter>
    </>
  )
}
