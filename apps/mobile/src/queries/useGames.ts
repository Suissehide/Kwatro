import { queryOptions, useQuery } from '@tanstack/react-query'
import { GAMES } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { unwrap } from '@/lib/queryClient'

// * QUERIES

/** Catalogue des jeux et formats : change rarement, gardé pour la session. */
export const gamesQueryOptions = queryOptions({
  queryKey: [GAMES.LIST],
  queryFn: () => unwrap(api.GET('/games')),
  staleTime: Number.POSITIVE_INFINITY,
})

export const useGamesQuery = () => useQuery(gamesQueryOptions)
