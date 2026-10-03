import type { EventListItem, RoomListItem, VenueListItem } from '@kwatro/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'
import { localDay } from './explore'
import { useLocation } from './useLocation'

export type Tonight = { events: EventListItem[]; rooms: RoomListItem[]; venues: VenueListItem[] }

export function useTonight(radiusKm = 10) {
  const { place, ready } = useLocation()
  const [data, setData] = useState<Tonight | null>(null)
  const [failed, setFailed] = useState(false)
  const latest = useRef(0)

  const load = useCallback(() => {
    // Seule la dernière requête met à jour l'écran (position arrivée en cours de chargement)
    const request = ++latest.current
    const query = { lat: place.lat, lng: place.lng, radiusKm, days: 1 }
    setFailed(false)
    Promise.all([
      api.GET('/events', { params: { query } }),
      api.GET('/rooms', { params: { query } }),
      api.GET('/venues', { params: { query } }),
    ])
      .then(([events, rooms, venues]) => {
        if (request !== latest.current) return
        if (!events.data || !rooms.data || !venues.data) throw new Error('Réponse invalide')
        const today = localDay(new Date())
        setData({
          events: events.data.filter((e) => localDay(e.startsAt) === today),
          rooms: rooms.data,
          venues: venues.data.filter((v) => v.openNow),
        })
      })
      .catch(() => request === latest.current && setFailed(true))
  }, [place, radiusKm])

  useEffect(() => {
    if (ready) load()
  }, [ready, load])

  return { place, data, failed, retry: load }
}
