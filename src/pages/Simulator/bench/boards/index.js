import { GEPRC } from './geprc.js'
import { GEPRC_AIO } from './geprc-aio.js'

/** Parts by brand. More makers and more kinds of part (receivers, VTXs, cameras, frames, batteries) are added here. */
export const BRAND_PARTS = [...GEPRC, ...GEPRC_AIO]
