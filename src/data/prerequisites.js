// ================================
// Drone Build Prerequisites Data
// ================================

export const PREREQUISITES_DATA = [
  {
    category: '🧰 Tools',
    items: [
      {
        name: 'Soldering iron (temperature controlled)',
        description: 'A tool that supplies precise heat to melt solder, joining electrical components.',
        whenToUse: 'Used during electrical assembly, motor wiring, and component replacement.',
        whereToUse: 'Flight controllers, ESC pads, battery leads, receiver wiring.',
        whyToUse: 'Temperature control is critical; small pads need low heat to avoid lifting, thick ground pads need high heat for solid joints.',
        impact: 'Poor soldering is the #1 cause of drone crashes. A good iron ensures solid, shiny joints that survive vibrations.'
      },
      {
        name: 'Solder wire (lead / lead-free)',
        description: 'Metal alloy wire containing flux core that melts to form electrical connections.',
        whenToUse: 'Whenever joining two wires or a wire to a PCB pad.',
        whereToUse: 'Anywhere electrical contact is established.',
        whyToUse: '63/37 (tin/lead) is easiest to work with for drones because of its lower melting point compared to lead-free.',
        impact: 'Good solder flows easily, speeding up the build and creating physically stronger connections.'
      },
      {
        name: 'Flux',
        description: 'A chemical cleaning agent that facilitates soldering by removing oxidation.',
        whenToUse: 'Applied before soldering dirty joints, ground pads, or when a joint refuses to flow.',
        whereToUse: 'On PCB pads and bare wire ends before tinning.',
        whyToUse: 'It breaks surface tension, allowing solder to flow instantly into a shiny bead rather than stubbornly sticking to the iron.',
        impact: 'Dramatically reduces cold solder joints and saves delicate components from overheating.',
      },
      {
        name: 'Solder wick (desoldering braid)',
        description: 'Braided copper wire that soaks up molten solder via capillary action.',
        whenToUse: 'When making a mistake, removing a component, or cleaning up a messy pad full of old solder.',
        whereToUse: 'Flight controller pads or ESCs during repairs.',
        whyToUse: 'Without it, removing excess solder is nearly impossible. It prepares a surface for a clean new joint.',
        impact: 'Prevents solder bridges (short circuits) between tiny adjacent pads.'
      },
      {
        name: 'Solder sucker',
        description: 'A spring-loaded vacuum syringe for removing large globs of molten solder.',
        whenToUse: 'Removing large connections like XT60 battery wires from power boards.',
        whereToUse: 'Heavy gauge wire pads.',
        whyToUse: 'Much faster than solder wick for massive joints.',
        impact: 'Speeds up repair work on main power components.'
      },
      {
        name: 'Helping hands / PCB holder',
        description: 'Adjustable clamps or alligator clips that hold components steady.',
        whenToUse: 'Used to hold the flight controller or wires while your hands navigate the iron and solder.',
        whereToUse: 'On your workbench during complex soldering steps.',
        whyToUse: 'Humans only have two hands; you need one for the iron, one for the solder, leaving none to hold the wire.',
        impact: 'Prevents burns, shaking hands, and imprecise joints.'
      },
      {
        name: 'Heat gun / lighter',
        description: 'A tool generating high heat used to shrink heat-shrink tubing.',
        whenToUse: 'After soldering a wire joint (e.g., motor wires) to insulate the connection.',
        whereToUse: 'Over exposed wire joints or around antennas.',
        whyToUse: 'A heat gun provides even heat, preventing the tubing from burning (which a lighter can cause).',
        impact: 'Protects against short circuits caused by carbon fiber frames touching exposed wires.'
      },
      {
        name: 'Wire stripper',
        description: 'Tool used to strip the silicone insulation off the wire ends without cutting the copper core.',
        whenToUse: 'Before tinning and soldering any wire.',
        whereToUse: 'On silicone motor wires, receiver wires, battery leads.',
        whyToUse: 'Using a knife often severs copper strands, reducing current capacity.',
        impact: 'Ensures maximum wire thickness is preserved for current flow.'
      },
      {
        name: 'Wire cutter (flush cutter)',
        description: 'A plier-like tool designed to cut cleanly flush against a surface.',
        whenToUse: 'Trimming excess wire, cutting zip ties flush.',
        whereToUse: 'Through-hole component legs, zip tie tails.',
        whyToUse: 'Standard cutters leave sharp points on zip ties that will slice your fingers. Flush cutters leave a flat edge.',
        impact: 'Clean wire runs and blood-free fingers when gripping your drone.'
      },
      {
        name: 'Needle nose pliers',
        description: 'Pliers with long, thin jaws for gripping in tight spaces.',
        whenToUse: 'Retrieving dropped screws, holding tiny nuts, or pulling zip ties tight.',
        whereToUse: 'Deep inside the drone stack or around delicate electronics.',
        whyToUse: 'Fingers are too large for the dense real estate of a 5" drone stack.',
        impact: 'Saves time and frustration during tight mechanical assembly.'
      },
      {
        name: 'Hex driver set (1.5mm / 2mm / 2.5mm)',
        description: 'Screwdrivers for hexagonal socket screws (standard in FPV).',
        whenToUse: 'Building the frame, mounting motors, securing the top plate.',
        whereToUse: 'All M2 and M3 structural screws on the drone.',
        whyToUse: 'Allen keys strip easily. Dedicated drivers offer torque and precision.',
        impact: 'Prevents stripped screws which can permanently trap components on the frame.'
      },
      {
        name: 'Screwdriver set',
        description: 'Standard Phillips and flathead drivers.',
        whenToUse: 'Rarely used in the frame, but needed for specific peripherals like action camera mounts or radio controllers.',
        whereToUse: 'Goggles, radios, and peripheral cases.',
        whyToUse: 'Necessary for tearing down supplementary gear.',
        impact: 'Allows full ecosystem maintenance.'
      },
      {
        name: 'Tweezers (ESD safe)',
        description: 'Anti-static tweezers for manipulating tiny objects.',
        whenToUse: 'Placing tiny receiver wires on pads, threading wires through small gaps.',
        whereToUse: 'Directly on flight controller pads or tight frame cutouts.',
        whyToUse: 'ESD safe prevents static discharge from killing delicate chips.',
        impact: 'Drastically improves accuracy when soldering 30 AWG wires.'
      },
      {
        name: 'Multimeter',
        description: 'An electronic measuring instrument for voltage, current, and resistance.',
        whenToUse: 'BEFORE plugging in the battery for the first time.',
        whereToUse: 'Continuity testing across the XT60 power pads.',
        whyToUse: 'To verify there is no short circuit (zero resistance) between positive and negative.',
        impact: 'Saves hundreds of dollars by catching a short before the battery fries the electronics.'
      },
      {
        name: 'Smoke stopper',
        description: 'A resettable fuse or lightbulb circuit inserted between battery and drone.',
        whenToUse: 'Plugging in the battery for the first time on a new build or after a repair.',
        whereToUse: 'In series with the XT60 connector.',
        whyToUse: 'If there is a short, it trips instantly, cutting power before magic smoke escapes.',
        impact: 'The ultimate insurance policy for any drone builder.'
      },
      {
        name: 'Digital caliper',
        description: 'Precision measuring tool.',
        whenToUse: 'Measuring frame standoffs, screw lengths, or 3D print dimensions.',
        whereToUse: 'Mechanical parts.',
        whyToUse: 'Using a screw that is 1mm too long can piece your motor windings, destroying the motor.',
        impact: 'Ensures hardware compatibility and prevents motor destruction.'
      },
      {
        name: 'Hot glue gun / Conformal Coating',
        description: 'Adhesive/protective material for sealing electronics.',
        whenToUse: 'Protecting soldered pads from stress or weatherproofing the flight controller.',
        whereToUse: 'Antenna U.FL connectors, wire bases.',
        whyToUse: 'Prevents tiny connectors from popping off in crashes and protects against wet grass.',
        impact: 'Vastly improves durability and waterproofs the drone.'
      },
      {
        name: 'Double-sided tape (3M)',
        description: 'High-strength mounting tape.',
        whenToUse: 'Mounting receivers, VTXs, or components that don\'t have screw holes.',
        whereToUse: 'Between the frame and flat-bottomed components.',
        whyToUse: 'Absorbs vibrations and securely holds lightweight parts.',
        impact: 'Clean build without loose components rattling into the props.'
      },
      {
        name: 'Zip ties',
        description: 'Nylon cable ties.',
        whenToUse: 'Securing motor wires to arms, mounting antennas.',
        whereToUse: 'Along the carbon fiber arms and rear standoffs.',
        whyToUse: 'The universal FPV mounting solution. They keep wires out of the spinning propellers.',
        impact: 'Prevents the most common cause of mid-air failure: chopped wires.'
      },
      {
        name: 'Electrical tape',
        description: 'Insulating tape (though fabric tape like Tesa is preferred).',
        whenToUse: 'Wrapping arms to secure ESC wiring or insulating carbon fiber edges.',
        whereToUse: 'Drone arms.',
        whyToUse: 'Carbon fiber is highly conductive. Tape prevents wires from wearing against sharp edges and shorting out.',
        impact: 'Prevents electrical shorts on the conductive carbon frame.'
      }
    ]
  },
  {
    category: '🔌 Wires',
    items: [
      {
        name: 'Silicone wires (14 AWG – battery lead)',
        description: 'Thick, flexible wire designed to carry immense burst currents (100A+).',
        whenToUse: 'Wiring the XT60 power connector to the ESC/PDB.',
        whereToUse: 'Main power delivery.',
        whyToUse: 'Silicone insulation does not melt during soldering unlike PVC.',
        impact: 'Ensures the drone receives the massive voltage spikes needed for acrobatic punch-outs without burning wires.'
      },
      {
        name: 'Silicone wires (16-18 AWG)',
        description: 'Medium thickness wire for sustained moderate current.',
        whenToUse: 'Extending motor wires or powering high-draw peripherals.',
        whereToUse: 'Motors, heavy VTX units.',
        whyToUse: 'Balances flexibility and weight with current capacity.',
        impact: 'Prevents voltage bottlenecks to heavy motors.'
      },
      {
        name: 'Silicone wires (20–30 AWG – signal wires)',
        description: 'Very thin wire for transmitting data.',
        whenToUse: 'Wiring receivers, GPS, camera video signals.',
        whereToUse: 'Between flight controller and peripherals.',
        whyToUse: 'Data signals draw almost zero current, so thick wires just add unnecessary weight.',
        impact: 'Keeps the drone light and wiring neat.'
      },
      {
        name: 'Coaxial cable (for VTX antenna if needed)',
        description: 'Shielded cable for RF video transmission.',
        whenToUse: 'Extending a video transmitter to an antenna mount.',
        whereToUse: 'Between the VTX and the rear TPU antenna mount.',
        whyToUse: 'Unshielded wire leaks radio frequency, destroying your video feed range.',
        impact: 'Allows long-range clear video by preventing RF interference.'
      }
    ]
  },
  {
    category: '🔋 Power Connectors',
    items: [
      {
        name: 'XT60 connectors (male & female)',
        description: 'The standard high-current unpolarized connector for 5" drones.',
        whenToUse: 'Connecting the LiPo battery to the drone.',
        whereToUse: 'Main power lead.',
        whyToUse: 'Handles 60 amps continuous, perfectly matching the sustained draw of a 5" drone.',
        impact: 'Ensures no bottleneck or melting at the power connection.'
      },
      {
        name: 'XT30 connectors',
        description: 'Smaller version of XT60.',
        whenToUse: 'Used on smaller 2" to 3" micro drones, not 5".',
        whereToUse: 'Micro drone battery leads.',
        whyToUse: 'Lighter weight for builds that pull less than 30 amps.',
        impact: 'Saves critical grams on micro builds.'
      },
      {
        name: 'Balance connector (JST-XH)',
        description: 'The small multi-wire plug on a LiPo battery.',
        whenToUse: 'Plugging the battery into the charger.',
        whereToUse: 'Charger balance board.',
        whyToUse: 'Allows the charger to monitor and balance each individual cell voltage within the battery.',
        impact: 'Prevents battery explosions by ensuring no single cell is overcharged.'
      }
    ]
  },
  {
    category: '🔗 Signal Connectors / Plugs',
    items: [
      {
        name: 'JST connectors (PH 2.0 / SH 1.0 / GH)',
        description: 'Tiny white plastic connectors used for plug-and-play electronics.',
        whenToUse: 'Connecting digital VTXs (like DJI O3) or GPS units without soldering.',
        whereToUse: 'Flight controller ports.',
        whyToUse: 'Allows hot-swapping parts in the field without a soldering iron.',
        impact: 'Makes maintenance and parts swapping drastically easier.'
      },
      {
        name: 'Dupont / Servo connectors',
        description: 'Standard 3-pin black connectors.',
        whenToUse: 'Rare in modern FPV, mostly used in fixed-wing or older PWM receivers.',
        whereToUse: 'Legacy peripheral connections.',
        whyToUse: 'Universal standard outside of FPV.',
        impact: 'Allows compatibility with standard RC servos.'
      }
    ]
  },
  {
    category: '⚡ Power Components',
    items: [
      {
        name: 'Capacitors (low ESR, 25V / 35V / 50V)',
        description: 'Energy storage components acting as electrical shock absorbers.',
        whenToUse: 'Absolutely mandatory on 4S-6S drone builds. Solder across the battery pads.',
        whereToUse: 'Main ESC battery input pads.',
        whyToUse: 'Motors act as generators when braking, sending massive voltage spikes back to the ESC. Cap catches these spikes.',
        impact: 'Prevents your ESC and video transmitter from burning up mid-flight due to voltage spikes.'
      },
      {
        name: 'BEC (5V / 9V regulators)',
        description: 'Battery Eliminator Circuit - steps down raw battery voltage.',
        whenToUse: 'Powering a GoPro, 5V receiver, or DJI Air Unit from a high voltage battery.',
        whereToUse: 'Flight controller or standalone board.',
        whyToUse: 'A 6S battery outputs 25V. Plugging a 5V receiver into 25V will explode it instantly.',
        impact: 'Safely powers fragile electronics.'
      }
    ]
  },
  {
    category: '📡 Antenna & RF Parts',
    items: [
      {
        name: 'SMA / RP-SMA connectors',
        description: 'Large, screw-on metal antenna connectors.',
        whenToUse: 'Mounting heavy, durable video antennas to the frame.',
        whereToUse: 'Video transmitter output.',
        whyToUse: 'Incredibly durable in crashes compared to snap-on connectors.',
        impact: 'Ensures your antenna doesn\'t rip off in a high-speed branch impact.'
      },
      {
        name: 'U.FL (IPEX) / MMCX connectors',
        description: 'Tiny snap-on antenna connectors.',
        whenToUse: 'Connecting the antenna directly to the VTX circuit board.',
        whereToUse: 'Inside the drone stack.',
        whyToUse: 'Saves massive amounts of weight and circuit board space.',
        impact: 'Allows ultra-compact VTX designs, though they pop off easily in crashes (hot glue recommended).'
      }
    ]
  },
  {
    category: '🔩 Mounting Hardware',
    items: [
      {
        name: 'Frame screws (M2 / M3) & Nylock Nuts',
        description: 'Titanium or steel metric hardware.',
        whenToUse: 'Bolting the carbon fiber frame and motors together.',
        whereToUse: 'Motors, arms, top plate.',
        whyToUse: 'M3 is the standard for 5" drone structural integrity. Nylock nuts have nylon inserts that never vibrate loose.',
        impact: 'Keeps the drone from violently disassembling itself mid-air.'
      },
      {
        name: 'Nylon / Aluminum standoffs',
        description: 'Columns that space the top and bottom plates, housing the electronics.',
        whenToUse: 'Creating the central cage for the stack.',
        whereToUse: 'Between carbon fiber plates.',
        whyToUse: 'Provides clearance for electronics while giving the frame its 3D structural rigidity.',
        impact: 'Protects the $150 flight controller in the event of an upside-down crash.'
      },
      {
        name: 'Rubber grommets (FC soft mount)',
        description: 'Silicone dampers that screws pass through.',
        whenToUse: 'Mounting the flight controller to the screws.',
        whereToUse: 'Flight controller mounting holes.',
        whyToUse: 'Motors generate intense high-frequency vibrations. Grommets absorb them before they reach the FC\'s sensitive gyro.',
        impact: 'Prevents "flyaways" and twitchy behavior caused by a confused gyroscope.'
      }
    ]
  },
  {
    category: '🧱 Frame Assembly Parts',
    items: [
      {
        name: 'Arms',
        description: 'The protruding carbon fiber beams.',
        whenToUse: 'Provides leverage and a mounting point for motors far from the center.',
        whereToUse: 'The X or H shape of the drone.',
        whyToUse: 'Longer arms mean more stability; thicker arms (5-6mm) withstand impacts with concrete.',
        impact: 'Defines the flight characteristics and durability of the drone.'
      },
      {
        name: 'Battery strap & pad',
        description: 'Kevlar strap and grippy silicone pad.',
        whenToUse: 'Securing the heavy LiPo battery to the frame.',
        whereToUse: 'Top or bottom plate.',
        whyToUse: 'A 200g battery turning at 100km/h carries immense inertia. Without grip, it turns into a projectile.',
        impact: 'Prevents battery ejections which immediately kill drone power in the air.'
      }
    ]
  },
  {
    category: '⚙️ Electronics (Wiring Side)',
    items: [
      {
        name: 'Flight controller (FC)',
        description: 'The brain. Contains the gyro, processor (F4/F7/H7), and Betaflight OS.',
        whenToUse: 'Wiring all peripherals (receiver, GPS, VTX) to central command.',
        whereToUse: 'Top of the electronics stack.',
        whyToUse: 'It translates your stick movements and gyro data into motor commands 8,000 times a second.',
        impact: 'Determines how smooth and responsive the drone feels.'
      },
      {
        name: 'ESC (4-in-1)',
        description: 'Electronic Speed Controller — routes raw battery power to the motors.',
        whenToUse: 'Wiring motors and battery power.',
        whereToUse: 'Bottom of the electronics stack.',
        whyToUse: 'Takes low-voltage signals from the FC and converts them into high-current 3-phase AC power for motors.',
        impact: 'Determines the maximum thrust and payload capacity.'
      },
      {
        name: 'Receiver (RX)',
        description: 'The radio antenna module (e.g., ExpressLRS).',
        whenToUse: 'Wired via 4 wires: 5V, GND, TX, RX.',
        whereToUse: 'Mounted off the back of the frame.',
        whyToUse: 'To receive control link packets from your controller on the ground.',
        impact: 'Determines if you can fly 100 meters or 10 miles away.'
      },
      {
        name: 'VTX & FPV Camera',
        description: 'Video Transmitter and "eye" of the drone.',
        whenToUse: 'Wired to transmit live video to your goggles.',
        whereToUse: 'Camera at the front, VTX at the rear.',
        whyToUse: 'Without low-latency 0-delay video, racing and freestyle are impossible.',
        impact: 'Gives you the first-person perspective.'
      }
    ]
  },
  {
    category: '🔌 Wiring Accessories',
    items: [
      {
        name: 'Heat shrink tubes',
        description: 'Plastic tubes that shrink when heated tightly around joints.',
        whenToUse: 'Whenever a receiver or raw soldered wire is exposed to the elements.',
        whereToUse: 'Over UART cable splices or bare receiver boards.',
        whyToUse: 'Prevents shorts, adds mechanical strength to the wire joint.',
        impact: 'A clean, professional build that doesn\'t short out in damp environments.'
      }
    ]
  },
  {
    category: '🧪 Safety & Testing',
    items: [
      {
        name: 'LiPo battery checker',
        description: 'Small screen device that plugs into the balance lead.',
        whenToUse: 'Before and after every flight.',
        whereToUse: 'Plugged into the battery.',
        whyToUse: 'LiPos must not drop below 3.2V per cell or they are permanently damaged. Must check constantly.',
        impact: 'Prevents battery degradation and catastrophic mid-air battery sags.'
      },
      {
        name: 'Fireproof LiPo bag',
        description: 'Fiberglass lined bag.',
        whenToUse: 'Charging, transporting, and storing batteries.',
        whereToUse: 'In your backpack or charging station.',
        whyToUse: 'LiPos are unstable chemistries. If punctured or overcharged, they violently ignite.',
        impact: 'Prevents your house or car from burning down.'
      }
    ]
  },
  {
    category: '💻 Software / Interface Tools',
    items: [
      {
        name: 'USB Type-C Cable',
        description: 'Data connection cable.',
        whenToUse: 'Connecting the flight controller to your PC to use Betaflight Configurator.',
        whereToUse: 'Flight controller USB port.',
        whyToUse: 'To flash firmware, set up receiver channels, and tune PIDs.',
        impact: 'No build flies without software configuration.'
      }
    ]
  },
  {
    category: '🧠 Advanced (Optional for AI Builds)',
    items: [
      {
        name: 'Raspberry Pi / Companion Computer',
        description: 'Onboard computer for autonomous processing.',
        whenToUse: 'When building a drone that tracks objects or flies via code instead of radio.',
        whereToUse: 'Mounted on an extended top frame.',
        whyToUse: 'The flight controller only handles stabilization. True "AI" requires Linux and OpenCV.',
        impact: 'Transforms a manual hobby drone into an intelligent robotic platform.'
      }
    ]
  }
];
