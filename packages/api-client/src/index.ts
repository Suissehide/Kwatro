import createClient from 'openapi-fetch'
import type { components, paths } from './schema'

export type { components, paths }

/**
 * Client typé de l'API : chemins, paramètres et réponses viennent de l'OpenAPI.
 * `const { data, error } = await api.GET('/games')` → `data` est typé.
 * Après un changement de route dans l'API : `pnpm api:generate`.
 */
export function createApiClient(baseUrl: string, headers?: Record<string, string>) {
  return createClient<paths>({ baseUrl, headers })
}

export type ApiClient = ReturnType<typeof createApiClient>
