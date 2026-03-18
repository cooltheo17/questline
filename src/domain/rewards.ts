import type { Difficulty, Task } from './types'

export interface TaskReward {
  xp: number
  coins: number
}

const difficultyRewards: Record<Difficulty, TaskReward> = {
  tiny: { xp: 5, coins: 1 },
  small: { xp: 10, coins: 2 },
  medium: { xp: 20, coins: 4 },
  large: { xp: 35, coins: 7 },
}

export function getDefaultReward(difficulty: Difficulty): TaskReward {
  return difficultyRewards[difficulty]
}

export function getTaskReward(task: Task): TaskReward {
  return task.rewardOverride ?? getDefaultReward(task.difficulty)
}

export function getWalletBalance(entries: Array<{ amount: number }>): number {
  return entries.reduce((total, entry) => total + entry.amount, 0)
}
