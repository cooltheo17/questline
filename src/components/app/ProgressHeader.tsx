import { motion } from 'framer-motion'
import { CoinsIcon } from '@phosphor-icons/react/dist/csr/Coins'
import { FireIcon } from '@phosphor-icons/react/dist/csr/Fire'
import { ProgressBar, Card } from '../primitives/Primitives'
import { useTheme } from '../../theme/themeContext'
import type { ProfileSnapshot } from '../../domain/selectors'
import styles from './Shared.module.css'

function getDailyGoalTarget(totalTasks: number): number {
  return Math.max(3, Math.min(5, totalTasks))
}

export function ProgressHeader({
  profile,
  completedCount,
  dueCount,
}: {
  profile: ProfileSnapshot
  completedCount: number
  dueCount: number
}) {
  const { theme } = useTheme()
  const goalTarget = getDailyGoalTarget(completedCount + dueCount)

  return (
    <Card>
      <div data-slot="section-panel" className={styles.panel}>
        <div data-slot="section-title" className={styles.sectionTitle}>
          <h2 data-slot="section-heading" className={styles.heading}>Profile</h2>
          <img data-slot="profile-avatar" className={styles.profileAvatar} src={theme.assets.profileAvatar} alt="" />
        </div>

        <div data-slot="panel-tight" className={styles.panelTight}>
          <div data-slot="section-title" className={styles.sectionTitle}>
            <span data-slot="subheading" className={styles.subheading}>Overall</span>
            <span data-slot="subheading" className={styles.subheading}>
              {theme.copy.levelLabel} {profile.level}
            </span>
          </div>
          <motion.div layout className={styles.progressWrap}>
            <ProgressBar value={profile.currentLevelXp} max={profile.nextLevelXp} />
          </motion.div>
        </div>

        <div data-slot="panel-tight" className={styles.panelTight}>
          <div data-slot="section-title" className={styles.sectionTitle}>
            <span data-slot="subheading" className={styles.subheading}>Daily goal</span>
            <span data-slot="subheading" className={styles.subheading}>
              {Math.min(completedCount, goalTarget)} / {goalTarget}
            </span>
          </div>
          <ProgressBar value={Math.min(completedCount, goalTarget)} max={goalTarget} tone="daily" />
        </div>

        <div data-slot="stats-grid" className={styles.profileStats}>
          <div data-slot="stat" className={styles.profileStat}>
            <div className={styles.statValueRow}>
              <span data-slot="stat-value" className={styles.statValue}>{profile.totalXp}</span>
              <span className={styles.statUnit}>xp</span>
            </div>
            <div data-slot="stat-label" className={styles.statLabel}>Total</div>
          </div>
          <div data-slot="stat" className={styles.profileStat}>
            <div className={styles.statValueRow}>
              <span data-slot="stat-value" className={styles.statValue}>{profile.coins}</span>
              <CoinsIcon aria-hidden="true" size={16} weight="duotone" />
            </div>
            <div data-slot="stat-label" className={styles.statLabel}>{theme.copy.coinLabel}</div>
          </div>
          <div data-slot="stat" className={styles.profileStat}>
            <div className={styles.statValueRow}>
              <span data-slot="stat-value" className={styles.statValue}>{profile.streak}</span>
              <FireIcon aria-hidden="true" size={15} weight="duotone" />
            </div>
            <div data-slot="stat-label" className={styles.statLabel}>Ritual streak</div>
          </div>
          <div data-slot="stat" className={styles.profileStat}>
            <div className={styles.statValueRow}>
              <span data-slot="stat-value" className={styles.statValue}>
                {profile.nextLevelXp - profile.currentLevelXp}
              </span>
              <span className={styles.statUnit}>xp</span>
            </div>
            <div data-slot="stat-label" className={styles.statLabel}>Next level</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
