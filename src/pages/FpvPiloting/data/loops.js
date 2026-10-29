// The four practice patterns: 0, 8, 6 and 7. `phases` follows the route in sim.js, one entry for each part of the path, so the
// words on screen change at the same moment the drone moves into the next part.
// Sticks are described in Mode 2: the LEFT stick is throttle (up, down) and yaw (left, right); the RIGHT stick is pitch (forward, back) and roll (left, right).

export const LOOPS = [
  {
    id: '0',
    symbol: '0',
    name: 'The circle',
    level: 'Beginner',
    teaches: 'A steady turn: yaw, roll and pitch working together at a constant speed.',
    phases: [
      { title: 'Line up', text: 'Pitch forward a little for a steady speed. Throttle holds the height. Yaw and roll are centred, so the drone flies straight.' },
      { title: 'The circle', text: 'Start the turn with three small moves together: yaw to the left, roll a little to the left, and keep the pitch forward. Hold them all steady and the drone draws a circle. Add a touch of throttle so it does not sink while it banks.' },
      { title: 'Roll out', text: 'Bring the yaw and roll sticks back to the centre at the same time. The drone straightens and flies on. Do not let the pitch or throttle change.' },
    ],
    mistakes: ['Too much roll and not enough yaw: the drone slides sideways and the circle gets big.', 'Too much yaw and not enough roll: the nose swings round but the drone keeps going straight.', 'Forgetting the throttle: the drone sinks lower every lap.'],
    drill: ['5 laps to the left, then 5 to the right.', 'Keep the same height and speed on every lap.', 'Then make the circle smaller, then faster.'],
  },
  {
    id: '8',
    symbol: '8',
    name: 'The figure 8',
    level: 'Intermediate',
    teaches: 'Switching a turn from one side to the other without stopping, as in racing and freestyle lines.',
    phases: [
      { title: 'Diagonal in', text: 'Fly the straight line towards the first loop. Pitch forward, throttle steady, yaw and roll centred. Look at where the loop will start.' },
      { title: 'Right loop', text: 'Yaw to the right, roll a little to the right, keep the pitch forward. It is the same move as the circle, to the right this time.' },
      { title: 'Through the middle', text: 'Come out of the turn and cross the middle on a straight line. Centre the yaw and roll sticks, then look ahead to the second loop.' },
      { title: 'Left loop', text: 'Now swap sides: yaw to the left, roll to the left. Feel how it is the mirror of the first loop.' },
      { title: 'Diagonal out', text: 'Roll out and fly straight again, back to the crossing. You are ready to start the next 8.' },
    ],
    mistakes: ['Hesitating in the middle: the speed drops and the drone sags.', 'Making one loop bigger than the other: look at the crossing point, and aim for it on every pass.', 'Switching sides with a jerk: ease the yaw and roll stick across, together.'],
    drill: ['3 clean 8s starting to the right, then 3 starting to the left.', 'Cross the middle at the same point each time.', 'Then do it at the same height as a gate.'],
  },
  {
    id: '6',
    symbol: '6',
    name: 'The six',
    level: 'Intermediate',
    teaches: 'Changing the size of a turn: a wide curve into a tight loop.',
    phases: [
      { title: 'Come in', text: 'A short straight. Pitch forward, throttle steady, yaw and roll centred.' },
      { title: 'The long curve', text: 'A gentle, wide turn to the left: only a little yaw and roll. The curve is the tail of the 6.' },
      { title: 'The loop', text: 'Tighten the turn: more yaw and more roll to the left, so the circle is small. Add a little throttle to stay up. Hold it for the full circle.' },
      { title: 'Finish', text: 'Roll out, straight on. Compare how much yaw and roll you needed in the curve and in the loop.' },
    ],
    mistakes: ['A tail and a loop the same size: the curve should be wide, the loop tight.', 'Losing height in the tight turn: more throttle when the bank is steeper.', 'Slowing down in the loop: keep the pitch stick the same.'],
    drill: ['5 sixes to the left, then mirror them to the right.', 'Make the loop smaller each time until it feels too tight.', 'Keep the speed the same in the curve and the loop.'],
  },
  {
    id: '7',
    symbol: '7',
    name: 'The seven',
    level: 'Intermediate',
    teaches: 'Braking for a corner, turning sharply, and getting back on the power. The corner is where racers gain time.',
    phases: [
      { title: 'The top bar', text: 'A straight run at a steady speed. Pitch forward, throttle steady. Look ahead to the corner.' },
      { title: 'Brake', text: 'Ease the pitch stick back to slow down before the corner. A little throttle helps you hold the height while the nose comes up.' },
      { title: 'The corner', text: 'A sharp turn to the right: yaw firmly to the right, roll to the right, and keep a little pitch forward so you come out moving. It is a short, firm move.' },
      { title: 'Power out', text: 'As you point down the slanted stroke, bring the yaw and roll to the centre and push the pitch forward again.' },
      { title: 'The slanted stroke', text: 'A straight run on the new line at full pace. Ready for the next 7.' },
    ],
    mistakes: ['Braking late: you run wide and miss the corner.', 'Braking too early and too hard: the drone creeps round.', 'Starting the yaw before the speed is down: you slide out wide.'],
    drill: ['5 sevens at half speed, then at full speed.', 'Brake at the same marker each time.', 'Try the corner to the left (a backwards 7).'],
  },
]

// The four stick movements. `axis` is the key used by the animation; `stick` says which stick it is.
export const STICKS = [
  {
    id: 'throttle',
    name: 'Throttle',
    stick: 'Left stick, up and down',
    moves: 'Up: the motors spin faster and the drone climbs. Down: they slow and it descends. The middle of the stick is about a hover.',
    feel: 'Move it slowly and in small amounts. A big, quick push makes the drone jump.',
    effect: 'Changes the height.',
  },
  {
    id: 'yaw',
    name: 'Yaw',
    stick: 'Left stick, left and right',
    moves: 'Right: the nose turns to the right. Left: the nose turns to the left. The drone spins like a turntable and stays at the same height.',
    feel: 'Small pushes turn the drone slowly. Yaw is what points the camera.',
    effect: 'Turns the nose, which decides the way you face.',
  },
  {
    id: 'pitch',
    name: 'Pitch',
    stick: 'Right stick, up and down',
    moves: 'Forward: the nose tips down and the drone flies forward. Back: the nose lifts and the drone slows, or flies backwards.',
    feel: 'The further you tip it, the faster it goes. Ease the stick back to the middle and it stops tipping.',
    effect: 'Sets speed forward or back.',
  },
  {
    id: 'roll',
    name: 'Roll',
    stick: 'Right stick, left and right',
    moves: 'Right: the drone leans to the right and slides that way. Left: it leans left and slides left. The nose still points the same way.',
    feel: 'Roll with a little yaw makes a smooth banked turn.',
    effect: 'Slides the drone left or right, and banks it in a turn.',
  },
]
