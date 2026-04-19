import { useState } from 'react'
import { BracketsCurlyIcon } from '@phosphor-icons/react/dist/csr/BracketsCurly'
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown'
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { parseBulkImportInput, type BulkImportPlan } from '../../domain/bulkAdd'
import type { BulkImportCommit } from '../../data/repository'
import {
  formatTaskReward,
  getDefaultReward,
  getRewardForMode,
  getRewardOverrideForMode,
  type TaskRewardMode,
} from '../../domain/rewards'
import { cadenceOptions, effortOptions } from '../../domain/taskUi'
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Field,
  Select,
  TextField,
  Textarea,
} from '../primitives/Primitives'
import { getCategoryTone } from '../../domain/categories'
import type { Category, CreateTaskInput, Difficulty, Cadence, Quest } from '../../domain/types'
import styles from './QuickAddComposer.module.css'
import sharedStyles from './Shared.module.css'

function initialState(categoryId?: string) {
  const defaultReward = getDefaultReward('small')

  return {
    title: '',
    categoryIds: categoryId ? [categoryId] : [],
    questId: '',
    dueDate: '',
    cadence: 'none' as Cadence,
    difficulty: 'small' as Difficulty,
    notes: '',
    rewardMode: 'match_difficulty' as TaskRewardMode,
    customXp: defaultReward.xp,
    customCoins: defaultReward.coins,
    subtasksText: '',
  }
}

function formatCount(count: number, singular: string): string {
  return `${count} ${singular}${count === 1 ? '' : 's'}`
}

const bulkImportPlaceholder = `{
  "categories": [
    {
      "id": "home-reset",
      "name": "Home Reset",
      "colorKey": "sage"
    }
  ],
  "quests": [
    {
      "title": "Reset the apartment",
      "rewardXp": 120,
      "rewardCoins": 24,
      "tasks": [
        {
          "title": "Clear the kitchen counters",
          "categoryIds": ["home-reset"],
          "subtasks": ["Throw out expired food", "Wipe surfaces"]
        },
        {
          "title": "Refill prescriptions",
          "categoryIds": ["health"]
        }
      ]
    }
  ],
  "tasks": []
}`

