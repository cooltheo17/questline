import type { CompletionRecord, Task } from './types'

const ONE_DAY = 24 * 60 * 60 * 1000

export interface OccurrenceWindow {
  key: string
  start: Date
  end: Date
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date: Date, amount: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function endExclusive(date: Date): Date {
  return new Date(date.getTime() + ONE_DAY)
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate()
}

function monthlyAnchorFor(monthDate: Date, anchorDay: number): Date {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const clampedDay = Math.min(anchorDay, daysInMonth(year, month))
  return new Date(year, month, clampedDay)
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameLocalDay(date: Date | string, comparison: Date): boolean {
  const parsed = typeof date === 'string' ? new Date(date) : date
  return toDateKey(parsed) === toDateKey(comparison)
}

export function getOccurrenceWindow(task: Task, date: Date): OccurrenceWindow {
  const anchor = startOfLocalDay(new Date(task.anchorDate))
  const current = startOfLocalDay(date)

  if (task.cadence === 'none') {
    return {
      key: task.id,
      start: anchor,
      end: new Date(8640000000000000),
    }
  }

  if (task.cadence === 'daily') {
    return {
      key: toDateKey(current),
      start: current,
      end: endExclusive(current),
    }
  }

  if (task.cadence === 'weekly') {
    const anchorWeekday = anchor.getDay()
    const offset = (current.getDay() - anchorWeekday + 7) % 7
    const start = addDays(current, -offset)
    return {
      key: toDateKey(start),
      start,
      end: addDays(start, 7),
    }
  }

  const anchorDay = anchor.getDate()
  let start = monthlyAnchorFor(current, anchorDay)

  if (start > current) {
    start = monthlyAnchorFor(new Date(current.getFullYear(), current.getMonth() - 1, 1), anchorDay)
  }

  const nextMonth = new Date(start.getFullYear(), start.getMonth() + 1, 1)

  return {
    key: toDateKey(start),
    start,
    end: monthlyAnchorFor(nextMonth, anchorDay),
  }
}

export function getOccurrenceKey(task: Task, date: Date): string {
  return getOccurrenceWindow(task, date).key
}

export function getCompletionForDate(
  task: Task,
  completions: CompletionRecord[],
  date: Date,
): CompletionRecord | undefined {
  const key = getOccurrenceKey(task, date)
  return completions.find((completion) => completion.taskId === task.id && completion.occurrenceKey === key)
}

export function isTaskDueToday(
  task: Task,
  completions: CompletionRecord[],
  date: Date,
): boolean {
  if (!task.active || task.archivedAt) {
    return false
  }

  if (task.cadence === 'none') {
    return !completions.some((completion) => completion.taskId === task.id && Boolean(completion.completedAt))
  }

  const window = getOccurrenceWindow(task, date)

  if (window.start > date) {
    return false
  }

  const completion = getCompletionForDate(task, completions, date)
  return !completion?.completedAt
}
