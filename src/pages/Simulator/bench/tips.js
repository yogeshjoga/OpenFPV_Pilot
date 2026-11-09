// What to say when someone points at a pad, a wire or a part of a board. Plain data and functions, no React, so the tests
// can check that every pad of every part has something to say.
//
// A tip is { title, tone, badge, rows: [[heading, text], ...] }
//   tone   'power' | 'ground' | 'signal' | 'data' | 'motor' | 'plain' (picks the badge colour)
//   badge  the short answer: what the pad carries
// Only well-known facts are stated (the standard Betaflight motor order, what a regulator pad is for ...). A pad whose
// meaning is particular to one maker says so and points to that maker's manual.

import { canon } from './boards/semantics.js'

const RAIL = {
  vbat: {
    badge: 'Battery voltage',
    tone: 'power',
    carries: 'The full battery voltage straight from the LiPo: 14.8 V nominal and 16.8 V when full on 4S (22.2 V and 25.2 V on 6S). On the ESC it carries the current of all four motors together, tens of amps.',
    wire: 'Thick silicone wire, 12 to 14 AWG, and a generous solder joint. A thin wire here gets hot and can burn.',
  },
  gnd: {
    badge: 'Ground, 0 V',
    tone: 'ground',
    carries: 'Ground, the 0 V return path for every voltage on the board. Every ground pad of a board is the same copper, so any of them will do.',
    wire: 'Black wire. Thick (12 to 14 AWG) on the ESC where the motor current returns, thin (26 to 30 AWG) for a small part on the flight controller.',
  },
  '5v': { badge: '5 V', tone: 'power', carries: '5 volts, regulated.', wire: 'Red wire, 26 to 30 AWG is enough for a small part.' },
  '9v': { badge: '9 V', tone: 'power', carries: '9 volts, regulated, for a video transmitter or camera. Check what the part accepts before joining it.', wire: 'Red wire, 24 to 28 AWG.' },
  '12v': { badge: '12 V', tone: 'power', carries: '12 volts, regulated, for a digital video unit. Check what the part accepts before joining it.', wire: 'Red wire, 24 to 28 AWG.' },
  '3v3': { badge: '3.3 V', tone: 'power', carries: '3.3 volts for the processor and small sensors. Only a tiny load can run from it.', wire: 'Thin wire, 28 to 30 AWG.' },
}

// the supplies the way a regulator pad of the flight controller is described
const regulator = (rail, name) => ({
  title: `${name} output`,
  rows: [
    ['What it is', `The ${name} regulator of the flight controller, brought out to a pad. It only works while the flight controller has battery power on its BAT and GND pads.`],
    ['Carries', RAIL[rail].carries],
    ['Wire', RAIL[rail].wire],
    ['Connect to', 'The power wire of a part that needs this voltage. Never to ground, battery voltage or another supply.'],
  ],
})

const where = (part) => part.name ?? part.model ?? part.id

const MOTOR_POSITION = { 1: 'rear right', 2: 'front right', 3: 'rear left', 4: 'front left' }

