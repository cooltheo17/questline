export interface AppTheme {
  id: string
  meta: {
    name: string
    description: string
    colorScheme: 'light' | 'dark'
  }
  primitives: {
    color: Record<string, string>
    font: {
      body: string
      display: string
      mono: string
    }
    radius: Record<string, string>
    shadow: Record<string, string>
    spacingScale: Record<string, string>
    motion: {
      fast: string
      normal: string
      celebratory: string
    }
  }
  semantic: {
    appBg: string
    surface: string
    surfaceRaised: string
    textPrimary: string
    textSecondary: string
    borderSubtle: string
    accent: string
    accentStrong: string
    success: string
    warning: string
    danger: string
    xp: string
    coin: string
    taskComplete: string
  }
  components: {
    shell: {
      pageBackground: string
      panelBackground: string
    }
    taskCard: {
      background: string
      border: string
      hoverBorder: string
      completedBackground: string
    }
    progressCard: {
      background: string
      xpBarFill: string
      coinBadgeBg: string
    }
    rewardCard: {
      background: string
      priceBadgeBg: string
    }
    button: {
      primaryBg: string
      primaryText: string
      secondaryBg: string
      secondaryText: string
    }
    input: {
      background: string
      border: string
      focusRing: string
      text: string
      placeholder: string
    }
  }
  assets: {
    hero: string
    emptyState: string
    levelBadge: string
    profileAvatar: string
    iconSet: Record<string, string>
    categoryIcons: Record<string, string>
  }
  copy: {
    appTitle: string
    xpLabel: string
    coinLabel: string
    levelLabel: string
    completedLabel: string
  }
}
