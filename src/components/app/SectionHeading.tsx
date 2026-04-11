import type { ReactNode } from 'react'
import sharedStyles from './Shared.module.css'

interface SectionHeadingProps {
  icon?: ReactNode
  title: string
  actions?: ReactNode
}

export function SectionHeading({ icon, title, actions }: SectionHeadingProps) {
  return (
    <div data-slot="section-title" className={sharedStyles.sectionTitle}>
      <h2 data-slot="section-heading" className={sharedStyles.heading}>
        <span className={sharedStyles.headingInline}>
          {icon}
          <span>{title}</span>
        </span>
      </h2>
      {actions ? (
        <div data-slot="section-actions" className={sharedStyles.actions}>
          {actions}
        </div>
      ) : null}
    </div>
  )
}
