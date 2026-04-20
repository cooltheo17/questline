import type { CompletionRecord, Quest, Task } from './types'

function getCompletedOneOffTaskIds(completions: CompletionRecord[]) {
  return new Set(
    completions
      .filter((completion) => Boolean(completion.completedAt))
      .map((completion) => completion.taskId),
  )
}

function isTaskCompleteForQuest(task: Task, completions: CompletionRecord[]): boolean {
  return isTaskCompleteForQuestWithIds(task, getCompletedOneOffTaskIds(completions))
}

function isTaskCompleteForQuestWithIds(task: Task, completedOneOffTaskIds: Set<string>): boolean {
  if (task.cadence === 'none') {
    return completedOneOffTaskIds.has(task.id)
  }

  return !task.active || Boolean(task.archivedAt)
}

export interface QuestProgress {
  totalTasks: number
  completedTasks: number
  percentComplete: number
  readyToComplete: boolean
  nextDueDate?: string
}

export function getQuestTasks(questId: string, tasks: Task[]): Task[] {
  return tasks.filter((task) => task.questId === questId)
}

export function getQuestProgress(
  quest: Quest,
  tasks: Task[],
  completions: CompletionRecord[],
): QuestProgress {
  const completedOneOffTaskIds = getCompletedOneOffTaskIds(completions)
  let totalTasks = 0
  let completedTasks = 0
  let nextDueDate: string | undefined

  for (const task of tasks) {
    if (task.questId !== quest.id) {
      continue
    }

    totalTasks += 1

    if (isTaskCompleteForQuestWithIds(task, completedOneOffTaskIds)) {
      completedTasks += 1
      continue
    }

    if (task.dueDate && (!nextDueDate || task.dueDate < nextDueDate)) {
      nextDueDate = task.dueDate
    }
  }

  const readyToComplete = !quest.completedAt && totalTasks > 0 && completedTasks === totalTasks

  return {
    totalTasks,
    completedTasks,
    percentComplete: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    readyToComplete,
    nextDueDate,
  }
}

export function isQuestTaskComplete(task: Task, completions: CompletionRecord[]): boolean {
  return isTaskCompleteForQuest(task, completions)
}
