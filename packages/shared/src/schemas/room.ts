import { z } from 'zod'
import {
  BOARD_GAME_CATEGORIES,
  PARTICIPANT_STATUSES,
  ROOM_MODES,
  ROOM_STATUSES,
  ROOM_VIBES,
} from '../constants'
import { hasBannedWord } from '../moderation'
import { isoDateTime } from './common'

export const ROOM_CAPACITY = { min: 2, max: 16 } as const
export const ROOM_DESCRIPTION_MAX = 280
/** Délai de réservation maximal d'une room. */
export const ROOM_MAX_DAYS_AHEAD = 60

/** Rayon de la zone floue d'une room à domicile (LKO-71). */
export const HOME_FUZZY_RADIUS_M = 500
/** L'adresse d'une room à domicile s'ouvre aux joueurs acceptés 24 h avant le début. */
export const HOME_ADDRESS_REVEAL_MS = 24 * 60 * 60 * 1000
export const HOME_ADDRESS_MAX = 200
/** Version de l'avertissement sécurité des rooms à domicile : l'augmenter le fait accepter de nouveau (LKO-72). */
export const HOME_SAFETY_VERSION = 1
/** Code d'erreur (403) d'une room à domicile tant que l'avertissement sécurité n'est pas accepté. */
export const HOME_SAFETY_REQUIRED = 'HOME_SAFETY_REQUIRED'

/**
 * Room à domicile : position géocodée par l'app (jamais stockée telle quelle, seulement la zone floue)
 * et adresse facultative, chiffrée ; sans adresse, l'hôte la donne dans le chat.
 */
export const homeLocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  areaLabel: z.string().trim().min(1).max(80),
  address: z
    .string()
    .trim()
    .max(HOME_ADDRESS_MAX, { message: `${HOME_ADDRESS_MAX} caractères maximum` })
    .optional(),
})

/** Création d'une room (C1-C3) : validée par l'app et par l'API, règles métier dans l'API (rooms.rules.ts). */
export const createRoomSchema = z
  .object({
    gameId: z.string().min(1, { message: 'Choisis un jeu' }),
    /** Format TCG ; null pour les jeux de société. */
    formatId: z.string().min(1).nullish(),
    /** Catégorie, jeux de société seulement. */
    boardGameCategory: z.enum(BOARD_GAME_CATEGORIES).nullish(),
    mode: z.enum(ROOM_MODES),
    /** Lieu public, ou `home` pour une room à domicile. */
    venueId: z.string().min(1).nullish(),
    home: homeLocationSchema.nullish(),
    startsAt: isoDateTime,
    capacity: z
      .number()
      .int()
      .min(ROOM_CAPACITY.min, { message: `Au moins ${ROOM_CAPACITY.min} places` })
      .max(ROOM_CAPACITY.max, { message: `${ROOM_CAPACITY.max} places maximum` }),
    /** Bracket Commander visé (1 à 5) ; seulement pour un format à brackets. */
    bracket: z
      .number()
      .int()
      .min(1, { message: 'Bracket de 1 à 5' })
      .max(5, { message: 'Bracket de 1 à 5' })
      .nullish(),
    minorsAllowed: z.boolean().default(false),
    /** Inscription automatique ; sinon l'hôte accepte chaque candidature (par défaut). */
    autoAccept: z.boolean().default(false),
    vibes: z.array(z.enum(ROOM_VIBES)).default([]),
    /** Un mot pour les joueurs : règles maison, proxys… */
    description: z
      .string()
      .trim()
      .max(ROOM_DESCRIPTION_MAX, { message: `${ROOM_DESCRIPTION_MAX} caractères maximum` })
      .refine((text) => !hasBannedWord(text), { message: 'Ce texte contient un mot interdit' })
      .optional(),
  })
  .refine((room) => !room.venueId !== !room.home, { message: 'Choisis un lieu', path: ['venueId'] })

export const createdRoomSchema = z.object({ id: z.string() })

