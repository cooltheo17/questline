import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuickAddComposer } from '../QuickAddComposer'

describe('QuickAddComposer', () => {
  it('creates a task when Enter is pressed in collapsed mode', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    const onBulkCreate = vi.fn().mockResolvedValue({ batchId: 'batch-1', categoryIds: [], questIds: [], taskIds: [] })

    render(
      <QuickAddComposer
        categories={[]}
        quests={[]}
        onCreate={onCreate}
        onBulkCreate={onBulkCreate}
      />,
    )

    await user.type(screen.getByPlaceholderText(/add a task/i), 'Buy groceries{enter}')

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Buy groceries',
        categoryIds: [],
        cadence: 'none',
        difficulty: 'small',
      }),
    )
  })

  it('parses and submits bulk JSON imports', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    const onBulkCreate = vi.fn().mockResolvedValue({ batchId: 'batch-1', categoryIds: [], questIds: [], taskIds: ['task-1'] })

    render(
      <QuickAddComposer
        categories={[]}
        quests={[]}
        onCreate={onCreate}
        onBulkCreate={onBulkCreate}
      />,
    )

    await user.click(screen.getByRole('button', { name: /options/i }))
    await user.click(screen.getByRole('button', { name: /paste json/i }))
    await user.click(screen.getByRole('textbox', { name: /json/i }))
    await user.paste('{"tasks":[{"title":"Break down taxes","subtasks":["Find P60","Book accountant"]}]}')
    await user.click(screen.getByRole('button', { name: /import items/i }))

    expect(onBulkCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        summary: {
          categoryCount: 0,
          questCount: 0,
          taskCount: 1,
          subtaskCount: 2,
        },
      }),
    )
  })
})
