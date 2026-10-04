import { ageOn, type RegistrationMode, type RegistrationStatus } from '@kwatro/shared'

export type RegistrableEvent = {
  registrationMode: RegistrationMode
  startsAt: Date
  cancelledAt: Date | null
  minAge: number | null
  capacity: number | null
}

/**
 * Inscription d'un joueur : refus (message affiché tel quel dans l'app), sinon inscrit
 * tant qu'il reste des places, puis liste d'attente. `registeredCount` exclut le joueur lui-même.
 */
export function registrationOutcome(
  event: RegistrableEvent,
  registeredCount: number,
  /** null : compte Apple / Google sans date de naissance, l'âge minimum ne peut pas être vérifié. */
  birthDate: Date | null,
  now = new Date(),
): { status: RegistrationStatus } | { refused: string } {
  if (event.registrationMode === 'NONE')
    return { refused: 'Entrée libre, pas besoin de s’inscrire' }
  if (event.registrationMode === 'EXTERNAL')
    return { refused: 'L’inscription se fait sur le site de l’organisateur' }
  if (event.cancelledAt) return { refused: 'Cet événement est annulé' }
  if (event.startsAt <= now) return { refused: 'Cet événement a déjà commencé' }
  if (!birthDate) return { refused: 'Renseigne ta date de naissance pour t’inscrire' }
  if (event.minAge !== null && ageOn(birthDate, now) < event.minAge)
    return { refused: `Réservé aux ${event.minAge} ans et plus` }
  const full = event.capacity !== null && registeredCount >= event.capacity
  return { status: full ? 'WAITLISTED' : 'REGISTERED' }
}
