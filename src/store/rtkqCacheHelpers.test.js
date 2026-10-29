import { describe, expect, it } from 'vitest'

import { patchItemById, replaceItemsById } from './rtkqCacheHelpers'

describe.each([
  [
    'an array',
    items => items,
    draft => draft,
  ],
  [
    'a { data } object',
    items => ({ data: items }),
    draft => draft.data,
  ],
])('cache helpers on %s', (_, wrap, unwrap) => {
  it('replaceItemsById swaps matching items only', () => {
    const draft = wrap([
      { id: 1, v: 'a' },
      { id: 2, v: 'b' },
    ])
    replaceItemsById(draft, new Map([
      [
        2,
        { id: 2, v: 'B' },
      ],
    ]))
    expect(unwrap(draft)).toEqual([
      { id: 1, v: 'a' },
      { id: 2, v: 'B' },
    ])
  })

  it('patchItemById merges into the matching item', () => {
    const draft = wrap([
      { id: 1, v: 'a', keep: true },
    ])
    patchItemById(draft, 1, { v: 'z' })
    expect(unwrap(draft)).toEqual([
      { id: 1, v: 'z', keep: true },
    ])
  })

  it('patchItemById ignores unknown ids', () => {
    const draft = wrap([
      { id: 1 },
    ])
    patchItemById(draft, 99, { v: 'z' })
    expect(unwrap(draft)).toEqual([
      { id: 1 },
    ])
  })
})

describe('cache helpers on unsupported shapes', () => {
  it('leave non-list drafts alone', () => {
    const draft = { data: null }
    replaceItemsById(draft, new Map())
    patchItemById(draft, 1, {})
    expect(draft).toEqual({ data: null })
  })
})
