import { z } from 'zod'
import { PLAY_WHEN } from '../constants'
import { isoDateTime } from './common'

/** Mes envies de jeu (LKO-17) : jeux attendus et moment où être prévenu. */
export const playIntentsSchema = z.object({
  gameIds: z.array(z.string().min(1)).max(30),
  when: z.enum(PLAY_WHEN),
})

export const myPlayIntentsSchema = playIntentsSchema.extend({
  /** Fin des envies en cours ; null s'il n'y en a pas. */
  expiresAt: isoDateTime.nullable(),
})

/** Joueurs qui attendent chaque jeu autour d'un point ; jamais qui ni où exactement. */
export const gameDemandSchema = z.object({
  game: z.object({ id: z.string(), slug: z.string(), name: z.string() }),
  /** null sous PLAY_INTENT_MIN_COUNT. */
  waitingCount: z.number().int().nullable(),
})

export type PlayIntents = z.infer<typeof playIntentsSchema>
/** Forme JSON reçue par l'app. */
export type MyPlayIntents = z.input<typeof myPlayIntentsSchema>
export type GameDemand = z.infer<typeof gameDemandSchema>