/** Forme JSON envoyée par l'app (date en chaîne ISO). Côté API, `z.output` donne la `Date`. */
export type CreateRoomInput = z.input<typeof createRoomSchema>

/** Candidature vue par l'hôte (C5, C6) : de quoi décider, sans âge exact (badge -18 seulement). */
export const roomCandidateSchema = z.object({
  userId: z.string(),
  pseudo: z.string().nullable(),
  status: z.enum(['PENDING', 'WAITLISTED']),
  minor: z.boolean(),
  xp: z.number().int(),
  /** LK sur le format de la room ; null si provisoire ou sans format. */
  rating: z.number().int().nullable(),
  rankedGames: z.number().int(),
  appliedAt: isoDateTime,
})

/** Fiche room (B6) ; `candidates` n'est rempli que pour l'hôte. */
export const roomDetailSchema = z.object({
  id: z.string(),
  mode: z.enum(ROOM_MODES),
  status: z.enum(ROOM_STATUSES),
  startsAt: isoDateTime,
  capacity: z.number().int(),
  description: z.string().nullable(),
  minorsAllowed: z.boolean(),
  autoAccept: z.boolean(),
  vibes: z.array(z.enum(ROOM_VIBES)),
  game: z.object({ slug: z.string(), name: z.string() }),
  /** Format TCG, ou catégorie pour les jeux de société. */
  format: z.string().nullable(),
  bracket: z.number().int().nullable(),
  venue: z
    .object({
      id: z.string(),
      slug: z.string(),
      name: z.string(),
      address: z.string(),
      isPartner: z.boolean(),
    })
    .nullable(),
  /** Room à domicile : zone floue publique ; l'adresse se lit avec GET /rooms/:id/address. */
  home: z
    .object({
      areaLabel: z.string(),
      lat: z.number(),
      lng: z.number(),
      radiusM: z.number().int(),
      /** Ouverture de l'adresse aux joueurs acceptés (début − 24 h). */
      revealAt: isoDateTime,
      /** false : l'hôte donne l'adresse dans le chat. */
      hasAddress: z.boolean(),
    })
    .nullable(),
  host: z.object({ pseudo: z.string().nullable() }),
  /** Joueurs acceptés, hôte compris : pseudos pour les membres de la room, initiales pour les autres. */
  players: z.array(
    z.object({
      initial: z.string(),
      pseudo: z.string().nullable(),
      /** Pour l'hôte seulement (retirer, transférer) ; null pour les autres. */
      userId: z.string().nullable(),
    }),
  ),
  waitlistCount: z.number().int(),
  /** Place du joueur connecté ; null s'il n'a pas candidaté ou n'est pas connecté. */
  myStatus: z.enum(PARTICIPANT_STATUSES).nullable(),
  isHost: z.boolean(),
  candidates: z.array(roomCandidateSchema),
})

/** Adresse d'une room à domicile (GET /rooms/:id/address), pour l'hôte et les acceptés à partir de `revealAt`. */
export const roomAddressSchema = z.object({
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
})

/** PUT /me/home-safety : version de l'avertissement sécurité acceptée. */
export const homeSafetySchema = z.object({ version: z.number().int().min(1) })

export type RoomAddress = z.infer<typeof roomAddressSchema>
export type HomeLocation = z.infer<typeof homeLocationSchema>
export type RoomDetail = z.input<typeof roomDetailSchema>
export type RoomCandidate = z.input<typeof roomCandidateSchema>

/**
 * Action de l'hôte (C5, LKO-57) : retirer un joueur, transférer le rôle d'hôte, fermer les inscriptions
 * (room confirmée), les rouvrir, annuler la room.
 */
export const hostActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('remove'), userId: z.string().min(1) }),
  z.object({ type: z.literal('transfer'), userId: z.string().min(1) }),
  z.object({ type: z.literal('close') }),
  z.object({ type: z.literal('reopen') }),
  z.object({ type: z.literal('cancel') }),
])

export type HostAction = z.infer<typeof hostActionSchema>
