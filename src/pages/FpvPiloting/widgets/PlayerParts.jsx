import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react'
import styles from './PlayerParts.module.css'

// play, again, step back, step forward, a bar to move along, and the speed
export function PlayerControls({ playing, onToggle, onAgain, onPrev, onNext, time, duration, onScrub, speed, onSpeed, label }) {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.primary} onClick={onToggle} aria-label={playing ? 'Pause' : 'Play'}>
        {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        {playing ? 'Pause' : 'Play'}
      </button>
      <button type="button" onClick={onPrev} aria-label="Previous step" title="Previous step"><SkipBack size={16} aria-hidden="true" /></button>
      <button type="button" onClick={onNext} aria-label="Next step" title="Next step"><SkipForward size={16} aria-hidden="true" /></button>
      <button type="button" onClick={onAgain} aria-label="Start again" title="Start again"><RotateCcw size={16} aria-hidden="true" /></button>
      <input type="range" min="0" max={duration} step="0.02" value={time} onChange={(e) => onScrub(Number(e.target.value))} aria-label={label} className={styles.scrub} />
      <label className={styles.speed}>
        <span className="sr-only">Speed</span>
        <select value={speed} onChange={(e) => onSpeed(Number(e.target.value))} aria-label="Speed">
          <option value={0.25}>0.25x</option>
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
        </select>
      </label>
    </div>
  )
}

// the step the drone is on, in words: the first thing a student reads
export function StepNow({ index, total, title, text }) {
  return (
    <>
      <p className={styles.kicker}>Step {index + 1} of {total}</p>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.text}>{text}</p>
      <div className={styles.dots} aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <i key={i} data-on={i <= index} />)}
      </div>
    </>
  )
}
