import type { MyGames } from '@kwatro/shared'
import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ME, MY_GAMES } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { unwrap } from '@/lib/queryClient'

// * QUERIES

export const myGamesQueryOptions = queryOptions({
  queryKey: [MY_GAMES.GET],
  queryFn: () => unwrap(api.GET('/me/games')),
})

export const useMyGamesQuery = () => useQuery(myGamesQueryOptions)

// * MUTATIONS

export function useMyGamesMutations() {
  const client = useQueryClient()

  /** PUT /me/games : ApiError 400 avec le motif. Les classements du profil (GET /me) changent aussi. */
  const setMyGames = useMutation({
    mutationKey: [MY_GAMES.SET],
    mutationFn: (body: MyGames) => unwrap(api.PUT('/me/games', { body })),
    onSuccess: (games) => {
      client.setQueryData(myGamesQueryOptions.queryKey, games)
      void client.invalidateQueries({ queryKey: [ME.GET] })
    },
  })

  return { setMyGames }
}
