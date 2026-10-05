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

/** En dessous de ce nombre de parties classées sur un format, la Kwote est affichée « provisoire ». */
export const KWOTE_PROVISIONAL_GAMES = 5

export const DECLARED_LEVEL_LABELS: Record<DeclaredLevel, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  CONFIRMED: 'Confirmé',
  EXPERT: 'Expert',
}

/**
 * Questionnaire d'auto-évaluation par format TCG (A6, KWT-46) : 3 questions, 4 réponses notées 0 à 3.
 */
// ponytail: mêmes questions pour tous les TCG ; des variantes par jeu (bracket Commander…) avec KWT-52
export const LEVEL_QUESTIONS = [
  {
    key: 'experience',
    label: 'Depuis combien de temps tu joues à ce format ?',
    answers: ['Moins de 6 mois', '6 mois à 2 ans', '2 à 5 ans', 'Plus de 5 ans'],
  },
  {
    key: 'tournaments',
    label: 'Tu as déjà joué en tournoi ?',
    answers: [
      'Jamais',
      'Quelques soirées en boutique',
      'Souvent en boutique',
      'Régional ou national',
    ],
  },
  {
    key: 'peers',
    label: 'Face aux joueurs de ta boutique, tu te situes…',
    answers: ['Je débute', 'Dans la moyenne', 'Plutôt au-dessus', 'Parmi les meilleurs'],
  },
] as const

/** Niveau déclaré d'après les 3 réponses (0 à 3 chacune) : total 0-2, 3-4, 5-6, 7-9. */
export function levelFromAnswers(answers: readonly number[]): DeclaredLevel {
  const total = answers.reduce((sum, a) => sum + a, 0)
  if (total <= 2) return 'BEGINNER'
  if (total <= 4) return 'INTERMEDIATE'
  if (total <= 6) return 'CONFIRMED'
  return 'EXPERT'
}
