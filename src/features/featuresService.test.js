import { describe, expect, it } from 'vitest'

import { PALETTE } from '../bpVars'
import { featureColor, getPaintProperty, getTypeProperty } from './featuresService'

const POINTS = 'Imported shapefile (points)'

describe('featureColor', () => {
  it('keeps an explicit colour', () => {
    expect(featureColor({ id: 3, color: '#123456' })).toBe('#123456')
  })

  it('picks a stable palette colour by id', () => {
    const n = PALETTE.features.length
    expect(featureColor({ id: 1 })).toBe(featureColor({ id: 1 + n }))
    expect(featureColor({ id: 'not-a-number' })).toBe(PALETTE.features[0])
  })
})

describe('getPaintProperty / getTypeProperty', () => {
  it('uses fill for polygons', () => {
    const feature = Object.freeze({ id: 1, source: 'Imported shapefile' })
    expect(getTypeProperty(feature)).toBe('fill')
    expect(getPaintProperty(feature)['fill-color']).toBe(featureColor(feature))
  })

  it('uses circles for point shapefiles', () => {
    const feature = { id: 1, source: POINTS, color: '#abcdef' }
    expect(getTypeProperty(feature)).toBe('circle')
    expect(getPaintProperty(feature)).toMatchObject({ 'circle-color': '#abcdef', 'circle-radius': 3 })
  })
})
