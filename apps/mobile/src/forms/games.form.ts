import type { DeclaredLevel, MyGames } from '@kwatro/shared'
import { formOptions } from '@tanstack/react-form'

/** Un format TCG coché : réponses au questionnaire (null = pas répondu) et niveau qui en découle. */
export type FormatChoice = {
  formatId: string
  /** Niveau déjà enregistré, ou calculé dès que les 3 questions ont une réponse. */
  level: DeclaredLevel | null
  answers: (number | null)[]
}

/** Valeur du champ « Jeux » (A6, F3) : jeux joués et formats TCG avec leur niveau. */
export type GamesValue = { gameIds: string[]; formats: FormatChoice[] }

export type GamesFormValues = { games: GamesValue }

export const NO_ANSWERS = [null, null, null]

export const gamesDefaults = (saved?: MyGames | null): GamesFormValues => ({
  games: {
    gameIds: saved?.gameIds ?? [],
    formats: (saved?.formats ?? []).map((f) => ({
      formatId: f.formatId,
      level: f.declaredLevel,
      answers: NO_ANSWERS,
    })),
  },
})

export const gamesFormOpts = formOptions({ defaultValues: gamesDefaults() })

/** Erreur du champ à l'envoi : chaque format coché doit avoir un niveau. */
export const validateGames = ({ value }: { value: GamesValue }) =>
  value.formats.some((f) => !f.level)
    ? 'Réponds aux 3 questions pour chaque format coché'
    : undefined

/** Corps du PUT /me/games. */
export const gamesBody = ({ games }: GamesFormValues): MyGames => ({
  gameIds: games.gameIds,
  formats: games.formats.flatMap((f) =>
    f.level ? [{ formatId: f.formatId, declaredLevel: f.level }] : [],
  ),
})
