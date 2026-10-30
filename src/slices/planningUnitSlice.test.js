import { describe, expect, it } from 'vitest'

import reducer, { setIdentifyPlanningUnits, togglePUD } from './planningUnitSlice'

const init = () => reducer(undefined, { type: '@@init' })

describe('planningUnitSlice', () => {
  it('setIdentifyPlanningUnits merges and tolerates a null payload', () => {
    let state = reducer(init(), setIdentifyPlanningUnits({ a: 1 }))
    state = reducer(state, setIdentifyPlanningUnits({ b: 2 }))
    expect(state.identifyPlanningUnits).toMatchObject({ a: 1, b: 2 })
    expect(reducer(state, setIdentifyPlanningUnits(null)).identifyPlanningUnits).toEqual(state.identifyPlanningUnits)
  })

  it('togglePUD sets a dialog flag', () => {
    expect(reducer(init(), togglePUD({ dialogName: 'x', isOpen: true })).dialogs.x).toBe(true)
  })
})
