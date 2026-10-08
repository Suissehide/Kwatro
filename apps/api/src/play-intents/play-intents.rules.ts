import {
  localDateTime,
  metersBetween,
  PLAY_INTENT_COOLDOWN_HOURS,
  PLAY_INTENT_MIN_COUNT,
  type PlayWhen,
} from '@lucko/shared'
import { roomVisibleTo } from '../common/minors.rules'

/** Soirée : la room commence à 17 h ou plus tard (heure de Paris). */
const EVENING_MINUTE = 17 * 60

/** Nombre de joueurs qui attendent un jeu, masqué sous le seuil d'anonymat. */
export const visibleCount = (count: number) => (count >= PLAY_INTENT_MIN_COUNT ? count : null)

/** La room tombe au moment choisi : le soir, le week-end (samedi, dimanche) ou peu importe. */
export function matchesWhen(when: PlayWhen, startsAt: Date) {
  const { weekday, minute } = localDateTime(startsAt)
  if (when === 'EVENING') return minute >= EVENING_MINUTE
  if (when === 'WEEKEND') return weekday >= 6
  return true
}

type Place = { latitude: number | null; longitude: number | null }

/** Le joueur est dans le rayon autour du point (sa ville, jamais sa position précise). */
export function withinRadius(user: Place & { searchRadiusKm: number }, point: Place) {
  if (user.latitude === null || user.longitude === null) return false
  if (point.latitude === null || point.longitude === null) return false
  return (
    metersBetween(
      { latitude: user.latitude, longitude: user.longitude },
      { latitude: point.latitude, longitude: point.longitude },
    ) <=
    user.searchRadiusKm * 1000
  )
}

/**
 * Prévenir ce joueur de la room ouverte ? Pas l'hôte, jamais une room à domicile, envie encore active,
 * une notification par jeu au plus toutes les PLAY_INTENT_COOLDOWN_HOURS, dans son rayon, au moment
 * choisi, et visible par lui (règles mineurs). Les blocages sont filtrés par la requête.
 */
export function shouldNotify(
  intent: { expiresAt: Date; notifiedAt: Date | null },
  user: Place & {
    id: string
    birthDate: Date | null
    parentId: string | null
    searchRadiusKm: number
    playWhen: PlayWhen
  },
  room: {
    hostId: string
    atHome: boolean
    minorsAllowed: boolean
    startsAt: Date
    venue: Place | null
  },
  now = new Date(),
) {
  const cooldown = PLAY_INTENT_COOLDOWN_HOURS * 60 * 60 * 1000
  return (
    user.id !== room.hostId &&
    !room.atHome &&
    room.venue !== null &&
    intent.expiresAt > now &&
    (intent.notifiedAt === null || now.getTime() - intent.notifiedAt.getTime() >= cooldown) &&
    withinRadius(user, room.venue) &&
    matchesWhen(user.playWhen, room.startsAt) &&
    roomVisibleTo(room, user, now)
  )
}
