import { useEffect, useRef, useState } from 'react'
import { ArchiveIcon } from '@phosphor-icons/react/dist/csr/Archive'
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check'
import { DatabaseIcon } from '@phosphor-icons/react/dist/csr/Database'
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple'
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { TagIcon } from '@phosphor-icons/react/dist/csr/Tag'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/csr/UploadSimple'
import { FlagBannerIcon } from '@phosphor-icons/react/dist/csr/FlagBanner'
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
  createQuest,
  deleteCategory,
  deleteBulkImport,
  deleteQuest,
  deleteReward,
  deleteTask,
  importSnapshot,
  resetAllData,
  updateCategory,
  updateQuest,
  updateReward,
  updateTask,
} from '../data/repository'
import { useAppCollectionsContext } from '../hooks/AppCollectionsContext'
import { useTheme } from '../theme/themeContext'
import type { Category, Quest, RewardItem, Task } from '../domain/types'
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

function createQuestFormState() {
  return {
    title: '',
    description: '',
    rewardXp: 100,
    rewardCoins: 25,
    imageUrl: '',
  }
}

function formatBulkImportLabel(createdAt: string): string {
  if (!createdAt) {
    return 'Bulk import'
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(createdAt))
}

function getBulkImportSummaries(tasks: Task[], quests: Quest[], categories: Category[]) {
  const batchMap = new Map<
    string,
    {
      id: string
      createdAt: string
      taskCount: number
      questCount: number
      categoryCount: number
    }
  >()

  for (const task of tasks) {
    if (!task.importBatchId) {
      continue
    }

    const current = batchMap.get(task.importBatchId) ?? {
      id: task.importBatchId,
      createdAt: task.createdAt,
      taskCount: 0,
      questCount: 0,
      categoryCount: 0,
    }

    current.taskCount += 1
    if (task.createdAt < current.createdAt) {
      current.createdAt = task.createdAt
    }
    batchMap.set(task.importBatchId, current)
  }

  for (const quest of quests) {
    if (!quest.importBatchId) {
      continue
    }

    const current = batchMap.get(quest.importBatchId) ?? {
      id: quest.importBatchId,
      createdAt: quest.createdAt,
      taskCount: 0,
      questCount: 0,
      categoryCount: 0,
    }

    current.questCount += 1
    if (quest.createdAt < current.createdAt) {
      current.createdAt = quest.createdAt
    }
    batchMap.set(quest.importBatchId, current)
  }

  for (const category of categories) {
    if (!category.importBatchId) {
      continue
    }

    const current = batchMap.get(category.importBatchId) ?? {
      id: category.importBatchId,
      createdAt: '',
      taskCount: 0,
      questCount: 0,
      categoryCount: 0,
    }

    current.categoryCount += 1
    batchMap.set(category.importBatchId, current)
  }

  return [...batchMap.values()]
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .map((batch) => ({
      ...batch,
      label: `Bulk import · ${formatBulkImportLabel(batch.createdAt)}`,
    }))
}

