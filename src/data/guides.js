// Plain-language guides about drones in India. Written for people searching for FPV drones, DJI-style camera drones, drone rules and drone
// courses. They are public pages, used by the Guides page on the site and by the build step that writes each page's search-engine HTML.
// Rules change: the guides say where to check the current position instead of quoting details that may have moved.

export const GUIDES = [
  {
    slug: 'fpv-drones-india',
    title: 'FPV drones in India: what they are and how to start',
    description: 'What an FPV drone is, the main types (freestyle, racing, cinewhoop), what you need to start flying in India, how to learn safely and what a good first course covers.',
    updated: '2026-10-30',
    intro: 'FPV stands for first-person view. You fly the drone by watching a live video from its camera, usually through goggles, so it feels as if you are sitting in the cockpit. It is the style of flying behind drone racing, freestyle acrobatics and cinematic shots that no other drone can take.',
    sections: [
      {
        h: 'The main types of FPV drone',
        p: [
          'Freestyle drones are usually 5 inch quads built for flips, dives and flowing lines around buildings and trees. Racing drones are lighter and faster and are tuned for lap times. Cinewhoops are small drones with protective ducts around the propellers, flown close to people and inside buildings for smooth footage. Tiny whoops are palm-sized and let you practise safely indoors.',
          'Most FPV drones are flown in Acro mode, where you control the rotation rate and there is no self-levelling. That is why they can do things a camera drone cannot, and also why you learn first on a simulator.',
        ],
      },
      {
        h: 'What you need to start',
        p: [
          'A simulator on a computer, a radio controller, FPV goggles, a drone and charged batteries. Start with the simulator and fly it for a few weeks before you fly a real drone: it is the cheapest way to build muscle memory and to survive your first crashes.',
          'Modern radio links such as ExpressLRS give a long, reliable range and very low delay. Digital video systems give a sharp picture, and analogue systems are cheaper and easier to repair.',
        ],
      },
      {
        h: 'Learning safely in India',
        p: [
          'Fly in open areas away from people, roads and animals, keep the drone in sight or with a spotter, and never fly near airports or restricted places. Read our guide to drone rules in India before your first flight. A structured course with a trainer is the quickest way to learn good habits, because you get feedback on your throttle control, turns and landings.',
        ],
      },
      {
        h: 'Where to learn FPV in India',
        p: [
          'EGIRE Robotics teaches FPV piloting, building and tuning to students from age 5 to 45, in workshops at colleges and in longer courses. Training starts in the simulator, moves to real flying, and the longer programs include building an FPV drone from scratch and racing practice.',
        ],
      },
    ],
    faq: [
      { q: 'Do I need a licence to fly an FPV drone in India?', a: 'It depends on the weight of the drone and whether you fly for work. Read our guide to the drone rules in India and check the Digital Sky platform for the current position before you fly.' },
      { q: 'How long does it take to learn FPV?', a: 'Most people can hover and fly basic laps in the simulator within a few weeks of regular practice. Freestyle moves such as power loops and dives take months of practice.' },
      { q: 'Is FPV harder than flying a DJI camera drone?', a: 'Yes. A camera drone stabilises itself and an FPV drone in Acro mode does not, so FPV takes longer to learn. In return you get far more control and speed.' },
    ],
  },
  {
    slug: 'dji-vs-fpv-drones',
    title: 'DJI drones vs FPV drones: which should you choose?',
    description: 'A plain comparison of DJI-style camera drones and FPV drones: ease of use, video quality, cost, repair, speed and what suits students, photographers and hobbyists in India.',
    updated: '2026-10-30',
    intro: 'People searching for "DJI drones" usually want a drone that is easy to fly and takes stable photos and video. FPV drones are a different tool: faster, more agile and far more fun to fly, but harder to learn. Here is how to choose.',
    sections: [
      {
        h: 'Camera drones such as DJI Mini, Air and Mavic',
        p: [
          'These drones use GPS, sensors and a stabilised camera gimbal. They hover on their own, return to the take-off point, and shoot smooth video with little skill. They are the right choice for photography, real estate, inspection, events and anyone who wants good footage on day one.',
        ],
      },
      {
        h: 'FPV drones',
        p: [
          'An FPV drone has no self-levelling in Acro mode, a low-latency camera for goggles and a lot of power. You fly it like a pilot, not a photographer. It is the choice for racing, freestyle, cinematic fly-throughs and for learning how drones really work, because you can build, tune and repair it yourself.',
          'Hybrid drones such as the DJI Avata and the DJI FPV bring a ready-to-fly package with a gentler learning curve, but they cost more to repair than a drone you built yourself.',
        ],
      },
      {
        h: 'How they compare',
        p: [
          'Ease of use: camera drones win. Speed and agility: FPV wins. Footage: camera drones give steady shots, FPV gives dynamic, immersive shots. Repair and upgrades: an FPV drone made of standard parts is cheap to fix and to improve. Learning: building and flying FPV teaches electronics, physics and control, which is why it suits engineering students.',
        ],
      },
      {
        h: 'Buying in India',
        p: [
          'India restricted the import of ready-to-fly drones in 2022, so the models, prices and after-sales support for DJI drones can differ from other countries. Buy from an authorised local seller, keep the invoice and check the drone rules before you fly. FPV drones are built from parts, and EGIRE Robotics supplies spares and teaches you to build one.',
        ],
      },
    ],
    faq: [
      { q: 'Which is better for a beginner, DJI or FPV?', a: 'If you want photos and video quickly, a camera drone. If you want to learn how drones work, race or fly freestyle, start with an FPV simulator and a trainer.' },
      { q: 'Can I learn FPV and then use a camera drone?', a: 'Yes. FPV pilots find camera drones very easy to fly, so FPV skill transfers well.' },
      { q: 'Does EGIRE Robotics teach camera drones?', a: 'We teach FPV piloting, building and tuning, plus drone uses such as cinematography, agriculture and 3D mapping.' },
    ],
  },
  {
    slug: 'drone-rules-india',
    title: 'Drone rules in India: what every beginner should know',
    description: 'A beginner guide to flying a drone legally in India: the Drone Rules 2021, weight classes, the Digital Sky platform, green, yellow and red zones, and where to check current rules.',
    updated: '2026-10-30',
    intro: 'India liberalised its drone regulations with the Drone Rules, 2021, which replaced the older, stricter framework. The rules are meant to make flying simpler, but they still apply to everyone who flies, including students and hobbyists. This guide is a plain summary, not legal advice.',
    sections: [
      {
        h: 'Weight classes',
        p: [
          'Drones are grouped by weight: nano (up to 250 g), micro (over 250 g to 2 kg), small (over 2 kg to 25 kg), medium (over 25 kg to 150 kg) and large (over 150 kg). The class decides what registration, certificate and permission are needed, and whether you are flying for fun or for work.',
        ],
      },
      {
        h: 'The Digital Sky platform and airspace zones',
        p: [
          'The Digital Sky platform, run by the Directorate General of Civil Aviation (DGCA), is where drones are registered and where the airspace map is published. The map divides airspace into green zones (where you can fly within the height limits), yellow zones (where permission is needed) and red zones (where flying is not allowed without special permission), such as near airports and sensitive sites.',
        ],
      },
      {
        h: 'Good habits that apply everywhere',
        p: [
          'Keep the drone within your sight or with a spotter, do not fly over crowds or private property without permission, stay away from airports and government buildings, respect people\'s privacy and never fly in bad weather. Use your drone only for what it is registered or allowed for.',
        ],
      },
      {
        h: 'Training and certificates',
        p: [
          'Flying a drone commercially generally needs a remote pilot certificate from a DGCA-approved training organisation. Learning to fly with a trainer, starting in a simulator, is also the safest way to start as a hobbyist or student.',
        ],
      },
      {
        h: 'Always check the current rules',
        p: [
          'Drone rules in India have been updated more than once and can change again. Before you fly, check the Digital Sky platform and the DGCA website for the current requirements for your drone and your location.',
        ],
      },
    ],
    faq: [
      { q: 'Do I need to register a small drone in India?', a: 'Requirements depend on the weight class and use. Check the Digital Sky platform for the current rules for your drone.' },
      { q: 'Can I fly a drone near my college?', a: 'Only if the location is in a zone that allows it and the college and local rules permit it. Check the Digital Sky airspace map and ask the college.' },
      { q: 'Does EGIRE Robotics teach the rules?', a: 'Yes. Safe flying and the rules are part of our FPV piloting training.' },
    ],
  },
  {
    slug: 'build-fpv-drone-india',
    title: 'How to build an FPV drone in India: parts, steps and cost',
    description: 'A step-by-step guide to building a 5 inch FPV drone in India: the parts you need, how they connect, a simple build order, common mistakes and where to learn.',
    updated: '2026-10-30',
    intro: 'Building your own FPV drone is the best way to understand how a drone works, and it makes repairs cheap. A typical 5 inch freestyle drone is built from a handful of standard parts that any FPV builder uses.',
    sections: [
      {
        h: 'The parts',
        p: [
          'A carbon fibre frame, four brushless motors, a four-in-one ESC (the electronic speed controller), a flight controller, an FPV camera and video transmitter, a radio receiver, four propellers, a battery and a battery strap. A radio controller and goggles complete the kit.',
          'Match the parts to each other: the motors must suit the battery voltage (4S or 6S), the ESC must carry the current the motors draw, and the flight controller must fit the frame\'s mounting holes.',
        ],
      },
      {
        h: 'A simple build order',
        p: [
          'Fit the motors to the arms, mount the ESC and flight controller as a stack, solder the motor wires to the ESC, solder the battery lead and a capacitor, connect the receiver and the video transmitter, mount the camera, then check every joint before you plug in a battery. Configure the drone in Betaflight, set the motor directions and the radio, and test with the propellers off.',
        ],
      },
      {
        h: 'Mistakes beginners make',
        p: [
          'Reversed battery polarity, cold solder joints, props on during the first power-up, wrong motor direction and not checking the voltage rating of parts. A clear wiring diagram and a trainer standing next to you prevents nearly all of them.',
        ],
      },
      {
        h: 'Learn to build with EGIRE Robotics',
        p: [
          'EGIRE Robotics runs FPV build workshops and a 90-day course that covers building, tuning and flying FPV drones end to end. We also supply drone spares. Send an enquiry to talk about a workshop for your college or an individual course.',
        ],
      },
    ],
    faq: [
      { q: 'How much does it cost to build an FPV drone?', a: 'The cost depends on the parts you choose. Add up the frame, motors, ESC, flight controller, camera, video transmitter, receiver and battery, then add a radio and goggles if you do not have them yet.' },
      { q: 'Do I need to know soldering?', a: 'Yes, basic soldering. A workshop teaches it on practice boards before you touch real parts.' },
      { q: 'Can I build a drone as a college project?', a: 'Yes. We run build workshops and projects for engineering colleges. Send an enquiry to arrange one.' },
    ],
  },
]

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug)
