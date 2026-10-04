import { useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

/** `null` tant que le réglage n'est pas connu : attendre avant de lancer une animation d'entrée. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced)
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced)
    return () => sub.remove()
  }, [])
  return reduced
}
