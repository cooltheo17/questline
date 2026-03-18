export interface LevelProgress {
  level: number
  currentLevelXp: number
  nextLevelXp: number
}

export function getLevelThreshold(level: number): number {
  if (level <= 1) {
    return 0
  }

  let threshold = 0
  let requirement = 50

  for (let current = 2; current <= level; current += 1) {
    threshold += requirement
    requirement += 25
  }

  return threshold
}

export function getLevelFromXp(totalXp: number): LevelProgress {
  let level = 1

  while (getLevelThreshold(level + 1) <= totalXp) {
    level += 1
  }

  return {
    level,
    currentLevelXp: totalXp - getLevelThreshold(level),
    nextLevelXp: getLevelThreshold(level + 1) - getLevelThreshold(level),
  }
}
