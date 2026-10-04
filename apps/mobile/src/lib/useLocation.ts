import { DEFAULT_CITY } from '@kwatro/shared'
import * as Location from 'expo-location'
import { useEffect, useState } from 'react'

export type Place = { lat: number; lng: number; label: string }

const fallback: Place = { lat: DEFAULT_CITY.lat, lng: DEFAULT_CITY.lng, label: DEFAULT_CITY.name }

/**
 * Position du joueur pour l'exploration. Refus, erreur ou attente : centre de Bordeaux.
 * `ready` passe à true une fois la position connue, le repli choisi ou après 3 s sans réponse.
 */
export function useLocation() {
  const [place, setPlace] = useState<Place>(fallback)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    // La demande de position peut rester sans réponse
    const timer = setTimeout(() => setReady(true), 3000)
    ;(async () => {
      try {
        const { granted } = await Location.requestForegroundPermissionsAsync()
        if (!granted) return
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        if (!cancelled) {
          setPlace({ lat: coords.latitude, lng: coords.longitude, label: 'Autour de toi' })
        }
      } catch {
        // Position indisponible (web sans HTTPS, GPS coupé…) : on garde Bordeaux.
      } finally {
        clearTimeout(timer)
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [])

  return { place, ready, located: place !== fallback }
}
