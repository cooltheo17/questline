import Dexie, { type EntityTable } from 'dexie'
import type { Category, CompletionRecord, Quest, RewardItem, Task, WalletTransaction } from '../domain/types'

class TodoDatabase extends Dexie {
  categories!: EntityTable<Category, 'id'>
  tasks!: EntityTable<Task, 'id'>
  quests!: EntityTable<Quest, 'id'>
  completions!: EntityTable<CompletionRecord, 'id'>
  rewards!: EntityTable<RewardItem, 'id'>
  walletTransactions!: EntityTable<WalletTransaction, 'id'>

  constructor() {
    super('questline')

    this.version(1).stores({
      categories: '&id, sortOrder, archived',
      tasks: '&id, categoryId, cadence, active, createdAt, archivedAt',
      completions: '&id, taskId, occurrenceKey, completedAt',
      rewards: '&id, archived, createdAt',
      walletTransactions: '&id, sourceId, type, createdAt',
    })

    this.version(2)
      .stores({
        categories: '&id, sortOrder, archived',
        tasks: '&id, *categoryIds, cadence, active, sortOrder, createdAt, archivedAt',
        completions: '&id, taskId, occurrenceKey, completedAt',
        rewards: '&id, archived, createdAt',
        walletTransactions: '&id, sourceId, type, createdAt',
      })
      .upgrade((transaction) =>
        transaction
          .table('tasks')
          .toCollection()
          .modify((task: {
            categoryId?: string
            categoryIds?: string[]
            sortOrder?: number
            createdAt?: string
          }) => {
            task.categoryIds = task.categoryIds ?? (task.categoryId ? [task.categoryId] : [])
            task.sortOrder = task.sortOrder ?? (Date.parse(task.createdAt ?? '') || 0)
            delete task.categoryId
          }),
      )

    this.version(3).stores({
      categories: '&id, sortOrder, archived',
      tasks: '&id, *categoryIds, questId, cadence, active, sortOrder, createdAt, archivedAt',
      quests: '&id, sortOrder, archived, completedAt',
      completions: '&id, taskId, occurrenceKey, completedAt',
      rewards: '&id, archived, createdAt',
      walletTransactions: '&id, sourceId, type, createdAt',
    })

    this.version(4).stores({
      categories: '&id, sortOrder, archived, importBatchId',
      tasks: '&id, *categoryIds, questId, cadence, active, sortOrder, createdAt, archivedAt, importBatchId',
      quests: '&id, sortOrder, archived, completedAt, importBatchId',
      completions: '&id, taskId, occurrenceKey, completedAt',
      rewards: '&id, archived, createdAt',
      walletTransactions: '&id, sourceId, type, createdAt',
    })
  }
}

export const db = new TodoDatabase()
export const DEFAULT_CATEGORY_ID = 'inbox'
