// What a signed-out visitor sees in place of each Academy page: a title, one sentence and a few teasers. The page itself opens after sign-in.
export const GATES = {
  intro: {
    title: 'Intro to Drones',
    blurb: 'Start from zero: what a drone is, how it flies and what every part does.',
    bullets: ['How a quadcopter flies, step by step', 'Every part explained with pictures', 'What to learn first, and in what order'],
  },
  physics: {
    title: 'Drone Physics',
    blurb: 'The forces behind every flight, taught with live, interactive demonstrations.',
    bullets: ['Thrust, weight, drag and lift', 'Why a drone tilts to move', 'Interactive physics you can change'],
  },
  piloting: {
    title: 'FPV Piloting',
    blurb: 'Learn Angle, Acro and 3D modes, the stick moves, loops, flips and race turns on a 3D drone.',
    bullets: ['Flight modes, one at a time', 'Stick combinations with height and direction', 'Race moves and stunts flown on screen'],
  },
  pid: {
    title: 'PID Tuning',
    blurb: 'Understand P, I and D, then tune a drone yourself in a safe simulation.',
    bullets: ['What each gain does, in plain words', 'A tuning lab with live charts', 'A step-by-step Betaflight guide'],
  },
  droneLab: {
    title: 'Drone Lab',
    blurb: 'See how a drone works inside, and configure your own with live charts.',
    bullets: ['How a drone works, in 2D and 3D', 'A configurator with live performance', 'Physics and radio, interactive'],
  },
  wiringLab: {
    title: 'Wiring Lab',
    blurb: 'Learn how every wire connects, then practise on a builder that checks your work.',
    bullets: ['Wiring lessons for each board', 'A practice builder with feedback', 'Common mistakes and how to avoid them'],
  },
  hardware: {
    title: 'Drone Hardware',
    blurb: 'Why frames are carbon, why drones shake, why 6S cooks 4S motors, and how a radio works.',
    bullets: ['Frames, vibration, power and radio', '3D animations with sliders', 'The road from a game controller to your drone'],
  },
  catalog: {
    title: 'Parts Catalog',
    blurb: 'Compare motors, frames, cameras and more, with real specifications.',
    bullets: ['Real part specifications', 'Filter by category', 'Compatibility at a glance'],
  },
  training: {
    title: 'Programs',
    blurb: 'Our courses and workshops, what each one covers and who it is for.',
    bullets: ['Courses for students and colleges', 'What you build and learn', 'How to join'],
  },
  assembly: {
    title: '3D Assembly',
    blurb: 'Build a drone part by part in 3D.',
    bullets: ['Step-by-step assembly', 'Rotate and zoom every part', 'Checks as you go'],
  },
}
