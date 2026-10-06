import type { NotificationTopic } from '@lucko/shared'
import { isMinor } from '../common/minors.rules'

/** Pas de notification aux mineurs le soir tard (archi §14) : de 21 h à 8 h, heure de Paris. */
const QUIET_FROM = 21
const QUIET_UNTIL = 8

const parisMinutes = (now: Date) => {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return get('hour') * 60 + get('minute')
}

/**
 * Heure d'envoi d'une notification : tout de suite (null) pour un adulte ou en journée,
 * 8 h (heure de Paris) le lendemain matin pour un mineur pendant les heures calmes.
 */
// ponytail: un jour de changement d'heure, l'envoi peut partir à 7 h ou 9 h
export function quietUntil(
  user: { id: string; birthDate: Date | null; parentId: string | null },
  now = new Date(),
): Date | null {
  if (!isMinor(user, now)) return null
  const minutes = parisMinutes(now)
  const quiet = minutes >= QUIET_FROM * 60 || minutes < QUIET_UNTIL * 60
  if (!quiet) return null
  const wait = (QUIET_UNTIL * 60 - minutes + 24 * 60) % (24 * 60)
  const at = new Date(now.getTime() + wait * 60_000)
  at.setSeconds(0, 0)
  return at
}

/** Le joueur reçoit ce sujet : compte actif et sujet pas coupé dans ses réglages. */
export const wantsTopic = (
  user: { deletedAt: Date | null; notificationsOff: NotificationTopic[] },
  topic: NotificationTopic,
) => user.deletedAt === null && !user.notificationsOff.includes(topic)
