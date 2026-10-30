import {
  setSelectedFeatureIds,
  toggleFeatureD,
} from '@slices/featureSlice'
import { setActiveProjectId, toggleProjDialog } from '@slices/projectSlice'
import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithProviders } from '../test/renderWithProviders'
import FeaturesDialog from './FeaturesDialog'

const FEATURES = [
  { id: 1, alias: 'Kelp', created_by: 'global admin' },
  { id: 2, alias: 'Maerl', created_by: 'global admin' },
  { id: 3, alias: 'Seagrass', created_by: 'global admin' },
]

vi.mock('@slices/featureSlice', async importOriginal => ({
  ...(await importOriginal()),
  useGetAllFeaturesQuery: () => ({
    data: { data: FEATURES },
  }),
  useDeleteFeatureMutation: () => [
    vi.fn(),
    { isLoading: false },
  ],
}))

const open = toggleFeatureD({ dialogName: 'featuresDialogOpen', isOpen: true })
const projectOpen = setActiveProjectId(7)

function setup(actions = [projectOpen]) {
  const onOk = vi.fn()
  const utils = renderWithProviders(<FeaturesDialog onOk={onOk} />, {
    actions: [...actions, open],
  })
  return { ...utils, onOk }
}

const ticked = store => store.getState().feature.selectedFeatureIds
const isOpen = store => store.getState().feature.dialogs.featuresDialogOpen

describe('featuresDialog', () => {
  describe('with a project open', () => {
    it('saves the ticks to the project', async () => {
      const { user, store, onOk } = setup()
      await user.click(screen.getByText('Kelp'))
      await user.click(screen.getByRole('button', { name: 'Save to project' }))

      expect(ticked(store)).toEqual([1])
      expect(onOk).toHaveBeenCalledTimes(1)
    })

    it('cancel restores the selection from when it opened', async () => {
      const { user, store, onOk } = setup([
        projectOpen,
        setSelectedFeatureIds([2]),
      ])
      await user.click(screen.getByText('Kelp'))
      await user.click(screen.getByText('Maerl'))
      expect(ticked(store)).toEqual([1])

      await user.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(onOk).not.toHaveBeenCalled()
      expect(ticked(store)).toEqual([2])
      expect(isOpen(store)).toBe(false)
    })

    it('asks before a save that removes features', async () => {
      const { user, onOk } = setup([
        projectOpen,
        setSelectedFeatureIds([1, 2]),
      ])
      await user.click(screen.getByRole('button', { name: 'Clear all' }))
      await user.click(screen.getByRole('button', { name: 'Save to project' }))

      expect(screen.getByText('Remove 2 features from this project?')).toBeInTheDocument()
      expect(onOk).not.toHaveBeenCalled()

      await user.click(screen.getByRole('button', { name: 'Back' }))
      expect(onOk).not.toHaveBeenCalled()

      await user.click(await screen.findByRole('button', { name: 'Save to project' }))
      await user.click(screen.getByRole('button', { name: 'Remove and save' }))
      expect(onOk).toHaveBeenCalledTimes(1)
    })

    it('select all shown keeps ticks hidden by the search', async () => {
      const { user, store } = setup([
        projectOpen,
        setSelectedFeatureIds([1]),
      ])
      await user.type(screen.getByRole('textbox'), 'seagrass')
      expect(screen.queryByText('Kelp')).not.toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Select all shown' }))

      expect(ticked(store)).toEqual([1, 3])
    })

    it('shift-click toggles the range in on-screen order', async () => {
      const { user, store } = setup()
      await user.click(screen.getByText('Kelp'))
      await user.keyboard('{Shift>}')
      await user.click(screen.getByText('Seagrass'))
      await user.keyboard('{/Shift}')

      expect(ticked(store)).toEqual([1, 2, 3])
    })

    it('offers import', () => {
      setup()
      expect(screen.getByRole('button', { name: 'Import shapefile' })).toBeInTheDocument()
    })
  })

  describe('new project flow', () => {
    const newProject = [
      projectOpen,
      toggleProjDialog({ dialogName: 'newProjectDialogOpen', isOpen: true }),
    ]

    it('keeps the ticks without saving to the open project', async () => {
      const { user, store, onOk } = setup(newProject)
      await user.click(screen.getByText('Kelp'))
      await user.click(screen.getByRole('button', { name: 'Use these features' }))

      expect(onOk).not.toHaveBeenCalled()
      expect(ticked(store)).toEqual([1])
      expect(isOpen(store)).toBe(false)
    })

    it('hides import', () => {
      setup(newProject)
      expect(screen.queryByRole('button', { name: 'Import shapefile' })).not.toBeInTheDocument()
    })
  })

  describe('with no project open', () => {
    it('allows browsing and importing but not ticking or saving', async () => {
      const { user, store } = setup([])
      await user.click(screen.getByText('Kelp'))

      expect(ticked(store)).toEqual([])
      expect(screen.getByText('Open a project to add features')).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Save to project' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Import shapefile' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })
})
