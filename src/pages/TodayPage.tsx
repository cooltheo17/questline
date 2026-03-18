import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { QuickAddComposer } from '../components/app/QuickAddComposer'
import { ProgressHeader } from '../components/app/ProgressHeader'
import { TaskCard } from '../components/app/TaskCard'
import { Badge, Button, Card } from '../components/primitives/Primitives'
import { getCategoryTone } from '../domain/categories'
import {
  createTask,
  completeTask,
  deleteCompletionRecord,
  reorderTasks,
  toggleSubtask,
} from '../data/repository'
import { getTodayTaskViews, getProfileSnapshot } from '../domain/selectors'
import { getTaskReward } from '../domain/rewards'
import { useAppCollections } from '../hooks/useAppCollections'
import { useTheme } from '../theme/themeContext'
import { useUiStore } from '../state/uiStore'
import styles from './Page.module.css'
import sharedStyles from '../components/app/Shared.module.css'

export function TodayPage() {
  const { isReady, categories, tasks, completions, walletTransactions } = useAppCollections()
  const { theme } = useTheme()
  const pushToast = useUiStore((state) => state.pushToast)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const profile = getProfileSnapshot(completions, walletTransactions, tasks, categories)
  const today = new Date()
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
  const sections = getTodayTaskViews(tasks, categories, completions, today)
  const tomorrowSections = getTodayTaskViews(tasks, categories, completions, tomorrow)

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
                    <img className={sharedStyles.emptyArt} src={theme.assets.emptyState} alt="" />
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
                <h2 className={sharedStyles.heading}>Tomorrow</h2>
              </div>
              {tomorrowSections.due.length ? (
                <div className={styles.compactList}>
                  {tomorrowSections.due.slice(0, 5).map((item) => (
                    <div key={`${item.task.id}-tomorrow`} className={styles.compactRow}>
                      <span>{item.task.title}</span>
                      <div className={sharedStyles.badgeRow}>
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
                <h2 className={sharedStyles.heading}>{theme.copy.completedLabel}</h2>
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
                            Cancel
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
