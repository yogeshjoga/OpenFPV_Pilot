import database from '../data/fpvDatabase.json'

export function getQuoteDetails(config) {
  const items = []
  let idCounter = 1

  // 1. Frame
  const frameData = database.find(f => f.Model === config.frameModel)
  
  let framePrice = 35
  let frameName = `${config.frameSize} Frame`
  
  if (frameData) {
      // Parse "$31.99-$39.99" or "$69.99" or 5700
      const priceStr = String(frameData['Price (USD)'])
      if (priceStr.includes('-')) {
         framePrice = parseFloat(priceStr.split('-')[0].replace('$', '')) || framePrice
      } else {
         framePrice = parseFloat(priceStr.replace('$', '')) || framePrice
      }
      frameName = `${frameData.Brand} ${frameData.Model}`
  }

  items.push({
    id: idCounter++,
    type: 'Frame',
    name: frameName,
    qty: 1,
    unitPrice: framePrice,
    total: framePrice
  })

  // 2. Motors
  items.push({
    id: idCounter++,
    type: 'Motors',
    name: `${config.motorBrand} ${config.motorSpeed} Brushless Motor`,
    qty: 4,
    unitPrice: 20, // $20 * 4 = $80
    total: 80
  })

  // 3. Propellers
  items.push({
    id: idCounter++,
    type: 'Propellers',
    name: `${config.propSize} ${config.propMaterial} Props`,
    qty: 1, // 1 set of 4
    unitPrice: 5,
    total: 5
  })

  // 4. Electronics Stack (FC + ESC)
  items.push({
    id: idCounter++,
    type: 'Electronics',
    name: `${config.stackSize} Flight Controller & ESC Stack`,
    qty: 1,
    unitPrice: 110,
    total: 110
  })

  // 5. Receiver
  items.push({
    id: idCounter++,
    type: 'Control Link',
    name: `${config.radioProtocol} Nano Receiver`,
    qty: 1,
    unitPrice: 20,
    total: 20
  })

  // 6. Video System
  let videoPrice = 40
  if (config.videoSystemType === 'Digital') {
    if (config.vtxBrand === 'DJI') videoPrice = 229
    else if (config.vtxBrand.includes('Walksnail')) videoPrice = 140
    else if (config.vtxBrand.includes('HDZero')) videoPrice = 120
  }

  items.push({
    id: idCounter++,
    type: 'Video System',
    name: `${config.vtxBrand} ${config.vtxModel}`,
    qty: 1,
    unitPrice: videoPrice,
    total: videoPrice
  })

  // 7. Battery
  let battPrice = 10
  if (config.batteryCell.includes('6S') || config.batteryCell.includes('8S')) battPrice = 35
  else if (config.batteryCell.includes('4S')) battPrice = 25

  items.push({
    id: idCounter++,
    type: 'Battery',
    name: `${config.batteryCell} LiPo Battery`,
    qty: 1,
    unitPrice: battPrice,
    total: battPrice
  })

  // 8. Range Booster Module
  if (config.rangeBooster && config.rangeBooster !== 'None') {
    let boosterPrice = config.rangeBooster.includes('2W') ? 90 : 45
    items.push({
      id: idCounter++,
      type: 'TX Module',
      name: config.rangeBooster,
      qty: 1,
      unitPrice: boosterPrice,
      total: boosterPrice
    })
  }

  // 9. Goggles
  if (config.goggleModel && config.goggleModel !== 'None') {
    let gogglePrice = 150 // default analog
    if (config.videoSystemType === 'Digital') {
        if (config.goggleBrand === 'DJI') gogglePrice = 450
        else if (config.goggleBrand.includes('Walksnail')) gogglePrice = 500
        else if (config.goggleBrand.includes('HDZero')) gogglePrice = 550
    } else {
        if (config.goggleBrand === 'FatShark') gogglePrice = 350
        else if (config.goggleBrand === 'Skyzone') gogglePrice = 280
        else gogglePrice = 100
    }

    items.push({
      id: idCounter++,
      type: 'Goggles',
      name: `${config.goggleBrand} ${config.goggleModel}`,
      qty: 1,
      unitPrice: gogglePrice,
      total: gogglePrice
    })
  }

  const grandTotal = items.reduce((acc, curr) => acc + curr.total, 0)
  const grandTotalINR = grandTotal * 92 // Updated conversion rate per user request

  return { items, grandTotal, grandTotalINR }
}

export function getThrustEstimate(frameSize) {
  if (frameSize.includes('15')) return '~8kg (Heavy Lifter)'
  if (frameSize.includes('10') || frameSize.includes('7')) return '~3.5kg - 5kg (Cinematic Lift)'
  if (frameSize.includes('5')) return '~2kg - 3kg (Aggressive Freestyle)'
  if (frameSize.includes('3')) return '~800g (Park Flyer)'
  return '~150g (Indoor/Micro)'
}
