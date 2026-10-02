import { z } from 'zod'
import { EVENT_TYPES, REGISTRATION_MODES, VENUE_TYPES } from '../constants'
import { geoQuerySchema, isoDateTime } from './common'

/** Lieu dans la carte / la liste « Où jouer ce soir » (B1, B2). */
export const venueListItemSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  type: z.enum(VENUE_TYPES),
  address: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  isPartner: z.boolean(),
  kwatroPerk: z.string().nullable(),
  distanceMeters: z.number().int(),
  /** Ouvert maintenant (heure de Paris) ; null si les horaires ne sont pas renseignés. */
  openNow: z.boolean().nullable(),
  /** Heure de fermeture de la plage en cours, en minutes depuis minuit. */
  closesAtMinute: z.number().int().nullable(),
  upcomingEventCount: z.number().int(),
})

export const eventsQuerySchema = geoQuerySchema.extend({
  /** Fenêtre de l'agenda, en jours à partir de maintenant. */
  days: z.coerce.number().int().min(1).max(31).default(7),
})

/** Événement dans l'agenda (B2, segment Événements). */
export const eventListItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(EVENT_TYPES),
  startsAt: isoDateTime,
  priceCents: z.number().int().nullable(),
  capacity: z.number().int().nullable(),
  registeredCount: z.number().int(),
  registrationMode: z.enum(REGISTRATION_MODES),
  games: z.array(z.object({ slug: z.string(), name: z.string() })),
  venue: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    isPartner: z.boolean(),
    distanceMeters: z.number().int(),
  }),
})

export type VenueListItem = z.infer<typeof venueListItemSchema>
/** Forme JSON reçue par l'app (dates en chaînes ISO). Côté API, `z.output` donne les `Date`. */
export type EventListItem = z.input<typeof eventListItemSchema>
export type EventsQuery = z.infer<typeof eventsQuerySchema>
