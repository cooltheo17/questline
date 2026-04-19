import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check'
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { Button, Card } from '../../components/primitives/Primitives'
import { deleteBulkImport, deleteTask } from '../../data/repository'
import { formatCadenceLabel } from '../../domain/taskUi'
import type { Task } from '../../domain/types'
import sharedStyles from '../../components/app/Shared.module.css'
import { SectionHeading } from '../../components/app/SectionHeading'
import styles from '../Page.module.css'
import { ManageMetricList, ManageRailCard, ManageTabLayout } from './ManageTabLayout'
import type { BulkImportSummary } from './managePageUtils'

interface ManageTasksSectionProps {
  bulkImportBatches: BulkImportSummary[]
  sortedTasks: Task[]
  onEditTask: (task: Task) => void
  onRetireTask: (task: Task) => void
}

export function ManageTasksSection({
  bulkImportBatches,
  sortedTasks,
  onEditTask,
  onRetireTask,
}: ManageTasksSectionProps) {
  const activeTaskCount = sortedTasks.filter((task) => task.active).length
  const recurringTaskCount = sortedTasks.filter((task) => task.cadence !== 'none').length

  return (
    <ManageTabLayout
      rail={
        <>
          <ManageRailCard
            title="Overview"
            description="Tasks now sit in the same main-and-rail frame as the other Manage sections, which keeps tab switches visually stable."
          >
            <ManageMetricList
              items={[
                { label: 'Total tasks', value: sortedTasks.length },
                { label: 'Active', value: activeTaskCount },
                { label: 'Recurring', value: recurringTaskCount },
                { label: 'Completed', value: sortedTasks.length - activeTaskCount },
              ]}
            />
          </ManageRailCard>

          <Card>
            <div data-slot="section-panel" className={sharedStyles.panel}>
              <SectionHeading title="Bulk imports" />
              {bulkImportBatches.length ? (
                <div data-slot="stack-list" className={sharedStyles.list}>
                  {bulkImportBatches.map((batch) => (
                    <div key={batch.id} className={styles.row}>
                      <div>
                        <strong>{batch.label}</strong>
                        <p data-slot="muted-text" className={sharedStyles.muted}>
                          {batch.taskCount} tasks · {batch.questCount} quests · {batch.categoryCount} categories
                        </p>
                      </div>
                      <div data-slot="action-group" className={sharedStyles.actions}>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => {
                            if (window.confirm(`Remove "${batch.label}" and everything it imported? This cannot be undone.`)) {
                              void deleteBulkImport(batch.id)
                            }
                          }}
                        >
                          <span className={sharedStyles.inlineLabel}>
                            <TrashIcon aria-hidden="true" size={15} weight="bold" />
                            <span>Remove batch</span>
                          </span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p data-slot="muted-text" className={sharedStyles.muted}>No bulk imports recorded.</p>
              )}
            </div>
          </Card>
        </>
      }
    >
      <Card>
        <div data-slot="section-panel" className={sharedStyles.panel}>
          <SectionHeading title="Task library" />
          <div data-slot="stack-list" className={sharedStyles.list}>
            {sortedTasks.length ? (
              sortedTasks.map((task) => (
                <div key={task.id} className={styles.row}>
                  <div>
                    <strong>{task.title}</strong>
                    <p data-slot="muted-text" className={sharedStyles.muted}>
                      {formatCadenceLabel(task.cadence)}
                      {task.dueDate ? ` · due ${task.dueDate}` : ''}
                      {' · '}
                      {task.categoryIds.length === 0 ? 'Uncategorized' : `${task.categoryIds.length} categories`}
                      {' · '}
                      {task.subtasks.length} subtasks
                      {task.importBatchId ? ' · bulk import' : ''}
                      {!task.active ? ' · completed' : ''}
                    </p>
                  </div>
                  <div data-slot="action-group" className={sharedStyles.actions}>
                    {task.cadence !== 'none' && task.active ? (
                      <Button size="sm" variant="secondary" onClick={() => onRetireTask(task)}>
                        <span className={sharedStyles.inlineLabel}>
                          <CheckIcon aria-hidden="true" size={15} weight="bold" />
                          <span>Complete</span>
                        </span>
                      </Button>
                    ) : null}
                    <Button size="sm" variant="secondary" onClick={() => onEditTask(task)}>
                      <span className={sharedStyles.inlineLabel}>
                        <PencilSimpleIcon aria-hidden="true" size={15} weight="bold" />
                        <span>Edit</span>
                      </span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
                          void deleteTask(task.id)
                        }
                      }}
                    >
                      <span className={sharedStyles.inlineLabel}>
                        <TrashIcon aria-hidden="true" size={15} weight="bold" />
                        <span>Delete</span>
                      </span>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p data-slot="muted-text" className={sharedStyles.muted}>No tasks yet.</p>
            )}
          </div>
        </div>
      </Card>
    </ManageTabLayout>
  )
}
