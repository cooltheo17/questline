import { foundryTheme } from './themes/foundry'
import { legendTheme } from './themes/legend'
import { patchworkTheme } from './themes/custom-theme'
import { ledgerTheme } from './themes/ledger'
import type { AppTheme } from './types'

export const defaultTheme = patchworkTheme

export const themes: AppTheme[] = [defaultTheme, ledgerTheme, legendTheme, foundryTheme]

export function getThemeById(themeId: string): AppTheme {
  return themes.find((theme) => theme.id === themeId) ?? defaultTheme
}
