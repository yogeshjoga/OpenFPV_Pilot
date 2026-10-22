// Finding a part: parts are grouped by brand and by what kind of part they are.

/** The brands present, Generic first, then the others in the order they appear. */
export const brandsOf = (parts) => [...new Set(parts.map((p) => p.brand))].sort((a, b) => (a === 'Generic' ? -1 : b === 'Generic' ? 1 : 0))

/** The kinds of part present, in the order they appear. */
export const categoriesOf = (parts) => [...new Set(parts.map((p) => p.category))]

/** [{ brand, parts }] with the brands in the order above. */
export const groupByBrand = (parts) => brandsOf(parts).map((brand) => ({ brand, parts: parts.filter((p) => p.brand === brand) }))

/** [{ category, parts }] in the order the kinds first appear. */
export const groupByCategory = (parts) => categoriesOf(parts).map((category) => ({ category, parts: parts.filter((p) => p.category === category) }))

/** Parts that match a search text, a brand ('all' for every brand) and a category ('all' for every kind). */
export function findParts(parts, { query = '', brand = 'all', category = 'all' } = {}) {
  const q = query.trim().toLowerCase()
  return parts.filter(
    (p) =>
      (brand === 'all' || p.brand === brand) &&
      (category === 'all' || p.category === category) &&
      (!q || `${p.name} ${p.brand} ${p.model ?? ''} ${p.blurb} ${(p.specs ?? []).join(' ')}`.toLowerCase().includes(q)),
  )
}
