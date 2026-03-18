import { motion } from 'framer-motion'
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
      <div className={styles.panel}>
        <div className={styles.sectionTitle}>
          <div>
            <h2 className={styles.heading}>Profile</h2>
            <p className={styles.subheading}>
              {theme.copy.levelLabel} {profile.level}
            </p>
          </div>
          <img className={styles.iconLg} src={theme.assets.levelBadge} alt="" />
        </div>

        <motion.div layout>
          <ProgressBar value={profile.currentLevelXp} max={profile.nextLevelXp} />
        </motion.div>

        <div className={styles.panelTight}>
          <div className={styles.sectionTitle}>
            <span className={styles.subheading}>Daily goal</span>
            <span className={styles.subheading}>
              {Math.min(completedCount, goalTarget)} / {goalTarget}
            </span>
          </div>
          <ProgressBar value={Math.min(completedCount, goalTarget)} max={goalTarget} />
        </div>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <div className={styles.statValue}>{profile.totalXp}</div>
            <div className={styles.statLabel}>{theme.copy.xpLabel}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{profile.coins}</div>
            <div className={styles.statLabel}>{theme.copy.coinLabel}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{profile.streak}</div>
            <div className={styles.statLabel}>Ritual streak</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statValue}>{profile.nextLevelXp - profile.currentLevelXp}</div>
            <div className={styles.statLabel}>XP to next level</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
