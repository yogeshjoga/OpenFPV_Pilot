export const CATEGORY_OPTIONS = [
  { value: 'frames', label: 'Frame' },
  { value: 'motors', label: 'Motors' },
  { value: 'esc', label: 'ESC (Electronic Speed Controller)' },
  { value: 'flight-controllers', label: 'Flight Controller (FC)' },
  { value: 'batteries', label: 'Battery' },
  { value: 'cameras', label: 'FPV Camera' },
  { value: 'vtx', label: 'VTX (Video Transmitter)' },
  { value: 'receivers', label: 'Receiver (RX)' },
  { value: 'goggles', label: 'FPV Goggles' },
  { value: 'props', label: 'Propellers' },
  { value: 'drones', label: 'Complete FPV Drone (Pre-built)' },
  { value: 'tools', label: 'Tools' }
];

export const GLOBAL_SPECS = [
  { name: 'weight', label: 'Weight' },
  { name: 'dimensions', label: 'Dimensions' },
  { name: 'material', label: 'Material' },
  { name: 'compatibility', label: 'Compatibility' },
];

export const RECOMMENDATION_TAGS = [
  'Best for Beginners',
  'High Speed Build',
  'Long Range Setup',
  'Budget Friendly',
  'Cinematic Choice',
  'Pro Racing'
];

export const USE_CASES = [
  'Beginner',
  'Freestyle',
  'Racing',
  'Cinematic',
  'Long Range'
];

export const CATEGORY_SPECS = {
  motors: [
    { name: 'kvRating', label: 'KV Rating (e.g. 2300KV)' },
    { name: 'statorSize', label: 'Stator Size (e.g. 2207)' },
    { name: 'voltageSupport', label: 'Voltage Support (4S / 6S)' },
    { name: 'maxCurrent', label: 'Max Current (A)' },
    { name: 'maxThrust', label: 'Max Thrust (grams)' },
    { name: 'recPropSize', label: 'Recommended Prop Size' },
    { name: 'shaftDiameter', label: 'Shaft Diameter' },
    { name: 'mountingPattern', label: 'Mounting Pattern' },
    { name: 'efficiency', label: 'Efficiency (g/W) (Optional)' },
    { name: 'internalResistance', label: 'Internal Resistance (Optional)' },
    { name: 'bearingType', label: 'Bearing Type (Optional)' },
  ],
  esc: [
    { name: 'currentRating', label: 'Current Rating (e.g. 45A, 60A)' },
    { name: 'burstCurrent', label: 'Burst Current' },
    { name: 'inputVoltage', label: 'Input Voltage (3S-6S)' },
    { name: 'firmware', label: 'Firmware (BLHeli_S / BLHeli_32)' },
    { name: 'protocol', label: 'Protocol (DShot300/600/1200)' },
    { name: 'becOutput', label: 'BEC Output (5V/9V etc.)' },
    { name: 'mountingSize', label: 'Mounting Size (20x20 / 30x30)' },
  ],
  'flight-controllers': [
    { name: 'processor', label: 'Processor (F4 / F7 / H7)' },
    { name: 'gyro', label: 'Gyro (MPU6000, ICM20602 etc.)' },
    { name: 'uartPorts', label: 'UART Ports' },
    { name: 'osdSupport', label: 'OSD Support' },
    { name: 'blackboxSupport', label: 'Blackbox Support' },
    { name: 'inputVoltage', label: 'Input Voltage' },
    { name: 'becOutput', label: 'BEC Output' },
    { name: 'mountingSize', label: 'Mounting Size' },
    { name: 'firmware', label: 'Firmware (Betaflight / INAV etc.)' },
  ],
  batteries: [
    { name: 'capacity', label: 'Capacity (mAh)' },
    { name: 'voltage', label: 'Voltage (e.g. 4S, 6S)' },
    { name: 'cRating', label: 'C Rating' },
    { name: 'connectorType', label: 'Connector Type (XT60, XT30)' },
    { name: 'maxDischargeCurrent', label: 'Max Discharge Current' },
  ],
  cameras: [
    { name: 'sensorType', label: 'Sensor Type' },
    { name: 'resolution', label: 'Resolution (e.g. 1200TVL / HD)' },
    { name: 'latency', label: 'Latency' },
    { name: 'fov', label: 'FOV (Field of View)' },
    { name: 'aspectRatio', label: 'Aspect Ratio (4:3 / 16:9)' },
    { name: 'voltageInput', label: 'Voltage Input' },
    { name: 'size', label: 'Size (Micro / Nano)' },
  ],
  vtx: [
    { name: 'outputPower', label: 'Output Power (25mW/200mW/1W)' },
    { name: 'frequencyBands', label: 'Frequency Bands' },
    { name: 'channels', label: 'Channels' },
    { name: 'inputVoltage', label: 'Input Voltage' },
    { name: 'smartaudioSupport', label: 'SmartAudio / Tramp support' },
    { name: 'antennaConnector', label: 'Antenna Connector (MMCX/SMA/UFL)' },
    { name: 'mountingSize', label: 'Mounting Size' },
  ],
  receivers: [
    { name: 'protocol', label: 'Protocol (ELRS / Crossfire / SBUS)' },
    { name: 'frequency', label: 'Frequency (2.4GHz / 900MHz)' },
    { name: 'telemetrySupport', label: 'Telemetry Support' },
    { name: 'range', label: 'Range' },
    { name: 'antennaType', label: 'Antenna Type' },
  ],
  goggles: [
    { name: 'resolution', label: 'Resolution' },
    { name: 'screenType', label: 'Screen Type (LCD / OLED)' },
    { name: 'fov', label: 'FOV' },
    { name: 'latency', label: 'Latency' },
    { name: 'dvrSupport', label: 'DVR Support' },
    { name: 'receiverType', label: 'Receiver Type (Analog / Digital)' },
    { name: 'batteryType', label: 'Battery Type' },
  ],
  frames: [
    { name: 'size', label: 'Size (e.g. 5-inch, 7-inch)' },
    { name: 'wheelbase', label: 'Wheelbase (mm)' },
    { name: 'stackMount', label: 'Stack Mount (20x20 / 30x30)' },
    { name: 'armThickness', label: 'Arm Thickness' },
  ],
  props: [
    { name: 'size', label: 'Size (e.g. 5x4.3x3)' },
    { name: 'pitch', label: 'Pitch' },
    { name: 'bladeCount', label: 'Blade Count' },
    { name: 'hubSize', label: 'Hub Size' },
  ],
  drones: [
    { name: 'frameSize', label: 'Frame Size' },
    { name: 'motorKv', label: 'Motor + KV' },
    { name: 'escRating', label: 'ESC Rating' },
    { name: 'fc', label: 'Flight Controller' },
    { name: 'batteryType', label: 'Battery Type (4S/6S)' },
    { name: 'cameraVtx', label: 'Camera + VTX' },
    { name: 'receiverType', label: 'Receiver Type' },
    { name: 'maxSpeed', label: 'Max Speed' },
    { name: 'flightTime', label: 'Flight Time' },
    { name: 'range', label: 'Range' },
  ],
  tools: [
    { name: 'type', label: 'Type (Soldering Iron, Toolkit, etc.)' },
    { name: 'powerRating', label: 'Power Rating (Watt)' },
    { name: 'temperatureRange', label: 'Temperature Range' },
    { name: 'includedAccessories', label: 'Included Accessories' },
  ],
};
