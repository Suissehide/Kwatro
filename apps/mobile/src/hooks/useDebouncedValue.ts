import { useEffect, useState } from 'react'

/** `value` une fois la saisie arrêtée depuis `delay` ms (recherche pendant la frappe). */
export function useDebouncedValue<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
