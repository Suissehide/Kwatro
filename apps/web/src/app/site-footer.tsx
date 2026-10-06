'use client'
import { SiteFooter } from '@lucko/design-system'
import { useSyncExternalStore } from 'react'

const COMPACT = '(max-width: 899px)'

function subscribe(onChange: () => void) {
  const query = matchMedia(COMPACT)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** Pied de page du site. Variante compacte au rendu serveur (mobile d'abord), sans écart à l'hydratation. */
export function Footer() {
  const compact = useSyncExternalStore(
    subscribe,
    () => matchMedia(COMPACT).matches,
    () => true,
  )
  return <SiteFooter compact={compact} />
}
