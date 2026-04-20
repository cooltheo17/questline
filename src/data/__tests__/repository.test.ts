import { beforeEach, describe, expect, it } from 'vitest'
import { parseBulkImportInput } from '../../domain/bulkAdd'
import { db } from '../db'
import {
  completeTask,
  completeQuest,
  createFromBulkImportPlan,
  deleteCategory,
  createTask,
  createQuest,
  deleteBulkImport,
  deleteCompletionRecord,
  deleteQuest,
  deleteWalletTransaction,
  ensureSeedData,
  purchaseReward,
  createReward,
  toggleSubtask,
  undoBulkImport,
  updateTask,
} from '../repository'

describe('repository flows', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    await ensureSeedData()
  })

  it('awards a one-off task immediately on completion', async () => {
    await createTask({
      title: 'Send the email',
      categoryIds: [],
      cadence: 'none',
      difficulty: 'small',
    })

    const task = await db.tasks.toCollection().first()
    expect(task).toBeTruthy()

    await completeTask(task!)

    const completion = await db.completions.toCollection().first()
    const transactions = await db.walletTransactions.toArray()

    expect(completion?.xpAwarded).toBe(10)
    expect(completion?.coinsAwarded).toBe(2)
    expect(completion?.id).toBe(`completion:${task!.id}:${task!.id}`)
    expect(transactions).toHaveLength(1)
    expect(transactions[0]?.id).toBe(`task_reward:${completion!.id}`)
  })

  it('waits for the last subtask before awarding rewards', async () => {
    await createTask({
      title: 'Take vitamins',
      categoryIds: [],
      cadence: 'daily',
      difficulty: 'small',
      subtasks: ['Vitamin D', 'Magnesium', 'Omega 3'],
    })

    const task = await db.tasks.toCollection().first()
    expect(task).toBeTruthy()

    await toggleSubtask(task!, task!.subtasks[0].id)
    let completion = await db.completions.toCollection().first()

    expect(completion?.completedAt).toBeUndefined()
    expect(completion?.completedSubtaskIds).toHaveLength(1)
    expect(await db.walletTransactions.count()).toBe(0)

    await toggleSubtask(task!, task!.subtasks[1].id)
    await toggleSubtask(task!, task!.subtasks[2].id)
    completion = await db.completions.toCollection().first()

    expect(completion?.completedAt).toBeTruthy()
    expect(completion?.xpAwarded).toBe(10)
    expect(await db.walletTransactions.count()).toBe(1)
  })

  it('preserves matching subtask ids and removes stale completion ids on task update', async () => {
    await createTask({
      title: 'Take vitamins',
      categoryIds: [],
      cadence: 'daily',
      difficulty: 'small',
      subtasks: ['Vitamin D', 'Magnesium', 'Omega 3'],
    })

    const task = await db.tasks.toCollection().first()
    expect(task).toBeTruthy()

    await db.completions.put({
      id: `completion:${task!.id}:2026-04-20`,
      taskId: task!.id,
      occurrenceKey: '2026-04-20',
      completedSubtaskIds: ['stale-1', task!.subtasks[0].id, 'stale-2'],
      xpAwarded: 0,
      coinsAwarded: 0,
    })

    await updateTask({
      id: task!.id,
      title: task!.title,
      categoryIds: task!.categoryIds,
      questId: task!.questId,
      dueDate: task!.dueDate,
      cadence: task!.cadence,
      difficulty: task!.difficulty,
      notes: task!.notes,
      rewardOverride: task!.rewardOverride,
      subtasks: task!.subtasks.map((subtask) => subtask.title),
      active: task!.active,
    })

    const updatedTask = await db.tasks.get(task!.id)
    const completion = await db.completions.toCollection().first()

    expect(updatedTask?.subtasks[0]?.id).toBe(task!.subtasks[0].id)
    expect(completion?.completedSubtaskIds).toEqual([task!.subtasks[0].id])
  })

  it('removes completion history and linked reward transaction together', async () => {
    await createTask({
      title: 'Send the email',
      categoryIds: [],
      cadence: 'none',
      difficulty: 'small',
    })

    const task = await db.tasks.toCollection().first()
    await completeTask(task!)
    const completion = await db.completions.toCollection().first()

    await deleteCompletionRecord(completion!.id)

    expect(await db.completions.count()).toBe(0)
    expect(await db.walletTransactions.count()).toBe(0)
  })

  it('removes purchase history entries', async () => {
    await createReward({
      title: 'Coffee',
      coinCost: 2,
      repeatable: false,
    })
    await db.walletTransactions.add({
      id: 'seed-coins',
      type: 'task_reward',
      amount: 3,
      sourceId: 'seed',
      createdAt: new Date().toISOString(),
    })

    const reward = await db.rewards.toCollection().first()
    await purchaseReward(reward!)
    const purchase = await db.walletTransactions.where('type').equals('reward_purchase').first()

    await deleteWalletTransaction(purchase!.id)

    expect(await db.walletTransactions.where('type').equals('reward_purchase').count()).toBe(0)
  })

  it('archives a non-repeatable reward after purchase', async () => {
    await createReward({
      title: 'Coffee',
      coinCost: 2,
      repeatable: false,
    })
    await db.walletTransactions.add({
      id: 'seed-coins',
      type: 'task_reward',
      amount: 3,
      sourceId: 'seed',
      createdAt: new Date().toISOString(),
    })

    const reward = await db.rewards.toCollection().first()
    const purchased = await purchaseReward(reward!)

    expect(purchased).toBe(true)
    expect((await db.rewards.get(reward!.id))?.archived).toBe(true)
  })

  it('restores a non-repeatable reward when its purchase is removed', async () => {
    await createReward({
      title: 'Coffee',
      coinCost: 2,
      repeatable: false,
    })
    await db.walletTransactions.add({
      id: 'seed-coins',
      type: 'task_reward',
      amount: 3,
      sourceId: 'seed',
      createdAt: new Date().toISOString(),
    })

    const reward = await db.rewards.toCollection().first()
    await purchaseReward(reward!)
    const purchase = await db.walletTransactions.where('type').equals('reward_purchase').first()

    await deleteWalletTransaction(purchase!.id)

    expect((await db.rewards.get(reward!.id))?.archived).toBe(false)
  })

  it('awards quest rewards once per quest', async () => {
    await createQuest({
      title: 'Journey to Summit',
      description: '',
      imageUrl: '',
      rewardXp: 200,
      rewardCoins: 40,
    })

    const quest = await db.quests.toCollection().first()
    expect(quest).toBeTruthy()

    await completeQuest(quest!)
    await completeQuest(quest!)

    expect(await db.walletTransactions.where('type').equals('quest_reward').count()).toBe(1)
    expect((await db.walletTransactions.where('type').equals('quest_reward').first())?.id).toBe(`quest_reward:${quest!.id}`)
    const stored = await db.quests.get(quest!.id)
    expect(stored?.completedAt).toBeTruthy()
  })

  it('deletes a quest, removes its reward history, and unlinks its tasks', async () => {
    await createQuest({
      title: 'Journey to Summit',
      description: '',
      imageUrl: '',
      rewardXp: 200,
      rewardCoins: 40,
    })

    const quest = await db.quests.toCollection().first()
    expect(quest).toBeTruthy()

    await createTask({
      title: 'Climb the first ridge',
      categoryIds: [],
      questId: quest!.id,
      cadence: 'none',
      difficulty: 'small',
    })

    await completeQuest(quest!)
    await deleteQuest(quest!.id)

    expect(await db.quests.get(quest!.id)).toBeUndefined()
    expect(await db.walletTransactions.where('sourceId').equals(quest!.id).count()).toBe(0)

    const task = await db.tasks.toCollection().first()
    expect(task?.questId).toBeUndefined()
  })

  it('deletes a category and leaves affected tasks uncategorized when needed', async () => {
    await db.categories.bulkAdd([
      {
        id: 'health',
        name: 'Health',
        iconKey: 'leaf',
        colorKey: 'brass',
        sortOrder: 0,
        archived: false,
      },
      {
        id: 'rituals',
        name: 'Rituals',
        iconKey: 'sun',
        colorKey: 'sage',
        sortOrder: 1,
        archived: false,
      },
    ])

    await createTask({
      title: 'Doctor booking',
      categoryIds: ['health'],
      cadence: 'none',
      difficulty: 'small',
    })

    await createTask({
      title: 'Stretch',
      categoryIds: ['health', 'rituals'],
      cadence: 'daily',
      difficulty: 'small',
    })

    await deleteCategory('health')

    expect(await db.categories.get('health')).toBeUndefined()

    const tasks = await db.tasks.orderBy('sortOrder').toArray()
    expect(tasks[0]?.categoryIds).toEqual([])
    expect(tasks[1]?.categoryIds).toEqual(['rituals'])
  })

  it('creates quests and tasks from a bulk import plan', async () => {
    await db.categories.add({
      id: 'health',
      name: 'Health',
      iconKey: 'leaf',
      colorKey: 'brass',
      sortOrder: 0,
      archived: false,
    })

    const plan = parseBulkImportInput(
      JSON.stringify({
        categories: [
          {
            id: 'house-admin',
            name: 'House Admin',
            colorKey: 'blush',
          },
        ],
        quests: [
          {
            title: 'Apartment reset',
            rewardXp: 120,
            rewardCoins: 24,
            tasks: [
              {
                title: 'Clear the sink',
                categoryIds: [],
              },
              {
                title: 'Refill prescriptions',
                categoryIds: ['health', 'house-admin'],
                subtasks: ['Check repeat order', 'Collect medication'],
              },
            ],
          },
        ],
      }),
      {
        categories: await db.categories.toArray(),
        quests: await db.quests.toArray(),
      },
    )

    const commit = await createFromBulkImportPlan(plan)

    const createdQuest = (await db.quests.toArray()).find((quest) => quest.title === 'Apartment reset')
    const createdTasks = await db.tasks.orderBy('sortOrder').toArray()
    const createdCategory = await db.categories.get('house-admin')

    expect(createdQuest).toBeTruthy()
    expect(createdTasks).toHaveLength(2)
    expect(createdTasks.every((task) => task.questId === createdQuest?.id)).toBe(true)
    expect(createdTasks[1]?.subtasks).toHaveLength(2)
    expect(createdCategory).toMatchObject({
      id: 'house-admin',
      name: 'House Admin',
      iconKey: 'spark',
      colorKey: 'blush',
      archived: false,
    })
    expect(commit.taskIds).toHaveLength(2)
    expect(commit.questIds).toHaveLength(1)
    expect(commit.categoryIds).toContain('house-admin')
    expect(commit.batchId).toBeTruthy()
  })

  it('undoes the last bulk import and cleans up created categories', async () => {
    const plan = parseBulkImportInput(
      JSON.stringify({
        categories: [
          {
            id: 'summer-training',
            name: 'Summer Training',
            colorKey: 'sage',
          },
        ],
        quests: [
          {
            title: 'Summer body',
            tasks: [
              {
                title: 'Plan week one',
                categoryIds: ['summer-training'],
              },
            ],
          },
        ],
      }),
      {
        categories: await db.categories.toArray(),
        quests: await db.quests.toArray(),
      },
    )

    const commit = await createFromBulkImportPlan(plan)

    await undoBulkImport(commit)

    expect(await db.tasks.bulkGet(commit.taskIds)).toEqual([undefined])
    expect(await db.quests.bulkGet(commit.questIds)).toEqual([undefined])
    expect(await db.categories.get('summer-training')).toBeUndefined()
  })

  it('deletes a bulk import by batch id', async () => {
    const plan = parseBulkImportInput(
      JSON.stringify({
        quests: [
          {
            title: 'Delete me',
            tasks: [
              {
                title: 'Imported task',
                categoryIds: [],
              },
            ],
          },
        ],
      }),
      {
        categories: await db.categories.toArray(),
        quests: await db.quests.toArray(),
      },
    )

    const commit = await createFromBulkImportPlan(plan)
    await deleteBulkImport(commit.batchId)

    expect(await db.tasks.bulkGet(commit.taskIds)).toEqual([undefined])
    expect(await db.quests.bulkGet(commit.questIds)).toEqual([undefined])
  })
})
