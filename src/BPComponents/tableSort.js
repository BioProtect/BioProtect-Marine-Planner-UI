// Server dates come as "DD/MM/YY HH:MI:SS" (features) or "DD/MM/YYYY HH:MI"
// (activities).
function parseCreatedAt(value) {
  if (!value)
    return 0
  const [d, m, y, time = ''] = value.replace(' ', '/').split('/')
  const [hh = 0, mm = 0, ss = 0] = time.split(':')
  const year = y.length === 2
    ? 2000 + Number(y)
    : Number(y)
  return new Date(year, m - 1, d, hh, mm, ss).getTime() || 0
}

function descendingComparator(a, b, orderBy) {
  const av = orderBy === 'creation_date'
    ? parseCreatedAt(a[orderBy])
    : a[orderBy]
  const bv = orderBy === 'creation_date'
    ? parseCreatedAt(b[orderBy])
    : b[orderBy]
  if (bv < av)
    return -1
  if (bv > av)
    return 1
  return 0
}

export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy)
}
