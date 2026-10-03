import type { Me } from '@kwatro/shared'
import { useEffect, useState } from 'react'
import { api } from './api'

/** Joueur connecté, ou null (chargement, pas de session, API sans DEV_AUTH_HEADER en dev). */
export function useMe() {
  const [me, setMe] = useState<Me | null>(null)
  useEffect(() => {
    api.GET('/me').then(
      ({ data }) => setMe(data ?? null),
      () => setMe(null),
    )
  }, [])
  return me
}
