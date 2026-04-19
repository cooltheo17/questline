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
})
