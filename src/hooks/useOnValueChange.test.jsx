import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useOnValueChange } from './useOnValueChange'

describe('useOnValueChange', () => {
  it('fires once per change and not on mount', () => {
    const onChange = vi.fn()
    const { rerender } = renderHook(({ value }) => useOnValueChange(value, onChange), {
      initialProps: { value: 'a' },
    })
    expect(onChange).not.toHaveBeenCalled()

    rerender({ value: 'a' })
    expect(onChange).not.toHaveBeenCalled()

    rerender({ value: 'b' })
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith('b')
  })
})