// ---- pads with a name that means the same thing on any flight controller ----
const LABELS = {
  CUR: {
    badge: 'Current reading',
    tone: 'signal',
    what: 'The ESC measures the current the battery supplies and sends it to the flight controller as a voltage. Betaflight turns it into the amps shown in the OSD.',
    wire: 'Thin signal wire, 26 to 30 AWG, or the plug cable.',
    to: 'The CUR pad of the ESC (or the flight controller).',
  },
  TLM: {
    badge: 'ESC telemetry',
    tone: 'data',
    what: 'The ESC sends motor RPM, temperature and current back to the flight controller over a one-wire serial line.',
    wire: 'Thin signal wire, 26 to 30 AWG, or the plug cable.',
    to: 'The telemetry pad of the ESC, and a UART RX pad on the flight controller.',
  },
  LED: {
    badge: 'LED strip signal',
    tone: 'signal',
    what: 'The data line for an addressable LED strip. The strip also needs 5V and ground.',
    wire: 'Thin signal wire, 26 to 30 AWG.',
    to: 'The signal wire of an addressable LED strip.',
  },
  'BZ-': {
    badge: 'Buzzer negative',
    tone: 'signal',
    what: 'The flight controller switches the negative leg of the buzzer to ground to make it sound. The positive leg of the buzzer goes to 5V.',
    wire: 'Thin wire, 26 to 30 AWG.',
    to: 'The negative leg of a 5 V buzzer.',
  },
  SBUS: {
    badge: 'SBUS receiver input',
    tone: 'data',
    what: 'The input for an SBUS receiver, which sends all the stick channels over one wire.',
    wire: 'Thin signal wire, 26 to 30 AWG.',
    to: 'The SBUS output of the receiver.',
  },
  SDA: { badge: 'I2C data', tone: 'data', what: 'The data line of the I2C bus, used by sensors such as a compass or a barometer.', wire: 'Thin signal wire, 28 to 30 AWG.', to: 'The SDA pad of the sensor.' },
  SCL: { badge: 'I2C clock', tone: 'data', what: 'The clock line of the I2C bus, used by sensors such as a compass or a barometer.', wire: 'Thin signal wire, 28 to 30 AWG.', to: 'The SCL pad of the sensor.' },
  DP: { badge: 'USB data +', tone: 'data', what: 'The D+ data line of the USB port, for plugging in a computer. Leave it alone unless you are replacing the USB port.', wire: 'Not normally wired.', to: 'Nothing: it is wired to the USB port already.' },
  DM: { badge: 'USB data -', tone: 'data', what: 'The D- data line of the USB port, for plugging in a computer. Leave it alone unless you are replacing the USB port.', wire: 'Not normally wired.', to: 'Nothing: it is wired to the USB port already.' },
  BOOT: {
    badge: 'Bootloader pad',
    tone: 'signal',
    what: 'Joining this pad to ground while the USB cable is plugged in puts the flight controller in bootloader (DFU) mode, which is how firmware is flashed when it will not start.',
    wire: 'A tweezer tip is enough; it is not wired permanently.',
    to: 'Ground, only while plugging in USB.',
  },
  VSW: { badge: 'Battery voltage', tone: 'power', what: 'Battery voltage made available on this pad, the same as BAT, for a part that runs on battery voltage.', wire: RAIL.vbat.wire, to: 'The power wire of a part that takes battery voltage.' },
  NC: { badge: 'Not connected', tone: 'plain', what: 'This pin is not connected to anything on this board.', wire: 'Leave it empty.', to: 'Nothing: leave it empty.' },
  CAM: {
    badge: 'Camera video in',
    tone: 'signal',
    what: 'The analog video from the FPV camera comes in here. The flight controller adds the on-screen display and passes the picture on to the VTX pad.',
    wire: 'Yellow or white wire, 28 to 30 AWG.',
    to: 'The video wire of the camera.',
  },
  VTX: {
    badge: 'Video out',
    tone: 'signal',
    what: 'The picture, with the on-screen display added, goes out from here to the video transmitter.',
    wire: 'Yellow or white wire, 28 to 30 AWG.',
    to: 'The video-in wire of the VTX.',
  },
}

/** The group a pad belongs to, for the sentence about where it sits. */
const groupName = (pad) => (pad.group && pad.group !== 'BACK' ? pad.group : '')

// ---- parts with leads of their own ----
const LEADS = {
  'bat+': {
    badge: 'Battery voltage',
    tone: 'power',
    title: 'Battery + (red lead)',
    rows: [
      ['What it is', 'The positive lead of the battery, through the XT60 plug. The red wire is always positive.'],
      ['Carries', RAIL.vbat.carries],
      ['Wire', 'It already has its own thick wire (12 to 14 AWG). Solder its tinned tip to the pad.'],
      ['Connect to', 'BAT+ on the ESC. Never to ground: that is a short circuit.'],
    ],
  },
  'bat-': {
    badge: 'Ground, 0 V',
    tone: 'ground',
    title: 'Battery - (black lead)',
    rows: [
      ['What it is', 'The negative lead of the battery, through the XT60 plug. The black wire is always ground.'],
      ['Carries', 'The return current of the whole drone, tens of amps. It is 0 V.'],
      ['Wire', 'It already has its own thick wire (12 to 14 AWG). Solder its tinned tip to the pad.'],
      ['Connect to', 'BAT- on the ESC. Never to BAT+: that is a short circuit.'],
    ],
  },
  'cap+': {
    badge: 'Battery voltage',
    tone: 'power',
    title: 'Capacitor + (long leg)',
    rows: [
      ['What it is', 'The positive leg, the longer one. The capacitor soaks up the voltage spikes the motors throw back at the battery lines.'],
      ['Carries', 'Battery voltage, with only the brief spikes flowing through it, not the motor current.'],
      ['Wire', 'Its own legs. Keep them short and trim them to length.'],
      ['Connect to', 'The BAT+ pad of the ESC, next to the battery’s red lead, with the legs as short as you can. Reversed, a capacitor can burst.'],
    ],
  },
  'cap-': {
    badge: 'Ground, 0 V',
    tone: 'ground',
    title: 'Capacitor - (striped leg)',
    rows: [
      ['What it is', 'The negative leg, the short one on the side of the stripe.'],
      ['Carries', 'Ground, with only the brief spikes flowing through it.'],
      ['Wire', 'Its own legs. Keep them short and trim them to length.'],
      ['Connect to', 'The BAT- pad of the ESC, next to the battery’s black lead.'],
    ],
  },
}

