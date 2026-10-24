// The parts a student can choose from, for a 5-inch freestyle quad.
// All numbers are typical, rounded values for teaching. They are our own simplified figures, not any maker's data sheet.

export const FRAME = {
  id: 'freestyle-5',
  name: '5" freestyle frame',
  weightG: 115,
  maxPropIn: 5.1,
  wheelbaseMm: 225,
  motorMount: '16 x 16 mm',
  stackMount: '30.5 x 30.5 mm',
  learn:
    'A 5-inch frame carries 5-inch props. It is made of 4 mm carbon fibre arms, which are stiff and light. The wheelbase, the distance between opposite motors, is about 225 mm.',
}

// The parts every build shares: a 30.5 mm flight controller and speed controller stack, plus receiver, antennas, wires and screws.
export const FIXED = {
  stackWeightG: 28,
  extrasWeightG: 28,
  escRatingA: 55,
}

export const MOTORS = [
  {
    id: '2207-1750',
    bellColor: 0xb3122a,
    name: '2207 · 1750KV',
    stator: [22, 7],
    kv: 1750,
    weightG: 33,
    cells: [6, 6],
    maxThrustKg: 1.8,
    maxCurrentA: 42,
    short: 'Made for 6S. Smooth, efficient and powerful.',
    learn:
      'The first two digits are the stator width and the last two its height, in millimetres, so 2207 is a 22 mm wide, 7 mm tall stator. KV is how many revolutions per minute the motor turns for each volt, with no load. A low KV like 1750 is wound for a high voltage battery (6S).',
  },
  {
    id: '2306-2450',
    bellColor: 0x7b3fc4,
    name: '2306 · 2450KV',
    stator: [23, 6],
    kv: 2450,
    weightG: 34,
    cells: [4, 4],
    maxThrustKg: 1.55,
    maxCurrentA: 40,
    short: 'Made for 4S. Wide, flat stator for punchy response.',
    learn:
      'A wider, flatter stator (2306) reacts quickly to the throttle, so it feels punchy. 2450KV on a 4-cell battery gives about the same top speed as 1750KV on 6 cells, because speed depends on KV times voltage.',
  },
  {
    id: '2207-2750',
    bellColor: 0x8e98a6,
    name: '2207 · 2750KV',
    stator: [22, 7],
    kv: 2750,
    weightG: 31,
    cells: [4, 4],
    maxThrustKg: 1.45,
    maxCurrentA: 38,
    short: 'Made for 4S. Light and fast for racing.',
    learn:
      'A high KV turns the prop quickly, so it is good for speed. But a high KV motor also draws a lot of current, so it needs a battery that can deliver it. Never put it on a battery with more cells than it was made for.',
  },
]

export const PROPS = [
  {
    id: 'tri-5146',
    name: '5.1 x 4.6 tri-blade',
    blades: 3,
    diameterIn: 5.1,
    pitchIn: 4.6,
    weightG: 4.3,
    thrustFactor: 1.0,
    currentFactor: 1.0,
    short: 'All-round freestyle prop.',
    learn:
      'Diameter is the width of the prop circle. Pitch is how far the prop would move forward in one turn, like a screw. More blades give more thrust and grip but use more power. Three blades is the freestyle standard.',
  },
  {
    id: 'tri-5040',
    name: '5.0 x 4.0 tri-blade',
    blades: 3,
    diameterIn: 5.0,
    pitchIn: 4.0,
    weightG: 4.1,
    thrustFactor: 0.9,
    currentFactor: 0.9,
    short: 'Lower pitch: smooth, efficient, longer flights.',
    learn:
      'A lower pitch pushes less air per turn, so the motor works less hard. You get smoother control and longer flight time, but a lower top speed.',
  },
  {
    id: 'bi-5050',
    name: '5.0 x 5.0 bi-blade',
    blades: 2,
    diameterIn: 5.0,
    pitchIn: 5.0,
    weightG: 3.2,
    thrustFactor: 0.88,
    currentFactor: 0.95,
    short: 'Two blades, high pitch: made for speed.',
    learn:
      'Two blades have less drag and a higher pitch, so the quad flies faster in a straight line. But there is less grip in the air, so it can feel less locked-in in tight freestyle moves.',
  },
]

