import { queryOptions, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BLOCKS } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { unwrap } from '@/lib/queryClient'

// * QUERIES

export const blocksQueryOptions = queryOptions({
  queryKey: [BLOCKS.GET],
  queryFn: () => unwrap(api.GET('/me/blocks')),
})

/** Joueurs que j'ai bloqués, du plus récent au plus ancien (KWT-19). */
export const useBlocksQuery = () => useQuery(blocksQueryOptions)

// * MUTATIONS

export function useUnblockMutation() {
  const client = useQueryClient()
  return useMutation({
    mutationKey: [BLOCKS.UNBLOCK],
    mutationFn: (id: string) =>
      unwrap(api.DELETE('/users/{id}/block', { params: { path: { id } } })),
    // Ses rooms réapparaissent dans Explorer et sur les fiches lieu
    onSuccess: () => client.invalidateQueries(),
  })
}
