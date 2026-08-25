/* Score color/label helpers shared across dashboard & progress */

export function scoreColor(n) {
  if (n >= 70) return 'var(--success)'
  if (n >= 45) return 'var(--warning)'
  return 'var(--danger)'
}

export function scoreLabel(n) {
  if (n >= 70) return 'Placement Ready'
  if (n >= 45) return 'On Track'
  return 'Needs Focus'
}
