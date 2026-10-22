import { BRAND_PARTS } from '../boards/index.js'
import { BatteryArt, CameraArt, CapacitorArt, EscArt, FcArt, GpsArt, MotorArt, ReceiverArt, VtxArt } from './art.jsx'
import BoardArt from './BoardArt.jsx'

/** A brand board is drawn from its own description, front or back. */
const boardArt = (part) =>
  function Board({ flip }) {
    return <BoardArt part={part} flip={flip} />
  }

/** The artwork of each part, by part id. */
export const ART = {
  esc: EscArt,
  fc: FcArt,
  motor: MotorArt,
  battery: BatteryArt,
  capacitor: CapacitorArt,
  receiver: ReceiverArt,
  vtx: VtxArt,
  camera: CameraArt,
  gps: GpsArt,
  ...Object.fromEntries(BRAND_PARTS.map((p) => [p.id, boardArt(p)])),
}
