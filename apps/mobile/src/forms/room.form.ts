import {
  addDays,
  BOARD_GAME_CATEGORY_LABELS,
  type BoardGameCategory,
  type CreateRoomInput,
  formatMinuteOfDay,
  fromLocalDateTime,
  type Game,
  type RoomVibe,
} from '@lucko/shared'

/** Brouillon de « Créer une room » (19a / 19b), gardé tant que la popup est ouverte. */
export type RoomDraft = {
  gameId: string
  formatId: string
  category: BoardGameCategory | null
  /** Bracket Commander (1 à 5), facultatif. */
  bracket: number | null
  ranked: boolean
  /** Date locale du lieu, « 2026-10-24 ». */
  day: string
  /** Minutes depuis minuit, heure du lieu. */
  minute: number
  venueId: string
  capacity: number
  autoAccept: boolean
  vibes: RoomVibe[]
  description: string
  minorsAllowed: boolean
}

/** Jours proposés en puces (aujourd'hui compris) ; au-delà, le calendrier. */
export const PRESET_DAYS = 6
export const PRESET_MINUTES = [840, 1020, 1110, 1170, 1230, 1260]
/** Réglage « Autre heure… » : de 8 h à 23 h 45, par pas de 15 min. */
export const MINUTE_RANGE = { min: 8 * 60, max: 23 * 60 + 45, step: 15 }
/** Au-delà des joueurs d'une partie, la room plafonne à 6 (8 en draft et aux jeux de société). */
const ROOM_SEATS_MAX = 6

export const roomDraft = (today: string, venueId = ''): RoomDraft => ({
  gameId: '',
  formatId: '',
  category: null,
  bracket: null,
  ranked: false,
  day: today,
  minute: 19 * 60 + 30,
  venueId,
  capacity: 4,
  autoAccept: true,
  vibes: [],
  description: '',
  minorsAllowed: true,
})

export const formatOf = (game: Game | undefined, d: RoomDraft) =>
  game?.formats.find((f) => f.id === d.formatId)

/** Places proposées : 4 en Commander, la catégorie pour les jeux de société (4 sans catégorie), sinon le maximum d'une partie. */
function defaultCapacity(game: Game, formatId: string, category: BoardGameCategory | null) {
  if (category) return BOARD_GAME_CATEGORY_LABELS[category].players
  const format = game.formats.find((f) => f.id === formatId)
  if (!format) return game.kind === 'TCG' ? game.minPlayers : 4
  return format.hasBrackets ? 4 : format.maxPlayers
}

/** Nouveau jeu : premier format (jeux de société : toutes catégories), bracket remis à zéro, places par défaut. */
export function withGame(d: RoomDraft, game: Game): RoomDraft {
  const board = game.kind !== 'TCG'
  const formatId = game.formats[0]?.id ?? ''
  return {
    ...d,
    gameId: game.id,
    formatId,
    category: null,
    bracket: null,
    ranked: board ? false : d.ranked,
    capacity: defaultCapacity(game, formatId, null),
  }
}

/** Nouveau format ou nouvelle catégorie : places par défaut, bracket remis à zéro. */
export const withFormat = (
  d: RoomDraft,
  game: Game,
  formatId: string,
  category: BoardGameCategory | null,
): RoomDraft => ({
  ...d,
  formatId,
  category,
  bracket: null,
  capacity: defaultCapacity(game, formatId, category),
})

export function seatsRange(game: Game | undefined, d: RoomDraft) {
  const format = formatOf(game, d)
  return {
    min: format?.minPlayers ?? game?.minPlayers ?? 2,
    max: Math.max(ROOM_SEATS_MAX, format?.maxPlayers ?? game?.maxPlayers ?? 0),
  }
}

/** « Commander · bracket 3 », « Jeux · Ambiance », « Jeux de société » (toutes catégories), « Modern ». */
export function roomTitle(game: Game | undefined, d: RoomDraft) {
  if (d.category) return `Jeux · ${BOARD_GAME_CATEGORY_LABELS[d.category].label}`
  const format = formatOf(game, d)
  if (!format) return game?.name ?? 'Nouvelle room'
  return d.bracket ? `${format.name} · bracket ${d.bracket}` : format.name
}

/** Heure ajustée par le réglage + / − : les minutes débordent sur l'heure, bornées de 8 h à 23 h 45. */
export const clampMinute = (minute: number) =>
  Math.min(MINUTE_RANGE.max, Math.max(MINUTE_RANGE.min, minute))

const dayDate = (day: string) => new Date(`${day}T12:00:00Z`)
const dayFormat = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('fr-FR', { timeZone: 'UTC', ...options }).format(dayDate(day))
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Puce d'un jour : « Auj. » / « Mer. » au-dessus de « 7 ». */
export const dayChip = (day: string, today: string) => ({
  top: day === today ? 'Auj.' : capitalize(dayFormat(day, { weekday: 'short' })),
  label: String(Number(day.slice(8))),
})

/** « Sam. · 24 oct. » sur la puce « Autre date… » une fois choisie. */
export const otherDayLabel = (day: string) => ({
  top: capitalize(dayFormat(day, { weekday: 'short' })),
  label: dayFormat(day, { day: 'numeric', month: 'short' }),
})

/** « Aujourd'hui · 19 h 30 », « Mer 7 octobre · 19 h 30 ». */
export const whenLabel = (d: RoomDraft, today: string) =>
  `${
    d.day === today
      ? 'Aujourd’hui'
      : capitalize(dayFormat(d.day, { weekday: 'short', day: 'numeric', month: 'long' }))
  } · ${formatMinuteOfDay(d.minute)}`

/** « Auj. 7 · 19:30 », pour l'aperçu dans l'agenda. */
export const previewTime = (d: RoomDraft, today: string) => {
  const { top, label } = dayChip(d.day, today)
  return `${top} ${label} · ${clockLabel(d.minute)}`
}

export const clockLabel = (minute: number) =>
  `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`

export const startsAt = (d: RoomDraft) => fromLocalDateTime(d.day, d.minute)

export const presetDays = (today: string) =>
  Array.from({ length: PRESET_DAYS }, (_, i) => addDays(today, i))

/** Corps du POST /rooms. */
export const roomBody = (d: RoomDraft): CreateRoomInput => ({
  gameId: d.gameId,
  formatId: d.formatId || null,
  boardGameCategory: d.category,
  bracket: d.bracket,
  mode: d.ranked ? 'RANKED' : 'CASUAL',
  venueId: d.venueId,
  startsAt: startsAt(d).toISOString(),
  capacity: d.capacity,
  autoAccept: d.autoAccept,
  vibes: d.vibes,
  description: d.description.trim() || undefined,
  minorsAllowed: d.minorsAllowed,
})
