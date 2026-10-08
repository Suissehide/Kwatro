import type { MyPlayIntents, PlayIntents } from '@lucko/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PLAY_INTENTS } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { unwrap } from '@/lib/queryClient'
import type { Place } from '@/lib/useLocation'

// * QUERIES

/** Mes envies de jeu (« Je veux jouer à… », LKO-17). */
export const playIntentsQueryOptions = queryOptions({
  queryKey: [PLAY_INTENTS.GET],
  queryFn: () => unwrap(api.GET('/me/play-intents')),
})

/** `enabled` : seulement pour un joueur connecté. */
export const usePlayIntentsQuery = (enabled: boolean) =>
  useQuery({ ...playIntentsQueryOptions, enabled })

/** Joueurs qui attendent chaque jeu autour d'un point (compteur masqué sous le seuil d'anonymat). */
export const gameDemandQueryOptions = (place: Place, radiusKm: number) =>
  queryOptions({
    queryKey: [PLAY_INTENTS.DEMAND, place.lat, place.lng, radiusKm],
    queryFn: () =>
      unwrap(
        api.GET('/games/demand', {
          params: { query: { lat: place.lat, lng: place.lng, radiusKm } },
        }),
      ),
  })

// * MUTATIONS

export function usePlayIntentsMutations() {
  const client = useQueryClient()
  const key = playIntentsQueryOptions.queryKey

  /** PUT /me/play-intents, affiché tout de suite (rétabli si l'API refuse) ; la demande par jeu change aussi. */
  const setPlayIntents = useMutation({
    mutationKey: [PLAY_INTENTS.SET],
    mutationFn: (body: PlayIntents) => unwrap(api.PUT('/me/play-intents', { body })),
    onMutate: async (body) => {
      await client.cancelQueries({ queryKey: key })
      const previous = client.getQueryData(key)
      client.setQueryData(key, (old?: MyPlayIntents) => ({ expiresAt: null, ...old, ...body }))
      return { previous }
    },
    onError: (_error, _body, context) => client.setQueryData(key, context?.previous),
    onSuccess: (intents) => {
      client.setQueryData(key, intents)
      void client.invalidateQueries({ queryKey: [PLAY_INTENTS.DEMAND] })
    },
  })

  return { setPlayIntents }
}
