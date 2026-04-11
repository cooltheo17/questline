import { motion } from 'framer-motion'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { CoinsIcon } from '@phosphor-icons/react/dist/csr/Coins'
import { GiftIcon } from '@phosphor-icons/react/dist/csr/Gift'
import { Badge, Button, Card } from '../primitives/Primitives'
import type { RewardItem } from '../../domain/types'
import styles from './Shared.module.css'

export function RewardCard({
  reward,
  canBuy,
  purchaseState = 'idle',
  onBuy,
}: {
  reward: RewardItem
  canBuy: boolean
  purchaseState?: 'idle' | 'buying' | 'purchased'
  onBuy: () => Promise<boolean>
}) {
  const isBusy = purchaseState === 'buying'
  const isPurchased = purchaseState === 'purchased'

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, y: -6 }}
      className={styles.rewardCardShell}
    >
      <Card className={isPurchased ? styles.rewardCardPurchased : undefined}>
      <div data-slot="reward-card" className={styles.panel}>
        <div data-slot="section-title" className={styles.sectionTitle}>
          <div>
            <h3 data-slot="section-heading" className={styles.heading}>{reward.title}</h3>
            {reward.notes ? <p data-slot="muted-text" className={styles.muted}>{reward.notes}</p> : null}
          </div>
          <div className={styles.badgeRow}>
            <Badge>
              <span className={styles.inlineLabel}>
                <CoinsIcon aria-hidden="true" size={15} weight="duotone" />
                <span>{reward.coinCost} coins</span>
              </span>
            </Badge>
            <Badge tone={reward.repeatable ? 'slate' : 'sage'}>
              {reward.repeatable ? 'Repeatable' : 'One-time'}
            </Badge>
          </div>
        </div>

        <div data-slot="section-actions" className={styles.actions}>
          <Button
            disabled={!canBuy || isBusy || isPurchased}
            variant={isPurchased ? 'secondary' : 'primary'}
            onClick={() => void onBuy()}
          >
            <span className={styles.inlineLabel}>
              {isPurchased ? (
                <CheckCircleIcon aria-hidden="true" size={16} weight="duotone" />
              ) : (
                <GiftIcon aria-hidden="true" size={16} weight="duotone" />
              )}
              <span>
                {isPurchased
                  ? 'Purchased'
                  : isBusy
                    ? 'Buying...'
                    : canBuy
                      ? 'Buy reward'
                      : 'Need more coins'}
              </span>
            </span>
          </Button>
          {reward.link ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => window.open(reward.link, '_blank', 'noopener,noreferrer')}
            >
              View item
            </Button>
          ) : null}
        </div>
        {isPurchased ? (
          <p data-slot="muted-text" className={styles.rewardStatus}>
            {reward.repeatable ? 'Purchase logged. This reward is still available.' : 'Purchase logged. Leaving the shop.'}
          </p>
        ) : null}
      </div>
      </Card>
    </motion.article>
  )
}
