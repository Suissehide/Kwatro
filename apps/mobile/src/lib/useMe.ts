import type { Me } from '@kwatro/shared'
import { router, useFocusEffect } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import { useCallback, useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { api } from './api'

// Dernier profil connu, partagé par tous les écrans et gardé entre deux lancements :
// pas d'avatar « ? » ni de squelette le temps que /me réponde
const KEY = 'kwatro.me'
const storage = {
  get: async () =>
    Platform.OS === 'web' ? globalThis.localStorage?.getItem(KEY) : SecureStore.getItemAsync(KEY),
  set: async (value: string | null) => {
    if (Platform.OS === 'web')
      value === null
        ? globalThis.localStorage?.removeItem(KEY)
        : globalThis.localStorage?.setItem(KEY, value)
    else if (value === null) await SecureStore.deleteItemAsync(KEY)
    else await SecureStore.setItemAsync(KEY, value)
  },
}

let cached: Me | null = null
const listeners = new Set<(me: Me | null) => void>()
const restored = storage
  .get()
  .then((value) => {
    if (value && !cached) setStoredMe(JSON.parse(value) as Me, false)
  })
  .catch(() => undefined)

/** Met à jour le joueur connecté pour tous les écrans (après GET ou PATCH /me), null à la déconnexion. */
export function setStoredMe(me: Me | null, persist = true) {
  cached = me
  for (const listener of listeners) listener(me)
  if (persist) void storage.set(me && JSON.stringify(me)).catch(() => undefined)
}

/**
 * Joueur connecté : le dernier connu tout de suite, rechargé à chaque retour sur l'écran.
 * `required` : écran réservé aux joueurs connectés, renvoie vers /auth sans session.
 */
export function useMe({ required = false } = {}) {
  const [me, setMe] = useState(cached)
  useEffect(() => {
    listeners.add(setMe)
    void restored.then(() => setMe(cached))
    return () => {
      listeners.delete(setMe)
    }
  }, [])
  useFocusEffect(
    useCallback(() => {
      api.GET('/me').then(
        ({ data, response }) => {
          if (response.status === 401) {
            setStoredMe(null)
            if (required) router.replace('/auth')
          } else if (data) setStoredMe(data)
        },
        // Hors ligne : on garde le dernier profil connu
        () => undefined,
      )
    }, [required]),
  )
  return me
}
