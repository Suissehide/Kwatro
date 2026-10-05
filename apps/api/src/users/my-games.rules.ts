import {
  DECLARED_LEVELS,
  type DeclaredLevel,
  type GameKind,
  type myGamesSchema,
} from '@kwatro/shared'
import type { z } from 'zod'

export type CatalogGame = { id: string; name: string; kind: GameKind; formatIds: string[] }

/**
 * Mes jeux (KWT-46) : motif de refus, ou null. Un format doit appartenir à un TCG coché,
 * et chaque TCG coché a au moins un format (c'est par format que se fait le niveau).
 */
export function myGamesRefusal(
  input: z.output<typeof myGamesSchema>,
  catalog: CatalogGame[],
): string | null {
  const games = input.gameIds.map((id) => catalog.find((g) => g.id === id))
  if (games.some((g) => !g)) return 'Jeu inconnu'
  for (const { formatId } of input.formats) {
    const game = games.find((g) => g?.formatIds.includes(formatId))
    if (game?.kind !== 'TCG') return 'Ce format ne correspond à aucun TCG choisi'
  }
  for (const game of games) {
    if (game?.kind !== 'TCG') continue
    if (!input.formats.some((f) => game.formatIds.includes(f.formatId)))
      return `Choisis au moins un format pour ${game.name}`
  }
  return null
}

/**
 * Niveau déclaré sur un format : tant qu'aucune partie classée n'est jouée, la Kwote suit le niveau
 * (départ 850 à 1300) ; ensuite seules les parties la font bouger.
 */
export function profileData(existing: { rankedGames: number } | null, level: DeclaredLevel) {
  return !existing || existing.rankedGames === 0
    ? { declaredLevel: level, kwote: DECLARED_LEVELS[level] }
    : { declaredLevel: level }
}
