import { useEffect, useState } from 'react'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  TextField,
  Textarea,
} from '../../components/primitives/Primitives'
import { deleteQuest, updateQuest } from '../../data/repository'
import type { Quest } from '../../domain/types'
import sharedStyles from '../../components/app/Shared.module.css'
import styles from '../Page.module.css'

interface QuestEditorDialogProps {
  quest: Quest | null
  onClose: () => void
}

export function QuestEditorDialog({ quest, onClose }: QuestEditorDialogProps) {
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
