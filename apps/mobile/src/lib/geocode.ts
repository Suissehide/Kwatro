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
