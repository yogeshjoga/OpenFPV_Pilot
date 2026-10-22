// GEPRC boards, from the maker's product manuals (https://geprc.com/electronics/fc-manual/).
// Only the facts are taken from the manuals: sizes, pad and connector names, and where each one sits. The drawings are
// our own, in the bench's own style.
//
// How to read a board here: `front` lists the connectors along each edge (top to bottom, or left to right) as
// [group name, 'pin names in order']; `back` lists the solder pads as the manual draws the back: left rows are
// 'OUTER INNER', right rows are 'INNER OUTER', and '-' is an empty place.
import { escBoard } from './esc.js'
import { flightController } from './fc.js'

/** Every GEPRC board, in the order they are listed. */
export const GEPRC = []

export const BRAND = { brand: 'GEPRC', source: { label: 'GEPRC product manual', url: 'https://geprc.com/electronics/fc-manual/' } }
const fc = (o) => flightController({ ...BRAND, ...o })
const esc = (o) => escBoard({ ...BRAND, ...o })

// ---------------------------------------------------------------------------------------------------------------
// Flight controllers
// ---------------------------------------------------------------------------------------------------------------

GEPRC.push(
  fc({
    id: 'geprc-f405-hd-v3',
    model: 'GEP-F405-HD V3',
    mm: 37.2,
    blurb: 'F405 flight controller for digital HD systems. 6 UARTs, and a 12 V regulator for the video unit.',
    specs: ['STM32F405, ICM-42688-P gyro', '37.2 x 37.2 mm, 30.5 mm mounting', '3S to 6S', '5 V 3 A and 12 V 2.5 A regulators', '6 UARTs'],
    mcu: 'STM32F405',
    usb: 'bottom',
    front: {
      left: [['LED', 'GND 5V LED'], ['ESC', 'R4 CUR M4 M3 M2 M1 BAT GND'], ['CAM', 'CAM GND 5V']],
      right: [['UART2', 'GND 5V R2 T2'], ['DJI', 'S.B GND R1 T1 GND 12V'], ['VTX', 'GND 12V VTX T1']],
    },
    back: {
      left: ['5V 5V', 'GND BZ-', 'CAM LED', 'GND GND', 'BAT T5', 'M1 R5', 'M2 5V', 'M3 GND', 'M4 M5', 'CUR M6', 'R4 T4'],
      right: ['BAT VTX', 'GND 12V', '5V GND', 'R6 T1', 'T6 R1', 'SCL GND', 'SDA SBUS', 'T3 T2', 'R3 R2', '5V 5V', 'GND GND'],
      bottom: 'LED BOOT DP DM 5V GND',
    },
  }),
)

GEPRC.push(
  fc({
    id: 'geprc-f722-bt-hd-v3',
    model: 'GEP-F722-BT-HD V3',
    mm: 36.9,
    blurb: 'F722 flight controller for digital HD systems, with Bluetooth for settings from a phone.',
    specs: ['STM32F722, Bluetooth on UART4', '36.9 x 36.9 mm', '3S to 6S', '5 V 3 A and 9 V 2.5 A regulators'],
    mcu: 'STM32F722',
    module: 'BT',
    usb: 'bottom',
    front: {
      left: [['LED', 'GND 5V LED'], ['ESC', 'RX5 CUR M4 M3 M2 M1 BAT GND'], ['CAM', 'CAM GND 5V']],
      right: [['UART2', 'GND 5V R2 T2'], ['DJI', 'R2 GND R1 T1 GND 9V'], ['VTX', 'GND 9V VTX T1']],
    },
    back: {
      left: ['5V', 'GND', 'CAM', 'GND', 'BAT', 'M1', 'M2', 'M3', 'M4', 'CUR', 'R5'],
      right: ['VSW VTX', 'GND 9V', '5V GND', 'R5 T1', 'T5 R1', 'T3 GND', 'R3 R2', 'BZ- T2', 'LED R2', '5V 5V', 'GND GND'],
      bottom: 'LED BOOT OP OM 5V GND',
    },
  }),
)

