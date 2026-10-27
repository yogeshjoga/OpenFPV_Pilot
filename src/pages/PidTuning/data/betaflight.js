// Content for the Betaflight section: how to flash, what each Configurator tab is for, and a CLI cheat sheet.
// The mock-ups on the page are our own drawings of the screens, not screenshots. Menu names follow Betaflight Configurator 10.x.
// Betaflight is open-source software by its own authors. We are not affiliated with it.

export const FLASH_STEPS = [
  {
    id: 'install',
    title: 'Install the Configurator',
    summary: 'Betaflight Configurator is the program on your computer that talks to the flight controller (FC).',
    points: [
      'Get it from the Betaflight website: a desktop app for Windows, macOS and Linux, or the web app in a Chrome or Edge browser (it needs WebSerial and WebUSB).',
      'Use a USB data cable. Some cables only charge, and then the board never shows up.',
      'Take the propellers off before you plug anything in. A motor can spin when you least expect it.',
    ],
    warn: 'Never flash or change settings with a LiPo battery connected and props on.',
  },
  {
    id: 'driver',
    title: 'Check the USB driver',
    summary: 'Normally the board appears as a serial port. For flashing, it may appear as an STM32 "DFU" device, which needs a driver on Windows.',
    points: [
      'macOS and most Linux systems need no driver. Linux may need a udev rule so your user can open the device.',
      'On Windows, if Firmware Flasher says "No DFU device", use the free Zadig tool to install the WinUSB driver for "STM32 BOOTLOADER".',
      'Plug the board in directly, not through a hub, and try another port if it does not appear.',
    ],
    warn: 'Install a driver only for the "STM32 BOOTLOADER" device, never for your keyboard or mouse.',
  },
  {
    id: 'backup',
    title: 'Back up before you flash',
    summary: 'Flashing resets the board to defaults. Save your settings so you can restore them.',
    points: [
      'Open the CLI tab, type diff all and press Enter. Copy everything it prints into a text file.',
      'Also save a full dump if you want everything, and note your Betaflight version.',
      'After flashing, paste the saved lines back into the CLI and type save.',
    ],
    warn: 'Restoring a backup from a much older version can set options that no longer exist. Check the lines you paste.',
  },
  {
    id: 'dfu',
    title: 'Put the board in boot mode (if needed)',
    summary: 'Most boards can be flashed straight from the Firmware Flasher. If it will not connect, use the boot button.',
    points: [
      'Hold the BOOT button on the board while you plug in USB. Release after a second. The board appears as a DFU device.',
      'Or, in the CLI tab, type bl and press Enter: the board restarts into its bootloader.',
      'In Firmware Flasher you can also tick "No reboot sequence" when the board is already in boot mode.',
    ],
    warn: 'If the board no longer starts after a failed flash, boot mode is how you recover it.',
  },
  {
    id: 'flash',
    title: 'Choose the board and flash',
    summary: 'This is the Firmware Flasher tab. The firmware has to match your exact board.',
    points: [
      'Press Auto-detect with the board connected, or pick the board name from the list (it is printed on the board or on the maker\'s page).',
      'Choose the firmware version. Use the latest stable release unless you have a reason not to.',
      'Use "Build Configuration" to pick the radio protocol (for example ExpressLRS or Crossfire), the OSD type and motor protocols.',
      'Tick "Full chip erase" when you change to a new major version, then press Load Firmware [Online] and Flash Firmware. Wait for "Programming: SUCCESSFUL".',
    ],
    warn: 'Do not unplug the board while it flashes.',
  },
  {
    id: 'connect',
    title: 'Connect and set up',
    summary: 'After flashing, the board waits at defaults. Now connect and go through the tabs in order.',
    points: [
      'Press Connect. The Setup tab shows a 3D drone that tilts when you tilt the real one. If it tilts the wrong way, fix the board alignment.',
      'Work down the menu: Ports, Configuration, Power & Battery, Receiver, Modes, Motors, OSD and PID Tuning.',
      'Press Save and Reboot in tabs that ask for it. Settings are only stored when you save.',
    ],
    warn: 'Test the motors with the props OFF, and check that each motor spins the right way.',
  },
]

