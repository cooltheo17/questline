import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { QuickAddComposer } from './QuickAddComposer'

describe('QuickAddComposer', () => {
  it('creates a task when Enter is pressed in collapsed mode', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)

    render(
      <QuickAddComposer
        categories={[
          {
            id: 'inbox',
            name: 'General',
            iconKey: 'scroll',
            colorKey: 'accent',
            sortOrder: 0,
            archived: false,
          },
        ]}
        onCreate={onCreate}
      />,
    )

    await user.type(screen.getByPlaceholderText(/add a task/i), 'Buy groceries{enter}')

    expect(onCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Buy groceries',
        categoryIds: ['inbox'],
        cadence: 'none',
        difficulty: 'small',
      }),
    )
  })
})
