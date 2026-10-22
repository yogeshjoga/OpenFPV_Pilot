/** The path of a wire that hangs a little slack between its two ends. */
export function wirePath(sx, sy, tx, ty) {
  const slack = Math.min(90, 30 + Math.hypot(tx - sx, ty - sy) * 0.22)
  return `M ${sx} ${sy} C ${sx} ${sy + slack}, ${tx} ${ty + slack}, ${tx} ${ty}`
}
