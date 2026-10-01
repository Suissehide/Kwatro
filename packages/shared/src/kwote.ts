/** La Kwote : rank Elo des parties TCG classées. */
export const KWOTE_START = 1000
export const KWOTE_FLOOR = 100
export const KWOTE_CALIBRATION_GAMES = 20
export const KWOTE_TOURNAMENT_WEIGHT = 1.5

export const DECLARED_LEVELS = {
  BEGINNER: 850,
  INTERMEDIATE: 1000,
  CONFIRMED: 1150,
  EXPERT: 1300,
} as const
export type DeclaredLevel = keyof typeof DECLARED_LEVELS

/** Probabilité de victoire attendue de A contre B (formule Elo). */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + 10 ** ((ratingB - ratingA) / 400))
}

/**
 * Nouvelle Kwote après un duel.
 * @param score 1 = victoire, 0.5 = nul, 0 = défaite
 */
export function nextKwote(
  rating: number,
  opponent: number,
  score: 0 | 0.5 | 1,
  options: { gamesPlayed: number; weight?: number } = { gamesPlayed: KWOTE_CALIBRATION_GAMES },
): number {
  const k = options.gamesPlayed < KWOTE_CALIBRATION_GAMES ? 60 : 32
  const delta = k * (options.weight ?? 1) * (score - expectedScore(rating, opponent))
  return Math.max(KWOTE_FLOOR, Math.round(rating + delta))
}
