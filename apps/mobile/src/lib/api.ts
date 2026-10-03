import { createApiClient } from '@kwatro/api-client'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'
// ponytail: joueur de dev (en-tête `x-dev-user-id`, ex. joueur-demo) en attendant la session Better Auth (KWT-9)
const DEV_USER_ID = process.env.EXPO_PUBLIC_DEV_USER_ID

/** Client typé de l'API Kwatro : `const { data, error } = await api.GET('/games')`. */
export const api = createApiClient(
  API_URL,
  DEV_USER_ID ? { 'x-dev-user-id': DEV_USER_ID } : undefined,
)
