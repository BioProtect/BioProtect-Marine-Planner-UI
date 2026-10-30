import { useState } from 'react'

/**
 * Runs onChange during render when value changes, so the state it sets lands
 * before paint instead of costing the extra render a syncing useEffect does.
 * https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
 */
export function useOnValueChange(value, onChange) {
  const [previous, setPrevious] = useState(value)
  if (value !== previous) {
    setPrevious(value)
    onChange(value)
  }
}
