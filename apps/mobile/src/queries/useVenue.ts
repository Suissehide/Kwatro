import { queryOptions, useQuery } from '@tanstack/react-query'
import { VENUE } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { unwrap } from '@/lib/queryClient'

// * QUERIES

export const venueQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: [VENUE.GET, slug],
    queryFn: () => unwrap(api.GET('/venues/{slug}', { params: { path: { slug } } })),
  })

export const useVenueQuery = (slug: string) => useQuery(venueQueryOptions(slug))
