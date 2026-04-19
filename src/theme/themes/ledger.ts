import {
  createIconSvg,
  createThemedSvgAsset,
} from '../svg'
import type { AppTheme } from '../types'
import chooseHeroSvg from '../../assets/undraw_choose_5kz4.svg?raw'
import emptyStreetSvg from '../../assets/undraw_empty-street_3ogh.svg?raw'
import profileAvatarSvg from '../../assets/undraw_friendly-guy-avatar_dqp5.svg?raw'

export const ledgerTheme: AppTheme = {
  id: 'ledger',
  styles: String.raw`
    @font-face {
      font-family: 'Geist';
      src: url('/fonts/geist/Geist-Regular.woff2') format('woff2');
      font-style: normal;
      font-weight: 400;
      font-display: swap;
    }

    @font-face {
      font-family: 'Geist';
      src: url('/fonts/geist/Geist-Medium.woff2') format('woff2');
      font-style: normal;
      font-weight: 500;
      font-display: swap;
    }

    @font-face {
      font-family: 'Geist';
      src: url('/fonts/geist/Geist-SemiBold.woff2') format('woff2');
      font-style: normal;
      font-weight: 600;
      font-display: swap;
    }

    @font-face {
      font-family: 'Geist';
      src: url('/fonts/geist/Geist-Bold.woff2') format('woff2');
      font-style: normal;
      font-weight: 700;
      font-display: swap;
    }

    html[data-theme='ledger'] {
      font-size: 14.75px;
    }

    html[data-theme='ledger'] body {
      letter-spacing: 0.002em;
    }

    html[data-theme='ledger'] [data-slot='app-shell-container'] {
      width: min(90rem, calc(100vw - 0.8rem));
      padding: 0.7rem 0 1rem;
    }

    html[data-theme='ledger'] [data-slot='app-shell-header'] {
      grid-template-columns: minmax(0, 1fr) minmax(10.5rem, 11.5rem);
      gap: 0.6rem;
      align-items: stretch;
    }

    html[data-theme='ledger'] [data-slot='app-shell-masthead'] {
      gap: 0.55rem;
      padding: 0.8rem 0.9rem;
      border-radius: var(--theme-radius-md);
      border-color: color-mix(in srgb, var(--theme-semantic-border-subtle) 92%, transparent);
      background: var(--theme-shell-panel-background);
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='app-shell-identity'] {
      padding-bottom: 0.5rem;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 82%, transparent);
    }

    html[data-theme='ledger'] [data-slot='app-shell-title'] {
      font-size: clamp(1.28rem, 2vw, 1.58rem);
      line-height: 1.05;
      letter-spacing: -0.03em;
      font-weight: 700;
    }

    html[data-theme='ledger'] [data-slot='app-shell-nav'] {
      gap: 0.32rem;
    }

    html[data-theme='ledger'] [data-slot='app-shell-nav-link'] {
      padding: 0.46rem 0.7rem;
      border-radius: 5px;
      border-color: transparent;
      background: var(--theme-semantic-surface);
      font-size: 0.86rem;
      font-weight: 600;
    }

    html[data-theme='ledger'] [data-slot='app-shell-nav-link']:hover {
      border-color: color-mix(in srgb, var(--theme-semantic-accent) 20%, var(--theme-semantic-border-subtle));
      background: color-mix(in srgb, var(--theme-semantic-accent) 6%, var(--theme-shell-panel-background));
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='app-shell-nav-link'][aria-current='page'] {
      border-color: color-mix(in srgb, var(--theme-semantic-accent) 28%, var(--theme-semantic-border-subtle));
      background: color-mix(in srgb, var(--theme-semantic-accent) 10%, var(--theme-shell-panel-background));
      color: var(--theme-semantic-text-primary);
    }

    html[data-theme='ledger'] [data-slot='app-shell-art'] {
      min-height: 7rem;
      padding: 0.35rem;
      border-radius: var(--theme-radius-md);
      border-color: color-mix(in srgb, var(--theme-semantic-border-subtle) 92%, transparent);
      box-shadow: none;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 56%),
        repeating-linear-gradient(
          0deg,
          rgba(255, 255, 255, 0.028) 0,
          rgba(255, 255, 255, 0.028) 1px,
          transparent 1px,
          transparent 1.35rem
        ),
        #141615;
    }

    html[data-theme='ledger'] [data-slot='app-shell-content'] {
      margin-top: 0.7rem;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      overflow: visible;
    }

    html[data-theme='ledger'] [data-slot='page'],
    html[data-theme='ledger'] [data-slot='page-stack'],
    html[data-theme='ledger'] [data-slot='stack-list'],
    html[data-theme='ledger'] [data-slot='history-list'],
    html[data-theme='ledger'] [data-slot='category-list'] {
      gap: 0.85rem;
    }

    html[data-theme='ledger'] [data-slot='page-columns'],
    html[data-theme='ledger'] [data-slot='page-feature-grid'] {
      gap: 1.15rem;
      grid-template-columns: minmax(0, 1.95fr) minmax(15.5rem, 18rem);
    }

    html[data-theme='ledger'] [data-slot='tabs-list'] {
      gap: 0.8rem;
      border-bottom-color: color-mix(in srgb, var(--theme-semantic-border-subtle) 75%, transparent);
    }

    html[data-theme='ledger'] [data-slot='tabs-trigger'] {
      font-size: 0.84rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      padding-bottom: 0.46rem;
    }

    html[data-theme='ledger'] [data-slot='card'] {
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='card-body'] {
      padding: 0;
    }

    html[data-theme='ledger'] [data-slot='section-panel'] {
      gap: 0.72rem;
      padding: 0.1rem 0 0.2rem;
    }

    html[data-theme='ledger'] [data-slot='section-title'] {
      align-items: center;
      gap: 0.5rem 0.7rem;
      flex-wrap: wrap;
    }

    html[data-theme='ledger'] [data-slot='section-heading'] {
      font-size: 1.03rem;
      font-weight: 700;
      letter-spacing: -0.015em;
    }

    html[data-theme='ledger'] [data-slot='section-heading'] svg,
    html[data-theme='ledger'] [data-slot='section-title'] svg {
      color: color-mix(in srgb, var(--theme-semantic-warning) 74%, var(--theme-semantic-text-primary));
    }

    html[data-theme='ledger'] [data-slot='subheading'],
    html[data-theme='ledger'] [data-slot='muted-text'] {
      color: #938f85;
    }

    html[data-theme='ledger'] [data-slot='section-actions'],
    html[data-theme='ledger'] [data-slot='action-group'],
    html[data-theme='ledger'] [data-slot='badge-row'] {
      gap: 0.4rem;
      row-gap: 0.35rem;
    }

    html[data-theme='ledger'] [data-slot='panel-tight'] {
      gap: 0.38rem;
      padding-top: 0.5rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 74%, transparent);
    }

    html[data-theme='ledger'] [data-slot='stats-grid'] {
      display: grid;
      gap: 0.25rem 1rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      padding-top: 0.25rem;
    }

    html[data-theme='ledger'] [data-slot='stat'] {
      min-width: 0;
      padding: 0.32rem 0;
      border: 0;
      border-radius: 0;
      background: transparent;
    }

    html[data-theme='ledger'] [data-slot='stat-value'] {
      font-size: 1.08rem;
      line-height: 1;
      font-weight: 700;
    }

    html[data-theme='ledger'] [data-slot='stat-label'] {
      font-size: 0.7rem;
      line-height: 1.15;
    }

    html[data-theme='ledger'] [data-slot='button'] {
      border-radius: 5px;
      font-size: 0.94rem;
      font-weight: 600;
      padding: 0.5rem 0.76rem;
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='button'][data-size='sm'] {
      padding: 0.36rem 0.6rem;
      font-size: 0.84rem;
    }

    html[data-theme='ledger'] [data-slot='badge'] {
      border-radius: 4px;
      padding: 0.16rem 0.42rem;
      font-size: 0.73rem;
      background: color-mix(in srgb, var(--theme-semantic-accent) 11%, transparent);
      color: var(--theme-semantic-text-secondary);
    }

    html[data-theme='ledger'] [data-slot='badge'][data-tone='default'] {
      background: color-mix(in srgb, var(--theme-semantic-warning) 14%, transparent);
      color: color-mix(in srgb, var(--theme-semantic-warning) 70%, var(--theme-semantic-text-primary));
      border-color: color-mix(in srgb, var(--theme-semantic-warning) 18%, var(--theme-semantic-border-subtle));
    }

    html[data-theme='ledger'] [data-slot='badge'][data-tone='slate'],
    html[data-theme='ledger'] [data-slot='badge'][data-tone='mist'] {
      background: color-mix(in srgb, #8f988e 16%, transparent);
      color: #b8c0b6;
      border-color: color-mix(in srgb, #8f988e 24%, var(--theme-semantic-border-subtle));
    }

    html[data-theme='ledger'] [data-slot='badge'][data-tone='sage'] {
      background: color-mix(in srgb, #87977a 18%, transparent);
      color: #c0ccb4;
      border-color: color-mix(in srgb, #87977a 24%, var(--theme-semantic-border-subtle));
    }

    html[data-theme='ledger'] [data-slot='badge'][data-tone='brass'] {
      background: color-mix(in srgb, #b28752 18%, transparent);
      color: #dfc193;
      border-color: color-mix(in srgb, #b28752 28%, var(--theme-semantic-border-subtle));
    }

    html[data-theme='ledger'] [data-slot='badge'][data-tone='blush'] {
      background: color-mix(in srgb, #bc7d6a 18%, transparent);
      color: #e0b1a4;
      border-color: color-mix(in srgb, #bc7d6a 26%, var(--theme-semantic-border-subtle));
    }

    html[data-theme='ledger'] [data-slot='badge'][data-tone='plum'] {
      background: color-mix(in srgb, #8a7a95 18%, transparent);
      color: #d0c2d9;
      border-color: color-mix(in srgb, #8a7a95 26%, var(--theme-semantic-border-subtle));
    }

    html[data-theme='ledger'] [data-slot='field-label'] {
      font-size: 0.72rem;
      font-weight: 600;
    }

    html[data-theme='ledger'] [data-slot='input'],
    html[data-theme='ledger'] [data-slot='textarea'],
    html[data-theme='ledger'] [data-slot='select-trigger'] {
      padding: 0.56rem 0.66rem;
      background: #101111;
    }

    html[data-theme='ledger'] [data-slot='checkbox'] {
      inline-size: 1rem;
      block-size: 1rem;
      border-radius: 0.18rem;
    }

    html[data-theme='ledger'] [data-slot='progress-rail'] {
      block-size: 0.38rem;
      border-radius: 999px;
    }

    html[data-theme='ledger'] [data-slot='progress-fill'] {
      border-radius: inherit;
    }

    html[data-theme='ledger'] [data-slot='profile-avatar'] {
      inline-size: 1.95rem;
      block-size: 1.95rem;
      border-radius: 5px;
      padding: 0.06rem;
      background: color-mix(in srgb, var(--theme-semantic-surface) 82%, transparent);
    }

    html[data-theme='ledger'] [data-slot='task-card'] {
      position: relative;
      isolation: isolate;
      gap: 0.45rem;
      margin-inline: -0.5rem;
      padding: 0.82rem 0.62rem 0.72rem 0.56rem;
      border: 0;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 76%, transparent);
      border-radius: 6px;
      background: transparent;
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='task-card']:first-child {
      padding-top: 0.52rem;
      border-top: 0;
    }

    html[data-theme='ledger'] [data-slot='task-card']::before {
      content: '';
      position: absolute;
      inset: 0.16rem 0.06rem 0.1rem 0.04rem;
      border-radius: 6px;
      background: transparent;
      z-index: -1;
      transition: background var(--theme-motion-fast);
      pointer-events: none;
    }

    html[data-theme='ledger'] [data-slot='task-card']:first-child::before {
      inset-block-start: 0.14rem;
    }

    html[data-theme='ledger'] [data-slot='task-card']:hover {
      background: transparent;
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='task-card']:hover::before {
      inset-block-start: 0.12rem;
      inset-inline-end: 0.12rem;
      background: color-mix(in srgb, var(--theme-semantic-accent) 6%, transparent);
    }

    html[data-theme='ledger'] [data-slot='task-card'][data-drag-active='true'] {
      background: transparent;
    }

    html[data-theme='ledger'] [data-slot='task-card'][data-drag-active='true']::before {
      inset-block-start: 0.12rem;
      inset-inline-end: 0.12rem;
      background: color-mix(in srgb, var(--theme-semantic-accent) 6%, transparent);
    }

    html[data-theme='ledger'] [data-slot='task-card'][data-completed='true'] {
      background: transparent;
      border-radius: 6px;
      margin-inline: 0;
      padding: 0.78rem 0.9rem 0.72rem;
    }

    html[data-theme='ledger'] [data-slot='task-card'][data-completed='true']::before {
      inset: 0.06rem;
      background: color-mix(in srgb, var(--theme-semantic-success) 8%, transparent);
    }

    html[data-theme='ledger'] [data-slot='task-row'] {
      gap: 0.45rem 0.8rem;
      flex-wrap: wrap;
    }

    html[data-theme='ledger'] [data-slot='task-title'] {
      font-size: 0.95rem;
      font-weight: 500;
    }

    html[data-theme='ledger'] [data-slot='task-notes'] {
      font-size: 0.8rem;
      line-height: 1.35;
    }

    html[data-theme='ledger'] [data-slot='task-meta-line'] {
      color: var(--theme-semantic-text-secondary);
      font-size: 0.78rem;
    }

    html[data-theme='ledger'] [data-slot='task-tag-list'],
    html[data-theme='ledger'] [data-slot='task-badges'] {
      gap: 0.32rem;
      row-gap: 0.32rem;
    }

    html[data-theme='ledger'] [data-slot='task-subtasks'] {
      gap: 0.5rem;
    }

    html[data-theme='ledger'] [data-slot='task-footer'] {
      gap: 0.4rem 0.8rem;
    }

    html[data-theme='ledger'] [data-slot='reward-card'],
    html[data-theme='ledger'] [data-slot='category-item'] {
      gap: 0.5rem;
      margin-inline: -0.25rem;
      border: 0;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 76%, transparent);
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      padding: 0.68rem 0.25rem 0;
    }

    html[data-theme='ledger'] [data-slot='reward-card']:first-child,
    html[data-theme='ledger'] [data-slot='category-item']:first-child {
      border-top: 0;
      padding-top: 0;
    }

    html[data-theme='ledger'] [data-slot='theme-preview-card'] {
      padding: 0.6rem;
      border: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 88%, transparent);
      border-radius: 6px;
      background: color-mix(in srgb, var(--theme-semantic-surface-raised) 94%, black);
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='empty-state'] {
      min-height: 11rem;
      width: 100%;
      justify-items: center;
      align-content: center;
      text-align: center;
    }

    html[data-theme='ledger'] [data-slot='empty-art'] {
      inline-size: min(100%, 16rem);
      margin-inline: auto;
    }

    html[data-theme='ledger'] [data-slot='compact-row'],
    html[data-theme='ledger'] [data-slot='history-row'] {
      margin-inline: -0.25rem;
      padding: 0.55rem 0.25rem;
    }

    html[data-theme='ledger'] [data-slot='scroll-panel'] {
      padding-right: 0.25rem;
      scrollbar-gutter: stable;
    }

    @media (max-width: 1080px) {
      html[data-theme='ledger'] [data-slot='page-columns'],
      html[data-theme='ledger'] [data-slot='page-feature-grid'] {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 860px) {
      html[data-theme='ledger'] {
        font-size: 14px;
      }

      html[data-theme='ledger'] [data-slot='app-shell-container'] {
        width: min(84rem, calc(100vw - 0.8rem));
      }

      html[data-theme='ledger'] [data-slot='app-shell-header'] {
        grid-template-columns: 1fr;
      }

      html[data-theme='ledger'] [data-slot='app-shell-art'] {
        min-height: 5.8rem;
      }
    }

    @media (max-width: 620px) {
      html[data-theme='ledger'] [data-slot='stats-grid'] {
        grid-template-columns: 1fr;
      }
    }
  `,
  meta: {
    name: 'Ledger',
    description: 'Neutral charcoal workspace with quieter sections and a workbench cadence.',
    colorScheme: 'dark',
  },
  primitives: {
    color: {
      cloud: '#0d0e0d',
      stone: '#242624',
      ink: '#ece8de',
      slate: '#928f84',
      slateStrong: '#cbc5b7',
      brass: '#b28752',
      brassSoft: '#3f2f1c',
      sage: '#7b816a',
      blush: '#bc7d6a',
    },
    font: {
      body: "'Geist', 'Helvetica Neue', sans-serif",
      display: "'Geist', 'Helvetica Neue', sans-serif",
      mono: "'IBM Plex Mono', 'SFMono-Regular', monospace",
    },
    radius: {
      sm: '6px',
      md: '8px',
      lg: '10px',
      pill: '999px',
    },
    shadow: {
      card: 'none',
      lift: '0 10px 24px rgba(0, 0, 0, 0.24)',
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
      fast: '120ms',
      normal: '180ms',
      celebratory: '240ms',
    },
  },
  semantic: {
    appBg: '#0b0c0c',
    surface: '#101111',
    surfaceRaised: '#171918',
    textPrimary: '#e7e2d8',
    textSecondary: '#958f83',
    borderSubtle: '#242723',
    accent: '#7b816a',
    accentStrong: '#b0b498',
    success: '#87977a',
    warning: '#b28752',
    danger: '#bc7d6a',
    xp: '#c1c7b6',
    coin: '#b28752',
    taskComplete: '#171b16',
  },
  components: {
    shell: {
      pageBackground:
        'linear-gradient(180deg, #131514 0%, #0b0c0c 100%)',
      panelBackground: '#111312',
    },
    taskCard: {
      background: '#171918',
      border: '#242723',
      hoverBorder: '#7b816a',
      completedBackground: '#171b16',
    },
    progressCard: {
      background: '#171918',
      xpBarFill: 'linear-gradient(90deg, #8b927a, #b0b498)',
      coinBadgeBg: 'rgba(178, 135, 82, 0.14)',
    },
    rewardCard: {
      background: '#171918',
      priceBadgeBg: 'rgba(178, 135, 82, 0.14)',
    },
    button: {
      primaryBg: '#dfdbcf',
      primaryText: '#131514',
      secondaryBg: '#181b1a',
      secondaryText: '#e7e2d8',
    },
    input: {
      background: '#101111',
      border: '#2d312c',
      focusRing: 'rgba(123, 129, 106, 0.22)',
      text: '#e7e2d8',
      placeholder: '#807a70',
    },
  },
  assets: {
    hero: createThemedSvgAsset(chooseHeroSvg, {
      '#e6e6e6': '#2b2e2a',
      '#5f7286': '#b28752',
    }),
    emptyState: createThemedSvgAsset(emptyStreetSvg, {
      '#e6e6e6': '#262825',
      '#3e556d': '#b28752',
      '#6c8876': '#8e9777',
    }),
    levelBadge: createIconSvg(
      'M32 6 46 14v16c0 12-8 22-14 28-6-6-14-16-14-28V14L32 6Zm0 12 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z',
      '#b28752',
      '#8b927a',
    ),
    profileAvatar: createThemedSvgAsset(profileAvatarSvg, {
      '#f8f6f1': '#121413',
      '#8a96a2': '#3d3428',
      '#5f7286': '#b28752',
    }),
    iconSet: {
      task: createIconSvg('M15 32l10 10 24-24', '#87977a', '#87977a'),
      coins: createIconSvg(
        'M32 12c10 0 18 4 18 8s-8 8-18 8-18-4-18-8 8-8 18-8Zm-18 16c0 4 8 8 18 8s18-4 18-8m-36 8c0 4 8 8 18 8s18-4 18-8',
        '#c79a60',
        '#7a562a',
      ),
      spark: createIconSvg(
        'M30 6 38 22l16 8-16 8-8 20-8-20L6 30l16-8 8-16Z',
        '#c8ccba',
        '#7b816a',
      ),
      chest: createIconSvg(
        'M14 24h36v24H14V24Zm6-10h24l6 10H14l6-10Zm4 18h16v10H24V32Z',
        '#8f8b81',
        '#4a4d48',
      ),
      archive: createIconSvg(
        'M12 18h40v30H12V18Zm6-8h28l6 8H12l6-8Zm6 18h16',
        '#8f8b81',
        '#4a4d48',
      ),
    },
    categoryIcons: {
      scroll: createIconSvg(
        'M18 14h18c8 0 12 6 12 12v18c0 6-4 10-10 10H24c-6 0-10-4-10-10s4-10 10-10h18',
        '#d2c0a2',
        '#7a562a',
      ),
      sun: createIconSvg(
        'M32 18a14 14 0 1 1 0 28 14 14 0 0 1 0-28Zm0-10v8m0 32v8m24-24h-8M16 32H8m41-17-6 6M21 43l-6 6m0-34 6 6m22 22 6 6',
        '#c79a60',
        '#7a562a',
      ),
      leaf: createIconSvg(
        'M48 16c-18 0-28 10-28 28 18 0 28-10 28-28ZM18 46c6-8 14-16 22-22',
        '#87977a',
        '#55644f',
      ),
      spark: createIconSvg(
        'M32 6 38 24l18 8-18 8-6 18-6-18-18-8 18-8 6-18Z',
        '#c8ccba',
        '#7b816a',
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
