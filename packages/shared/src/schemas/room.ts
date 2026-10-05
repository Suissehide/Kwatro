import { z } from 'zod'
import { PARTICIPANT_STATUSES, ROOM_MODES, ROOM_STATUSES } from '../constants'
import { hasBannedWord } from '../moderation'
import { isoDateTime } from './common'

export const ROOM_CAPACITY = { min: 2, max: 16 } as const
export const ROOM_DESCRIPTION_MAX = 1000

// ponytail: rooms à domicile (zone floue, adresse chiffrée, garde-fous) ajoutées avec KWT-71 / KWT-72
/** Création d'une room (C1-C3) : validée par l'app et par l'API, règles métier dans l'API (rooms.rules.ts). */
export const createRoomSchema = z.object({
  gameId: z.string().min(1, { message: 'Choisis un jeu' }),
  /** Format TCG ; null pour les jeux de société. */
  formatId: z.string().min(1).nullish(),
  mode: z.enum(ROOM_MODES),
  venueId: z.string().min(1, { message: 'Choisis un lieu' }),
  startsAt: isoDateTime,
  capacity: z
    .number()
    .int()
    .min(ROOM_CAPACITY.min, { message: `Au moins ${ROOM_CAPACITY.min} places` })
    .max(ROOM_CAPACITY.max, { message: `${ROOM_CAPACITY.max} places maximum` }),
  minorsAllowed: z.boolean().default(false),
  /** Inscription automatique ; sinon l'hôte accepte chaque candidature (par défaut). */
  autoAccept: z.boolean().default(false),
  /** Description et règles maison. */
  description: z
    .string()
    .trim()
    .max(ROOM_DESCRIPTION_MAX, { message: `${ROOM_DESCRIPTION_MAX} caractères maximum` })
    .refine((text) => !hasBannedWord(text), { message: 'Ce texte contient un mot interdit' })
    .optional(),
})

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
  /** Kwote sur le format de la room ; null si provisoire ou sans format. */
  kwote: z.number().int().nullable(),
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
  game: z.object({ slug: z.string(), name: z.string() }),
  format: z.string().nullable(),
  venue: z
    .object({
      id: z.string(),
      slug: z.string(),
      name: z.string(),
      address: z.string(),
      isPartner: z.boolean(),
    })
    .nullable(),
  host: z.object({ pseudo: z.string().nullable() }),
  /** Joueurs acceptés, hôte compris : pseudos pour les membres de la room, initiales pour les autres. */
  players: z.array(z.object({ initial: z.string(), pseudo: z.string().nullable() })),
  waitlistCount: z.number().int(),
  /** Place du joueur connecté ; null s'il n'a pas candidaté ou n'est pas connecté. */
  myStatus: z.enum(PARTICIPANT_STATUSES).nullable(),
  isHost: z.boolean(),
  candidates: z.array(roomCandidateSchema),
})

export type RoomDetail = z.input<typeof roomDetailSchema>
export type RoomCandidate = z.input<typeof roomCandidateSchema>
