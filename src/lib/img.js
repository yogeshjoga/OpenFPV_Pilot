/**
 * Optimized versions of the photos in /public/images (made by scripts, see public/images/opt).
 * Each photo has a 480px and a 960px WebP, a few KB to ~70 KB instead of a 2 MB PNG.
 * Returns props for <img>: `src` (the 960px file) and `srcSet` so small screens fetch the 480px one.
 */
export function optimized(path) {
  const match = /^\/images\/(.+)\.(?:png|jpe?g)$/i.exec(path)
  if (!match) return { src: path }
  const base = `/images/opt/${match[1]}`
  return { src: `${base}-960.webp`, srcSet: `${base}-480.webp 480w, ${base}-960.webp 960w` }
}
