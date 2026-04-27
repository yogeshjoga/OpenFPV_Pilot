// ================================
// OpenFPV Pilot — Product Catalog Data
// ================================

export const PRODUCTS = [
  {
    id: 'hx5-frame',
    name: 'HX5 Carbon Frame',
    category: 'frames',
    price: 7499,
    originalPrice: 9999,
    rating: 4.8,
    reviews: 142,
    badge: 'Best Seller',
    inStock: true,
    modelPath: '/models/frame_hx5.glb', // placeholder path
    thumbnail: '/images/Frame.png',
    images: ['/images/Frame.png', '/images/Frame.png', '/images/Frame.png', '/images/Frame.png'],
    aboutThisItem: [
      'Engineered with premium 3K Toray Carbon for maximum durability against concrete.',
      'Unibody bottom plate ensures extreme stiffness during high-G maneuvers (over 10G).',
      'Includes custom TPU mounts for GoPro, naked cameras, and FPV antennas.',
      'Easy maintenance: arms can be replaced with just two screws in under a minute.',
    ],
    reviewsList: [
      { id: 1, user: 'Alex P.', rating: 5, date: 'October 12, 2024', title: 'Absolute tank of a frame', comment: 'Smashed it into concrete at 60mph and only broke a prop. Amazing durability!' },
      { id: 2, user: 'John M.', rating: 4, date: 'August 22, 2024', title: 'Great but heavy', comment: 'Very stiff frame, flies great, but definitely on the heavier side for tight racing.' },
      { id: 3, user: 'TechFPV', rating: 5, date: 'July 5, 2024', title: 'Best freestyle frame on the market', comment: 'The TPU prints are high quality. Highly recommended for bando bashing and casual flying alike.' },
    ],
    specs: {
      'Wheelbase': '215mm',
      'Weight': '98g',
      'Material': '3K Toray Carbon',
      'Motor Mount': '16x16 / 20x20',
      'Top Plate': '2mm',
      'Bottom Plate': '4mm',
    },
    description:
      'The HX5 is our flagship 5-inch freestyle frame — ultra-stiff, ultra-light, built for maximum impact resistance. Designed by professional FPV pilots for aggressive flying.',
    features: [
      '360° motor protection',
      'Unibody bottom plate',
      'GoPro + naked cam compatible',
      'TPU mount included',
    ],
  },
  {
    id: 'nexus-2507-motor',
    name: 'Nexus 2507 Motor',
    category: 'motors',
    price: 1999,
    originalPrice: null,
    rating: 4.9,
    reviews: 318,
    badge: 'New',
    inStock: true,
    modelPath: '/models/motor_nexus.glb',
    thumbnail: '/images/Motor.png',
    images: ['/images/Motor.png', '/images/Motor.png', '/images/Motor.png'],
    aboutThisItem: [
      'Massive 2507 stator size provides extreme torque for 5-inch heavy freestyle builds or 7-inch long range platforms.',
      'Built with ultra-high-temperature N52H curved magnets for sustained efficiency.',
      'Hollow titanium 5mm shaft for maximum strength-to-weight ratio.',
      'IPX4 moisture resistance protects windings from morning dew or light snow.',
      'Premium Japanese NSK bearings ensure silky smooth operation over hundreds of packs.'
    ],
    reviewsList: [
      { id: 1, user: 'RacerBoy99', rating: 5, date: 'November 2, 2024', title: 'Incredible punch out', comment: 'These motors have so much torque. They spin 5.1 inch props like absolutely nothing.' },
      { id: 2, user: 'CinematicFlyer', rating: 5, date: 'September 15, 2024', title: 'Silky smooth', comment: 'Zero vibrations out of the box. Filters on Betaflight can be pushed very low without any hot motors.' },
    ],
    specs: {
      'Stator': '25x7mm',
      'KV (3S)': '2450KV',
      'KV (4S)': '1900KV',
      'Weight': '30.2g',
      'Shaft': '3mm',
      'Mounting': 'M3 x 16x16',
    },
    description:
      'Precision-wound for maximum thrust-to-weight ratio. The Nexus 2507 delivers crisp response and cool running temps even during sustained full-throttle bursts.',
    features: [
      'N52H magnets',
      'Multistranded wire leads',
      'Anti-loosening nut included',
      'IPX4 moisture resistant',
    ],
  },
  {
    id: 'fc-alpha-f7',
    name: 'Alpha F7 Flight Controller',
    category: 'flight-controllers',
    price: 5499,
    originalPrice: 6999,
    rating: 4.7,
    reviews: 87,
    badge: 'Sale',
    inStock: true,
    modelPath: '/models/fc_alpha.glb',
    thumbnail: '/textures/fc_alpha_thumb.jpg',
    images: [],
    specs: {
      'MCU': 'STM32F745',
      'Gyro': 'ICM-42688P',
      'Barometer': 'BMP388',
      'OSD': 'AT7456E',
      'Blackbox': '16MB Flash',
      'Stack': '30.5x30.5mm',
    },
    description:
      'The Alpha F7 is our flagship flight controller featuring the latest ICM-42688P gyro for silky-smooth filtering and precise flight characteristics in any conditions.',
    features: [
      'Betaflight / iNav compatible',
      'Integrated OSD',
      'USB-C connector',
      '8x motor outputs',
    ],
  },
  {
    id: 'raptor-cam',
    name: 'Raptor FPV Camera',
    category: 'cameras',
    price: 3699,
    originalPrice: null,
    rating: 4.6,
    reviews: 203,
    badge: null,
    inStock: true,
    modelPath: '/models/camera_raptor.glb',
    thumbnail: '/textures/cam_raptor_thumb.jpg',
    images: [],
    specs: {
      'Sensor': '1/2" CMOS',
      'Resolution': '1200TVL',
      'FOV': '165°',
      'Latency': '<2ms',
      'Voltage': '3.3–36V',
      'Weight': '18g',
    },
    description:
      'The Raptor delivers crystal-clear, ultra-low-latency FPV imagery with exceptional dynamic range for flying in high-contrast lighting conditions.',
    features: [
      'Wide dynamic range',
      'OSD support',
      'Micro / Nano form factor',
      'Night mode capable',
    ],
  },
  {
    id: 'helix-goggles-v2',
    name: 'Helix FPV Goggles V2',
    category: 'goggles',
    price: 24999,
    originalPrice: 28999,
    rating: 4.9,
    reviews: 521,
    badge: 'Top Rated',
    inStock: false,
    modelPath: '/models/goggles_helix.glb',
    thumbnail: '/textures/goggles_helix_thumb.jpg',
    images: [],
    specs: {
      'Display': 'Dual 1080p OLED',
      'FOV': '46°',
      'Latency': '<18ms',
      'DVR': '1080p 60fps',
      'Battery': '2S–6S',
      'Weight': '320g',
    },
    description:
      'The Helix V2 goggles deliver an immersive flying experience with dual OLED panels, built-in DVR, and a modular receiver bay compatible with all major video systems.',
    features: [
      'Dual OLED displays',
      'Head tracking (optional)',
      'Built-in DVR',
      'HDMI input',
    ],
  },
  {
    id: 'storm-5045-props',
    name: 'Storm 5045 Propellers',
    category: 'props',
    price: 899,
    originalPrice: null,
    rating: 4.5,
    reviews: 412,
    badge: null,
    inStock: true,
    modelPath: '/models/props_storm.glb',
    thumbnail: '/textures/props_storm_thumb.jpg',
    images: [],
    specs: {
      'Size': '5 inch',
      'Pitch': '4.5',
      'Blades': 'Tri-blade',
      'Hub': 'T-mount',
      'Weight': '4.8g each',
      'Material': 'PC + Glass Fiber',
    },
    description:
      'Engineered for freestyle pilots who demand maximum efficiency and durability. The Storm 5045 provides excellent punch-out performance and smooth throttle response.',
    features: [
      'CNC balanced',
      'Impact resistant',
      'Multi-pack (8 props)',
      'Works with 2207–2306 motors',
    ],
  },
]

export const getProductById = (id) => PRODUCTS.find((p) => p.id === id)

export const getProductsByCategory = (category) => {
  if (category === 'all') return PRODUCTS
  return PRODUCTS.filter((p) => p.category === category)
}
