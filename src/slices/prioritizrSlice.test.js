import { describe, expect, it } from 'vitest'

import reducer, { clearRuns, setSelectedRuns, toggleRun } from './prioritizrSlice'

describe('prioritizrSlice', () => {
  it('toggleRun adds an unselected run and removes a selected one', () => {
    let state = reducer(undefined, toggleRun(3))
    state = reducer(state, toggleRun(5))
    expect(state.selectedRunIds).toEqual([3, 5])
    expect(reducer(state, toggleRun(3)).selectedRunIds).toEqual([5])
  })

  it('setSelectedRuns replaces and clearRuns empties the selection', () => {
    const state = reducer(undefined, setSelectedRuns([1, 2]))
    expect(state.selectedRunIds).toEqual([1, 2])
    expect(reducer(state, clearRuns()).selectedRunIds).toEqual([])
  })
})
