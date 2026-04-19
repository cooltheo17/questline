import { describe, expect, it } from 'vitest'
import { getOccurrenceKey, getOccurrenceWindow, isTaskDueToday } from '../recurrence'
import type { Task } from '../types'

const weeklyTask: Task = {
  id: 'weekly-task',
  title: 'Review budget',
  categoryIds: ['inbox'],
  cadence: 'weekly',
  difficulty: 'medium',
  subtasks: [],
  active: true,
  sortOrder: 1,
  anchorDate: '2026-03-16T08:00:00.000Z',
  createdAt: '2026-03-16T08:00:00.000Z',
}

describe('recurrence', () => {
  it('aligns weekly occurrences to the anchor weekday', () => {
    expect(getOccurrenceKey(weeklyTask, new Date('2026-03-18T12:00:00.000Z'))).toBe('2026-03-16')
    expect(getOccurrenceKey(weeklyTask, new Date('2026-03-24T12:00:00.000Z'))).toBe('2026-03-23')
  })

  it('falls back to month end for monthly anchors', () => {
    const monthlyTask: Task = {
      ...weeklyTask,
      id: 'monthly-task',
      cadence: 'monthly',
      anchorDate: '2026-01-31T08:00:00.000Z',
    }

    const occurrence = getOccurrenceWindow(monthlyTask, new Date('2026-02-28T10:00:00.000Z'))
    expect(occurrence.key).toBe('2026-02-28')
  })

  it('does not consider completed occurrences due', () => {
    const date = new Date('2026-03-18T12:00:00.000Z')
    expect(
      isTaskDueToday(
        weeklyTask,
        [
          {
            id: 'completion',
            taskId: weeklyTask.id,
            occurrenceKey: '2026-03-16',
            completedAt: '2026-03-17T10:00:00.000Z',
            completedSubtaskIds: [],
            xpAwarded: 20,
            coinsAwarded: 4,
          },
        ],
        date,
      ),
    ).toBe(false)
  })

  it('keeps future one-off tasks out of today until their due date', () => {
    const futureOneOff: Task = {
      ...weeklyTask,
      id: 'future-one-off',
      cadence: 'none',
      dueDate: '2026-03-22',
    }

    expect(isTaskDueToday(futureOneOff, [], new Date('2026-03-18T12:00:00.000Z'))).toBe(false)
    expect(isTaskDueToday(futureOneOff, [], new Date('2026-03-22T12:00:00.000Z'))).toBe(true)
  })
})
