import { describe, expect, it } from 'vitest'
import {
  formatTaskReward,
  getDefaultReward,
  getRewardForMode,
  getRewardOverrideForMode,
  getTaskReward,
  getTaskRewardMode,
  getWalletBalance,
} from '../rewards'
import type { Task } from '../types'

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

  it('derives reward mode from the task difficulty when no override is needed', () => {
    expect(getTaskRewardMode('small')).toEqual({
      mode: 'match_difficulty',
      customReward: { xp: 10, coins: 2 },
    })
  })

  it('recognizes fixed presets that differ from the current task difficulty', () => {
    expect(getTaskRewardMode('small', { xp: 20, coins: 4 })).toEqual({
      mode: 'custom',
      customReward: { xp: 20, coins: 4 },
    })
  })

  it('keeps non-standard rewards in custom mode', () => {
    expect(getTaskRewardMode('small', { xp: 13, coins: 3 })).toEqual({
      mode: 'custom',
      customReward: { xp: 13, coins: 3 },
    })
  })

  it('normalizes matching rewards back to the default path', () => {
    expect(getRewardOverrideForMode('match_difficulty', 'medium', { xp: 0, coins: 0 })).toBeUndefined()
  })

  it('returns the expected reward for default and custom modes', () => {
    expect(getRewardForMode('match_difficulty', 'large', { xp: 0, coins: 0 })).toEqual({ xp: 35, coins: 7 })
    expect(getRewardForMode('custom', 'small', { xp: 12.6, coins: -2 })).toEqual({ xp: 13, coins: 0 })
  })

  it('formats rewards for the UI', () => {
    expect(formatTaskReward({ xp: 5, coins: 1 })).toBe('5 XP · 1 coin')
    expect(formatTaskReward({ xp: 20, coins: 4 })).toBe('20 XP · 4 coins')
  })
})
