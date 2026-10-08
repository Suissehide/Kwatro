import {
  DECLARED_LEVELS,
  type DeclaredLevel,
  type GameKind,
  type myGamesSchema,
} from '@lucko/shared'
import type { z } from 'zod'

export type CatalogGame = { id: string; name: string; kind: GameKind; formatIds: string[] }

/**
 * Mes jeux (LKO-46) : motif de refus, ou null. Un format doit appartenir à un TCG coché. Un TCG
 * peut rester sans format : l'onboarding (LKO-47) enregistre les jeux, le niveau vient plus tard.
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
  return null
}

/**
 * Niveau déclaré sur un format : tant qu'aucune partie classée n'est jouée, les LK suivent le niveau
 * (départ 850 à 1300) ; ensuite seules les parties la font bouger.
 */
export function profileData(existing: { rankedGames: number } | null, level: DeclaredLevel) {
  return !existing || existing.rankedGames === 0
    ? { declaredLevel: level, rating: DECLARED_LEVELS[level] }
    : { declaredLevel: level }
}
