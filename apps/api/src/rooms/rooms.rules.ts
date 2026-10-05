import type { createRoomSchema, GameKind } from '@kwatro/shared'
import type { z } from 'zod'

/** Délai de réservation maximal d'une room. */
export const ROOM_MAX_DAYS_AHEAD = 60
// ponytail: limite fixe contre le spam, à ajuster quand on verra l'usage réel
export const MAX_OPEN_ROOMS_PER_HOST = 5

const DAY_MS = 24 * 60 * 60 * 1000

export type RoomContext = {
  game: { kind: GameKind; formatIds: string[] }
  /** Lieu ouvert à l'heure de la room ; null si ses horaires ne sont pas renseignés. */
  venueOpen: boolean | null
  hostIsMinor: boolean
  /** Rooms à venir encore ouvertes ou complètes, organisées par l'hôte. */
  hostOpenRooms: number
}

/**
 * Création d'une room (archi §5) : message de refus affiché tel quel dans l'app, ou null.
 * Classée = TCG uniquement, avec un format ; jeux de société toujours en normale.
 */
export function createRoomRefusal(
  room: z.output<typeof createRoomSchema>,
  { game, venueOpen, hostIsMinor, hostOpenRooms }: RoomContext,
  now = new Date(),
): string | null {
  if (room.formatId && !game.formatIds.includes(room.formatId))
    return 'Ce format n’existe pas pour ce jeu'
  if (game.kind === 'TCG' && !room.formatId) return 'Choisis un format'
  if (room.mode === 'RANKED' && game.kind !== 'TCG')
    return 'Les jeux de société se jouent en room normale'
  if (room.startsAt <= now) return 'Choisis une date et une heure à venir'
  if (room.startsAt.getTime() > now.getTime() + ROOM_MAX_DAYS_AHEAD * DAY_MS)
    return `Une room se crée au plus ${ROOM_MAX_DAYS_AHEAD} jours à l’avance`
  if (venueOpen === false) return 'Le lieu est fermé à cette heure-là'
  // Un mineur ne pourrait pas jouer dans sa propre room 18+
  if (hostIsMinor && !room.minorsAllowed) return 'Ta room doit être ouverte aux mineurs'
  if (hostOpenRooms >= MAX_OPEN_ROOMS_PER_HOST)
    return `Tu as déjà ${MAX_OPEN_ROOMS_PER_HOST} rooms à venir : attends qu’une soit passée`
  return null
}
