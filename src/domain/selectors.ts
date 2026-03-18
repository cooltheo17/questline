import { getLevelFromXp } from './level'
import { isRitualTask } from './categories'
import { getCompletionForDate, isSameLocalDay, isTaskDueToday } from './recurrence'
import { getWalletBalance } from './rewards'
import type { Category, CompletionRecord, Task, WalletTransaction } from './types'

export interface TodayTaskView {
  task: Task
  categories: Category[]
  completion?: CompletionRecord
  isCompletedToday: boolean
}

export interface ProfileSnapshot {
  totalXp: number
  coins: number
  streak: number
  level: number
  currentLevelXp: number
  nextLevelXp: number
}

export function getProfileSnapshot(
  completions: CompletionRecord[],
  walletTransactions: WalletTransaction[],
  tasks: Task[],
  categories: Category[],
): ProfileSnapshot {
  const totalXp = completions.reduce((total, completion) => total + completion.xpAwarded, 0)
  const coins = getWalletBalance(walletTransactions)
  const { level, currentLevelXp, nextLevelXp } = getLevelFromXp(totalXp)
  const categoriesById = new Map(categories.map((category) => [category.id, category]))

  return {
    totalXp,
    coins,
    streak: getCompletionStreak(completions, tasks, categoriesById),
    level,
    currentLevelXp,
    nextLevelXp,
  }
}

function getCompletionStreak(
  completions: CompletionRecord[],
  tasks: Task[],
  categoriesById: Map<string, Category>,
): number {
  const ritualTaskIds = new Set(tasks.filter((task) => isRitualTask(task, categoriesById)).map((task) => task.id))
  const days = new Set(
    completions
      .filter((completion) => completion.completedAt && ritualTaskIds.has(completion.taskId))
      .map((completion) => completion.completedAt!.slice(0, 10)),
  )

  let streak = 0
  let current = new Date()

  while (days.has(current.toISOString().slice(0, 10))) {
    streak += 1
    current = new Date(current.getFullYear(), current.getMonth(), current.getDate() - 1)
  }

  return streak
}

export function getTodayTaskViews(
  tasks: Task[],
  categories: Category[],
  completions: CompletionRecord[],
  date: Date,
): { due: TodayTaskView[]; completed: TodayTaskView[] } {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const due: TodayTaskView[] = []
  const completed: TodayTaskView[] = []

  for (const task of tasks) {
    const completion = getCompletionForDate(task, completions, date)
    const view: TodayTaskView = {
      task,
      categories: task.categoryIds
        .map((categoryId) => categoriesById.get(categoryId))
        .filter((category): category is Category => Boolean(category)),
      completion,
      isCompletedToday: Boolean(completion?.completedAt && isSameLocalDay(completion.completedAt, date)),
    }

    if (view.isCompletedToday) {
      completed.push(view)
      continue
    }

    if (isTaskDueToday(task, completions, date)) {
      due.push(view)
    }
  }

  due.sort((left, right) => {
    if (left.task.cadence === 'none' && right.task.cadence !== 'none') {
      return 1
    }

    if (left.task.cadence !== 'none' && right.task.cadence === 'none') {
      return -1
    }

    return left.task.sortOrder - right.task.sortOrder
  })

  completed.sort((left, right) => {
    const leftDate = left.completion?.completedAt ?? ''
    const rightDate = right.completion?.completedAt ?? ''
    return rightDate.localeCompare(leftDate)
  })

  return { due, completed }
}
