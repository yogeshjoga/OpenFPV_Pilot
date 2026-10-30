import styles from './Physics.module.css'
import { PRESSURE_GRADIENT, SPEED_GRADIENT } from './flow.js'

// The colour key for the air pictures: what blue, green and red mean, with the numbers for this drone.
export default function FlowLegend({ mode, speedMax, pressureMax }) {
  const pressure = mode === 'pressure'
  return (
    <div className={styles.legend}>
      <span>{pressure ? `Suction −${Math.round(pressureMax)} Pa` : 'Still air 0 m/s'}</span>
      <i className={styles.legendBar} style={{ background: pressure ? PRESSURE_GRADIENT : SPEED_GRADIENT }} aria-hidden="true" />
      <span>{pressure ? `Push +${Math.round(pressureMax)} Pa` : `Fastest ${Math.round(speedMax)} m/s`}</span>
    </div>
  )
}
