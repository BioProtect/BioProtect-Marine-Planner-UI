import { describe, expect, it } from 'vitest'

import { hexToRgba, resolutionLabel } from './bpVars'

describe('resolutionLabel', () => {
  it('labels known resolutions, including numeric strings', () => {
    expect(resolutionLabel(7)).toMatch(/^Regional/)
    expect(resolutionLabel('9')).toMatch(/^Local/)
  })

  it('falls back for unknown resolutions', () => {
    expect(resolutionLabel(12)).toBe('-')
  })
})

describe('hexToRgba', () => {
  it('converts #rrggbb with alpha', () => {
    expect(hexToRgba('#ff8000', 0.5)).toBe('rgba(255, 128, 0, 0.5)')
  })
})
