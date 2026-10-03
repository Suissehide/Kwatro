import {
  EVENT_TYPE_LABELS,
  type EventListItem,
  formatDayMonth,
  formatDistance,
  formatHour,
  formatHourBand,
  formatKwote,
  formatMinuteOfDay,
  type RoomListItem,
  VENUE_TIME_ZONE,
  VENUE_TYPE_LABELS,
  type VenueListItem,
} from '@kwatro/shared'

export const GAMES: { key: string | null; label: string }[] = [
  { key: null, label: 'Tous' },
  { key: 'magic', label: 'Magic' },
  { key: 'pokemon', label: 'Pokémon' },
  { key: 'lorcana', label: 'Lorcana' },
  { key: 'one-piece', label: 'One Piece' },
  { key: 'yugioh', label: 'Yu-Gi-Oh!' },
  { key: 'jeux-de-societe', label: 'Jeux de société' },
]

export const gameLabel = (game: { slug: string; name: string }) =>
  GAMES.find((g) => g.key === game.slug)?.label ?? game.name

// Liste vide = tous jeux (soirée libre)
export const matchesGame = (game: string | null, games: { slug: string }[]) =>
  !game || games.length === 0 || games.some((g) => g.slug === game)

export const localDay = (date: Date | string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: VENUE_TIME_ZONE }).format(new Date(date))

export function todayLine(city: string, short?: boolean) {
  const date = new Intl.DateTimeFormat('fr-FR', {
    timeZone: VENUE_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: short ? 'short' : 'long',
  }).format(new Date())
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${city}`
}

export function eventPlaces(event: EventListItem) {
  if (event.registrationMode === 'NONE') return 'Accès libre'
  if (event.registrationMode === 'EXTERNAL') return 'Inscription externe'
  if (event.capacity === null) return null
  const left = Math.max(0, event.capacity - event.registeredCount)
  return left ? `${left} place${left > 1 ? 's' : ''} sur ${event.capacity}` : 'Complet'
}

export function eventCardProps(event: EventListItem) {
  const games = event.games.length ? event.games.map(gameLabel).join(', ') : 'Tous jeux'
  return {
    day: formatDayMonth(event.startsAt).day,
    time: formatHourBand(event.startsAt),
    label: `${EVENT_TYPE_LABELS[event.type]} · ${games}`,
    title: event.title,
    meta: `${event.venue.name} · ${formatDistance(event.venue.distanceMeters)}`,
    places: eventPlaces(event),
    partner: event.venue.isPartner,
  }
}

export function roomCardProps(room: RoomListItem) {
  const missing = Math.max(0, room.capacity - room.players.length)
  return {
    label: `${room.mode === 'RANKED' ? 'Partie classée' : 'Partie libre'} · ${gameLabel(room.game)}`,
    title: missing ? `Il manque ${missing} joueur${missing > 1 ? 's' : ''}` : 'Room complète',
    meta: `${room.venue.name} · ${formatHour(room.startsAt)}`,
    players: room.players.map((p) => p.initial),
    capacity: room.capacity,
    kwote: room.kwoteRange
      ? `${formatKwote(room.kwoteRange.min)} – ${formatKwote(room.kwoteRange.max)}`
      : null,
  }
}

export function venueRowProps(venue: VenueListItem) {
  const closes =
    venue.closesAtMinute !== null ? ` · jusqu'à ${formatMinuteOfDay(venue.closesAtMinute)}` : ''
  return {
    name: venue.name,
    subtitle: `${VENUE_TYPE_LABELS[venue.type]}${closes}`,
    distance: formatDistance(venue.distanceMeters),
    partner: venue.isPartner,
    perk: venue.isPartner ? venue.kwatroPerk : null,
  }
}
