import { useEffect, useState } from 'react'
import {
  Button,
  Checkbox,
  Dialog,
  Field,
  TextField,
  Textarea,
} from '../../components/primitives/Primitives'
import { updateReward } from '../../data/repository'
import type { RewardItem } from '../../domain/types'
import styles from '../Page.module.css'

interface RewardEditorDialogProps {
  reward: RewardItem | null
  onClose: () => void
}

export function RewardEditorDialog({ reward, onClose }: RewardEditorDialogProps) {
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
