import type { ReactNode } from 'react'
import { Card } from '../../components/primitives/Primitives'
import styles from '../Page.module.css'

interface ManageTabLayoutProps {
  children: ReactNode
  rail: ReactNode
}

interface ManageRailCardProps {
  title: string
  description?: ReactNode
  children?: ReactNode
}

interface ManageMetricListProps {
  items: Array<{ label: string; value: ReactNode }>
}

export function ManageTabLayout({ children, rail }: ManageTabLayoutProps) {
  return (
    <div className={styles.manageLayout}>
      <div className={styles.manageMain}>{children}</div>
      <aside className={styles.manageRail}>{rail}</aside>
    </div>
  )
}

export function ManageRailCard({ title, description, children }: ManageRailCardProps) {
  return (
    <Card>
      <div className={styles.manageRailCard}>
        <div className={styles.manageRailHeader}>
          <h2 className={styles.manageRailTitle}>{title}</h2>
          {description ? <div className={styles.manageRailDescription}>{description}</div> : null}
        </div>
        {children}
      </div>
    </Card>
  )
}

export function ManageMetricList({ items }: ManageMetricListProps) {
  return (
    <dl className={styles.manageMetricList}>
      {items.map((item) => (
        <div key={item.label} className={styles.manageMetric}>
          <dt className={styles.manageMetricLabel}>{item.label}</dt>
          <dd className={styles.manageMetricValue}>{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
