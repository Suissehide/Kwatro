import type { Me } from '@kwatro/shared'
import { useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { api } from './api'

/** Joueur connecté, rechargé à chaque retour sur l'écran (profil modifié entre-temps). */
export function useMe() {
  const [me, setMe] = useState<Me | null>(null)
  useFocusEffect(
    useCallback(() => {
      api.GET('/me').then(
        ({ data }) => setMe(data ?? null),
        () => setMe(null),
      )
    }, []),
  )
  return me
}
