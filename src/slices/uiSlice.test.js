import { describe, expect, it } from 'vitest'

import reducer, { addToImportLog, clearImportLog, removeImportLogMessage, setCellOutline, toggleDialog } from './uiSlice'

const init = () => reducer(undefined, { type: '@@init' })

describe('uiSlice', () => {
  it('setCellOutline merges into the existing outline', () => {
    const before = init().cellOutline
    const after = reducer(init(), setCellOutline({ width: 3 })).cellOutline
    expect(after).toEqual({ ...before, width: 3 })
  })

  it('toggleDialog opens and closes by name', () => {
    const open = reducer(init(), toggleDialog({ dialogName: 'resendPasswordDialogOpen', isOpen: true }))
    expect(open.dialogStates.resendPasswordDialogOpen).toBe(true)
    expect(reducer(open, toggleDialog({ dialogName: 'resendPasswordDialogOpen', isOpen: false })).dialogStates.resendPasswordDialogOpen).toBe(false)
  })

  describe('import log', () => {
    const withLog = [
      { status: 'Preprocessing' },
      { status: 'RunningQuery' },
      { status: 'Finished' },
      { status: 'RunningQuery' },
    ].reduce((s, m) => reducer(s, addToImportLog(m)), init())

    it('appends messages in order', () => {
      expect(withLog.importLog.map(m => m.status)).toEqual([
        'Preprocessing',
        'RunningQuery',
        'Finished',
        'RunningQuery',
      ])
    })

    it('removeImportLogMessage drops every entry with that status', () => {
      expect(reducer(withLog, removeImportLogMessage('RunningQuery')).importLog).toEqual([
        { status: 'Preprocessing' },
        { status: 'Finished' },
      ])
    })

    it('clearImportLog empties the log', () => {
      expect(reducer(withLog, clearImportLog()).importLog).toEqual([])
    })
  })
})
