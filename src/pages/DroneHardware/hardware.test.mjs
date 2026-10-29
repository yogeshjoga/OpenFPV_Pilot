import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  MATERIALS, amplification, armFrequency, beamDeflection, bestOrder, chirp, commutationStep, constellation, filterDelayMs, motorLoad,
  noLoadRpm, offAxisModulus, pathLossDb, rangeKm, receiveChirp, receivedDbm, stiffnessFromThickness, stressStrain, stripMass, symbolErrors,
  transmissibility, wavelengthM,
} from './hardware.js'

const near = (a, b, tol) => assert.ok(Math.abs(a - b) <= tol, `${a} is not within ${tol} of ${b}`)

test('twice the thickness is eight times stiffer: the tip moves an eighth as far', () => {
  const thin = beamDeflection({ E: 70, t: 2 })
  const thick = beamDeflection({ E: 70, t: 4 })
  near(thin / thick, 8, 1e-9)
  assert.equal(stiffnessFromThickness(2), 8)
})

test('carbon and aluminium are about equally stiff, and the carbon strip is lighter', () => {
  const al = MATERIALS.aluminium
  const c = MATERIALS.carbon
  near(beamDeflection({ ...al, t: 2 }) / beamDeflection({ ...c, t: 2 }), 1, 0.03)
  assert.ok(stripMass({ rho: c.rho, t: 2 }) < stripMass({ rho: al.rho, t: 2 }) * 0.65)
})

test('carbon plate: 70 GPa along the fibres, about 19 at 45 degrees, and the same again at 90', () => {
  near(offAxisModulus(0), 70, 1e-6)
  near(offAxisModulus(45), 19, 0.5)
  near(offAxisModulus(90), 70, 1e-6)
  near(offAxisModulus(20), offAxisModulus(70), 1e-6)
  assert.ok(offAxisModulus(45) < offAxisModulus(20))
  // a loss of about 70 per cent
  near(1 - offAxisModulus(45) / 70, 0.73, 0.02)
})

test('aluminium bends, then keeps going; carbon is stiff and then snaps', () => {
  assert.ok(stressStrain.aluminium(0.2) > 100)
  assert.ok(stressStrain.aluminium(5) > stressStrain.aluminium(0.5))
  assert.equal(stressStrain.aluminium(13), 0)
  assert.ok(stressStrain.carbon(0.9) > 500)
  assert.equal(stressStrain.carbon(1.1), 0)
})

test('resonance: shaking is biggest when the push matches the natural frequency, and a soft mount only isolates above root two', () => {
  assert.ok(amplification(1, 0.05) > 9)
  assert.ok(amplification(1, 0.05) > amplification(0.5, 0.05))
  assert.ok(transmissibility(1, 0.1) > 4)
  assert.ok(transmissibility(1.2, 0.1) > 1, 'below root two it makes things worse')
  assert.ok(transmissibility(3, 0.1) < 0.2)
  near(transmissibility(Math.SQRT2, 0.2), 1, 0.02)
})

test('a stiffer (thicker) arm resonates at a higher frequency, and a lower filter cutoff delays the signal more', () => {
  assert.ok(armFrequency(4) > armFrequency(3))
  near(armFrequency(3), 260, 1e-9)
  assert.ok(filterDelayMs(50) > filterDelayMs(200))
  near(filterDelayMs(100), 1.59, 0.01)
})

test('4S motors on 6S: 50 per cent more speed, more than three times the power, 2.25 times the current, and about 5 times the heat', () => {
  const m = motorLoad(6)
  near(m.speed, 1.5, 1e-9)
  near(m.power, 3.375, 1e-9)
  near(m.current, 2.25, 1e-9)
  near(m.heat, 5.0625, 1e-9)
  near(motorLoad(4).heat, 1, 1e-9)
  near(noLoadRpm(1700, 6), 37740, 1)
})

test('the ESC steps through six combinations round a full electrical turn', () => {
  assert.deepEqual([0, 59, 60, 120, 180, 240, 300, 359, 360].map(commutationStep), [0, 0, 1, 2, 3, 4, 5, 5, 0])
})

test('radio: 2.4 GHz is about 12.5 cm long, and losing signal with distance is 6 dB for each doubling', () => {
  near(wavelengthM(2.4e9), 0.125, 0.001)
  near(pathLossDb(2, 2400) - pathLossDb(1, 2400), 6.02, 0.01)
  near(pathLossDb(1, 2400), 100.0, 0.5)
  assert.ok(pathLossDb(1, 5800) > pathLossDb(1, 2400))
  const rx = receivedDbm({ txDbm: 20, km: 5, mhz: 2400 })
  assert.ok(rx > -95 && rx < -85, `rx ${rx}`)
})

test('more sensitivity means more range', () => {
  const far = rangeKm({ txDbm: 20, mhz: 2400, sensitivityDbm: -115 })
  const near2 = rangeKm({ txDbm: 20, mhz: 2400, sensitivityDbm: -100 })
  assert.ok(far > near2 * 5)
  assert.ok(far > 20, `${far} km`)
})

test('LoRa: a chirp in strong noise, even below 0 dB, still piles up into one clear bin at the right place', () => {
  for (const snr of [10, -5, -15]) {
    const r = receiveChirp({ n: 256, symbol: 37, snrDb: snr })
    assert.equal(r.peak, 37, `at ${snr} dB the peak is at bin ${r.peak}`)
    assert.ok(r.peakToNoise > 4, `${snr} dB: ${r.peakToNoise}`)
  }
  // before it is dechirped, the signal does not stand out of the noise at -15 dB
  const raw = receiveChirp({ n: 256, symbol: 37, snrDb: -15 })
  const rawPeak = Math.max(...raw.before)
  const rawMean = raw.before.reduce((s, v) => s + v, 0) / raw.before.length
  assert.ok(rawPeak / rawMean < 4, `raw peak to mean ${rawPeak / rawMean}`)
  near(raw.processingGainDb, 24.08, 0.01)
})

test('the symbol decides which bin the peak lands in', () => {
  assert.equal(receiveChirp({ symbol: 5, snrDb: 0 }).peak, 5)
  assert.equal(receiveChirp({ symbol: 200, snrDb: 0 }).peak, 200)
  assert.equal(chirp(64, 3).re.length, 64)
})

test('Wi-Fi style: a crowded constellation makes more mistakes in the same noise, so the link falls back', () => {
  const snr = 14
  const qpsk = symbolErrors({ order: 4, snrDb: snr }).rate
  const qam64 = symbolErrors({ order: 64, snrDb: snr }).rate
  assert.ok(qpsk < 0.001, `qpsk ${qpsk}`)
  assert.ok(qam64 > 0.2, `qam64 ${qam64}`)
  assert.equal(constellation(16).length, 16)
  assert.ok(bestOrder(30) > bestOrder(12))
  assert.equal(bestOrder(2), 4)
})
