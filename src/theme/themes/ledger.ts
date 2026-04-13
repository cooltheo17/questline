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
    html[data-theme='ledger'] [data-slot='app-shell-container'] {
      width: min(84rem, calc(100vw - 1.5rem));
      padding: 0.9rem 0 1.8rem;
    }

    html[data-theme='ledger'] [data-slot='app-shell-header'] {
      grid-template-columns: minmax(0, 1fr) minmax(11.5rem, 14rem);
      gap: 0.8rem;
      align-items: stretch;
    }

    html[data-theme='ledger'] [data-slot='app-shell-masthead'] {
      gap: 0.7rem;
      padding: 0.8rem 0.95rem 0.8rem;
      border-radius: var(--theme-radius-md);
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='app-shell-identity'] {
      padding-bottom: 0.7rem;
      border-bottom: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 86%, transparent);
    }

    html[data-theme='ledger'] [data-slot='app-shell-title'] {
      font-size: clamp(1.8rem, 3vw, 2.35rem);
      letter-spacing: -0.045em;
    }

    html[data-theme='ledger'] [data-slot='app-shell-nav'] {
      gap: 0.35rem;
    }

    html[data-theme='ledger'] [data-slot='app-shell-nav-link'] {
      padding: 0.48rem 0.68rem;
      background: transparent;
    }

    html[data-theme='ledger'] [data-slot='app-shell-nav-link']:hover {
      border-color: color-mix(in srgb, var(--theme-semantic-accent) 28%, var(--theme-semantic-border-subtle));
      background: color-mix(in srgb, var(--theme-semantic-accent) 5%, var(--theme-semantic-surface-raised));
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='app-shell-nav-link'][aria-current='page'] {
      border-color: var(--theme-button-primary-bg);
      background: var(--theme-button-primary-bg);
    }

    html[data-theme='ledger'] [data-slot='app-shell-art'] {
      padding: 0.55rem;
      border-radius: var(--theme-radius-md);
      box-shadow: none;
      background:
        linear-gradient(180deg, rgba(255, 255, 255, 0.56), rgba(255, 255, 255, 0.18)),
        repeating-linear-gradient(0deg, rgba(63, 73, 67, 0.05) 0, rgba(63, 73, 67, 0.05) 1px, transparent 1px, transparent 1.55rem),
        var(--theme-shell-panel-background);
    }

    html[data-theme='ledger'] [data-slot='app-shell-content'] {
      margin-top: 0.8rem;
      padding: 0.8rem 0.9rem 1rem;
      border: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 94%, transparent);
      border-radius: var(--theme-radius-lg);
      background: color-mix(in srgb, var(--theme-semantic-surface-raised) 96%, white);
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='page-columns'],
    html[data-theme='ledger'] [data-slot='page-feature-grid'] {
      gap: 0.8rem;
      grid-template-columns: minmax(0, 1.35fr) minmax(18rem, 0.95fr);
    }

    html[data-theme='ledger'] [data-slot='page-stack'] {
      gap: 0.8rem;
    }

    html[data-theme='ledger'] [data-slot='tabs-list'] {
      gap: 0.7rem;
    }

    html[data-theme='ledger'] [data-slot='tabs-trigger'] {
      font-weight: 600;
      font-size: 0.92rem;
      padding-bottom: 0.45rem;
    }

    html[data-theme='ledger'] [data-slot='card'] {
      border-radius: var(--theme-radius-sm);
      background: color-mix(in srgb, var(--theme-semantic-surface-raised) 96%, white);
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='card-body'] {
      padding: 0.85rem 0.95rem;
    }

    html[data-theme='ledger'] [data-slot='section-panel'] {
      gap: 0.75rem;
    }

    html[data-theme='ledger'] [data-slot='section-title'] {
      align-items: start;
      gap: 0.75rem;
    }

    html[data-theme='ledger'] [data-slot='section-heading'] {
      letter-spacing: -0.015em;
    }

    html[data-theme='ledger'] [data-slot='section-actions'],
    html[data-theme='ledger'] [data-slot='action-group'],
    html[data-theme='ledger'] [data-slot='badge-row'] {
      gap: 0.5rem;
      row-gap: 0.45rem;
    }

    html[data-theme='ledger'] [data-slot='panel-tight'] {
      gap: 0.45rem;
      padding-top: 0.65rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 88%, transparent);
    }

    html[data-theme='ledger'] [data-slot='subheading'],
    html[data-theme='ledger'] [data-slot='muted-text'] {
      color: #5d655f;
    }

    html[data-theme='ledger'] [data-slot='stats-grid'] {
      gap: 0.5rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    html[data-theme='ledger'] [data-slot='stat'] {
      padding: 0.7rem 0.75rem;
      border: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 88%, transparent);
      border-radius: var(--theme-radius-sm);
      background: #ffffff;
    }

    html[data-theme='ledger'] [data-slot='stat-value'] {
      font-size: 1.5rem;
      line-height: 1;
    }

    html[data-theme='ledger'] [data-slot='button'] {
      border-radius: var(--theme-radius-sm);
      font-weight: 650;
      padding: 0.55rem 0.8rem;
    }

    html[data-theme='ledger'] [data-slot='badge'] {
      border-radius: 4px;
      padding: 0.18rem 0.42rem;
      font-size: 0.74rem;
      background: color-mix(in srgb, var(--theme-semantic-accent) 9%, white);
      color: var(--theme-semantic-text-secondary);
    }

    html[data-theme='ledger'] [data-slot='input'],
    html[data-theme='ledger'] [data-slot='textarea'],
    html[data-theme='ledger'] [data-slot='select-trigger'] {
      padding: 0.62rem 0.75rem;
      background: #ffffff;
    }

    html[data-theme='ledger'] [data-slot='checkbox'] {
      border-radius: 0.2rem;
    }

    html[data-theme='ledger'] [data-slot='progress-rail'] {
      block-size: 0.55rem;
    }

    html[data-theme='ledger'] [data-slot='profile-avatar'] {
      inline-size: 2.8rem;
      block-size: 2.8rem;
      border-radius: var(--theme-radius-sm);
      padding: 0.12rem;
    }

    html[data-theme='ledger'] [data-slot='task-card'] {
      gap: 0.55rem;
      padding: 0.75rem 0;
      border: 0;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 88%, transparent);
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='task-card']:first-child {
      padding-top: 0;
      border-top: 0;
    }

    html[data-theme='ledger'] [data-slot='task-card']:hover {
      background: color-mix(in srgb, var(--theme-semantic-accent) 3%, transparent);
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='task-card'][data-drag-active='true'] {
      background: color-mix(in srgb, var(--theme-semantic-accent) 6%, transparent);
    }

    html[data-theme='ledger'] [data-slot='task-card'][data-completed='true'] {
      background: color-mix(in srgb, var(--theme-semantic-success) 5%, transparent);
      border-radius: var(--theme-radius-sm);
    }

    html[data-theme='ledger'] [data-slot='reward-card'],
    html[data-theme='ledger'] [data-slot='category-item'],
    html[data-theme='ledger'] [data-slot='theme-preview-card'] {
      border-radius: var(--theme-radius-sm);
      box-shadow: none;
    }

    html[data-theme='ledger'] [data-slot='reward-card'] {
      gap: 0.65rem;
      border: 0;
      background: transparent;
      padding: 0;
    }

    html[data-theme='ledger'] [data-slot='category-item'] {
      border: 0;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-border-subtle) 88%, transparent);
      border-radius: 0;
      background: transparent;
      padding: 0.75rem 0;
    }

    html[data-theme='ledger'] [data-slot='category-item']:first-child {
      border-top: 0;
      padding-top: 0;
    }

    html[data-theme='ledger'] [data-slot='theme-preview-card'] {
      padding: 0.65rem;
    }

    html[data-theme='ledger'] [data-slot='compact-row'],
    html[data-theme='ledger'] [data-slot='history-row'] {
      padding: 0.65rem 0;
    }

    html[data-theme='ledger'] [data-slot='scroll-panel'] {
      padding-right: 0.4rem;
      scrollbar-gutter: stable;
    }

    @media (max-width: 1020px) {
      html[data-theme='ledger'] [data-slot='page-columns'],
      html[data-theme='ledger'] [data-slot='page-feature-grid'] {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 860px) {
      html[data-theme='ledger'] [data-slot='app-shell-container'] {
        width: min(86rem, calc(100vw - 1rem));
      }

      html[data-theme='ledger'] [data-slot='app-shell-header'] {
        grid-template-columns: 1fr;
      }

      html[data-theme='ledger'] [data-slot='app-shell-content'] {
        padding-inline: 0.85rem;
      }
    }
  `,
  meta: {
    name: 'Ledger',
    description: 'Structured neutrals, muted olive, and a cleaner office-floor cadence.',
    colorScheme: 'light',
  },
  primitives: {
    color: {
      cloud: '#eef0ea',
      stone: '#c8cdc3',
      ink: '#1d2320',
      slate: '#6e7871',
      slateStrong: '#3f4943',
      brass: '#8e6f43',
      brassSoft: '#ddd0bc',
      sage: '#5e7564',
      blush: '#a15e55',
    },
    font: {
      body: "'IBM Plex Sans', 'Helvetica Neue', 'Nimbus Sans', sans-serif",
      display: "'IBM Plex Sans', 'Helvetica Neue', 'Nimbus Sans', sans-serif",
      mono: "'IBM Plex Mono', 'SFMono-Regular', monospace",
    },
    radius: {
      sm: '6px',
      md: '8px',
      lg: '10px',
      pill: '999px',
    },
    shadow: {
      card: '0 1px 2px rgba(24, 31, 27, 0.05)',
      lift: '0 2px 6px rgba(24, 31, 27, 0.07)',
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
      celebratory: '280ms',
    },
  },
  semantic: {
    appBg: '#e7eae2',
    surface: '#f3f5ef',
    surfaceRaised: '#fcfcf8',
    textPrimary: '#1d2320',
    textSecondary: '#5d655f',
    borderSubtle: '#cdd2c8',
    accent: '#5e7564',
    accentStrong: '#3f5146',
    success: '#5b765d',
    warning: '#8e6f43',
    danger: '#9c5951',
    xp: '#3f5146',
    coin: '#8e6f43',
    taskComplete: '#e6eee4',
  },
  components: {
    shell: {
      pageBackground:
        'linear-gradient(90deg, rgba(63, 73, 67, 0.05) 0, rgba(63, 73, 67, 0.05) 1px, transparent 1px, transparent 6rem), linear-gradient(180deg, #eef1eb 0%, #e4e7df 100%)',
      panelBackground: 'rgba(252, 252, 248, 0.94)',
    },
    taskCard: {
      background: '#fcfcf8',
      border: '#cdd2c8',
      hoverBorder: '#5e7564',
      completedBackground: '#edf3eb',
    },
    progressCard: {
      background: '#fcfcf8',
      xpBarFill: '#24342c',
      coinBadgeBg: 'rgba(142, 111, 67, 0.12)',
    },
    rewardCard: {
      background: '#fcfcf8',
      priceBadgeBg: 'rgba(142, 111, 67, 0.12)',
    },
    button: {
      primaryBg: '#24342c',
      primaryText: '#fcfcf8',
      secondaryBg: '#ecefe7',
      secondaryText: '#1d2320',
    },
    input: {
      background: '#ffffff',
      border: '#cdd2c8',
      focusRing: 'rgba(94, 117, 100, 0.14)',
      text: '#1d2320',
      placeholder: '#7b847d',
    },
  },
  assets: {
    hero: createThemedSvgAsset(chooseHeroSvg, {
      '#e6e6e6': '#cdd2c8',
      '#5f7286': '#5e7564',
    }),
    emptyState: createThemedSvgAsset(emptyStreetSvg, {
      '#e6e6e6': '#d9ddd5',
      '#3e556d': '#6e7871',
      '#6c8876': '#5e7564',
    }),
    levelBadge: createIconSvg(
      'M32 6 46 14v16c0 12-8 22-14 28-6-6-14-16-14-28V14L32 6Zm0 12 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z',
      '#8e6f43',
      '#3f5146',
    ),
    profileAvatar: createThemedSvgAsset(profileAvatarSvg, {
      '#f8f6f1': '#eef1eb',
      '#8a96a2': '#cdd2c8',
      '#5f7286': '#6e7871',
    }),
    iconSet: {
      task: createIconSvg('M15 32l10 10 24-24', '#5b765d', '#5b765d'),
      coins: createIconSvg(
        'M32 12c10 0 18 4 18 8s-8 8-18 8-18-4-18-8 8-8 18-8Zm-18 16c0 4 8 8 18 8s18-4 18-8m-36 8c0 4 8 8 18 8s18-4 18-8',
        '#a68758',
        '#70552f',
      ),
      spark: createIconSvg(
        'M30 6 38 22l16 8-16 8-8 20-8-20L6 30l16-8 8-16Z',
        '#5e7564',
        '#3f5146',
      ),
      chest: createIconSvg(
        'M14 24h36v24H14V24Zm6-10h24l6 10H14l6-10Zm4 18h16v10H24V32Z',
        '#6e7871',
        '#414945',
      ),
      archive: createIconSvg(
        'M12 18h40v30H12V18Zm6-8h28l6 8H12l6-8Zm6 18h16',
        '#6e7871',
        '#414945',
      ),
    },
    categoryIcons: {
      scroll: createIconSvg(
        'M18 14h18c8 0 12 6 12 12v18c0 6-4 10-10 10H24c-6 0-10-4-10-10s4-10 10-10h18',
        '#ebe2d3',
        '#70552f',
      ),
      sun: createIconSvg(
        'M32 18a14 14 0 1 1 0 28 14 14 0 0 1 0-28Zm0-10v8m0 32v8m24-24h-8M16 32H8m41-17-6 6M21 43l-6 6m0-34 6 6m22 22 6 6',
        '#a68758',
        '#70552f',
      ),
      leaf: createIconSvg(
        'M48 16c-18 0-28 10-28 28 18 0 28-10 28-28ZM18 46c6-8 14-16 22-22',
        '#5b765d',
        '#44604a',
      ),
      spark: createIconSvg(
        'M32 6 38 24l18 8-18 8-6 18-6-18-18-8 18-8 6-18Z',
        '#6e7871',
        '#3f5146',
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
