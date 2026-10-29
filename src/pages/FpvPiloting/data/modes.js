// What each flight mode is, how it works, and when to use it. Written for a student who has never flown.
// Terms: Betaflight, the most common flight software, calls these Angle, Horizon and Acro. "3D" is a motor setting on top of Acro.

export const MODES = [
  {
    id: 'angle',
    name: 'Angle',
    nick: 'Self-level',
    color: '#30a46c',
    stick: 'The stick sets how far the drone is tilted.',
    letGo: 'Let go and the drone levels itself and stops tilting.',
    how: [
      'The flight controller reads the gyro and the accelerometer to know which way is level.',
      'Your stick position becomes a target tilt, from 0 (flat) to a limit, normally 55 to 60 degrees.',
      'The PID loop tilts the drone to that angle and holds it there. Stick to the centre means the target is flat, so it levels out.',
    ],
    pros: ['The easiest mode: let go of the roll and pitch stick and the drone recovers by itself.', 'It cannot flip over by mistake.', 'A good first mode for hovering, slow flying and landing.'],
    cons: ['The tilt limit also limits speed and agility.', 'You cannot flip, roll or do the tricks of freestyle or racing.', 'It does not hold its position: wind still pushes it, and it keeps drifting a little. It levels, it does not stop.'],
  },
  {
    id: 'horizon',
    name: 'Horizon',
    nick: 'Level near the middle, Acro at the edge',
    color: '#f5a524',
    stick: 'Small stick movements act like Angle. Pushing to the end acts like Acro.',
    letGo: 'Let go and it levels, unless you were pushing right to the end.',
    how: [
      'Close to the centre, the drone tries to level itself, as in Angle mode.',
      'The self-levelling fades out as the stick goes further. At full stick it is pure Acro, so flips and rolls are allowed.',
      'It is a safety net while you practise flips: let go and it returns to level.',
    ],
    pros: ['Lets you try flips and rolls with a safety net.', 'A gentle step between Angle and Acro.'],
    cons: ['It feels different at the centre than at the edge, which confuses some students.', 'Most pilots move to Acro within weeks, because Acro feels the same everywhere.'],
  },
  {
    id: 'acro',
    name: 'Acro',
    nick: 'Rate mode, also called Manual',
    color: '#e5484d',
    stick: 'The stick sets how fast the drone rotates.',
    letGo: 'Let go and the drone stops rotating but stays tilted. It keeps going the way it points.',
    how: [
      'Your stick position becomes a rotation speed, up to several hundred degrees per second at full stick.',
      'The gyro tells the flight controller how fast it is turning, and the PID loop makes that match the stick.',
      'There is no level reference. To level out, you have to rotate the drone back yourself. Tilting forward is also how you go forward.',
    ],
    pros: ['No tilt limit: flips, rolls, dives and tight turns are all possible.', 'The drone does exactly what the sticks say, which is why racing and freestyle pilots use it.', 'Predictable at every angle and speed, so muscle memory carries over.'],
    cons: ['The steepest learning curve: nothing levels the drone for you.', 'You must manage the throttle yourself when the drone is tilted or upside down, because thrust pushes along the top of the drone.', 'Early crashes are common. Practise in a simulator first.'],
  },
  {
    id: '3d',
    name: '3D',
    nick: 'Motors that spin both ways',
    color: '#a371f7',
    stick: 'The attitude is flown like Acro. The throttle stick is centred at zero, up is thrust one way and down is thrust the other way.',
    letGo: 'Throttle in the middle: the motors stop. Rotation stops but stays tilted, as in Acro.',
    how: [
      'The ESCs run the motors in both directions. Throttle in the middle means zero thrust.',
      'Above the middle the motors push the drone along its top, as usual. Below the middle they spin backwards and push it along its underside.',
      'So an upside-down drone can hold its height by pushing the throttle down. It can hover, slide and turn while inverted, like a 3D RC helicopter.',
    ],
    pros: ['Inverted hovering and slow aerobatics that no normal mode can do.', 'You can brake by reversing thrust and go up or down without flipping.', 'A fun and advanced skill for stunt pilots.'],
    cons: ['Needs bidirectional ESCs and a special setup in the configurator. Do it with the props off.', 'The reversed thrust is weaker, because propellers are shaped for one direction.', 'Easy to get wrong, and dangerous if the throttle is not at zero when you arm. Learn Acro first.'],
  },
]