const motorLead = (pad) => ({
  badge: 'Motor phase',
  tone: 'motor',
  title: `Motor ${pad.label.toLowerCase()}`,
  rows: [
    ['What it is', 'One of the three wires of the motor. The ESC drives them in turn so the motor spins; none of the three is the "plus" or the "minus".'],
    ['Carries', 'Three-phase power: the battery voltage switched on and off thousands of times a second, up to the motor current.'],
    ['Wire', 'It already has its own wire. Trim it and tin the end.'],
    ['Connect to', 'One of the three pads of a single motor output on the ESC (M1 to M4). Any order works. Swapping two wires makes the motor spin the other way.'],
  ],
})

const deviceLead = (part, pad) => {
  const L = canon(pad.label)
  if (pad.uartDevice) {
    const tx = pad.uartDevice === 'tx'
    return {
      badge: tx ? 'Serial data out' : 'Serial data in',
      tone: 'data',
      title: `${part.name}: ${pad.label}`,
      rows: [
        ['What it is', tx ? 'The data the device sends: stick commands from a receiver, or position from a GPS.' : 'The data the device receives from the flight controller, such as settings or telemetry.'],
        ['Carries', 'A 3.3 V serial signal, a few milliamps. No power.'],
        ['Wire', 'Thin wire, 26 to 30 AWG.'],
        ['Connect to', tx ? 'The RX pad of a UART on the flight controller (R1, R3 ...). Transmit always goes to receive.' : 'The TX pad of a UART on the flight controller (T1, T3 ...). Receive always comes from transmit.'],
      ],
    }
  }
  if (pad.video) {
    const out = pad.video === 'video-out'
    return {
      badge: 'Analog video',
      tone: 'signal',
      title: `${part.name}: ${pad.label}`,
      rows: [
        ['What it is', out ? 'The picture from the camera, as an analog video signal.' : 'The input of the transmitter: it sends this picture to the goggles.'],
        ['Carries', 'About one volt of video signal, a few milliamps. No power.'],
        ['Wire', 'Yellow or white, 28 to 30 AWG. Keep it away from the motor wires.'],
        ['Connect to', out ? 'The CAM pad of the flight controller, so the on-screen display can be added.' : 'The VTX pad of the flight controller.'],
      ],
    }
  }
  if (pad.accepts) {
    const list = pad.accepts.map((r) => RAIL[r]?.badge ?? r).join(' or ')
    return {
      badge: `Takes ${list}`,
      tone: 'power',
      title: `${part.name}: ${pad.label}`,
      rows: [
        ['What it is', 'The power wire of the part.'],
        ['Carries', `${list}. The current is small, under an amp.`],
        ['Wire', 'Its own thin wire. Solder its tinned tip to the pad.'],
        ['Connect to', `A ${list} pad of the flight controller. Battery voltage here, unless the part says it takes it, burns it.`],
      ],
    }
  }
  if (pad.rail === 'gnd' || L === 'GND') {
    return {
      badge: 'Ground, 0 V',
      tone: 'ground',
      title: `${part.name}: ${pad.label}`,
      rows: [
        ['What it is', 'The ground wire of the part, usually black.'],
        ['Carries', 'The return current of the part, small. It is 0 V.'],
        ['Wire', 'Its own thin wire.'],
        ['Connect to', 'Any ground pad of the flight controller; they are all the same copper.'],
      ],
    }
  }
  return null
}

