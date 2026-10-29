import { configureStore } from '@reduxjs/toolkit'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getServerCapabilities } from '../Server/serverFunctions'
import reducer, { initialiseServer, switchProject, toggleProjDialog } from './projectSlice'

vi.mock('../Server/serverFunctions', () => ({
  getServerCapabilities: vi.fn(),
}))

const init = () => reducer(undefined, { type: '@@init' })
function makeStore() {
  return configureStore({
    reducer: { project: reducer },
  })
}

describe('projectSlice', () => {
  it('toggleProjDialog sets a dialog flag', () => {
    expect(reducer(init(), toggleProjDialog({ dialogName: 'projectsDialogOpen', isOpen: true })).dialogs.projectsDialogOpen).toBe(true)
  })

  it('switchProject lifecycle drives status and error', () => {
    const loading = reducer(init(), switchProject.pending('req', 1))
    expect(loading).toMatchObject({ status: 'loading', error: null })
    expect(reducer(loading, switchProject.fulfilled(1, 'req', 1)).status).toBe('succeeded')
    expect(reducer(loading, switchProject.rejected(new Error('x'), 'req', 1)))
      .toMatchObject({ status: 'failed', error: 'Failed to switch project' })
  })

  it('switchProject keeps the reason bootstrapProject rejected with', async () => {
    const store = makeStore()
    // a store without the API slice makes listProjects fail inside bootstrapProject
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await store.dispatch(switchProject(null)).catch(() => {})
    const project = store.getState().project
    expect(project.status).toBe('failed')
    expect(project.error).toEqual(expect.any(String))
    expect(project.error).not.toBe('Failed to switch project')
    vi.mocked(console.error).mockRestore()
  })

  describe('initialiseServer', () => {
    beforeEach(() => {
      vi.mocked(getServerCapabilities).mockReset()
    })

    it('stores the server and flags a newer WDPA version', async () => {
      const store = makeStore()
      const latest = store.getState().project.registry.WDPA.latest_version
      vi.mocked(getServerCapabilities).mockResolvedValue({ wdpa_version: `${latest}-old`, guestUserEnabled: true })

      await store.dispatch(initialiseServer())
      const project = store.getState().project

      expect(project.status).toBe('succeeded')
      expect(project.newWDPAVersion).toBe(true)
      expect(project.wdpaVectorTilesLayerName).toBe(`${latest}-old`)
      expect(project.bpServer.isGuestUser).toBe(true)
    })

    it('records the failure message', async () => {
      const store = makeStore()
      vi.mocked(getServerCapabilities).mockImplementation(async () => {
        throw new Error('offline')
      })

      await store.dispatch(initialiseServer())
      expect(store.getState().project).toMatchObject({ status: 'failed', error: 'offline' })
    })
  })
})
