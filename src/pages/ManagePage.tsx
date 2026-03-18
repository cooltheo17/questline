import { useEffect, useRef, useState } from 'react'
import { ArchiveIcon } from '@phosphor-icons/react/dist/csr/Archive'
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { DatabaseIcon } from '@phosphor-icons/react/dist/csr/Database'
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple'
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { TagIcon } from '@phosphor-icons/react/dist/csr/Tag'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/csr/UploadSimple'
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
  const scrollPositionRef = useRef(0)
  const hasMountedTabRef = useRef(false)
  const categoryOptions = categories.filter((category) => !category.archived)

  useEffect(() => {
    if (!hasMountedTabRef.current) {
      hasMountedTabRef.current = true
      return
    }

    const frame = window.requestAnimationFrame(() => {
      try {
        window.scrollTo({ top: scrollPositionRef.current })
      } catch {
        // jsdom does not implement scrolling
      }
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeTab])

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
        onValueChange={(value) => {
          scrollPositionRef.current = window.scrollY
          setActiveTab(value)
        }}
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
                  <h2 className={sharedStyles.heading}>
                    <span className={sharedStyles.headingInline}>
                      <TagIcon aria-hidden="true" size={20} weight="duotone" />
                      <span>Categories</span>
                    </span>
                  </h2>
                </div>
                <Field label="New category">
                  <TextField
                    placeholder="Learning"
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                  />
                </Field>
                <Field label="Color">
                  <div className={styles.smallGrid}>
                    <div className={styles.categoryPreview}>
                      <Badge tone={newCategoryColor}>{newCategoryName.trim() || 'New category'}</Badge>
                    </div>
                    <ColorPicker value={newCategoryColor} onChange={setNewCategoryColor} />
                  </div>
                </Field>
                <Button type="submit">
                  <span className={sharedStyles.inlineLabel}>
                    <PlusIcon aria-hidden="true" size={16} weight="bold" />
                    <span>Create category</span>
                  </span>
                </Button>
              </form>
            </Card>

            <Card>
              <div className={sharedStyles.list}>
                {categories.map((category) => (
                  <div key={category.id} className={styles.smallGrid}>
                    <div className={styles.row}>
                      <Badge tone={category.colorKey}>{category.name}</Badge>
                      {category.archived ? <span className={sharedStyles.muted}>Archived</span> : null}
                    </div>
                    <TextField
                      value={category.name}
                      onChange={(event) =>
                        void updateCategory({ ...category, name: event.target.value })
                      }
                    />
                    <ColorPicker
                      value={category.colorKey}
                      onChange={(value) =>
                        void updateCategory({ ...category, colorKey: value })
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
                        <span className={sharedStyles.inlineLabel}>
                          {category.archived ? (
                            <ArrowCounterClockwiseIcon aria-hidden="true" size={15} weight="bold" />
                          ) : (
                            <ArchiveIcon aria-hidden="true" size={15} weight="duotone" />
                          )}
                          <span>{category.archived ? 'Restore' : 'Archive'}</span>
                        </span>
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
                      {task.cadence}
                      {task.dueDate ? ` · due ${task.dueDate}` : ''}
                      {' · '}
                      {task.categoryIds.length} tags · {task.subtasks.length} subtasks
                    </p>
                  </div>
                  <div className={sharedStyles.actions}>
                    <Button size="sm" variant="secondary" onClick={() => setEditingTask(task)}>
                      <span className={sharedStyles.inlineLabel}>
                        <PencilSimpleIcon aria-hidden="true" size={15} weight="bold" />
                        <span>Edit</span>
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
                          void deleteTask(task.id)
                        }
                      }}
                    >
                      <span className={sharedStyles.inlineLabel}>
                        <TrashIcon aria-hidden="true" size={15} weight="bold" />
                        <span>Delete</span>
                      </span>
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
                      <span className={sharedStyles.inlineLabel}>
                        <PencilSimpleIcon aria-hidden="true" size={15} weight="bold" />
                        <span>Edit</span>
                      </span>
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => void deleteReward(reward.id)}>
                      <span className={sharedStyles.inlineLabel}>
                        <TrashIcon aria-hidden="true" size={15} weight="bold" />
                        <span>Delete</span>
                      </span>
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
                    <div
                      className={styles.themePalette}
                      aria-hidden="true"
                      style={{ background: candidate.components.shell.pageBackground }}
                    >
                      <div className={styles.themePaletteRow}>
                        <span
                          className={[styles.themePaletteSwatch, styles.themePaletteSwatchWide].join(' ')}
                          style={{ background: candidate.primitives.color.cloud }}
                        />
                        <span
                          className={[styles.themePaletteSwatch, styles.themePaletteSwatchTall].join(' ')}
                          style={{ background: candidate.primitives.color.slate }}
                        />
                      </div>
                      <div className={styles.themePaletteRow}>
                        <span
                          className={styles.themePaletteSwatch}
                          style={{ background: candidate.primitives.color.brass }}
                        />
                        <span
                          className={styles.themePaletteSwatch}
                          style={{ background: candidate.primitives.color.sage }}
                        />
                        <span
                          className={[styles.themePaletteSwatch, styles.themePaletteSwatchAccent].join(' ')}
                          style={{ background: candidate.primitives.color.stone }}
                        />
                      </div>
                    </div>
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
              <h2 className={sharedStyles.heading}>
                <span className={sharedStyles.headingInline}>
                  <DatabaseIcon aria-hidden="true" size={20} weight="duotone" />
                  <span>Backups and reset</span>
                </span>
              </h2>
              <div className={sharedStyles.actions}>
                <Button onClick={() => void handleExport()}>
                  <span className={sharedStyles.inlineLabel}>
                    <DownloadSimpleIcon aria-hidden="true" size={16} weight="bold" />
                    <span>Export JSON</span>
                  </span>
                </Button>
                <Button variant="secondary" onClick={() => importInputRef.current?.click()}>
                  <span className={sharedStyles.inlineLabel}>
                    <UploadSimpleIcon aria-hidden="true" size={16} weight="bold" />
                    <span>Import JSON</span>
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (window.confirm('Reset all local data? This cannot be undone.')) {
                      void resetAllData().then(() => setMessage('All data reset to seed state.'))
                    }
                  }}
                >
                  <span className={sharedStyles.inlineLabel}>
                    <TrashIcon aria-hidden="true" size={16} weight="bold" />
                    <span>Reset everything</span>
                  </span>
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
              dueDate: draft.dueDate,
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
          <Field label="Due date">
            <TextField
              type="date"
              value={draft.dueDate ?? ''}
              onChange={(event) => setDraft({ ...draft, dueDate: event.target.value || undefined })}
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

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className={styles.colorPicker}>
      {categoryColorOptions.map((option) => (
        <button
          key={option.value}
          type="button"
          className={[
            styles.colorOption,
            value === option.value ? styles.colorOptionActive : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onChange(option.value)}
          aria-label={`Use ${option.label}`}
        >
          <span className={[styles.colorSwatch, styles[`colorSwatch${option.label}`]].join(' ')} />
        </button>
      ))}
    </div>
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
