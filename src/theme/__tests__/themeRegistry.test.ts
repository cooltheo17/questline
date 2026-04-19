import { describe, expect, it } from 'vitest'
import { defaultTheme, getThemeById, themes } from '../themeRegistry'

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

  it('uses patchwork as the default fallback theme', () => {
    expect(defaultTheme.id).toBe('patchwork')
    expect(themes[0]?.id).toBe('patchwork')
    expect(getThemeById('missing-theme').id).toBe('patchwork')
  })

  it('marks only the legacy bundled themes as legacy', () => {
    const legacyThemeIds = themes.filter((theme) => theme.meta.legacy).map((theme) => theme.id)

    expect(legacyThemeIds).toEqual(['legend', 'foundry'])
  })
})
