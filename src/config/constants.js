export const APP_NAME = 'EGIREROBOTICS'
export const APP_TAGLINE = 'Fly Beyond Limits'
export const APP_DESCRIPTION =
  'A premium learning platform to build, tune, and fly FPV drones, from zero to first freestyle flight.'

import navConfig from './navConfig.json'


export const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Workshops', path: '/workshops' },
  ...(navConfig.showAcademyNav ? [{ 
    label: 'Academy', 
    subLinks: [
      { label: 'Intro to Drones', path: '/intro' },
      { label: 'Catalog', path: '/catalog' },
      { label: 'Programs', path: '/training' },
      { label: 'Physics', path: '/physics', minLevel: 3 },
      { label: 'PID Tuning', path: '/pid-tuning' },
      { label: 'Simulator', path: '/simulator' },
      { label: '3D Assembly', path: '/assembly-3d' },
      { label: 'Presentations', path: '/presentation' },
    ],
    minLevel: 1 
  }] : []),
  { label: 'Gallery', path: '/gallery' },
  { label: 'FPV Quote', path: '/builder' },
  { label: 'Blog', path: '/blog' },
  { label: 'About', path: '/about' },
  { label: 'Enquire', path: '/enquire' },
  { label: 'Login', path: '/login' },
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

// Official profile links. An empty one is shown in the footer as "soon" and is not clickable, so visitors are
// never sent to a generic home page. Paste the real address here to switch it on.
export const SOCIAL_LINKS = {
  youtube: '',
  instagram: '',
  facebook: '',
  linkedin: '',
  discord: '',
}

export const WHATSAPP = {
  display: '+91 9110566354',
  href: `https://wa.me/919110566354?text=${encodeURIComponent('Hello EGIRE Robotics, I would like to know more about your workshops.')}`,
}

// Starting prices shown on the site
export const FEES = { workshopFrom: '₹7,999', demo: '₹2,999' }

export const CONTACT_EMAIL = 'contact@egirerobotics.com'
export const SUPPORT_EMAIL = 'support@egirerobotics.com'
export const CONTACT_PHONE = { display: '+91 8500126104', href: 'tel:+918500126104' }

// Three.js / R3F scene defaults
export const SCENE_DEFAULTS = {
  cameraFov: 50,
  cameraPosition: [0, 0, 5],
  ambientIntensity: 0.5,
  pointLightIntensity: 2,
}
