import type {
  Cadence,
  Category,
  CreateCategoryInput,
  CreateQuestInput,
  CreateTaskInput,
  Difficulty,
  Quest,
} from './types'

const DEFAULT_QUEST_REWARD_XP = 100
const DEFAULT_QUEST_REWARD_COINS = 25

export interface BulkImportQuestPlan {
  key: string
  input: CreateQuestInput
}

export interface BulkImportCategoryPlan {
  id: string
  input: CreateCategoryInput
}

export type BulkImportQuestReference =
  | { kind: 'existing'; questId: string }
  | { kind: 'new'; questKey: string }

export interface BulkImportTaskPlan {
  input: CreateTaskInput
  questRef?: BulkImportQuestReference
}

export interface BulkImportPlan {
  categories: BulkImportCategoryPlan[]
  quests: BulkImportQuestPlan[]
  tasks: BulkImportTaskPlan[]
  warnings: string[]
  summary: {
    categoryCount: number
    questCount: number
    taskCount: number
    subtaskCount: number
  }
}

interface BulkImportPayload {
  categories?: BulkCategoryPayload[]
  quests?: BulkQuestPayload[]
  tasks?: BulkTaskPayload[]
}

interface BulkCategoryPayload {
  id?: string
  name?: string
  colorKey?: string
}

interface BulkQuestPayload {
  title?: string
  description?: string
  imageUrl?: string
  rewardXp?: number
  rewardCoins?: number
  tasks?: BulkTaskPayload[]
}

interface BulkTaskPayload {
  title?: string
  notes?: string
  categoryIds?: string[]
  questTitle?: string
  dueDate?: string
  cadence?: Cadence
  difficulty?: Difficulty
  rewardOverride?: {
    xp?: number
    coins?: number
  }
  subtasks?: string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readText(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim()
  return normalized || undefined
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function toLookupKey(value: string): string {
  return value.trim().toLowerCase()
}

function parseCadence(value: unknown, taskTitle: string): Cadence {
  if (value === undefined) {
    return 'none'
  }

  if (value === 'none' || value === 'daily' || value === 'weekly' || value === 'monthly') {
    return value
  }

  throw new Error(`Task "${taskTitle}" has an invalid cadence.`)
}

function parseDifficulty(value: unknown, taskTitle: string): Difficulty {
  if (value === undefined) {
    return 'small'
  }

  if (value === 'tiny' || value === 'small' || value === 'medium' || value === 'large') {
    return value
  }

  throw new Error(`Task "${taskTitle}" has an invalid difficulty.`)
}

function parseDueDate(value: unknown, taskTitle: string): string | undefined {
  const dueDate = readText(value)

  if (!dueDate) {
    return undefined
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new Error(`Task "${taskTitle}" has an invalid dueDate. Use YYYY-MM-DD.`)
  }

  return dueDate
}

function parseRewardOverride(value: unknown, taskTitle: string): CreateTaskInput['rewardOverride'] {
  if (value === undefined) {
    return undefined
  }

  if (!isRecord(value)) {
    throw new Error(`Task "${taskTitle}" has an invalid rewardOverride.`)
  }

  const xp = readNumber(value.xp)
  const coins = readNumber(value.coins)

  if (xp === undefined && coins === undefined) {
    return undefined
  }

  return {
    xp: Math.max(0, xp ?? 0),
    coins: Math.max(0, coins ?? 0),
  }
}

function parseSubtasks(value: unknown, taskTitle: string): string[] {
  if (value === undefined) {
    return []
  }

  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`Task "${taskTitle}" must use a string array for subtasks.`)
  }

  return value.map((entry) => entry.trim()).filter(Boolean)
}

function parseCategoryIds(
  value: unknown,
  taskTitle: string,
  fallbackCategoryId: string,
): string[] {
  if (value === undefined) {
    return [fallbackCategoryId]
  }

  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`Task "${taskTitle}" must use a string array for categoryIds.`)
  }

  const categoryIds = [...new Set(value.map((entry) => entry.trim()).filter(Boolean))]

  if (categoryIds.length === 0) {
    return [fallbackCategoryId]
  }

  return categoryIds
}

function parseCategoryPlan(record: Record<string, unknown>, index: number): BulkImportCategoryPlan {
  const id = readText(record.id)

  if (!id) {
    throw new Error(`Category ${index + 1} is missing an id.`)
  }

  const name = readText(record.name) ?? id
  const colorKey = readText(record.colorKey) ?? 'slate'

  if (!['slate', 'brass', 'sage', 'blush', 'plum', 'mist'].includes(colorKey)) {
    throw new Error(`Category "${id}" has an invalid colorKey.`)
  }

  return {
    id,
    input: {
      name,
      colorKey,
    },
  }
}

function parseQuestPlan(record: Record<string, unknown>, index: number): BulkImportQuestPlan {
  const title = readText(record.title)

  if (!title) {
    throw new Error(`Quest ${index + 1} is missing a title.`)
  }

  return {
    key: `quest-${index + 1}`,
    input: {
      title,
      description: readText(record.description),
      imageUrl: readText(record.imageUrl),
      rewardXp: Math.max(0, readNumber(record.rewardXp) ?? DEFAULT_QUEST_REWARD_XP),
      rewardCoins: Math.max(0, readNumber(record.rewardCoins) ?? DEFAULT_QUEST_REWARD_COINS),
    },
  }
}

