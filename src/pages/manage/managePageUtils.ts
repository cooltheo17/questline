import type { Category, Quest, Task } from '../../domain/types'

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export interface QuestFormState {
  title: string
  description: string
  rewardXp: number
  rewardCoins: number
  imageUrl: string
}

export interface BulkImportSummary {
  id: string
  createdAt: string
  taskCount: number
  questCount: number
  categoryCount: number
  label: string
}

export function createQuestFormState(): QuestFormState {
  return {
    title: '',
    description: '',
    rewardXp: 100,
    rewardCoins: 25,
    imageUrl: '',
  }
}

export function formatDateTimeLabel(value: string | undefined, fallback: string): string {
  return value ? dateTimeFormatter.format(new Date(value)) : fallback
}

export function toTaskUpdateInput(task: Task, rewardOverride = task.rewardOverride) {
  return {
    id: task.id,
    title: task.title,
    categoryIds: task.categoryIds,
    questId: task.questId,
    dueDate: task.dueDate,
    cadence: task.cadence,
    difficulty: task.difficulty,
    notes: task.notes,
    rewardOverride,
    subtasks: task.subtasks.map((subtask) => subtask.title),
    active: task.active,
  }
}

export function getBulkImportSummaries(
  tasks: Task[],
  quests: Quest[],
  categories: Category[],
): BulkImportSummary[] {
  const batchMap = new Map<
    string,
    {
      id: string
      createdAt: string
      taskCount: number
      questCount: number
      categoryCount: number
    }
  >()

  for (const task of tasks) {
    if (!task.importBatchId) {
      continue
    }

    const current = batchMap.get(task.importBatchId) ?? {
      id: task.importBatchId,
      createdAt: task.createdAt,
      taskCount: 0,
      questCount: 0,
      categoryCount: 0,
    }

    current.taskCount += 1
    if (task.createdAt < current.createdAt) {
      current.createdAt = task.createdAt
    }
    batchMap.set(task.importBatchId, current)
  }

  for (const quest of quests) {
    if (!quest.importBatchId) {
      continue
    }

    const current = batchMap.get(quest.importBatchId) ?? {
      id: quest.importBatchId,
      createdAt: quest.createdAt,
      taskCount: 0,
      questCount: 0,
      categoryCount: 0,
    }

    current.questCount += 1
    if (quest.createdAt < current.createdAt) {
      current.createdAt = quest.createdAt
    }
    batchMap.set(quest.importBatchId, current)
  }

  for (const category of categories) {
    if (!category.importBatchId) {
      continue
    }

    const current = batchMap.get(category.importBatchId) ?? {
      id: category.importBatchId,
      createdAt: '',
      taskCount: 0,
      questCount: 0,
      categoryCount: 0,
    }

    current.categoryCount += 1
    batchMap.set(category.importBatchId, current)
  }

  return [...batchMap.values()]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((batch) => ({
      ...batch,
      label: `Bulk import · ${formatDateTimeLabel(batch.createdAt, 'Bulk import')}`,
    }))
}
