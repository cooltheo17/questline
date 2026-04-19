import { describe, expect, it } from 'vitest'
import { parseBulkImportInput } from '../bulkAdd'

const categories = [
  {
    id: 'inbox',
    name: 'General',
    iconKey: 'scroll',
    colorKey: 'mist',
    sortOrder: 0,
    archived: false,
  },
  {
    id: 'health',
    name: 'Health',
    iconKey: 'leaf',
    colorKey: 'sage',
    sortOrder: 1,
    archived: false,
  },
]

const quests = [
  {
    id: 'existing-quest',
    title: 'Existing quest',
    rewardXp: 80,
    rewardCoins: 15,
    sortOrder: 1,
    archived: false,
    createdAt: new Date().toISOString(),
  },
]

describe('parseBulkImportInput', () => {
  it('parses a strict quest payload with nested tasks', () => {
    const plan = parseBulkImportInput(
      JSON.stringify({
        categories: [
          {
            id: 'home-reset',
            name: 'Home Reset',
            colorKey: 'sage',
          },
        ],
        quests: [
          {
            title: 'Reset the flat',
            rewardXp: 160,
            rewardCoins: 30,
            tasks: [
              {
                title: 'Clear the desk',
                categoryIds: ['home-reset'],
                subtasks: ['Throw away junk mail', 'File receipts'],
              },
              {
                title: 'Restock meds',
                categoryIds: ['health'],
                difficulty: 'small',
              },
            ],
          },
        ],
      }),
      { categories, quests },
    )

    expect(plan.summary).toEqual({
      categoryCount: 1,
      questCount: 1,
      taskCount: 2,
      subtaskCount: 2,
    })
    expect(plan.categories[0]).toEqual({
      id: 'home-reset',
      input: {
        name: 'Home Reset',
        colorKey: 'sage',
      },
    })
    expect(plan.quests[0]?.input.title).toBe('Reset the flat')
    expect(plan.tasks[0]?.questRef).toEqual({ kind: 'new', questKey: plan.quests[0]!.key })
    expect(plan.tasks[0]?.input.categoryIds).toEqual(['home-reset'])
    expect(plan.tasks[1]?.input.categoryIds).toEqual(['health'])
    expect(plan.warnings).toEqual([])
  })

  it('resolves standalone tasks against existing quest titles', () => {
    const plan = parseBulkImportInput(
      JSON.stringify({
        tasks: [
          {
            title: 'Draft the outline',
            questTitle: 'Existing quest',
            rewardOverride: { xp: 25, coins: 5 },
          },
        ],
      }),
      { categories, quests },
    )

    expect(plan.tasks[0]?.questRef).toEqual({ kind: 'existing', questId: 'existing-quest' })
    expect(plan.tasks[0]?.input.rewardOverride).toEqual({ xp: 25, coins: 5 })
    expect(plan.tasks[0]?.input.categoryIds).toEqual([])
  })

  it('allows new category ids and still rejects malformed payloads', () => {
    expect(() => parseBulkImportInput('', { categories, quests })).toThrow('Paste JSON to preview the import.')
    const plan = parseBulkImportInput(
      JSON.stringify({
        tasks: [
          {
            title: 'Missing category',
            categoryIds: ['missing'],
          },
        ],
      }),
      { categories, quests },
    )

    expect(plan.tasks[0]?.input.categoryIds).toEqual(['missing'])
  })

  it('skips category definitions that already exist', () => {
    const plan = parseBulkImportInput(
      JSON.stringify({
        categories: [
          {
            id: 'health',
            name: 'Health',
            colorKey: 'sage',
          },
        ],
        tasks: [
          {
            title: 'Stretch',
            categoryIds: ['health'],
          },
        ],
      }),
      { categories, quests },
    )

    expect(plan.categories).toEqual([])
    expect(plan.tasks[0]?.input.categoryIds).toEqual(['health'])
    expect(plan.warnings).toContain('Skipped category "health" because it already exists.')
  })

  it('treats missing or empty categoryIds as uncategorized', () => {
    const plan = parseBulkImportInput(
      JSON.stringify({
        tasks: [
          {
            title: 'Brain dump',
          },
          {
            title: 'Inbox zero',
            categoryIds: [],
          },
        ],
      }),
      { categories, quests },
    )

    expect(plan.tasks[0]?.input.categoryIds).toEqual([])
    expect(plan.tasks[1]?.input.categoryIds).toEqual([])
  })
})
