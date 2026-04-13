export interface LevelProgress {
  level: number
  currentLevelXp: number
  nextLevelXp: number
}

export function getLevelThreshold(level: number): number {
  if (level <= 1) {
    return 0
  }

  return ((level - 1) * (25 * level + 50)) / 2
}

export function getLevelFromXp(totalXp: number): LevelProgress {
  const normalizedXp = Number.isFinite(totalXp)
    ? Math.max(0, totalXp)
    : totalXp > 0
      ? Number.MAX_SAFE_INTEGER
      : 0

  let level = Math.max(1, Math.floor((-1 + Math.sqrt(9 + (8 * normalizedXp) / 25)) / 2))

  // Correct any rounding drift from the closed-form estimate without reintroducing
  // the O(level^2) work that froze the UI on very large XP totals.
  while (getLevelThreshold(level + 1) <= normalizedXp) {
    level += 1
  }

  while (getLevelThreshold(level) > normalizedXp) {
    level -= 1
  }

  const currentThreshold = getLevelThreshold(level)
  const nextThreshold = getLevelThreshold(level + 1)

  return {
    level,
    currentLevelXp: normalizedXp - currentThreshold,
    nextLevelXp: nextThreshold - currentThreshold,
  }
}
