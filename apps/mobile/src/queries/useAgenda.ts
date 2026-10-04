import type { AgendaPeriod } from '@kwatro/shared'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { AGENDA } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { unwrap } from '@/lib/queryClient'

// * QUERIES

export const agendaQueryOptions = (period: AgendaPeriod) =>
  queryOptions({
    queryKey: [AGENDA.GET, period],
    queryFn: () => unwrap(api.GET('/me/agenda', { params: { query: { period } } })),
  })

/** Mes parties : à venir et historique (les deux comptes s'affichent dans les onglets). */
export function useAgendaQuery() {
  const upcoming = useQuery(agendaQueryOptions('upcoming'))
  const past = useQuery(agendaQueryOptions('past'))
  return {
    agenda: upcoming.data && past.data ? { upcoming: upcoming.data, past: past.data } : null,
    failed: upcoming.isError || past.isError,
    retry: () => {
      void upcoming.refetch()
      void past.refetch()
    },
  }
}
