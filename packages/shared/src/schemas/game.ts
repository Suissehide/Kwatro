import { z } from 'zod'
import { GAME_KINDS } from '../constants'

export const gameFormatSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
})

/** Jeu du catalogue, tel que renvoyé par l'API. */
export const gameSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  kind: z.enum(GAME_KINDS),
  minPlayers: z.number().int(),
  maxPlayers: z.number().int(),
  formats: z.array(gameFormatSchema),
})

export type Game = z.infer<typeof gameSchema>
