import { db } from './db'
import { parseSnapshot } from './backup'
import { getCompletionForDate, getOccurrenceKey } from '../domain/recurrence'
import { getTaskReward, getWalletBalance } from '../domain/rewards'
import type { BulkImportPlan } from '../domain/bulkAdd'
import type {
  AppSnapshot,
  Category,
  CompletionRecord,
  CreateCategoryInput,
  CreateQuestInput,
  CreateRewardInput,
  CreateTaskInput,
  Quest,
  RewardItem,
  Task,
  UpdateQuestInput,
  UpdateRewardInput,
  UpdateTaskInput,
} from '../domain/types'

export interface BulkImportCommit {
  batchId: string
  categoryIds: string[]
  questIds: string[]
  taskIds: string[]
}

function createId(): string {
  return crypto.randomUUID()
}

function createCompletionId(taskId: string, occurrenceKey: string): string {
  return `completion:${taskId}:${occurrenceKey}`
}

function createTaskRewardTransactionId(completionId: string): string {
  return `task_reward:${completionId}`
}

function createQuestRewardTransactionId(questId: string): string {
  return `quest_reward:${questId}`
}

function normalizeDueDate(value: string | undefined): string | undefined {
  const nextValue = value?.trim()
  return nextValue ? nextValue : undefined
}

function normalizeQuestId(value: string | undefined): string | undefined {
  const nextValue = value?.trim()
  return nextValue ? nextValue : undefined
}

function toCategoryName(categoryId: string): string {
  const normalized = categoryId
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')

  if (!normalized) {
    return 'New category'
  }

  return normalized.replace(/\b\w/g, (character) => character.toUpperCase())
}

function parseLocalDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day, 12)
}