// ---- the pads of a board, by what the pad is ----
function boardPad(part, pad) {
  const L = canon(pad.label)
  const place = groupName(pad) ? `the ${groupName(pad)} group of ${where(part)}` : where(part)

  if (pad.motor) {
    const n = Number(pad.motor.group.slice(1))
    return {
      badge: 'Motor phase',
      tone: 'motor',
      title: `${pad.motor.group} motor pad ${pad.motor.index + 1} of 3`,
      rows: [
        ['What it is', `One of the three pads of the ${pad.motor.group} motor output. On a standard quad (Betaflight order) ${pad.motor.group} is the ${MOTOR_POSITION[n] ?? 'numbered'} motor.`],
        ['Carries', 'Three-phase power to the motor: battery voltage switched on and off thousands of times a second, up to the motor current (30 to 60 A peaks on a typical ESC).'],
        ['Wire', 'The motor’s own three wires. Trim them short and tin them; a long loose wire picks up noise.'],
        ['Connect to', 'One wire of the motor. Use all three pads of the same output, in any order. Swapping two wires reverses the spin.'],
      ],
    }
  }

  // the battery pads of an ESC: the battery leads and the capacitor legs both go here
  if (pad.id === 'batp' || pad.id === 'batn') {
    const plus = pad.id === 'batp'
    const rail = RAIL[plus ? 'vbat' : 'gnd']
    return {
      badge: rail.badge,
      tone: rail.tone,
      title: `${pad.label} (battery pad)`,
      rows: [
        ['What it is', `The big pad for the battery’s ${plus ? 'red (positive)' : 'black (negative)'} lead. The capacitor goes on this same pad.`],
        ['Carries', rail.carries],
        ['Wire', rail.wire],
        ['Connect to', `The ${plus ? 'red' : 'black'} lead of the battery (XT60), and the ${plus ? 'long' : 'short, striped'} leg of the capacitor.`],
      ],
    }
  }

  // the 8-pin link between the flight controller and the ESC
  if (pad.group === 'ESC') {
    const link = part.kind === 'esc' ? 'flight controller' : 'ESC'
    const m = /^M([1-8])$/.exec(L)
    if (m) {
      return {
        badge: 'Motor signal',
        tone: 'signal',
        title: `${pad.label} motor signal`,
        rows: [
          ['What it is', `The control line for motor ${m[1]}: the flight controller tells the ESC how fast to spin it. On a standard quad that motor is the ${MOTOR_POSITION[Number(m[1])] ?? 'numbered'} one.`],
          ['Carries', 'A 3.3 V digital throttle signal (DShot). A few milliamps, no power.'],
          ['Wire', 'Thin signal wire, 26 to 30 AWG. On a stack the plug cable does this.'],
          ['Connect to', `The ${pad.label} pad of the ${link}. Crossing two of them makes the wrong motor spin.`],
        ],
      }
    }
    if (L === 'BAT' || L === 'GND' || L === 'CUR' || L === 'TLM' || /^R\d$/.test(L)) {
      const key = L === 'BAT' ? 'vbat' : L === 'GND' ? 'gnd' : null
      if (key) {
        const onEsc = part.kind === 'esc'
        return {
          badge: RAIL[key].badge,
          tone: RAIL[key].tone,
          title: `${pad.label} (link to the ${link})`,
          rows: [
            ['What it is', onEsc ? `Gives the flight controller ${key === 'vbat' ? 'battery voltage' : 'ground'} so its regulators can make 5 V and the other supplies.` : `Takes ${key === 'vbat' ? 'battery voltage' : 'ground'} from the ESC to power the flight controller’s regulators.`],
            ['Carries', RAIL[key].carries.split('. ')[0] + '. Only a small current, under a few amps, for the flight controller and the parts it feeds.'],
            ['Wire', 'Medium wire, 22 to 26 AWG, or the plug cable.'],
            ['Connect to', `The ${pad.label} pad of the ${link}. Without it the flight controller has no power.`],
          ],
        }
      }
      const info = LABELS[L === 'CUR' ? 'CUR' : 'TLM']
      return { badge: info.badge, tone: info.tone, title: `${pad.label} (link to the ${link})`, rows: [['What it is', info.what], ['Carries', 'A small signal, no power.'], ['Wire', info.wire], ['Connect to', info.to]] }
    }
  }

  // supplies
  if (pad.source && RAIL[pad.rail]) {
    const t = regulator(pad.rail, RAIL[pad.rail].badge)
    return { badge: RAIL[pad.rail].badge, tone: 'power', ...t }
  }
  if (pad.rail && RAIL[pad.rail]) {
    const r = RAIL[pad.rail]
    return {
      badge: r.badge,
      tone: r.tone,
      title: pad.label,
      rows: [
        ['What it is', pad.rail === 'vbat' ? `Battery voltage on ${place}.` : `A ground pad of ${place}. It is the same copper as every other ground pad of this board.`],
        ['Carries', r.carries],
        ['Wire', r.wire],
        ['Connect to', pad.rail === 'vbat' ? 'The battery’s red lead, or the same pad of the other board of the stack.' : 'Ground of the part you are wiring, or the black lead of the battery on the ESC.'],
      ],
    }
  }

  // data
  if (pad.uart) {
    const tx = pad.uart.dir === 'tx'
    return {
      badge: tx ? `UART${pad.uart.n} out` : `UART${pad.uart.n} in`,
      tone: 'data',
      title: `${pad.label}: UART${pad.uart.n} ${tx ? 'transmit' : 'receive'}`,
      rows: [
        ['What it is', `A UART is a two-wire serial port. This pad is the ${tx ? 'transmit (T)' : 'receive (R)'} side of UART${pad.uart.n}. Its job is set in the Ports tab of Betaflight (receiver, GPS, telemetry ...).`],
        ['Carries', 'A 3.3 V serial signal. A few milliamps, no power.'],
        ['Wire', 'Thin signal wire, 26 to 30 AWG.'],
        ['Connect to', tx ? 'The RX wire of the device. Transmit always goes to receive.' : 'The TX wire of the device. Receive always comes from transmit.'],
      ],
    }
  }
  const info = LABELS[L]
  if (info) {
    return { badge: info.badge, tone: info.tone, title: pad.label, rows: [['What it is', info.what], ['Carries', info.tone === 'data' || info.tone === 'signal' ? 'A small signal, no power.' : 'See the line above.'], ['Wire', info.wire], ['Connect to', info.to]] }
  }
  return {
    badge: 'See the maker’s manual',
    tone: 'plain',
    title: pad.label,
    rows: [
      ['What it is', `A pad named ${pad.label} on ${place}. What it does on this board is particular to its maker, so check the maker’s manual before wiring it.`],
      ['Where', pad.face === 'back' ? 'On the back of the board.' : 'On the front of the board.'],
    ],
  }
}