GEPRC.push(
  fc({
    id: 'geprc-f405-hd-v2',
    model: 'GEP-F405-HD V2',
    mm: 36,
    blurb: 'F405 flight controller for digital HD systems, with a 9 V regulator for the video unit.',
    specs: ['STM32F405, ICM-42688-P gyro', '36 x 36 mm, 30.5 mm mounting', '3S to 6S', '5 V 3 A and 9 V 2.5 A regulators', '6 UARTs, 16 MB blackbox'],
    mcu: 'STM32F405',
    usb: 'top',
    front: {
      left: [['CAM', 'CAM GND 5V'], ['ESC', 'R4 CUR M4 M3 M2 M1 BAT GND'], ['LED', 'GND 5V LED']],
      right: [['UART2', 'GND 5V R2 T2'], ['DJI', 'SBUS GND R1 T1 GND 9V'], ['UART5', 'GND 5V R5 T5']],
    },
    back: {
      top: 'GND - 5V DP DM BOOT - 3V3',
      left: ['GND -', '5V -', 'R5 SDA', 'T5 SCL', 'SBUS 9V', 'GND VTX', 'R1 T3', 'T1 R3', 'GND GND', '9V 5V', 'GND BP', '5V GND', 'R2 5V', 'T2 LED'],
      right: ['CAM', 'GND', '5V', 'R4', 'CUR', 'M4', 'M3', 'M2', 'M1', 'BAT', 'GND', 'GND', '5V', 'LED'],
    },
  }),
)

GEPRC.push(
  fc({
    id: 'geprc-f405-8s',
    model: 'GEP-F405-8S',
    mm: 37,
    blurb: 'F405 flight controller for 8S and for eight motors: two ESC links, with 5 V and 12 V regulators.',
    specs: ['STM32F405, ICM-42688-P gyro', '37 x 37 mm, 30.5 mm mounting', '3S to 8S', '5 V 3 A and 12 V 3 A regulators', '6 UARTs, 8 motor outputs, 16 MB blackbox'],
    mcu: 'STM32F405',
    usb: 'top',
    front: {
      left: [['ESC', 'R4 CUR M4 M3 M2 M1 VBAT GND'], ['ESC2', 'R4 CUR M8 M7 M6 M5 VBAT GND']],
      right: [['UART2', 'GND 4V5 R2 T2'], ['DJI', 'S.B GND R1 T1 GND 12V'], ['VTX', 'GND 12V VTX T1']],
      bottom: [['CAM', 'CAM GND 5V'], ['GPS', 'SDA SCL T6 R6 4V5 GND'], ['LED', 'BZ- LED 5V GND']],
    },
    back: {
      top: 'GND 5V DM DP BOOT LED',
      left: ['GND GND', '4V5 5V', 'R2 R3', 'T2 T3', 'S.B GND', 'GND 5V', 'R1 R5', 'T1 T5', 'GND VTX', '12V BAT'],
      right: ['T4 R4', '5V CUR', 'GND M4', 'M5 M3', 'M6 M2', 'M7 M1', 'M8 BAT', 'C2 C1', 'GND GND', '5V 5V'],
      bottom: 'GND 5V LED BZ- SDA SCL T6 R6 4V5 GND',
    },
  }),
)

GEPRC.push(
  fc({
    id: 'geprc-f405-bt',
    model: 'GEP-F405-BT',
    mm: 37.15,
    blurb: 'F405 flight controller for digital HD systems, with Bluetooth on its own UART.',
    specs: ['STM32F405, ICM-42688-P gyro, BMP280', '37.15 x 37.15 mm, 30.5 mm mounting', '3S to 6S', '5 V 3 A and 9 V 2.5 A regulators', '6 UARTs, UART5 for Bluetooth'],
    mcu: 'STM32F405',
    module: 'BT',
    usb: 'top',
    front: {
      left: [['LED', 'GND 5V LED'], ['ESC', 'R4 CUR M4 M3 M2 M1 BAT GND'], ['CAM', 'CAM GND 5V']],
      right: [['UART2', 'GND 5V R2 T2'], ['DJI', 'SBUS GND R1 T1 GND 9V'], ['VTX', 'GND 9V VTX T1']],
    },
    back: {
      top: 'LED 5V GND',
      left: ['5V 5V', 'GND BZ-', 'CAM LED', 'GND GND', 'BAT 5V', 'M1 M5', 'M2 M6', 'M3 M7', 'M4 M8', 'CUR GND', 'R4 T4'],
      right: ['BAT VTX', 'GND 9V', '5V GND', 'R6 T1', 'T6 R1', 'SCL GND', 'SDA SBUS', 'T3 T2', 'R3 R2', '5V 5V', 'GND GND'],
      bottom: 'LED BOOT DP DM 5V GND',
    },
  }),
)

