import { useState } from 'react'
import {
  formatTaskReward,
  getDefaultReward,
  getRewardForMode,
  getRewardOverrideForMode,
  getTaskRewardMode,
  type TaskReward,
  type TaskRewardMode,
} from '../../domain/rewards'
import { cadenceOptions, effortOptions } from '../../domain/taskUi'
import type { Category, Quest, Task } from '../../domain/types'
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  Select,
  TextField,
  Textarea,
} from '../../components/primitives/Primitives'
import { updateTask } from '../../data/repository'
import sharedStyles from '../../components/app/Shared.module.css'
import styles from '../Page.module.css'
import { toTaskUpdateInput } from './managePageUtils'

interface TaskEditorDialogProps {
  task: Task | null
  categories: Category[]
  quests: Quest[]
  onClose: () => void
}

export function TaskEditorDialog({
  task,
  categories,
  quests,
  onClose,
}: TaskEditorDialogProps) {
  return (
    <Dialog
      open={Boolean(task)}
      onOpenChange={(open) => !open && onClose()}
      title="Edit task"
      contentClassName={styles.taskDialogContent}
    >
      {task ? (
        <TaskEditorDialogForm
          key={task.id}
          task={task}
          categories={categories}
          quests={quests}
          onClose={onClose}
        />
      ) : null}
    </Dialog>
  )
}

function TaskEditorDialogForm({
  task,
  categories,
  quests,
  onClose,
}: Omit<TaskEditorDialogProps, 'task'> & { task: Task }) {
  const initialRewardState = getTaskRewardMode(task.difficulty, task.rewardOverride)
  const [draft, setDraft] = useState(task)
  const [rewardMode, setRewardMode] = useState<TaskRewardMode>(initialRewardState.mode)
  const [customReward, setCustomReward] = useState<TaskReward>(initialRewardState.customReward)
  const questOptions = [
    { label: 'No quest', value: 'none' },
    ...quests.map((quest) => ({
      label: quest.archived ? `${quest.title} (archived)` : quest.title,
      value: quest.id,
    })),
  ]
  const selectedReward = getRewardForMode(rewardMode, draft.difficulty, customReward)

  function handleEffortChange(value: string) {
    if (value === 'custom') {
      setRewardMode('custom')
      setCustomReward({ xp: 0, coins: 0 })
      return
    }

    const nextDifficulty = value as Task['difficulty']
    setDraft((current) => ({ ...current, difficulty: nextDifficulty }))
    setRewardMode('match_difficulty')
    setCustomReward(getDefaultReward(nextDifficulty))
  }

  return (
    <form
      className={[styles.dialogForm, styles.taskDialogForm].join(' ')}
      onSubmit={(event) => {
        event.preventDefault()
        void updateTask(
          toTaskUpdateInput(draft, getRewardOverrideForMode(rewardMode, draft.difficulty, customReward)),
        ).then(onClose)
      }}
    >
      <Field label="Title">
        <TextField
          value={draft.title}
          onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        />
      </Field>
      <div className={styles.taskMetaGrid}>
        <Field label="Quest tag">
          <>
            <Select
              value={draft.questId ?? 'none'}
              onValueChange={(value) =>
                setDraft({ ...draft, questId: value === 'none' ? undefined : value })
              }
              options={questOptions}
            />
            <span data-slot="muted-text" className={sharedStyles.muted}>
              {draft.questId ? `Quest ID: ${draft.questId}` : 'Not linked to a quest'}
            </span>
          </>
        </Field>
        <Field label="Cadence">
          <Select
            value={draft.cadence}
            onValueChange={(value) => setDraft({ ...draft, cadence: value as Task['cadence'] })}
            options={cadenceOptions}
          />
        </Field>
        <Field label="Due date">
          <TextField
            type="date"
            value={draft.dueDate ?? ''}
            onChange={(event) => setDraft({ ...draft, dueDate: event.target.value || undefined })}
          />
        </Field>
      </div>
      <div className={styles.taskMetaGrid}>
        <Field label="Effort">
          <Select
            value={rewardMode === 'custom' ? 'custom' : draft.difficulty}
            onValueChange={handleEffortChange}
            options={effortOptions}
          />
        </Field>
        <Field label="Reward">
          {rewardMode === 'custom' ? (
            <div className={styles.taskMetaGrid}>
              <TextField
                aria-label="Custom XP"
                inputMode="numeric"
                placeholder="XP"
                value={customReward.xp === 0 ? '' : String(customReward.xp)}
                onChange={(event) =>
                  setCustomReward((current) => ({
                    ...current,
                    xp: Number(event.target.value) || 0,
                  }))
                }
              />
              <TextField
                aria-label="Custom coins"
                inputMode="numeric"
                placeholder="Coins"
                value={customReward.coins === 0 ? '' : String(customReward.coins)}
                onChange={(event) =>
                  setCustomReward((current) => ({
                    ...current,
                    coins: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
          ) : (
            <span data-slot="muted-text" className={sharedStyles.muted}>
              {formatTaskReward(selectedReward)}
            </span>
          )}
        </Field>
      </div>
      <Field label="Categories">
        <div className={styles.taskTagGrid}>
          {categories.map((category) => (
            <Checkbox
              key={category.id}
              checked={draft.categoryIds.includes(category.id)}
              onCheckedChange={(checked) =>
                setDraft({
                  ...draft,
                  categoryIds: checked
                    ? [...new Set([...draft.categoryIds, category.id])]
                    : draft.categoryIds.filter((id) => id !== category.id),
                })
              }
              label={category.name}
            />
          ))}
        </div>
      </Field>
      <div className={styles.taskDetailGrid}>
        <Field label="Notes">
          <Textarea
            className={styles.compactTextarea}
            value={draft.notes ?? ''}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          />
        </Field>
        <Field label="Subtasks">
          <Textarea
            className={styles.compactTextarea}
            value={draft.subtasks.map((subtask) => subtask.title).join('\n')}
            onChange={(event) =>
              setDraft({
                ...draft,
                subtasks: event.target.value
                  .split('\n')
                  .map((title, index) => ({
                    id: `${draft.id}-${index}`,
                    title,
                    sortOrder: index,
                  }))
                  .filter((subtask) => subtask.title.trim()),
              })
            }
          />
        </Field>
      </div>
      <div className={styles.dialogActionRow}>
        <Checkbox
          checked={draft.active}
          onCheckedChange={(checked) => setDraft({ ...draft, active: checked })}
          label="Task is active"
        />
        <Button type="submit">Save task</Button>
      </div>
    </form>
  )
}
