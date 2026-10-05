import { z } from 'zod'
import { GAME_KINDS } from '../constants'
import { DECLARED_LEVELS, type DeclaredLevel } from '../kwote'

const DECLARED_LEVEL_KEYS = Object.keys(DECLARED_LEVELS) as [DeclaredLevel, ...DeclaredLevel[]]

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

/** Mes jeux (A6, F3) : jeux joués, et pour chaque format TCG joué, le niveau déclaré. */
export const myGamesSchema = z.object({
  gameIds: z.array(z.string().min(1)),
  formats: z.array(
    z.object({ formatId: z.string().min(1), declaredLevel: z.enum(DECLARED_LEVEL_KEYS) }),
  ),
})

export type MyGames = z.input<typeof myGamesSchema>
