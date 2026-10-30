// Tells the website roughly where a visitor is, from the location headers Vercel adds to every request. Country, region and city only:
// no IP address is read, kept or returned. The page tracker calls this once per visit and carries on without it if it fails.
const decode = (value) => {
  try {
    return decodeURIComponent(String(value ?? '')).slice(0, 80)
  } catch {
    return ''
  }
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Content-Type', 'application/json')
  res.status(200).json({
    country: decode(req.headers['x-vercel-ip-country']),
    region: decode(req.headers['x-vercel-ip-country-region']),
    city: decode(req.headers['x-vercel-ip-city']),
  })
}