/** What to say about one pad of a placed part. */
export function padTip(part, pad) {
  let tip = null
  if (pad.role && LEADS[pad.role]) tip = LEADS[pad.role]
  else if (part.kind === 'motor' && pad.lead) tip = motorLead(pad)
  else if (pad.lead || part.pads.every((p) => p.lead)) tip = deviceLead(part, pad)
  if (!tip) tip = boardPad(part, pad)
  return { tone: tip.tone, badge: tip.badge, title: tip.title, part: where(part), rows: tip.rows }
}

// ---- the parts of a board ----
const FC_CHIP = {
  MCU: ['Processor (MCU)', 'The brain of the flight controller. It runs Betaflight: it reads the gyro and the receiver, works out what each motor should do hundreds of times a second and sends that to the ESC.'],
  IMU: ['Gyro (IMU)', 'Measures how fast the drone is turning (and how it is accelerating). The processor corrects the motors against this thousands of times a second to keep the drone steady. It is why the flight controller must be mounted flat and soft.'],
  FLASH: ['Blackbox flash memory', 'Stores the flight log (blackbox) so you can tune the drone afterwards. Nothing to wire.'],
}
const ESC_CHIP = ['Processor (MCU)', 'The brain of the ESC. It runs the ESC firmware (BLHeli or AM32): it reads the four motor signals from the flight controller and switches the power stages at the right moment for each motor.']

