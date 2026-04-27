// ================================
// FPV Parts Encyclopedia Data
// Educational reference for students
// ================================

export const PART_CATEGORIES = [
  {
    id: 'motors',
    label: 'Motors',
    icon: '⚙️',
    color: '#00d4ff',
    image: '/images/Motor.png',
    tagline: 'The muscles of your drone',
    intro:
      'A motor converts electrical energy into rotational force (torque) that spins the propellers to generate lift. Understanding motors is fundamental to building and tuning any FPV drone.',
    sections: [
      {
        title: 'Types of Motors',
        type: 'cards',
        items: [
          {
            name: 'Brushed Motor',
            image: '/images/Motor.png',
            badge: 'Legacy',
            badgeColor: '#f59e0b',
            icon: '🔧',
            desc: 'Uses carbon brushes to deliver current to the rotating coil. Simple and cheap but wears out quickly due to friction. Found in toy-grade drones only.',
            specs: ['Low efficiency: ~75%', 'Short lifespan: ~100h', 'Self-contained driver', 'Typical: 8520, 716'],
            use: 'Micro toy drones only — not used in serious FPV builds.',
          },
          {
            name: 'Brushless Outrunner',
            badge: 'Standard',
            badgeColor: '#10b981',
            icon: '⚡',
            desc: 'The outer bell (case) rotates around the fixed inner stator. Produces massive torque at low RPM. This is the standard for all modern FPV drones.',
            specs: ['Efficiency: ~90–95%', 'Long lifespan: 300+h', 'Requires ESC', 'Typical: 2306, 2207, 1404'],
            use: 'Every serious FPV build — freestyle, racing, cinematic.',
          },
          {
            name: 'Brushless Inrunner',
            badge: 'Specialty',
            badgeColor: '#7c3aed',
            icon: '🎯',
            desc: 'Inner rotor spins inside a fixed outer stator. High RPM, low torque. Needs a gearbox to drive propellers effectively. Rare in FPV.',
            specs: ['Very high RPM', 'Low torque output', 'Needs gearbox', 'Common in RC cars'],
            use: 'RC cars, fixed-wing. Rarely used in FPV multirotors.',
          },
        ],
      },
      {
        title: 'Understanding KV Rating',
        type: 'explainer',
        content:
          'KV is the number of RPM per volt with no load. A 2400KV motor on a 4S battery (14.8V) spins at ~35,520 RPM unloaded. Higher KV = faster spin but less torque. Lower KV = slower spin but more torque for larger props.',
        table: {
          headers: ['KV Range', 'Best For', 'Typical Battery', 'Prop Size'],
          rows: [
            ['1400–1900 KV', 'Long range / 7" builds', '4S / 6S', '6"–7"'],
            ['1700–2100 KV', 'Cinematic 5" builds', '4S', '5"'],
            ['2200–2600 KV', 'Freestyle 5"', '4S', '5"'],
            ['2500–3000 KV', 'Racing 5"', '4S', '5" tri-blade'],
            ['3500–4500 KV', 'Micro / 3" builds', '3S–4S', '3"'],
            ['8000–25000 KV', 'Tiny whoop / 2"', '1S–2S', '31–40mm'],
          ],
        },
      },
      {
        title: 'Stator Size Explained',
        type: 'explainer',
        content:
          'Motor stator size is written as XXYY — where XX is the stator diameter and YY is the stator height in mm. Wider stators = more torque, taller stators = more RPM.',
        table: {
          headers: ['Stator Size', 'Class', 'Typical Use'],
          rows: [
            ['0802', 'Tiny Whoop', '1S micro builds (65–75mm)'],
            ['1102–1105', 'Nano', '2S micro / toothpick (100–125mm)'],
            ['1404–1507', 'Toothpick', '3" lightweight builds'],
            ['2004–2205', 'Mini 5"', 'Lighter 5" builds'],
            ['2306–2308', '5" Standard', 'Freestyle and racing 5"'],
            ['2806–2812', '6"–7"', 'Long range, efficiency builds'],
          ],
        },
      },
      {
        title: 'How to Choose a Motor',
        type: 'tips',
        items: [
          { icon: '📏', tip: 'Match motor size to frame: 5" frame → 2206–2308 stator' },
          { icon: '🔋', tip: 'Match KV to battery: 4S → 2300–2500 KV, 6S → 1700–1900 KV' },
          { icon: '⚖️', tip: 'Freestyle: prioritize torque (lower KV, taller stator). Racing: prioritize speed (higher KV).' },
          { icon: '🏁', tip: 'Check motor weight — target 28–35g per motor for 5" freestyle' },
          { icon: '💡', tip: 'Trusted brands: T-Motor, Brotherhobby, Xing, Emax, iFlight Xing-E' },
        ],
      },
    ],
  },
  {
    id: 'frames',
    label: 'Frames',
    icon: '🏗️',
    image: '/images/Frame.png',
    color: '#7c3aed',
    tagline: 'The skeleton of your build',
    intro:
      'The frame holds all components together and defines the drone\'s size, weight, durability, and flying style. Frame geometry directly affects flight characteristics.',
    sections: [
      {
        title: 'Frame Geometry Types',
        type: 'cards',
        image: '/images/Frame.png',
        items: [
          {
            name: 'True-X',
            badge: 'Racing',
            badgeColor: '#ef4444',
            icon: '✕',
            desc: 'All four arms equally spaced — front motors directly in FPV camera view. Symmetrical handling. Fast and precise.',
            specs: ['Symmetrical arm spacing', 'Props slightly in view', 'Stiff and lightweight', 'Example: Armattan Marmotte'],
            use: 'Racing — maximum speed and consistency.',
          },
          {
            name: 'Stretched-X',
            badge: 'Freestyle',
            badgeColor: '#10b981',
            icon: '⟷',
            desc: 'Rear arms spread wider than front. Props completely out of camera view. More rotation authority for tricks. The most popular freestyle geometry.',
            specs: ['Clean FPV view', 'Better yaw authority', 'Slightly wider stance', 'Example: ImpulseRC Apex, Armattan Chameleon'],
            use: 'Freestyle — best for tricks, flows, and video quality.',
          },
          {
            name: 'Deadcat',
            badge: 'Cinematic',
            badgeColor: '#0095b8',
            icon: '🎬',
            desc: 'Front arms angled forward aggressively to push props out of the camera frame entirely. Optimized for clean footage.',
            specs: ['Completely prop-free view', 'Usually heavier', 'Carries HD cameras', 'Example: GepRC Crocodile'],
            use: 'Cinematic FPV — filming with GoPro or Insta360.',
          },
          {
            name: 'Cinewhoop',
            badge: 'Indoor/Safe',
            badgeColor: '#f59e0b',
            icon: '🛡️',
            desc: 'Ducted propeller guards (shrouds) protect props and people. Flies indoors safely. Carries an HD action cam.',
            specs: ['Prop guards/ducts', 'Very stable flight', 'Heavier and slower', 'Example: DJI Avata style, GepRC Cinelog'],
            use: 'Indoor cinematics, events, near people.',
          },
          {
            name: 'Toothpick / Longrange',
            badge: 'Efficiency',
            badgeColor: '#6d28d9',
            icon: '📡',
            desc: 'Ultra-light frame running larger props (3.5"–7") on efficient lower-KV motors. Flies for 20–40+ minutes on one battery.',
            specs: ['Very lightweight', 'Large prop clearance', 'Low battery consumption', 'Example: BetaFPV Performer, GEPRC Mark4 7"'],
            use: 'Long range cruising, aerial surveys, cinematic flights.',
          },
          {
            name: 'Tiny Whoop',
            badge: 'Beginner',
            badgeColor: '#ec4899',
            icon: '🪲',
            desc: 'Tiny 65–75mm ducted micro drone. Extremely safe, flying indoors, great for learning FPV basics with minimal crash damage.',
            specs: ['65–75mm motor-to-motor', '1S battery', 'All-in-one FC/ESC', 'Example: BetaFPV Meteor65, Emax Tinyhawk'],
            use: 'Beginners — perfect first FPV drone for indoor practice.',
          },
        ],
      },
      {
        title: 'Frame Size Classes',
        type: 'explainer',
        content:
          'Frame size is defined by the maximum propeller size it can fit (measured diagonally motor-to-motor in mm). Larger frames = more stability and carry capacity. Smaller = more agile.',
        table: {
          headers: ['Class', 'Motor-to-Motor', 'Prop Size', 'Typical Weight', 'Best For'],
          rows: [
            ['Tiny Whoop', '65–75mm', '31–40mm', '25–40g', 'Beginner indoor flying'],
            ['Micro / Toothpick', '100–150mm', '2"–3"', '50–100g', 'Light outdoor / park flying'],
            ['3"', '~140–160mm', '3"', '100–150g', 'Proximity, indoor freestyle'],
            ['4"', '~180mm', '4"', '150–220g', 'Cinematic, ultralight'],
            ['5"', '~210–230mm', '5"', '250–320g', 'Freestyle & racing standard'],
            ['6"–7"', '~280–300mm', '6"–7"', '350–500g', 'Long range, efficiency'],
          ],
        },
      },
      {
        title: 'Frame Materials',
        type: 'cards',
        items: [
          { name: 'Carbon Fiber (3K Twill)', badge: 'Best', badgeColor: '#10b981', icon: '🖤', desc: 'Strongest strength-to-weight ratio of any frame material. Stiff, durable, and conductive. Standard for all mid-to-high-end FPV frames.', specs: ['3K / 5K weave', 'Thickness: 2mm / 3mm / 4mm', 'Conductive — can short electronics', '95% of performance builds'], use: 'Every serious FPV build.' },
          { name: 'Injection Molded Plastic', badge: 'Beginner', badgeColor: '#f59e0b', icon: '🟡', desc: 'Cheap, light, and non-conductive. Less stiff than carbon — flexes on hard crashes. Used in tiny whoops and beginner frames.', specs: ['Non-conductive', 'Impact-resistant', 'Less stiff', 'Common in micro drones'], use: 'Tiny whoops, beginner micro drones.' },
          { name: 'Aluminium Alloy', badge: 'Rare', badgeColor: '#94a3b8', icon: '⬜', desc: 'Strong but heavy. Used for standoffs, camera mounts, and motor mounts — rarely for the main frame arms.', specs: ['Heavy', 'Non-conductive', 'Often used for standoffs', 'Arms: uncommon'], use: 'Hardware accessories — standoffs, screws, mounts.' },
        ],
      },
      {
        title: 'How to Choose a Frame',
        type: 'tips',
        items: [
          { icon: '🎯', tip: 'Beginners: Start with a 5" Stretched-X or a Tiny Whoop — large community and parts availability.' },
          { icon: '🎬', tip: 'Want clean footage? Go Deadcat or Cinewhoop geometry.' },
          { icon: '🏎️', tip: 'Racing: choose True-X with stiff 3mm carbon arms. Lower drag profile.' },
          { icon: '🔧', tip: 'Check arm thickness — freestyle 5" should have 4–5mm arms. Thinner snaps on hard crashes.' },
          { icon: '📦', tip: 'Pick a frame with spare parts availability. Popular = easier to fix.' },
        ],
      },
    ],
  },
  {
    id: 'batteries',
    label: 'Batteries',
    icon: '🔋',
    image: '/images/Battery.png',
    color: '#10b981',
    tagline: 'The power source — choose wisely',
    intro:
      'FPV drones use Lithium Polymer (LiPo) batteries. Choosing the right battery affects flight time, power output, weight, and safety. Understanding battery specs is critical.',
    sections: [
      {
        title: 'Battery Chemistry Types',
        type: 'cards',
        items: [
          {
            name: 'LiPo (Lithium Polymer)',
            badge: 'Most Common',
            image: '/images/Battery.png',
            badgeColor: '#10b981',
            icon: '🔋',
            desc: 'The standard for FPV drones. High discharge rate, great power-to-weight ratio. Needs careful handling — can catch fire if punctured or overcharged.',
            specs: ['Nominal: 3.7V per cell', 'Fully charged: 4.2V/cell', 'Storage: 3.8V/cell', 'Cutoff: 3.3–3.5V/cell'],
            use: 'All FPV builds — racing, freestyle, cinematic.',
          },
          {
            name: 'LiHV (High Voltage LiPo)',
            badge: 'Performance',
            badgeColor: '#0095b8',
            icon: '⚡',
            desc: 'Charges to 4.35V per cell instead of 4.2V — gives ~5–8% more capacity and slightly better punch. Requires a LiHV-compatible charger.',
            specs: ['Charged: 4.35V/cell', 'Extra capacity burst', 'Needs LiHV charger', 'Same discharge as LiPo'],
            use: 'Racing and freestyle where every second of flight matters.',
          },
          {
            name: 'Li-Ion (Lithium Ion)',
            badge: 'Long Range',
            badgeColor: '#6d28d9',
            icon: '🟣',
            desc: '2–3x the energy density of LiPo by weight. Much longer flight times but low discharge rate — can\'t handle the power spikes of freestyle. Perfect for slow efficient long-range flights.',
            specs: ['Nominal: 3.6V/cell', 'Very high capacity', 'Low C-rating (5–10C)', '18650 / 21700 cells'],
            use: 'Long-range cruising (5+ km). NOT for racing/freestyle.',
          },
        ],
      },
      {
        title: 'Cell Count (S Rating)',
        type: 'explainer',
        content:
          'Each "S" is one LiPo cell (3.7V nominal). Cells are wired in series to increase voltage. Higher voltage = higher motor RPM and more power. Standard FPV drones use 4S or 6S.',
        table: {
          headers: ['Cell Count', 'Nominal Voltage', 'Fully Charged', 'Typical Use'],
          rows: [
            ['1S', '3.7V', '4.2V', 'Tiny whoops, micro drones'],
            ['2S', '7.4V', '8.4V', 'Micro / toothpick builds'],
            ['3S', '11.1V', '12.6V', 'Small freestyle, beginner 5"'],
            ['4S', '14.8V', '16.8V', '5" freestyle & racing standard'],
            ['5S', '18.5V', '21.0V', 'Rare — some racing setups'],
            ['6S', '22.2V', '25.2V', '5" high-performance, 6"–7"'],
          ],
        },
      },
      {
        title: 'Capacity (mAh)',
        type: 'explainer',
        content:
          'Milliamp-hours (mAh) defines how much charge the battery holds. More mAh = longer flight time, but also more weight. The goal is finding the sweet spot for your build weight.',
        table: {
          headers: ['Capacity', 'Typical Flight Time', 'Best Use'],
          rows: [
            ['300–450 mAh (4S)', '2–4 min', 'Racing — max punch, minimum weight'],
            ['650–850 mAh (4S)', '3–5 min', 'Freestyle — balance of punch & time'],
            ['1000–1100 mAh (4S)', '4–6 min', 'Standard freestyle / most popular'],
            ['1300–1500 mAh (4S)', '5–8 min', 'Cinematic, heavier builds'],
            ['2000–3000 mAh (4S)', '8–15 min', 'Long range / efficiency builds'],
          ],
        },
      },
      {
        title: 'C Rating (Discharge Rate)',
        type: 'explainer',
        content:
          'C-rating is the maximum continuous discharge rate as a multiple of capacity. A 1000mAh 100C battery can safely discharge 100A continuously. FPV drones pull very high current — always choose 70C or higher.',
        table: {
          headers: ['C Rating', 'Max Amps (1000mAh)', 'Notes'],
          rows: [
            ['30C', '30A', 'Too low for FPV — only long-range'],
            ['50C', '50A', 'Marginal — micro builds only'],
            ['70C–80C', '70–80A', 'Minimum for 5" freestyle'],
            ['100C+', '100A+', 'Racing and high-performance freestyle'],
            ['120C+ (Burst)', '120A+', 'Marketing — actual sustained rating ~0.7x'],
          ],
        },
      },
      {
        title: 'Connector Standards',
        type: 'cards',
        items: [
          { name: 'GNB27 / BT2.0', badge: '1S Micro', badgeColor: '#ec4899', icon: '🔌', desc: 'Ultra-tiny connector for 1S micro drones. Lower resistance than old PH2.0. Standard for modern tiny whoops.', specs: ['1S only', 'Very low resistance', 'Small & light', 'BetaFPV standard'], use: 'Tiny whoops and 1S micro builds.' },
          { name: 'XT30', badge: '2S–4S Small', badgeColor: '#f59e0b', icon: '🔶', desc: 'Compact connector rated to 30A (60A burst). Used on lightweight 3"–4" builds and toothpicks where weight matters.', specs: ['30A continuous', '60A burst', 'Gold plated', 'Common on 2S–4S'], use: '3" builds, toothpicks, ultralight 5".' },
          { name: 'XT60', badge: 'Standard', badgeColor: '#10b981', icon: '🔷', desc: 'The universal standard on 5" FPV drones and above. Rated 60A continuous, 180A burst. Gold-plated and extremely reliable.', specs: ['60A continuous', '180A burst', 'Universal standard', 'Every 5" build'], use: 'Standard 5" freestyle, racing, cinematic.' },
          { name: 'XT90', badge: 'High Power', badgeColor: '#0095b8', icon: '🟦', desc: 'Heavy-duty connector for high-power applications. 90A continuous. Used on large 7"+ or heavy lifting builds.', specs: ['90A continuous', '200A+ burst', 'Large and heavy', '7"+ builds'], use: 'Large quads, 6S+ high-current builds.' },
        ],
      },
      {
        title: 'Battery Safety & Standards',
        type: 'tips',
        items: [
          { icon: '⚠️', tip: 'NEVER charge LiPo unattended — use a fireproof LiPo bag or metal ammo box.' },
          { icon: '📉', tip: 'Never discharge below 3.3V per cell — damages cells and causes swelling.' },
          { icon: '🔌', tip: 'Always store at 3.8V/cell (storage charge). Never store fully charged or empty.' },
          { icon: '🌡️', tip: 'After flying, let battery cool 10–15 minutes before recharging.' },
          { icon: '🗑️', tip: 'Dispose of swollen or puffed packs immediately — take to electronics recycling, never trash.' },
          { icon: '✅', tip: 'Trust: CNHL, GNB, Tattu, Roaring Top, RDQ are reputable LiPo brands.' },
        ],
      },
    ],
  },
  {
    id: 'esc',
    label: 'ESC',
    icon: '🔌',
    image: '/images/ESC.png',
    color: '#f59e0b',
    tagline: 'Electronic Speed Controller — the motor driver',
    intro:
      'The ESC (Electronic Speed Controller) converts the flight controller\'s digital commands into three-phase AC power to drive brushless motors. It\'s the interface between the brain (FC) and the muscles (motors).',
    sections: [
      {
        title: 'ESC Form Factors',
        type: 'cards',
        items: [
          {
            name: '4-in-1 ESC',
            badge: 'Modern Standard',
            image: '/images/ESC.png',
            badgeColor: '#10b981',
            icon: '🟩',
            desc: 'All four motor controllers on a single PCB. Saves weight, reduces wiring, and mounts directly below the flight controller in a stack. The standard for 3"–7" builds.',
            specs: ['Single PCB for all 4 motors', 'Cleaner build', 'Stack compatible', 'Current: 20A–60A per motor'],
            use: 'All modern 5" builds, most 3"–7" builds.',
          },
          {
            name: 'Individual ESC',
            badge: 'Modular',
            badgeColor: '#f59e0b',
            icon: '🟨',
            desc: 'One ESC per motor, mounted at each arm. If one ESC fails you replace just that one. More wiring but more redundancy. Common in large quads.',
            specs: ['One failure = replace one ESC', 'More wiring', 'Arm-mounted', 'Common: large / racing'],
            use: 'Large builds (7"+), racing with independent arm ESCs.',
          },
        ],
      },
      {
        title: 'ESC Protocols',
        type: 'explainer',
        content:
          'The ESC receives throttle commands from the flight controller via a digital or analog signal protocol. Digital protocols (DSHOT) are now standard — they\'re faster, more precise, and have built-in error correction.',
        table: {
          headers: ['Protocol', 'Type', 'Speed', 'Notes'],
          rows: [
            ['PWM', 'Analog', 'Very slow', 'Legacy — don\'t use in new builds'],
            ['Oneshot125', 'Digital', 'Slow', 'Old — replaced by DSHOT'],
            ['DSHOT150', 'Digital', 'Slow', 'Basic DSHOT — use for slow MCUs'],
            ['DSHOT300', 'Digital', 'Medium', 'Good default for F4 FC'],
            ['DSHOT600', 'Digital', 'Fast', 'Standard for F7/H7 FC'],
            ['Bidirectional DSHOT', 'Digital+', 'Fast', 'Enables RPM telemetry for RPM filter'],
          ],
        },
      },
      {
        title: 'Current Rating Guide',
        type: 'tips',
        items: [
          { icon: '📊', tip: 'A 5" freestyle motor can pull 40–60A peak. Choose ESC rated 45A+.' },
          { icon: '🔢', tip: 'Rule of thumb: ESC current = motor stall current × 1.3 safety margin.' },
          { icon: '🏁', tip: 'Racing: 35–45A per motor ESC is usually enough on 4S.' },
          { icon: '🎬', tip: '6S builds: choose 50–60A ESC minimum per motor.' },
          { icon: '💡', tip: 'Trusted ESC brands: BLHeli_32, AM32, Aikon, Hobbywing, Spedix.' },
        ],
      },
    ],
  },
  {
    id: 'flight-controller',
    label: 'Flight Controller',
    icon: '🧠',
    image: '/images/FC.png',
    color: '#ec4899',
    tagline: 'The brain of your drone',
    intro:
      'The Flight Controller (FC) reads sensor data, runs the stabilization algorithms (like Betaflight), and sends commands to motors through ESCs. The FC is the most software-critical component of the drone.',
    sections: [
      {
        title: 'FC Processor Classes',
        type: 'cards',
        image: '/images/FC.png',
        items: [
          { name: 'F4 (STM32F4)', badge: 'Entry', badgeColor: '#f59e0b', icon: '🟡', desc: 'Older but reliable 168MHz processor. Enough for most freestyle builds. Limited UARTs and peripheral counts. Still popular due to cost.', specs: ['168MHz', '3–4 UARTs', 'DSHOT300 max', 'Budget friendly'], use: 'Budget / beginner builds where cost matters.' },
          { name: 'F7 (STM32F7)', badge: 'Standard', badgeColor: '#10b981', icon: '🟢', desc: 'The current mainstream standard at 216MHz. Supports DSHOT600, bidirectional DSHOT, more UARTs, and better peripheral handling.', specs: ['216MHz', '5–6 UARTs', 'DSHOT600', 'Most builds'], use: '5" freestyle and racing — the sweet spot.' },
          { name: 'H7 (STM32H7)', badge: 'High End', badgeColor: '#0095b8', icon: '🔵', desc: '480MHz powerhouse. Runs DSHOT300 bidirectional that is effectively better than F7\'s DSHOT600. Used in high-performance and digital FPV systems.', specs: ['480MHz', '8+ UARTs', 'Best RPM filter', 'Digital FPV ready'], use: 'Digital FPV (DJI, Walksnail), high-end performance builds.' },
        ],
      },
      {
        title: 'Gyroscope Sensors',
        type: 'explainer',
        content:
          'The gyroscope measures rotation rates on all 3 axes to keep the drone stable. The gyro choice significantly affects flight feel and noise characteristics.',
        table: {
          headers: ['Gyro Chip', 'Quality', 'Notes'],
          rows: [
            ['MPU6000', '⭐⭐⭐⭐⭐', 'Gold standard — low noise, reliable, excellent for tuning'],
            ['ICM20689', '⭐⭐⭐⭐', 'Good. Slightly higher noise than MPU6000'],
            ['ICM42688-P', '⭐⭐⭐⭐⭐', 'Modern standard — very low noise, fast sampling'],
            ['BMI270', '⭐⭐⭐⭐', 'Good performance, common in newer budget FCs'],
          ],
        },
      },
      {
        title: 'Key FC Features to Look For',
        type: 'tips',
        items: [
          { icon: '🔌', tip: '5+ UARTs — you need them for: receiver, VTX, GPS, ESC telemetry, HD camera.' },
          { icon: '🔃', tip: 'Bidirectional DSHOT support — enables RPM filtering (biggest tune improvement possible).' },
          { icon: '📡', tip: 'Built-in Bluetooth or WiFi for wireless Betaflight configuration.' },
          { icon: '⚡', tip: 'Onboard voltage regulator (BEC) for 3.3V and 5V to power peripherals.' },
          { icon: '💡', tip: 'Trusted FC brands: Holybro, Matek, Foxeer, IFlight, BetaFPV.' },
        ],
      },
    ],
  },
  {
    id: 'propellers',
    label: 'Propellers',
    icon: '🌀',
    image: '/images/propellers.png',
    color: '#06b6d4',
    tagline: 'The interface between motor and air',
    intro:
      'Propellers convert rotational energy from motors into thrust. Prop choice affects efficiency, power, noise, and flight feel. Matching props to motor KV and frame size is essential.',
    sections: [
      {
        title: 'Propeller Specifications',
        type: 'explainer',
        image: '/images/propellers.png',
        content:
          'Props are described by two numbers: diameter × pitch. Example: 5148 = 5.1" diameter × 4.8" pitch. Pitch is the distance the prop would travel in one revolution through air.',
        table: {
          headers: ['Spec', 'Meaning', 'Effect of Increasing'],
          rows: [
            ['Diameter (inches)', 'Tip-to-tip size', 'More thrust, more drag, less RPM needed'],
            ['Pitch (inches)', 'Air bite per revolution', 'Faster top speed, more current draw'],
            ['Blade count', '2, 3, or 4 blades', 'More blades = more thrust but less efficient'],
            ['Material', 'PC, DAL, GF, carbon', 'Stiffer = higher efficiency, breaks easier'],
          ],
        },
      },
      {
        title: 'Blade Count Comparison',
        type: 'cards',
        items: [
          { name: 'Bi-blade (2-blade)', badge: 'Efficiency', badgeColor: '#10b981', icon: '✌️', desc: 'Least drag, highest efficiency. Common in long range and cinematic builds where flight time matters more than punch.', specs: ['Highest efficiency', 'Smooth/quiet', 'Less thrust/punch', 'Long range standard'], use: 'Long range, cinematic, battery life priority.' },
          { name: 'Tri-blade (3-blade)', badge: 'Standard', badgeColor: '#0095b8', icon: '☘️', desc: 'The sweet spot — good thrust, acceptable efficiency, and great overall performance. The most common choice for freestyle.', specs: ['Balanced thrust/efficiency', 'Most popular', 'Good punch', '5" freestyle standard'], use: 'Freestyle standard. The most common 5" choice.' },
          { name: 'Quad-blade (4-blade)', badge: 'Racing', badgeColor: '#ef4444', icon: '✚', desc: 'Maximum thrust and mid-range punch at the cost of efficiency. Used in racing for snappy throttle response and fastest acceleration.', specs: ['Maximum thrust', 'High current draw', 'Less efficient', 'Racing builds'], use: 'Racing — maximum punch and acceleration.' },
        ],
      },
      {
        title: 'How to Choose Props',
        type: 'tips',
        items: [
          { icon: '📏', tip: 'Frame size dictates max prop: 5" frame → 5" prop (5140, 5148, 5149 most common)' },
          { icon: '⚙️', tip: 'Match pitch to KV: high KV motors → lower pitch. Low KV motors → higher pitch.' },
          { icon: '🏁', tip: 'Racing: 5145 or 5148 tri or quad blade for aggressive punch.' },
          { icon: '🎬', tip: 'Cinematic: 5142 or HQ 5x4x3V2S for smooth quiet footage.' },
          { icon: '💡', tip: 'Trusted brands: HQ Props (most popular), DAL, Gemfan, T-Motor.' },
          { icon: '⚠️', tip: 'Always install props in correct rotation — forward-spinning front-left/rear-right, reverse on the other diagonal.' },
        ],
      },
    ],
  },
  {
    id: 'video-systems',
    label: 'Video Systems',
    icon: '📷',
    image: '/images/vtx.png',
    color: '#f97316',
    tagline: 'Your eyes in the sky',
    intro:
      'The FPV video system transmits live camera feed to your goggles. This is what makes FPV flying immersive. There are two fundamentally different approaches: analog and digital.',
    sections: [
      {
        title: 'Analog vs Digital FPV',
        type: 'cards',
        image: '/images/vtx.png',
        items: [
          {
            name: 'Analog FPV',
            badge: 'Classic',
            badgeColor: '#10b981',
            icon: '📺',
            desc: 'Traditional system: camera → VTX → goggles over 5.8GHz radio. Very low latency (<1ms). Affordable. Image quality is 480–600 TVL — grainy but fast.',
            specs: ['< 1ms latency', '480–800 TVL', '5.8 GHz', 'Cheapest entry point'],
            use: 'Budget builds, racing, beginners learning FPV.',
          },
          {
            name: 'DJI O3 / Digital',
            badge: 'Premium',
            badgeColor: '#0095b8',
            icon: '📡',
            desc: '1080p or 4K digital transmission. Crystal-clear image with 22ms latency — barely noticeable. DJI O3 Air Unit is the most popular digital system. Expensive but transforms FPV experience.',
            specs: ['1080p / 4K', '< 22ms latency', 'Up to 10km range', 'DJI goggles required'],
            use: 'Cinematic FPV, premium freestyle where image quality matters.',
          },
          {
            name: 'Walksnail Avatar',
            badge: 'Competitor',
            badgeColor: '#7c3aed',
            icon: '👁️',
            desc: 'Caddx\'s digital system competing with DJI O3. Similar 1080p quality. Uses different goggles. Supports head tracking. Growing ecosystem.',
            specs: ['1080p 60fps', '< 22ms', 'Head tracking support', 'Walksnail goggles'],
            use: 'Digital alternative to DJI at slightly lower cost.',
          },
          {
            name: 'HDZero',
            badge: 'Low Latency Digital',
            badgeColor: '#ef4444',
            icon: '⚡',
            desc: 'Digital system with ~5–8ms latency — much lower than DJI. Preferred by digital racers who need the fastest response. 720p image quality.',
            specs: ['720p 60fps', '< 8ms latency', 'Racing focused', 'Analog goggle compatible (module)'],
            use: 'Digital racing — where latency beats resolution.',
          },
        ],
      },
      {
        title: 'VTX Power Levels',
        type: 'explainer',
        content:
          'VTX (Video Transmitter) power determines analog signal range. Always check local regulations — many countries limit to 25mW for unlicensed 5.8GHz use.',
        table: {
          headers: ['Power Level', 'Typical Range', 'Notes'],
          rows: [
            ['25mW', '~200–400m', 'Legal limit in many countries without license'],
            ['100mW', '~500–800m', 'Good for most flying scenarios'],
            ['200mW', '~800m–1.2km', 'Common default for freestyle'],
            ['600mW', '~1–2km', 'Penetrates obstacles well'],
            ['1000mW+', '2km+', 'For long range — check local laws first'],
          ],
        },
      },
      {
        title: 'How to Choose Your Video System',
        type: 'tips',
        items: [
          { icon: '💰', tip: 'Beginners: Start with analog (Runcam, Foxeer camera + cheap VTX). Total cost ~$30–50.' },
          { icon: '🎬', tip: 'Want great footage? DJI O3 is the gold standard — budget ~$200 for the system.' },
          { icon: '🏁', tip: 'Racing: Analog or HDZero for lowest latency response.' },
          { icon: '📡', tip: 'Long range: DJI O3 for best penetration and range at reasonable cost.' },
        ],
      },
    ],
  },
  {
    id: 'radio',
    label: 'Radio Control',
    icon: '📻',
    image: '/images/controller.png',
    color: '#a855f7',
    tagline: 'How you control the drone',
    intro:
      'The radio control system is the link between your hands and the drone. It consists of a transmitter (controller) and a receiver. Protocol choice affects range, latency, and reliability.',
    sections: [
      {
        title: 'Radio Protocols',
        type: 'explainer',
        image: '/images/controller.png',
        content:
          'Modern FPV uses digital radio links with much better range and reliability than older analog systems. ExpressLRS has become the dominant open-source protocol.',
        table: {
          headers: ['Protocol', 'Type', 'Range', 'Latency', 'Notes'],
          rows: [
            ['ExpressLRS (ELRS)', 'Open-source', '10km+ (1W)', '< 1ms', 'Most popular. Best performance. Free.'],
            ['TBS Crossfire', 'Proprietary', '100km+ (legal limit)', '< 2ms', 'Long range specialist. Reliable.'],
            ['TBS Tracer', 'Proprietary', '1–2km', '< 2ms', 'Compact crossfire for 5" builds'],
            ['FrSky ACCST/ACCESS', 'Proprietary', '~1–3km', '< 5ms', 'Older but large ecosystem'],
            ['FlySky AFHDS', 'Proprietary', '~1km', '< 10ms', 'Budget entry-level protocol'],
          ],
        },
      },
      {
        title: 'How to Choose Your Radio System',
        type: 'tips',
        items: [
          { icon: '🥇', tip: 'Best overall: ExpressLRS — free protocol, huge community, excellent performance, $15–25 receivers.' },
          { icon: '📡', tip: 'Long range specialist: TBS Crossfire. For flying 5km+ or penetrating thick obstacles.' },
          { icon: '🎮', tip: 'Beginner radios: RadioMaster Boxer (ELRS), RadioMaster TX16S, Jumper T-Pro.' },
          { icon: '🔗', tip: 'Always match protocol: your radio TX module must match your drone receiver protocol.' },
        ],
      },
    ],
  },
]

export const getCategoryById = (id) => PART_CATEGORIES.find((c) => c.id === id)
