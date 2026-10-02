import { createApiClient } from '@kwatro/api-client'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

/** Client typé de l'API Kwatro : `const { data, error } = await api.GET('/games')`. */
export const api = createApiClient(API_URL)
