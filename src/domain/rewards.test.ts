import { describe, expect, it } from 'vitest'
import { getDefaultReward, getTaskReward, getWalletBalance } from './rewards'
import type { Task } from './types'

const baseTask: Task = {
  id: 'task',
  title: 'Take vitamins',
  categoryIds: ['health'],
  cadence: 'daily',
  difficulty: 'small',
  subtasks: [],
  active: true,
  sortOrder: 1,
  anchorDate: '2026-03-18T09:00:00.000Z',
  createdAt: '2026-03-18T09:00:00.000Z',
}

describe('rewards', () => {
  it('returns sensible defaults by difficulty', () => {
    expect(getDefaultReward('tiny')).toEqual({ xp: 5, coins: 1 })
    expect(getDefaultReward('large')).toEqual({ xp: 35, coins: 7 })
  })

  it('prefers reward overrides when present', () => {
    expect(
      getTaskReward({
        ...baseTask,
        rewardOverride: { xp: 30, coins: 8 },
      }),
    ).toEqual({ xp: 30, coins: 8 })
  })

  it('computes wallet balances from transactions', () => {
    expect(getWalletBalance([{ amount: 4 }, { amount: -1 }, { amount: 6 }])).toBe(9)
  })
})
