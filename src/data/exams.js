export const EXAM_BANKS = {
  esc: {
    id: 'esc',
    title: 'ESC Certification Exam',
    questions: [
      { id: 'q1', difficulty: 'easy', question: 'What does ESC stand for?', options: ['Electronic Speed Controller', 'Electronic Signal Converter', 'Engine Speed Controller', 'Electric Switching Circuit'], answer: 0 },
      { id: 'q2', difficulty: 'easy', question: 'What is the main job of an ESC?', options: ['Store battery power', 'Control motor speed', 'Receive GPS signals', 'Record video'], answer: 1 },
      { id: 'q3', difficulty: 'easy', question: 'A 4-in-1 ESC controls how many motors?', options: ['1', '2', '4', '8'], answer: 2 },
      { id: 'q4', difficulty: 'easy', question: 'Most FPV drones use what type of motor?', options: ['Brushed DC Motor', 'Stepper Motor', 'Brushless Motor', 'Servo Motor'], answer: 2 },
      { id: 'q5', difficulty: 'easy', question: 'How many wires come out of a typical FPV brushless motor?', options: ['2', '3', '4', '5'], answer: 1 },
      { id: 'q6', difficulty: 'easy', question: 'The ESC converts battery DC power into:', options: ['AC Power', 'RF Signals', 'GPS Data', 'Video Signals'], answer: 0 },
      { id: 'q7', difficulty: 'easy', question: 'Which battery is commonly used in FPV drones?', options: ['Lead Acid', 'NiCd', 'LiPo', 'Alkaline'], answer: 2 },
      { id: 'q8', difficulty: 'easy', question: 'What component smooths voltage spikes?', options: ['Capacitor', 'Motor', 'Antenna', 'LED'], answer: 0 },
      { id: 'q9', difficulty: 'easy', question: 'Which firmware is popular in FPV ESCs?', options: ['Windows', 'Android', 'BLHeli', 'Ubuntu'], answer: 2 },
      { id: 'q10', difficulty: 'easy', question: 'Which protocol is commonly used today?', options: ['PWM', 'DShot600', 'UART', 'SPI'], answer: 1 },
      { id: 'q11', difficulty: 'easy', question: 'Which component acts as the brain of an ESC?', options: ['MOSFET', 'Capacitor', 'MCU', 'Diode'], answer: 2 },
      { id: 'q12', difficulty: 'easy', question: 'What does MCU stand for?', options: ['Main Control Unit', 'Microcontroller Unit', 'Motor Control Utility', 'Multi Current Unit'], answer: 1 },
      { id: 'q13', difficulty: 'easy', question: 'What component acts as an electronic switch?', options: ['MOSFET', 'Capacitor', 'Resistor', 'Coil'], answer: 0 },
      { id: 'q14', difficulty: 'easy', question: 'Tiny Whoops usually operate on:', options: ['1S–2S', '6S–8S', '10S–12S', '14S–16S'], answer: 0 },
      { id: 'q15', difficulty: 'easy', question: 'Current is measured in:', options: ['Volts', 'Watts', 'Amps', 'Ohms'], answer: 2 },
      
      { id: 'q16', difficulty: 'medium', question: 'What does "40A ESC" indicate?', options: ['Weight', 'Voltage', 'Maximum Continuous Current', 'RPM'], answer: 2 },
      { id: 'q17', difficulty: 'medium', question: 'A 5-inch freestyle drone typically uses:', options: ['5A ESC', '15A ESC', '45A ESC', '200A ESC'], answer: 2 },
      { id: 'q18', difficulty: 'medium', question: 'What is Back EMF?', options: ['Battery Voltage', 'Motor-generated Voltage', 'ESC Output Voltage', 'Receiver Signal'], answer: 1 },
      { id: 'q19', difficulty: 'medium', question: 'Sensorless ESCs determine rotor position using:', options: ['GPS', 'Gyroscope', 'Back EMF', 'Magnetometer'], answer: 2 },
      { id: 'q20', difficulty: 'medium', question: 'How many MOSFETs are generally required for one brushless motor?', options: ['2', '4', '6', '12'], answer: 2 },
      { id: 'q21', difficulty: 'medium', question: 'A 4-in-1 ESC for a quadcopter typically contains:', options: ['12 MOSFETs', '24 MOSFETs', '48 MOSFETs', '96 MOSFETs'], answer: 1 },
      { id: 'q22', difficulty: 'medium', question: 'Which component protects against voltage spikes?', options: ['TVS Diode', 'Antenna', 'GPS', 'Magnet'], answer: 0 },
      { id: 'q23', difficulty: 'medium', question: 'What is the purpose of a voltage regulator?', options: ['Increase RPM', 'Reduce Voltage', 'Improve GPS', 'Generate Video'], answer: 1 },
      { id: 'q24', difficulty: 'medium', question: 'DShot is:', options: ['Analog Protocol', 'Digital Protocol', 'Video Protocol', 'RF Protocol'], answer: 1 },
      { id: 'q25', difficulty: 'medium', question: 'Which signal does a Flight Controller send to ESC?', options: ['GPS Data', 'Motor Command', 'Video Feed', 'Telemetry Only'], answer: 1 },
      { id: 'q26', difficulty: 'medium', question: 'What happens if two motor wires are swapped?', options: ['ESC burns', 'Motor reverses direction', 'Battery explodes', 'RPM doubles'], answer: 1 },
      { id: 'q27', difficulty: 'medium', question: 'Why are capacitors added near battery pads?', options: ['Decoration', 'Noise Reduction', 'Cooling', 'Weight Balance'], answer: 1 },
      { id: 'q28', difficulty: 'medium', question: 'Which ESC firmware supports bidirectional DShot?', options: ['DOS', 'BLHeli32', 'Android', 'Linux'], answer: 1 },
      { id: 'q29', difficulty: 'medium', question: 'The ESC receives power directly from:', options: ['Flight Controller', 'Receiver', 'Battery', 'GPS'], answer: 2 },
      { id: 'q30', difficulty: 'medium', question: 'What does RPM mean?', options: ['Rotations Per Minute', 'Rotor Pulse Management', 'Rapid Power Module', 'Resistance Per Motor'], answer: 0 },
      { id: 'q31', difficulty: 'medium', question: 'What is telemetry?', options: ['Video Signal', 'Data Feedback from ESC', 'GPS Location', 'Radio Frequency'], answer: 1 },
      { id: 'q32', difficulty: 'medium', question: 'A larger propeller generally requires:', options: ['Lower Torque', 'More Current', 'Less Voltage', 'Less Power'], answer: 1 },
      { id: 'q33', difficulty: 'medium', question: 'Which drone typically needs the highest current ESC?', options: ['Tiny Whoop', '3-inch', '5-inch', '15-inch Heavy Lift'], answer: 3 },
      { id: 'q34', difficulty: 'medium', question: 'MOSFET losses mainly generate:', options: ['GPS Error', 'Heat', 'Video Noise', 'Vibration'], answer: 1 },
      { id: 'q35', difficulty: 'medium', question: 'What is a gate driver?', options: ['GPS Module', 'Motor Bearing', 'MOSFET Driver Circuit', 'Battery Charger'], answer: 2 },
      
      { id: 'q36', difficulty: 'hard', question: 'A 15-inch heavy lift drone running 12S batteries most likely requires:', options: ['5A ESC', '10A ESC', '15A ESC', '80A+ ESC'], answer: 3 },
      { id: 'q37', difficulty: 'hard', question: 'Increasing PWM frequency generally:', options: ['Makes ESC larger', 'Reduces Motor Noise', 'Increases GPS Accuracy', 'Reduces Voltage'], answer: 1 },
      { id: 'q38', difficulty: 'hard', question: 'Which formula calculates electrical power?', options: ['P = V × I', 'P = I / V', 'P = V²', 'P = R / I'], answer: 0 },
      { id: 'q39', difficulty: 'hard', question: 'A 6S battery has a nominal voltage of approximately:', options: ['7.4V', '11.1V', '22.2V', '44.4V'], answer: 2 },
      { id: 'q40', difficulty: 'hard', question: 'Why do ESCs need dead-time control?', options: ['Prevent GPS Loss', 'Avoid MOSFET Shoot-Through', 'Improve Video Quality', 'Increase Range'], answer: 1 },
      { id: 'q41', difficulty: 'hard', question: 'What occurs during MOSFET shoot-through?', options: ['Motor Stops', 'Direct Battery Short', 'RPM Increase', 'Signal Loss'], answer: 1 },
      { id: 'q42', difficulty: 'hard', question: 'Which motor KV is generally used for heavy-lift 15-inch drones?', options: ['3000 KV', '2500 KV', '1500 KV', '100–400 KV'], answer: 3 },
      { id: 'q43', difficulty: 'hard', question: 'What does bidirectional DShot enable?', options: ['GPS Navigation', 'RPM Feedback', 'Video Transmission', 'Battery Charging'], answer: 1 },
      { id: 'q44', difficulty: 'hard', question: 'A brushless motor\'s rotating magnetic field is produced by:', options: ['ESC Phase Switching', 'GPS Module', 'Receiver', 'Capacitor'], answer: 0 },
      { id: 'q45', difficulty: 'hard', question: 'What is ESC desync?', options: ['Battery Failure', 'Rotor Position Tracking Failure', 'GPS Drift', 'Propeller Damage'], answer: 1 },
      { id: 'q46', difficulty: 'hard', question: 'The purpose of current sensing is:', options: ['Measure Motor Load', 'Increase RPM', 'Improve GPS', 'Record Video'], answer: 0 },
      { id: 'q47', difficulty: 'hard', question: 'Which component is most likely to fail first during extreme overcurrent?', options: ['Antenna', 'MOSFET', 'Receiver', 'GPS'], answer: 1 },
      { id: 'q48', difficulty: 'hard', question: 'A 12S battery pack contains how many LiPo cells?', options: ['6', '8', '10', '12'], answer: 3 },
      { id: 'q49', difficulty: 'hard', question: 'What determines motor rotation direction?', options: ['Battery Brand', 'Propeller Color', 'Phase Sequence', 'ESC Weight'], answer: 2 },
      { id: 'q50', difficulty: 'hard', question: 'The primary function of the ESC in an FPV drone is:', options: ['Generate Video', 'Calculate GPS Coordinates', 'Convert DC Battery Power into Controlled 3-Phase AC for Brushless Motors', 'Control Radio Communication'], answer: 2 }
    ]
  },
  motor: {
    id: 'motor',
    title: 'Motors Certification Exam',
    questions: [] // Placeholder
  },
  fc: {
    id: 'fc',
    title: 'Flight Controller Certification Exam',
    questions: [] // Placeholder
  },
  propeller: {
    id: 'propeller',
    title: 'Propellers Certification Exam',
    questions: [] // Placeholder
  },
  vtx: {
    id: 'vtx',
    title: 'VTX & Camera Certification Exam',
    questions: [] // Placeholder
  },
  piloting: {
    id: 'piloting',
    title: 'Piloting Certification Exam',
    questions: [] // Placeholder
  },
  build: {
    id: 'build',
    title: 'Building Certification Exam',
    questions: [] // Placeholder
  },
  all: {
    id: 'all',
    title: 'Comprehensive Drone Certification',
    questions: [] // Will pull from all others dynamically later
  }
}