// ------------------------------------------------------------------ the Configurator, tab by tab
// widgets are drawn by the mock-up: slider, switch, select, bars, rates, graph, list, text, model
export const TABS = [
  {
    id: 'setup',
    label: 'Setup',
    icon: 'Compass',
    group: 'Start here',
    summary: 'The first screen after you connect. It shows the drone\'s attitude and lets you calibrate the accelerometer.',
    widgets: [
      { type: 'model', n: 1 },
      { type: 'list', n: 2, items: [['Accelerometer', 'OK'], ['Gyro', 'OK'], ['Barometer', 'none'], ['Arming flags', 'RXLOSS  CLI']] },
      { type: 'button', n: 3, label: 'Calibrate accelerometer' },
    ],
    callouts: [
      { n: 1, title: '3D model', text: 'Tilt the real drone: the model must tilt the same way. If not, set Board and Sensor Alignment in Configuration.' },
      { n: 2, title: 'Sensors and arming flags', text: 'Shows what the board found and why it will not arm yet (for example no receiver signal, or still connected to USB).' },
      { n: 3, title: 'Calibrate accelerometer', text: 'Set the drone on a flat, level surface and press it. This sets what "level" means for Angle mode.' },
    ],
    tip: 'If the 3D model drifts or looks wrong, check the board orientation and the Reset Z axis button.',
  },
  {
    id: 'ports',
    label: 'Ports',
    icon: 'Cable',
    group: 'Start here',
    summary: 'Each UART is one serial connection on the board. This tab says what is plugged into each one.',
    widgets: [
      { type: 'table', n: 1, head: ['UART', 'MSP', 'Serial Rx', 'Telemetry', 'Peripherals'], rows: [['USB (VCP)', 'on', '', '', ''], ['UART1', '', 'on', '', ''], ['UART2', '', '', '', 'VTX (SmartAudio)'], ['UART3', '', '', '', 'GPS']] },
    ],
    callouts: [
      { n: 1, title: 'Serial Rx', text: 'Turn on Serial Rx for the UART that your receiver is wired to. Then choose the protocol in the Receiver tab.' },
      { n: 2, title: 'MSP', text: 'MSP is how the Configurator talks to the board. Never turn it off for the USB port, or you cannot connect any more.' },
      { n: 3, title: 'Peripherals', text: 'VTX control, GPS, Blackbox and ESC telemetry each go on their own UART.' },
    ],
    tip: 'Match the UART number to the pads you soldered on the board. The maker\'s wiring diagram tells you.',
  },
  {
    id: 'configuration',
    label: 'Configuration',
    icon: 'Settings2',
    group: 'Start here',
    summary: 'The main system settings: loop speed, motor protocol, sensor alignment and the features switched on.',
    widgets: [
      { type: 'select', n: 1, label: 'Gyro / PID loop', value: '8 kHz / 4 kHz' },
      { type: 'select', n: 2, label: 'ESC protocol', value: 'DSHOT300' },
      { type: 'switch', n: 3, label: 'Bidirectional DShot', on: true },
      { type: 'select', n: 4, label: 'Board alignment (yaw)', value: '0°' },
      { type: 'switch', n: 5, label: 'Dynamic idle / RPM filter', on: true },
    ],
    callouts: [
      { n: 1, title: 'Loop speed', text: 'How often the gyro is read and the motors updated. Keep the default for your board.' },
      { n: 2, title: 'Motor protocol', text: 'Use DShot300 or DShot600. The ESC must understand it.' },
      { n: 3, title: 'Bidirectional DShot', text: 'Brings the motor RPM back to the flight controller, so the RPM filter and dynamic idle work.' },
      { n: 4, title: 'Board alignment', text: 'Use it if the board is mounted turned. Pitch, roll and yaw offsets in degrees.' },
      { n: 5, title: 'Features', text: 'Turn on only what you use: Airmode, motor stop is normally off, telemetry if your radio shows it.' },
    ],
    tip: 'Set the number of motor poles here too (14 for most 5-inch motors).',
  },
  {
    id: 'power',
    label: 'Power & Battery',
    icon: 'BatteryCharging',
    group: 'Start here',
    summary: 'Teaches the board how to read the battery, so the OSD and warnings are right.',
    widgets: [
      { type: 'select', n: 1, label: 'Voltage meter source', value: 'Onboard ADC' },
      { type: 'slider', n: 2, label: 'Voltage scale', value: 0.62 },
      { type: 'select', n: 3, label: 'Cell count', value: '6S' },
      { type: 'slider', n: 4, label: 'Warning cell voltage', value: 0.5 },
    ],
    callouts: [
      { n: 1, title: 'Voltage meter', text: 'Use the onboard ADC. Measure the real battery voltage with a multimeter and adjust the scale until the numbers match.' },
      { n: 2, title: 'Cell count', text: 'Set it to your pack, so that the per-cell voltage and warnings make sense.' },
      { n: 3, title: 'Warning voltage', text: 'Minimum cell voltage warns you before the battery is empty. About 3.5 V per cell for a warning, 3.3 V minimum.' },
    ],
    tip: 'Never fly a LiPo below about 3.3 V per cell under load. It damages the pack.',
  },
  {
    id: 'failsafe',
    label: 'Failsafe',
    icon: 'ShieldAlert',
    group: 'Safety',
    summary: 'What the drone does if the radio link is lost.',
    widgets: [
      { type: 'select', n: 1, label: 'Stage 2 procedure', value: 'Drop' },
      { type: 'slider', n: 2, label: 'Guard time', value: 0.2 },
      { type: 'switch', n: 3, label: 'Failsafe switch', on: false },
    ],
    callouts: [
      { n: 1, title: 'Procedure', text: 'Drop turns the motors off so that the drone falls. Land descends gently. GPS Rescue flies home when a GPS is fitted.' },
      { n: 2, title: 'Guard time', text: 'How long the link must be lost before the failsafe starts. Too short triggers on a brief glitch.' },
      { n: 3, title: 'Test it', text: 'With the props OFF, arm and then turn the transmitter off. The motors should stop.' },
    ],
    tip: 'Always test failsafe before the first flight and after any receiver change.',
  },
  {
    id: 'presets',
    label: 'Presets',
    icon: 'Layers',
    group: 'Tuning',
    summary: 'Ready-made settings from the community and manufacturers: tunes, filters, rates, OSD layouts and more.',
    widgets: [
      { type: 'list', n: 1, items: [['5" freestyle, 6S', 'tune'], ['Filters: RPM + dynamic notch', 'filters'], ['Rates: Actual, 800 deg/s', 'rates'], ['OSD: simple', 'osd']] },
      { type: 'button', n: 2, label: 'Apply presets' },
    ],
    callouts: [
      { n: 1, title: 'Pick for your drone', text: 'Choose presets that match your drone class and battery. Read the notes on each preset.' },
      { n: 2, title: 'Apply and save', text: 'Betaflight shows exactly which settings will change. Check them, apply and press Save.' },
    ],
    tip: 'A preset is a good starting point. Tune from there with the flight data in the Blackbox.',
  },
  {
    id: 'pid',
    label: 'PID Tuning',
    icon: 'SlidersHorizontal',
    group: 'Tuning',
    summary: 'The heart of tuning: PID gains, sliders, filters and rates, kept in profiles you can switch in flight.',
    widgets: [
      { type: 'slider', n: 1, label: 'P (roll)', value: 0.5, animate: true },
      { type: 'slider', n: 1, label: 'I (roll)', value: 0.72, animate: true },
      { type: 'slider', n: 1, label: 'D (roll)', value: 0.4, animate: true },
      { type: 'slider', n: 2, label: 'Feedforward (roll)', value: 0.62 },
      { type: 'select', n: 3, label: 'PID profile', value: '1' },
      { type: 'rates', n: 4 },
    ],
    callouts: [
      { n: 1, title: 'P, I and D', text: 'The three gains for roll, pitch and yaw. Roll and pitch are tuned first, yaw last.' },
      { n: 2, title: 'Feedforward', text: 'Makes the drone react to stick speed. Changes the feel without making the hold stronger.' },
      { n: 3, title: 'Profiles', text: 'Four PID profiles and six rate profiles can be stored and switched, for example a calm one and a racing one.' },
      { n: 4, title: 'Rates', text: 'How fast the drone turns for each stick position. The curve is drawn for you, with the maximum degrees per second.' },
    ],
    tip: 'Change one thing at a time, fly, and look at what changed. Use the Blackbox when you need to be sure.',
  },
  {
    id: 'receiver',
    label: 'Receiver',
    icon: 'Radio',
    group: 'Radio',
    summary: 'Shows the radio signal arriving at the board, live, so you can check every stick and switch.',
    widgets: [
      { type: 'select', n: 1, label: 'Receiver mode', value: 'Serial (CRSF)' },
      { type: 'bars', n: 2, labels: ['Roll', 'Pitch', 'Yaw', 'Throttle', 'AUX 1', 'AUX 2'] },
      { type: 'select', n: 3, label: 'Channel map', value: 'AETR1234' },
    ],
    callouts: [
      { n: 1, title: 'Receiver type', text: 'Serial-based receiver, then the protocol: CRSF for ExpressLRS and Crossfire, SBUS, and others.' },
      { n: 2, title: 'Live bars', text: 'Move each stick. The right bar must move, from 1000 to 2000 with the centre at 1500.' },
      { n: 3, title: 'Channel map', text: 'Most radios use AETR (aileron, elevator, throttle, rudder). Fix any mixed-up sticks here.' },
    ],
    tip: 'Set the endpoints on your radio, not here, so all models behave the same.',
  },
  {
    id: 'modes',
    label: 'Modes',
    icon: 'ToggleRight',
    group: 'Radio',
    summary: 'Link switches on your radio to functions in the flight controller.',
    widgets: [
      { type: 'ranges', n: 1, items: [['ARM', 'AUX 1', 0.7, 1.0], ['ANGLE', 'AUX 2', 0.0, 0.34], ['AIR MODE', 'AUX 2', 0.34, 1.0], ['TURTLE', 'AUX 3', 0.7, 1.0], ['BEEPER', 'AUX 4', 0.7, 1.0]] },
    ],
    callouts: [
      { n: 1, title: 'ARM', text: 'The switch that starts the motors. Set a range, then check that the bar lights up when the switch is on.' },
      { n: 2, title: 'ANGLE / HORIZON', text: 'Self-levelling flight modes for learning. Acro (no mode) is the normal way to fly freestyle.' },
      { n: 3, title: 'TURTLE', text: 'Flip a crashed, upside-down drone over by spinning the motors backwards. A very useful safety mode.' },
      { n: 4, title: 'BEEPER', text: 'Makes the drone beep so that you can find it after a crash.' },
    ],
    tip: 'Use a two-position switch for ARM, and put it somewhere you cannot hit by accident.',
  },
  {
    id: 'adjustments',
    label: 'Adjustments',
    icon: 'Sliders',
    group: 'Radio',
    summary: 'Lets a knob or switch on the radio change a setting while you fly, for example a PID gain or a rate.',
    widgets: [
      { type: 'ranges', n: 1, items: [['Range 1', 'AUX 5', 0.0, 0.5], ['Range 2', 'AUX 5', 0.5, 1.0]] },
    ],
    callouts: [
      { n: 1, title: 'In-flight tuning', text: 'Choose a channel and a function. Turning the knob then changes the value live. Handy for finding the best P or D, though the sliders are simpler for most people.' },
    ],
    tip: 'Write the final value down and enter it in PID Tuning, then switch the adjustment off.',
  },
  {
    id: 'motors',
    label: 'Motors',
    icon: 'Fan',
    group: 'Hardware',
    summary: 'Test each motor, check the spin direction and see the motor numbering.',
    widgets: [
      { type: 'switch', n: 1, label: 'I understand the risks: props are off', on: true },
      { type: 'motors', n: 2 },
      { type: 'select', n: 3, label: 'Motor direction', value: 'Props in' },
    ],
    callouts: [
      { n: 1, title: 'Props OFF', text: 'You must tick the box before the test sliders unlock. Always take the props off first.' },
      { n: 2, title: 'Motor test', text: 'Move each slider a little. The right motor, in the right place, must spin the right way: M1 rear right, M2 front right, M3 rear left, M4 front left.' },
      { n: 3, title: 'Direction', text: 'Reverse a motor in the Motors tab (or with the ESC setup) if it spins the wrong way. Props in and props out are both fine.' },
    ],
    tip: 'Clockwise (CW) props go on the motors that spin clockwise, seen from above. Mixing them up means the drone will not lift.',
  },
  {
    id: 'osd',
    label: 'OSD',
    icon: 'MonitorPlay',
    group: 'Video',
    summary: 'The On Screen Display: the numbers drawn over your video feed.',
    widgets: [{ type: 'osd', n: 1 }, { type: 'list', n: 2, items: [['Battery voltage', 'on'], ['Flight time', 'on'], ['RSSI / link quality', 'on'], ['Warnings', 'on']] }],
    callouts: [
      { n: 1, title: 'Preview', text: 'Drag the items around on the preview to place them. Keep the middle of the screen clear.' },
      { n: 2, title: 'Elements', text: 'Choose what to show. Battery, link quality, flight time and warnings are the useful ones.' },
    ],
    tip: 'Fewer numbers on screen are easier to read at speed.',
  },
  {
    id: 'vtx',
    label: 'Video Transmitter',
    icon: 'RadioTower',
    group: 'Video',
    summary: 'Change the video transmitter band, channel and power from the Configurator or your radio.',
    widgets: [
      { type: 'select', n: 1, label: 'Band', value: 'Raceband' },
      { type: 'select', n: 1, label: 'Channel', value: '3' },
      { type: 'select', n: 2, label: 'Power', value: '200 mW' },
    ],
    callouts: [
      { n: 1, title: 'Band and channel', text: 'Pick a channel that nobody else near you is using. Flying together needs different channels.' },
      { n: 2, title: 'Power', text: 'Follow your local rules for transmit power, and do not run a VTX for long without airflow.' },
    ],
    tip: 'Needs a UART with SmartAudio, Tramp or the digital system\'s own protocol on Ports.',
  },
  {
    id: 'sensors',
    label: 'Sensors',
    icon: 'Activity',
    group: 'Diagnostics',
    summary: 'Live graphs from the gyro, accelerometer and motors. A quick way to see vibration.',
    widgets: [{ type: 'graph', n: 1 }],
    callouts: [
      { n: 1, title: 'Gyro graph', text: 'Hold the drone still: the lines should be calm. Heavy fuzz means vibration or a bad filter setting.' },
    ],
    tip: 'Tap the frame and watch the graph: you can see which axis picks up the vibration.',
  },
  {
    id: 'blackbox',
    label: 'Blackbox',
    icon: 'HardDrive',
    group: 'Diagnostics',
    summary: 'Records the gyro, the PID terms, the stick and the motors, hundreds of times a second, for study afterwards.',
    widgets: [
      { type: 'select', n: 1, label: 'Device', value: 'SD card' },
      { type: 'select', n: 2, label: 'Logging rate', value: '2 kHz' },
      { type: 'graph', n: 3 },
    ],
    callouts: [
      { n: 1, title: 'Log device', text: 'Onboard flash fills quickly, so an SD card is better for long flights.' },
      { n: 2, title: 'Rate', text: 'A higher rate shows more detail but fills the card sooner.' },
      { n: 3, title: 'Why it matters', text: 'This is the tool to see exactly where the drone overshot or shook, and which filter to change.' },
    ],
    tip: 'Fly one short, clean log, then study it. Many tuning questions are answered in a log.',
  },
  {
    id: 'cli',
    label: 'CLI',
    icon: 'Terminal',
    group: 'Diagnostics',
    summary: 'The command line: every setting is here, and it is the best way to back up and share your configuration.',
    widgets: [{ type: 'cli', n: 1 }],
    callouts: [
      { n: 1, title: 'Command line', text: 'Type a command and press Enter. "diff all" lists everything you changed, "save" stores it and restarts the board.' },
    ],
    tip: 'Nothing typed here is stored until you type save.',
  },
]

