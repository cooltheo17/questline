import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import {
  completeTask,
  createTask,
  deleteCompletionRecord,
  deleteWalletTransaction,
  ensureSeedData,
  purchaseReward,
  createReward,
  toggleSubtask,
} from './repository'

describe('repository flows', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    await ensureSeedData()
  })

  it('awards a one-off task immediately on completion', async () => {
    await createTask({
      title: 'Send the email',
      categoryIds: ['inbox'],
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
    expect(transactions).toHaveLength(1)
  })

  it('waits for the last subtask before awarding rewards', async () => {
    await createTask({
      title: 'Take vitamins',
      categoryIds: ['health', 'rituals'],
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

  it('removes completion history and linked reward transaction together', async () => {
    await createTask({
      title: 'Send the email',
      categoryIds: ['inbox'],
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
})
