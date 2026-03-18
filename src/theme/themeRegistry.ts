import { legendTheme } from './themes/legend'
import type { AppTheme } from './types'

export const themes: AppTheme[] = [legendTheme]

export function getThemeById(themeId: string): AppTheme {
  return themes.find((theme) => theme.id === themeId) ?? legendTheme
}
