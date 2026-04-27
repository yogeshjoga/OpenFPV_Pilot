// ================================
// Utility — formatters & helpers
// ================================

/**
 * Format price as currency string
 * @param {number} price
 * @param {string} currency
 */
export function formatPrice(price, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(price)
}

/**
 * Clamp a number between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max)
}

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Format star rating (e.g. 4.75 => "4.8")
 */
export function formatRating(rating) {
  return rating.toFixed(1)
}

/**
 * Truncate text to maxLength with ellipsis
 */
export function truncate(text, maxLength = 120) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Generate an array of star values [full, half, empty] for rating display
 */
export function getStarValues(rating) {
  const full = Math.floor(rating)
  const half = rating % 1 >= 0.5 ? 1 : 0
  const empty = 5 - full - half
  return { full, half, empty }
}

/**
 * Debounce function
 */
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
