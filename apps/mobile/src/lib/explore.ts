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
  type VenueDetail,
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

export function eventPlaces(
  event: Pick<EventListItem, 'registrationMode' | 'capacity' | 'registeredCount'>,
) {
  if (event.registrationMode === 'NONE') return 'Accès libre'
  if (event.registrationMode === 'EXTERNAL') return 'Inscription externe'
  if (event.capacity === null) return null
  const left = Math.max(0, event.capacity - event.registeredCount)
  return left ? `${left} place${left > 1 ? 's' : ''} sur ${event.capacity}` : 'Complet'
}

export const isFull = (event: Pick<EventListItem, 'capacity' | 'registeredCount'>) =>
  event.capacity !== null && event.registeredCount >= event.capacity

const capitalize = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`

/** « Sam. 10 oct. » */
export const shortDay = (date: Date | string) =>
  capitalize(
    new Intl.DateTimeFormat('fr-FR', {
      timeZone: VENUE_TIME_ZONE,
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }).format(new Date(date)),
  )

/** « Samedi 10 octobre · 19 h – 23 h » */
export function eventWhen(startsAt: string, endsAt: string | null) {
  const day = new Intl.DateTimeFormat('fr-FR', {
    timeZone: VENUE_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(startsAt))
  const hours = endsAt ? `${formatHour(startsAt)} – ${formatHour(endsAt)}` : formatHour(startsAt)
  return `${capitalize(day)} · ${hours}`
}

/** Carte événement ; sans `venue` (fiche lieu), la date complète remplace le lieu. */
export function eventCardProps(
  event: Omit<EventListItem, 'venue'> & { venue?: EventListItem['venue'] },
) {
  const games = event.games.length ? event.games.map(gameLabel).join(', ') : 'Tous jeux'
  return {
    day: formatDayMonth(event.startsAt).day,
    time: formatHourBand(event.startsAt),
    label: `${EVENT_TYPE_LABELS[event.type]} · ${games}`,
    title: event.title,
    meta: event.venue
      ? `${event.venue.name} · ${formatDistance(event.venue.distanceMeters)}`
      : shortDay(event.startsAt),
    places: eventPlaces(event),
    partner: event.venue?.isPartner,
  }
}

const WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']

/** Horaires de la semaine, une ligne par jour : « 17 h – 1 h », plusieurs plages séparées par une virgule. */
export function openingLines(hours: VenueDetail['openingHours']) {
  return WEEKDAYS.map((label, i) => {
    const ranges = hours
      .filter((h) => h.weekday === i + 1)
      .map((h) => `${formatMinuteOfDay(h.opensAtMinute)} – ${formatMinuteOfDay(h.closesAtMinute)}`)
    return { label, value: ranges.length ? ranges.join(', ') : 'Fermé' }
  })
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