const BATTERY_LEARN =
  'The S number is how many cells are in a row, and each cell is about 3.7 V. So 4S is about 14.8 V and 6S about 22 V. mAh is how much charge it stores: more mAh means longer flights but more weight. C is how fast it can safely give its energy away: max current is C times the capacity in amp-hours.'

export const BATTERIES = [
  { id: '4s-1300', name: '4S · 1300 mAh', cells: 4, mah: 1300, c: 100, weightG: 155, size: [75, 35, 28], short: 'Light, short flights.' },
  { id: '4s-1500', name: '4S · 1500 mAh', cells: 4, mah: 1500, c: 100, weightG: 180, size: [80, 35, 30], short: 'A good 4S size.' },
  { id: '6s-1100', name: '6S · 1100 mAh', cells: 6, mah: 1100, c: 120, weightG: 185, size: [85, 35, 29], short: 'High voltage, light.' },
  { id: '6s-1700', name: '6S · 1700 mAh', cells: 6, mah: 1700, c: 100, weightG: 255, size: [92, 38, 33], short: 'Long flights, heavier.' },
].map((b) => ({ ...b, learn: BATTERY_LEARN }))

export const VIDEOS = [
  {
    id: 'analog',
    name: 'Analog micro camera',
    weightG: 13,
    short: 'Light, low delay, standard picture.',
    learn:
      'An analog FPV camera and video transmitter weigh almost nothing and show the picture with very little delay. The picture is lower quality than digital.',
  },
  {
    id: 'digital',
    name: 'Digital HD system',
    weightG: 38,
    short: 'Clear picture to your goggles.',
    learn:
      'A digital air unit sends a sharp high definition picture to the goggles. It is heavier and hotter than analog, so it needs good airflow.',
  },
  {
    id: 'digital-action',
    name: 'Digital HD + action camera',
    weightG: 93,
    short: 'Clear picture plus a camera for recording.',
    actionCam: true,
    learn:
      'An action camera on top records smooth video to share, but it adds about 55 g. That extra weight lowers the thrust-to-weight ratio and the flight time.',
  },
]

export const COLORS = [
  { id: 'yellow', name: 'Yellow', hex: 0xf2b705 },
  { id: 'orange', name: 'Orange', hex: 0xff6a1a },
  { id: 'blue', name: 'Blue', hex: 0x2f86d6 },
  { id: 'green', name: 'Green', hex: 0x35b24a },
  { id: 'pink', name: 'Pink', hex: 0xf0508c },
  { id: 'black', name: 'Black', hex: 0x1d1f23 },
].map((c) => ({ ...c, weightG: 0, learn: 'The camera mount, antenna mounts and arm stripes are 3D printed in TPU, a flexible plastic. It protects the camera in a crash, and it comes in any colour.' }))

export const CATEGORIES = [
  { id: 'motor', label: 'Motors', options: MOTORS },
  { id: 'prop', label: 'Propellers', options: PROPS },
  { id: 'battery', label: 'Battery', options: BATTERIES },
  { id: 'video', label: 'Video', options: VIDEOS },
  { id: 'color', label: 'Print colour', options: COLORS },
]

export const DEFAULT_BUILD = {
  motor: '2207-1750',
  prop: 'tri-5146',
  battery: '6s-1700',
  video: 'analog',
  color: 'yellow',
}

const byId = (list, id) => list.find((item) => item.id === id)

// Turns ids (from a link or saved settings) into the parts, falling back to the default for any id that is unknown.
export function resolveBuild(build = {}) {
  const pick = (category, list) => byId(list, build[category]) || byId(list, DEFAULT_BUILD[category])
  return {
    frame: FRAME,
    motor: pick('motor', MOTORS),
    prop: pick('prop', PROPS),
    battery: pick('battery', BATTERIES),
    video: pick('video', VIDEOS),
    color: pick('color', COLORS),
  }
}
