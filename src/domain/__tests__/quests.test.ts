import { describe, expect, it } from 'vitest'
import { getQuestProgress, isQuestTaskComplete } from '../quests'
import type { CompletionRecord, Quest, Task } from '../types'

function makeQuest(): Quest {
  return {
    id: 'quest-1',
    title: 'Archive research',
    description: 'Collect field notes',
    imageUrl: undefined,
    rewardXp: 200,
    rewardCoins: 50,
    sortOrder: 1,
    archived: false,
    createdAt: '2026-04-06T12:00:00.000Z',
  }
}

function makeTask(id: string, questId: string): Task {
  return {
    id,
    title: id,
    categoryIds: [],
    questId,
    cadence: 'none',
    difficulty: 'small',
    subtasks: [],
    active: true,
    sortOrder: 1,
    anchorDate: '2026-04-06T12:00:00.000Z',
    createdAt: '2026-04-06T12:00:00.000Z',
  }
}

describe('quest helpers', () => {
  it('detects when quest tasks are complete', () => {
    const quest = makeQuest()
    const task = makeTask('t1', quest.id)

    const incomplete = getQuestProgress(quest, [task], [])
    expect(incomplete.completedTasks).toBe(0)
    expect(incomplete.readyToComplete).toBe(false)

    const completions: CompletionRecord[] = [
      {
        id: 'done',
        taskId: 't1',
        occurrenceKey: 't1',
        completedAt: '2026-04-06T12:00:00.000Z',
        completedSubtaskIds: [],
        xpAwarded: 10,
        coinsAwarded: 2,
      },
    ]

    const complete = getQuestProgress(quest, [task], completions)
    expect(complete.completedTasks).toBe(1)
    expect(complete.readyToComplete).toBe(true)
  })

  it('checks recurrence-based completion states', () => {
    const quest = makeQuest()
    const task: Task = { ...makeTask('ritual', quest.id), cadence: 'weekly', active: false }
    expect(isQuestTaskComplete(task, [])).toBe(true)
  })
})
