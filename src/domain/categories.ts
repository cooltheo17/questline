import type { Category, Task } from './types'

export const UNCATEGORIZED_LABEL = 'Uncategorized'
export const UNCATEGORIZED_TONE = 'mist'

export const categoryColorOptions = [
  { label: 'Slate', value: 'slate' },
  { label: 'Brass', value: 'brass' },
  { label: 'Sage', value: 'sage' },
  { label: 'Blush', value: 'blush' },
  { label: 'Plum', value: 'plum' },
  { label: 'Mist', value: 'mist' },
] as const

export function isRitualCategory(category: Category | undefined): boolean {
  if (!category) {
    return false
  }

  return /habit|ritual/i.test(category.name) || category.id === 'rituals'
}

export function isRitualTask(task: Task, categoriesById: Map<string, Category>): boolean {
  return task.categoryIds.some((categoryId) => isRitualCategory(categoriesById.get(categoryId)))
}

export function getCategoryTone(colorKey: string | undefined): string {
  return colorKey ?? 'mist'
}
