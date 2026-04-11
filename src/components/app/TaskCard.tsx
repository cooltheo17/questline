import { motion } from 'framer-motion'
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check'
import { CoinsIcon } from '@phosphor-icons/react/dist/csr/Coins'
import type { DragEvent as ReactDragEvent, ReactNode } from 'react'
import { Badge, Button, Checkbox } from '../primitives/Primitives'
import { getCategoryTone } from '../../domain/categories'
import { getTaskReward } from '../../domain/rewards'
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
  const completedIds = new Set(completion?.completedSubtaskIds ?? [])

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
      draggable={draggable}
      onDragStart={(event) => {
        if (draggable) {
          const dragEvent = event as unknown as ReactDragEvent<HTMLElement>
          const dataTransfer = dragEvent.dataTransfer
          if (dataTransfer) {
            dataTransfer.effectAllowed = 'move'
            dataTransfer.setData('text/plain', task.id)
          }
        }
        onDragStart?.()
      }}
      onDragEnd={onDragEnd}
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
      className={[
        styles.task,
        isCompleted ? styles.completed : '',
        draggable ? styles.draggable : '',
        dragActive ? styles.dragActive : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div data-slot="task-row" className={styles.row}>
        <div data-slot="task-title-wrap" className={styles.titleWrap}>
          <div data-slot="task-title" className={styles.title}>{task.title}</div>
          {task.notes ? <div data-slot="task-notes" className={styles.notes}>{task.notes}</div> : null}
        </div>
        <div data-slot="task-tag-list" className={styles.tagList}>
          {categories.map((category) => (
            <Badge key={category.id} tone={getCategoryTone(category.colorKey)}>
              {category.name}
            </Badge>
          ))}
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
        <div data-slot="task-badges" className={styles.badges}>
          <Badge tone="brass">
            <span className={sharedStyles.inlineLabel}>
              <span>{reward.xp} XP · {reward.coins}</span>
              <CoinsIcon aria-hidden="true" size={15} weight="duotone" />
            </span>
          </Badge>
          <Badge tone="slate">{task.cadence === 'none' ? 'One-off' : task.cadence}</Badge>
        </div>
        {actionSlot ? (
          actionSlot
        ) : task.subtasks.length === 0 ? (
          <Button disabled={isCompleted || isReadOnly} onClick={() => {
            if (isReadOnly) {
              return
            }
            void onComplete()
          }}>
            {isCompleted ? (
              'Claimed'
            ) : (
              <span className={sharedStyles.inlineLabel}>
                <CheckIcon aria-hidden="true" size={16} weight="bold" />
                <span>Mark done</span>
              </span>
            )}
          </Button>
        ) : (
          <Badge>
            {completion?.completedSubtaskIds.length ?? 0}/{task.subtasks.length} steps
          </Badge>
        )}
      </div>
    </motion.article>
  )
}
