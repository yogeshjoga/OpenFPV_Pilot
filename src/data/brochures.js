// The programme brochures students can download and read themselves. The PDFs are in public/downloads and the covers in public/images/brochures.
// Fees are left out of the words on the page on purpose: they are in the brochure itself, so there is one place to update when they change.
export const BROCHURES = [
  {
    id: 'engineering',
    title: 'FPV Drone Engineering Programme',
    kicker: 'For engineering students and graduates',
    summary: 'Fifty days from your first solder joint to an FPV drone you built, tested and flew yourself: five phases, five hands-on labs and a 100-page lab textbook.',
    facts: ['50 days', '5 hands-on labs', '2 drones built'],
    file: '/downloads/egirerobotics-engineering-brochure.pdf',
    fileName: 'EgireRobotics-FPV-Drone-Engineering-Brochure.pdf',
    size: '1.6 MB',
    cover: '/images/brochures/engineering.webp',
    coverAlt: 'Cover of the FPV Drone Engineering brochure: Build it, fly it, fix it',
  },
  {
    id: 'internship',
    title: 'Online Internship: Drone Technology and Pilot Training',
    kicker: 'Learn online from anywhere',
    summary: 'A 45-day guided online programme on how drones work, from components and flight mechanics to sensors, simulator piloting and the rules. All online and simulator based, with a completion certificate.',
    facts: ['45 days', '100% online', '7 modules'],
    file: '/downloads/egirerobotics-online-internship-brochure.pdf',
    fileName: 'EgireRobotics-Online-Internship-Brochure.pdf',
    size: '0.8 MB',
    cover: '/images/brochures/internship.webp',
    coverAlt: 'Cover of the Online Internship brochure: Understand the drone, learn to pilot it',
  },
]
