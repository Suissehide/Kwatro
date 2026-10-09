import { queryOptions } from '@tanstack/react-query'
import { GEOCODE } from '@/constants/queryKeys'
import { reverseCity, searchAddresses, searchCity } from '@/lib/geocode'
import { queryClient } from '@/lib/queryClient'

// Communes et positions changent rarement : une recherche faite reste valable toute la session
const STATIC = { staleTime: Number.POSITIVE_INFINITY }

// * QUERIES

export const citySearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: [GEOCODE.SEARCH, query.trim().toLowerCase()],
    queryFn: () => searchCity(query.trim()),
    ...STATIC,
  })

/** Adresses proposées à partir de 3 caractères (room à domicile). */
export const addressSearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: [GEOCODE.ADDRESS, query.trim().toLowerCase()],
    queryFn: () => searchAddresses(query.trim()),
    enabled: query.trim().length >= 3,
    ...STATIC,
  })

export const cityAtQueryOptions = (lat: number, lng: number) =>
  queryOptions({
    queryKey: [GEOCODE.REVERSE, lat, lng],
    queryFn: () => reverseCity(lat, lng),
    ...STATIC,
  })

/** Commune correspondant au texte saisi (null si aucune), en cache : validation puis enregistrement ne la cherchent qu'une fois. */
export const findCity = (query: string) => queryClient.fetchQuery(citySearchQueryOptions(query))

export const findCityAt = (lat: number, lng: number) =>
  queryClient.fetchQuery(cityAtQueryOptions(lat, lng))
