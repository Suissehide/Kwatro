import { expoClient } from '@better-auth/expo/client'
import { inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'
import * as SecureStore from 'expo-secure-store'

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

/**
 * Client Better Auth (KWT-9). Sur téléphone, le cookie de session est gardé dans SecureStore
 * et Apple / Google s'ouvrent dans le navigateur système ; sur le web, cookie classique du navigateur.
 */
export const authClient = createAuthClient({
  baseURL: API_URL,
  fetchOptions: { credentials: 'include' },
  plugins: [
    expoClient({ scheme: 'lucko', storagePrefix: 'lucko', storage: SecureStore }),
    // Envoyée en AAAA-MM-JJ à l'inscription par e-mail (l'API la valide et la convertit en date)
    inferAdditionalFields({ user: { birthDate: { type: 'string', required: false } } }),
  ],
})
