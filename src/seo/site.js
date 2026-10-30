// What search engines are told about the site and each public page. Plain data, so the build step (Node) and the site share it.
import { GUIDES } from '../data/guides.js'

export const SITE = {
  url: 'https://www.egirerobotics.com',
  name: 'EGIRE Robotics',
  alternateNames: ['EGIRE', 'Egire Robotics India', 'EGIRE ROBOTICS FPV Drones'],
  tagline: 'FPV drone, AI and robotics training in India',
  email: 'contact@egirerobotics.com',
  phone: '+918500126104',
  whatsapp: '+919110566354',
  logo: '/images/logo-egire-robotics.png',
  ogImage: '/og-image.png',
  language: 'en-IN',
}

const guideRoutes = GUIDES.map((g) => ({
  path: `/guides/${g.slug}`,
  title: `${g.title} | EGIRE Robotics`,
  description: g.description,
  h1: g.title,
  priority: 0.8,
  type: 'article',
  guide: g,
}))

// Every public page. `body` is the text a crawler reads before the page's own scripts run.
export const ROUTES = [
  {
    path: '/',
    title: 'EGIRE Robotics | FPV Drone Training, Drone Building and Robotics in India',
    description: 'EGIRE Robotics is an Indian FPV drone, AI and robotics training company: FPV piloting workshops, drone building, simulators and a 90-day course for students and colleges across India.',
    h1: 'EGIRE Robotics: FPV drone, AI and robotics training in India',
    priority: 1.0,
    body: [
      'EGIRE Robotics teaches FPV drone piloting, drone building, AI and robotics to learners from age 5 to 45, with workshops at engineering colleges and universities across India.',
      'Our programs start in a simulator and move to real FPV flying, then cover building and tuning drones, racing practice, cinematography, agriculture drones, 3D mapping, LiDAR and GIS, and AI and computer vision.',
      'We also supply drone spares and teach drone, AI and robotics skills with ROS 2, Python and embedded systems.',
    ],
    links: ['/workshops', '/guides', '/enquire', '/about'],
  },
  {
    path: '/workshops',
    title: 'College Drone, AI and Robotics Workshops in India | EGIRE Robotics',
    description: 'Book an FPV drone, AI and robotics workshop for your college in India: 7-day piloting workshop, drone building, simulator training, certificates and a 90-day course. Fees from Rs 7,999.',
    h1: 'Drone, AI and robotics workshops for colleges in India',
    priority: 0.95,
    body: [
      'EGIRE Robotics runs hands-on workshops for engineering colleges, universities and schools. A 7-day FPV piloting workshop starts in the simulator and moves to real flying, with certificates for each skill grade.',
      'Workshops cover FPV piloting, building a drone from scratch, drone racing practice, cinematography, agriculture drones, 3D mapping and AI.',
      'Fees start from Rs 7,999 per person. Send an enquiry to arrange a workshop at your college.',
    ],
    links: ['/enquire', '/guides/fpv-drones-india', '/gallery'],
  },
  {
    path: '/about',
    title: 'About EGIRE Robotics | Drone and Robotics Training Team in India',
    description: 'Meet the team behind EGIRE Robotics: FPV pilots, drone builders and robotics engineers training students and professionals across India.',
    h1: 'About EGIRE Robotics',
    priority: 0.8,
    body: ['EGIRE Robotics is a drone, AI and robotics training company in India. Our trainers fly, build and tune FPV drones and teach students from age 5 to 45.'],
    links: ['/workshops', '/enquire'],
  },
  {
    path: '/research',
    title: 'Drone and Robotics Research | EGIRE Robotics',
    description: 'Research and engineering notes from EGIRE Robotics on FPV drones, flight control, computer vision and robotics.',
    h1: 'Research from EGIRE Robotics',
    priority: 0.7,
    body: ['Notes and projects from the EGIRE Robotics team on FPV drones, flight control, computer vision and robotics.'],
    links: ['/blog', '/workshops'],
  },
  {
    path: '/gallery',
    title: 'Drone Workshop Photos and FPV Flying Gallery | EGIRE Robotics',
    description: 'Photos from EGIRE Robotics drone workshops, FPV flying sessions and college events across India.',
    h1: 'Gallery: drone workshops and FPV flying',
    priority: 0.7,
    body: ['Photos from our FPV drone workshops, flying sessions and events at colleges.'],
    links: ['/workshops'],
  },
  {
    path: '/blog',
    title: 'FPV Drone, AI and Robotics Blog | EGIRE Robotics',
    description: 'Articles on FPV drones, drone building, AI and robotics training from the EGIRE Robotics team.',
    h1: 'The EGIRE Robotics blog',
    priority: 0.7,
    body: ['Articles on FPV drones, drone building, AI and robotics from the EGIRE Robotics team.'],
    links: ['/guides'],
  },
  {
    path: '/enquire',
    title: 'Enquire: Book a Drone Workshop or Demo | EGIRE Robotics',
    description: 'Register for an FPV drone workshop, book a demo session or ask about bringing EGIRE Robotics to your college in India.',
    h1: 'Enquire about a drone workshop',
    priority: 0.8,
    body: ['Send an enquiry to register for a workshop, book a demo session or arrange a workshop at your college. You can also call, WhatsApp or email us.'],
    links: ['/workshops'],
  },
  {
    path: '/guides',
    title: 'Drone Guides for India: FPV, DJI, Rules and Building | EGIRE Robotics',
    description: 'Plain-language drone guides for India: FPV drones, DJI vs FPV, drone rules and how to build an FPV drone.',
    h1: 'Drone guides for India',
    priority: 0.9,
    body: ['Guides on FPV drones, the difference between DJI-style camera drones and FPV drones, the drone rules in India and how to build an FPV drone.'],
    links: GUIDES.map((g) => `/guides/${g.slug}`),
    type: 'collection',
  },
  ...guideRoutes,
  // Academy pages: a signed-in member sees the full lesson; a search engine reads this summary.
  { path: '/intro', title: 'Intro to Drones: How a Drone Flies | EGIRE Robotics Academy', description: 'Start from zero: what a drone is, how it flies and what every part does. Free with sign-in.', h1: 'Intro to Drones', priority: 0.6, body: ['Start from zero: how a quadcopter flies and what every part does.'], links: ['/guides/fpv-drones-india'] },
  { path: '/physics', title: 'Drone Physics: Thrust, Drag and Lift | EGIRE Robotics Academy', description: 'The forces behind every flight, taught with live, interactive demonstrations. Free with sign-in.', h1: 'Drone Physics', priority: 0.6, body: ['Thrust, weight, drag and lift, and why a drone tilts to move.'], links: [] },
  { path: '/fpv-piloting', title: 'FPV Piloting Course Online: Angle, Acro and 3D Modes | EGIRE Robotics', description: 'Learn FPV piloting with 3D lessons: flight modes, stick moves, loops, flips and race turns. Free with sign-in.', h1: 'FPV Piloting', priority: 0.8, body: ['Learn Angle, Acro and 3D modes, stick combinations, loops, flips and race moves on a 3D drone.'], links: ['/guides/fpv-drones-india'] },
  { path: '/pid-tuning', title: 'PID Tuning for FPV Drones: Learn Betaflight Tuning | EGIRE Robotics', description: 'Understand P, I and D and tune a drone in a safe simulation, with a Betaflight guide. Free with sign-in.', h1: 'PID Tuning', priority: 0.7, body: ['What each PID gain does, a tuning lab with live charts and a Betaflight guide.'], links: [] },
  { path: '/drone-hardware', title: 'Drone Hardware Explained: Frames, Motors, ESC and Radio | EGIRE Robotics', description: 'Why drone frames are carbon, why drones shake, why 6S cooks 4S motors and how a radio works, with 3D animations. Free with sign-in.', h1: 'Drone Hardware', priority: 0.7, body: ['Frames, vibration, power and radio explained with 3D animations.'], links: ['/guides/build-fpv-drone-india'] },
  { path: '/drone-lab/how-it-works', title: 'How a Drone Works: Interactive 3D Drone Lab | EGIRE Robotics', description: 'See how a drone works inside, in 2D and 3D. Free with sign-in.', h1: 'How a drone works', priority: 0.6, body: ['An interactive look inside a drone.'], links: [] },
  { path: '/drone-lab/configurator', title: 'FPV Drone Configurator: Build and Compare Drone Setups | EGIRE Robotics', description: 'Configure a drone and see live performance charts. Free with sign-in.', h1: 'Drone configurator', priority: 0.6, body: ['Choose parts and see thrust, weight and flight time.'], links: ['/guides/build-fpv-drone-india'] },
  { path: '/wiring-lab/lessons', title: 'FPV Drone Wiring Lessons and Practice Builder | EGIRE Robotics', description: 'Learn how every wire connects on an FPV drone and practise on a builder that checks your work. Free with sign-in.', h1: 'Wiring Lab', priority: 0.6, body: ['Wiring lessons for each board and a practice builder.'], links: ['/guides/build-fpv-drone-india'] },
  { path: '/catalog', title: 'FPV Drone Parts Catalog: Motors, Frames, Cameras | EGIRE Robotics', description: 'Compare FPV drone motors, frames, cameras and more with real specifications. Free with sign-in.', h1: 'Parts catalog', priority: 0.6, body: ['Real specifications for FPV drone parts.'], links: [] },
  { path: '/training', title: 'Drone Courses and Programs in India | EGIRE Robotics', description: 'EGIRE Robotics courses and programs: FPV piloting, drone building, AI and robotics.', h1: 'Programs', priority: 0.7, body: ['Courses for students and colleges: what each covers and who it is for.'], links: ['/workshops'] },
]

export const faqs = (route) => route.guide?.faq ?? []
