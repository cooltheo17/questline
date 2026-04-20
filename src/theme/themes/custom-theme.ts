import {
  createIconSvg,
  createThemedSvgAsset,
} from '../svg'
import type { AppTheme } from '../types'
import chooseHeroSvg from '../../assets/undraw_choose_5kz4.svg?raw'
import emptyStreetSvg from '../../assets/undraw_empty-street_3ogh.svg?raw'
import profileAvatarSvg from '../../assets/undraw_friendly-guy-avatar_dqp5.svg?raw'

export const patchworkTheme: AppTheme = {
  id: 'patchwork',
  styles: String.raw`
    html[data-theme='patchwork'] [data-slot='app-shell-container'] {
      width: min(92rem, calc(100vw - 2rem));
      padding: 1.25rem 0 2.5rem;
    }

    html[data-theme='patchwork'] [data-slot='app-shell-header'] {
      grid-template-columns: minmax(0, 1fr) minmax(12rem, 15rem);
      gap: 1.25rem;
      align-items: end;
      padding-bottom: 1.15rem;
      border-bottom: 0;
    }

    html[data-theme='patchwork'] [data-slot='app-shell-masthead'] {
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      gap: 0.75rem;
    }

    html[data-theme='patchwork'] [data-slot='app-shell-identity'] {
      padding-left: 1.5rem;
    }

    html[data-theme='patchwork'] [data-slot='app-shell-title'] {
      font-size: clamp(2rem, 3vw, 2.8rem);
      letter-spacing: -0.05em;
    }

    html[data-theme='patchwork'] [data-slot='app-shell-nav'] {
      gap: 1.15rem;
      padding-left: 1.5rem;
    }

    html[data-theme='patchwork'] [data-slot='app-shell-nav-link'] {
      padding: 0.5rem 0 0.45rem;
      border: 0;
      border-bottom: 2px solid transparent;
      border-radius: 0;
      background: transparent;
    }

    html[data-theme='patchwork'] [data-slot='app-shell-nav-link']:hover {
      box-shadow: none;
      border-color: color-mix(in srgb, var(--theme-semantic-accent) 72%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='app-shell-nav-link'][aria-current='page'] {
      background: transparent;
      color: var(--theme-semantic-text-primary);
      border-color: var(--theme-semantic-accent);
    }

    html[data-theme='patchwork'] [data-slot='app-shell-art'] {
      min-height: 9rem;
      align-self: stretch;
      border-radius: var(--theme-radius-sm);
      border: 0;
      background: transparent;
      box-shadow: none;
      padding: 0;
    }

    html[data-theme='patchwork'] [data-slot='empty-art'] {
      filter: sepia(0.12) saturate(0.9) hue-rotate(-4deg) contrast(0.98);
    }

    html[data-theme='patchwork'] [data-slot='app-shell-content'] {
      margin-top: 1rem;
      padding: 0.15rem 1.5rem 1.5rem;
      border: 1px solid color-mix(in srgb, var(--theme-semantic-text-primary) 18%, transparent);
      border-radius: var(--theme-radius-lg);
      background: var(--theme-semantic-surface-raised);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
    }

    html[data-theme='patchwork'] [data-slot='page'],
    html[data-theme='patchwork'] [data-slot='history-list'],
    html[data-theme='patchwork'] [data-slot='compact-list'],
    html[data-theme='patchwork'] [data-slot='stack-list'] {
      gap: 0;
    }

    html[data-theme='patchwork'] [data-slot='page-stack'] {
      gap: 1rem;
    }

    html[data-theme='patchwork'] [data-slot='page-columns'],
    html[data-theme='patchwork'] [data-slot='page-feature-grid'] {
      gap: 1.5rem;
      grid-template-columns: minmax(0, 1.6fr) minmax(17rem, 0.95fr);
    }

    html[data-theme='patchwork'] [data-slot='tabs-list'] {
      gap: 0.95rem;
      border-bottom: 0;
      padding-bottom: 0.2rem;
    }

    html[data-theme='patchwork'] [data-slot='card'] {
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
    }

    html[data-theme='patchwork'] [data-slot='card-body'] {
      padding: 0.35rem 0;
    }

    html[data-theme='patchwork'] [data-slot='section-panel'] {
      gap: 1rem;
      padding: 1.15rem 0;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-text-primary) 20%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='section-panel']:first-child {
      border-top: 0;
      padding-top: 0.2rem;
    }

    html[data-theme='patchwork'] [data-slot='section-title'] {
      align-items: flex-start;
      padding-bottom: 0.1rem;
    }

    html[data-theme='patchwork'] [data-slot='section-heading'] {
      font-size: 1.22rem;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    html[data-theme='patchwork'] [data-slot='muted-text'],
    html[data-theme='patchwork'] [data-slot='subheading'] {
      color: #5c4638;
    }

    html[data-theme='patchwork'] [data-slot='subheading'] {
      font-size: 0.88rem;
    }

    html[data-theme='patchwork'] [data-slot='stats-grid'] {
      gap: 0.15rem 1.5rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    html[data-theme='patchwork'] [data-slot='action-group'] {
      gap: 0.9rem;
      row-gap: 0.9rem;
      align-items: center;
    }

    html[data-theme='patchwork'] [data-slot='badge-row'] {
      gap: 0.5rem;
      row-gap: 0.5rem;
      align-items: center;
    }

    html[data-theme='patchwork'] [data-slot='section-actions'] {
      gap: 0.85rem;
      row-gap: 0.7rem;
      align-items: center;
    }

    html[data-theme='patchwork'] [data-slot='stat'] {
      padding: 1rem 0 0.85rem;
      border-radius: 0;
      background: transparent;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-text-primary) 20%, transparent);
      border-right: 0;
      border-bottom: 0;
      border-left: 0;
    }

    html[data-theme='patchwork'] [data-slot='stat-value'] {
      font-size: 1.6rem;
      line-height: 1;
    }

    html[data-theme='patchwork'] [data-slot='profile-avatar'] {
      inline-size: 3rem;
      block-size: 3rem;
      border-radius: var(--theme-radius-sm);
      border-color: color-mix(in srgb, var(--theme-semantic-text-primary) 16%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='button'] {
      border-radius: var(--theme-radius-sm);
      font-weight: 700;
      line-height: 1;
      padding: 0.62rem 1rem;
    }

    html[data-theme='patchwork'] [data-slot='button'][data-variant='primary'] {
      background: var(--theme-button-primary-bg);
      border-color: var(--theme-button-primary-bg);
      color: var(--theme-button-primary-text);
      box-shadow: 0 1px 0 rgba(255, 255, 255, 0.12) inset;
    }

    html[data-theme='patchwork'] [data-slot='button'][data-variant='secondary'] {
      background: var(--theme-semantic-surface-raised);
      border-color: color-mix(in srgb, var(--theme-semantic-text-primary) 22%, transparent);
      color: var(--theme-semantic-text-primary);
    }

    html[data-theme='patchwork'] [data-slot='button'][data-variant='secondary']:hover {
      border-color: color-mix(in srgb, var(--theme-semantic-accent) 42%, transparent);
      background: color-mix(in srgb, var(--theme-semantic-accent) 8%, var(--theme-semantic-surface-raised));
    }

    html[data-theme='patchwork'] [data-slot='button'][data-size='sm'] {
      padding: 0.44rem 0.7rem;
      font-size: 0.92rem;
    }

    html[data-theme='patchwork'] [data-slot='badge'] {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      background: var(--theme-semantic-surface-raised);
      border-color: color-mix(in srgb, var(--theme-semantic-text-primary) 16%, transparent);
      color: #5d483a;
      font-size: 0.72rem;
      font-weight: 600;
    }

    html[data-theme='patchwork'] [data-slot='badge'] > * {
      color: inherit;
      text-decoration: none;
      line-height: 1;
    }

    html[data-theme='patchwork'] [data-slot='badge'] svg {
      display: block;
      flex: none;
    }

    html[data-theme='patchwork'] [data-slot='badge'][data-tone='slate'] {
      background: color-mix(in srgb, var(--theme-color-slate) 16%, var(--theme-semantic-surface-raised));
      border-color: color-mix(in srgb, var(--theme-color-slateStrong) 24%, transparent);
      color: color-mix(in srgb, var(--theme-color-slateStrong) 88%, var(--theme-semantic-text-primary));
    }

    html[data-theme='patchwork'] [data-slot='badge'][data-tone='brass'] {
      background: color-mix(in srgb, var(--theme-color-brass) 18%, var(--theme-semantic-surface-raised));
      border-color: color-mix(in srgb, var(--theme-color-brass) 28%, transparent);
      color: color-mix(in srgb, var(--theme-color-brass) 84%, var(--theme-semantic-text-primary));
    }

    html[data-theme='patchwork'] [data-slot='badge'][data-tone='sage'] {
      background: color-mix(in srgb, var(--theme-color-sage) 18%, var(--theme-semantic-surface-raised));
      border-color: color-mix(in srgb, var(--theme-color-sage) 28%, transparent);
      color: color-mix(in srgb, var(--theme-color-sage) 84%, var(--theme-semantic-text-primary));
    }

    html[data-theme='patchwork'] [data-slot='badge'][data-tone='blush'] {
      background: color-mix(in srgb, var(--theme-color-blush) 18%, var(--theme-semantic-surface-raised));
      border-color: color-mix(in srgb, var(--theme-color-blush) 28%, transparent);
      color: color-mix(in srgb, var(--theme-color-blush) 88%, var(--theme-semantic-text-primary));
    }

    html[data-theme='patchwork'] [data-slot='badge'][data-tone='plum'] {
      background: rgba(120, 98, 142, 0.12);
      border-color: rgba(120, 98, 142, 0.22);
      color: #6d587e;
    }

    html[data-theme='patchwork'] [data-slot='badge'][data-tone='mist'] {
      background: rgba(134, 145, 154, 0.14);
      border-color: rgba(134, 145, 154, 0.22);
      color: #5c6771;
    }

    html[data-theme='patchwork'] [data-slot='field-label'] {
      color: #4f3d31;
    }

    html[data-theme='patchwork'] [data-slot='input'],
    html[data-theme='patchwork'] [data-slot='textarea'],
    html[data-theme='patchwork'] [data-slot='select-trigger'] {
      border-color: color-mix(in srgb, var(--theme-semantic-text-primary) 18%, transparent);
      background: rgba(255, 252, 246, 0.92);
      color: var(--theme-semantic-text-primary);
    }

    html[data-theme='patchwork'] [data-slot='progress-rail'] {
      background: color-mix(in srgb, var(--theme-semantic-text-primary) 10%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='progress-fill'] {
      border-radius: var(--theme-radius-sm);
    }

    html[data-theme='patchwork'] [data-slot='checkbox-row'] {
      gap: 0.55rem;
    }

    html[data-theme='patchwork'] [data-slot='checkbox'] {
      border-radius: 0.18rem;
      border-color: color-mix(in srgb, var(--theme-semantic-text-primary) 20%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='quick-add-details'] {
      padding-top: 1rem;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-text-primary) 20%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='quick-add-tags'] {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    html[data-theme='patchwork'] [data-slot='compact-row'],
    html[data-theme='patchwork'] [data-slot='history-row'] {
      padding: 0.95rem 0.7rem 0.95rem 0;
      border-top-color: color-mix(in srgb, var(--theme-semantic-text-primary) 18%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='compact-row'] {
      align-items: start;
      border-top-style: solid;
      border-top-width: 1px;
    }

    html[data-theme='patchwork'] [data-slot='task-card'] {
      gap: 0.85rem;
      background: transparent;
      border: 0;
      border-top: 1px solid color-mix(in srgb, var(--theme-semantic-text-primary) 20%, transparent);
      border-radius: 0;
      padding: 1rem 0.8rem 1rem 0.95rem;
      box-shadow: none;
      position: relative;
    }

    html[data-theme='patchwork'] [data-slot='task-card']::before {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 0.32rem;
      background: color-mix(in srgb, var(--theme-semantic-accent) 85%, transparent);
      border-radius: 999px;
      opacity: 0.92;
    }

    html[data-theme='patchwork'] [data-slot='task-card']:hover {
      background: color-mix(in srgb, var(--theme-semantic-accent) 4%, transparent);
      border-top-color: color-mix(in srgb, var(--theme-semantic-accent) 34%, transparent);
      box-shadow: none;
    }

    html[data-theme='patchwork'] [data-slot='task-card'][data-drag-active='true'] {
      background: color-mix(in srgb, var(--theme-semantic-accent) 7%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='task-card'][data-completed='true'] {
      background: color-mix(in srgb, var(--theme-semantic-success) 7%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='task-card'][data-completed='true']::before {
      background: color-mix(in srgb, var(--theme-semantic-success) 82%, transparent);
    }

    html[data-theme='patchwork'] [data-slot='task-tag-list'] {
      gap: 0.45rem;
    }

    html[data-theme='patchwork'] [data-slot='task-title'] {
      font-size: 1rem;
      font-weight: 650;
      letter-spacing: -0.01em;
    }

    html[data-theme='patchwork'] [data-slot='task-footer'] {
      align-items: center;
      column-gap: 1.25rem;
      row-gap: 0.75rem;
    }

    html[data-theme='patchwork'] [data-slot='task-badges'] {
      gap: 0.45rem;
    }

    html[data-theme='patchwork'] [data-slot='history-list'] {
      gap: 0.65rem;
    }

    html[data-theme='patchwork'] [data-slot='scroll-panel'] {
      padding-right: 0.65rem;
      scrollbar-gutter: stable;
    }

    html[data-theme='patchwork'] [data-slot='history-list'] [data-slot='task-card'] {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    html[data-theme='patchwork'] [data-slot='reward-card'] {
      gap: 0.95rem;
      padding: 1rem 1.15rem 1rem 1.05rem;
      border: 1px solid color-mix(in srgb, var(--theme-semantic-text-primary) 18%, transparent);
      border-radius: var(--theme-radius-md);
      background: var(--theme-semantic-surface-raised);
    }

    html[data-theme='patchwork'] [data-slot='reward-card'] [data-slot='section-title'] {
      align-items: start;
      gap: 0.9rem;
    }

    html[data-theme='patchwork'] [data-slot='reward-card'] [data-slot='muted-text'] {
      margin-top: 0.3rem;
    }

    html[data-theme='patchwork'] [data-slot='reward-card'] [data-slot='badge'] {
      background: color-mix(in srgb, var(--theme-color-brass) 14%, var(--theme-semantic-surface-raised));
      border-color: color-mix(in srgb, var(--theme-color-brass) 24%, transparent);
      color: color-mix(in srgb, var(--theme-color-brass) 90%, var(--theme-semantic-text-primary));
    }

    html[data-theme='patchwork'] [data-slot='category-list'] {
      display: grid;
      gap: 0.85rem;
    }

    html[data-theme='patchwork'] [data-slot='category-item'] {
      gap: 0.8rem;
      padding: 0.95rem 1rem;
      border: 1px solid color-mix(in srgb, var(--theme-semantic-text-primary) 18%, transparent);
      border-radius: var(--theme-radius-md);
      background: var(--theme-semantic-surface-raised);
    }

    html[data-theme='patchwork'] [data-slot='category-item'] [data-slot='action-group'] {
      justify-content: flex-end;
    }

    html[data-theme='patchwork'] [data-slot='theme-preview-card'] {
      border: 1px solid color-mix(in srgb, var(--theme-semantic-text-primary) 14%, transparent);
      border-radius: var(--theme-radius-md);
      padding: 0.8rem;
      background: var(--theme-semantic-surface-raised);
    }

    @media (max-width: 1020px) {
      html[data-theme='patchwork'] [data-slot='page-columns'],
      html[data-theme='patchwork'] [data-slot='page-feature-grid'] {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 860px) {
      html[data-theme='patchwork'] [data-slot='app-shell-container'] {
        width: min(92rem, calc(100vw - 1rem));
      }

      html[data-theme='patchwork'] [data-slot='app-shell-header'] {
        gap: 0.75rem;
      }

      html[data-theme='patchwork'] [data-slot='app-shell-identity'],
      html[data-theme='patchwork'] [data-slot='app-shell-nav'] {
        padding-left: 0;
      }

      html[data-theme='patchwork'] [data-slot='app-shell-art'] {
        min-height: 8rem;
        padding-top: 0.25rem;
      }

      html[data-theme='patchwork'] [data-slot='app-shell-content'] {
        padding-inline: 0.9rem;
      }

      html[data-theme='patchwork'] [data-slot='quick-add-tags'] {
        grid-template-columns: 1fr;
      }
    }
  `,
  meta: {
    name: 'Patchwork',
    description: 'Planner paper, ink, tomato, and a workshop layout with more rhythm.',
    colorScheme: 'light',
  },
  primitives: {
    color: {
      cloud: '#ece2d4',
      stone: '#cfbda7',
      ink: '#241d18',
      slate: '#745d4b',
      slateStrong: '#463428',
      brass: '#bf8740',
      brassSoft: '#ebd4ae',
      sage: '#6e8253',
      blush: '#c75b42',
    },
    font: {
      body: "'IBM Plex Sans', 'Inter', 'Helvetica Neue', 'Nimbus Sans', sans-serif",
      display: "'Futura', 'IBM Plex Sans', 'Gill Sans', sans-serif",
      mono: "'IBM Plex Mono', 'SFMono-Regular', monospace",
    },
    radius: {
      sm: '8px',
      md: '10px',
      lg: '14px',
      pill: '999px',
    },
    shadow: {
      card: '0 2px 8px rgba(61, 44, 29, 0.08)',
      lift: '0 2px 8px rgba(61, 44, 29, 0.08)',
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
    appBg: '#ece2d4',
    surface: '#f8efe3',
    surfaceRaised: '#fff9f0',
    textPrimary: '#241d18',
    textSecondary: '#6a5547',
    borderSubtle: '#d3c0aa',
    accent: '#c75b42',
    accentStrong: '#8e4030',
    success: '#6e8253',
    warning: '#bf8740',
    danger: '#b14a45',
    xp: '#8e4030',
    coin: '#bf8740',
    taskComplete: '#ebefe0',
  },
  components: {
    shell: {
      pageBackground:
        'linear-gradient(90deg, transparent 0, transparent 4.5rem, rgba(199, 91, 66, 0.18) 4.5rem, rgba(199, 91, 66, 0.18) 4.64rem, transparent 4.64rem), repeating-linear-gradient(180deg, rgba(70, 52, 40, 0.08) 0, rgba(70, 52, 40, 0.08) 1px, transparent 1px, transparent 2.3rem), linear-gradient(180deg, #f3e8db 0%, #eadccb 100%)',
      panelBackground: '#fff9f0',
    },
    taskCard: {
      background: '#fff9f0',
      border: '#d3c0aa',
      hoverBorder: '#c75b42',
      completedBackground: '#eff2e8',
    },
    progressCard: {
      background: '#fff7ed',
      xpBarFill: '#241d18',
      coinBadgeBg: 'rgba(191, 135, 64, 0.14)',
    },
    rewardCard: {
      background: '#fff9f0',
      priceBadgeBg: 'rgba(191, 135, 64, 0.14)',
    },
    button: {
      primaryBg: '#241d18',
      primaryText: '#fff9f0',
      secondaryBg: '#f3e7d8',
      secondaryText: '#3a2e26',
    },
    input: {
      background: '#fffdf8',
      border: '#d3c0aa',
      focusRing: 'rgba(199, 91, 66, 0.16)',
      text: '#241d18',
      placeholder: '#8f7869',
    },
  },
  assets: {
    hero: createThemedSvgAsset(chooseHeroSvg, {
      '#e6e6e6': '#d3c0aa',
      '#5f7286': '#8e4030',
    }),
    emptyState: createThemedSvgAsset(emptyStreetSvg, {
      '#e6e6e6': '#d3c0aa',
      '#3e556d': '#745d4b',
      '#6c8876': '#6e8253',
    }),
    levelBadge: createIconSvg(
      'M32 6 46 14v16c0 12-8 22-14 28-6-6-14-16-14-28V14L32 6Zm0 12 4 8 9 1-7 6 2 9-8-5-8 5 2-9-7-6 9-1 4-8Z',
      '#bf8740',
      '#8e4030',
    ),
    profileAvatar: createThemedSvgAsset(profileAvatarSvg, {
      '#f8f6f1': '#f3e7d8',
      '#8a96a2': '#d3c0aa',
      '#5f7286': '#8e4030',
    }),
    iconSet: {
      task: createIconSvg('M15 32l10 10 24-24', '#6e8253', '#6e8253'),
      coins: createIconSvg(
        'M32 12c10 0 18 4 18 8s-8 8-18 8-18-4-18-8 8-8 18-8Zm-18 16c0 4 8 8 18 8s18-4 18-8m-36 8c0 4 8 8 18 8s18-4 18-8',
        '#d2a053',
        '#8a5a27',
      ),
      spark: createIconSvg(
        'M30 6 38 22l16 8-16 8-8 20-8-20L6 30l16-8 8-16Z',
        '#c75b42',
        '#8e4030',
      ),
      chest: createIconSvg(
        'M14 24h36v24H14V24Zm6-10h24l6 10H14l6-10Zm4 18h16v10H24V32Z',
        '#7a614d',
        '#513c2f',
      ),
      archive: createIconSvg(
        'M12 18h40v30H12V18Zm6-8h28l6 8H12l6-8Zm6 18h16',
        '#8e4030',
        '#463428',
      ),
    },
    categoryIcons: {
      scroll: createIconSvg(
        'M18 14h18c8 0 12 6 12 12v18c0 6-4 10-10 10H24c-6 0-10-4-10-10s4-10 10-10h18',
        '#f3e4c6',
        '#8a5a27',
      ),
      sun: createIconSvg(
        'M32 18a14 14 0 1 1 0 28 14 14 0 0 1 0-28Zm0-10v8m0 32v8m24-24h-8M16 32H8m41-17-6 6M21 43l-6 6m0-34 6 6m22 22 6 6',
        '#d2a053',
        '#8a5a27',
      ),
      leaf: createIconSvg(
        'M48 16c-18 0-28 10-28 28 18 0 28-10 28-28ZM18 46c6-8 14-16 22-22',
        '#6e8253',
        '#4d6240',
      ),
      spark: createIconSvg(
        'M32 6 38 24l18 8-18 8-6 18-6-18-18-8 18-8 6-18Z',
        '#c75b42',
        '#8e4030',
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
