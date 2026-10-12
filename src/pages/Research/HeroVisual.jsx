import styles from './HeroVisual.module.css'

// Corner motors of the drawing, in the 400 x 400 space of the SVG
const MOTORS = [
  [90, 90],
  [310, 90],
  [90, 310],
  [310, 310],
]

/**
 * A blueprint-style top view of an FPV drone with the parts our research is about, picked out and labelled with their
 * stage numbers. Drawn as a small inline SVG with CSS animation only, so it adds almost nothing to the page weight.
 */
export default function HeroVisual() {
  return (
    <figure className={styles.visual}>
      <svg
        className={styles.svg}
        viewBox="0 0 400 400"
        role="img"
        aria-label="Top view of an FPV drone showing the flight controller, speed controller and AI chip that we plan to design"
      >
        <circle className={styles.orbit} cx="200" cy="200" r="150" />
        <circle className={styles.ring} cx="200" cy="200" r="70" />

        <line className={styles.arm} x1="90" y1="90" x2="310" y2="310" />
        <line className={styles.arm} x1="310" y1="90" x2="90" y2="310" />

        {MOTORS.map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <g className={styles.prop}>
              <line x1={x - 40} y1={y} x2={x + 40} y2={y} />
              <line x1={x} y1={y - 40} x2={x} y2={y + 40} />
            </g>
            <circle className={styles.motor} cx={x} cy={y} r="14" />
          </g>
        ))}

        <circle className={styles.camera} cx="200" cy="141" r="7" />
        <rect className={styles.body} x="165" y="150" width="70" height="100" rx="14" />
        <rect className={styles.board} x="176" y="160" width="48" height="36" rx="4" />
        <rect className={styles.board} x="176" y="206" width="48" height="34" rx="4" />
        <rect className={styles.ai} x="190" y="170" width="20" height="16" rx="3" />

        <path className={styles.leader} d="M134 152 L176 178" />
        <path className={styles.leader} d="M134 248 L176 226" />
        <path className={styles.leader} d="M266 152 L210 178" />
        <path className={styles.leader} d="M266 248 L298 298" />
        <circle className={styles.dot} cx="176" cy="178" r="3" />
        <circle className={styles.dot} cx="176" cy="226" r="3" />
        <circle className={styles.dot} cx="210" cy="178" r="3" />
        <circle className={styles.dot} cx="298" cy="298" r="3" />
      </svg>

      <p className={`${styles.chip} ${styles.chipFc}`}>
        <strong>Flight controller</strong>
        <span>Stage 4</span>
      </p>
      <p className={`${styles.chip} ${styles.chipEsc}`}>
        <strong>Speed controller</strong>
        <span>Stage 3</span>
      </p>
      <p className={`${styles.chip} ${styles.chipAi}`}>
        <strong>AI chip</strong>
        <span>Stages 5 and 6</span>
      </p>
      <p className={`${styles.chip} ${styles.chipMotor}`}>
        <strong>Motors, propellers</strong>
        <span>Existing parts</span>
      </p>

      <figcaption className={styles.caption}>Inside the drone: the parts we plan to design</figcaption>
    </figure>
  )
}
