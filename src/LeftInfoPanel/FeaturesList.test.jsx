import { getPaintProperty } from '@features/featuresService'
import { featureApiSlice, setSelectedFeatureIds } from '@slices/featureSlice'
import { waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithProviders } from '../test/renderWithProviders'
import FeaturesList from './FeaturesList'

describe('featuresList', () => {
  it('colours an active row the same as its map layer, with no colour from the server', async () => {
    const feature = { id: 1, alias: 'Kelp', feature_layer_loaded: true }
    const { container } = renderWithProviders(<FeaturesList />, {
      actions: [
        featureApiSlice.util.upsertQueryData('getAllFeatures', undefined, {
          data: [feature],
        }),
        setSelectedFeatureIds([1]),
      ],
    })

    await waitFor(() => {
      expect(container.querySelector('svg path[fill-opacity]')?.getAttribute('fill'))
        .toBe(getPaintProperty(feature)['fill-color'])
    })
  })
})