export const CLI_COMMANDS = [
  { cmd: 'diff all', text: 'Lists every setting that differs from the defaults. Copy it as your backup.' },
  { cmd: 'dump', text: 'Lists every setting, including the defaults.' },
  { cmd: 'status', text: 'Shows the firmware version, board name, sensors and CPU load.' },
  { cmd: 'get gyro', text: 'Shows every setting that starts with gyro. Useful for searching.' },
  { cmd: 'set name = value', text: 'Changes a setting. Nothing is stored yet.' },
  { cmd: 'save', text: 'Stores your changes and restarts the board.' },
  { cmd: 'defaults', text: 'Resets everything to defaults. Use it before restoring a backup on a fresh board.' },
  { cmd: 'bl', text: 'Restarts into the bootloader (DFU mode) for flashing.' },
  { cmd: 'help', text: 'Lists all the commands.' },
]

export const CHECKLIST = [
  'Props OFF for every step in the Configurator.',
  'Setup tab: the 3D model tilts the same way as the real drone.',
  'Receiver tab: all sticks move the right bars, centre at 1500.',
  'Modes: ARM works from your switch, TURTLE and BEEPER are set.',
  'Motors tab: each motor spins the right way, M1 to M4 in the right place.',
  'Power & Battery: the voltage matches a multimeter.',
  'Failsafe: switch the transmitter off while armed (props OFF): the motors stop.',
  'First flight: hover low and close. Land, check the motor temperature, then go on.',
]

// the other flight-control firmwares we will cover next
export const OTHER_FIRMWARE = [
  { name: 'INAV', text: 'Navigation-focused firmware: GPS, return to home, waypoints and fixed-wing support.' },
  { name: 'ArduPilot', text: 'A large autopilot for multirotors, planes, rovers and boats, with missions and a ground station.' },
  { name: 'EmuFlight', text: 'A community branch of the same family, tuned for racing feel.' },
  { name: 'KISS', text: 'A simple, closed firmware with its own configuration tool.' },
]
