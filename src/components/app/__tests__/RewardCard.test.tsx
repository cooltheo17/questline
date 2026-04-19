import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { RewardCard } from '../RewardCard'

describe('RewardCard', () => {
  it('disables the purchase button when coins are insufficient', () => {
    render(
      <RewardCard
        reward={{
          id: 'reward',
          title: 'New hoodie',
          coinCost: 120,
          repeatable: false,
          archived: false,
          createdAt: '2026-03-18T08:00:00.000Z',
        }}
        canBuy={false}
        onBuy={vi.fn().mockResolvedValue(false)}
      />,
    )

    expect(screen.getByRole('button', { name: /need more coins/i })).toBeDisabled()
  })
})
