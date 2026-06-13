export const PREREQUISITES_DATA = [
  {
    category: '🧰 Tools',
    items: [
      {
        name: 'Soldering Iron (Temperature Controlled)',
        description: 'A precision heating tool utilized to melt solder, effectively joining electrical components.',
        whenToUse: 'Required during electrical assembly, motor wiring, and component replacement or repair.',
        whereToUse: 'Applied to flight controllers, ESC pads, battery leads, and receiver wiring interfaces.',
        whyToUse: 'Precise temperature control is essential; small pads require lower heat to prevent delamination, whereas large ground pads necessitate high thermal output to ensure solid connections.',
        impact: 'Improper soldering is a primary cause of system failure. A high-quality iron ensures robust, oxidation-free joints capable of withstanding severe operational vibrations.'
      },
      {
        name: 'Solder Wire (Lead / Lead-Free)',
        description: 'A metal alloy wire featuring a flux core that melts to form reliable electrical connections.',
        whenToUse: 'Utilized whenever joining two wires or bonding a wire to a PCB pad.',
        whereToUse: 'Applicable anywhere electrical contact must be permanently established.',
        whyToUse: 'A 63/37 (tin/lead) alloy is optimal for drone assembly due to its lower melting point and superior flow characteristics compared to lead-free alternatives.',
        impact: 'High-quality solder flows efficiently, accelerating the build process and establishing physically stronger electrical connections.'
      },
      {
        name: 'Flux',
        description: 'A chemical cleaning agent that facilitates the soldering process by eliminating oxidation.',
        whenToUse: 'Applied prior to soldering oxidized joints, heavy ground pads, or when solder fails to flow smoothly.',
        whereToUse: 'Utilized on PCB pads and bare wire ends prior to the tinning process.',
        whyToUse: 'Flux reduces surface tension, enabling solder to flow instantaneously into a uniform bead rather than adhering improperly to the iron.',
        impact: 'Significantly reduces the occurrence of cold solder joints and protects delicate components from thermal damage.'
      },
      {
        name: 'Solder Wick (Desoldering Braid)',
        description: 'A braided copper wire designed to extract molten solder via capillary action.',
        whenToUse: 'Required for correcting errors, removing components, or cleaning excess solder from PCB pads.',
        whereToUse: 'Primarily used on flight controller pads or ESCs during maintenance and repair procedures.',
        whyToUse: 'Extracting excess solder is highly difficult without wick. It effectively prepares surfaces for clean, reliable new joints.',
        impact: 'Prevents solder bridges and short circuits between densely packed electronic components.'
      },
      {
        name: 'Solder Sucker',
        description: 'A spring-loaded vacuum device engineered to extract large quantities of molten solder.',
        whenToUse: 'Employed when removing substantial connections, such as XT60 battery wires from power distribution boards.',
        whereToUse: 'Utilized on heavy-gauge wire pads and large terminals.',
        whyToUse: 'Significantly more efficient than solder wick for removing massive solder joints.',
        impact: 'Accelerates repair and maintenance procedures on primary power delivery components.'
      },
      {
        name: 'Helping Hands / PCB Holder',
        description: 'An adjustable clamping system equipped with alligator clips to secure components firmly.',
        whenToUse: 'Utilized to stabilize the flight controller or wires during intricate soldering procedures.',
        whereToUse: 'Deployed on the workbench during complex assembly and soldering stages.',
        whyToUse: 'Provides essential stability, as both hands are required to manipulate the soldering iron and solder wire simultaneously.',
        impact: 'Enhances precision, prevents thermal injuries, and eliminates joint instability caused by hand tremors.'
      },
      {
        name: 'Heat Gun / Lighter',
        description: 'A thermal tool utilized to apply high heat for shrinking heat-shrink tubing.',
        whenToUse: 'Applied after soldering wire joints (e.g., motor wires) to provide electrical insulation.',
        whereToUse: 'Utilized over exposed wire splices or around vulnerable antenna bases.',
        whyToUse: 'A heat gun delivers consistent, even heat, preventing the tubing from sustaining thermal damage often caused by direct flames.',
        impact: 'Mitigates the risk of short circuits resulting from conductive carbon fiber frames contacting exposed wiring.'
      },
      {
        name: 'Wire Stripper',
        description: 'A specialized tool designed to remove silicone insulation from wire ends without damaging the internal copper core.',
        whenToUse: 'Required prior to tinning and soldering any electrical wire.',
        whereToUse: 'Utilized on silicone motor wires, receiver cables, and battery leads.',
        whyToUse: 'Alternative cutting tools frequently sever copper strands, which reduces the wire\'s current-carrying capacity.',
        impact: 'Ensures the maximum cross-sectional area of the wire is preserved for optimal current flow.'
      },
      {
        name: 'Wire Cutter (Flush Cutter)',
        description: 'A precision cutting tool engineered to cut cleanly and flush against a flat surface.',
        whenToUse: 'Employed for trimming excess wire length and cutting zip ties flush.',
        whereToUse: 'Applied to through-hole component leads and zip tie tails.',
        whyToUse: 'Standard cutters leave sharp, hazardous protrusions on zip ties. Flush cutters ensure a smooth, flat edge.',
        impact: 'Promotes clean wire routing and prevents lacerations during drone handling and maintenance.'
      },
      {
        name: 'Needle Nose Pliers',
        description: 'Pliers featuring elongated, narrow jaws optimized for gripping objects in confined spaces.',
        whenToUse: 'Utilized for retrieving dropped hardware, securing miniature nuts, or tightening zip ties.',
        whereToUse: 'Employed deep within the electronics stack or around delicate peripheral components.',
        whyToUse: 'Standard tools and fingers are too bulky for the dense component layout of modern FPV drone frames.',
        impact: 'Improves efficiency and reduces frustration during intricate mechanical assembly tasks.'
      },
      {
        name: 'Hex Driver Set (1.5mm / 2mm / 2.5mm)',
        description: 'Precision screwdrivers designed specifically for hexagonal socket screws standard in FPV drone assembly.',
        whenToUse: 'Required for frame construction, motor mounting, and securing structural plates.',
        whereToUse: 'Utilized on all M2 and M3 structural fasteners throughout the drone.',
        whyToUse: 'Standard Allen keys strip fastener heads easily. Dedicated drivers provide superior torque and precision.',
        impact: 'Prevents stripped screw heads, ensuring components can be safely installed and removed.'
      },
      {
        name: 'Screwdriver Set',
        description: 'A comprehensive set of standard Phillips and flathead screwdrivers.',
        whenToUse: 'Required for specific peripheral maintenance, such as action camera mounts or radio controllers.',
        whereToUse: 'Applied to goggles, radio transmitters, and peripheral equipment enclosures.',
        whyToUse: 'Essential for the teardown and maintenance of supplementary ecosystem hardware.',
        impact: 'Enables comprehensive maintenance of the entire FPV equipment ecosystem.'
      },
      {
        name: 'Tweezers (ESD Safe)',
        description: 'Anti-static precision tweezers designed for manipulating miniature electronic components.',
        whenToUse: 'Employed when positioning tiny receiver wires on pads or routing wires through restricted clearances.',
        whereToUse: 'Utilized directly on flight controller components or within tight carbon fiber frame cutouts.',
        whyToUse: 'ESD-safe construction prevents electrostatic discharge from damaging highly sensitive microchips.',
        impact: 'Substantially improves accuracy and safety when manipulating fine-gauge (e.g., 30 AWG) wiring.'
      },
      {
        name: 'Multimeter',
        description: 'An essential electronic diagnostic instrument used to measure voltage, current, and electrical resistance.',
        whenToUse: 'Mandatory prior to connecting the battery to the drone for the initial power-up.',
        whereToUse: 'Utilized for continuity testing across the primary XT60 power terminals.',
        whyToUse: 'Crucial for verifying the absence of short circuits (zero resistance) between positive and negative terminals.',
        impact: 'Prevents catastrophic electrical failure, safeguarding expensive electronics from severe damage.'
      },
      {
        name: 'Smoke Stopper',
        description: 'A resettable fuse or current-limiting circuit installed between the battery and the drone.',
        whenToUse: 'Employed during the initial battery connection on a new build or following significant repairs.',
        whereToUse: 'Installed in series with the primary XT60 power connector.',
        whyToUse: 'In the event of a short circuit, it trips instantaneously, severing power before electronic components are destroyed.',
        impact: 'Serves as the ultimate diagnostic safety mechanism, preventing immediate electrical fires.'
      },
      {
        name: 'Digital Caliper',
        description: 'A highly accurate precision measurement instrument.',
        whenToUse: 'Utilized for measuring frame standoffs, fastener lengths, and 3D printed component dimensions.',
        whereToUse: 'Applied exclusively to mechanical parts and structural hardware.',
        whyToUse: 'Installing a screw that exceeds the required length by even 1mm can pierce motor windings, destroying the motor.',
        impact: 'Ensures strict hardware compatibility and prevents critical mechanical failures.'
      },
      {
        name: 'Hot Glue Gun / Conformal Coating',
        description: 'Adhesive and protective materials utilized for sealing and insulating electronics.',
        whenToUse: 'Applied for protecting soldered connections from mechanical stress and weatherproofing the flight controller.',
        whereToUse: 'Utilized on antenna U.FL connectors and vulnerable wire bases.',
        whyToUse: 'Prevents miniature connectors from detaching during impacts and provides protection against moisture ingress.',
        impact: 'Substantially enhances overall durability and provides critical environmental resistance.'
      },
      {
        name: 'Double-Sided Tape (3M)',
        description: 'An industrial-strength, high-adhesion mounting tape.',
        whenToUse: 'Required for mounting receivers, video transmitters, or components lacking dedicated mounting hardware.',
        whereToUse: 'Applied between the carbon fiber frame and flat-bottomed electronic modules.',
        whyToUse: 'Effectively dampens high-frequency vibrations while securely retaining lightweight components.',
        impact: 'Ensures a clean, professional build, preventing loose components from shifting into rotating propellers.'
      },
      {
        name: 'Zip Ties',
        description: 'High-tensile nylon cable fastening ties.',
        whenToUse: 'Employed for securing motor wiring to frame arms and mounting antenna systems.',
        whereToUse: 'Applied along the carbon fiber arms and rear aluminum standoffs.',
        whyToUse: 'Serves as a universal and lightweight FPV mounting solution, keeping vulnerable wiring clear of propellers.',
        impact: 'Mitigates the most frequent cause of mid-air electrical failure: propeller-severed wiring.'
      },
      {
        name: 'Electrical Tape',
        description: 'Insulating adhesive tape (premium fabric tape, such as Tesa, is highly recommended).',
        whenToUse: 'Utilized for wrapping arms to secure ESC wiring or insulating sharp carbon fiber edges.',
        whereToUse: 'Applied primarily to the drone frame arms and wiring bundles.',
        whyToUse: 'Carbon fiber is highly conductive. Tape prevents wire insulation from fraying against sharp edges and causing short circuits.',
        impact: 'Effectively prevents catastrophic electrical shorts against the conductive carbon fiber chassis.'
      }
    ]
  },
  {
    category: '🔌 Wires',
    items: [
      {
        name: 'Silicone Wires (14 AWG – Battery Lead)',
        description: 'Thick, highly flexible wire engineered to conduct substantial burst currents (exceeding 100A).',
        whenToUse: 'Required when wiring the XT60 power connector to the ESC or Power Distribution Board (PDB).',
        whereToUse: 'Utilized exclusively for the main power delivery circuit.',
        whyToUse: 'Premium silicone insulation resists melting during high-temperature soldering, unlike standard PVC.',
        impact: 'Ensures the drone receives optimal voltage delivery required for aggressive maneuvers without thermal degradation.'
      },
      {
        name: 'Silicone Wires (16-18 AWG)',
        description: 'Medium-gauge wire designed for sustained, moderate current delivery.',
        whenToUse: 'Employed when extending motor wires or providing power to high-draw peripheral devices.',
        whereToUse: 'Utilized on motor connections and heavy-duty video transmitter units.',
        whyToUse: 'Provides an optimal balance between physical flexibility, weight reduction, and current capacity.',
        impact: 'Eliminates voltage bottlenecks to high-performance motors, maintaining system efficiency.'
      },
      {
        name: 'Silicone Wires (20–30 AWG – Signal Wires)',
        description: 'Fine-gauge wire optimized for low-current data transmission.',
        whenToUse: 'Required for wiring radio receivers, GPS modules, and camera video signal lines.',
        whereToUse: 'Utilized for connections between the flight controller and peripheral sensors.',
        whyToUse: 'Data signals draw negligible current; utilizing thicker gauge wire adds unnecessary weight and clutter.',
        impact: 'Maintains an optimal thrust-to-weight ratio while ensuring clean, organized wiring.'
      },
      {
        name: 'Coaxial Cable (VTX Antenna Extension)',
        description: 'A heavily shielded cable designed for high-frequency RF video transmission.',
        whenToUse: 'Required when extending a video transmitter output to a remote antenna mounting point.',
        whereToUse: 'Installed between the VTX module and the rear TPU antenna mount.',
        whyToUse: 'Unshielded wiring leaks radio frequency energy, severely degrading video feed range and quality.',
        impact: 'Ensures pristine, long-range video transmission by eliminating RF interference and signal degradation.'
      }
    ]
  },
  {
    category: '🔋 Power Connectors',
    items: [
      {
        name: 'XT60 Connectors (Male & Female)',
        description: 'The industry-standard, high-current, polarized connector for 5" FPV drones.',
        whenToUse: 'Employed to connect the high-capacity LiPo battery to the drone\'s power system.',
        whereToUse: 'Integrated into the primary main power lead.',
        whyToUse: 'Engineered to handle 60 amps continuous load, perfectly matching the sustained current draw of a 5" quadcopter.',
        impact: 'Prevents thermal throttling and connector melting at the critical power junction.'
      },
      {
        name: 'XT30 Connectors',
        description: 'A scaled-down, lighter variant of the standard XT60 connector.',
        whenToUse: 'Utilized on smaller 2" to 3" micro drones with lower current requirements.',
        whereToUse: 'Integrated into micro drone battery leads and ESC power inputs.',
        whyToUse: 'Provides significant weight savings for sub-250g builds that draw less than 30 amps of continuous current.',
        impact: 'Preserves critical payload capacity on micro-class drone builds.'
      },
      {
        name: 'Balance Connector (JST-XH)',
        description: 'The standard multi-wire diagnostic and charging plug integrated into LiPo batteries.',
        whenToUse: 'Required when connecting the battery to a balanced smart charger.',
        whereToUse: 'Plugged directly into the charger\'s balance board or integrated port.',
        whyToUse: 'Enables the charger to precisely monitor and balance the voltage of each individual internal cell.',
        impact: 'Prevents catastrophic battery failure by ensuring no single cell is overcharged beyond safe voltage limits.'
      }
    ]
  },
  {
    category: '🔗 Signal Connectors / Plugs',
    items: [
      {
        name: 'JST Connectors (PH 2.0 / SH 1.0 / GH)',
        description: 'Miniature precision connectors utilized for plug-and-play electronic integration.',
        whenToUse: 'Required when connecting digital VTX modules (e.g., DJI O3) or GPS units without direct soldering.',
        whereToUse: 'Utilized on dedicated flight controller integration ports.',
        whyToUse: 'Facilitates rapid, hot-swappable component replacements in the field without requiring soldering equipment.',
        impact: 'Substantially streamlines hardware maintenance and simplifies complex component upgrades.'
      },
      {
        name: 'Dupont / Servo Connectors',
        description: 'Standardized 3-pin rectangular connectors historically common in RC aviation.',
        whenToUse: 'Infrequently used in modern FPV; primarily reserved for fixed-wing aircraft or legacy PWM receivers.',
        whereToUse: 'Employed for legacy peripheral connections and older servo integrations.',
        whyToUse: 'Maintains universal standard compatibility with traditional radio control ecosystems outside of modern FPV.',
        impact: 'Ensures backward compatibility with standard RC servos and traditional receiver hardware.'
      }
    ]
  },
  {
    category: '⚡ Power Components',
    items: [
      {
        name: 'Capacitors (Low ESR, 25V / 35V / 50V)',
        description: 'High-capacity energy storage components functioning as electrical shock absorbers.',
        whenToUse: 'Strictly mandatory on all 4S-6S drone builds; must be soldered across the main battery input pads.',
        whereToUse: 'Installed directly at the main ESC battery input terminals.',
        whyToUse: 'Motors generate massive regenerative voltage spikes during active braking. Capacitors absorb and neutralize these spikes.',
        impact: 'Prevents catastrophic mid-flight failure of the ESC and video transmitter caused by voltage surges.'
      },
      {
        name: 'BEC (5V / 9V Voltage Regulators)',
        description: 'Battery Eliminator Circuit — a hardware module that steps down raw battery voltage to a stable lower voltage.',
        whenToUse: 'Required when powering a GoPro, 5V receiver, or digital air unit from a high-voltage primary battery.',
        whereToUse: 'Integrated onto the flight controller or installed as a standalone auxiliary board.',
        whyToUse: 'A 6S battery outputs up to 25.2V. Connecting a 5V receiver directly to this voltage will cause immediate destruction.',
        impact: 'Safely and reliably powers sensitive, low-voltage electronic peripherals.'
      }
    ]
  },
  {
    category: '📡 Antenna & RF Parts',
    items: [
      {
        name: 'SMA / RP-SMA Connectors',
        description: 'Robust, threaded metal coaxial antenna connectors.',
        whenToUse: 'Required for mounting heavy, durable video antennas securely to the drone chassis.',
        whereToUse: 'Integrated at the video transmitter output stage.',
        whyToUse: 'Offers unparalleled mechanical durability during crashes compared to fragile snap-on connectors.',
        impact: 'Ensures critical antenna hardware is not sheared off during high-velocity impacts.'
      },
      {
        name: 'U.FL (IPEX) / MMCX Connectors',
        description: 'Ultra-miniature, snap-on coaxial RF connectors.',
        whenToUse: 'Utilized for connecting the antenna directly to the VTX circuit board to save space.',
        whereToUse: 'Located internally within the drone electronics stack.',
        whyToUse: 'Provides massive reductions in weight and circuit board footprint for compact builds.',
        impact: 'Enables ultra-compact VTX designs, though reinforcement (e.g., conformal coating or adhesive) is recommended to prevent detachment.'
      }
    ]
  },
  {
    category: '🔩 Mounting Hardware',
    items: [
      {
        name: 'Frame Screws (M2 / M3) & Nylock Nuts',
        description: 'High-tensile titanium or steel metric structural fasteners.',
        whenToUse: 'Required for assembling the carbon fiber frame and mounting the brushless motors.',
        whereToUse: 'Applied to motors, structural arms, and the top chassis plate.',
        whyToUse: 'M3 hardware is the structural standard for 5" drones. Nylock nuts feature a nylon collar that prevents loosening under vibration.',
        impact: 'Ensures the structural integrity of the frame, preventing violent mid-air disassembly.'
      },
      {
        name: 'Nylon / Aluminum Standoffs',
        description: 'Structural columns utilized to separate the top and bottom carbon plates, housing the electronics.',
        whenToUse: 'Required for constructing the central protective cage for the electronics stack.',
        whereToUse: 'Installed vertically between the main carbon fiber chassis plates.',
        whyToUse: 'Provides necessary clearance for electronics while establishing the frame\'s 3D structural rigidity.',
        impact: 'Protects expensive flight controllers and VTX modules from direct impacts during inverted crashes.'
      },
      {
        name: 'Rubber Grommets (FC Soft Mount)',
        description: 'Silicone damping rings installed within the mounting holes of sensitive electronics.',
        whenToUse: 'Mandatory when mounting the flight controller to the central stack screws.',
        whereToUse: 'Installed within the flight controller and ESC mounting apertures.',
        whyToUse: 'Brushless motors generate intense high-frequency vibrations. Grommets absorb these harmonics before they interfere with the gyroscope.',
        impact: 'Prevents erratic flight behavior, "flyaways," and twitching caused by gyro desynchronization.'
      }
    ]
  },
  {
    category: '🧱 Frame Assembly Parts',
    items: [
      {
        name: 'Carbon Fiber Arms',
        description: 'The primary structural appendages of the drone chassis, milled from rigid carbon fiber.',
        whenToUse: 'Essential for providing leverage and establishing a mounting point for motors away from the center of mass.',
        whereToUse: 'Forms the foundational X or H geometry of the drone frame.',
        whyToUse: 'Extended arms increase flight stability, while thicker arms (5-6mm) provide necessary resistance against concrete impacts.',
        impact: 'Fundamentally defines the flight kinematics, resonance, and overall durability of the drone.'
      },
      {
        name: 'Battery Strap & Anti-Slip Pad',
        description: 'A high-tensile Kevlar strap paired with a high-friction silicone mounting pad.',
        whenToUse: 'Required for securing the heavy LiPo battery firmly to the chassis.',
        whereToUse: 'Applied to the top or bottom structural plate, depending on frame design.',
        whyToUse: 'A 200g battery maneuvering at 100km/h generates immense inertia. Without extreme grip, it becomes a dangerous projectile.',
        impact: 'Prevents catastrophic battery ejections, ensuring continuous power delivery during aggressive flight.'
      }
    ]
  },
  {
    category: '⚙️ Electronics (Wiring Side)',
    items: [
      {
        name: 'Flight Controller (FC)',
        description: 'The central processing unit of the drone, containing the gyroscope, main processor (F4/F7/H7), and operating system (e.g., Betaflight).',
        whenToUse: 'Serves as the central integration hub for wiring all peripherals (receiver, GPS, VTX).',
        whereToUse: 'Typically mounted at the top of the central electronics stack.',
        whyToUse: 'It mathematically translates pilot stick inputs and real-time gyro data into precise motor commands up to 8,000 times per second.',
        impact: 'Dictates the smoothness, responsiveness, and overall flight fidelity of the aircraft.'
      },
      {
        name: 'ESC (4-in-1)',
        description: 'The Electronic Speed Controller — a high-power module that manages raw battery distribution to the motors.',
        whenToUse: 'Required for interfacing the primary battery power with the individual brushless motors.',
        whereToUse: 'Typically mounted at the base of the central electronics stack for optimal cooling and power routing.',
        whyToUse: 'Converts low-voltage digital signals from the FC into high-current, 3-phase AC power required by the motors.',
        impact: 'Determines the absolute maximum thrust output, acceleration curve, and payload capacity.'
      },
      {
        name: 'Receiver (RX)',
        description: 'The dedicated radio telemetry module (e.g., ExpressLRS or Crossfire).',
        whenToUse: 'Wired to the flight controller via a standard 4-wire UART interface (5V, GND, TX, RX).',
        whereToUse: 'Generally mounted at the rear of the frame to maximize antenna clearance.',
        whyToUse: 'Essential for receiving highly compressed control link packets from the pilot\'s ground transmitter.',
        impact: 'Determines the operational range of the aircraft, dictating whether it can fly 100 meters or 10 miles.'
      },
      {
        name: 'VTX & FPV Camera',
        description: 'The Video Transmitter and optical sensor module, functioning as the visual system of the drone.',
        whenToUse: 'Wired directly to the flight controller to transmit real-time video telemetry back to the pilot\'s goggles.',
        whereToUse: 'The camera is mounted at the front, while the VTX is secured at the rear of the chassis.',
        whyToUse: 'Ultra-low-latency video transmission is absolutely critical; racing and freestyle flight are impossible with perceptible delay.',
        impact: 'Provides the essential first-person perspective required for high-speed navigation.'
      }
    ]
  },
  {
    category: '🔌 Wiring Accessories',
    items: [
      {
        name: 'Heat Shrink Tubing',
        description: 'Thermoplastic tubes that contract uniformly when heated to create a tight protective seal.',
        whenToUse: 'Required whenever a receiver board or raw soldered wire splice is exposed to the environment.',
        whereToUse: 'Applied over UART cable splices, bare receiver boards, and motor wire extensions.',
        whyToUse: 'Prevents electrical shorts and adds significant mechanical strain relief to vulnerable wire joints.',
        impact: 'Ensures a professional-grade build that remains reliable even in damp or rigorous environments.'
      }
    ]
  },
  {
    category: '🧪 Safety & Testing',
    items: [
      {
        name: 'LiPo Battery Checker',
        description: 'A portable diagnostic screen that interfaces with the battery\'s balance lead.',
        whenToUse: 'Mandatory before takeoff and immediately following every flight.',
        whereToUse: 'Plugged directly into the battery\'s JST-XH balance connector.',
        whyToUse: 'LiPo cells must never drop below 3.2V, or they suffer irreversible chemical damage. Constant monitoring is required.',
        impact: 'Prevents severe battery degradation and avoids catastrophic mid-air voltage collapse.'
      },
      {
        name: 'Fireproof LiPo Bag',
        description: 'A specialized containment bag lined with woven fiberglass.',
        whenToUse: 'Strictly required during the charging, transportation, and long-term storage of all LiPo batteries.',
        whereToUse: 'Utilized within the charging station setup or transport backpack.',
        whyToUse: 'Lithium Polymer batteries possess highly volatile chemistries. If punctured or overcharged, they can violently ignite.',
        impact: 'Provides critical fire containment, protecting property and preventing severe fire hazards.'
      }
    ]
  },
  {
    category: '💻 Software / Interface Tools',
    items: [
      {
        name: 'USB Type-C Cable',
        description: 'A high-speed data transmission cable.',
        whenToUse: 'Required for connecting the drone\'s flight controller to a PC running Betaflight Configurator.',
        whereToUse: 'Interfaced with the primary USB port on the flight controller.',
        whyToUse: 'Essential for flashing firmware, establishing receiver channels, and tuning PID loops.',
        impact: 'Software configuration is mandatory; an unconfigured drone cannot achieve stable flight.'
      }
    ]
  },
  {
    category: '🧠 Advanced (Optional for AI Builds)',
    items: [
      {
        name: 'Raspberry Pi / Companion Computer',
        description: 'An onboard microcomputer utilized for high-level autonomous processing and computer vision.',
        whenToUse: 'Required when engineering a drone capable of object tracking or autonomous code-driven flight.',
        whereToUse: 'Mounted securely on an extended top frame or custom secondary deck.',
        whyToUse: 'Standard flight controllers only handle low-level stabilization. Advanced AI requires Linux-based environments and OpenCV.',
        impact: 'Effectively transforms a manual remote-controlled drone into an intelligent, autonomous robotic platform.'
      }
    ]
  }
];
