import { motion } from 'framer-motion'
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check'
import { CoinsIcon } from '@phosphor-icons/react/dist/csr/Coins'
import { DotsSixVerticalIcon } from '@phosphor-icons/react/dist/csr/DotsSixVertical'
import type { DragEvent as ReactDragEvent, ReactNode } from 'react'
import { Badge, Button, Checkbox } from '../primitives/Primitives'
import { getCategoryTone, UNCATEGORIZED_LABEL, UNCATEGORIZED_TONE } from '../../domain/categories'
import { getTaskReward } from '../../domain/rewards'
import { getCompletedSubtaskCount, getCompletedSubtaskIds } from '../../domain/subtasks'
import { formatCadenceLabel } from '../../domain/taskUi'
import type { Category, CompletionRecord, Task } from '../../domain/types'
import sharedStyles from './Shared.module.css'
import styles from './TaskCard.module.css'

export function TaskCard({
  task,
  categories,
  completion,
  isCompleted,
  readOnly,
  onComplete,
  onToggleSubtask,
  actionSlot,
  draggable,
  dragActive,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: {
  task: Task
  categories: Category[]
  completion?: CompletionRecord
  isCompleted: boolean
  readOnly?: boolean
  onComplete: () => Promise<void>
  onToggleSubtask: (subtaskId: string) => Promise<void>
  actionSlot?: ReactNode
  draggable?: boolean
  dragActive?: boolean
  onDragStart?: () => void
  onDragEnd?: () => void
  onDragOver?: () => void
  onDrop?: () => void
}) {
  const reward = getTaskReward(task)
  const isReadOnly = Boolean(readOnly)
  const completedSubtaskIds = getCompletedSubtaskIds(task, completion)
  const completedIds = new Set(completedSubtaskIds)
  const cadenceLabel = formatCadenceLabel(task.cadence)
  const completedSubtaskCount = getCompletedSubtaskCount(task, completion)
  const subtaskProgressLabel = task.subtasks.length ? `${completedSubtaskCount}/${task.subtasks.length} steps` : null
  const taskClassName = [
    styles.task,
    isCompleted ? styles.completed : '',
    draggable ? styles.draggable : '',
    dragActive ? styles.dragActive : '',
  ]
    .filter(Boolean)
    .join(' ')
  const footerAction = getTaskFooterAction({
    actionSlot,
    isCompleted,
    isReadOnly,
    onComplete,
    hasSubtasks: Boolean(subtaskProgressLabel),
  })
  const handleDragStart = (event: ReactDragEvent<HTMLElement>) => {
    if (!draggable) {
      return
    }

    const dataTransfer = event.dataTransfer
    if (dataTransfer) {
      dataTransfer.effectAllowed = 'move'
      dataTransfer.setData('text/plain', task.id)
    }

    onDragStart?.()
  }

  return (
    <motion.article
      data-slot="task-card"
      data-completed={isCompleted}
      data-draggable={Boolean(draggable)}
      data-drag-active={Boolean(dragActive)}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      onDragOver={(event) => {
        if (!draggable) {
          return
        }

        event.preventDefault()
        const dragEvent = event as unknown as ReactDragEvent<HTMLElement>
        const dataTransfer = dragEvent.dataTransfer
        if (dataTransfer) {
          dataTransfer.dropEffect = 'move'
        }
        onDragOver?.()
      }}
      onDrop={(event) => {
        if (!draggable) {
          return
        }

        event.preventDefault()
        onDrop?.()
      }}
      className={taskClassName}
    >
      <div data-slot="task-row" className={styles.row}>
        <div className={styles.primary}>
          {draggable ? (
            <button
              type="button"
              aria-label={`Drag to reorder ${task.title}`}
              title="Drag to reorder"
              data-slot="task-drag-handle"
              className={styles.dragHandle}
              draggable
              onDragStart={(event) => handleDragStart(event as unknown as ReactDragEvent<HTMLElement>)}
              onDragEnd={onDragEnd}
            >
              <DotsSixVerticalIcon aria-hidden="true" size={18} weight="bold" />
            </button>
          ) : null}
          <div data-slot="task-title-wrap" className={styles.titleWrap}>
            <div data-slot="task-title" className={styles.title}>{task.title}</div>
            {task.notes ? <div data-slot="task-notes" className={styles.notes}>{task.notes}</div> : null}
          </div>
        </div>
        <div data-slot="task-tag-list" className={styles.tagList}>
          {categories.length ? (
            categories.map((category) => (
              <Badge key={category.id} tone={getCategoryTone(category.colorKey)}>
                {category.name}
              </Badge>
            ))
          ) : (
            <Badge tone={UNCATEGORIZED_TONE}>{UNCATEGORIZED_LABEL}</Badge>
          )}
        </div>
      </div>

      {task.subtasks.length ? (
        <div data-slot="task-subtasks" className={styles.subtasks}>
          {task.subtasks.map((subtask) => (
            <Checkbox
              key={subtask.id}
              checked={completedIds.has(subtask.id)}
              disabled={isCompleted || isReadOnly}
              onCheckedChange={() => {
                if (isReadOnly) {
                  return
                }
                void onToggleSubtask(subtask.id)
              }}
              label={subtask.title}
            />
          ))}
        </div>
      ) : null}

      <div data-slot="task-footer" className={styles.footer}>
        <div data-slot="task-meta" className={styles.meta}>
          <span className={[styles.metaItem, styles.metaPill, styles.metaReward].join(' ')}>
            <span className={sharedStyles.inlineLabel}>
              <span>{reward.xp} XP · {reward.coins}</span>
              <CoinsIcon aria-hidden="true" size={15} weight="duotone" />
            </span>
          </span>
          <span className={[styles.metaItem, styles.metaPill].join(' ')}>{cadenceLabel}</span>
          {subtaskProgressLabel ? (
            <span className={[styles.metaItem, styles.metaPill].join(' ')}>{subtaskProgressLabel}</span>
          ) : null}
        </div>
        {footerAction}
      </div>
    </motion.article>
  )
}

function getTaskFooterAction({
  actionSlot,
  isCompleted,
  isReadOnly,
  onComplete,
  hasSubtasks,
}: {
  actionSlot: ReactNode
  isCompleted: boolean
  isReadOnly: boolean
  onComplete: () => Promise<void>
  hasSubtasks: boolean
}) {
  if (actionSlot) {
    return actionSlot
  }

  if (!hasSubtasks) {
    return (
      <Button
        disabled={isCompleted || isReadOnly}
        onClick={() => {
          if (!isReadOnly) {
            void onComplete()
          }
        }}
      >
        {isCompleted ? (
          'Claimed'
        ) : (
          <span className={sharedStyles.inlineLabel}>
            <CheckIcon aria-hidden="true" size={16} weight="bold" />
            <span>Mark done</span>
          </span>
        )}
      </Button>
    )
  }

  return null
}
