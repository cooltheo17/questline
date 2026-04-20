import { getLevelFromXp } from './level'
import { isRitualTask } from './categories'
import { getCompletionForDate, isSameLocalDay, isTaskDueToday, toDateKey } from './recurrence'
import { getQuestProgress } from './quests'
import { getWalletBalance } from './rewards'
import type { Category, CompletionRecord, Quest, Task, WalletTransaction } from './types'

export interface TodayTaskView {
  task: Task
  categories: Category[]
  completion?: CompletionRecord
  isCompletedToday: boolean
}

export type TodayTaskGroupKey = 'overdue' | 'oneOff' | 'quest' | 'ritual' | 'other'

export interface TodayTaskGroup {
  key: TodayTaskGroupKey
  title: string
  items: TodayTaskView[]
}

export interface QuestSummaryView {
  quest: Quest
  progress: ReturnType<typeof getQuestProgress>
}

export interface TodayPageViewData {
  today: {
    due: TodayTaskView[]
    completed: TodayTaskView[]
    groups: TodayTaskGroup[]
  }
  tomorrow: {
    due: TodayTaskView[]
    completed: TodayTaskView[]
  }
  future: TodayTaskView[]
  overdue: TodayTaskView[]
  questSummaries: QuestSummaryView[]
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
  quests: Quest[],
): ProfileSnapshot {
  const taskXp = completions.reduce((total, completion) => total + completion.xpAwarded, 0)
  const questXp = quests.reduce((total, quest) => (quest.completedAt ? total + quest.rewardXp : total), 0)
  const totalXp = taskXp + questXp
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

function getCategoriesById(categories: Category[]) {
  return new Map(categories.map((category) => [category.id, category]))
}

function createTodayTaskView(
  task: Task,
  categoriesById: Map<string, Category>,
  completion: CompletionRecord | undefined,
  date: Date,
): TodayTaskView {
  return {
    task,
    categories: task.categoryIds
      .map((categoryId) => categoriesById.get(categoryId))
      .filter((category): category is Category => Boolean(category)),
    completion,
    isCompletedToday: Boolean(completion?.completedAt && isSameLocalDay(completion.completedAt, date)),
  }
}

export function getTodayTaskViews(
  tasks: Task[],
  categories: Category[],
  completions: CompletionRecord[],
  date: Date,
): { due: TodayTaskView[]; completed: TodayTaskView[] } {
  const categoriesById = getCategoriesById(categories)
  const due: TodayTaskView[] = []
  const completed: TodayTaskView[] = []

  for (const task of tasks) {
    const completion = getCompletionForDate(task, completions, date)
    const view = createTodayTaskView(task, categoriesById, completion, date)

    if (view.isCompletedToday) {
      completed.push(view)
      continue
    }

    if (isTaskDueToday(task, completions, date)) {
      due.push(view)
    }
  }

  // Persisted sort order should be the single source of truth so manual reorders stick.
  due.sort((left, right) => left.task.sortOrder - right.task.sortOrder)

  completed.sort((left, right) => {
    const leftDate = left.completion?.completedAt ?? ''
    const rightDate = right.completion?.completedAt ?? ''
    return rightDate.localeCompare(leftDate)
  })

  return { due, completed }
}

export function groupTodayTaskViews(
  dueItems: TodayTaskView[],
  categories: Category[],
  date: Date,
): TodayTaskGroup[] {
  const categoriesById = getCategoriesById(categories)
  const todayKey = toDateKey(date)
  const groups: TodayTaskGroup[] = [
    {
      key: 'overdue',
      title: 'Overdue carry-over',
      items: [],
    },
    {
      key: 'oneOff',
      title: 'One-offs due today',
      items: [],
    },
    {
      key: 'quest',
      title: 'Quest tasks',
      items: [],
    },
    {
      key: 'ritual',
      title: 'Rituals & recurring',
      items: [],
    },
    {
      key: 'other',
      title: 'Everything else',
      items: [],
    },
  ]

  for (const item of dueItems) {
    const isOneOff = item.task.cadence === 'none'
    const isOverdueOneOff = isOneOff && Boolean(item.task.dueDate && item.task.dueDate < todayKey)
    const isQuestTask = Boolean(item.task.questId)
    const isRitualOrRecurring = !isOneOff || isRitualTask(item.task, categoriesById)

    if (isOverdueOneOff) {
      groups[0].items.push(item)
      continue
    }

    if (isOneOff) {
      groups[1].items.push(item)
      continue
    }

    if (isQuestTask) {
      groups[2].items.push(item)
      continue
    }

    if (isRitualOrRecurring) {
      groups[3].items.push(item)
      continue
    }

    groups[4].items.push(item)
  }

  return groups.filter((group) => group.items.length > 0)
}

export function getGroupedTodayTaskViews(
  tasks: Task[],
  categories: Category[],
  completions: CompletionRecord[],
  date: Date,
): TodayTaskGroup[] {
  const todaySections = getTodayTaskViews(tasks, categories, completions, date)
  return groupTodayTaskViews(todaySections.due, categories, date)
}

function getSecondaryTaskViews(
  tasks: Task[],
  categories: Category[],
  completions: CompletionRecord[],
  today: Date,
  view: 'future' | 'overdue',
): TodayTaskView[] {
  const categoriesById = getCategoriesById(categories)
  const completedTaskIds = new Set(
    completions
      .filter((completion) => Boolean(completion.completedAt))
      .map((completion) => completion.taskId),
  )
  const todayKey = toDateKey(today)
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const tomorrowKey = toDateKey(tomorrow)

  return tasks
    .filter((task) => {
      if (!task.active || task.archivedAt) {
        return false
      }

      if (task.cadence === 'none') {
        if (completedTaskIds.has(task.id) || !task.dueDate) {
          return false
        }

        return view === 'overdue' ? task.dueDate < todayKey : task.dueDate > tomorrowKey
      }

      if (view === 'overdue' || task.cadence === 'daily') {
        return false
      }

      if (!task.dueDate || task.dueDate <= todayKey) {
        return false
      }

      return !isTaskDueToday(task, completions, today)
    })
    .map((task) => createTodayTaskView(task, categoriesById, getCompletionForDate(task, completions, today), today))
    .sort((left, right) => {
      const leftDue = left.task.dueDate ?? '9999-12-31'
      const rightDue = right.task.dueDate ?? '9999-12-31'
      return leftDue.localeCompare(rightDue) || left.task.sortOrder - right.task.sortOrder
    })
}

function getQuestSummaryViews(
  quests: Quest[],
  tasks: Task[],
  completions: CompletionRecord[],
): QuestSummaryView[] {
  return quests
    .filter((quest) => !quest.archived && !quest.completedAt)
    .map((quest) => ({
      quest,
      progress: getQuestProgress(quest, tasks, completions),
    }))
}

export function getTodayPageViewData(
  tasks: Task[],
  categories: Category[],
  quests: Quest[],
  completions: CompletionRecord[],
  date: Date,
): TodayPageViewData {
  const today = getTodayTaskViews(tasks, categories, completions, date)
  const tomorrowDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
  const tomorrow = getTodayTaskViews(tasks, categories, completions, tomorrowDate)

  return {
    today: {
      ...today,
      groups: groupTodayTaskViews(today.due, categories, date),
    },
    tomorrow,
    future: getSecondaryTaskViews(tasks, categories, completions, date, 'future'),
    overdue: getSecondaryTaskViews(tasks, categories, completions, date, 'overdue'),
    questSummaries: getQuestSummaryViews(quests, tasks, completions),
  }
}

export function getTaskIdsForTodayReorder(
  tasks: Task[],
  dueTaskIds: string[],
  draggedTaskId: string,
  targetTaskId: string,
): string[] {
  if (draggedTaskId === targetTaskId) {
    return tasks.map((task) => task.id)
  }

  const reorderedDueTaskIds = [...dueTaskIds]
  const fromIndex = reorderedDueTaskIds.indexOf(draggedTaskId)
  const toIndex = reorderedDueTaskIds.indexOf(targetTaskId)

  if (fromIndex === -1 || toIndex === -1) {
    return tasks.map((task) => task.id)
  }

  const [movedTaskId] = reorderedDueTaskIds.splice(fromIndex, 1)
  reorderedDueTaskIds.splice(toIndex, 0, movedTaskId)

  const dueTaskIdSet = new Set(dueTaskIds)
  let dueIndex = 0

  return tasks.map((task) => {
    if (!dueTaskIdSet.has(task.id)) {
      return task.id
    }

    const reorderedTaskId = reorderedDueTaskIds[dueIndex]
    dueIndex += 1
    return reorderedTaskId ?? task.id
  })
}