export function QuickAddComposer({
  categories,
  quests,
  onCreate,
  onBulkCreate,
}: {
  categories: Category[]
  quests: Quest[]
  onCreate: (input: CreateTaskInput) => Promise<void>
  onBulkCreate: (plan: BulkImportPlan) => Promise<BulkImportCommit>
}) {
  const defaultCategoryId = categories[0]?.id
  const [expanded, setExpanded] = useState(false)
  const [state, setState] = useState(() => initialState(defaultCategoryId))
  const [showValidation, setShowValidation] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkJson, setBulkJson] = useState('')
  const [bulkPreview, setBulkPreview] = useState<BulkImportPlan | null>(null)
  const [bulkError, setBulkError] = useState('')
  const [bulkSummary, setBulkSummary] = useState('')
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false)
  const categoryList = categories.length ? categories.map((category) => category.id).join(', ') : 'None yet'
  const questList = quests.length ? quests.map((quest) => quest.title).join(', ') : 'None yet'
  const llmPrompt = [
    'Generate a task breakdown payload for a task and quest planner.',
    'Break the user goal into small, concrete, practical steps.',
    'Return JSON only. Do not include markdown or commentary.',
    '',
    'App structure:',
    '- categories = reusable task tags',
    '- quests = larger multi-step goals with rewards',
    '- tasks = actionable items that can stand alone or belong to a quest',
    '- subtasks = smaller checklist steps inside a task',
    '',
    'Top-level JSON shape:',
    '{',
    '  "categories": [{ "id": "string", "name": "string", "colorKey": "slate|brass|sage|blush|plum|mist" }],',
    '  "quests": [{ "title": "string", "description": "string?", "imageUrl": "string?", "rewardXp": number?, "rewardCoins": number?, "tasks": Task[]? }],',
    '  "tasks": [Task]',
    '}',
    '',
    'Task shape:',
    '{',
    '  "title": "string",',
    '  "notes": "string?",',
    '  "categoryIds": ["string"],',
    '  "questTitle": "string?",',
    '  "dueDate": "YYYY-MM-DD?",',
    '  "cadence": "none|daily|weekly|monthly?",',
    '  "difficulty": "tiny|small|medium|large?",',
    '  "rewardOverride": { "xp": number?, "coins": number? }?,',
    '  "subtasks": ["string"]?',
    '}',
    '',
    'Rules:',
    '- Prefer many small tasks over a few large tasks.',
    '- If a task still feels cognitively heavy, break it into subtasks.',
    '- Make task titles short, direct, and action-first.',
    '- Reuse existing category IDs when they fit. Do not redefine them in "categories".',
    '- Only add entries to "categories" for genuinely new categories, then reference those ids in tasks.',
    '- Pick category colorKey to match the theme of the work.',
    '- You decide whether something belongs inside the quest or as a standalone task unless the user explicitly asks for a specific split.',
    '- Use questTitle only for standalone tasks that should link to an existing or newly-created quest.',
    '- Default behavior: put goal-critical actions inside the quest, and put generic maintenance habits like hydration, protein, sleep, stretching, or reminders into standalone support tasks unless they are essential to quest completion.',
    '- Use dueDate only when there is a meaningful suggested date.',
    '- Use cadence only for repeating tasks.',
    '- Default rewards can be omitted. Only use rewardOverride when the effort clearly deserves a higher or lower reward.',
    '- Difficulty should reflect effort and friction, not importance.',
    '',
    'Reward guidance:',
    '- tiny = very fast / almost no friction',
    '- small = normal quick task',
    '- medium = meaningful effort',
    '- large = difficult or multi-stage task',
    '',
    `Current category IDs: ${categoryList}.`,
    `Existing quest titles: ${questList}.`,
  ].join('\n')
  const questOptions = [
    { label: 'No quest', value: 'none' },
    ...quests
      .filter((quest) => !quest.archived)
      .map((quest) => ({ label: quest.title, value: quest.id })),
  ]
  const selectedReward = getRewardForMode(state.rewardMode, state.difficulty, {
    xp: state.customXp,
    coins: state.customCoins,
  })

  async function submitTask(expandedSubmit: boolean) {
    if (!state.title.trim()) {
      setShowValidation(true)
      return
    }

    await onCreate({
      title: state.title,
      categoryIds: state.categoryIds,
      questId: state.questId || undefined,
      dueDate: state.dueDate || undefined,
      cadence: state.cadence,
      difficulty: state.difficulty,
      notes: state.notes,
      rewardOverride: getRewardOverrideForMode(state.rewardMode, state.difficulty, {
        xp: state.customXp,
        coins: state.customCoins,
      }),
      subtasks: state.subtasksText.split('\n'),
    })

    setState(initialState(defaultCategoryId))
    setShowValidation(false)
    setExpanded(expandedSubmit ? false : expanded)
  }

  function toggleCategory(categoryId: string, checked: boolean) {
    setState((current) => {
      const nextIds = checked
        ? [...new Set([...current.categoryIds, categoryId])]
        : current.categoryIds.filter((id) => id !== categoryId)

      return {
        ...current,
        categoryIds: nextIds,
      }
    })
  }

  function handleEffortChange(value: string) {
    if (value === 'custom') {
      setState((current) => ({
        ...current,
        rewardMode: 'custom',
        customXp: 0,
        customCoins: 0,
      }))
      return
    }

    const nextDifficulty = value as Difficulty
    setState((current) => {
      const nextDefaultReward = getDefaultReward(nextDifficulty)
      return {
        ...current,
        difficulty: nextDifficulty,
        rewardMode: 'match_difficulty',
        customXp: nextDefaultReward.xp,
        customCoins: nextDefaultReward.coins,
      }
    })
  }

  function handleBulkJsonChange(nextValue: string) {
    setBulkJson(nextValue)

    if (!nextValue.trim()) {
      setBulkPreview(null)
      setBulkError('')
      return
    }

    try {
      const plan = parseBulkImportInput(nextValue, { categories, quests })
      setBulkPreview(plan)
      setBulkError('')
    } catch (error) {
      setBulkPreview(null)
      setBulkError(error instanceof Error ? error.message : 'Could not parse JSON.')
    }
  }

  async function submitBulkImport() {
    if (!bulkPreview) {
      setBulkError(bulkJson.trim() ? 'Fix the JSON before importing.' : 'Paste JSON to preview the import.')
      return
    }

    setIsBulkSubmitting(true)

    try {
      const commit = await onBulkCreate(bulkPreview)
      setBulkSummary(
        `Imported ${formatCount(commit.questIds.length, 'quest')} and ${formatCount(commit.taskIds.length, 'task')}.`,
      )
      setBulkOpen(false)
      setBulkJson('')
      setBulkPreview(null)
      setBulkError('')
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : 'Could not import JSON.')
    } finally {
      setIsBulkSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <form
          className={styles.root}
          onSubmit={(event) => {
            event.preventDefault()
            void submitTask(true)
          }}
        >
          <div className={styles.topRow}>
            <Field label="Add task">
              <TextField
                placeholder="Add a task"
                value={state.title}
                aria-invalid={showValidation && !state.title.trim()}
                onChange={(event) => {
                  const nextTitle = event.target.value
                  setState((current) => ({ ...current, title: nextTitle }))

                  if (nextTitle.trim()) {
                    setShowValidation(false)
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !expanded) {
                    event.preventDefault()
                    void submitTask(false)
                  }
                }}
              />
            </Field>
            <Button
              type="button"
              variant="secondary"
              aria-expanded={expanded}
              onClick={() => setExpanded((current) => !current)}
            >
              <span className={sharedStyles.inlineLabel}>
                {expanded ? (
                  <CaretDownIcon aria-hidden="true" size={16} weight="bold" />
                ) : (
                  <CaretRightIcon aria-hidden="true" size={16} weight="bold" />
                )}
                <span>Options</span>
              </span>
            </Button>
            <Button type="submit">
              <span className={sharedStyles.inlineLabel}>
                <PlusIcon aria-hidden="true" size={16} weight="bold" />
                <span>Create task</span>
              </span>
            </Button>
          </div>

          {expanded ? (
            <div className={styles.details}>
              <div className={styles.configRow}>
                <Field label="Effort">
                  <Select
                    value={state.rewardMode === 'custom' ? 'custom' : state.difficulty}
                    onValueChange={handleEffortChange}
                    options={effortOptions}
                  />
                </Field>
                <Field label="Reward">
                  {state.rewardMode === 'custom' ? (
                    <div className={styles.rewardInputGrid}>
                      <TextField
                        aria-label="Custom XP"
                        inputMode="numeric"
                        placeholder="XP"
                        value={state.customXp === 0 ? '' : String(state.customXp)}
                        onChange={(event) =>
                          setState((current) => ({
                            ...current,
                            customXp: Number(event.target.value) || 0,
                          }))
                        }
                      />
                      <TextField
                        aria-label="Custom coins"
                        inputMode="numeric"
                        placeholder="Coins"
                        value={state.customCoins === 0 ? '' : String(state.customCoins)}
                        onChange={(event) =>
                          setState((current) => ({
                            ...current,
                            customCoins: Number(event.target.value) || 0,
                          }))
                        }
                      />
                    </div>
                  ) : (
                    <div className={styles.rewardField}>
                      <span data-slot="muted-text" className={sharedStyles.muted}>
                        {formatTaskReward(selectedReward)}
                      </span>
                    </div>
                  )}
                </Field>
                <Field label="Due date">
                  <TextField
                    type="date"
                    value={state.dueDate}
                    onChange={(event) => setState((current) => ({ ...current, dueDate: event.target.value }))}
                  />
                </Field>
                <Field label="Cadence">
                  <Select
                    value={state.cadence}
                    onValueChange={(value) => setState((current) => ({ ...current, cadence: value as Cadence }))}
                    options={cadenceOptions}
                  />
                </Field>
              </div>

              <Field label="Categories">
                <div className={styles.tagGrid}>
                  {categories.map((category) => (
                    <label key={category.id} className={styles.tagOption}>
                      <Checkbox
                        checked={state.categoryIds.includes(category.id)}
                        onCheckedChange={(checked) => toggleCategory(category.id, checked)}
                        label=""
                      />
                      <Badge tone={getCategoryTone(category.colorKey)}>{category.name}</Badge>
                    </label>
                  ))}
                </div>
              </Field>
              <Field label="Quest">
                <>
                  <Select
                    value={state.questId || 'none'}
                    onValueChange={(value) =>
                      setState((current) => ({
                        ...current,
                        questId: value === 'none' ? '' : value,
                      }))
                    }
                    options={questOptions}
                    placeholder="Quest"
                  />
                  <span data-slot="muted-text" className={sharedStyles.muted}>
                    {state.questId ? `Quest ID: ${state.questId}` : 'Not linked to a quest'}
                  </span>
                </>
              </Field>

              <div className={styles.detailRow}>
                <Field label="Notes">
                  <Textarea
                    placeholder="Optional context or instructions"
                    value={state.notes}
                    onChange={(event) => setState((current) => ({ ...current, notes: event.target.value }))}
                  />
                </Field>
              </div>

              <Field label="Subtasks">
                <Textarea
                  placeholder={'One step per line\nTake vitamin D\nTake magnesium'}
                  value={state.subtasksText}
                  onChange={(event) =>
                    setState((current) => ({ ...current, subtasksText: event.target.value }))
                  }
                />
              </Field>

              <div className={styles.bulkEntryRow}>
                <div>
                  <strong>Need help breaking this down?</strong>
                  <p data-slot="muted-text" className={sharedStyles.muted}>
                    Ask an LLM for the JSON payload, then paste it here to create standalone tasks or a whole quest plan.
                  </p>
                </div>
                <Button type="button" variant="secondary" onClick={() => setBulkOpen(true)}>
                  <span className={sharedStyles.inlineLabel}>
                    <BracketsCurlyIcon aria-hidden="true" size={16} weight="duotone" />
                    <span>Paste JSON</span>
                  </span>
                </Button>
              </div>
            </div>
          ) : null}

          {bulkSummary ? <p data-slot="muted-text" className={sharedStyles.muted}>{bulkSummary}</p> : null}
        </form>
      </Card>

      <Dialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        title="Bulk add from JSON"
        description="Give your LLM the schema below and ask it to return JSON only."
        contentClassName={styles.bulkDialogContent}
      >
        <form
          className={styles.bulkDialog}
          onSubmit={(event) => {
            event.preventDefault()
            void submitBulkImport()
          }}
        >
          <div className={styles.bulkInstructions}>
            <strong>Prompt for the LLM</strong>
            <Textarea className={styles.bulkPrompt} value={llmPrompt} readOnly />
            <div className={styles.bulkInstructionList}>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Current category IDs: {categoryList}
              </p>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Existing quest titles: {questList}
              </p>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Allowed category colorKey values: slate, brass, sage, blush, plum, mist.
              </p>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Allowed cadence values: none, daily, weekly, monthly.
              </p>
              <p data-slot="muted-text" className={sharedStyles.muted}>
                Allowed difficulty values: tiny, small, medium, large.
              </p>
            </div>
          </div>

          <Field label="JSON">
            <>
              <Textarea
                className={styles.bulkTextarea}
                placeholder={bulkImportPlaceholder}
                value={bulkJson}
                onChange={(event) => handleBulkJsonChange(event.target.value)}
              />
              <span data-slot="muted-text" className={sharedStyles.muted}>
                Keep the payload strict: use only categories, quests, tasks, and the documented fields inside them.
              </span>
            </>
          </Field>

          {bulkError ? <p className={styles.bulkError}>{bulkError}</p> : null}

          {bulkPreview ? (
            <div className={styles.bulkPreview}>
              <div className={styles.bulkSummaryRow}>
                <strong>Preview</strong>
                <span data-slot="muted-text" className={sharedStyles.muted}>
                  {formatCount(bulkPreview.summary.questCount, 'quest')} ·{' '}
                  {formatCount(bulkPreview.summary.taskCount, 'task')} ·{' '}
                  {formatCount(bulkPreview.summary.subtaskCount, 'subtask')}
                </span>
              </div>

              {bulkPreview.warnings.length ? (
                <div className={styles.bulkWarnings}>
                  {bulkPreview.warnings.map((warning) => (
                    <p key={warning} data-slot="muted-text" className={sharedStyles.muted}>
                      {warning}
                    </p>
                  ))}
                </div>
              ) : (
                <p data-slot="muted-text" className={sharedStyles.muted}>
                  No import warnings.
                </p>
              )}
            </div>
          ) : null}

          <div className={styles.bulkActions}>
            <Button type="button" variant="secondary" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isBulkSubmitting || !bulkPreview}>
              {isBulkSubmitting ? 'Importing…' : 'Import items'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
