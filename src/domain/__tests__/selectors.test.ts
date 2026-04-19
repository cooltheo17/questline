import { describe, expect, it } from 'vitest'
import { getGroupedTodayTaskViews, getTaskIdsForTodayReorder, getTodayTaskViews } from '../selectors'
import type { Category, Task } from '../types'

function makeTask(id: string, sortOrder: number, cadence: Task['cadence'] = 'daily'): Task {
  return {
    id,
    title: id,
    categoryIds: [],
    cadence,
    difficulty: 'small',
    subtasks: [],
    active: true,
    sortOrder,
    anchorDate: '2026-03-18T12:00:00.000Z',
    createdAt: '2026-03-18T12:00:00.000Z',
  }
}

function makeCategory(id: string, name: string): Category {
  return {
    id,
    name,
    iconKey: 'spark',
    colorKey: 'sage',
    sortOrder: 1,
    archived: false,
  }
}

describe('getTaskIdsForTodayReorder', () => {
  it('reorders due tasks without disturbing hidden task slots', () => {
    const tasks = [
      makeTask('wake', 1),
      makeTask('tomorrow-only', 2),
      makeTask('walk', 3),
      makeTask('stretch', 4),
    ]

    expect(getTaskIdsForTodayReorder(tasks, ['wake', 'walk', 'stretch'], 'stretch', 'walk')).toEqual([
      'wake',
      'tomorrow-only',
      'stretch',
      'walk',
    ])
  })

  it('keeps the original global order when the drag ids are invalid', () => {
    const tasks = [makeTask('wake', 1), makeTask('walk', 2)]

    expect(getTaskIdsForTodayReorder(tasks, ['wake', 'walk'], 'missing', 'walk')).toEqual(['wake', 'walk'])
  })
})

describe('getTodayTaskViews', () => {
  it('follows persisted sort order even when cadences differ', () => {
    const tasks = [
      makeTask('daily-first', 1, 'daily'),
      makeTask('one-off-mid', 2, 'none'),
      makeTask('daily-last', 3, 'daily'),
    ]

    const sections = getTodayTaskViews(tasks, [], [], new Date('2026-03-19T12:00:00.000Z'))
    expect(sections.due.map((view) => view.task.id)).toEqual(['daily-first', 'one-off-mid', 'daily-last'])
  })
})

describe('getGroupedTodayTaskViews', () => {
  it('groups due tasks by urgency before rituals', () => {
    const categories = [makeCategory('rituals', 'Rituals')]
    const tasks: Task[] = [
      { ...makeTask('overdue-one-off', 1, 'none'), dueDate: '2026-03-18' },
      { ...makeTask('today-one-off', 2, 'none'), dueDate: '2026-03-19' },
      { ...makeTask('quest-weekly', 3, 'weekly'), questId: 'quest-1' },
      { ...makeTask('ritual-daily', 4, 'daily'), categoryIds: ['rituals'] },
      { ...makeTask('plain-daily', 5, 'daily') },
    ]

    const groups = getGroupedTodayTaskViews(tasks, categories, [], new Date('2026-03-19T12:00:00.000Z'))

    expect(groups.map((group) => group.key)).toEqual(['overdue', 'oneOff', 'quest', 'ritual'])
    expect(groups[0]?.items.map((view) => view.task.id)).toEqual(['overdue-one-off'])
    expect(groups[1]?.items.map((view) => view.task.id)).toEqual(['today-one-off'])
    expect(groups[2]?.items.map((view) => view.task.id)).toEqual(['quest-weekly'])
    expect(groups[3]?.items.map((view) => view.task.id)).toEqual(['ritual-daily', 'plain-daily'])
  })
})
