import { describe, expect, it } from 'vitest'
import { getLevelFromXp, getLevelThreshold } from './level'

describe('level progression', () => {
  it('uses the intended threshold curve', () => {
    expect(getLevelThreshold(1)).toBe(0)
    expect(getLevelThreshold(2)).toBe(50)
    expect(getLevelThreshold(3)).toBe(125)
    expect(getLevelThreshold(4)).toBe(225)
  })

  it('maps XP into level progress values', () => {
    expect(getLevelFromXp(0)).toEqual({
      level: 1,
      currentLevelXp: 0,
      nextLevelXp: 50,
    })

    expect(getLevelFromXp(140)).toEqual({
      level: 3,
      currentLevelXp: 15,
      nextLevelXp: 100,
    })
  })

  it('handles extremely large XP values without changing the progression curve', () => {
    expect(getLevelFromXp(1_000_000_000_000)).toEqual({
      level: 282842,
      currentLevelXp: 1502450,
      nextLevelXp: 7071075,
    })
  })
})
