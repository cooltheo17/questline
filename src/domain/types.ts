export type Cadence = 'none' | 'daily' | 'weekly' | 'monthly'
export type Difficulty = 'tiny' | 'small' | 'medium' | 'large'

export interface Category {
  id: string
  name: string
  iconKey: string
  colorKey: string
  sortOrder: number
  archived: boolean
}

export interface Subtask {
  id: string
  title: string
  sortOrder: number
}

export interface Task {
  id: string
  title: string
  notes?: string
  categoryIds: string[]
  dueDate?: string
  cadence: Cadence
  difficulty: Difficulty
  rewardOverride?: {
    xp: number
    coins: number
  }
  subtasks: Subtask[]
  active: boolean
  sortOrder: number
  anchorDate: string
  createdAt: string
  archivedAt?: string
}

export interface CompletionRecord {
  id: string
  taskId: string
  occurrenceKey: string
  completedAt?: string
  completedSubtaskIds: string[]
  xpAwarded: number
  coinsAwarded: number
}

export interface RewardItem {
  id: string
  title: string
  coinCost: number
  notes?: string
  link?: string
  repeatable: boolean
  archived: boolean
  createdAt: string
}

export interface WalletTransaction {
  id: string
  type: 'task_reward' | 'reward_purchase'
  amount: number
  sourceId: string
  createdAt: string
}

export interface AppSettings {
  themeId: string
  soundEnabled: boolean
  exportVersion: number
}

export interface CreateTaskInput {
  title: string
  categoryIds: string[]
  dueDate?: string
  cadence: Cadence
  difficulty: Difficulty
  notes?: string
  rewardOverride?: Task['rewardOverride']
  subtasks?: string[]
}

export interface CreateCategoryInput {
  name: string
  colorKey: string
}

export interface UpdateTaskInput extends CreateTaskInput {
  id: string
  active: boolean
}

export interface CreateRewardInput {
  title: string
  coinCost: number
  notes?: string
  link?: string
  repeatable: boolean
}

export interface UpdateRewardInput extends CreateRewardInput {
  id: string
  archived: boolean
}

export interface AppSnapshot {
  version: number
  exportedAt: string
  categories: Category[]
  tasks: Task[]
  completions: CompletionRecord[]
  rewards: RewardItem[]
  walletTransactions: WalletTransaction[]
}
