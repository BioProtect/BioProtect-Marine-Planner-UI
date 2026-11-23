import { describe, expect, it } from 'vitest'
import { getComparator } from './tableSort'

const ids = rows => rows.map(r => r.id)

describe('getComparator', () => {
  it('sorts activity dates (DD/MM/YYYY HH:MI) chronologically', () => {
    const rows = [
      { id: 1, creation_date: '02/03/2026 10:00' },
      { id: 2, creation_date: '15/01/2025 09:30' },
      { id: 3, creation_date: '02/03/2026 08:00' },
    ]
    expect(ids(rows.sort(getComparator('asc', 'creation_date')))).toEqual([2, 3, 1])
  })

  it('sorts feature dates (DD/MM/YY HH:MI:SS) chronologically', () => {
    const rows = [
      { id: 1, creation_date: '01/01/26 00:00:01' },
      { id: 2, creation_date: '31/12/25 23:59:59' },
    ]
    expect(ids(rows.sort(getComparator('desc', 'creation_date')))).toEqual([1, 2])
  })

  it('sorts plain text columns', () => {
    const rows = [
      { id: 1, activity: 'b' },
      { id: 2, activity: 'a' },
    ]
    expect(ids(rows.sort(getComparator('asc', 'activity')))).toEqual([2, 1])
  })
})