function toAnchorDate(dueDate: string | undefined): string {
  return dueDate ? parseLocalDateKey(dueDate).toISOString() : new Date().toISOString()
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
  // Starter categories are no longer auto-created. New installs begin empty.
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

export async function deleteCategory(categoryId: string): Promise<void> {
  await db.transaction('rw', db.categories, db.tasks, async () => {
    const category = await db.categories.get(categoryId)

    if (!category) {
      return
    }

    await db.categories.delete(categoryId)
    await db.tasks.where('categoryIds').equals(categoryId).modify((task) => {
      task.categoryIds = task.categoryIds.filter((id) => id !== categoryId)
    })
  })
}

export async function createTask(input: CreateTaskInput): Promise<void> {
  const lastTask = await db.tasks.orderBy('sortOrder').last()
  const dueDate = normalizeDueDate(input.dueDate)
  const questId = normalizeQuestId(input.questId)

  await db.tasks.add({
    id: createId(),
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    categoryIds: input.categoryIds,
    dueDate,
    questId,
    cadence: input.cadence,
    difficulty: input.difficulty,
    rewardOverride: input.rewardOverride,
    subtasks: toSubtasks(input.subtasks ?? []),
    active: true,
    sortOrder: (lastTask?.sortOrder ?? 0) + 1,
    anchorDate: toAnchorDate(dueDate),
    createdAt: new Date().toISOString(),
  })
}

export async function updateTask(input: UpdateTaskInput): Promise<void> {
  const current = await db.tasks.get(input.id)

  if (!current) {
    return
  }

  const dueDate = normalizeDueDate(input.dueDate)
  const questId = normalizeQuestId(input.questId)

  await db.tasks.put({
    ...current,
    title: input.title.trim(),
    notes: input.notes?.trim() || undefined,
    categoryIds: input.categoryIds,
    dueDate,
    questId,
    cadence: input.cadence,
    difficulty: input.difficulty,
    rewardOverride: input.rewardOverride,
    subtasks: toSubtasks(input.subtasks ?? []),
    active: input.active,
    anchorDate: dueDate ? toAnchorDate(dueDate) : current.anchorDate,
  })
}

export async function createFromBulkImportPlan(plan: BulkImportPlan): Promise<BulkImportCommit> {
  const batchId = createId()
  const batchCreatedAt = new Date().toISOString()
  const existingCategories = await db.categories.toArray()
  const lastQuest = await db.quests.orderBy('sortOrder').last()
  const lastTask = await db.tasks.orderBy('sortOrder').last()
  let nextCategorySortOrder = existingCategories.reduce((highest, category) => Math.max(highest, category.sortOrder), -1)
  let nextQuestSortOrder = lastQuest?.sortOrder ?? 0
  let nextTaskSortOrder = lastTask?.sortOrder ?? 0
  const questIdByKey = new Map<string, string>()
  const existingCategoryIds = new Set(existingCategories.map((category) => category.id))
  const categoriesToCreate = new Map<string, Category>()

  for (const category of plan.categories) {
    const normalizedCategoryId = category.id.trim()

    if (!normalizedCategoryId || existingCategoryIds.has(normalizedCategoryId) || categoriesToCreate.has(normalizedCategoryId)) {
      continue
    }

    nextCategorySortOrder += 1
    categoriesToCreate.set(normalizedCategoryId, {
      id: normalizedCategoryId,
      name: category.input.name.trim(),
      iconKey: 'spark',
      colorKey: category.input.colorKey,
      sortOrder: nextCategorySortOrder,
      archived: false,
      importBatchId: batchId,
    })
  }

  for (const task of plan.tasks) {
    for (const categoryId of task.input.categoryIds) {
      const normalizedCategoryId = categoryId.trim()

      if (!normalizedCategoryId || existingCategoryIds.has(normalizedCategoryId) || categoriesToCreate.has(normalizedCategoryId)) {
        continue
      }

      nextCategorySortOrder += 1
      categoriesToCreate.set(normalizedCategoryId, {
        id: normalizedCategoryId,
        name: toCategoryName(normalizedCategoryId),
        iconKey: 'spark',
        colorKey: 'slate',
        sortOrder: nextCategorySortOrder,
        archived: false,
        importBatchId: batchId,
      })
    }
  }

  const questsToCreate = plan.quests.map((quest) => {
    const id = createId()
    questIdByKey.set(quest.key, id)
    nextQuestSortOrder += 1

    return {
      id,
      title: quest.input.title.trim(),
      description: quest.input.description?.trim() || undefined,
      imageUrl: quest.input.imageUrl?.trim() || undefined,
      rewardXp: Math.max(0, quest.input.rewardXp),
      rewardCoins: Math.max(0, quest.input.rewardCoins),
      sortOrder: nextQuestSortOrder,
      archived: false,
      createdAt: batchCreatedAt,
      importBatchId: batchId,
    }
  })

  const tasksToCreate = plan.tasks.map(({ input, questRef }) => {
    const dueDate = normalizeDueDate(input.dueDate)
    const questId =
      questRef?.kind === 'existing'
        ? questRef.questId
        : questRef?.kind === 'new'
          ? questIdByKey.get(questRef.questKey)
          : normalizeQuestId(input.questId)

    nextTaskSortOrder += 1

    return {
      id: createId(),
      title: input.title.trim(),
      notes: input.notes?.trim() || undefined,
      categoryIds: input.categoryIds,
      dueDate,
      questId,
      cadence: input.cadence,
      difficulty: input.difficulty,
      rewardOverride: input.rewardOverride,
      subtasks: toSubtasks(input.subtasks ?? []),
      active: true,
      sortOrder: nextTaskSortOrder,
      anchorDate: toAnchorDate(dueDate),
      createdAt: batchCreatedAt,
      importBatchId: batchId,
    }
  })

  await db.transaction('rw', db.categories, db.quests, db.tasks, async () => {
    if (categoriesToCreate.size > 0) {
      await db.categories.bulkAdd([...categoriesToCreate.values()])
    }

    if (questsToCreate.length > 0) {
      await db.quests.bulkAdd(questsToCreate)
    }

    if (tasksToCreate.length > 0) {
      await db.tasks.bulkAdd(tasksToCreate)
    }
  })

  return {
    batchId,
    categoryIds: [...categoriesToCreate.keys()],
    questIds: questsToCreate.map((quest) => quest.id),
    taskIds: tasksToCreate.map((task) => task.id),
  }
}

export async function undoBulkImport(commit: BulkImportCommit): Promise<void> {
  await deleteBulkImport(commit.batchId)
}

export async function deleteBulkImport(batchId: string): Promise<void> {
  await db.transaction('rw', [db.categories, db.quests, db.tasks, db.completions, db.walletTransactions], async () => {
    const [tasksInBatch, questsInBatch, categoriesInBatch] = await Promise.all([
      db.tasks.where('importBatchId').equals(batchId).toArray(),
      db.quests.where('importBatchId').equals(batchId).toArray(),
      db.categories.where('importBatchId').equals(batchId).toArray(),
    ])

    const taskIds = tasksInBatch.map((task) => task.id)
    const questIds = questsInBatch.map((quest) => quest.id)
    const categoryIds = categoriesInBatch.map((category) => category.id)
    const completions = taskIds.length
      ? await db.completions.filter((completion) => taskIds.includes(completion.taskId)).toArray()
      : []
    const linkedCompletionIds = new Set(completions.map((completion) => completion.id))
    const linkedTransactions = await db.walletTransactions
      .filter(
        (entry) =>
          linkedCompletionIds.has(entry.sourceId) ||
          (questIds.includes(entry.sourceId) && entry.type === 'quest_reward'),
      )
      .toArray()

    if (taskIds.length > 0) {
      await db.tasks.bulkDelete(taskIds)
    }

    if (completions.length > 0) {
      await db.completions.bulkDelete(completions.map((completion) => completion.id))
    }

    if (questIds.length > 0) {
      await db.quests.bulkDelete(questIds)
      await db.tasks.where('questId').anyOf(questIds).modify((task) => {
        delete task.questId
      })
    }

    if (linkedTransactions.length > 0) {
      await db.walletTransactions.bulkDelete(linkedTransactions.map((entry) => entry.id))
    }

    if (categoryIds.length > 0) {
      const remainingTasks = await db.tasks.toArray()
      const categoryIdsStillInUse = new Set(
        remainingTasks.flatMap((task) => task.categoryIds).filter((categoryId) => categoryIds.includes(categoryId)),
      )
      const categoryIdsToDelete = categoryIds.filter((categoryId) => !categoryIdsStillInUse.has(categoryId))

      if (categoryIdsToDelete.length > 0) {
        await db.categories.bulkDelete(categoryIdsToDelete)
      }
    }
  })
}

async function saveCompletionReward(task: Task, completion: CompletionRecord, when: Date): Promise<void> {
  const reward = getTaskReward(task)

  completion.completedAt = when.toISOString()
  completion.xpAwarded = reward.xp
  completion.coinsAwarded = reward.coins

  await db.transaction('rw', db.completions, db.walletTransactions, async () => {
    await db.completions.put(completion)
    await db.walletTransactions.put({
      id: createTaskRewardTransactionId(completion.id),
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
      id: createCompletionId(task.id, getOccurrenceKey(task, when)),
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
      id: createCompletionId(task.id, getOccurrenceKey(task, when)),
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

export async function createQuest(input: CreateQuestInput): Promise<void> {
  const lastQuest = await db.quests.orderBy('sortOrder').last()

  await db.quests.add({
    id: createId(),
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    rewardXp: Math.max(0, input.rewardXp),
    rewardCoins: Math.max(0, input.rewardCoins),
    sortOrder: (lastQuest?.sortOrder ?? 0) + 1,
    archived: false,
    createdAt: new Date().toISOString(),
  })
}

export async function updateQuest(input: UpdateQuestInput): Promise<void> {
  const quest = await db.quests.get(input.id)

  if (!quest) {
    return
  }

  await db.quests.put({
    ...quest,
    title: input.title.trim(),
    description: input.description?.trim() || undefined,
    imageUrl: input.imageUrl?.trim() || undefined,
    rewardXp: Math.max(0, input.rewardXp),
    rewardCoins: Math.max(0, input.rewardCoins),
    archived: input.archived,
    completedAt: input.completedAt,
  })
}

export async function completeQuest(quest: Quest, when = new Date()): Promise<void> {
  await db.transaction('rw', db.quests, db.walletTransactions, async () => {
    const current = await db.quests.get(quest.id)

    if (!current || current.completedAt) {
      return
    }

    await db.quests.update(current.id, { completedAt: when.toISOString() })

    if (current.rewardCoins > 0) {
      await db.walletTransactions.put({
        id: createQuestRewardTransactionId(current.id),
        type: 'quest_reward',
        amount: current.rewardCoins,
        sourceId: current.id,
        createdAt: when.toISOString(),
      })
    }
  })
}

export async function purchaseReward(reward: RewardItem): Promise<boolean> {
  return db.transaction('rw', db.rewards, db.walletTransactions, async () => {
    const [currentReward, transactions] = await Promise.all([
      db.rewards.get(reward.id),
      db.walletTransactions.toArray(),
    ])

    if (!currentReward || currentReward.archived) {
      return false
    }

    const balance = getWalletBalance(transactions)

    if (balance < currentReward.coinCost) {
      return false
    }

    await db.walletTransactions.add({
      id: createId(),
      type: 'reward_purchase',
      amount: -currentReward.coinCost,
      sourceId: currentReward.id,
      createdAt: new Date().toISOString(),
    })

    if (!currentReward.repeatable) {
      await db.rewards.update(currentReward.id, { archived: true })
    }

    return true
  })
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
  await db.transaction('rw', db.walletTransactions, db.rewards, async () => {
    const transaction = await db.walletTransactions.get(transactionId)

    if (!transaction) {
      return
    }

    await db.walletTransactions.delete(transactionId)

    if (transaction.type !== 'reward_purchase') {
      return
    }

    const reward = await db.rewards.get(transaction.sourceId)

    if (!reward || reward.repeatable) {
      return
    }

    const remainingPurchases = await db.walletTransactions
      .where('sourceId')
      .equals(reward.id)
      .filter((entry) => entry.type === 'reward_purchase')
      .count()

    if (remainingPurchases === 0) {
      await db.rewards.update(reward.id, { archived: false })
    }
  })
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

export async function deleteQuest(questId: string): Promise<void> {
  await db.transaction('rw', db.quests, db.tasks, db.walletTransactions, async () => {
    await db.quests.delete(questId)
    await db.tasks.where('questId').equals(questId).modify((task) => {
      delete task.questId
    })

    const transactions = await db.walletTransactions
      .where('sourceId')
      .equals(questId)
      .filter((entry) => entry.type === 'quest_reward')
      .toArray()
    await db.walletTransactions.bulkDelete(transactions.map((entry) => entry.id))
  })
}

export async function replaceSnapshot(snapshot: AppSnapshot): Promise<void> {
  await db.transaction(
    'rw',
    [db.categories, db.tasks, db.quests, db.completions, db.rewards, db.walletTransactions],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.tasks.clear(),
        db.quests.clear(),
        db.completions.clear(),
        db.rewards.clear(),
        db.walletTransactions.clear(),
      ])

      await db.categories.bulkAdd(snapshot.categories)
      await db.tasks.bulkAdd(snapshot.tasks)
      await db.quests.bulkAdd(snapshot.quests)
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
    [db.categories, db.tasks, db.quests, db.completions, db.rewards, db.walletTransactions],
    async () => {
      await Promise.all([
        db.categories.clear(),
        db.tasks.clear(),
        db.quests.clear(),
        db.completions.clear(),
        db.rewards.clear(),
        db.walletTransactions.clear(),
      ])
    },
  )

  await ensureSeedData()
}