const FEATURES = {
  fet: ['Power stage (MOSFETs)', 'Each motor has its own set of power transistors. They switch the battery current to the three motor pads thousands of times a second, which is what makes the motor spin. They carry the motor current and get warm, so give the ESC airflow.'],
  coil: ['Coil (inductor)', 'Part of the voltage regulator: it stores energy and smooths the current while the regulator turns battery voltage down. Nothing to wire.'],
  cap: ['Capacitor', 'Small capacitors smooth the supply so voltage dips and spikes do not reach the processor. Nothing to wire. The big capacitor you solder on is separate.'],
  usb: ['USB port', 'Plug a USB cable here to connect to a computer for Betaflight Configurator. It powers the flight controller for setup, so you can configure without a battery. Take the propellers off while a USB cable is plugged in.'],
  button: ['BOOT button', 'Hold it while plugging in the USB cable to put the board in bootloader (DFU) mode, which is how firmware is flashed when the board will not start.'],
  led: ['Status LED', 'A small light that shows the board has power and what it is doing.'],
  hole: ['Mounting hole', 'The four holes sit 30.5 mm apart in a square (the common stack size). Use M3 screws with rubber grommets so motor vibration does not reach the gyro.'],
  ghost: ['Part on the other side', 'A part sits here on the other face of the board. Turn the part over to see its pads.'],
  'module:BT': ['Bluetooth module', 'Lets you change settings from a phone, without a cable. It uses one of the flight controller’s UARTs.'],
}

const GROUPS = {
  ESC: ['ESC link', 'The plug that joins the flight controller to the ESC: battery voltage and ground, the current reading, telemetry, and one signal line for each motor. The same pads sit in the same order on both boards.'],
  CAM: ['Camera group', 'Three pads for the analog FPV camera: video, ground and 5 V power.'],
  VTX: ['Video transmitter group', 'Pads for the video transmitter: the picture out, ground, and the supply voltage for it.'],
  DJI: ['Digital video unit port', 'The plug for a digital video unit: power, ground and its serial data, plus an SBUS input where the board has one.'],
  LED: ['LED group', 'Ground, 5 V and the data line for an addressable LED strip.'],
  BUZZER: ['Buzzer group', 'Ground, 5 V and the negative side of a buzzer.'],
  GPS: ['GPS group', 'Power, ground, serial data and the I2C lines for a GPS and compass module.'],
}

/** What to say about a part of the artwork. `key` is what the drawing says it is, e.g. 'chip:MCU', 'fet', 'group:ESC'. */
export function featureTip(key, part) {
  const rows = (text) => [['What it is', text]]
  const [type, name] = key.split(':')
  let found = null
  if (type === 'chip') {
    if (part.kind === 'esc' && name === 'MCU') found = ESC_CHIP
    else if (FC_CHIP[name]) found = FC_CHIP[name]
  } else if (type === 'group') {
    const g = GROUPS[name] ?? GROUPS[name.replace(/\d+$/, '')]
    if (g) found = g
    else if (/^UART\d/.test(name)) found = [`${name} port`, `A serial port: transmit (T), receive (R), ground and 5 V. In Betaflight’s Ports tab you choose what it does: receiver, GPS, telemetry ...`]
    else found = [`${name} group`, 'A group of pads on the board. Point at a pad to see what it does.']
  } else if (FEATURES[key]) found = FEATURES[key]
  else if (FEATURES[type]) found = FEATURES[type]
  if (!found) return null
  return { tone: 'plain', badge: part.kind === 'esc' ? 'On the ESC' : 'On the board', title: found[0], part: where(part), rows: rows(found[1]) }
}

/** What to say about a part when nothing more exact is pointed at. */
export function partTip(part) {
  const rows = [['What it is', part.blurb]]
  if (part.specs?.length) rows.push(['Specs', part.specs.join('. ')])
  rows.push(['Tip', 'Point at a pad or a wire end to see what it carries and what to connect it to.'])
  return { tone: 'plain', badge: part.category ?? 'Part', title: part.name, part: where(part), rows }
}

/** What to say about a soldered wire, from the two pads it joins. Each end is { padLabel, partName, tip } with the tip of its pad. */
export function wireTip(a, b) {
  const rank = { power: 0, ground: 1, motor: 2, signal: 3, data: 4, plain: 5 }
  const [first] = [a, b].sort((x, y) => rank[x.tip.tone] - rank[y.tip.tone])
  const carrier = first.tip
  const find = (heading) => carrier.rows.find((r) => r[0] === heading)?.[1]
  return {
    tone: carrier.tone,
    badge: carrier.badge,
    title: `${carrier.badge} wire`,
    part: 'Soldered wire',
    rows: [
      ['Joins', `${a.partName}: ${a.padLabel}  to  ${b.partName}: ${b.padLabel}`],
      ['Carries', find('Carries') ?? carrier.badge],
      ['Wire', find('Wire') ?? 'A thin wire is fine.'],
      ['Remove', 'Click the wire, then press Delete.'],
    ],
  }
}
