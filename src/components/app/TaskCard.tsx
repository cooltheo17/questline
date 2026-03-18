import { motion } from 'framer-motion'
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check'
import type { ReactNode } from 'react'
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
  const completedIds = new Set(completion?.completedSubtaskIds ?? [])

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={(event) => {
        if (onDragOver) {
          event.preventDefault()
          onDragOver()
        }
      }}
      onDrop={(event) => {
        if (onDrop) {
          event.preventDefault()
          onDrop()
        }
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
      <div className={styles.row}>
        <div className={styles.titleWrap}>
          <div className={styles.title}>{task.title}</div>
          {task.notes ? <div className={styles.notes}>{task.notes}</div> : null}
        </div>
        <div className={styles.tagList}>
          {categories.map((category) => (
            <Badge key={category.id} tone={getCategoryTone(category.colorKey)}>
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      {task.subtasks.length ? (
        <div className={styles.subtasks}>
          {task.subtasks.map((subtask) => (
            <Checkbox
              key={subtask.id}
              checked={completedIds.has(subtask.id)}
              disabled={isCompleted}
              onCheckedChange={() => {
                void onToggleSubtask(subtask.id)
              }}
              label={subtask.title}
            />
          ))}
        </div>
      ) : null}

      <div className={styles.footer}>
        <div className={styles.badges}>
          <Badge tone="brass">
            {reward.xp} XP · {reward.coins} coins
          </Badge>
          <Badge tone="slate">{task.cadence === 'none' ? 'One-off' : task.cadence}</Badge>
        </div>
        {actionSlot ? (
          actionSlot
        ) : task.subtasks.length === 0 ? (
          <Button disabled={isCompleted} onClick={() => void onComplete()}>
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
