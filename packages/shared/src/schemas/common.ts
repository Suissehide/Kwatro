import { z } from 'zod'

/** Date-heure : `Date` côté serveur, chaîne ISO 8601 dans le JSON (et dans le client typé). */
export const isoDateTime = z.codec(z.iso.datetime(), z.date(), {
  decode: (value) => new Date(value),
  encode: (date) => date.toISOString(),
})

/** Position + rayon de recherche, en paramètres de requête (`?lat=44.84&lng=-0.57&radiusKm=10`). */
export const geoQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radiusKm: z.coerce.number().positive().max(50).default(10),
})

export type GeoQuery = z.infer<typeof geoQuerySchema>
