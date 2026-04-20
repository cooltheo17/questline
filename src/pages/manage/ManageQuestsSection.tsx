import { ArchiveIcon } from '@phosphor-icons/react/dist/csr/Archive'
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise'
import { FlagBannerIcon } from '@phosphor-icons/react/dist/csr/FlagBanner'
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { useState } from 'react'
import {
  Button,
  Card,
  Field,
  TextField,
  Textarea,
} from '../../components/primitives/Primitives'
import { createQuest, updateQuest } from '../../data/repository'
import type { Quest } from '../../domain/types'
import sharedStyles from '../../components/app/Shared.module.css'
import { SectionHeading } from '../../components/app/SectionHeading'
import styles from '../Page.module.css'
import { ManageMetricList, ManageRailCard, ManageTabLayout } from './ManageTabLayout'
import { createQuestFormState } from './managePageUtils'

interface ManageQuestsSectionProps {
  quests: Quest[]
  onEditQuest: (quest: Quest) => void
}

export function ManageQuestsSection({ quests, onEditQuest }: ManageQuestsSectionProps) {
  const [newQuest, setNewQuest] = useState(() => createQuestFormState())
  const liveQuestCount = quests.filter((quest) => !quest.archived && !quest.completedAt).length
  const completedQuestCount = quests.filter((quest) => Boolean(quest.completedAt)).length
  const archivedQuestCount = quests.filter((quest) => quest.archived).length

  return (
    <ManageTabLayout
      rail={
        <>
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
              <SectionHeading
                icon={<FlagBannerIcon aria-hidden="true" size={20} weight="duotone" />}
                title="Create quest"
              />
              <Field label="Title">
                <TextField
                  placeholder="30-day writing challenge"
                  value={newQuest.title}
                  onChange={(event) => setNewQuest({ ...newQuest, title: event.target.value })}
                />
              </Field>
              <Field label="Description">
                <Textarea
                  placeholder="Why this quest matters"
                  value={newQuest.description}
                  onChange={(event) => setNewQuest({ ...newQuest, description: event.target.value })}
                />
              </Field>
              <div className={styles.smallGrid}>
                <Field label="Reward XP">
                  <TextField
                    inputMode="numeric"
                    value={String(newQuest.rewardXp)}
                    onChange={(event) =>
                      setNewQuest({
                        ...newQuest,
                        rewardXp: Number(event.target.value) || 0,
                      })
                    }
                  />
                </Field>
                <Field label="Reward coins">
                  <TextField
                    inputMode="numeric"
                    value={String(newQuest.rewardCoins)}
                    onChange={(event) =>
                      setNewQuest({
                        ...newQuest,
                        rewardCoins: Number(event.target.value) || 0,
                      })
                    }
                  />
                </Field>
              </div>
              <Field label="Image URL">
                <TextField
                  placeholder="https://example.com/cover.jpg"
                  value={newQuest.imageUrl}
                  onChange={(event) => setNewQuest({ ...newQuest, imageUrl: event.target.value })}
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

          <ManageRailCard
            title="Overview"
            description="Quest editing now keeps the same supporting column as categories, tasks, rewards, appearance, and data."
          >
            <ManageMetricList
              items={[
                { label: 'Total quests', value: quests.length },
                { label: 'In progress', value: liveQuestCount },
                { label: 'Completed', value: completedQuestCount },
                { label: 'Archived', value: archivedQuestCount },
              ]}
            />
          </ManageRailCard>
        </>
      }
    >
      <Card>
        <div data-slot="section-panel" className={sharedStyles.panel}>
          <SectionHeading
            icon={<FlagBannerIcon aria-hidden="true" size={20} weight="duotone" />}
            title="Quest library"
          />
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
                    <Button size="sm" variant="secondary" onClick={() => onEditQuest(quest)}>
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
        </div>
      </Card>
    </ManageTabLayout>
  )
}
