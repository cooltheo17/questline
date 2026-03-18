import { db, DEFAULT_CATEGORY_ID } from './db'
import { parseSnapshot } from './backup'
import { getCompletionForDate, getOccurrenceKey } from '../domain/recurrence'
import { getTaskReward, getWalletBalance } from '../domain/rewards'
import type {
  AppSnapshot,
  Category,
  CompletionRecord,
  CreateCategoryInput,
  CreateRewardInput,
  CreateTaskInput,
  RewardItem,
  Task,
  UpdateRewardInput,
  UpdateTaskInput,
} from '../domain/types'

function createId(): string {
  return crypto.randomUUID()
}

function toSubtasks(titles: string[]) {
  return titles
    .map((title) => title.trim())
    .filter(Boolean)
    .map((title, index) => ({
      id: createId(),
      title,
      sortOrder: index,
    }))
}

export async function ensureSeedData(): Promise<void> {
  const count = await db.categories.count()

  if (count > 0) {
    const inbox = await db.categories.get(DEFAULT_CATEGORY_ID)

    if (inbox && inbox.name === 'Inbox') {
      await db.categories.put({ ...inbox, name: 'General' })
    }

    return
  }

  await db.categories.bulkAdd([
    {
      id: DEFAULT_CATEGORY_ID,
      name: 'General',
      iconKey: 'scroll',
      colorKey: 'mist',
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
    {
      id: 'health',
      name: 'Health',
      iconKey: 'leaf',
      colorKey: 'brass',
      sortOrder: 2,
      archived: false,
    },
  ])
}

export async function createCategory(input: CreateCategoryInput): Promise<void> {
  const sortOrder = await db.categories.count()
  await db.categories.add({
    id: createId(),
    name: input.name.trim(),
    iconKey: 'spark',
    colorKey: input.colorKey,
    sortOrder,
    archived: false,
  })
}

export async function updateCategory(category: Category): Promise<void> {
  await db.categories.put(category)
}

export async function createTask(input: CreateTaskInput): Promise<void> {
  const lastTask = await db.tasks.orderBy('sortOrder').last()

  await db.tasks.add({
    id: createId(),
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    categoryIds: input.categoryIds.length ? input.categoryIds : [DEFAULT_CATEGORY_ID],
    cadence: input.cadence,
    difficulty: input.difficulty,
    rewardOverride: input.rewardOverride,
    subtasks: toSubtasks(input.subtasks ?? []),
    active: true,
    sortOrder: (lastTask?.sortOrder ?? 0) + 1,
    anchorDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  })
}

export async function updateTask(input: UpdateTaskInput): Promise<void> {
  const current = await db.tasks.get(input.id)

  if (!current) {
    return
  }

  await db.tasks.put({
    ...current,
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    categoryIds: input.categoryIds.length ? input.categoryIds : [DEFAULT_CATEGORY_ID],
    cadence: input.cadence,
    difficulty: input.difficulty,
    rewardOverride: input.rewardOverride,
    subtasks: toSubtasks(input.subtasks ?? []),
    active: input.active,
  })
}

async function saveCompletionReward(task: Task, completion: CompletionRecord, when: Date): Promise<void> {
  const reward = getTaskReward(task)

  completion.completedAt = when.toISOString()
  completion.xpAwarded = reward.xp
  completion.coinsAwarded = reward.coins

  await db.transaction('rw', db.completions, db.walletTransactions, async () => {
    await db.completions.put(completion)
    await db.walletTransactions.add({
      id: createId(),
      type: 'task_reward',
      amount: reward.coins,
      sourceId: completion.id,
      createdAt: when.toISOString(),
    })
  })
}

export async function completeTask(task: Task, when = new Date()): Promise<void> {
  if (task.subtasks.length > 0) {
    return
  }

  const completions = await db.completions.where('taskId').equals(task.id).toArray()
  const existing = getCompletionForDate(task, completions, when)

  if (existing?.completedAt) {
    return
  }

  const completion: CompletionRecord =
    existing ?? {
      id: createId(),
      taskId: task.id,
      occurrenceKey: getOccurrenceKey(task, when),
      completedSubtaskIds: [],
      xpAwarded: 0,
      coinsAwarded: 0,
    }

  await saveCompletionReward(task, completion, when)
}

export async function toggleSubtask(task: Task, subtaskId: string, when = new Date()): Promise<void> {
  const completions = await db.completions.where('taskId').equals(task.id).toArray()
  const existing = getCompletionForDate(task, completions, when)

  if (existing?.completedAt) {
    return
  }

  const completion: CompletionRecord =
    existing ?? {
      id: createId(),
      taskId: task.id,
      occurrenceKey: getOccurrenceKey(task, when),
      completedSubtaskIds: [],
      xpAwarded: 0,
      coinsAwarded: 0,
    }

  const completedIds = new Set(completion.completedSubtaskIds)

  if (completedIds.has(subtaskId)) {
    completedIds.delete(subtaskId)
  } else {
    completedIds.add(subtaskId)
  }

  completion.completedSubtaskIds = [...completedIds]

  if (completion.completedSubtaskIds.length === task.subtasks.length) {
    await saveCompletionReward(task, completion, when)
    return
  }

  await db.completions.put(completion)
}

export async function createReward(input: CreateRewardInput): Promise<void> {
  await db.rewards.add({
    id: createId(),
    title: input.title.trim(),
    coinCost: input.coinCost,
    notes: input.notes?.trim() || undefined,
    link: input.link?.trim() || undefined,
    repeatable: input.repeatable,
    archived: false,
    createdAt: new Date().toISOString(),
  })
}

export async function updateReward(input: UpdateRewardInput): Promise<void> {
  const reward = await db.rewards.get(input.id)

  if (!reward) {
    return
  }

  await db.rewards.put({
    ...reward,
    title: input.title.trim(),
    coinCost: input.coinCost,
    notes: input.notes?.trim() || undefined,
    link: input.link?.trim() || undefined,
    repeatable: input.repeatable,
    archived: input.archived,
  })
}

export async function purchaseReward(reward: RewardItem): Promise<boolean> {
  const balance = getWalletBalance(await db.walletTransactions.toArray())

  if (balance < reward.coinCost) {
    return false
  }

  await db.walletTransactions.add({
    id: createId(),
    type: 'reward_purchase',
    amount: -reward.coinCost,
    sourceId: reward.id,
    createdAt: new Date().toISOString(),
  })

  return true
}

export async function reorderTasks(taskIds: string[]): Promise<void> {
  await db.transaction('rw', db.tasks, async () => {
    await Promise.all(
      taskIds.map((taskId, index) =>
        db.tasks.update(taskId, {
          sortOrder: index + 1,
        }),
      ),
    )
  })
}

export async function deleteCompletionRecord(completionId: string): Promise<void> {
  await db.transaction('rw', db.completions, db.walletTransactions, async () => {
    await db.completions.delete(completionId)
    const linkedTransactions = await db.walletTransactions.where('sourceId').equals(completionId).toArray()
    await db.walletTransactions.bulkDelete(linkedTransactions.map((entry) => entry.id))
  })
}

export async function deleteWalletTransaction(transactionId: string): Promise<void> {
  await db.walletTransactions.delete(transactionId)
}

export async function deleteTask(taskId: string): Promise<void> {
  await db.transaction('rw', db.tasks, db.completions, db.walletTransactions, async () => {
    await db.tasks.delete(taskId)
    const completions = await db.completions.where('taskId').equals(taskId).toArray()
    await db.completions.bulkDelete(completions.map((completion) => completion.id))
    const linkedRewardIds = completions.map((completion) => completion.id)
    const linkedTransactions = await db.walletTransactions
      .filter((entry) => linkedRewardIds.includes(entry.sourceId))
      .toArray()
    await db.walletTransactions.bulkDelete(linkedTransactions.map((entry) => entry.id))
  })
}

export async function deleteReward(rewardId: string): Promise<void> {
  await db.transaction('rw', db.rewards, db.walletTransactions, async () => {
    await db.rewards.delete(rewardId)
    const transactions = await db.walletTransactions.where('sourceId').equals(rewardId).toArray()
    await db.walletTransactions.bulkDelete(transactions.map((entry) => entry.id))
  })
}

export async function replaceSnapshot(snapshot: AppSnapshot): Promise<void> {
  await db.transaction(
    'rw',
    [db.categories, db.tasks, db.completions, db.rewards, db.walletTransactions],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.tasks.clear(),
        db.completions.clear(),
        db.rewards.clear(),
        db.walletTransactions.clear(),
      ])

      await db.categories.bulkAdd(snapshot.categories)
      await db.tasks.bulkAdd(snapshot.tasks)
      await db.completions.bulkAdd(snapshot.completions)
      await db.rewards.bulkAdd(snapshot.rewards)
      await db.walletTransactions.bulkAdd(snapshot.walletTransactions)
    },
  )

  await ensureSeedData()
}

export async function importSnapshot(raw: string): Promise<void> {
  await replaceSnapshot(parseSnapshot(raw))
}

export async function resetAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [db.categories, db.tasks, db.completions, db.rewards, db.walletTransactions],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.tasks.clear(),
        db.completions.clear(),
        db.rewards.clear(),
        db.walletTransactions.clear(),
      ])
    },
  )

  await ensureSeedData()
}
