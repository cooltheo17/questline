import {
  createIconSvg,
  createThemedSvgAsset,
} from '../svg'
import type { AppTheme } from '../types'
import chooseHeroSvg from '../../assets/undraw_choose_5kz4.svg?raw'
import emptyStreetSvg from '../../assets/undraw_empty-street_3ogh.svg?raw'
import profileAvatarSvg from '../../assets/undraw_friendly-guy-avatar_dqp5.svg?raw'

export const legendTheme: AppTheme = {
  id: 'legend',
  meta: {
    name: 'Questline',
    description: 'Soft stone, steel blue, brass, and parchment.',
    colorScheme: 'light',
    legacy: true,
  },
  primitives: {
    color: {
      cloud: '#f7f4ee',
      stone: '#d6d2c8',
      ink: '#1f2933',
      slate: '#5f7286',
      slateStrong: '#3e556d',
      brass: '#b88a44',
      brassSoft: '#e5cfaa',
      sage: '#6c8876',
      blush: '#c8877d',
    },
    font: {
      body: "'Avenir Next', 'Segoe UI', 'Inter', system-ui, sans-serif",
      display: "'Iowan Old Style', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
      mono: "'IBM Plex Mono', 'SFMono-Regular', monospace",
    },
    radius: {
      sm: '10px',
      md: '18px',
      lg: '28px',
      pill: '999px',
    },
    shadow: {
      card: '0 18px 40px rgba(61, 42, 15, 0.14)',
      lift: '0 10px 20px rgba(61, 42, 15, 0.18)',
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
    appBg: '#ebe7de',
    surface: '#f8f6f1',
    surfaceRaised: '#fffdfa',
    textPrimary: '#1f2933',
    textSecondary: '#657381',
    borderSubtle: '#d8d3c8',
    accent: '#5f7286',
    accentStrong: '#3e556d',
    success: '#6c8876',
    warning: '#b88a44',
    danger: '#b36d62',
    xp: '#5f7286',
    coin: '#b88a44',
    taskComplete: '#e6efe8',
  },
  components: {
    shell: {
      pageBackground:
        'radial-gradient(circle at top, rgba(255,255,255,0.72), transparent 42%), linear-gradient(180deg, #efeae1 0%, #e5dfd4 100%)',
      panelBackground: 'rgba(255, 253, 250, 0.9)',
    },
    taskCard: {
      background: '#fffdfa',
      border: '#d8d3c8',
      hoverBorder: '#5f7286',
      completedBackground: '#edf3ee',
    },
    progressCard: {
      background: 'linear-gradient(135deg, rgba(255,255,255,0.96), rgba(234,229,222,0.96))',
      xpBarFill: 'linear-gradient(90deg, #5f7286, #8da2b6)',
      coinBadgeBg: 'rgba(184, 138, 68, 0.14)',
    },
    rewardCard: {
      background: '#fffdfa',
      priceBadgeBg: 'rgba(184, 138, 68, 0.14)',
    },
    button: {
      primaryBg: '#3e556d',
      primaryText: '#f8f6f1',
      secondaryBg: '#efebe4',
      secondaryText: '#22303d',
    },
    input: {
      background: '#fffdfa',
      border: '#d8d3c8',
      focusRing: 'rgba(95, 114, 134, 0.18)',
      text: '#1f2933',
      placeholder: '#8a96a2',
    },
  },
  assets: {
    hero: createThemedSvgAsset(chooseHeroSvg, {
      '#e6e6e6': '#d8d3c8',
    }),
    emptyState: createThemedSvgAsset(emptyStreetSvg, {
      '#e6e6e6': '#e5dfd4',
      '#3e556d': '#5f7286',
    }),
    levelBadge: createIconSvg(
      'M32 6 46 14v16c0 12-8 22-14 28-6-6-14-16-14-28V14L32 6Zm0 12 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z',
      '#b88a44',
      '#4b5e71',
    ),
    profileAvatar: createThemedSvgAsset(profileAvatarSvg, {
      '#f8f6f1': '#efeae1',
      '#8a96a2': '#d8d3c8',
    }),
    iconSet: {
      task: createIconSvg('M15 32l10 10 24-24', '#59734f', '#59734f'),
      coins: createIconSvg(
        'M32 12c10 0 18 4 18 8s-8 8-18 8-18-4-18-8 8-8 18-8Zm-18 16c0 4 8 8 18 8s18-4 18-8m-36 8c0 4 8 8 18 8s18-4 18-8',
        '#e0b766',
        '#8b5e2b',
      ),
      spark: createIconSvg(
        'M30 6 38 22l16 8-16 8-8 20-8-20L6 30l16-8 8-16Z',
        '#e0b766',
        '#8b5e2b',
      ),
      chest: createIconSvg(
        'M14 24h36v24H14V24Zm6-10h24l6 10H14l6-10Zm4 18h16v10H24V32Z',
        '#8b5e2b',
        '#59360b',
      ),
      archive: createIconSvg(
        'M12 18h40v30H12V18Zm6-8h28l6 8H12l6-8Zm6 18h16',
        '#7e684d',
        '#5a4834',
      ),
    },
    categoryIcons: {
      scroll: createIconSvg(
        'M18 14h18c8 0 12 6 12 12v18c0 6-4 10-10 10H24c-6 0-10-4-10-10s4-10 10-10h18',
        '#efe2c5',
        '#6f4513',
      ),
      sun: createIconSvg(
        'M32 18a14 14 0 1 1 0 28 14 14 0 0 1 0-28Zm0-10v8m0 32v8m24-24h-8M16 32H8m41-17-6 6M21 43l-6 6m0-34 6 6m22 22 6 6',
        '#e0b766',
        '#8b5e2b',
      ),
      leaf: createIconSvg(
        'M48 16c-18 0-28 10-28 28 18 0 28-10 28-28ZM18 46c6-8 14-16 22-22',
        '#5e7258',
        '#3f5339',
      ),
      spark: createIconSvg(
        'M32 6 38 24l18 8-18 8-6 18-6-18-18-8 18-8 6-18Z',
        '#d5af67',
        '#8b5e2b',
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
