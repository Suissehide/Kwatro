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

/** Joueur d'une partie classée : Kwote et parties classées avant la partie, place finale (1 = vainqueur). */
export type KwotePlayer = { kwote: number; rankedGames: number; place: number }

/**
 * Nouvelles Kwotes après une partie classée, duel ou pod (archi §13, méthode par paires de
 * Board Game Arena) : chaque joueur « gagne » contre ceux classés derrière lui, « perd » contre
 * ceux devant, fait nul à place égale. L'écart est moyenné sur les adversaires, pour qu'une
 * victoire en pod de 4 pèse autant qu'un duel. Toutes les paires partent des Kwotes d'avant.
 * @param weight KWOTE_TOURNAMENT_WEIGHT pour un tournoi classé, 1 pour une room
 */
export function nextKwotes(players: readonly KwotePlayer[], weight = 1): number[] {
  return players.map((me, i) => {
    const k = me.rankedGames < KWOTE_CALIBRATION_GAMES ? 60 : 32
    let gap = 0
    players.forEach((other, j) => {
      if (i === j) return
      const score = me.place < other.place ? 1 : me.place === other.place ? 0.5 : 0
      gap += score - expectedScore(me.kwote, other.kwote)
    })
    const delta = (k * weight * gap) / Math.max(1, players.length - 1)
    return Math.max(KWOTE_FLOOR, Math.round(me.kwote + delta))
  })
}

/** Adversaires différents à affronter pour la part « variété » de la fiabilité. */
export const KWOTE_RELIABLE_OPPONENTS = 10

/**
 * Indice de fiabilité en % (archi §13, comme Pista) : 70 % viennent du nombre de parties
 * classées (plein après le calibrage), 30 % de la variété des adversaires.
 */
export function kwoteReliability(rankedGames: number, distinctOpponents: number): number {
  const games = Math.min(1, rankedGames / KWOTE_CALIBRATION_GAMES)
  const variety = Math.min(1, distinctOpponents / KWOTE_RELIABLE_OPPONENTS)
  return Math.round(70 * games + 30 * variety)
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
