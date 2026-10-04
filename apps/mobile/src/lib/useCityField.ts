import * as Location from 'expo-location'
import { useState } from 'react'
import { reverseCity, searchCity } from './geocode'

type Coords = { lat: number; lng: number }
export type CityFields = { city: string | null; latitude: number | null; longitude: number | null }

// Position arrondie à ~1 km : assez pour chercher autour, sans garder l'adresse exacte du joueur
const round = (value: number) => Math.round(value * 100) / 100

/** Ville du joueur : saisie (vérifiée par le géocodage à l'enregistrement) ou trouvée par « Me localiser ». */
export function useCityField(initial: CityFields) {
  const [city, setCityText] = useState(initial.city ?? '')
  const [coords, setCoords] = useState<Coords | null>(
    initial.latitude !== null && initial.longitude !== null
      ? { lat: initial.latitude, lng: initial.longitude }
      : null,
  )
  const [error, setError] = useState<string>()
  const [locating, setLocating] = useState(false)

  const setCity = (value: string) => {
    setCityText(value)
    setCoords(null)
    setError(undefined)
  }

  const locate = async () => {
    setLocating(true)
    setError(undefined)
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync()
      if (!granted) return setError('Position refusée : saisis ta ville.')
      const { coords: position } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      const name = await reverseCity(position.latitude, position.longitude)
      if (!name) return setError('Aucune ville trouvée à ta position : saisis-la.')
      setCityText(name)
      setCoords({ lat: round(position.latitude), lng: round(position.longitude) })
    } catch {
      setError('Position indisponible : saisis ta ville.')
    } finally {
      setLocating(false)
    }
  }

  /** Champs à envoyer à l'API ; undefined si la ville est introuvable (l'erreur est affichée). */
  const resolve = async (): Promise<CityFields | undefined> => {
    const text = city.trim()
    if (!text) return { city: null, latitude: null, longitude: null }
    if (coords) return { city: text, latitude: coords.lat, longitude: coords.lng }
    try {
      const found = await searchCity(text)
      if (!found) {
        setError('Ville introuvable. Vérifie l’orthographe.')
        return undefined
      }
      setCityText(found.name)
      setCoords({ lat: found.lat, lng: found.lng })
      return { city: found.name, latitude: found.lat, longitude: found.lng }
    } catch {
      // Géocodage indisponible : la ville seule, sans position
      return { city: text, latitude: null, longitude: null }
    }
  }

  return { city, setCity, error, locating, locate, resolve }
}
