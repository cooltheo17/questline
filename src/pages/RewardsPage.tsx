import { CoinsIcon } from '@phosphor-icons/react/dist/csr/Coins'
import { GiftIcon } from '@phosphor-icons/react/dist/csr/Gift'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { RewardCard } from '../components/app/RewardCard'
import { Button, Card, Field, TextField, Textarea, Checkbox } from '../components/primitives/Primitives'
import { createReward, deleteWalletTransaction, purchaseReward } from '../data/repository'
import { getProfileSnapshot } from '../domain/selectors'
import { useAppCollections } from '../hooks/useAppCollections'
import { useState } from 'react'
import styles from './Page.module.css'
import sharedStyles from '../components/app/Shared.module.css'

export function RewardsPage() {
  const { rewards, walletTransactions, completions, tasks, categories } = useAppCollections()
  const profile = getProfileSnapshot(completions, walletTransactions, tasks, categories)
  const [form, setForm] = useState({
    title: '',
    coinCost: 25,
    notes: '',
    link: '',
    repeatable: false,
  })

  const activeRewards = rewards.filter((reward) => !reward.archived)
  const purchaseHistory = walletTransactions.filter((entry) => entry.type === 'reward_purchase')

  return (
    <div className={styles.page}>
      <div className={styles.columns}>
        <div className={styles.stack}>
          <Card>
            <div className={sharedStyles.panel}>
              <div className={sharedStyles.sectionTitle}>
                <h2 className={sharedStyles.heading}>
                  <span className={sharedStyles.headingInline}>
                    <GiftIcon aria-hidden="true" size={20} weight="duotone" />
                    <span>Rewards</span>
                  </span>
                </h2>
              </div>
              <div className={sharedStyles.stats}>
                <div className={sharedStyles.stat}>
                  <div className={sharedStyles.statValue}>{profile.coins}</div>
                  <div className={sharedStyles.statLabel}>
                    <span className={sharedStyles.inlineLabel}>
                      <CoinsIcon aria-hidden="true" size={15} weight="duotone" />
                      <span>Available coins</span>
                    </span>
                  </div>
                </div>
                <div className={sharedStyles.stat}>
                  <div className={sharedStyles.statValue}>{activeRewards.length}</div>
                  <div className={sharedStyles.statLabel}>
                    <span className={sharedStyles.inlineLabel}>
                      <GiftIcon aria-hidden="true" size={15} weight="duotone" />
                      <span>Active rewards</span>
                    </span>
                  </div>
                </div>
                <div className={sharedStyles.stat}>
                  <div className={sharedStyles.statValue}>{purchaseHistory.length}</div>
                  <div className={sharedStyles.statLabel}>Purchases made</div>
                </div>
                <div className={sharedStyles.stat}>
                  <div className={sharedStyles.statValue}>{profile.totalXp}</div>
                  <div className={sharedStyles.statLabel}>Total XP earned</div>
                </div>
              </div>
            </div>
          </Card>

          <div className={sharedStyles.list}>
            {activeRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                canBuy={profile.coins >= reward.coinCost}
                onBuy={async () => {
                  await purchaseReward(reward)
                }}
              />
            ))}
          </div>
        </div>

        <div className={styles.stack}>
          <Card>
            <form
              className={sharedStyles.panel}
              onSubmit={(event) => {
                event.preventDefault()
                void createReward(form).then(() =>
                  setForm({
                    title: '',
                    coinCost: 25,
                    notes: '',
                    link: '',
                    repeatable: false,
                  }),
                )
              }}
            >
              <div>
                <h2 className={sharedStyles.heading}>Add reward</h2>
              </div>
              <Field label="Reward">
                <TextField
                  placeholder="New shirt"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                />
              </Field>
              <Field label="Coin cost">
                <TextField
                  inputMode="numeric"
                  value={String(form.coinCost)}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, coinCost: Number(event.target.value) || 0 }))
                  }
                />
              </Field>
              <Field label="Notes">
                <Textarea
                  placeholder="Why this reward matters"
                  value={form.notes}
                  onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                />
              </Field>
              <Field label="Link">
                <TextField
                  placeholder="https://"
                  value={form.link}
                  onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
                />
              </Field>
              <Checkbox
                checked={form.repeatable}
                onCheckedChange={(checked) => setForm((current) => ({ ...current, repeatable: checked }))}
                label="This reward can be bought more than once"
              />
              <Button type="submit">
                <span className={sharedStyles.inlineLabel}>
                  <PlusIcon aria-hidden="true" size={16} weight="bold" />
                  <span>Add reward</span>
                </span>
              </Button>
            </form>
          </Card>

          <Card>
            <div className={sharedStyles.panel}>
              <h2 className={sharedStyles.heading}>Purchase history</h2>
              <div className={styles.history}>
                {purchaseHistory.length ? (
                  purchaseHistory.map((entry) => {
                    const reward = rewards.find((item) => item.id === entry.sourceId)
                    return (
                      <div key={entry.id} className={styles.historyRow}>
                        <div>
                          <div>{reward?.title ?? 'Archived reward'}</div>
                          <div className={styles.historyMeta}>
                            <span>{Math.abs(entry.amount)} coins</span>
                            <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className={styles.historyActions}>
                          <Button
                            variant="secondary"
                            onClick={() => void deleteWalletTransaction(entry.id)}
                          >
                            <span className={sharedStyles.inlineLabel}>
                              <TrashIcon aria-hidden="true" size={15} weight="bold" />
                              <span>Remove</span>
                            </span>
                          </Button>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className={sharedStyles.muted}>Nothing spent yet.</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
