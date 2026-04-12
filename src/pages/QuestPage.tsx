import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { TrophyIcon } from '@phosphor-icons/react/dist/csr/Trophy'
import { GearSixIcon } from '@phosphor-icons/react/dist/csr/GearSix'
import { Badge, Button, Card, ProgressBar } from '../components/primitives/Primitives'
import { useAppCollections } from '../hooks/useAppCollections'
import { completeQuest } from '../data/repository'
import { getQuestProgress, getQuestTasks, isQuestTaskComplete } from '../domain/quests'
import { getCategoryTone, UNCATEGORIZED_LABEL, UNCATEGORIZED_TONE } from '../domain/categories'
import sharedStyles from '../components/app/Shared.module.css'
import styles from './Page.module.css'

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(year, month - 1, day))
}

export function QuestPage() {
  const { questId } = useParams<{ questId: string }>()
  const navigate = useNavigate()
  const { isReady, quests, tasks, categories, completions } = useAppCollections()
  const [isCompleting, setIsCompleting] = useState(false)
  const quest = quests.find((entry) => entry.id === questId)

  if (!isReady) {
    return <Card>Loading…</Card>
  }

  if (!quest) {
    return (
      <Card>
        <div data-slot="section-panel" className={sharedStyles.panel}>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <span className={sharedStyles.inlineLabel}>
              <ArrowLeftIcon aria-hidden="true" size={16} weight="bold" />
              <span>Back</span>
            </span>
          </Button>
          <p data-slot="muted-text" className={sharedStyles.muted}>
            Quest not found. It may have been archived or deleted.
          </p>
        </div>
      </Card>
    )
  }

  const questTasks = getQuestTasks(quest.id, tasks)
  const progress = getQuestProgress(quest, tasks, completions)
  const taskViews = questTasks
    .map((task) => ({
      task,
      categories: task.categoryIds
        .map((categoryId) => categories.find((category) => category.id === categoryId))
        .filter((category): category is NonNullable<typeof category> => Boolean(category)),
      isComplete: isQuestTaskComplete(task, completions),
    }))
    .sort((left, right) => left.task.sortOrder - right.task.sortOrder)

  const canComplete = progress.readyToComplete && !quest.completedAt

  return (
    <div data-slot="page" className={styles.page}>
      <div data-slot="page-stack" className={styles.stack}>
        <Card>
          <div data-slot="section-panel" className={sharedStyles.panel}>
            <div data-slot="section-actions" className={sharedStyles.actions}>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                <span className={sharedStyles.inlineLabel}>
                  <ArrowLeftIcon aria-hidden="true" size={16} weight="bold" />
                  <span>Back</span>
                </span>
              </Button>
            </div>
            <div className={styles.questHero}>
              <div className={styles.questCover} aria-hidden="true">
                {quest.imageUrl ? (
                  <img src={quest.imageUrl} alt="" />
                ) : (
                  <div className={styles.questCoverFallback}>{(quest.title.slice(0, 1) || 'Q').toUpperCase()}</div>
                )}
              </div>
              <div className={styles.questSummary}>
                <div className={styles.questHeader}>
                  <h2 data-slot="section-heading" className={sharedStyles.heading}>{quest.title}</h2>
                  <Badge tone={quest.completedAt ? 'sage' : quest.archived ? 'mist' : 'plum'}>
                    {quest.completedAt ? 'Completed' : quest.archived ? 'Archived' : 'Active'}
                  </Badge>
                </div>
                {quest.description ? <p data-slot="muted-text" className={sharedStyles.muted}>{quest.description}</p> : null}
                <div className={styles.questRewards}>
                  <span>
                    <span className={sharedStyles.inlineLabel}>
                      <TrophyIcon aria-hidden="true" size={16} weight="duotone" />
                      <span>{quest.rewardXp} XP</span>
                    </span>
                  </span>
                  <span>{quest.rewardCoins} coins</span>
                </div>
                <ProgressBar value={progress.percentComplete} max={100} />
                <div className={styles.questMeta}>
                  <span>
                    {progress.totalTasks
                      ? `${progress.completedTasks} / ${progress.totalTasks} tasks`
                      : 'No quest tasks yet'}
                  </span>
                  {progress.nextDueDate ? <span>Next due {formatDateLabel(progress.nextDueDate)}</span> : null}
                  {quest.completedAt ? (
                    <span>Completed on {new Date(quest.completedAt).toLocaleDateString()}</span>
                  ) : null}
                </div>
                <div data-slot="action-group" className={styles.questActions}>
                  <Button
                    onClick={() => {
                      setIsCompleting(true)
                      void completeQuest(quest).finally(() => setIsCompleting(false))
                    }}
                    disabled={!canComplete || isCompleting}
                  >
                    <span className={sharedStyles.inlineLabel}>
                      <TrophyIcon aria-hidden="true" size={16} weight="bold" />
                      <span>
                        {quest.completedAt ? 'Reward claimed' : progress.readyToComplete ? 'Claim reward' : 'Finish tasks'}
                      </span>
                    </span>
                  </Button>
                  <Button variant="secondary" onClick={() => navigate('/manage?tab=quests')}>
                    <span className={sharedStyles.inlineLabel}>
                      <GearSixIcon aria-hidden="true" size={16} weight="duotone" />
                      <span>Manage</span>
                    </span>
                  </Button>
                </div>
                {!progress.readyToComplete && !quest.completedAt ? (
                  <p data-slot="muted-text" className={sharedStyles.muted}>
                    Complete every task linked to this quest to unlock the reward.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div data-slot="section-panel" className={sharedStyles.panel}>
            <h2 data-slot="section-heading" className={sharedStyles.heading}>Quest tasks</h2>
            {taskViews.length ? (
              <div className={styles.questTaskList}>
                {taskViews.map((view) => (
                  <div key={view.task.id} className={styles.questTaskRow}>
                    <div>
                      <strong>{view.task.title}</strong>
                      <div className={styles.questTaskMeta}>
                        {view.task.dueDate ? <span>Due {formatDateLabel(view.task.dueDate)}</span> : null}
                        <span>{view.task.cadence === 'none' ? 'One-off task' : `${view.task.cadence} cadence`}</span>
                      </div>
                    </div>
                    <div className={styles.questTaskBadges}>
                      {view.categories.length ? (
                        view.categories.map((category) => (
                          <Badge key={category.id} tone={getCategoryTone(category.colorKey)}>
                            {category.name}
                          </Badge>
                        ))
                      ) : (
                        <Badge tone={UNCATEGORIZED_TONE}>{UNCATEGORIZED_LABEL}</Badge>
                      )}
                      <Badge tone={view.isComplete ? 'sage' : 'mist'}>
                        {view.isComplete ? 'Complete' : 'In progress'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p data-slot="muted-text" className={sharedStyles.muted}>
                No tasks are linked to this quest yet. Tag tasks in Manage → Tasks with this quest ID to group them.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
