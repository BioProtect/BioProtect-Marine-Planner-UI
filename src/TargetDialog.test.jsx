import { toggleDialog } from '@slices/uiSlice'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import TargetDialog from './TargetDialog'
import { renderWithProviders } from './test/renderWithProviders'

const open = toggleDialog({ dialogName: 'targetDialogOpen', isOpen: true })

function setup() {
  const updateTargetValueForFeatures = vi.fn()
  const utils = renderWithProviders(
    <TargetDialog updateTargetValueForFeatures={updateTargetValueForFeatures} />,
    {
      actions: [open],
    },
  )
  const input = screen.getByLabelText('Target Value')
  return { ...utils, input, updateTargetValueForFeatures }
}

describe('targetDialog', () => {
  it('is hidden until opened', () => {
    renderWithProviders(<TargetDialog updateTargetValueForFeatures={vi.fn()} />)
    expect(screen.queryByText('Target for all features')).not.toBeInTheDocument()
  })

  it('applies a valid target and closes', async () => {
    const { user, input, store, updateTargetValueForFeatures } = setup()
    await user.clear(input)
    await user.type(input, '30')
    await user.click(screen.getByRole('button', { name: 'OK' }))

    expect(updateTargetValueForFeatures).toHaveBeenCalledWith(30)
    expect(store.getState().ui.dialogStates.targetDialogOpen).toBe(false)
  })

  it('submits on Enter', async () => {
    const { user, input, updateTargetValueForFeatures } = setup()
    await user.type(input, '{Enter}')
    expect(updateTargetValueForFeatures).toHaveBeenCalledWith(17)
  })

  it('rejects a target over 100 and stays open', async () => {
    const { user, input, store, updateTargetValueForFeatures } = setup()
    await user.clear(input)
    await user.type(input, '150')
    await user.click(screen.getByRole('button', { name: 'OK' }))

    expect(screen.getByText('Invalid target')).toBeInTheDocument()
    expect(updateTargetValueForFeatures).not.toHaveBeenCalled()
    expect(store.getState().ui.dialogStates.targetDialogOpen).toBe(true)
  })
})