export const MODE_BY_ID = Object.fromEntries(MODES.map((m) => [m.id, m]))

// the comparison table: one row per question a student asks
export const COMPARE = [
  { row: 'What the stick controls', values: { angle: 'Tilt angle', horizon: 'Angle near the middle, rotation speed at the edge', acro: 'Rotation speed', '3d': 'Rotation speed, plus thrust both ways' } },
  { row: 'Sticks in the middle', values: { angle: 'Levels itself', horizon: 'Levels itself', acro: 'Stops turning, stays tilted', '3d': 'Stops turning, throttle is zero thrust' } },
  { row: 'Can it flip?', values: { angle: 'No', horizon: 'Yes, at full stick', acro: 'Yes', '3d': 'Yes' } },
  { row: 'Largest tilt', values: { angle: 'About 55 degrees', horizon: 'Any', acro: 'Any', '3d': 'Any' } },
  { row: 'Top speed', values: { angle: 'Limited by the tilt', horizon: 'High', acro: 'Highest', '3d': 'Lower, thrust is weaker one way' } },
  { row: 'Throttle', values: { angle: 'Up is up', horizon: 'Up is up', acro: 'Pushes along the top of the drone', '3d': 'Middle is zero, down reverses' } },
  { row: 'Difficulty', values: { angle: 'Easy', horizon: 'Medium', acro: 'Hard at first', '3d': 'Hardest' } },
  { row: 'Special setup', values: { angle: 'None', horizon: 'None', acro: 'None', '3d': 'Bidirectional ESCs and 3D settings' } },
  { row: 'Best for', values: { angle: 'First flights, hovering, landing', horizon: 'Practising flips with a safety net', acro: 'Freestyle, racing, cinematic', '3d': 'Inverted hover and stunt flying' } },
]

// "when should I use which": situations, with the mode that fits and why
export const WHEN = [
  { id: 'first', situation: 'My first flights', mode: 'angle', why: 'Self-levelling lets you learn throttle, hovering and landing without also fighting the tilt.' },
  { id: 'indoors', situation: 'Flying a small drone indoors', mode: 'angle', why: 'Small mistakes are cheap, and Angle stops them turning into flips against a wall.' },
  { id: 'wind', situation: 'A windy day, or filming gently', mode: 'angle', why: 'It stays level, so footage and your nerves stay calm. Wind will still push it.' },
  { id: 'rescue', situation: 'I am in trouble and need to recover', mode: 'angle', why: 'Put Angle on a switch. Flip it and the drone levels itself in a moment. Every pilot should set this up.' },
  { id: 'practice', situation: 'Learning flips and rolls', mode: 'horizon', why: 'It lets you try the move, then levels the drone if you let go. Move on to Acro when you are ready.' },
  { id: 'freestyle', situation: 'Freestyle and tricks', mode: 'acro', why: 'You need to go to any angle and have the drone stay where you put it.' },
  { id: 'racing', situation: 'Racing through gates', mode: 'acro', why: 'The tilt limit of Angle would slow you down, and Acro gives full speed and the sharpest turns.' },
  { id: 'cinematic', situation: 'Smooth fast footage', mode: 'acro', why: 'Acro with gentle rates gives smooth, flowing lines that Angle cannot make at speed.' },
  { id: 'inverted', situation: 'Hovering or sliding upside down', mode: '3d', why: 'Only 3D mode can hold height while inverted, by reversing the thrust.' },
]