function parseTaskPlan(
  record: Record<string, unknown>,
  questLookup: Map<string, BulkImportQuestReference>,
  fallbackCategoryId: string,
  parentQuestKey?: string,
): BulkImportTaskPlan {
  const title = readText(record.title)

  if (!title) {
    throw new Error('Every task needs a title.')
  }

  const questTitle = readText(record.questTitle)
  const questRef: BulkImportQuestReference | undefined = parentQuestKey
    ? { kind: 'new', questKey: parentQuestKey }
    : questTitle
      ? questLookup.get(toLookupKey(questTitle))
      : undefined

  if (questTitle && !questRef) {
    throw new Error(`Task "${title}" references an unknown questTitle: ${questTitle}.`)
  }

  return {
    input: {
      title,
      notes: readText(record.notes),
      categoryIds: parseCategoryIds(record.categoryIds, title, fallbackCategoryId),
      dueDate: parseDueDate(record.dueDate, title),
      cadence: parseCadence(record.cadence, title),
      difficulty: parseDifficulty(record.difficulty, title),
      rewardOverride: parseRewardOverride(record.rewardOverride, title),
      subtasks: parseSubtasks(record.subtasks, title),
    },
    questRef,
  }
}

function parsePayload(raw: string): BulkImportPayload {
  const trimmed = raw.trim()

  if (!trimmed) {
    throw new Error('Paste JSON to preview the import.')
  }

  let payload: unknown

  try {
    payload = JSON.parse(trimmed)
  } catch {
    throw new Error('Invalid JSON.')
  }

  if (!isRecord(payload)) {
    throw new Error('Use a JSON object with optional "quests" and "tasks" arrays.')
  }

  if (payload.categories !== undefined && !Array.isArray(payload.categories)) {
    throw new Error('"categories" must be an array.')
  }

  if (payload.quests !== undefined && !Array.isArray(payload.quests)) {
    throw new Error('"quests" must be an array.')
  }

  if (payload.tasks !== undefined && !Array.isArray(payload.tasks)) {
    throw new Error('"tasks" must be an array.')
  }

  return payload as BulkImportPayload
}

export function parseBulkImportInput(
  raw: string,
  {
    categories,
    quests,
  }: {
    categories: Category[]
    quests: Quest[]
  },
): BulkImportPlan {
  const payload = parsePayload(raw)
  const fallbackCategoryId = categories[0]?.id ?? 'inbox'
  const questLookup = new Map<string, BulkImportQuestReference>()
  const existingCategoryIds = new Set(categories.map((category) => category.id))
  const warnings: string[] = []
  const parsedCategoryPlans = (payload.categories ?? []).map((category, index) => {
    if (!isRecord(category)) {
      throw new Error(`Category ${index + 1} must be an object.`)
    }

    return parseCategoryPlan(category, index)
  })
  const categoryPlans = parsedCategoryPlans.filter((categoryPlan) => {
    if (!existingCategoryIds.has(categoryPlan.id)) {
      return true
    }

    warnings.push(`Skipped category "${categoryPlan.id}" because it already exists.`)
    return false
  })

  for (const quest of quests) {
    questLookup.set(toLookupKey(quest.title), { kind: 'existing', questId: quest.id })
  }

  const questPlans = (payload.quests ?? []).map((quest, index) => {
    if (!isRecord(quest)) {
      throw new Error(`Quest ${index + 1} must be an object.`)
    }

    return parseQuestPlan(quest, index)
  })

  for (const questPlan of questPlans) {
    const lookupKey = toLookupKey(questPlan.input.title)

    if (questLookup.has(lookupKey)) {
      throw new Error(`Quest title "${questPlan.input.title}" is already in use.`)
    }

    questLookup.set(lookupKey, { kind: 'new', questKey: questPlan.key })
  }

  const nestedTasks = (payload.quests ?? []).flatMap((quest, questIndex) => {
    if (!isRecord(quest)) {
      return []
    }

    const parentQuestKey = questPlans[questIndex]?.key

    if (quest.tasks === undefined) {
      return []
    }

    if (!Array.isArray(quest.tasks)) {
      throw new Error(`Quest "${questPlans[questIndex]?.input.title}" must use an array for tasks.`)
    }

    return quest.tasks.map((task, taskIndex) => {
      if (!isRecord(task)) {
        throw new Error(`Task ${taskIndex + 1} in quest "${questPlans[questIndex]?.input.title}" must be an object.`)
      }

      return parseTaskPlan(task, questLookup, fallbackCategoryId, parentQuestKey)
    })
  })

  const standaloneTasks = (payload.tasks ?? []).map((task, index) => {
    if (!isRecord(task)) {
      throw new Error(`Task ${index + 1} must be an object.`)
    }

    return parseTaskPlan(task, questLookup, fallbackCategoryId)
  })

  const tasks = [...nestedTasks, ...standaloneTasks]

  if (categoryPlans.length === 0 && questPlans.length === 0 && tasks.length === 0) {
    throw new Error('No categories, quests, or tasks found in the payload.')
  }

  return {
    categories: categoryPlans,
    quests: questPlans,
    tasks,
    warnings,
    summary: {
      categoryCount: categoryPlans.length,
      questCount: questPlans.length,
      taskCount: tasks.length,
      subtaskCount: tasks.reduce((count, task) => count + (task.input.subtasks?.length ?? 0), 0),
    },
  }
}
