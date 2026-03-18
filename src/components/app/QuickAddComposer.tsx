import { useState } from 'react'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { Button, Card, Checkbox, Field, Select, TextField, Textarea } from '../primitives/Primitives'
import { DEFAULT_CATEGORY_ID } from '../../data/db'
import type { Category, CreateTaskInput, Difficulty, Cadence } from '../../domain/types'
import styles from './QuickAddComposer.module.css'
import sharedStyles from './Shared.module.css'

const cadenceOptions = [
  { label: 'One-off', value: 'none' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

function initialState(categoryId: string) {
  return {
    title: '',
    categoryIds: [categoryId],
    dueDate: '',
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
      dueDate: state.dueDate || undefined,
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
          <Button type="submit">
            <span className={sharedStyles.inlineLabel}>
              <PlusIcon aria-hidden="true" size={16} weight="bold" />
              <span>Create task</span>
            </span>
          </Button>
        </div>

        {expanded ? (
          <div className={styles.details}>
            <div className={styles.metricsRow}>
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

            <div className={styles.configRow}>
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
          </div>
        ) : null}
      </form>
    </Card>
  )
}
