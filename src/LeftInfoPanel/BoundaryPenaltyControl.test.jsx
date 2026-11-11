import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import BoundaryPenaltyControl from './BoundaryPenaltyControl'

describe('boundaryPenaltyControl', () => {
  it('shows the level matching the current penalty', () => {
    render(<BoundaryPenaltyControl value={0.5} onChange={vi.fn()} />)
    expect(screen.getByRole('slider')).toHaveValue('2')
    expect(screen.getByText('Groups cells into larger patches.')).toBeInTheDocument()
  })

  it('treats an unknown penalty as None', () => {
    render(<BoundaryPenaltyControl value={0.42} onChange={vi.fn()} />)
    expect(screen.getByRole('slider')).toHaveValue('0')
  })

  it('reports the penalty for the chosen level', () => {
    const onChange = vi.fn()
    render(<BoundaryPenaltyControl value={0.3} onChange={onChange} />)
    // jsdom has no native range-input keyboard handling, so drive the change event
    fireEvent.change(screen.getByRole('slider'), {
      target: { value: 2 },
    })
    expect(onChange).toHaveBeenCalledWith(0.5)
  })
})