GEPRC.push(
  fc({
    id: 'geprc-f722-hd-v2',
    model: 'GEP-F722-HD V2',
    mm: 36.85,
    blurb: 'F722 flight controller for digital HD systems, with a 9 V regulator for the video unit.',
    specs: ['STM32F722, ICM-42688-P gyro', '36.85 x 36.85 mm, 30.5 mm mounting', '3S to 6S', '5 V 3 A and 9 V 2.5 A regulators', '5 UARTs, 16 MB blackbox'],
    mcu: 'STM32F722',
    usb: 'top',
    front: {
      left: [['LED', 'GND 5V LED'], ['ESC', 'RX6 CUR M4 M3 M2 M1 BAT GND'], ['CAM', 'CAM GND 5V']],
      right: [['UART2', 'GND 5V R2 T2'], ['DJI', 'R2 GND R1 T1 GND 9V'], ['VTX', 'GND 9V VTX T1']],
    },
    back: {
      top: 'LED 5V GND',
      left: ['5V 5V', 'GND BZ-', 'CAM', 'GND', 'BAT', 'M1', 'M2 BZ-', 'M3 LED', 'M4 5V', 'CUR GND', 'R6 T6'],
      right: ['VSW VTX', 'GND 9V', '5V GND', 'R4 T1', 'T4 R1', 'SCL GND', 'SDA R2', 'T3 T2', 'R3 R2', '5V 5V', 'GND GND'],
      bottom: 'LED BOOT DP DM 5V GND',
    },
  }),
)

GEPRC.push(
  fc({
    id: 'geprc-taker-f722-8s',
    model: 'TAKER F722 8S',
    mm: 38.5,
    blurb: 'F722 flight controller for 8S and for eight motors: two ESC links, with 5 V and 12 V regulators.',
    specs: ['STM32F722, ICM-42688-P gyro', '38.5 x 38.5 mm, 30.5 mm mounting', '3S to 8S', '5 V 3 A and 12 V 3 A regulators', '6 UARTs, 8 motor outputs, 16 MB blackbox'],
    mcu: 'STM32F722',
    usb: 'top',
    front: {
      left: [['ESC2', 'R4 CUR M8 M7 M6 M5 BAT GND'], ['ESC', 'R4 CUR M4 M3 M2 M1 BAT GND']],
      right: [['UART2', 'GND 4V5 R2 T2'], ['DJI', 'R2 GND R1 T1 GND 12V'], ['VTX', 'GND 12V VTX T1']],
      bottom: [['CAM', 'CAM GND 5V'], ['GPS', 'SDA SCL T6 R6 4V5 GND'], ['LED', 'BZ- LED 5V GND']],
    },
    back: {
      top: 'BOOT DP DM 5V GND',
      left: ['GND GND', '4V5 5V', 'R2 R3', 'T2 T3', 'R2 GND', 'GND 5V', 'R1 R5', 'T1 T5', 'GND VTX', '12V VSW'],
      right: ['T4 GND', 'R4 CUR', 'M5 M4', 'M6 M3', 'M7 M2', 'M8 M1', 'GND BAT', 'C2 C1', 'GND GND', '5V 5V'],
      bottom: 'GND 5V LED BZ- SDA SCL T6 R6 4V5 GND',
    },
  }),
)

// ---------------------------------------------------------------------------------------------------------------
// 4-in-1 ESCs: 42 x 45.7 mm with a narrow tab for the battery pads. Motor pads at the corners, the 8-pin link on top.
// ---------------------------------------------------------------------------------------------------------------

