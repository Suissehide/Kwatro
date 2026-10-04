import type { AgendaStatus } from '@kwatro/shared'
import type { ParticipantStatus, RegistrationStatus } from '../generated/prisma/client'

/** Une partie commencée depuis moins de 3 h reste « à venir » (soirée en cours). */
export const STILL_UPCOMING_MS = 3 * 60 * 60 * 1000

export function eventStatus(registration: RegistrationStatus): AgendaStatus {
  return registration === 'WAITLISTED' ? 'WAITLISTED' : 'REGISTERED'
}

/** Place du joueur dans une room à venir : candidature pas encore acceptée, ou état de la table. */
export function roomStatus(
  participant: ParticipantStatus,
  accepted: number,
  capacity: number,
): AgendaStatus {
  if (participant !== 'ACCEPTED') return 'PENDING'
  return accepted < capacity ? 'MISSING_PLAYERS' : 'FULL'
}
