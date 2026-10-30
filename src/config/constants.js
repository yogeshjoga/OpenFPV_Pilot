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
    // grouped, so the menu opens as a few short columns instead of one tall list
    subLinks: [
      { group: 'Learn', label: 'Intro to Drones', path: '/intro' },
      { group: 'Learn', label: 'Physics', path: '/physics', minLevel: 3 },
      { group: 'Learn', label: 'FPV Piloting', path: '/fpv-piloting' },
      { group: 'Learn', label: 'PID Tuning', path: '/pid-tuning' },
      { group: 'Learn', label: 'Drone Hardware', path: '/drone-hardware', hint: 'Frame, vibration, power, radio' },
      { group: 'Practise', label: 'Drone Lab', path: '/drone-lab', hint: 'How it works, configurator' },
      { group: 'Practise', label: 'Wiring Lab', path: '/wiring-lab', hint: 'Lessons, practice builder' },
      { group: 'Explore', label: 'Catalog', path: '/catalog' },
      { group: 'Explore', label: 'Programs', path: '/training' },
    ],
    minLevel: 1 
  }] : []),
  { label: 'Gallery', path: '/gallery' },
  { label: 'FPV Quote', path: '/builder' },
  { label: 'Blog', path: '/blog' },
  { label: 'Guides', path: '/guides' },
  { label: 'Research', path: '/research' },
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

/** A WhatsApp chat link with the message already typed. It works on computers (WhatsApp Web or the app) and phones. */
export const whatsappHref = (message) => `https://wa.me/919110566354?text=${encodeURIComponent(message)}`

export const WHATSAPP = {
  display: '+91 9110566354',
  href: whatsappHref('Hello EGIRE Robotics, I would like to know more about your workshops.'),
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
