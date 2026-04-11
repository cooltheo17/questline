import type { CompletionRecord, Quest, Task } from './types'

function isTaskCompleteForQuest(task: Task, completions: CompletionRecord[]): boolean {
  if (task.cadence === 'none') {
    return completions.some((completion) => completion.taskId === task.id && Boolean(completion.completedAt))
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
  const questTasks = getQuestTasks(quest.id, tasks)
  const completedTasks = questTasks.filter((task) => isTaskCompleteForQuest(task, completions)).length
  const totalTasks = questTasks.length
  const readyToComplete = !quest.completedAt && totalTasks > 0 && completedTasks === totalTasks
  const incompleteTasks = questTasks.filter((task) => !isTaskCompleteForQuest(task, completions))
  const nextDueDate = incompleteTasks
    .map((task) => task.dueDate)
    .filter((dueDate): dueDate is string => Boolean(dueDate))
    .sort()[0]

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
