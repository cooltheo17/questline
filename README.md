# Questline

Questline is a local-first React todo app with a lightweight progression loop:

- fast capture
- recurring and one-off tasks
- optional subtasks
- XP, levels, and coins
- a real-life reward shop
- a theme system designed for one-place re-skinning

## Stack

- React 19
- TypeScript
- Vite
- React Router
- Dexie + IndexedDB
- Radix primitives
- Framer Motion
- Zustand for ephemeral UI only
- Vitest + Testing Library
- Playwright smoke-test scaffold

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
npm run test:e2e
```

`npm run test:e2e` requires Playwright browsers to be installed locally.

## Deploying To Vercel

This repo includes a `vercel.json` configured for Vite SPA deployment:

- framework preset: `vite`
- build command: `npm run build`
- output directory: `dist`
- automatic Vercel deployments only from the `main` branch
- SPA rewrite of all routes to `index.html` so direct visits to routes like `/today` and `/quests/:questId` work in production
- a few conservative security headers for static hosting

Typical flow:

```bash
npm install -g vercel
vercel
```

For production:

```bash
vercel --prod
```

### Why `vercel.json` exists

The app uses React Router in SPA mode, so a host needs to send `index.html` for deep links such as `/today`, `/manage`, and `/quests/:questId`. `vercel.json` tells Vercel to do that rewrite and applies a few hosting-specific headers.

### Why it is optional for clones

`vercel.json` is only used by Vercel. It does not affect local development, `npm run dev`, `npm run build`, tests, or other hosting platforms unless someone chooses to deploy on Vercel.

If someone clones the repo and does not want Vercel, they can ignore the file completely. If they deploy elsewhere, they just need the equivalent SPA fallback rule on their own host.

### Recommended GitHub setup for a public repo

To match the Vercel config:

- protect `main`
- disable direct pushes to `main`
- require changes to land through pull requests
- keep Vercel auto-deploys limited to `main`

Typical outside-contributor flow is fork -> branch -> pull request, not direct pushes to this repository.

## Install

```bash
nvm install 24.14.0
nvm use 24.14.0
npm install
```

If you want Node `24.14.0` as your default for new shells:

```bash
nvm alias default 24.14.0
```

Start the app with:

```bash
npm run dev
```

## Runtime

- Node.js `24.14.0`
- npm `11.9.0`

The repo includes both `.nvmrc` and `.node-version` so common version managers resolve the same stable runtime.

## Architecture

### Durable state

All task, completion, reward, and wallet data lives in IndexedDB through Dexie.

### UI state

Zustand is only used for short-lived UI state such as toast notifications.

### Themeing

Theme definitions live under `src/theme/`. Feature code consumes semantic tokens and theme asset keys rather than hardcoded theme values.

To add a new theme:

1. Copy the existing theme file in `src/theme/themes/`
2. Change tokens, copy, and asset generators
3. Register the theme in `src/theme/themeRegistry.ts`

## Product Areas

- `src/pages/TodayPage.tsx`: quick capture, due tasks, completions, progression header
- `src/pages/RewardsPage.tsx`: reward catalog, buying flow, purchase history
- `src/pages/ManagePage.tsx`: categories, task editing, reward editing, theme selection, import/export/reset

## Tests

Current automated coverage includes:

- level curve rules
- reward defaults and overrides
- weekly/monthly recurrence logic
- reward gating until all subtasks are complete
- quick-add keyboard flow
- insufficient-coin purchase state
- theme contract presence

## Notes

- Theme selection is stored outside IndexedDB.
- Missed recurring tasks do not stack.
- Tasks can have multiple tags.
- `Schedule` uses due date and cadence rules:
  - `Tomorrow`: tasks due tomorrow
  - `Future`: future-dated tasks after tomorrow; daily tasks are excluded
  - `Overdue`: one-off tasks with a due date in the past
- Ritual/habit streaks come from tasks tagged with a category such as `Rituals` or `Habit`.
- The bundled theme is original-IP-inspired rather than based on protected third-party assets or names.
