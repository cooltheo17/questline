import { foundryTheme } from './themes/foundry'
import { legendTheme } from './themes/legend'
import { customTheme } from './themes/custom-theme'
import type { AppTheme } from './types'

export const themes: AppTheme[] = [legendTheme, foundryTheme, customTheme]

export function getThemeById(themeId: string): AppTheme {
  return themes.find((theme) => theme.id === themeId) ?? legendTheme
}
