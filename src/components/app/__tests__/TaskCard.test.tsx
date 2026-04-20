import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeProvider } from '../../../theme/themeContext'
import { TaskCard } from '../TaskCard'

const task = {
  id: 'task-1',
  title: 'Write weekly review',
  notes: 'Summarise blockers and wins.',
  categoryIds: [],
  cadence: 'none' as const,
  difficulty: 'small' as const,
  subtasks: [],
  active: true,
  sortOrder: 0,
  anchorDate: '2026-04-19',
  createdAt: '2026-04-19T09:00:00.000Z',
}

describe('TaskCard', () => {
  it('uses a dedicated drag handle instead of making the full card draggable', () => {
    const { container } = render(
      <ThemeProvider>
        <TaskCard
          task={task}
          categories={[]}
          isCompleted={false}
          draggable
          onComplete={vi.fn().mockResolvedValue(undefined)}
          onToggleSubtask={vi.fn().mockResolvedValue(undefined)}
        />
      </ThemeProvider>,
    )

    expect(container.querySelector('[data-slot="task-card"]')).not.toHaveAttribute('draggable', 'true')
    expect(screen.getByRole('button', { name: /drag to reorder write weekly review/i })).toHaveAttribute('draggable', 'true')
  })

  it('omits the drag handle when reordering is disabled', () => {
    render(
      <ThemeProvider>
        <TaskCard
          task={task}
          categories={[]}
          isCompleted={false}
          onComplete={vi.fn().mockResolvedValue(undefined)}
          onToggleSubtask={vi.fn().mockResolvedValue(undefined)}
        />
      </ThemeProvider>,
    )

    expect(screen.queryByRole('button', { name: /drag to reorder/i })).not.toBeInTheDocument()
  })

  it('counts only current subtasks in the progress label', () => {
    render(
      <ThemeProvider>
        <TaskCard
          task={{
            ...task,
            subtasks: Array.from({ length: 6 }, (_, index) => ({
              id: `subtask-${index + 1}`,
              title: `Subtask ${index + 1}`,
              sortOrder: index,
            })),
          }}
          categories={[]}
          completion={{
            id: 'completion-1',
            taskId: task.id,
            occurrenceKey: '2026-04-20',
            completedSubtaskIds: ['stale-1', 'stale-2', 'stale-3', 'subtask-1'],
            xpAwarded: 0,
            coinsAwarded: 0,
          }}
          isCompleted={false}
          onComplete={vi.fn().mockResolvedValue(undefined)}
          onToggleSubtask={vi.fn().mockResolvedValue(undefined)}
        />
      </ThemeProvider>,
    )

    expect(screen.getByText('1/6 steps')).toBeInTheDocument()
  })
})