export function ManagePage() {
  const { categories, tasks, quests, rewards } = useAppCollectionsContext()
  const { theme, themes, setThemeId } = useTheme()
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window === 'undefined') {
      return 'categories'
    }

    return new URLSearchParams(window.location.search).get('tab') ?? 'categories'
  })
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('slate')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null)
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null)
  const [message, setMessage] = useState('')
  const [newQuest, setNewQuest] = useState(() => createQuestFormState())
  const importInputRef = useRef<HTMLInputElement>(null)
  const scrollPositionRef = useRef(0)
  const hasMountedTabRef = useRef(false)
  const categoryOptions = categories.filter((category) => !category.archived)
  const sortedTasks = [...tasks].sort((left, right) => {
    const createdAtComparison = left.createdAt.localeCompare(right.createdAt)

    if (createdAtComparison !== 0) {
      return createdAtComparison
    }

    return left.sortOrder - right.sortOrder
  })
  const bulkImportBatches = getBulkImportSummaries(tasks, quests, categories)

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

  function retireTask(task: Task) {
    return updateTask({
      id: task.id,
      title: task.title,
      categoryIds: task.categoryIds,
      questId: task.questId,
      dueDate: task.dueDate,
      cadence: task.cadence,
      difficulty: task.difficulty,
      notes: task.notes,
      rewardOverride: task.rewardOverride,
      subtasks: task.subtasks.map((subtask) => subtask.title),
      active: false,
    })
  }

  return (
    <div data-slot="page" className={styles.page}>
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          scrollPositionRef.current = window.scrollY
          setActiveTab(value)
        }}
        items={[
          { label: 'Categories', value: 'categories' },
          { label: 'Tasks', value: 'tasks' },
          { label: 'Quests', value: 'quests' },
          { label: 'Rewards', value: 'rewards' },
          { label: 'Appearance', value: 'appearance' },
          { label: 'Data', value: 'data' },
        ]}
      >
        <TabPanel value="categories">
          <div data-slot="page-columns" className={styles.columns}>
            <Card>
              <form
                data-slot="section-panel"
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
                  <h2 data-slot="section-heading" className={sharedStyles.heading}>
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
              <div data-slot="category-list" className={sharedStyles.list}>
                {categories.map((category) => (
                  <div data-slot="category-item" key={category.id} className={styles.smallGrid}>
                    <div className={styles.row}>
                      <Badge tone={category.colorKey}>{category.name}</Badge>
                      {category.archived ? <span data-slot="muted-text" className={sharedStyles.muted}>Archived</span> : null}
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
                    <div data-slot="action-group" className={sharedStyles.actions}>
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
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Delete "${category.name}"? Tasks using only this category will become uncategorized. This cannot be undone.`,
                            )
                          ) {
                            void deleteCategory(category.id)
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
          </div>
        </TabPanel>

        <TabPanel value="tasks">
          <div className={styles.stack}>
            {bulkImportBatches.length ? (
              <Card>
                <div data-slot="stack-list" className={sharedStyles.list}>
                  <div className={styles.row}>
                    <div>
                      <strong>Bulk imports</strong>
                    </div>
                  </div>
                  {bulkImportBatches.map((batch) => (
                    <div key={batch.id} className={styles.row}>
                      <div>
                        <strong>{batch.label}</strong>
                        <p data-slot="muted-text" className={sharedStyles.muted}>
                          {batch.taskCount} tasks · {batch.questCount} quests · {batch.categoryCount} categories
                        </p>
                      </div>
                      <div data-slot="action-group" className={sharedStyles.actions}>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (window.confirm(`Remove "${batch.label}" and everything it imported? This cannot be undone.`)) {
                              void deleteBulkImport(batch.id)
                            }
                          }}
                        >
                          <span className={sharedStyles.inlineLabel}>
                            <TrashIcon aria-hidden="true" size={15} weight="bold" />
                            <span>Remove batch</span>
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}

            <Card>
              <div data-slot="stack-list" className={sharedStyles.list}>
                <div className={styles.row}>
                  <div>
                    <strong>Tasks</strong>
                  </div>
                </div>
                {sortedTasks.map((task) => (
                  <div key={task.id} className={styles.row}>
                    <div>
                      <strong>{task.title}</strong>
                      <p data-slot="muted-text" className={sharedStyles.muted}>
                        {task.cadence}
                        {task.dueDate ? ` · due ${task.dueDate}` : ''}
                        {' · '}
                        {task.categoryIds.length === 0 ? 'Uncategorized' : `${task.categoryIds.length} categories`}
                        {' · '}
                        {task.subtasks.length} subtasks
                        {task.importBatchId ? ' · bulk import' : ''}
                        {!task.active ? ' · completed' : ''}
                      </p>
                    </div>
                    <div data-slot="action-group" className={sharedStyles.actions}>
                      {task.cadence !== 'none' && task.active ? (
                        <Button size="sm" variant="secondary" onClick={() => void retireTask(task)}>
                          <span className={sharedStyles.inlineLabel}>
                            <CheckIcon aria-hidden="true" size={15} weight="bold" />
                            <span>Complete</span>
                          </span>
                        </Button>
                      ) : null}
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
          </div>
        </TabPanel>

        <TabPanel value="quests">
          <div data-slot="page-columns" className={styles.columns}>
            <Card>
              <form
                data-slot="section-panel"
                className={sharedStyles.panel}
                onSubmit={(event) => {
                  event.preventDefault()
                  if (!newQuest.title.trim()) {
                    return
                  }
                  void createQuest(newQuest).then(() => setNewQuest(createQuestFormState()))
                }}
              >
                <div>
                  <h2 data-slot="section-heading" className={sharedStyles.heading}>
                    <span className={sharedStyles.headingInline}>
                      <FlagBannerIcon aria-hidden="true" size={20} weight="duotone" />
                      <span>Quests</span>
                    </span>
                  </h2>
                </div>
                <Field label="Title">
                  <TextField
                    placeholder="30-day writing challenge"
                    value={newQuest.title}
                    onChange={(event) => setNewQuest((current) => ({ ...current, title: event.target.value }))}
                  />
                </Field>
                <Field label="Description">
                  <Textarea
                    placeholder="Why this quest matters"
                    value={newQuest.description}
                    onChange={(event) =>
                      setNewQuest((current) => ({ ...current, description: event.target.value }))
                    }
                  />
                </Field>
                <div className={styles.smallGrid}>
                  <Field label="Reward XP">
                    <TextField
                      inputMode="numeric"
                      value={String(newQuest.rewardXp)}
                      onChange={(event) =>
                        setNewQuest((current) => ({
                          ...current,
                          rewardXp: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Reward coins">
                    <TextField
                      inputMode="numeric"
                      value={String(newQuest.rewardCoins)}
                      onChange={(event) =>
                        setNewQuest((current) => ({
                          ...current,
                          rewardCoins: Number(event.target.value) || 0,
                        }))
                      }
                    />
                  </Field>
                </div>
                <Field label="Image URL">
                  <TextField
                    placeholder="https://example.com/cover.jpg"
                    value={newQuest.imageUrl}
                    onChange={(event) =>
                      setNewQuest((current) => ({ ...current, imageUrl: event.target.value }))
                    }
                  />
                </Field>
                <Button type="submit">
                  <span className={sharedStyles.inlineLabel}>
                    <PlusIcon aria-hidden="true" size={16} weight="bold" />
                    <span>Create quest</span>
                  </span>
                </Button>
              </form>
            </Card>

            <Card>
              <div data-slot="stack-list" className={sharedStyles.list}>
                {quests.length ? (
                  quests.map((quest) => (
                    <div key={quest.id} className={styles.row}>
                      <div>
                        <strong>{quest.title}</strong>
                        <p data-slot="muted-text" className={sharedStyles.muted}>
                          {quest.rewardXp} XP · {quest.rewardCoins} coins
                          {quest.completedAt ? ' · Completed' : ''}
                          {quest.archived ? ' · Archived' : ''}
                        </p>
                      </div>
                      <div data-slot="action-group" className={sharedStyles.actions}>
                        <Button size="sm" variant="secondary" onClick={() => setEditingQuest(quest)}>
                          <span className={sharedStyles.inlineLabel}>
                            <PencilSimpleIcon aria-hidden="true" size={15} weight="bold" />
                            <span>Edit</span>
                          </span>
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => void updateQuest({ ...quest, archived: !quest.archived })}
                        >
                          <span className={sharedStyles.inlineLabel}>
                            {quest.archived ? (
                              <ArrowCounterClockwiseIcon aria-hidden="true" size={15} weight="bold" />
                            ) : (
                              <ArchiveIcon aria-hidden="true" size={15} weight="duotone" />
                            )}
                            <span>{quest.archived ? 'Restore' : 'Archive'}</span>
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p data-slot="muted-text" className={sharedStyles.muted}>No quests yet.</p>
                )}
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel value="rewards">
          <Card>
            <div data-slot="stack-list" className={sharedStyles.list}>
              {rewards.map((reward) => (
                <div key={reward.id} className={styles.row}>
                  <div>
                    <strong>{reward.title}</strong>
                    <p data-slot="muted-text" className={sharedStyles.muted}>{reward.coinCost} coins</p>
                  </div>
                  <div data-slot="action-group" className={sharedStyles.actions}>
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
          <div className={styles.themeGallery}>
            {themes.map((candidate) => (
              <Card
                key={candidate.id}
                className={[
                  styles.themeCardShell,
                  theme.id === candidate.id ? styles.themeCardActive : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <button
                  data-slot="theme-preview-card"
                  type="button"
                  className={styles.themeCardButton}
                  aria-pressed={theme.id === candidate.id}
                  onClick={() => setThemeId(candidate.id)}
                >
                  <div className={styles.themePreview}>
                    <div
                      className={styles.themeScene}
                      aria-hidden="true"
                      style={{ background: candidate.components.shell.pageBackground }}
                    >
                      <div
                        className={styles.themeSceneFrame}
                        style={{ background: candidate.components.shell.panelBackground }}
                      >
                        <div className={styles.themeSceneToolbar}>
                          <span
                            className={styles.themeSceneDot}
                            style={{ background: candidate.semantic.danger }}
                          />
                          <span
                            className={styles.themeSceneDot}
                            style={{ background: candidate.semantic.warning }}
                          />
                          <span
                            className={styles.themeSceneDot}
                            style={{ background: candidate.semantic.success }}
                          />
                        </div>
                        <div className={styles.themeSceneBody}>
                          <div
                            className={styles.themeSceneFeature}
                            style={{ background: candidate.semantic.surfaceRaised }}
                          >
                            <span
                              className={styles.themeSceneFeatureLine}
                              style={{ background: candidate.semantic.textPrimary }}
                            />
                            <span
                              className={styles.themeSceneFeatureAccent}
                              style={{ background: candidate.components.button.primaryBg }}
                            />
                            <span
                              className={styles.themeSceneFeatureLineSoft}
                              style={{ background: candidate.semantic.textSecondary }}
                            />
                          </div>
                          <div className={styles.themeSceneRail}>
                            <span
                              className={styles.themeSceneTile}
                              style={{ background: candidate.semantic.accent }}
                            />
                            <span
                              className={styles.themeSceneTile}
                              style={{ background: candidate.semantic.warning }}
                            />
                            <span
                              className={styles.themeSceneTile}
                              style={{ background: candidate.semantic.success }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className={styles.themeSwatchRow}>
                        <span
                          className={styles.themeSwatch}
                          style={{ background: candidate.semantic.surfaceRaised }}
                        />
                        <span
                          className={styles.themeSwatch}
                          style={{ background: candidate.semantic.accent }}
                        />
                        <span
                          className={styles.themeSwatch}
                          style={{ background: candidate.semantic.warning }}
                        />
                        <span
                          className={styles.themeSwatch}
                          style={{ background: candidate.components.button.primaryBg }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.themeCardMeta}>
                    <div className={styles.themeCardHeader}>
                      <div>
                        <h2 className={styles.themeCardTitle}>{candidate.meta.name}</h2>
                        <p className={styles.themeCardDescription}>{candidate.meta.description}</p>
                      </div>
                      <span className={styles.themeCardMode}>
                        {candidate.meta.colorScheme === 'dark' ? 'Dark' : 'Light'}
                      </span>
                    </div>
                    {theme.id === candidate.id ? (
                      <span className={styles.themeCardSelected}>
                        <CheckIcon aria-hidden="true" size={14} weight="bold" />
                        <span>Selected</span>
                      </span>
                    ) : null}
                  </div>
                </button>
              </Card>
            ))}
          </div>
        </TabPanel>

        <TabPanel value="data">
          <Card>
            <div data-slot="section-panel" className={sharedStyles.panel}>
              <h2 data-slot="section-heading" className={sharedStyles.heading}>
                <span className={sharedStyles.headingInline}>
                  <DatabaseIcon aria-hidden="true" size={20} weight="duotone" />
                  <span>Backups and reset</span>
                </span>
              </h2>
              <div data-slot="action-group" className={sharedStyles.actions}>
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
              {message ? <p data-slot="muted-text" className={sharedStyles.muted}>{message}</p> : null}
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
        quests={quests}
        onClose={() => setEditingTask(null)}
      />
      <RewardEditorDialog reward={editingReward} onClose={() => setEditingReward(null)} />
      <QuestEditorDialog quest={editingQuest} onClose={() => setEditingQuest(null)} />
    </div>
  )
}

function TaskEditorDialog({
  task,
  categories,
  quests,
  onClose,
}: {
  task: Task | null
  categories: Array<{ id: string; name: string; colorKey: string }>
  quests: Quest[]
  onClose: () => void
}) {
  const [draft, setDraft] = useState<Task | null>(null)
  const questOptions = [
    { label: 'No quest', value: 'none' },
    ...quests.map((quest) => ({
      label: quest.archived ? `${quest.title} (archived)` : quest.title,
      value: quest.id,
    })),
  ]

  useEffect(() => {
    setDraft(task)
  }, [task])

  return (
    <Dialog
      open={Boolean(task && draft)}
      onOpenChange={(open) => !open && onClose()}
      title="Edit task"
      contentClassName={styles.taskDialogContent}
    >
      {draft ? (
        <form
          className={[styles.dialogForm, styles.taskDialogForm].join(' ')}
          onSubmit={(event) => {
            event.preventDefault()
            void updateTask({
              id: draft.id,
              title: draft.title,
              categoryIds: draft.categoryIds,
              questId: draft.questId,
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
            <Field label="Difficulty">
              <Select
                value={draft.difficulty}
                onValueChange={(value) =>
                  setDraft({ ...draft, difficulty: value as Task['difficulty'] })
                }
                options={difficultyOptions}
              />
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

function QuestEditorDialog({
  quest,
  onClose,
}: {
  quest: Quest | null
  onClose: () => void
}) {
  const [draft, setDraft] = useState<Quest | null>(null)

  useEffect(() => {
    setDraft(quest)
  }, [quest])

  return (
    <Dialog open={Boolean(quest && draft)} onOpenChange={(open) => !open && onClose()} title="Edit quest">
      {draft ? (
        <form
          className={styles.dialogForm}
          onSubmit={(event) => {
            event.preventDefault()
            void updateQuest({
              id: draft.id,
              title: draft.title,
              description: draft.description,
              imageUrl: draft.imageUrl,
              rewardXp: draft.rewardXp,
              rewardCoins: draft.rewardCoins,
              archived: draft.archived,
              completedAt: draft.completedAt,
            }).then(onClose)
          }}
        >
          <Field label="Title">
            <TextField
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={draft.description ?? ''}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </Field>
          <Field label="Reward XP">
            <TextField
              inputMode="numeric"
              value={String(draft.rewardXp)}
              onChange={(event) =>
                setDraft({ ...draft, rewardXp: Number(event.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Reward coins">
            <TextField
              inputMode="numeric"
              value={String(draft.rewardCoins)}
              onChange={(event) =>
                setDraft({ ...draft, rewardCoins: Number(event.target.value) || 0 })
              }
            />
          </Field>
          <Field label="Image URL">
            <TextField
              value={draft.imageUrl ?? ''}
              onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })}
            />
          </Field>
          <Checkbox
            checked={!draft.archived}
            onCheckedChange={(checked) => setDraft({ ...draft, archived: !checked })}
            label="Quest is active"
          />
          {draft.completedAt ? (
            <p data-slot="muted-text" className={sharedStyles.muted}>
              Completed on {new Date(draft.completedAt).toLocaleDateString()}
            </p>
          ) : null}
          <div data-slot="action-group" className={sharedStyles.actions}>
            <Button type="submit">Save quest</Button>
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    `Delete "${draft.title}"? Linked tasks will stay, but they will be removed from this quest. This cannot be undone.`,
                  )
                ) {
                  void deleteQuest(draft.id).then(onClose)
                }
              }}
            >
              <span className={sharedStyles.inlineLabel}>
                <TrashIcon aria-hidden="true" size={16} weight="bold" />
                <span>Delete quest</span>
              </span>
            </Button>
          </div>
        </form>
      ) : null}
    </Dialog>
  )
}
