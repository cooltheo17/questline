import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { CalendarDotsIcon } from '@phosphor-icons/react/dist/csr/CalendarDots'
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown'
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { FlagBannerIcon } from '@phosphor-icons/react/dist/csr/FlagBanner'
import { QuickAddComposer } from '../components/app/QuickAddComposer'
import { ProgressHeader } from '../components/app/ProgressHeader'
import { TaskCard } from '../components/app/TaskCard'
import { SectionHeading } from '../components/app/SectionHeading'
import { Badge, Button, Card, ProgressBar } from '../components/primitives/Primitives'
import { getCompletionForDate, isTaskDueToday, toDateKey } from '../domain/recurrence'
import {
  createTask,
  createFromBulkImportPlan,
  completeTask,
  deleteCompletionRecord,
  reorderTasks,
  toggleSubtask,
  undoBulkImport,
} from '../data/repository'
import {
  getGroupedTodayTaskViews,
  getTaskIdsForTodayReorder,
  getTodayTaskViews,
  getProfileSnapshot,
  type TodayTaskView,
} from '../domain/selectors'
import { getTaskReward } from '../domain/rewards'
import { getQuestProgress, getQuestTasks } from '../domain/quests'
import { useAppCollectionsContext } from '../hooks/AppCollectionsContext'
import { useTheme } from '../theme/themeContext'
import { useUiStore } from '../state/uiStore'
import type { Category, CompletionRecord, Task } from '../domain/types'
import type { TodayTaskGroupKey } from '../domain/selectors'
import styles from './Page.module.css'
import sharedStyles from '../components/app/Shared.module.css'

type SecondaryView = 'tomorrow' | 'future' | 'overdue'
type PrimaryView = 'today' | SecondaryView

const PRIMARY_VIEW_OPTIONS: { label: string; value: PrimaryView }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'Future', value: 'future' },
  { label: 'Overdue', value: 'overdue' },
]

