// Géocodage de la Géoplateforme de l'IGN (adresses françaises, sans clé, CORS ouvert)
const BASE = 'https://data.geopf.fr/geocodage'

export type City = { name: string; lat: number; lng: number }

type Feature = {
  geometry: { coordinates: [number, number] }
  properties: { name?: string; city?: string }
}

async function first(url: string): Promise<Feature | null> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Géocodage : ${response.status}`)
  const { features } = (await response.json()) as { features: Feature[] }
  return features[0] ?? null
}

/** Commune la plus proche du texte saisi ; null si aucune ne correspond. */
export async function searchCity(query: string): Promise<City | null> {
  const feature = await first(
    `${BASE}/search?q=${encodeURIComponent(query)}&index=address&type=municipality&limit=1`,
  )
  if (!feature) return null
  const [lng, lat] = feature.geometry.coordinates
  return { name: feature.properties.city ?? feature.properties.name ?? query, lat, lng }
}

/** Commune d'une position (bouton « Me localiser »). */
export async function reverseCity(lat: number, lng: number): Promise<string | null> {
  const feature = await first(`${BASE}/reverse?lon=${lng}&lat=${lat}&index=address&limit=1`)
  return feature?.properties.city ?? null
}

export type AddressSuggestion = {
  /** « 12 Rue des Faures 33000 Bordeaux » */
  label: string
  lat: number
  lng: number
  /** Affiché aux autres joueurs : « Paris · Paris 11e Arrondissement », « Bordeaux (33100) ». */
  areaLabel: string
}

type AddressFeature = Feature & {
  properties: { label: string; district?: string; postcode?: string }
}

/** Adresses proposées pendant la saisie (room à domicile) ; rien n'est gardé côté IGN ni chez nous. */
export async function searchAddresses(query: string): Promise<AddressSuggestion[]> {
  const response = await fetch(
    `${BASE}/search?q=${encodeURIComponent(query)}&index=address&autocomplete=1&limit=5`,
  )
  if (!response.ok) throw new Error(`Géocodage : ${response.status}`)
  const { features } = (await response.json()) as { features: AddressFeature[] }
  return features.map(({ geometry, properties }) => ({
    label: properties.label,
    lat: geometry.coordinates[1],
    lng: geometry.coordinates[0],
    areaLabel: properties.district
      ? `${properties.city} · ${properties.district}`
      : `${properties.city ?? properties.label}${properties.postcode ? ` (${properties.postcode})` : ''}`,
  }))
}
