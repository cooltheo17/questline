import { useState } from 'react'
import { Button, Card, Checkbox, Field, Select, TextField, Textarea } from '../primitives/Primitives'
import { DEFAULT_CATEGORY_ID } from '../../data/db'
import type { Category, CreateTaskInput, Difficulty, Cadence } from '../../domain/types'
import styles from './QuickAddComposer.module.css'

const cadenceOptions = [
  { label: 'One-off', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

const rewardPresetOptions = [
  { label: '5 XP · 1 coin', value: 'tiny', xp: 5, coins: 1 },
  { label: '10 XP · 2 coins', value: 'small', xp: 10, coins: 2 },
  { label: '20 XP · 4 coins', value: 'medium', xp: 20, coins: 4 },
  { label: '35 XP · 7 coins', value: 'large', xp: 35, coins: 7 },
] as const

function initialState(categoryId: string) {
  return {
    title: '',
    categoryIds: [categoryId],
    cadence: 'none' as Cadence,
    difficulty: 'small' as Difficulty,
    notes: '',
    xp: 10,
    coins: 2,
    subtasksText: '',
  }
}

export function QuickAddComposer({
  categories,
  onCreate,
}: {
  categories: Category[]
  onCreate: (input: CreateTaskInput) => Promise<void>
}) {
  const defaultCategoryId = categories[0]?.id ?? DEFAULT_CATEGORY_ID
  const [expanded, setExpanded] = useState(false)
  const [state, setState] = useState(() => initialState(defaultCategoryId))
  const [showValidation, setShowValidation] = useState(false)

  async function submitTask(expandedSubmit: boolean) {
    if (!state.title.trim()) {
      setShowValidation(true)
      return
    }

    await onCreate({
      title: state.title,
      categoryIds: state.categoryIds,
      cadence: state.cadence,
      difficulty: state.difficulty,
      notes: state.notes,
      rewardOverride: { xp: state.xp, coins: state.coins },
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
        categoryIds: nextIds.length ? nextIds : [defaultCategoryId],
      }
    })
  }

  return (
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
          <Button type="button" variant="secondary" onClick={() => setExpanded((current) => !current)}>
            {expanded ? 'Hide details' : 'Details'}
          </Button>
          <Button type="submit">Create task</Button>
        </div>

        {expanded ? (
          <div className={styles.details}>
            <div className={styles.rewardRow}>
              <Field label="Tags">
                <div className={styles.tagGrid}>
                  {categories.map((category) => (
                    <Checkbox
                      key={category.id}
                      checked={state.categoryIds.includes(category.id)}
                      onCheckedChange={(checked) => toggleCategory(category.id, checked)}
                      label={category.name}
                    />
                  ))}
                </div>
              </Field>
              <Field label="Cadence">
                <Select
                  value={state.cadence}
                  onValueChange={(value) => setState((current) => ({ ...current, cadence: value as Cadence }))}
                  options={cadenceOptions}
                />
              </Field>
              <Field label="Reward">
                <Select
                  value={state.difficulty}
                  onValueChange={(value) => {
                    const preset = rewardPresetOptions.find((option) => option.value === value)

                    if (!preset) {
                      return
                    }

                    setState((current) => ({
                      ...current,
                      difficulty: value as Difficulty,
                      xp: preset.xp,
                      coins: preset.coins,
                    }))
                  }}
                  options={rewardPresetOptions.map((preset) => ({
                    label: preset.label,
                    value: preset.value,
                  }))}
                />
              </Field>
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

            <div className={styles.rewardRow}>
              <Field label="XP">
                <TextField
                  inputMode="numeric"
                  value={String(state.xp)}
                  onChange={(event) =>
                    setState((current) => ({ ...current, xp: Number(event.target.value) || 0 }))
                  }
                />
              </Field>
              <Field label="Coins">
                <TextField
                  inputMode="numeric"
                  value={String(state.coins)}
                  onChange={(event) =>
                    setState((current) => ({ ...current, coins: Number(event.target.value) || 0 }))
                  }
                />
              </Field>
            </div>
          </div>
        ) : null}
      </form>
    </Card>
  )
}
