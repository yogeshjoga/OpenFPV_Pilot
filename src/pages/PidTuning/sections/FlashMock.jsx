import { Check, Download, Usb } from 'lucide-react'
import styles from './Guide.module.css'

// our own drawings of the flashing steps, one per step, each with a small animation
export default function FlashMock({ kind }) {
  if (kind === 'install') {
    return (
      <div className={styles.flash}>
        <div className={styles.flashBar}><i /><i /><i /><span>Download</span></div>
        <div className={styles.flashBody}>
          <Download size={44} className={styles.bounce} aria-hidden="true" />
          <div className={styles.dlRow}>
            {['Windows', 'macOS', 'Linux', 'Web app'].map((o) => <span key={o} className={styles.button}>{o}</span>)}
          </div>
          <p className={styles.mockNote}>Desktop app or a Chrome / Edge browser (WebSerial + WebUSB)</p>
        </div>
      </div>
    )
  }
  if (kind === 'driver') {
    return (
      <div className={styles.flash}>
        <div className={styles.flashBar}><i /><i /><i /><span>Driver tool</span></div>
        <div className={styles.flashBody}>
          <div className={styles.device} data-state="before"><Usb size={18} aria-hidden="true" /><b>STM32 BOOTLOADER</b><em>no driver</em></div>
          <div className={styles.arrowDown} aria-hidden="true">↓ install WinUSB</div>
          <div className={styles.device} data-state="after"><Usb size={18} aria-hidden="true" /><b>STM32 BOOTLOADER</b><em><Check size={14} aria-hidden="true" /> WinUSB</em></div>
          <p className={styles.mockNote}>Needed once on Windows, only for flashing in DFU mode</p>
        </div>
      </div>
    )
  }
  if (kind === 'backup') {
    return (
      <div className={styles.flash}>
        <div className={styles.flashBar}><i /><i /><i /><span>CLI</span></div>
        <div className={`${styles.cli} ${styles.cliBig}`}>
          <p style={{ '--n': 10 }}># diff all</p>
          <p style={{ '--n': 34 }}># version: Betaflight (board name, firmware)</p>
          <p style={{ '--n': 26 }}>set dshot_bidir = ON</p>
          <p style={{ '--n': 22 }}>set motor_poles = 14</p>
          <p style={{ '--n': 30 }}>profile 0 / set p_roll = 45 ...</p>
          <p style={{ '--n': 12 }}># copy this into a file</p>
        </div>
      </div>
    )
  }
  if (kind === 'dfu') {
    return (
      <div className={styles.flash}>
        <div className={styles.flashBar}><i /><i /><i /><span>The board</span></div>
        <div className={styles.flashBody}>
          <div className={styles.board} aria-label="A flight controller with a boot button and a USB plug">
            <span className={styles.chip}>MCU</span>
            <span className={styles.bootBtn}>BOOT</span>
            <span className={styles.led} />
            <span className={styles.usb}>USB</span>
          </div>
          <p className={styles.mockNote}>Hold BOOT, plug in USB, release: the board shows up as a DFU device</p>
        </div>
      </div>
    )
  }
  if (kind === 'flash') {
    return (
      <div className={styles.flash}>
        <div className={styles.flashBar}><i /><i /><i /><span>Firmware Flasher</span></div>
        <div className={styles.flashBody}>
          <div className={styles.wRow}><span className={styles.wLabel}>Board</span><span className={styles.select}>Auto-detect: your board</span></div>
          <div className={styles.wRow}><span className={styles.wLabel}>Firmware version</span><span className={styles.select}>Latest stable release</span></div>
          <div className={styles.wRow}><span className={styles.wLabel}>Radio protocol</span><span className={styles.select}>ExpressLRS</span></div>
          <div className={styles.wRow}><span className={styles.wLabel}>Full chip erase</span><span className={styles.switch} data-on="true"><i /></span></div>
          <div className={styles.dlRow}>
            <span className={styles.button}>Load Firmware [Online]</span>
            <span className={`${styles.button} ${styles.primaryBtn}`}>Flash Firmware</span>
          </div>
          <div className={styles.progress} aria-hidden="true"><i /></div>
          <p className={styles.success}><Check size={14} aria-hidden="true" /> Programming: SUCCESSFUL</p>
        </div>
      </div>
    )
  }
  return (
    <div className={styles.flash}>
      <div className={styles.flashBar}><i /><i /><i /><span>Setup</span><b className={styles.connect}><i />Connected</b></div>
      <div className={styles.flashBody}>
        <div className={styles.modelStage}>
          <div className={styles.model}>
            {[[18, 18], [82, 18], [18, 82], [82, 82]].map(([x, y]) => <span key={`${x}-${y}`} className={styles.rotor} style={{ left: `${x}%`, top: `${y}%` }} />)}
            <span className={styles.armA} />
            <span className={styles.armB} />
            <span className={styles.body}><b>FRONT</b></span>
          </div>
        </div>
        <p className={styles.mockNote}>Tilt the real drone: the model must follow</p>
      </div>
    </div>
  )
}
