import { useEffect, useRef, useState } from 'react'
import { categoryColorOptions } from '../domain/categories'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Field,
  Select,
  TabPanel,
  Tabs,
  TextField,
  Textarea,
} from '../components/primitives/Primitives'
import { exportSnapshot } from '../data/backup'
import {
  createCategory,
  deleteReward,
  deleteTask,
  importSnapshot,
  resetAllData,
  updateCategory,
  updateReward,
  updateTask,
} from '../data/repository'
import { useAppCollections } from '../hooks/useAppCollections'
import { useTheme } from '../theme/themeContext'
import type { RewardItem, Task } from '../domain/types'
import styles from './Page.module.css'
import sharedStyles from '../components/app/Shared.module.css'

const cadenceOptions = [
  { label: 'One-off', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

const difficultyOptions = [
  { label: 'Tiny', value: 'tiny' },
  { label: 'Small', value: 'small' },
  { label: 'Medium', value: 'medium' },
  { label: 'Large', value: 'large' },
]

export function ManagePage() {
  const { categories, tasks, rewards } = useAppCollections()
  const { theme, themes, setThemeId } = useTheme()
  const [activeTab, setActiveTab] = useState('categories')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('slate')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null)
  const [message, setMessage] = useState('')
  const importInputRef = useRef<HTMLInputElement>(null)
  const categoryOptions = categories.filter((category) => !category.archived)

  async function handleExport() {
    const snapshot = await exportSnapshot()
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `questline-backup-${snapshot.exportedAt.slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    setMessage('Backup exported.')
  }

  return (
    <div className={styles.page}>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        items={[
          { label: 'Categories', value: 'categories' },
          { label: 'Tasks', value: 'tasks' },
          { label: 'Rewards', value: 'rewards' },
          { label: 'Appearance', value: 'appearance' },
          { label: 'Data', value: 'data' },
        ]}
      >
        <TabPanel value="categories">
          <div className={styles.columns}>
            <Card>
              <form
                className={sharedStyles.panel}
                onSubmit={(event) => {
                  event.preventDefault()
                  void createCategory({
                    name: newCategoryName,
                    colorKey: newCategoryColor,
                  }).then(() => {
                    setNewCategoryName('')
                    setNewCategoryColor('slate')
                  })
                }}
              >
                <div>
                  <h2 className={sharedStyles.heading}>Categories</h2>
                </div>
                <Field label="New category">
                  <TextField
                    placeholder="Learning"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                  />
                </Field>
                <Field label="Color">
                  <Select
                    value={newCategoryColor}
                    onValueChange={setNewCategoryColor}
                    options={categoryColorOptions.map((option) => ({
                      label: option.label,
                      value: option.value,
                    }))}
                  />
                </Field>
                <Button type="submit">Create category</Button>
              </form>
            </Card>

            <Card>
              <div className={sharedStyles.list}>
                {categories.map((category) => (
                  <div key={category.id} className={styles.smallGrid}>
                    <div className={styles.row}>
                      <strong>{category.name}</strong>
                      <Badge tone={category.colorKey}>{category.archived ? 'Archived' : category.colorKey}</Badge>
                    </div>
                    <Select
                      value={category.colorKey}
                      onValueChange={(value) =>
                        void updateCategory({ ...category, colorKey: value })
                      }
                      options={categoryColorOptions.map((option) => ({
                        label: option.label,
                        value: option.value,
                      }))}
                    />
                    <TextField
                      value={category.name}
                      onChange={(event) =>
                        void updateCategory({ ...category, name: event.target.value })
                      }
                    />
                    <div className={sharedStyles.actions}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          void updateCategory({ ...category, archived: !category.archived })
                        }
                      >
                        {category.archived ? 'Restore' : 'Archive'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel value="tasks">
          <Card>
            <div className={sharedStyles.list}>
              {tasks.map((task) => (
                <div key={task.id} className={styles.row}>
                  <div>
                    <strong>{task.title}</strong>
                    <p className={sharedStyles.muted}>
                      {task.cadence} · {task.categoryIds.length} tags · {task.subtasks.length} subtasks
                    </p>
                  </div>
                  <div className={sharedStyles.actions}>
                    <Button size="sm" variant="secondary" onClick={() => setEditingTask(task)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => void deleteTask(task.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>

        <TabPanel value="rewards">
          <Card>
            <div className={sharedStyles.list}>
              {rewards.map((reward) => (
                <div key={reward.id} className={styles.row}>
                  <div>
                    <strong>{reward.title}</strong>
                    <p className={sharedStyles.muted}>{reward.coinCost} coins</p>
                  </div>
                  <div className={sharedStyles.actions}>
                    <Button size="sm" variant="secondary" onClick={() => setEditingReward(reward)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => void deleteReward(reward.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabPanel>

        <TabPanel value="appearance">
          <div className={styles.columns}>
            {themes.map((candidate) => (
              <Card
                key={candidate.id}
                className={[
                  styles.themeCard,
                  theme.id === candidate.id ? styles.themeCardActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <button type="button" className={styles.themeCard} onClick={() => setThemeId(candidate.id)}>
                  <div className={styles.themePreview}>
                    <img src={candidate.assets.hero} alt={candidate.meta.name} />
                  </div>
                  <div>
                    <h2 className={sharedStyles.heading}>{candidate.meta.name}</h2>
                    <p className={sharedStyles.muted}>{candidate.meta.description}</p>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        </TabPanel>

        <TabPanel value="data">
          <Card>
            <div className={sharedStyles.panel}>
              <h2 className={sharedStyles.heading}>Backups and reset</h2>
              <div className={sharedStyles.actions}>
                <Button onClick={() => void handleExport()}>Export JSON</Button>
                <Button variant="secondary" onClick={() => importInputRef.current?.click()}>
                  Import JSON
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (window.confirm('Reset all local data? This cannot be undone.')) {
                      void resetAllData().then(() => setMessage('All data reset to seed state.'))
                    }
                  }}
                >
                  Reset everything
                </Button>
              </div>
              {message ? <p className={sharedStyles.muted}>{message}</p> : null}
              <input
                ref={importInputRef}
                hidden
                type="file"
                accept="application/json"
                onChange={(event) => {
                  const file = event.target.files?.[0]

                  if (!file) {
                    return
                  }

                  void file.text().then(importSnapshot).then(() => setMessage('Backup imported.'))
                }}
              />
            </div>
          </Card>
        </TabPanel>
      </Tabs>

      <TaskEditorDialog
        task={editingTask}
        categories={categoryOptions}
        onClose={() => setEditingTask(null)}
      />
      <RewardEditorDialog reward={editingReward} onClose={() => setEditingReward(null)} />
    </div>
  )
}

function TaskEditorDialog({
  task,
  categories,
  onClose,
}: {
  task: Task | null
  categories: Array<{ id: string; name: string; colorKey: string }>
  onClose: () => void
}) {
  const [draft, setDraft] = useState<Task | null>(null)

  useEffect(() => {
    setDraft(task)
  }, [task])

  return (
    <Dialog open={Boolean(task && draft)} onOpenChange={(open) => !open && onClose()} title="Edit task">
      {draft ? (
        <form
          className={styles.dialogForm}
          onSubmit={(event) => {
            event.preventDefault()
            void updateTask({
              id: draft.id,
              title: draft.title,
              categoryIds: draft.categoryIds,
              cadence: draft.cadence,
              difficulty: draft.difficulty,
              notes: draft.notes,
              rewardOverride: draft.rewardOverride,
              subtasks: draft.subtasks.map((subtask) => subtask.title),
              active: draft.active,
            }).then(onClose)
          }}
        >
          <Field label="Title">
            <TextField
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </Field>
          <Field label="Tags">
            <div className={styles.smallGrid}>
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
          <Field label="Cadence">
            <Select
              value={draft.cadence}
              onValueChange={(value) => setDraft({ ...draft, cadence: value as Task['cadence'] })}
              options={cadenceOptions}
            />
          </Field>
          <Field label="Difficulty">
            <Select
              value={draft.difficulty}
              onValueChange={(value) =>
                setDraft({ ...draft, difficulty: value as Task['difficulty'] })
              }
              options={difficultyOptions}
            />
          </Field>
          <Field label="Notes">
            <Textarea
              value={draft.notes ?? ''}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            />
          </Field>
          <Field label="Subtasks">
            <Textarea
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
          <Checkbox
            checked={draft.active}
            onCheckedChange={(checked) => setDraft({ ...draft, active: checked })}
            label="Task is active"
          />
          <Button type="submit">Save task</Button>
        </form>
      ) : null}
    </Dialog>
  )
}

function RewardEditorDialog({
  reward,
  onClose,
}: {
  reward: RewardItem | null
  onClose: () => void
}) {
  const [draft, setDraft] = useState<RewardItem | null>(null)

  useEffect(() => {
    setDraft(reward)
  }, [reward])

  return (
    <Dialog open={Boolean(reward && draft)} onOpenChange={(open) => !open && onClose()} title="Edit reward">
      {draft ? (
        <form
          className={styles.dialogForm}
          onSubmit={(event) => {
            event.preventDefault()
            void updateReward({
              id: draft.id,
              title: draft.title,
              coinCost: draft.coinCost,
              notes: draft.notes,
              link: draft.link,
              repeatable: draft.repeatable,
              archived: draft.archived,
            }).then(onClose)
          }}
        >
          <Field label="Title">
            <TextField
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </Field>
          <Field label="Coin cost">
            <TextField
              inputMode="numeric"
              value={String(draft.coinCost)}
              onChange={(event) =>
                setDraft({ ...draft, coinCost: Number(event.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Notes">
            <Textarea
              value={draft.notes ?? ''}
              onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            />
          </Field>
          <Field label="Link">
            <TextField
              value={draft.link ?? ''}
              onChange={(event) => setDraft({ ...draft, link: event.target.value })}
            />
          </Field>
          <Checkbox
            checked={draft.repeatable}
            onCheckedChange={(checked) => setDraft({ ...draft, repeatable: checked })}
            label="Repeatable reward"
          />
          <Checkbox
            checked={!draft.archived}
            onCheckedChange={(checked) => setDraft({ ...draft, archived: !checked })}
            label="Reward is active"
          />
          <Button type="submit">Save reward</Button>
        </form>
      ) : null}
    </Dialog>
  )
}
