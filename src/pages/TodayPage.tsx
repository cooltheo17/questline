import { AnimatePresence } from 'framer-motion'
import { useState, type ReactNode } from 'react'
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
import {
  createTask,
  createFromBulkImportPlan,
  completeTask,
  deleteCompletionRecord,
  reorderTasks,
  toggleSubtask,
  undoBulkImport,
} from '../data/repository'
import { formatShortDateLabel } from '../domain/dateFormatting'
import {
  getProfileSnapshot,
  getTaskIdsForTodayReorder,
  getTodayPageViewData,
  type TodayPageViewData,
  type TodayTaskGroup,
  type TodayTaskGroupKey,
  type TodayTaskView,
} from '../domain/selectors'
import { getTaskReward } from '../domain/rewards'
import { getCompletedSubtaskCount } from '../domain/subtasks'
import {
  useAppCollectionsReady,
  useCategoriesCollectionContext,
  useCompletionsCollectionContext,
  useQuestsCollectionContext,
  useTasksCollectionContext,
  useWalletTransactionsCollectionContext,
} from '../hooks/AppCollectionsContext'
import { useTheme } from '../theme/themeContext'
import { useUiStore } from '../state/uiStore'
import { preloadQuestPage } from '../app/routeLoaders'
import type { BulkImportPlan } from '../domain/bulkAdd'
import type { CompletionRecord, Task } from '../domain/types'
import styles from './Page.module.css'
import sharedStyles from '../components/app/Shared.module.css'

type SecondaryView = 'tomorrow' | 'future' | 'overdue'
type PrimaryView = 'today' | SecondaryView

interface ScheduleViewData {
  groups: TodayTaskGroup[]
  items: TodayTaskView[]
  isReadOnly: boolean
  isGrouped: boolean
}

const PRIMARY_VIEW_OPTIONS: { label: string; value: PrimaryView }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Tomorrow', value: 'tomorrow' },
  { label: 'Future', value: 'future' },
  { label: 'Overdue', value: 'overdue' },
]

const noopTaskAction = async () => {}

