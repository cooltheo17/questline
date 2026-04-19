import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { Button, Card } from '../../components/primitives/Primitives'
import { deleteReward } from '../../data/repository'
import type { RewardItem } from '../../domain/types'
import sharedStyles from '../../components/app/Shared.module.css'
import { SectionHeading } from '../../components/app/SectionHeading'
import styles from '../Page.module.css'
import { ManageMetricList, ManageRailCard, ManageTabLayout } from './ManageTabLayout'

interface ManageRewardsSectionProps {
  rewards: RewardItem[]
  onEditReward: (reward: RewardItem) => void
}

export function ManageRewardsSection({ rewards, onEditReward }: ManageRewardsSectionProps) {
  const activeRewardCount = rewards.filter((reward) => !reward.archived).length

  return (
    <ManageTabLayout
      rail={
        <ManageRailCard
          title="Reward flow"
          description="This section now follows the same two-column Manage frame. New rewards still start from the main Rewards page; this view stays focused on edits and cleanup."
        >
          <ManageMetricList
            items={[
              { label: 'Total rewards', value: rewards.length },
              { label: 'Active', value: activeRewardCount },
              { label: 'Archived', value: rewards.length - activeRewardCount },
            ]}
          />
        </ManageRailCard>
      }
    >
      <Card>
        <div data-slot="section-panel" className={sharedStyles.panel}>
          <SectionHeading title="Reward library" />
          <div data-slot="stack-list" className={sharedStyles.list}>
            {rewards.length ? (
              rewards.map((reward) => (
                <div key={reward.id} className={styles.row}>
                  <div>
                    <strong>{reward.title}</strong>
                    <p data-slot="muted-text" className={sharedStyles.muted}>
                      {reward.coinCost} coins
                    </p>
                  </div>
                  <div data-slot="action-group" className={sharedStyles.actions}>
                    <Button size="sm" variant="secondary" onClick={() => onEditReward(reward)}>
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
              ))
            ) : (
              <p data-slot="muted-text" className={sharedStyles.muted}>No rewards yet.</p>
            )}
          </div>
        </div>
      </Card>
    </ManageTabLayout>
  )
}
