import type { CompletionRecord, Task } from './types'

export function getCompletedSubtaskIds(task: Task, completion?: Pick<CompletionRecord, 'completedSubtaskIds'>): string[] {
  const validIds = new Set(task.subtasks.map((subtask) => subtask.id))
  const completedIds = new Set<string>()

  for (const subtaskId of completion?.completedSubtaskIds ?? []) {
    if (validIds.has(subtaskId)) {
      completedIds.add(subtaskId)
    }
  }

  return [...completedIds]
}

export function getCompletedSubtaskCount(task: Task, completion?: Pick<CompletionRecord, 'completedSubtaskIds'>): number {
  return getCompletedSubtaskIds(task, completion).length
}
