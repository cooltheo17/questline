import { describe, expect, it } from 'vitest'
import { themes } from './themeRegistry'

describe('theme registry', () => {
  it('ships themes that satisfy the contract shape', () => {
    expect(themes.length).toBeGreaterThan(0)

    for (const theme of themes) {
      expect(theme.id).toBeTruthy()
      expect(theme.assets.hero).toBeTruthy()
      expect(theme.assets.emptyState).toBeTruthy()
      expect(theme.assets.profileAvatar).toBeTruthy()
      expect(theme.copy.appTitle).toBeTruthy()
      expect(theme.components.button.primaryBg).toBeTruthy()
      expect(Object.keys(theme.assets.categoryIcons).length).toBeGreaterThan(0)
    }
  })
})
