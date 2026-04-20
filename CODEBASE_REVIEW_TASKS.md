# Codebase Review Tasks

## Overall Rating

- Maintainability: `6/10`
- Simplicity: `5/10`
- Render efficiency: `5/10`

## Review Focus

- Unnecessary logic
- Complex logic
- Nested `if`s and ternaries
- Unnecessary hooks
- Extra rerenders caused by broad subscriptions or prop handling
- Theme-related complexity
- Places where a full page reload is simpler than keeping extra client-side coordination

## Working Rule For Future Changes

- Prefer simpler data flow over clever render optimization.
- Prefer fewer live subscriptions and smaller component responsibilities.
- Prefer deriving less during render.
- A full page reload is acceptable after rare admin-style actions if it removes state-sync complexity.
- Do not add theme-specific component branches unless CSS variables and theme styles cannot express the difference.

## Priority Tasks

### P1

- [ ] Split the monolithic app collections subscription into smaller slices.  
  Rating: `9/10`  
  Why: `useAppCollections()` subscribes to six collections and returns one object. Any change can rerender every consumer, even when the page only needs one slice of data.  
  Evidence: `src/hooks/useAppCollections.ts`, `src/hooks/AppCollectionsContext.tsx`, `src/pages/TodayPage.tsx`, `src/pages/RewardsPage.tsx`, `src/pages/ManagePage.tsx`  
  Simplify toward: page-level or domain-level hooks such as `useTasksCollection()`, `useRewardsCollection()`, `useProfileData()`, or multiple contexts instead of one giant value.

- [ ] Stop `QuestPage` from creating its own second set of live queries.  
  Rating: `9/10`  
  Why: the page already sits under `AppCollectionsProvider`, but it calls `useAppCollections()` directly and duplicates Dexie work.  
  Evidence: `src/app/App.tsx`, `src/pages/QuestPage.tsx`  
  Simplify toward: use the shared context, or give the page only the specific collections it needs.

- [ ] Remove forced mounting for inactive Manage tabs.  
  Rating: `9/10`  
  Why: hidden tabs remain mounted because `TabPanel` uses `forceMount`, so inactive sections still rerender and keep form state alive even when not visible.  
  Evidence: `src/components/primitives/Primitives.tsx`, `src/pages/ManagePage.tsx`  
  Simplify toward: unmount inactive tabs by default. If preserving state matters, store only the few values worth preserving instead of keeping every tab mounted.

- [ ] Stop writing category edits to IndexedDB on every keystroke.  
  Rating: `8/10`  
  Why: typing in category name fields triggers `updateCategory()` immediately, which causes live-query churn across the app.  
  Evidence: `src/pages/manage/ManageCategoriesSection.tsx`  
  Simplify toward: local draft state plus explicit save, blur-save, or a very small debounced save.

### P2

- [ ] Break up `TodayPage` render-time derivation and remove duplicate scans.  
  Rating: `8/10`  
  Why: the page computes profile, multiple section views, grouped sections, tomorrow sections, secondary views, and quest summaries on every render. `getGroupedTodayTaskViews()` also calls `getTodayTaskViews()` again, so today’s task pass is duplicated.  
  Evidence: `src/pages/TodayPage.tsx`, `src/domain/selectors.ts`  
  Simplify toward: one selector pass for today, one for future/overdue, and a smaller page component that renders prepared view models.

- [ ] Reduce the amount of page state and controller logic in `ManagePage`.  
  Rating: `7/10`  
  Why: it owns tabs, cloud sync status labels, import/export/reset actions, editor dialogs, category creation state, quest creation state, scroll restoration, and sorting/summary derivation.  
  Evidence: `src/pages/ManagePage.tsx`  
  Simplify toward: move tab-local state into each section, and move cloud/import/export logic into a dedicated hook or `ManageDataSection` container.

- [ ] Reduce rerenders caused by fresh inline handlers and props in task lists.  
  Rating: `7/10`  
  Why: `TodayPage` creates new handlers for every `TaskCard` on every render. State like `draggedTaskId` and `collapsedGroups` then refreshes the whole visible list.  
  Evidence: `src/pages/TodayPage.tsx`, `src/components/app/TaskCard.tsx`  
  Simplify toward: move row actions into a task-row container, keep `TaskCard` presentational, and avoid passing large numbers of per-render inline closures.

- [ ] Split `QuickAddComposer` into quick-add and bulk-import pieces.  
  Rating: `6/10`  
  Why: one component owns simple task creation, reward configuration, category/quest selection, bulk JSON parsing, preview, import submission, and a large embedded LLM prompt string.  
  Evidence: `src/components/app/QuickAddComposer.tsx`  
  Simplify toward: `QuickAddForm` + `BulkImportDialog`, with the prompt text moved to a constant/module file.

### P3

- [ ] Remove nested ternaries and dense conditional rendering in top-level pages.  
  Rating: `5/10`  
  Why: several pages have hard-to-scan conditional trees that make already-large components harder to maintain.  
  Evidence: `src/pages/TodayPage.tsx`, `src/pages/ManagePage.tsx`, `src/pages/QuestPage.tsx`, `src/pages/RewardsPage.tsx`, `src/components/app/RewardCard.tsx`  
  Simplify toward: small helper functions with names, or precomputed labels/flags before JSX.

- [ ] Replace prop-to-state sync effects in editor dialogs with keyed form components.  
  Rating: `4/10`  
  Why: `QuestEditorDialog` and `RewardEditorDialog` mirror props into local state via `useEffect`, while `TaskEditorDialog` already uses a cleaner keyed-form approach.  
  Evidence: `src/pages/manage/QuestEditorDialog.tsx`, `src/pages/manage/RewardEditorDialog.tsx`, `src/pages/manage/TaskEditorDialog.tsx`  
  Simplify toward: render a keyed inner form when an item is selected and let mount/reset handle the draft lifecycle.

