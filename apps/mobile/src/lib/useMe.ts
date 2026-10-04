import type { Me } from '@kwatro/shared'
import { router, useFocusEffect } from 'expo-router'
import { useCallback, useState } from 'react'
import { api } from './api'

/**
 * Joueur connecté, rechargé à chaque retour sur l'écran (profil modifié entre-temps).
 * `required` : écran réservé aux joueurs connectés, renvoie vers /auth sans session.
 */
export function useMe({ required = false } = {}) {
  const [me, setMe] = useState<Me | null>(null)
  useFocusEffect(
    useCallback(() => {
      api.GET('/me').then(
        ({ data, response }) => {
          if (required && response.status === 401) router.replace('/auth')
          setMe(data ?? null)
        },
        () => setMe(null),
      )
    }, [required]),
  )
  return me
}
