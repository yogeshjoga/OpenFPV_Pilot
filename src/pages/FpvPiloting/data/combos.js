// Combinations of stick moves. Each starts in a hover at 2 metres, facing north, with the throttle at about 40%.
// Steps: dur in seconds, sticks as in sim.js (throttle 0 to 1, the others -1 to 1: pitch forward is positive, roll and yaw right are positive).

export const COMBOS = [
  {
    id: 'forward',
    name: 'Forward at the same height',
    uses: 'Pitch forward + a little throttle',
    why: 'Tipping the nose down sends the drone forward, but a tilted drone holds itself up less, so it starts to sink. A little more throttle keeps it at the same height.',
    steps: [
      { title: 'Hover at 2 metres', dur: 1.2, sticks: {}, text: 'Start in a hover, 2 metres up, facing north. The throttle stick is about 40%: that holds the height. The other sticks are centred.' },
      { title: 'Pitch forward, add a little throttle', dur: 3, sticks: { pitch: 0.45, throttle: 0.44 }, text: 'Push the right stick forward. The nose tips down and the drone flies north, the way its nose points. Raise the throttle a little (to about 44%) so it stays at 2 metres.' },
      { title: 'Let go: it levels and coasts', dur: 1.2, sticks: {}, text: 'Centre both sticks and bring the throttle back to 40%. The drone levels itself and the air slows it down.' },
      { title: 'Pitch back to stop', dur: 1.2, sticks: { pitch: -0.3, throttle: 0.41 }, text: 'Tip the right stick back for a moment. The nose lifts and the drone brakes.' },
      { title: 'Hover again', dur: 1.4, sticks: {}, text: 'Centre the sticks. The drone hovers at 2 metres, many metres further north.' },
    ],
  },
  {
    id: 'climbforward',
    name: 'Climb while flying forward',
    uses: 'Pitch forward + throttle up',
    why: 'Throttle sets the height and pitch sets the forward speed, and they work at the same time: the drone climbs in a slope, like going up a hill.',
    steps: [
      { title: 'Hover at 2 metres', dur: 1.2, sticks: {}, text: 'A hover at 2 metres, facing north.' },
      { title: 'Pitch forward and throttle up', dur: 2.6, sticks: { pitch: 0.35, throttle: 0.46 }, text: 'Push the right stick forward and the throttle stick up at the same time. The drone flies north and climbs: the height rises from 2 metres.' },
      { title: 'Level off', dur: 1.8, sticks: { pitch: 0.3, throttle: 0.42 }, text: 'Bring the throttle back to just above 40%. The climb stops and the drone flies on at the new height.' },
      { title: 'Stop and hover', dur: 1.8, sticks: { pitch: -0.25, throttle: 0.4 }, text: 'Tip the right stick back to brake, then centre the sticks. The drone is now higher and further north than it began.' },
    ],
  },
  {
    id: 'slide',
    name: 'Slide sideways',
    uses: 'Roll + a little throttle',
    why: 'Roll leans the drone to the side, so it slides that way without turning: the nose still points north while it goes east.',
    steps: [
      { title: 'Hover at 2 metres', dur: 1.2, sticks: {}, text: 'A hover at 2 metres, facing north.' },
      { title: 'Roll right', dur: 2.4, sticks: { roll: 0.45, throttle: 0.43 }, text: 'Push the right stick to the right. The drone leans right and slides east. Its nose still points north. A touch of throttle keeps the height.' },
      { title: 'Roll left to stop', dur: 1.3, sticks: { roll: -0.3, throttle: 0.42 }, text: 'Tip the right stick to the left for a moment to brake the slide.' },
      { title: 'Hover again', dur: 1.5, sticks: {}, text: 'Centre the sticks. The drone is further east, at the same height, still facing north.' },
    ],
  },
  {
    id: 'bank',
    name: 'Banked turn to the right',
    uses: 'Pitch forward + roll right + yaw right',
    why: 'Pitch moves the drone forward, yaw turns its nose to the right, and a little roll leans it into the turn. Together the path curves, like a car turning a corner.',
    steps: [
      { title: 'Hover at 2 metres', dur: 1, sticks: {}, text: 'A hover at 2 metres, facing north.' },
      { title: 'Pitch forward, then yaw and roll right', dur: 4.6, sticks: { pitch: 0.4, roll: 0.18, yaw: 0.08, throttle: 0.44 }, text: 'Push the right stick forward and a little to the right, and the left stick a little to the right (yaw). The drone flies forward while its nose swings right, so it curves to the right. Add a little throttle for height.' },
      { title: 'Roll out and hover', dur: 2.2, sticks: {}, text: 'Centre all the sticks. The drone levels, stops turning, and slows to a stop. It faces a new direction.' },
    ],
  },
  {
    id: 'spiral',
    name: 'Climbing spiral',
    uses: 'Throttle up + pitch + roll + yaw',
    why: 'All four sticks at once: it flies forward, leans into a circle, and climbs while it goes round.',
    steps: [
      { title: 'Hover at 2 metres', dur: 1, sticks: {}, text: 'A hover at 2 metres, facing north.' },
      { title: 'All four together', dur: 5.4, sticks: { throttle: 0.44, pitch: 0.3, roll: 0.15, yaw: 0.2 }, text: 'Throttle up a little, pitch forward, roll right and yaw right, all together. The drone circles to the right while the height rises.' },
      { title: 'Centre the sticks', dur: 2, sticks: {}, text: 'Centre everything. The drone stops circling, levels and slows to a stop, higher than where it began.' },
    ],
  },
  {
    id: 'square',
    name: 'Fly a square',
    uses: 'Pitch forward, then yaw right 90°, four times',
    why: 'Forward is always the way the nose points. Turning the nose with yaw changes which compass direction forward means: north, east, south, west.',
    steps: [
      { title: 'North', dur: 2.2, sticks: { pitch: 0.4, throttle: 0.43 }, text: 'Pitch forward: the drone flies north.' },
      { title: 'Turn right 90°', dur: 1, sticks: { yaw: 0.25 }, text: 'Centre the pitch and yaw right for a moment. The nose swings to the east and the drone slows down.' },
      { title: 'East', dur: 2.2, sticks: { pitch: 0.4, throttle: 0.43 }, text: 'Pitch forward again: the drone now flies east, the way its nose points.' },
      { title: 'Turn right 90°', dur: 1, sticks: { yaw: 0.25 }, text: 'Yaw right again: the nose points south.' },
      { title: 'South', dur: 2.2, sticks: { pitch: 0.4, throttle: 0.43 }, text: 'Pitch forward: the drone flies south.' },
      { title: 'Turn right 90°', dur: 1, sticks: { yaw: 0.25 }, text: 'Yaw right: the nose points west.' },
      { title: 'West', dur: 2.2, sticks: { pitch: 0.4, throttle: 0.43 }, text: 'Pitch forward: the drone flies west, back towards where it started.' },
      { title: 'Stop', dur: 1.5, sticks: {}, text: 'Centre the sticks and hover. The drone has flown a rough square at 2 metres.' },
    ],
  },
]
