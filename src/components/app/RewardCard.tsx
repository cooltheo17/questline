import { Badge, Button, Card } from '../primitives/Primitives'
import type { RewardItem } from '../../domain/types'
import styles from './Shared.module.css'

export function RewardCard({
  reward,
  canBuy,
  onBuy,
}: {
  reward: RewardItem
  canBuy: boolean
  onBuy: () => Promise<void>
}) {
  return (
    <Card>
      <div className={styles.panel}>
        <div className={styles.sectionTitle}>
          <div>
            <h3 className={styles.heading}>{reward.title}</h3>
            {reward.notes ? <p className={styles.muted}>{reward.notes}</p> : null}
          </div>
          <Badge>{reward.coinCost} coins</Badge>
        </div>

        <div className={styles.actions}>
          <Button disabled={!canBuy} onClick={() => void onBuy()}>
            {canBuy ? 'Buy reward' : 'Need more coins'}
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
      </div>
    </Card>
  )
}