GEPRC.push(
  esc({
    id: 'geprc-taker-h65',
    model: 'TAKER H65_8S_BLS 65A',
    blurb: '4-in-1 ESC for big builds. 3S to 8S and 65 A for each motor.',
    specs: ['65 A continuous, 3S to 8S', '42 x 45.7 mm, 30.5 mm mounting', 'About 14.9 g'],
  }),
)
GEPRC.push(
  esc({
    id: 'geprc-taker-h60',
    model: 'TAKER H60_BLS 60A',
    blurb: '4-in-1 ESC with 60 A for each motor, for 3S to 6S builds.',
    specs: ['60 A continuous, 3S to 6S', '42 x 45.7 mm, 30.5 mm mounting'],
  }),
)


GEPRC.push(
  fc({
    id: 'geprc-taker-h743-bt',
    model: 'TAKER H743 BT',
    mm: 38.5,
    blurb: 'H743 flight controller with two gyros and Bluetooth. A 12 V regulator for the video unit, or battery voltage by a solder bridge.',
    specs: ['STM32H743, MPU6000 and ICM-42688-P gyros', '38.5 x 38.5 mm, 30.5 mm mounting', '3S to 6S', '5 V 3 A and 12 V 2.5 A regulators', '7 UARTs (UART3 for Bluetooth), 512 MB blackbox'],
    mcu: 'STM32H743',
    module: 'BT',
    usb: 'top',
    front: {
      left: [['BUZZER', 'GND 5V BZ-'], ['ESC', 'R8 CUR M4 M3 M2 M1 BAT GND'], ['CAM', 'CAM GND 5V']],
      right: [['UART2', 'GND 5V R2 T2'], ['DJI', 'R2 GND R1 T1 GND 12V'], ['VTX', 'GND 12V VTX T1']],
    },
    back: {
      top: 'BOOT OM OP 5V GND',
      left: ['GND GND', '5V 5V', 'R6 R7', 'T6 T7', 'SDA T2', 'SCL R2', 'T4 GND', 'R4 R1', '5V T1', 'GND GND', 'VTX 12V', 'VSW'],
      right: ['T8 R8', 'M8 CUR', 'M7 M4', 'M6 M3', 'M5 M2', '- M1', 'GND BAT', 'LED GND', 'BZ- CAM', '5V GND', '- 5V'],
      bottom: 'LED 5V GND',
    },
  }),
)

GEPRC.push(
  fc({
    id: 'geprc-taker-h743-mini',
    model: 'TAKER H743 Mini',
    mm: [31.5, 30.5],
    mount: 20,
    blurb: 'Small H743 flight controller for 20 x 20 mm stacks, with a 12 V regulator for the video unit and a UART port for GPS or a receiver.',
    specs: ['STM32H743, ICM-42688-P gyro', '31.5 x 30.5 mm, 20 mm mounting', '3S to 8S', '5 V 3 A and 12 V 3 A regulators', '7 UARTs, 16 MB blackbox, Bluetooth'],
    mcu: 'STM32H743',
    usb: 'top',
    front: {
      left: [['BUZZER', '5V BZ-'], ['ESC', 'BAT GND CUR R5 M1 M2 M3 M4']],
      right: [['DJI', 'R2 GND R1 T1 GND 12V']],
      bottom: [['UART7', '5V GND R7 T7']],
    },
    back: {
      top: 'BOOT DM DP 5V GND',
      left: ['T2', 'R2 SDA', '4V5 SCL', 'GND T4', 'T1 R4', 'VTX 5V', '5V GND', 'GND 12V', 'GND'],
      right: ['M7 M6', 'M8 M5', '4V5 GND', 'GND BAT', 'R3 CAM', 'T3 5V', '- GND'],
    },
  }),
)

