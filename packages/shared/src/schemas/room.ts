import { z } from 'zod'
import { ROOM_MODES } from '../constants'
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
