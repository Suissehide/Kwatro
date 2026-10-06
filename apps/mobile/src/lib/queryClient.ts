import AsyncStorage from '@react-native-async-storage/async-storage'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import { focusManager, QueryClient } from '@tanstack/react-query'
import { AppState, Platform } from 'react-native'
import { ME } from '@/constants/queryKeys'

/**
 * Réponse de l'API en erreur : `status` permet de traiter un 401 ou un 409 à part,
 * `message` est celui renvoyé par l'API (NestJS) quand il y en a un, à afficher tel quel.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message = 'Une erreur est survenue, réessaie.',
  ) {
    super(message)
  }
}

/** Résultat d'un appel du client typé (`api.GET(…)`) → données, ou ApiError. Pour les `queryFn` et `mutationFn`. */
export async function unwrap<T>(
  request: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  const { data, error, response } = await request
  if (!response.ok) {
    const message = (error as { message?: unknown } | undefined)?.message
    throw new ApiError(response.status, typeof message === 'string' ? message : undefined)
  }
  return data as T
}

const DAY_MS = 24 * 60 * 60 * 1000

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Gardées un jour : c'est ce que le persister peut restaurer au lancement suivant
      gcTime: DAY_MS,
      // Une erreur 4xx ne se règle pas en réessayant
      retry: (count, error) => !(error instanceof ApiError && error.status < 500) && count < 2,
    },
  },
})

export const persistOptions = {
  persister: createAsyncStoragePersister({ storage: AsyncStorage, key: 'lucko.queries' }),
  maxAge: DAY_MS,
  // Seul le joueur connecté est gardé entre deux lancements (pas d'avatar « ? » au démarrage)
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { queryKey: readonly unknown[]; state: { status: string } }) =>
      query.queryKey[0] === ME.GET && query.state.status === 'success',
  },
}

// Téléphone : l'app revenue au premier plan compte comme un retour sur l'écran (le web le fait seul)
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => focusManager.setFocused(status === 'active'))
}
