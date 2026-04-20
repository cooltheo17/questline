import { AnimatePresence } from 'framer-motion'
import { CoinsIcon } from '@phosphor-icons/react/dist/csr/Coins'
import { GiftIcon } from '@phosphor-icons/react/dist/csr/Gift'
import { MoneyIcon } from '@phosphor-icons/react/dist/csr/Money'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { RewardCard } from '../components/app/RewardCard'
import { SectionHeading } from '../components/app/SectionHeading'
import { Button, Card, Field, TextField, Textarea, Checkbox } from '../components/primitives/Primitives'
import { createReward, deleteWalletTransaction, purchaseReward } from '../data/repository'
import { getProfileSnapshot } from '../domain/selectors'
import type { RewardItem } from '../domain/types'
import {
  useCategoriesCollectionContext,
  useCompletionsCollectionContext,
  useQuestsCollectionContext,
  useRewardsCollectionContext,
  useTasksCollectionContext,
  useWalletTransactionsCollectionContext,
} from '../hooks/AppCollectionsContext'
import { useEffect, useRef, useState } from 'react'
import { useUiStore } from '../state/uiStore'
import styles from './Page.module.css'
import sharedStyles from '../components/app/Shared.module.css'

const PURCHASE_SETTLE_MS = 900

export function RewardsPage() {
  const rewards = useRewardsCollectionContext()
  const walletTransactions = useWalletTransactionsCollectionContext()
  const completions = useCompletionsCollectionContext()
  const tasks = useTasksCollectionContext()
  const categories = useCategoriesCollectionContext()
  const quests = useQuestsCollectionContext()
  const profile = getProfileSnapshot(completions, walletTransactions, tasks, categories, quests)
  const pushToast = useUiStore((state) => state.pushToast)
  const [form, setForm] = useState({
    title: '',
    coinCost: 25,
    notes: '',
    link: '',
    repeatable: false,
  })
  const [buyingRewardIds, setBuyingRewardIds] = useState<string[]>([])
  const [recentlyPurchasedRewardIds, setRecentlyPurchasedRewardIds] = useState<string[]>([])
  const purchaseTimerRefs = useRef<Record<string, number>>({})

  useEffect(() => () => {
    Object.values(purchaseTimerRefs.current).forEach((timerId) => window.clearTimeout(timerId))
  }, [])

  const activeRewards = rewards.filter((reward) => !reward.archived)
  const buyingRewardIdSet = new Set(buyingRewardIds)
  const recentlyPurchasedRewardIdSet = new Set(recentlyPurchasedRewardIds)
  const rewardTitlesById = new Map(rewards.map((reward) => [reward.id, reward.title]))
  const visibleRewards = rewards.filter((reward) => !reward.archived || recentlyPurchasedRewardIdSet.has(reward.id))
  const purchaseHistory = walletTransactions.filter((entry) => entry.type === 'reward_purchase')
  const purchaseHistoryViews = purchaseHistory.map((entry) => ({
    ...entry,
    rewardTitle: rewardTitlesById.get(entry.sourceId) ?? 'Archived reward',
  }))

  const markPurchaseSettled = (reward: RewardItem) => {
    window.clearTimeout(purchaseTimerRefs.current[reward.id])
    setRecentlyPurchasedRewardIds((current) => [...new Set([...current, reward.id])])
    purchaseTimerRefs.current[reward.id] = window.setTimeout(() => {
      setRecentlyPurchasedRewardIds((current) => current.filter((id) => id !== reward.id))
      delete purchaseTimerRefs.current[reward.id]
    }, PURCHASE_SETTLE_MS)
  }

  return (
    <div data-slot="page" className={styles.page}>
      <div data-slot="page-columns" className={styles.columns}>
        <div data-slot="page-stack" className={styles.stack}>
          <Card>
            <div data-slot="section-panel" className={sharedStyles.panel}>
              <SectionHeading
                icon={<GiftIcon aria-hidden="true" size={20} weight="duotone" />}
                title="Rewards"
              />
              <div data-slot="stats-grid" className={sharedStyles.stats}>
                <div data-slot="stat" className={sharedStyles.stat}>
                  <div className={sharedStyles.statValueRow}>
                    <span data-slot="stat-value" className={sharedStyles.statValue}>{profile.coins}</span>
                    <CoinsIcon aria-hidden="true" size={15} weight="duotone" />
                  </div>
                  <div data-slot="stat-label" className={sharedStyles.statLabel}>Available coins</div>
                </div>
                <div data-slot="stat" className={sharedStyles.stat}>
                  <div className={sharedStyles.statValueRow}>
                    <span data-slot="stat-value" className={sharedStyles.statValue}>{activeRewards.length}</span>
                    <GiftIcon aria-hidden="true" size={15} weight="duotone" />
                  </div>
                  <div data-slot="stat-label" className={sharedStyles.statLabel}>Active rewards</div>
                </div>
                <div data-slot="stat" className={sharedStyles.stat}>
                  <div className={sharedStyles.statValueRow}>
                    <span data-slot="stat-value" className={sharedStyles.statValue}>{purchaseHistory.length}</span>
                    <MoneyIcon aria-hidden="true" size={15} weight="duotone" />
                  </div>
                  <div data-slot="stat-label" className={sharedStyles.statLabel}>Purchases made</div>
                </div>
                <div data-slot="stat" className={sharedStyles.stat}>
                  <div className={sharedStyles.statValueRow}>
                    <span data-slot="stat-value" className={sharedStyles.statValue}>{profile.totalXp}</span>
                    <span className={sharedStyles.statUnit}>xp</span>
                  </div>
                  <div data-slot="stat-label" className={sharedStyles.statLabel}>Total XP earned</div>
                </div>
              </div>
            </div>
          </Card>

          <div data-slot="stack-list" className={sharedStyles.list}>
            <AnimatePresence initial={false}>
              {visibleRewards.map((reward) => (
                <RewardCard
                  key={reward.id}
                  reward={reward}
                  canBuy={profile.coins >= reward.coinCost}
                  purchaseState={getPurchaseState(reward.id, buyingRewardIdSet, recentlyPurchasedRewardIdSet)}
                  onBuy={async () => {
                    setBuyingRewardIds((current) => [...new Set([...current, reward.id])])

                    try {
                      const purchased = await purchaseReward(reward)

                      if (!purchased) {
                        return false
                      }

                      markPurchaseSettled(reward)
                      pushToast({
                        title: reward.title,
                        description: getRewardPurchaseDescription(reward),
                      })
                      return true
                    } finally {
                      setBuyingRewardIds((current) => current.filter((id) => id !== reward.id))
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div data-slot="page-stack" className={styles.stack}>
          <Card>
            <form
              data-slot="section-panel"
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
                <h2 data-slot="section-heading" className={sharedStyles.heading}>Add reward</h2>
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
            <div data-slot="section-panel" className={sharedStyles.panel}>
              <h2 data-slot="section-heading" className={sharedStyles.heading}>Purchase history</h2>
              <div data-slot="history-list" className={styles.history}>
                {purchaseHistoryViews.length ? (
                  purchaseHistoryViews.map((entry) => (
                    <div data-slot="history-row" key={entry.id} className={styles.historyRow}>
                      <div>
                        <div>{entry.rewardTitle}</div>
                        <div className={styles.historyMeta}>
                          <span>{Math.abs(entry.amount)} coins</span>
                          <span>{new Date(entry.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div data-slot="action-group" className={styles.historyActions}>
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
                  ))
                ) : (
                  <p data-slot="muted-text" className={sharedStyles.muted}>Nothing spent yet.</p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getPurchaseState(
  rewardId: string,
  buyingRewardIds: Set<string>,
  recentlyPurchasedRewardIds: Set<string>,
) {
  if (buyingRewardIds.has(rewardId)) {
    return 'buying' as const
  }

  if (recentlyPurchasedRewardIds.has(rewardId)) {
    return 'purchased' as const
  }

  return 'idle' as const
}

function getRewardPurchaseDescription(reward: RewardItem) {
  if (reward.repeatable) {
    return `${reward.coinCost} coins spent. This one stays on the shelf for next time.`
  }

  return `${reward.coinCost} coins spent. Added to your purchase history.`
}
