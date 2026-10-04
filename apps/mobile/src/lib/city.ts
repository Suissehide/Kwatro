import { findCity } from '@/queries/useGeocode'

/** Ville d'un formulaire : le texte saisi, et sa position une fois connue (« Me localiser » ou géocodage). */
export type CityValue = { name: string; lat: number | null; lng: number | null }

export const cityValue = (me: {
  city: string | null
  latitude: number | null
  longitude: number | null
}): CityValue => ({ name: me.city ?? '', lat: me.latitude, lng: me.longitude })

/** Validateur à l'envoi : une ville saisie doit exister (le géocodage en panne ne bloque pas). */
export async function validateCity({ value }: { value: CityValue }) {
  if (!value.name.trim() || value.lat !== null) return undefined
  const found = await findCity(value.name).catch(() => undefined)
  return found === null ? 'Ville introuvable. Vérifie l’orthographe.' : undefined
}

/** Champs à envoyer à l'API : ville normalisée et sa position (la recherche est en cache après la validation). */
export async function cityFields({ name, lat, lng }: CityValue) {
  const text = name.trim()
  if (!text) return { city: null, latitude: null, longitude: null }
  if (lat !== null && lng !== null) return { city: text, latitude: lat, longitude: lng }
  const found = await findCity(text).catch(() => null)
  return found
    ? { city: found.name, latitude: found.lat, longitude: found.lng }
    : { city: text, latitude: null, longitude: null }
}