GEPRC.push(
  fc({
    id: 'geprc-taker-f745-bt',
    model: 'TAKER F745 BT',
    mm: 38.5,
    blurb: 'F745 flight controller with two gyros and Bluetooth. A 12 V regulator for the video unit, or battery voltage by a solder bridge.',
    specs: ['STM32F745, MPU6000 and ICM-42688-P gyros', '38.5 x 38.5 mm, 30.5 mm mounting', '3S to 6S', '5 V 3 A and 12 V 2.5 A regulators', '7 UARTs (UART3 for Bluetooth), 512 MB blackbox'],
    mcu: 'STM32F745',
    module: 'BT',
    usb: 'top',
    front: {
      left: [['BUZZER', 'GND 5V BZ-'], ['ESC', 'R8 CUR M4 M3 M2 M1 BAT GND'], ['CAM', 'CAM GND 5V']],
      right: [['UART2', 'GND 5V R2 T2'], ['DJI', 'R2 GND R1 T1 GND 12V'], ['VTX', 'GND 12V VTX T1']],
    },
    back: {
      top: 'BOOT OM OP 5V GND',
      left: ['GND GND', '5V 5V', 'R6 R7', 'T6 T7', 'SDA T2', 'SCL R2', 'T4 GND', 'R4 R1', '5V T1', 'GND GND', 'VTX 12V', 'VSW'],
      right: ['T8 R8', 'M8 CUR', 'M7 M4', 'M6 M3', 'M5 M2', '- M1', 'GND BAT', 'LED GND', 'BZ- CAM', '5V GND', '- 5V'],
      bottom: 'LED 5V GND',
    },
  }),
)

GEPRC.push(
  esc({
    id: 'geprc-taker-h65-32bit',
    model: 'TAKER H65_8S_32Bit 65A',
    link: 'TX CUR M4 M3 M2 M1 BAT GND',
    blurb: '32-bit 4-in-1 ESC for big builds. 3S to 8S and 65 A for each motor.',
    specs: ['65 A continuous (70 A for 5 s), 3S to 8S', '42 x 45.7 mm, 30.5 mm mounting', 'About 15.8 g'],
  }),
  esc({
    id: 'geprc-taker-h60-mini',
    model: 'TAKER H60 Mini AM32 60A',
    mm: [36, 43],
    body: 36,
    tab: 14,
    mount: 20,
    holeY: 8,
    link: 'BAT GND CUR TX M1 M2 M3 M4',
    blurb: 'Small AM32 4-in-1 ESC for 20 x 20 mm stacks. 3S to 8S and 60 A for each motor.',
    specs: ['60 A continuous (65 A for 5 s), 3S to 8S, AM32', '36 x 43 mm, 20 mm mounting'],
  }),
  esc({
    id: 'geprc-taker-h80',
    model: 'TAKER H80_BLS 80A',
    mm: [56.3, 61.1],
    body: 46,
    tab: 24,
    holeY: 7,
    batSpread: 100,
    link: 'NC CUR M4 M3 M2 M1 BAT GND',
    blurb: 'Large 4-in-1 ESC for heavy builds. 3S to 6S and 80 A for each motor.',
    specs: ['80 A continuous (85 A for 5 s), 3S to 6S', '56.3 x 61.1 mm, 30.5 mm mounting', 'About 28.1 g'],
  }),
  esc({
    id: 'geprc-taker-h80-8s',
    model: 'TAKER H80_8S_BLS 80A',
    mm: [56.3, 61.1],
    body: 46,
    tab: 24,
    holeY: 7,
    batSpread: 100,
    link: 'NC CUR M4 M3 M2 M1 BAT GND',
    blurb: 'Large 4-in-1 ESC for heavy builds. 3S to 8S and 80 A for each motor.',
    specs: ['80 A continuous (85 A for 5 s), 3S to 8S', '56.3 x 61.1 mm, 30.5 mm mounting', 'About 28.3 g'],
  }),
  esc({
    id: 'geprc-taker-h100-8s',
    model: 'TAKER H100_8S_BLS 100A',
    mm: [56.3, 61.1],
    body: 46,
    tab: 24,
    holeY: 7,
    batSpread: 100,
    link: 'NC CUR M4 M3 M2 M1 BAT GND',
    blurb: 'Large 4-in-1 ESC for heavy lift. 3S to 8S and 100 A for each motor.',
    specs: ['100 A continuous (105 A for 5 s), 3S to 8S', '56.3 x 61.1 mm, 30.5 mm mounting', 'About 28.8 g'],
  }),
)
