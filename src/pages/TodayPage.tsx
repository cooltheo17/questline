import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { CalendarDotsIcon } from '@phosphor-icons/react/dist/csr/CalendarDots'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { QuickAddComposer } from '../components/app/QuickAddComposer'
import { ProgressHeader } from '../components/app/ProgressHeader'
import { TaskCard } from '../components/app/TaskCard'
import { Badge, Button, Card } from '../components/primitives/Primitives'
import { getCategoryTone } from '../domain/categories'
import { getCompletionForDate, isTaskDueToday, toDateKey } from '../domain/recurrence'
import {
  createTask,
  completeTask,
  deleteCompletionRecord,
  reorderTasks,
  toggleSubtask,
} from '../data/repository'
import { getTodayTaskViews, getProfileSnapshot, type TodayTaskView } from '../domain/selectors'
import { getTaskReward } from '../domain/rewards'
import { useAppCollections } from '../hooks/useAppCollections'
import { useTheme } from '../theme/themeContext'
import { useUiStore } from '../state/uiStore'
import type { Category, CompletionRecord, Task } from '../domain/types'
import styles from './Page.module.css'
import sharedStyles from '../components/app/Shared.module.css'

type SecondaryView = 'tomorrow' | 'upcoming' | 'overdue'

export function TodayPage() {
  const { isReady, categories, tasks, completions, walletTransactions } = useAppCollections()
  const { theme } = useTheme()
  const pushToast = useUiStore((state) => state.pushToast)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [secondaryView, setSecondaryView] = useState<SecondaryView>('tomorrow')
  const profile = getProfileSnapshot(completions, walletTransactions, tasks, categories)
  const today = new Date()
  const sections = getTodayTaskViews(tasks, categories, completions, today)
  const secondaryItems = getSecondaryViews(tasks, categories, completions, today, secondaryView)

  if (!isReady) {
    return <Card>Loading…</Card>
  }

  return (
    <div className={styles.page}>
      <div className={styles.featureGrid}>
        <div className={styles.stack}>
          <Card>
            <div className={sharedStyles.panel}>
              <div className={sharedStyles.sectionTitle}>
                <h2 className={sharedStyles.heading}>Today</h2>
              </div>

              <AnimatePresence initial={false}>
                {sections.due.length ? (
                  sections.due.map((item) => (
                    <TaskCard
                      key={item.task.id}
                      task={item.task}
                      categories={item.categories}
                      completion={item.completion}
                      isCompleted={false}
                      draggable
                      dragActive={draggedTaskId === item.task.id}
                      onDragStart={() => setDraggedTaskId(item.task.id)}
                      onDragEnd={() => setDraggedTaskId(null)}
                      onDragOver={() => {}}
                      onDrop={() => {
                        if (!draggedTaskId || draggedTaskId === item.task.id) {
                          return
                        }

                        const reordered = [...sections.due]
                        const fromIndex = reordered.findIndex((entry) => entry.task.id === draggedTaskId)
                        const toIndex = reordered.findIndex((entry) => entry.task.id === item.task.id)

                        if (fromIndex === -1 || toIndex === -1) {
                          return
                        }

                        const [moved] = reordered.splice(fromIndex, 1)
                        reordered.splice(toIndex, 0, moved)
                        setDraggedTaskId(null)
                        void reorderTasks(reordered.map((entry) => entry.task.id))
                      }}
                      onComplete={async () => {
                        const reward = getTaskReward(item.task)
                        await completeTask(item.task)
                        pushToast({ title: item.task.title, ...reward })
                      }}
                      onToggleSubtask={async (subtaskId) => {
                        const hadCount = item.completion?.completedSubtaskIds.length ?? 0
                        await toggleSubtask(item.task, subtaskId)
                        if (hadCount === item.task.subtasks.length - 1) {
                          const reward = getTaskReward(item.task)
                          pushToast({ title: item.task.title, ...reward })
                        }
                      }}
                    />
                  ))
                ) : (
                  <div className={sharedStyles.empty}>
                    <img
                      className={[sharedStyles.emptyArt, styles.emptyArtMuted].join(' ')}
                      src={theme.assets.emptyState}
                      alt=""
                    />
                    <div>
                      <h3 className={sharedStyles.heading}>No live tasks right now</h3>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </Card>

          <QuickAddComposer categories={categories.filter((category) => !category.archived)} onCreate={createTask} />

          <Card>
            <div className={sharedStyles.panel}>
              <div className={sharedStyles.sectionTitle}>
                <h2 className={sharedStyles.heading}>
                  <span className={sharedStyles.headingInline}>
                    <CalendarDotsIcon aria-hidden="true" size={20} weight="duotone" />
                    <span>Schedule</span>
                  </span>
                </h2>
                <div className={sharedStyles.actions}>
                  <Button
                    size="sm"
                    variant={secondaryView === 'tomorrow' ? 'primary' : 'secondary'}
                    onClick={() => setSecondaryView('tomorrow')}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    size="sm"
                    variant={secondaryView === 'upcoming' ? 'primary' : 'secondary'}
                    onClick={() => setSecondaryView('upcoming')}
                  >
                    Upcoming
                  </Button>
                  <Button
                    size="sm"
                    variant={secondaryView === 'overdue' ? 'primary' : 'secondary'}
                    onClick={() => setSecondaryView('overdue')}
                  >
                    Overdue
                  </Button>
                </div>
              </div>
              {secondaryItems.length ? (
                <div className={styles.compactList}>
                  {secondaryItems.slice(0, 6).map((item) => (
                    <div
                      key={`${item.task.id}-${secondaryView}`}
                      className={[
                        styles.compactRow,
                        secondaryView === 'overdue' ? styles.compactRowOverdue : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <div className={styles.compactTask}>
                        <span className={styles.compactMarker} aria-hidden="true" />
                        <span>{item.task.title}</span>
                      </div>
                      <div className={sharedStyles.badgeRow}>
                        {item.task.dueDate ? <span className={sharedStyles.muted}>{formatDateLabel(item.task.dueDate)}</span> : null}
                        {item.categories.slice(0, 2).map((category) => (
                          <Badge key={category.id} tone={getCategoryTone(category.colorKey)}>
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <img className={sharedStyles.emptyArt} src={theme.assets.hero} alt="" />
              )}
            </div>
          </Card>
        </div>

        <div className={styles.stack}>
          <ProgressHeader
            profile={profile}
            completedCount={sections.completed.length}
            dueCount={sections.due.length}
          />

          <Card>
            <div className={sharedStyles.panel}>
              <div className={sharedStyles.sectionTitle}>
                <h2 className={sharedStyles.heading}>
                  <span className={sharedStyles.headingInline}>
                    <CheckCircleIcon aria-hidden="true" size={20} weight="duotone" />
                    <span>{theme.copy.completedLabel}</span>
                  </span>
                </h2>
              </div>

              {sections.completed.length ? (
                <div className={styles.scrollPanel}>
                  <div className={styles.history}>
                  {sections.completed.map((item) => (
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
                <p className={sharedStyles.muted}>Nothing completed yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
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
