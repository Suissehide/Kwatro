// Géocodage de la Géoplateforme de l'IGN (adresses françaises, sans clé, CORS ouvert)
const BASE = 'https://data.geopf.fr/geocodage'

export type City = { name: string; lat: number; lng: number }

type Feature = {
  geometry: { coordinates: [number, number] }
  properties: { name?: string; city?: string; context?: string }
}

async function features(url: string): Promise<Feature[]> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Géocodage : ${response.status}`)
  return ((await response.json()) as { features: Feature[] }).features
}

const toCity = (feature: Feature, fallback = ''): City => {
  const [lng, lat] = feature.geometry.coordinates
  return { name: feature.properties.city ?? feature.properties.name ?? fallback, lat, lng }
}

const municipalities = (query: string, limit: number) =>
  `${BASE}/search?q=${encodeURIComponent(query)}&index=address&type=municipality&limit=${limit}`

/** Commune la plus proche du texte saisi ; null si aucune ne correspond. */
export async function searchCity(query: string): Promise<City | null> {
  const [feature] = await features(municipalities(query, 1))
  return feature ? toCity(feature, query) : null
}

/** Communes commençant comme le texte saisi, avec leur département (« 33 ») pour départager les homonymes. */
export async function suggestCities(query: string): Promise<(City & { department: string })[]> {
  const found = await features(`${municipalities(query, 5)}&autocomplete=1`)
  return found.map((f) => ({
    ...toCity(f, query),
    department: f.properties.context?.split(',')[0]?.trim() ?? '',
  }))
}

/** Commune d'une position (bouton « Me localiser »). */
export async function reverseCity(lat: number, lng: number): Promise<string | null> {
  const [feature] = await features(`${BASE}/reverse?lon=${lng}&lat=${lat}&index=address&limit=1`)
  return feature?.properties.city ?? null
}
