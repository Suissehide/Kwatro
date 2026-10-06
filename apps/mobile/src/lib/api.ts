import { createApiClient } from '@lucko/api-client'
import { Platform } from 'react-native'
import { API_URL, authClient } from './auth'

// Dev uniquement : joueur de démo du seed (en-tête `x-dev-user-id`, ex. joueur-demo) quand personne n'est connecté
const DEV_USER_ID = process.env.EXPO_PUBLIC_DEV_USER_ID

/** Client typé de l'API Lucko. Les écrans ne l'appellent pas directement : ils passent par src/queries/ (TanStack Query). */
export const api = createApiClient(
  API_URL,
  DEV_USER_ID ? { 'x-dev-user-id': DEV_USER_ID } : undefined,
)

// Session Better Auth : cookie du navigateur sur le web, cookie gardé par le client d'auth sur téléphone
api.use({
  async onRequest({ request }) {
    if (Platform.OS === 'web') return new Request(request, { credentials: 'include' })
    const cookie = await authClient.getCookie()
    if (cookie) request.headers.set('Cookie', cookie)
    return request
  },
})
