import type { Difficulty, Task } from './types'

export interface TaskReward {
  xp: number
  coins: number
}

export type TaskRewardMode = 'match_difficulty' | 'custom'

const difficultyRewards: Record<Difficulty, TaskReward> = {
  tiny: { xp: 5, coins: 1 },
  small: { xp: 10, coins: 2 },
  medium: { xp: 20, coins: 4 },
  large: { xp: 35, coins: 7 },
}

function rewardsMatch(left: TaskReward, right: TaskReward): boolean {
  return left.xp === right.xp && left.coins === right.coins
}

function normalizeTaskReward(reward: TaskReward): TaskReward {
  return {
    xp: Math.max(0, Math.round(reward.xp)),
    coins: Math.max(0, Math.round(reward.coins)),
  }
}

export function getDefaultReward(difficulty: Difficulty): TaskReward {
  return difficultyRewards[difficulty]
}

export function formatTaskReward(reward: TaskReward): string {
  return `${reward.xp} XP · ${reward.coins} coin${reward.coins === 1 ? '' : 's'}`
}

export function getTaskRewardMode(
  difficulty: Difficulty,
  rewardOverride?: Task['rewardOverride'],
): {
  mode: TaskRewardMode
  customReward: TaskReward
} {
  const defaultReward = getDefaultReward(difficulty)

  if (!rewardOverride || rewardsMatch(rewardOverride, defaultReward)) {
    return {
      mode: 'match_difficulty',
      customReward: defaultReward,
    }
  }

  return {
    mode: 'custom',
    customReward: rewardOverride,
  }
}

export function getRewardForMode(
  mode: TaskRewardMode,
  difficulty: Difficulty,
  customReward: TaskReward,
): TaskReward {
  if (mode === 'match_difficulty') {
    return getDefaultReward(difficulty)
  }

  if (mode === 'custom') {
    return normalizeTaskReward(customReward)
  }

  return getDefaultReward(difficulty)
}

export function getRewardOverrideForMode(
  mode: TaskRewardMode,
  difficulty: Difficulty,
  customReward: TaskReward,
): Task['rewardOverride'] {
  const reward = getRewardForMode(mode, difficulty, customReward)
  return rewardsMatch(reward, getDefaultReward(difficulty)) ? undefined : reward
}

export function getTaskReward(task: Task): TaskReward {
  return task.rewardOverride ?? getDefaultReward(task.difficulty)
}

export function getWalletBalance(entries: Array<{ amount: number }>): number {
  return entries.reduce((total, entry) => total + entry.amount, 0)
}
