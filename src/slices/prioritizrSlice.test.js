import { describe, expect, it } from 'vitest'

import reducer, {
  addComparedProject,
  clearRuns,
  removeComparedProject,
  setSelectedRuns,
  toggleComparedRun,
  toggleRun,
} from './prioritizrSlice'
import { setActiveProjectId } from './projectSlice'

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

describe('prioritizrSlice comparison', () => {
  it('toggleComparedRun adds and removes; clearRuns empties both lists', () => {
    let state = reducer(undefined, toggleRun(1))
    state = reducer(state, toggleComparedRun(9))
    state = reducer(state, toggleComparedRun(8))
    expect(reducer(state, toggleComparedRun(9)).comparedRunIds).toEqual([8])
    state = reducer(state, clearRuns())
    expect([state.selectedRunIds, state.comparedRunIds]).toEqual([[], []])
  })

  it('switching project drops both lists; reloading the same one keeps them', () => {
    let state = reducer(undefined, setActiveProjectId(4))
    state = reducer(state, toggleRun(1))
    state = reducer(state, toggleComparedRun(9))
    state = reducer(state, setActiveProjectId(4))
    expect([state.selectedRunIds, state.comparedRunIds]).toEqual([
      [1],
      [9],
    ])
    state = reducer(state, setActiveProjectId(5))
    expect([state.selectedRunIds, state.comparedRunIds]).toEqual([[], []])
  })

  it('a compared project stays listed with no run ticked; removing it drops its runs', () => {
    let state = reducer(undefined, addComparedProject({ id: 7, name: 'B' }))
    state = reducer(state, addComparedProject({ id: 7, name: 'B' }))
    state = reducer(state, toggleComparedRun(9))
    state = reducer(state, toggleComparedRun(9))
    expect(state.comparedProjects).toEqual([
      { id: 7, name: 'B' },
    ])
    state = reducer(state, toggleComparedRun(9))
    state = reducer(state, toggleComparedRun(12))
    state = reducer(state, removeComparedProject({
      id: 7,
      runIds: [9],
    }))
    expect([state.comparedProjects, state.comparedRunIds]).toEqual([
      [],
      [12],
    ])
    state = reducer(reducer(state, addComparedProject({ id: 7, name: 'B' })), clearRuns())
    expect(state.comparedProjects).toEqual([])
  })
})