## Theme Complexity Review

- [ ] Remove theme-driven behavior branching from components where possible.  
  Rating: `7/10`  
  Why: the theme system itself is mostly fine because it uses CSS variables and `data-theme`, but complexity starts when components change behavior or markup based on theme identity. `TaskCard` has a special `isLedgerTheme` rendering branch, which couples business UI structure to a specific theme id.  
  Evidence: `src/components/app/TaskCard.tsx`, `src/theme/themeContext.tsx`  
  Simplify toward: keep themes visual only. If a theme needs a different look, prefer CSS via tokens and `data-slot` selectors instead of branching JSX by `theme.id`.

- [ ] Reduce hidden coupling created by theme-specific `data-slot` overrides.  
  Rating: `6/10`  
  Why: large theme style files target many specific `data-slot` names. This works, but it means refactoring markup can silently break theme behavior.  
  Evidence: `src/theme/themes/ledger.ts`, `src/theme/themes/custom-theme.ts`  
  Simplify toward: smaller stable slot contracts, fewer one-off overrides, and a stronger preference for shared tokens over structural theme CSS.

- [ ] Stop passing theme props through `ManagePage` when the section can read context directly.  
  Rating: `3/10`  
  Why: `ManageAppearanceSection` receives `theme`, `themes`, and `onSelectTheme` from `ManagePage`, even though this is theme-specific UI and can own that read itself. This is not the biggest issue, but it is extra plumbing.  
  Evidence: `src/pages/ManagePage.tsx`, `src/pages/manage/ManageAppearanceSection.tsx`  
  Simplify toward: let `ManageAppearanceSection` call `useTheme()` directly.

## Reload-As-Simplification Opportunities

- [ ] Decide where a full page reload is preferred over preserving local UI state.  
  Rating: `6/10`  
  Why: some admin-style flows currently keep extra state alive to avoid losing UI position or drafts. That adds complexity. For rare actions, reload is simpler and acceptable.  
  Good candidates:
  - after `resetAllData()`
  - after backup import
  - after enabling cloud sync if bootstrapping state is tricky
  - possibly after theme change if we want to remove theme-specific runtime branching and accept a harder reset
  Bad candidates:
  - marking tasks complete
  - toggling subtasks
  - reward purchases
  - normal tab switching
  Evidence: `src/pages/ManagePage.tsx`, `src/theme/themeContext.tsx`

- [ ] Remove scroll-restoration coordination for Manage tabs if unmounting tabs makes it unnecessary.  
  Rating: `4/10`  
  Why: `ManagePage` stores `scrollPositionRef` and restores scroll after tab changes. If tab behavior is simplified, this may be unnecessary complexity.  
  Evidence: `src/pages/ManagePage.tsx`  
  Simplify toward: either accept normal tab scroll behavior or reload/reset layout after rare admin actions.

## Other Simplification Opportunities

- [ ] Extract and share duplicated date-label formatting.  
  Rating: `3/10`  
  Why: `formatDateLabel()` exists separately in `TodayPage` and `QuestPage`.  
  Evidence: `src/pages/TodayPage.tsx`, `src/pages/QuestPage.tsx`  
  Simplify toward: one shared utility in a date/format module.

- [ ] Reduce repeated scans over the same arrays in selector and page code.  
  Rating: `5/10`  
  Why: multiple places repeatedly call `filter`, `find`, `some`, and `map` over the same collections. This is both noisier and harder to reason about.  
  Evidence: `src/domain/selectors.ts`, `src/domain/quests.ts`, `src/pages/QuestPage.tsx`, `src/pages/RewardsPage.tsx`  
  Simplify toward: build maps once inside selectors and return ready-to-render structures.

- [ ] Move large static prompt/config text out of component bodies.  
  Rating: `3/10`  
  Why: the `llmPrompt` array in `QuickAddComposer` is static content but is rebuilt on every render and makes the component harder to scan.  
  Evidence: `src/components/app/QuickAddComposer.tsx`  
  Simplify toward: extract to a constant module or markdown/text asset.

- [ ] Collapse repeated derived labels in `ManagePage` into a dedicated presenter/helper.  
  Rating: `4/10`  
  Why: `cloudStatusLabel`, `lastSyncLabel`, and `accountLabel` are not individually bad, but they contribute to `ManagePage` being a controller plus formatter plus view.  
  Evidence: `src/pages/ManagePage.tsx`  
  Simplify toward: a small `useManageDataPresentation()` hook or move them into `ManageDataSection`.

- [ ] Reconsider whether all animation wrappers are worth the extra render surface.  
  Rating: `4/10`  
  Why: `motion` plus `layout` is used in several list-heavy places. The effect may be worth it, but it also increases the amount of work during frequent list updates.  
  Evidence: `src/components/app/TaskCard.tsx`, `src/components/app/RewardCard.tsx`, `src/components/app/ProgressHeader.tsx`, `src/pages/RewardsPage.tsx`  
  Simplify toward: keep animation only where it clearly improves the product.

## Recommended Order

1. Split app collections subscriptions.
2. Stop duplicate `QuestPage` subscriptions.
3. Remove `forceMount` from Manage tabs.
4. Stop category writes on every keystroke.
5. Simplify `TodayPage` selectors and task-row prop flow.
6. Reduce `ManagePage` responsibilities.
7. Remove theme-specific rendering branches.

## Notes

- The theme system is not the main rerender problem.
- The biggest theme-related risk is structural coupling, not prop count.
- A reload can simplify rare admin flows, but it is not a good substitute for fixing broad live-query subscriptions.
