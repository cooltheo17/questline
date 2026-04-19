import type { Cadence, Difficulty } from './types'

interface SelectOption<T extends string> {
  label: string
  value: T
}

export const cadenceOptions: SelectOption<Cadence>[] = [
  { label: 'One-off', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

export const difficultyOptions: SelectOption<Difficulty>[] = [
  { label: 'Tiny', value: 'tiny' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
]

export const effortOptions: Array<SelectOption<Difficulty | 'custom'>> = [
  ...difficultyOptions,
  { label: 'Custom', value: 'custom' },
]

export function formatCadenceLabel(cadence: Cadence): string {
  return cadence === 'none' ? 'One-off' : cadence
}
