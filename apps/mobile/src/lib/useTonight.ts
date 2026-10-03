import type { EventListItem, RoomListItem, VenueListItem } from '@kwatro/shared'
import { useEffect, useState } from 'react'
import { api } from './api'
import { localDay } from './explore'
import { useLocation } from './useLocation'

export type Tonight = { events: EventListItem[]; rooms: RoomListItem[]; venues: VenueListItem[] }

export function useTonight(radiusKm = 10) {
  const { place, ready } = useLocation()
  const [data, setData] = useState<Tonight | null>(null)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` relance volontairement le chargement
  useEffect(() => {
    if (!ready) return
    let cancelled = false
    const query = { lat: place.lat, lng: place.lng, radiusKm, days: 1 }
    setFailed(false)
    Promise.all([
      api.GET('/events', { params: { query } }),
      api.GET('/rooms', { params: { query } }),
      api.GET('/venues', { params: { query } }),
    ])
      .then(([events, rooms, venues]) => {
        if (cancelled) return
        if (!events.data || !rooms.data || !venues.data) throw new Error('Réponse invalide')
        const today = localDay(new Date())
        setData({
          events: events.data.filter((e) => localDay(e.startsAt) === today),
          rooms: rooms.data,
          venues: venues.data.filter((v) => v.openNow),
        })
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [ready, place, radiusKm, attempt])

  return { place, data, failed, retry: () => setAttempt((n) => n + 1) }
}
