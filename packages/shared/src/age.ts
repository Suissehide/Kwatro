import { DIGITAL_MAJORITY_AGE, MIN_AGE } from './constants'

/** Régime du compte selon l'âge (archi §3) : < 13 ans pas de compte, 13-14 accord parent, 15-17 mineur autonome. */
export type AgeRegime = 'too-young' | 'parental-consent' | 'minor' | 'adult'

/** Date de naissance saisie en jour / mois / année → date UTC à minuit, ou null si elle n'existe pas (31/02…). */
export function parseBirthDate(day: string, month: string, year: string): Date | null {
  const [d, m, y] = [Number(day), Number(month), Number(year)]
  if (
    !day ||
    !month ||
    !Number.isInteger(d) ||
    !Number.isInteger(m) ||
    !Number.isInteger(y) ||
    y < 1900
  )
    return null
  const date = new Date(Date.UTC(y, m - 1, d))
  return date.getUTCDate() === d && date.getUTCMonth() === m - 1 ? date : null
}

/** Âge révolu au jour `today` (date de naissance stockée en UTC, comme la colonne Postgres `date`). */
export function ageOn(birthDate: Date, today = new Date()): number {
  const age = today.getFullYear() - birthDate.getUTCFullYear()
  const beforeBirthday =
    today.getMonth() < birthDate.getUTCMonth() ||
    (today.getMonth() === birthDate.getUTCMonth() && today.getDate() < birthDate.getUTCDate())
  return beforeBirthday ? age - 1 : age
}

export function ageRegime(birthDate: Date, today = new Date()): AgeRegime {
  const age = ageOn(birthDate, today)
  if (age < MIN_AGE) return 'too-young'
  if (age < DIGITAL_MAJORITY_AGE) return 'parental-consent'
  if (age < 18) return 'minor'
  return 'adult'
}
