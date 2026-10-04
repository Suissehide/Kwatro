import { z } from 'zod'
import {
  EVENT_TYPES,
  REGISTRATION_MODES,
  REGISTRATION_STATUSES,
  ROOM_MODES,
  VENUE_TYPES,
} from '../constants'
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

export const roomListItemSchema = z.object({
  id: z.string(),
  mode: z.enum(ROOM_MODES),
  startsAt: isoDateTime,
  capacity: z.number().int(),
  game: z.object({ slug: z.string(), name: z.string() }),
  format: z.string().nullable(),
  venue: z.object({
    id: z.string(),
    name: z.string(),
    isPartner: z.boolean(),
    distanceMeters: z.number().int(),
  }),
  /** Joueurs acceptés (hôte compris) : initiales seulement, la liste est publique. */
  players: z.array(z.object({ initial: z.string() })),
  kwoteRange: z.object({ min: z.number().int(), max: z.number().int() }).nullable(),
})

export type VenueListItem = z.infer<typeof venueListItemSchema>
/** Forme JSON reçue par l'app (dates en chaînes ISO). Côté API, `z.output` donne les `Date`. */
export type EventListItem = z.input<typeof eventListItemSchema>
export type EventsQuery = z.infer<typeof eventsQuerySchema>
export type RoomListItem = z.input<typeof roomListItemSchema>

const gameRefSchema = z.object({ slug: z.string(), name: z.string() })

/** Fiche événement (B4) : détail, places, et l'inscription du joueur connecté. */
export const eventDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(EVENT_TYPES),
  description: z.string().nullable(),
  startsAt: isoDateTime,
  endsAt: isoDateTime.nullable(),
  cancelledAt: isoDateTime.nullable(),
  priceCents: z.number().int().nullable(),
  capacity: z.number().int().nullable(),
  minAge: z.number().int().nullable(),
  registrationMode: z.enum(REGISTRATION_MODES),
  externalUrl: z.string().nullable(),
  registeredCount: z.number().int(),
  games: z.array(gameRefSchema),
  venue: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string(),
    address: z.string(),
    isPartner: z.boolean(),
  }),
  /** Inscription du joueur connecté ; null s'il n'est pas inscrit ou pas connecté. */
  myRegistration: z.enum(REGISTRATION_STATUSES).nullable(),
})

/** Fiche lieu (B3) : infos pratiques, horaires, jeux sur place et agenda à venir. */
export const venueDetailSchema = venueListItemSchema
  .omit({ distanceMeters: true, upcomingEventCount: true })
  .extend({
    city: z.string(),
    description: z.string().nullable(),
    playFeeCents: z.number().int().nullable(),
    minSpendCents: z.number().int().nullable(),
    acceptsUnaccompaniedMinors: z.boolean(),
    /** 1 = lundi … 7 = dimanche ; fermeture < ouverture = après minuit. */
    openingHours: z.array(
      z.object({
        weekday: z.number().int(),
        opensAtMinute: z.number().int(),
        closesAtMinute: z.number().int(),
      }),
    ),
    games: z.array(gameRefSchema),
    events: z.array(eventListItemSchema.omit({ venue: true })),
  })

export type EventDetail = z.input<typeof eventDetailSchema>
export type VenueDetail = z.input<typeof venueDetailSchema>
