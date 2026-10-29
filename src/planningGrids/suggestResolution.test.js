import { describe, expect, it } from 'vitest'

import { suggestResolution } from '../bpVars.jsx'

describe('suggestResolution', () => {
  it('picks the finest resolution at or under 50k cells', () => {
    expect(suggestResolution(2)).toBe(9) // tiny bay: ~19 cells at res 9
    expect(suggestResolution(12_300)).toBe(8) // 1°x1° at the equator: ~16.7k at res 8, ~117k at res 9
    expect(suggestResolution(100_000)).toBe(7) // ~19k at res 7, ~136k at res 8
  })

  it('falls back to res 6 when every resolution is too fine', () => {
    expect(suggestResolution(5_000_000)).toBe(6)
  })
})