export function TodayPage() {
  const isReady = useAppCollectionsReady()
  const categories = useCategoriesCollectionContext()
  const tasks = useTasksCollectionContext()
  const quests = useQuestsCollectionContext()
  const completions = useCompletionsCollectionContext()
  const walletTransactions = useWalletTransactionsCollectionContext()
  const navigate = useNavigate()
  const { theme } = useTheme()
  const pushToast = useUiStore((state) => state.pushToast)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [displayView, setDisplayView] = useState<PrimaryView>('today')
  const [collapsedGroups, setCollapsedGroups] = useState<Partial<Record<TodayTaskGroupKey, boolean>>>({})
  const profile = getProfileSnapshot(completions, walletTransactions, tasks, categories, quests)
  const today = new Date()
  const pageView = getTodayPageViewData(tasks, categories, quests, completions, today)
  const scheduleView = getScheduleViewData(displayView, pageView)
  const todayDueTaskIds = pageView.today.due.map((entry) => entry.task.id)
  const activeCategories = categories.filter((category) => !category.archived)

  if (!isReady) {
    return <Card>Loading…</Card>
  }

  function showTaskRewardToast(task: Task) {
    const reward = getTaskReward(task)

    pushToast({
      title: task.title,
      description: `${reward.xp} XP and ${reward.coins} coins secured.`,
    })
  }

  async function handleBulkCreate(plan: BulkImportPlan) {
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

  async function handleTaskComplete(task: Task, isReadOnly: boolean) {
    if (isReadOnly) {
      return
    }

    await completeTask(task)
    showTaskRewardToast(task)
  }

  async function handleSubtaskToggle(
    task: Task,
    completion: CompletionRecord | undefined,
    subtaskId: string,
    isReadOnly: boolean,
  ) {
    if (isReadOnly) {
      return
    }

    const hadCount = getCompletedSubtaskCount(task, completion)
    await toggleSubtask(task, subtaskId)

    if (hadCount === task.subtasks.length - 1) {
      showTaskRewardToast(task)
    }
  }

  function handleTaskDrop(targetTaskId: string) {
    if (!draggedTaskId || draggedTaskId === targetTaskId) {
      return
    }

    const reorderedTaskIds = getTaskIdsForTodayReorder(tasks, todayDueTaskIds, draggedTaskId, targetTaskId)

    setDraggedTaskId(null)
    void reorderTasks(reorderedTaskIds)
  }
  const scheduleActions = {
    draggedTaskId,
    onDragStart: setDraggedTaskId,
    onDragEnd: () => setDraggedTaskId(null),
    onDropTask: handleTaskDrop,
    onCompleteTask: handleTaskComplete,
    onToggleTaskSubtask: handleSubtaskToggle,
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
                      if (displayView !== option.value) {
                        setDisplayView(option.value)
                      }
                    }}
                  >
                    {option.label}
                  </Button>
                ))}
              />

              <AnimatePresence initial={false}>
                {scheduleView.items.length ? (
                  scheduleView.isGrouped ? (
                    scheduleView.groups.map((group) => (
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
                              <ScheduleTaskCard key={item.task.id} item={item} draggable actions={scheduleActions} />
                            ))}
                          </div>
                        ) : null}
                      </section>
                    ))
                  ) : (
                    scheduleView.items.map((item) => (
                      <ScheduleTaskCard
                        key={item.task.id}
                        item={item}
                        readOnly={scheduleView.isReadOnly}
                        actions={scheduleActions}
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
            categories={activeCategories}
            quests={quests}
            onCreate={createTask}
            onBulkCreate={handleBulkCreate}
          />
        </div>

        <div data-slot="page-stack" className={styles.stack}>
          <ProgressHeader
            profile={profile}
            completedCount={pageView.today.completed.length}
            dueCount={pageView.today.due.length}
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

              {pageView.today.completed.length ? (
                <div data-slot="scroll-panel" className={styles.scrollPanel}>
                  <div data-slot="history-list" className={styles.history}>
                    {pageView.today.completed.map((item) => (
                      <CompletedTaskCard
                        key={`${item.task.id}-done`}
                        item={item}
                        actionSlot={getCompletedTaskAction(item.completion)}
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
              {pageView.questSummaries.length ? (
                <div className={styles.questList}>
                  {pageView.questSummaries.map(({ quest, progress }) => (
                    <button
                      key={quest.id}
                      type="button"
                      className={styles.questItem}
                      onClick={() => navigate(`/quests/${quest.id}`)}
                      onMouseEnter={() => void preloadQuestPage()}
                      onFocus={() => void preloadQuestPage()}
                      onTouchStart={() => void preloadQuestPage()}
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
                            <span>Next due {formatShortDateLabel(progress.nextDueDate)}</span>
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

function getScheduleViewData(view: PrimaryView, pageView: TodayPageViewData): ScheduleViewData {
  switch (view) {
    case 'today':
      return {
        groups: pageView.today.groups,
        items: pageView.today.due,
        isGrouped: true,
        isReadOnly: false,
      }
    case 'tomorrow':
      return {
        groups: [],
        items: pageView.tomorrow.due,
        isGrouped: false,
        isReadOnly: true,
      }
    case 'future':
      return {
        groups: [],
        items: pageView.future,
        isGrouped: false,
        isReadOnly: false,
      }
    case 'overdue':
      return {
        groups: [],
        items: pageView.overdue,
        isGrouped: false,
        isReadOnly: false,
      }
    default:
      return {
        groups: [],
        items: pageView.today.due,
        isGrouped: false,
        isReadOnly: false,
      }
  }
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

function ScheduleTaskCard({
  item,
  draggable,
  readOnly,
  actions,
}: {
  item: TodayTaskView
  draggable?: boolean
  readOnly?: boolean
  actions: {
    draggedTaskId: string | null
    onDragStart: (taskId: string | null) => void
    onDragEnd: () => void
    onDropTask: (targetTaskId: string) => void
    onCompleteTask: (task: Task, isReadOnly: boolean) => Promise<void>
    onToggleTaskSubtask: (
      task: Task,
      completion: CompletionRecord | undefined,
      subtaskId: string,
      isReadOnly: boolean,
    ) => Promise<void>
  }
}) {
  const isReadOnly = Boolean(readOnly)

  return (
    <TaskCard
      task={item.task}
      categories={item.categories}
      completion={item.completion}
      isCompleted={false}
      readOnly={isReadOnly}
      draggable={draggable}
      dragActive={actions.draggedTaskId === item.task.id}
      onDragStart={draggable ? () => actions.onDragStart(item.task.id) : undefined}
      onDragEnd={draggable ? actions.onDragEnd : undefined}
      onDrop={draggable ? () => actions.onDropTask(item.task.id) : undefined}
      onComplete={() => actions.onCompleteTask(item.task, isReadOnly)}
      onToggleSubtask={(subtaskId) =>
        actions.onToggleTaskSubtask(item.task, item.completion, subtaskId, isReadOnly)
      }
    />
  )
}

function CompletedTaskCard({
  item,
  actionSlot,
}: {
  item: TodayTaskView
  actionSlot?: ReactNode
}) {
  return (
    <TaskCard
      task={item.task}
      categories={item.categories}
      completion={item.completion}
      isCompleted
      onComplete={noopTaskAction}
      onToggleSubtask={noopTaskAction}
      actionSlot={actionSlot}
    />
  )
}

function getCompletedTaskAction(completion: CompletionRecord | undefined) {
  if (!completion) {
    return undefined
  }

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={() => void deleteCompletionRecord(completion.id)}
    >
      <span className={sharedStyles.inlineLabel}>
        <ArrowCounterClockwiseIcon aria-hidden="true" size={15} weight="bold" />
        <span>Cancel</span>
      </span>
    </Button>
  )
}