export function TodayPage() {
  const { isReady, categories, tasks, quests, completions, walletTransactions } = useAppCollectionsContext()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const pushToast = useUiStore((state) => state.pushToast)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [displayView, setDisplayView] = useState<PrimaryView>('today')
  const [collapsedGroups, setCollapsedGroups] = useState<Partial<Record<TodayTaskGroupKey, boolean>>>({})
  const profile = getProfileSnapshot(completions, walletTransactions, tasks, categories, quests)
  const today = new Date()
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const todaySections = getTodayTaskViews(tasks, categories, completions, today)
  const groupedTodaySections = getGroupedTodayTaskViews(tasks, categories, completions, today)
  const tomorrowSections = getTodayTaskViews(tasks, categories, completions, tomorrow)
  const primaryItems =
    displayView === 'today'
      ? todaySections.due
      : displayView === 'tomorrow'
        ? tomorrowSections.due
        : getSecondaryViews(tasks, categories, completions, today, displayView)
  const isReadOnly = displayView === 'tomorrow'
  const questSummaries = quests
    .filter((quest) => !quest.archived && !quest.completedAt)
    .map((quest) => ({
      quest,
      tasks: getQuestTasks(quest.id, tasks),
      progress: getQuestProgress(quest, tasks, completions),
    }))

  if (!isReady) {
    return <Card>Loading…</Card>
  }

  async function handleBulkCreate(plan: Parameters<typeof createFromBulkImportPlan>[0]) {
    const commit = await createFromBulkImportPlan(plan)

    pushToast({
      title: 'Bulk import complete',
      description: `${commit.taskIds.length} tasks and ${commit.questIds.length} quests added.`,
      actionLabel: 'Undo',
      onAction: () => {
        void undoBulkImport(commit).then(() => {
          pushToast({
            title: 'Bulk import undone',
            description: 'The last bulk-added items were removed.',
          })
        })
      },
      duration: 7000,
    })

    return commit
  }

  return (
    <div data-slot="page" className={styles.page}>
      <div data-slot="page-feature-grid" className={styles.featureGrid}>
        <div data-slot="page-stack" className={styles.stack}>
          <Card>
            <div data-slot="section-panel" className={sharedStyles.panel}>
              <SectionHeading
                icon={<CalendarDotsIcon aria-hidden="true" size={20} weight="duotone" />}
                title="Schedule"
                actions={PRIMARY_VIEW_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    size="sm"
                    variant={displayView === option.value ? 'primary' : 'secondary'}
                    onClick={() => {
                      if (displayView === option.value) {
                        return
                      }
                      setDisplayView(option.value)
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              />

              <AnimatePresence initial={false}>
                  {primaryItems.length ? (
                    displayView === 'today' ? (
                      groupedTodaySections.map((group) => (
                        <section key={group.key} className={styles.taskGroup}>
                          <button
                            type="button"
                            className={styles.taskGroupToggle}
                            onClick={() =>
                              setCollapsedGroups((current) => ({
                                ...current,
                                [group.key]: !current[group.key],
                              }))
                            }
                            aria-expanded={!collapsedGroups[group.key]}
                          >
                            <div className={styles.taskGroupHeader}>
                              <div className={styles.taskGroupHeading}>
                                <span className={styles.taskGroupChevron}>
                                  {collapsedGroups[group.key] ? (
                                    <CaretRightIcon aria-hidden="true" size={16} weight="bold" />
                                  ) : (
                                    <CaretDownIcon aria-hidden="true" size={16} weight="bold" />
                                  )}
                                </span>
                                <h3 className={styles.taskGroupTitle}>{group.title}</h3>
                              </div>
                              <Badge tone="mist">{group.items.length}</Badge>
                            </div>
                          </button>
                          {!collapsedGroups[group.key] ? (
                            <div className={styles.taskGroupList}>
                              {group.items.map((item) => (
                                <TaskCard
                                  key={item.task.id}
                                  task={item.task}
                                  categories={item.categories}
                                  completion={item.completion}
                                  isCompleted={false}
                                  readOnly={isReadOnly}
                                  draggable
                                  dragActive={draggedTaskId === item.task.id}
                                  onDragStart={() => {
                                    setDraggedTaskId(item.task.id)
                                  }}
                                  onDragEnd={() => setDraggedTaskId(null)}
                                  onDrop={() => {
                                    if (!draggedTaskId || draggedTaskId === item.task.id) {
                                      return
                                    }

                                    const reorderedTaskIds = getTaskIdsForTodayReorder(
                                      tasks,
                                      todaySections.due.map((entry) => entry.task.id),
                                      draggedTaskId,
                                      item.task.id,
                                    )

                                    setDraggedTaskId(null)
                                    void reorderTasks(reorderedTaskIds)
                                  }}
                                  onComplete={async () => {
                                    const reward = getTaskReward(item.task)
                                    await completeTask(item.task)
                                    pushToast({
                                      title: item.task.title,
                                      description: `${reward.xp} XP and ${reward.coins} coins secured.`,
                                    })
                                  }}
                                  onToggleSubtask={async (subtaskId) => {
                                    const hadCount = item.completion?.completedSubtaskIds.length ?? 0
                                    await toggleSubtask(item.task, subtaskId)
                                    if (hadCount === item.task.subtasks.length - 1) {
                                      const reward = getTaskReward(item.task)
                                      pushToast({
                                        title: item.task.title,
                                        description: `${reward.xp} XP and ${reward.coins} coins secured.`,
                                      })
                                    }
                                  }}
                                />
                              ))}
                            </div>
                          ) : null}
                        </section>
                      ))
                    ) : (
                      primaryItems.map((item) => (
                        <TaskCard
                          key={item.task.id}
                          task={item.task}
                          categories={item.categories}
                          completion={item.completion}
                          isCompleted={false}
                          readOnly={isReadOnly}
                          draggable={false}
                          dragActive={draggedTaskId === item.task.id}
                          onDragStart={() => {
                            setDraggedTaskId(item.task.id)
                          }}
                          onDragEnd={() => setDraggedTaskId(null)}
                          onDrop={() => {
                            if (!draggedTaskId || draggedTaskId === item.task.id) {
                              return
                            }

                            const reorderedTaskIds = getTaskIdsForTodayReorder(
                              tasks,
                              todaySections.due.map((entry) => entry.task.id),
                              draggedTaskId,
                              item.task.id,
                            )

                            setDraggedTaskId(null)
                            void reorderTasks(reorderedTaskIds)
                          }}
                          onComplete={async () => {
                            if (isReadOnly) {
                              return
                            }
                            const reward = getTaskReward(item.task)
                            await completeTask(item.task)
                            pushToast({
                              title: item.task.title,
                              description: `${reward.xp} XP and ${reward.coins} coins secured.`,
                            })
                          }}
                          onToggleSubtask={async (subtaskId) => {
                            if (isReadOnly) {
                              return
                            }
                            const hadCount = item.completion?.completedSubtaskIds.length ?? 0
                            await toggleSubtask(item.task, subtaskId)
                            if (hadCount === item.task.subtasks.length - 1) {
                              const reward = getTaskReward(item.task)
                              pushToast({
                                title: item.task.title,
                                description: `${reward.xp} XP and ${reward.coins} coins secured.`,
                              })
                            }
                          }}
                        />
                      ))
                    )
                ) : (
                  <div data-slot="empty-state" className={sharedStyles.empty}>
                    <img
                      data-slot="empty-art"
                      className={[sharedStyles.emptyArt, styles.emptyArtMuted].join(' ')}
                      src={theme.assets.emptyState}
                      alt=""
                    />
                    <div>
                      <h3 data-slot="section-heading" className={sharedStyles.heading}>
                        {getEmptyStateMessage(displayView)}
                      </h3>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <QuickAddComposer
            categories={categories.filter((category) => !category.archived)}
            quests={quests}
            onCreate={createTask}
            onBulkCreate={handleBulkCreate}
          />

        </div>

        <div data-slot="page-stack" className={styles.stack}>
          <ProgressHeader
            profile={profile}
            completedCount={todaySections.completed.length}
            dueCount={todaySections.due.length}
          />
          <Card>
            <div data-slot="section-panel" className={sharedStyles.panel}>
              <div data-slot="section-title" className={sharedStyles.sectionTitle}>
                <h2 data-slot="section-heading" className={sharedStyles.heading}>
                  <span className={sharedStyles.headingInline}>
                    <CheckCircleIcon aria-hidden="true" size={20} weight="duotone" />
                    <span>{theme.copy.completedLabel}</span>
                  </span>
                </h2>
              </div>

              {todaySections.completed.length ? (
                <div data-slot="scroll-panel" className={styles.scrollPanel}>
                  <div data-slot="history-list" className={styles.history}>
                  {todaySections.completed.map((item) => (
                    <TaskCard
                      key={`${item.task.id}-done`}
                      task={item.task}
                      categories={item.categories}
                      completion={item.completion}
                      isCompleted
                      onComplete={async () => {}}
                      onToggleSubtask={async () => {}}
                      actionSlot={
                        item.completion ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void deleteCompletionRecord(item.completion!.id)}
                          >
                            <span className={sharedStyles.inlineLabel}>
                              <ArrowCounterClockwiseIcon aria-hidden="true" size={15} weight="bold" />
                              <span>Cancel</span>
                            </span>
                          </Button>
                        ) : undefined
                      }
                    />
                  ))}
                  </div>
                </div>
              ) : (
                <p data-slot="muted-text" className={sharedStyles.muted}>Nothing completed yet.</p>
              )}
            </div>
          </Card>
          <Card>
            <div data-slot="section-panel" className={sharedStyles.panel}>
              <div data-slot="section-title" className={sharedStyles.sectionTitle}>
                <h2 data-slot="section-heading" className={sharedStyles.heading}>
                  <span className={sharedStyles.headingInline}>
                    <FlagBannerIcon aria-hidden="true" size={20} weight="duotone" />
                    <span>Quests</span>
                  </span>
                </h2>
                <div data-slot="section-actions" className={sharedStyles.actions}>
                  <Button size="sm" variant="secondary" onClick={() => navigate('/manage?tab=quests')}>
                    New quest
                  </Button>
                </div>
              </div>
              {questSummaries.length ? (
                <div className={styles.questList}>
                  {questSummaries.map(({ quest, progress }) => (
                    <button
                      key={quest.id}
                      type="button"
                      className={styles.questItem}
                      onClick={() => navigate(`/quests/${quest.id}`)}
                    >
                      <div className={styles.questArt} aria-hidden="true">
                        {quest.imageUrl ? (
                          <img src={quest.imageUrl} alt="" />
                        ) : (
                          <span>{(quest.title.slice(0, 1) || 'Q').toUpperCase()}</span>
                        )}
                      </div>
                      <div className={styles.questBody}>
                        <div className={styles.questHeader}>
                          <div>
                            <strong>{quest.title}</strong>
                            {quest.description ? (
                              <p data-slot="muted-text" className={sharedStyles.muted}>
                                {quest.description}
                              </p>
                            ) : null}
                          </div>
                          {progress.readyToComplete ? <Badge tone="sage">Ready</Badge> : null}
                        </div>
                        <div className={styles.questMeta}>
                          <span>
                            {progress.totalTasks
                              ? `${progress.completedTasks} / ${progress.totalTasks} tasks`
                              : 'No quest tasks yet'}
                          </span>
                          <span>
                            {quest.rewardXp} XP · {quest.rewardCoins} coins
                          </span>
                          {progress.nextDueDate ? (
                            <span>Next due {formatDateLabel(progress.nextDueDate)}</span>
                          ) : null}
                        </div>
                        <ProgressBar value={progress.percentComplete} max={100} />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p data-slot="muted-text" className={sharedStyles.muted}>
                  No active quests yet.{' '}
                  <button
                    type="button"
                    className={styles.linkButton}
                    onClick={() => navigate('/manage?tab=quests')}
                  >
                    Create one
                  </button>
                  .
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getEmptyStateMessage(view: PrimaryView): string {
  switch (view) {
    case 'today':
      return 'No live tasks right now'
    case 'tomorrow':
      return 'No tasks due tomorrow'
    case 'future':
      return 'No future tasks scheduled'
    case 'overdue':
      return 'Nothing overdue - nice work'
    default:
      return 'No live tasks right now'
  }
}

function getSecondaryViews(
  tasks: Task[],
  categories: Category[],
  completions: CompletionRecord[],
  today: Date,
  view: SecondaryView,
): TodayTaskView[] {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const todayKey = toDateKey(today)
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const tomorrowKey = toDateKey(tomorrow)

  if (view === 'tomorrow') {
    return getTodayTaskViews(tasks, categories, completions, tomorrow).due
  }

  return tasks
    .filter((task) => {
      if (!task.active || task.archivedAt) {
        return false
      }

      if (task.cadence === 'none') {
        const isComplete = completions.some(
          (completion) => completion.taskId === task.id && Boolean(completion.completedAt),
        )

        if (isComplete || !task.dueDate) {
          return false
        }

        return view === 'overdue' ? task.dueDate < todayKey : task.dueDate > tomorrowKey
      }

      if (view === 'overdue' || task.cadence === 'daily') {
        return false
      }

      if (!task.dueDate || task.dueDate <= todayKey) {
        return false
      }

      return !isTaskDueToday(task, completions, today)
    })
    .map((task) => ({
      task,
      categories: task.categoryIds
        .map((categoryId) => categoriesById.get(categoryId))
        .filter((category): category is Category => Boolean(category)),
      completion: getCompletionForDate(task, completions, today),
      isCompletedToday: false,
    }))
    .sort((left, right) => {
      const leftDue = left.task.dueDate ?? '9999-12-31'
      const rightDue = right.task.dueDate ?? '9999-12-31'
      return leftDue.localeCompare(rightDue) || left.task.sortOrder - right.task.sortOrder
    })
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(year, month - 1, day))
}
