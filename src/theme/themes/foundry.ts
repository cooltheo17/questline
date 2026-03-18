import { createIconSvg } from '../svg'
import type { AppTheme } from '../types'
import chooseHero from '../../assets/undraw_choose_5kz4.svg'
import emptyStreet from '../../assets/undraw_empty-street_3ogh.svg'
import profileAvatar from '../../assets/undraw_friendly-guy-avatar_dqp5.svg'

export const foundryTheme: AppTheme = {
  id: 'foundry',
  meta: {
    name: 'Foundry',
    description: 'Graphite, steel, restrained brass, and a proper dark canvas.',
    colorScheme: 'dark',
  },
  primitives: {
    color: {
      cloud: '#11161d',
      stone: '#28323d',
      ink: '#edf2f7',
      slate: '#7d95ad',
      slateStrong: '#aac0d2',
      brass: '#b99860',
      brassSoft: '#4b3a22',
      sage: '#769180',
      blush: '#a77972',
    },
    font: {
      body: "'Avenir Next', 'Segoe UI', 'Inter', system-ui, sans-serif",
      display: "'Optima', 'Segoe UI', 'Avenir Next', 'Inter', sans-serif",
      mono: "'IBM Plex Mono', 'SFMono-Regular', monospace",
    },
    radius: {
      sm: '10px',
      md: '18px',
      lg: '28px',
      pill: '999px',
    },
    shadow: {
      card: '0 22px 52px rgba(0, 0, 0, 0.34)',
      lift: '0 12px 28px rgba(0, 0, 0, 0.4)',
    },
    spacingScale: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      xxl: '2rem',
    },
    motion: {
      fast: '140ms',
      normal: '220ms',
      celebratory: '360ms',
    },
  },
  semantic: {
    appBg: '#0b1016',
    surface: '#121920',
    surfaceRaised: '#18212b',
    textPrimary: '#edf2f7',
    textSecondary: '#a7b2be',
    borderSubtle: '#2a3743',
    accent: '#7d95ad',
    accentStrong: '#aac0d2',
    success: '#769180',
    warning: '#b99860',
    danger: '#c08780',
    xp: '#7d95ad',
    coin: '#b99860',
    taskComplete: '#22302a',
  },
  components: {
    shell: {
      pageBackground:
        'radial-gradient(circle at top, rgba(132, 156, 180, 0.16), transparent 38%), linear-gradient(180deg, #121920 0%, #0b1016 100%)',
      panelBackground: 'rgba(18, 25, 32, 0.9)',
    },
    taskCard: {
      background: '#18212b',
      border: '#2a3743',
      hoverBorder: '#7d95ad',
      completedBackground: 'linear-gradient(180deg, rgba(118, 145, 128, 0.08), rgba(24, 33, 43, 0.98))',
    },
    progressCard: {
      background: 'linear-gradient(135deg, rgba(26,35,45,0.98), rgba(16,22,29,0.98))',
      xpBarFill: 'linear-gradient(90deg, #6f88a0, #a7bdd0)',
      coinBadgeBg: 'rgba(185, 152, 96, 0.16)',
    },
    rewardCard: {
      background: '#18212b',
      priceBadgeBg: 'rgba(185, 152, 96, 0.16)',
    },
    button: {
      primaryBg: '#9cb3c6',
      primaryText: '#0d141b',
      secondaryBg: '#202a35',
      secondaryText: '#edf2f7',
    },
    input: {
      background: '#121920',
      border: '#31404d',
      focusRing: 'rgba(125, 149, 173, 0.24)',
      text: '#edf2f7',
      placeholder: '#718090',
    },
  },
  assets: {
    hero: chooseHero,
    emptyState: emptyStreet,
    levelBadge: createIconSvg(
      'M32 6 46 14v16c0 12-8 22-14 28-6-6-14-16-14-28V14L32 6Zm0 12 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z',
      '#b99860',
      '#90a8bc',
    ),
    profileAvatar,
    iconSet: {
      task: createIconSvg('M15 32l10 10 24-24', '#84a58f', '#84a58f'),
      coins: createIconSvg(
        'M32 12c10 0 18 4 18 8s-8 8-18 8-18-4-18-8 8-8 18-8Zm-18 16c0 4 8 8 18 8s18-4 18-8m-36 8c0 4 8 8 18 8s18-4 18-8',
        '#d3b27a',
        '#7d6133',
      ),
      spark: createIconSvg(
        'M30 6 38 22l16 8-16 8-8 20-8-20L6 30l16-8 8-16Z',
        '#d3b27a',
        '#7d6133',
      ),
      chest: createIconSvg(
        'M14 24h36v24H14V24Zm6-10h24l6 10H14l6-10Zm4 18h16v10H24V32Z',
        '#8fa8bb',
        '#4d6173',
      ),
      archive: createIconSvg(
        'M12 18h40v30H12V18Zm6-8h28l6 8H12l6-8Zm6 18h16',
        '#7c8b99',
        '#51606f',
      ),
    },
    categoryIcons: {
      scroll: createIconSvg(
        'M18 14h18c8 0 12 6 12 12v18c0 6-4 10-10 10H24c-6 0-10-4-10-10s4-10 10-10h18',
        '#d4c3a3',
        '#7d6133',
      ),
      sun: createIconSvg(
        'M32 18a14 14 0 1 1 0 28 14 14 0 0 1 0-28Zm0-10v8m0 32v8m24-24h-8M16 32H8m41-17-6 6M21 43l-6 6m0-34 6 6m22 22 6 6',
        '#d3b27a',
        '#7d6133',
      ),
      leaf: createIconSvg(
        'M48 16c-18 0-28 10-28 28 18 0 28-10 28-28ZM18 46c6-8 14-16 22-22',
        '#7f9a88',
        '#4b6557',
      ),
      spark: createIconSvg(
        'M32 6 38 24l18 8-18 8-6 18-6-18-18-8 18-8 6-18Z',
        '#d0af78',
        '#816237',
      ),
    },
  },
  copy: {
    appTitle: 'Questline',
    xpLabel: 'XP',
    coinLabel: 'Coins',
    levelLabel: 'Level',
    completedLabel: 'Claimed today',
  },
}
