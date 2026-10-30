// Articles from the EGIRE Robotics team. Same shape as the guides in guides.js, so the blog, the build step that writes each page's
// search-engine HTML and the sitemap all read one list. Keep claims general: prices and rules change, so the posts say where to check.

export const ARTICLES = [
  {
    slug: 'fresher-doubt-resolution',
    category: 'Beginners',
    author: 'EGIRE Team',
    published: '2026-06-24',
    updated: '2026-10-30',
    title: 'FPV drone doubts for beginners: cost, crashes and coding',
    description: 'Straight answers to the questions every new FPV pilot asks: is FPV expensive, will I crash, do I need to code, and how to take your first flight with a simulator and a tiny whoop.',
    keywords: ['FPV for beginners', 'how to start FPV drone', 'is FPV expensive', 'FPV simulator', 'tiny whoop', 'Betaflight for beginners', 'first FPV drone India', 'learn FPV drone', 'EGIRE Robotics'],
    intro: 'Starting in FPV can feel like learning a new language: KV ratings, video bands, Betaflight and PID tuning before the drone even leaves the ground. Here are the doubts we hear most from freshers, answered plainly.',
    sections: [
      {
        h: 'Is FPV too expensive to start?',
        p: [
          'Not any more. Premium racing rigs cost a lot, but you can start with a small, forgiving micro drone (a tiny whoop) and an entry-level radio. The cheapest way to begin is a simulator on a computer: you build muscle memory without paying for a single broken propeller.',
        ],
      },
      {
        h: 'Will I crash?',
        p: [
          'Yes. Everyone crashes, and it is part of the hobby. That is why we teach you to build your drone from scratch: if you know how it is put together, you know how to fix it when it breaks, and repairs with standard parts are cheap.',
        ],
      },
      {
        h: 'Do I need to know how to code?',
        p: [
          'No. The flight controller software, Betaflight, has a visual interface. You follow configuration steps and set values; you do not write code. Coding becomes useful later if you move into autonomous drones and robotics.',
        ],
      },
      {
        h: 'Our advice for the first month',
        p: [
          'Start small, fly the simulator every day, learn battery safety before you plug in a real drone, and join a trainer-led workshop so that good habits form from the first flight. Read our guide to the drone rules in India before your first outdoor flight.',
        ],
      },
    ],
    faq: [
      { q: 'What is the best way to start FPV as a beginner?', a: 'Practise in a simulator for a few weeks, then move to a small, ducted micro drone indoors, and join a trainer-led workshop for your first outdoor flights.' },
      { q: 'How long does it take to learn FPV?', a: 'Most people hover and fly basic laps in the simulator within weeks. Freestyle moves take months of regular practice.' },
      { q: 'Do EGIRE Robotics workshops suit complete beginners?', a: 'Yes. The training starts in the simulator and assumes no earlier experience.' },
    ],
  },
  {
    slug: 'experienced-professionals',
    category: 'Advanced',
    author: 'Lead Engineer',
    published: '2026-06-02',
    updated: '2026-10-30',
    title: 'FPV drones for engineers: embedded systems, RF and control',
    description: 'How engineers and tech professionals can use FPV drone building to learn embedded firmware, DShot and flight control, RF video links, and PID tuning with real hardware.',
    keywords: ['FPV for engineers', 'drone embedded systems', 'flight controller firmware', 'DShot protocol', 'PID tuning FPV', 'drone RF engineering', 'upskilling drone engineering India', 'drone career India', 'EGIRE Robotics'],
    intro: 'If you are an engineer, a software developer or a hardware enthusiast, an FPV drone is a sandbox that touches several disciplines at once, and it is small enough to build on a desk.',
    sections: [
      {
        h: 'Embedded systems and firmware',
        p: [
          'Flight controllers run fast control loops on real-time firmware. Following how the gyro is read, how the loop runs and how the motor commands reach the electronic speed controllers over the DShot protocol gives you hands-on experience with high-frequency control.',
        ],
      },
      {
        h: 'RF engineering',
        p: [
          'The video and control links live in the 5.8 GHz and 2.4 GHz bands. Antenna polarisation, multipath reflections and signal penetration are not theory here: you see them on the goggles when a flight goes wrong.',
        ],
      },
      {
        h: 'Aerodynamics, physics and control',
        p: [
          'Tuning a PID controller for locked-in flight needs a grasp of resonance, thrust-to-weight ratio and mechanical filtering. Our physics lessons explain the forces and the maths behind each of them.',
        ],
      },
      {
        h: 'From hobby to career',
        p: [
          'The same skills carry into commercial drone work such as inspection, mapping and agriculture, and into robotics with ROS 2 and computer vision. EGIRE Robotics teaches both the flying and the engineering behind it.',
        ],
      },
    ],
    faq: [
      { q: 'Is FPV useful for an engineering career?', a: 'Yes. It teaches embedded firmware, control loops, power electronics and RF, which carry over to robotics and commercial drone work.' },
      { q: 'Do you teach tuning and building, not only flying?', a: 'Yes. Our programs cover building a drone from scratch, configuring it in Betaflight and tuning it.' },
    ],
  },
  {
    slug: 'tactical-fpv-army',
    category: 'Defence',
    author: 'Tactical Operations',
    published: '2026-06-15',
    updated: '2026-10-30',
    title: 'FPV drone training for defence personnel and security teams',
    description: 'Why FPV skills matter for defence personnel: manual flying without GPS, speed and agility, and rugged, field-repairable builds, and how training is structured.',
    keywords: ['FPV drone training defence', 'drone training army India', 'tactical FPV drones', 'GPS-denied flying', 'rugged FPV drone build', 'drone training for security forces', 'Acro mode FPV', 'EGIRE Robotics'],
    intro: 'First-person-view flying has changed how teams think about reconnaissance and situational awareness. This post covers the skills involved, not operational details.',
    sections: [
      {
        h: 'Flying without GPS',
        p: [
          'Camera drones lean heavily on GPS. FPV pilots fly in Acro mode, fully manually, which is why the skill is valued where GPS is weak, jammed or unavailable, for example inside buildings or under dense tree cover.',
        ],
      },
      {
        h: 'Speed and agility',
        p: [
          'A 5 inch FPV drone reaches high speed in seconds and can change direction far faster than a stabilised camera drone. Flying it well takes practice, which is why training starts in a simulator.',
        ],
      },
      {
        h: 'Rugged and field-repairable',
        p: [
          'Carbon fibre frames survive hard knocks, and because the drone is modular a damaged arm or motor can be swapped in minutes with common tools. Learning to build a drone is learning to maintain it.',
        ],
      },
      {
        h: 'Training with EGIRE Robotics',
        p: [
          'We teach piloting, building, maintenance and safe-flying discipline for groups. Send an enquiry to discuss a programme for your unit or organisation, and always follow the drone rules that apply to you.',
        ],
      },
    ],
    faq: [
      { q: 'Do you train defence or security groups?', a: 'Send us an enquiry with your requirements, and we will discuss what can be taught within the law.' },
      { q: 'Is a simulator part of the training?', a: 'Yes. Every programme starts in the simulator before real flying.' },
    ],
  },
  {
    slug: 'kids-can-fly',
    category: 'Education',
    author: 'Education Team',
    published: '2026-06-05',
    updated: '2026-10-30',
    title: 'Drone classes for kids: safe STEM learning with tiny whoops',
    description: 'How children can safely learn robotics, electronics and physics with micro drones and a simulator, and how to start from age 5 with a tiny whoop.',
    keywords: ['drone classes for kids', 'STEM drone workshop India', 'tiny whoop for kids', 'robotics for kids India', 'drone for school students', 'learn electronics for kids', 'drone workshop for schools', 'EGIRE Robotics'],
    intro: 'A fast racing drone is not for a ten-year-old, and that is fine. FPV is a wide range, and its gentle end is a very good way for children to learn.',
    sections: [
      {
        h: 'The tiny whoop',
        p: [
          'A tiny whoop is a micro drone that fits in the palm of the hand. It weighs very little and its propellers sit inside guards, so it bounces off walls and furniture without causing harm.',
        ],
      },
      {
        h: 'Why it works for kids',
        p: [
          'Children learn batteries, circuits, radio and physics without noticing that they are studying. Flying builds spatial awareness, hand-eye coordination and patience, and the drone gives immediate feedback on every decision.',
        ],
      },
      {
        h: 'How to start',
        p: [
          'Begin with a basic gamepad-style radio, practise on a simulator on the computer, and move to an indoor tiny whoop once the child can hover steadily. An adult should supervise batteries and charging.',
        ],
      },
      {
        h: 'School and college workshops',
        p: [
          'EGIRE Robotics teaches learners from age 5 to 45. Schools can send an enquiry for a workshop that covers flying, building and simple robotics.',
        ],
      },
    ],
    faq: [
      { q: 'What age can a child start with drones?', a: 'We teach from age 5 with supervised, simulator-first sessions on small, guarded drones.' },
      { q: 'Is it safe?', a: 'Micro drones with propeller guards used indoors under adult supervision are very safe, and an adult should handle all charging.' },
    ],
  },
  {
    slug: 'best-fpv-drone-for-beginners-india',
    category: 'Beginners',
    author: 'EGIRE Team',
    published: '2026-10-30',
    updated: '2026-10-30',
    title: 'Best FPV drone for beginners in India: how to choose your first one',
    description: 'How to choose a first FPV drone in India: tiny whoop, 3 inch or 5 inch freestyle, ready-to-fly or built from parts, what radio and goggles you need, and what to buy last.',
    keywords: ['best FPV drone for beginners India', 'first FPV drone', 'tiny whoop India', '5 inch freestyle drone', 'FPV drone kit India', 'FPV radio controller', 'FPV goggles for beginners', 'ready to fly FPV drone', 'buy FPV drone India', 'EGIRE Robotics'],
    intro: 'The best first FPV drone is the one you can afford to crash and repair. This guide helps you choose among the common sizes and explains what you need around the drone.',
    sections: [
      {
        h: 'Start with the simulator, not the drone',
        p: [
          'Buy the radio controller first and use it on a simulator. Everything you learn there carries over, and you will know what you like before you buy goggles and a drone.',
        ],
      },
      {
        h: 'Tiny whoop, 3 inch or 5 inch?',
        p: [
          'A tiny whoop is the safest and cheapest way to practise indoors, and it forgives mistakes. A 3 inch drone is a good step up for open spaces. A 5 inch freestyle drone is the standard for flips, dives and cinematic shots, and is where most pilots end up.',
          'Choose the size to match where you will fly. Flying a 5 inch drone indoors is a poor idea; flying a tiny whoop in wind outdoors is frustrating.',
        ],
      },
      {
        h: 'Ready-to-fly or build it yourself?',
        p: [
          'A ready-to-fly drone is the fastest way into the air. Building from parts costs time but teaches you how the drone works, makes repairs cheap and lets you choose each part. Our guide to building an FPV drone in India lists the parts and the order.',
        ],
      },
      {
        h: 'Radio, goggles and batteries',
        p: [
          'Pick a radio that works with the receiver protocol of your drone, such as ExpressLRS. Analogue goggles are cheaper and easier to repair; digital goggles give a sharper picture. Buy several batteries and a safe charger, and store them properly.',
        ],
      },
      {
        h: 'Learn with a trainer',
        p: [
          'A workshop with a trainer saves you the first few crashes and teaches safe habits. EGIRE Robotics runs FPV piloting and build workshops across India.',
        ],
      },
    ],
    faq: [
      { q: 'Which FPV drone should a complete beginner buy first?', a: 'A micro drone with propeller guards, together with a radio you can also use on a simulator. Move to a 5 inch drone once you can fly the simulator confidently.' },
      { q: 'Do I need goggles to start?', a: 'Not for the simulator. For real FPV flying you do, and many beginners start with analogue goggles.' },
      { q: 'Where can I buy FPV spares in India?', a: 'EGIRE Robotics supplies drone spares. Send an enquiry with the parts you need.' },
    ],
  },
  {
    slug: 'fpv-simulator-practice',
    category: 'Beginners',
    author: 'EGIRE Team',
    published: '2026-10-30',
    updated: '2026-10-30',
    title: 'FPV simulator practice: how to learn drone flying faster',
    description: 'How to use an FPV simulator to learn drone flying faster: what to buy, a four-week practice plan, the moves to master first and when to move to a real drone.',
    keywords: ['FPV simulator', 'best FPV simulator', 'FPV simulator practice plan', 'learn FPV flying fast', 'Liftoff and VelociDrone', 'Acro mode practice', 'FPV radio on simulator', 'drone simulator India', 'EGIRE Robotics'],
    intro: 'A simulator is the cheapest and fastest way to learn FPV. Used well, it saves weeks of crashes and teaches the stick control that real flying needs.',
    sections: [
      {
        h: 'What you need',
        p: [
          'A computer that runs the simulator smoothly and your own radio controller connected over USB. Flying with the radio you will use on a real drone builds the right muscle memory.',
        ],
      },
      {
        h: 'A four-week plan',
        p: [
          'Week one: hover in Angle mode and fly gentle laps. Week two: switch to Acro mode and hold a steady hover. Week three: fly figures of eight and tight turns. Week four: dives, power loops and flips. Practise for a short time every day rather than for hours once a week.',
        ],
      },
      {
        h: 'Moves to master first',
        p: [
          'Throttle control, holding altitude through a turn, smooth stick inputs and recovering from a bad attitude. Only then add flips and freestyle lines.',
        ],
      },
      {
        h: 'When to move to a real drone',
        p: [
          'Move when you can hover in Acro mode, fly a lap without crashing and recover calmly from mistakes. Begin with a small, guarded drone indoors. Our FPV piloting lessons let you rehearse the stick moves on a 3D drone first.',
        ],
      },
    ],
    faq: [
      { q: 'How long should I practise on a simulator?', a: 'A few weeks of daily short sessions is a good target before flying a real drone.' },
      { q: 'Does simulator skill transfer to a real drone?', a: 'Stick control and orientation transfer very well. Wind, vibration and radio range are the new things you meet on a real drone.' },
    ],
  },
  {
    slug: 'drone-pilot-training-india',
    category: 'Guides',
    author: 'EGIRE Team',
    published: '2026-10-30',
    updated: '2026-10-30',
    title: 'Drone pilot training in India: what a good course teaches',
    description: 'What a drone pilot training course in India should cover: simulator and real flying, safety, the rules, building and tuning, and the difference between hobby training and a remote pilot certificate.',
    keywords: ['drone pilot training India', 'drone training course India', 'drone pilot course', 'remote pilot certificate', 'DGCA approved drone training', 'drone course for students', 'drone workshop for colleges', 'FPV drone course', 'EGIRE Robotics'],
    intro: 'Drone pilot training means different things: a hobby course for flying well, a workshop for a college, and an approved course for a remote pilot certificate. This guide separates them.',
    sections: [
      {
        h: 'What a good course covers',
        p: [
          'A simulator stage, real flying with a trainer, safety and battery handling, the rules of the air, and how a drone is built and tuned. The stronger programmes also teach the physics behind flight, so you understand why the drone behaves as it does.',
        ],
      },
      {
        h: 'Hobby, college workshop or certificate?',
        p: [
          'A hobby course teaches you to fly and build. A college workshop adds a project and a certificate of participation. For commercial flying in India you generally need a remote pilot certificate from a DGCA-approved training organisation. Check the current requirements on the DGCA website and the Digital Sky platform.',
        ],
      },
      {
        h: 'Questions to ask before you join',
        p: [
          'How many hours do I fly myself? Is there a simulator stage? Who is the trainer and what have they built and flown? What is included: drone, batteries, kit? What will I be able to do at the end? A good provider answers these plainly.',
        ],
      },
      {
        h: 'Training with EGIRE Robotics',
        p: [
          'We run a 7-day FPV piloting workshop and a 90-day course covering flying, building and tuning, with certificates for each skill grade. We teach students from age 5 to 45 and run workshops at engineering colleges across India.',
        ],
      },
    ],
    faq: [
      { q: 'Is EGIRE Robotics a DGCA-approved remote pilot training organisation?', a: 'Our programmes teach flying, building and the rules. For a remote pilot certificate, check the DGCA list of approved training organisations.' },
      { q: 'Can colleges book a drone workshop?', a: 'Yes. Send an enquiry and we will arrange a workshop for your college.' },
    ],
  },
  {
    slug: 'indian-drones-egire-robotics',
    category: 'Guides',
    author: 'EGIRE Team',
    published: '2026-10-30',
    updated: '2026-10-30',
    title: 'Indian drones: building, learning and flying drones in India',
    description: 'A look at the Indian drone ecosystem: why drone skills matter in India, what Indian students can build and learn, uses from agriculture to mapping, and how EGIRE Robotics trains builders and pilots.',
    keywords: ['Indian drones', 'drones made in India', 'Indian drone industry', 'drone startups India', 'EGIRE Robotics', 'EGIRE Robotics India', 'agriculture drones India', 'drone mapping India', 'learn drone building India', 'drone spares India'],
    intro: 'Drones are moving from hobby to everyday tool in India: in farms, surveys, inspection, filming and education. Behind every one of those uses is someone who knows how to build, tune and fly a drone.',
    sections: [
      {
        h: 'Where Indian drones are used',
        p: [
          'Agriculture drones help with crop monitoring and spraying, survey drones build maps and 3D models, inspection drones reach towers and roofs, and FPV drones shoot cinematic footage. Each use needs trained people, not just hardware.',
        ],
      },
      {
        h: 'Why building skills matter',
        p: [
          'A person who can build a drone from standard parts can repair it, adapt it to a job and choose the right parts for it. That is the skill behind a local drone ecosystem, and it is what EGIRE Robotics teaches in its building workshops.',
        ],
      },
      {
        h: 'Rules and responsibility',
        p: [
          'India\'s Drone Rules, 2021 set out registration, zones and certificates. Read our guide to the rules, check the Digital Sky platform before each flight and fly responsibly.',
        ],
      },
      {
        h: 'EGIRE Robotics',
        p: [
          'EGIRE Robotics is an Indian training company for FPV drones, AI and robotics. We run workshops at colleges, courses for individuals and supply drone spares. Send an enquiry to learn, build or bring a workshop to your campus.',
        ],
      },
    ],
    faq: [
      { q: 'Who is EGIRE Robotics?', a: 'An Indian FPV drone, AI and robotics training company that teaches learners from age 5 to 45 and supplies drone spares.' },
      { q: 'Can I learn to build a drone in India with EGIRE Robotics?', a: 'Yes. Our build workshops and 90-day course take you from parts to a tuned, flying drone.' },
    ],
  },
]
