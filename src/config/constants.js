export const APP_NAME = 'EGIREROBOTICS'
export const APP_TAGLINE = 'Fly Beyond Limits'
export const APP_DESCRIPTION =
  'A premium learning platform to build, tune, and fly FPV drones, from zero to first freestyle flight.'

export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Catalog', path: '/catalog' },
  { label: 'Workshops', path: '/workshops' },
  { 
    label: 'Academy', 
    subLinks: [
      { label: 'Intro to Drones', path: '/intro' },
      { label: 'Programs', path: '/training' },
      { label: 'Physics', path: '/physics', minLevel: 3 },
      { label: 'Simulator', path: '/simulator' },
      { label: '3D Assembly', path: '/assembly-3d' },
    ],
    minLevel: 2 
  },
  { 
    label: 'Exams', 
    subLinks: [
      { label: 'Certificated Exam', path: '/exams/all' },
      { label: 'ESC', path: '/exams/esc' },
      { label: 'Motors', path: '/exams/motor' },
      { label: 'Flight Controller', path: '/exams/fc' },
      { label: 'Propellers', path: '/exams/propeller' },
      { label: 'VTX / Camera', path: '/exams/vtx' },
      { label: 'Piloting', path: '/exams/piloting' },
      { label: 'Building', path: '/exams/build' },
    ],
    minLevel: 1 
  },
  { label: 'Gallery', path: '/gallery' },
  { label: 'FPV Quote', path: '/builder' },
  { label: 'Blog', path: '/blog' },
  { label: 'About', path: '/about' },
]


export const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'frames', label: 'Frames' },
  { id: 'motors', label: 'Motors' },
  { id: 'flight-controllers', label: 'Flight Controllers' },
  { id: 'cameras', label: 'Cameras' },
  { id: 'props', label: 'Propellers' },
  { id: 'goggles', label: 'Goggles' },
]

export const SOCIAL_LINKS = {
  youtube: 'https://youtube.com',
  instagram: 'https://instagram.com',
  discord: 'https://discord.gg',
}

export const CONTACT_EMAIL = 'hello@EGIREROBOTICSpilot.com'

// Three.js / R3F scene defaults
export const SCENE_DEFAULTS = {
  cameraFov: 50,
  cameraPosition: [0, 0, 5],
  ambientIntensity: 0.5,
  pointLightIntensity: 2,
}
