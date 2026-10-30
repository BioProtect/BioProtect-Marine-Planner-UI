import { describe, expect, it, vi } from 'vitest'

import {
  boxToBounds,
  envelopeToBounds,
  formatPct,
  formatPx,
  generateTableCols,
  getArea,
  isValidTargetValue,
  zoomToBounds,
} from './Helpers'

describe('boxToBounds', () => {
  it('parses a PostGIS BOX string', () => {
    expect(boxToBounds('BOX(-10.5 50,2e-3 60.25)')).toEqual([-10.5, 50, 0.002, 60.25])
  })

  it('returns null for missing or malformed input', () => {
    expect(boxToBounds(null)).toBeNull()
    expect(boxToBounds('BOX(1 2)')).toBeNull()
  })
})

describe('envelopeToBounds', () => {
  it('takes min/max of the first ring', () => {
    const wkt = 'MULTIPOLYGON(((-5 10,5 10,5 20,-5 20,-5 10)))'
    expect(envelopeToBounds(wkt)).toEqual([-5, 10, 5, 20])
  })

  it('returns null for empty input', () => {
    expect(envelopeToBounds('')).toBeNull()
  })
})

describe('isValidTargetValue', () => {
  it('accepts whole numbers from 0 to 100', () => {
    expect(isValidTargetValue('0')).toBe(true)
    expect(isValidTargetValue('100')).toBe(true)
    expect(isValidTargetValue(17)).toBe(true)
  })

  it('rejects out-of-range, negative and decimal values', () => {
    expect(isValidTargetValue('101')).toBe(false)
    expect(isValidTargetValue('-1')).toBe(false)
    expect(isValidTargetValue('50.5')).toBe(false)
    expect(isValidTargetValue('')).toBe(false)
  })
})

describe('getArea', () => {
  it('converts m² to km² by default, to 3 significant figures', () => {
    expect(getArea(1_234_567, 'Km2', false, 3, false)).toBe('1.23 km²')
  })

  it('converts between units', () => {
    expect(getArea(25_000, 'ha', false, 3, false)).toBe('2.5 ha')
    expect(getArea(2, 'm2', false, 3, false, 'km2')).toBe('2000000 m²')
  })

  it('shows a dash for missing values', () => {
    expect(getArea(null)).toBe('–')
    expect(getArea(Number.NaN)).toBe('–')
  })
})

describe('zoomToBounds', () => {
  const fit = (bounds) => {
    const fitBounds = vi.fn()
    zoomToBounds({
      current: { fitBounds },
    }, bounds)
    return fitBounds.mock.calls[0][0]
  }

  it('fits ordinary bounds unchanged', () => {
    expect(fit([-10, 40, 10, 50])).toEqual([-10, 40, 10, 50])
  })

  it('wraps across the dateline when that span is shorter', () => {
    expect(fit([-175, -20, 175, -10])).toEqual([175, -20, 185, -10])
  })
})

describe('generateTableCols', () => {
  it('applies defaults and per-column overrides', () => {
    expect(generateTableCols(
      [
        { id: 'name', label: 'Name' },
        { id: 'area', label: 'Area' },
      ],
      {
        area: { numeric: true, disablePadding: false },
      },
    )).toEqual([
      {
        id: 'name',
        label: 'Name',
        numeric: false,
        disablePadding: true,
      },
      {
        id: 'area',
        label: 'Area',
        numeric: true,
        disablePadding: false,
      },
    ])
  })
})

describe('formatPct / formatPx', () => {
  it('shows Off at zero', () => {
    expect(formatPct(0)).toBe('Off')
    expect(formatPx(0)).toBe('Off')
  })

  it('formats non-zero values', () => {
    expect(formatPct(0.704)).toBe('70%')
    expect(formatPx(3)).toBe('3px')
  })
})
