import type { StatusTone } from '@kwatro/design-system'
import { type ContentKind, colors, contentColor } from '@kwatro/design-system'
import {
  type AgendaItem,
  type AvatarStatus,
  EVENT_TYPE_LABELS,
  formatDayMonth,
  formatHour,
  formatKwote,
  KWOTE_PROVISIONAL_GAMES,
  type Me,
  PLAY_VIBE_LABELS,
  type Ranking,
} from '@kwatro/shared'
import { gameLabel } from './explore'

// ponytail: couleur par jeu de la maquette, les autres jeux prennent la couleur des événements
const GAME_KIND: Record<string, ContentKind> = {
  magic: 'room',
  lorcana: 'event',
  pokemon: 'kwote',
  'one-piece': 'venue',
}
export const gameColor = (slug: string) => contentColor[GAME_KIND[slug] ?? 'event']

export const placeLine = (me: Me, short?: boolean) =>
  me.city ? `${me.city} · ${short ? '' : 'rayon '}${me.searchRadiusKm} km` : null

export const vibeLabels = (me: Me) => me.vibes.map((v) => PLAY_VIBE_LABELS[v].label)

/** Photo montrée seulement une fois validée : sinon l'initiale. */
export const visibleAvatar = (me: Me) => (me.avatarStatus === 'APPROVED' ? me.avatarUrl : null)

export const AVATAR_STATUS: Record<
  AvatarStatus,
  { label: string; tone: StatusTone; help: string }
> = {
  APPROVED: {
    label: 'Photo validée',
    tone: 'ok',
    help: 'Ta photo est visible par les autres joueurs.',
  },
  PENDING: {
    label: 'En vérification',
    tone: 'warn',
    help: 'Quelqu’un de l’équipe vérifie ta photo. En attendant, les autres joueurs voient ton initiale.',
  },
  REJECTED: {
    label: 'Photo refusée',
    tone: 'err',
    help: 'Elle ne respecte pas la charte de la communauté. Choisis-en une autre.',
  },
}

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`
const ranked = (n: number) => `${plural(n, 'partie')} classée${n > 1 ? 's' : ''}`

export function rankProps(ranking: Ranking) {
  const provisional = ranking.kwote === null
  return {
    color: gameColor(ranking.game.slug),
    game: gameLabel(ranking.game),
    format: ranking.format,
    kwote: ranking.kwote === null ? null : formatKwote(ranking.kwote),
    progress: `${ranking.rankedGames} / ${KWOTE_PROVISIONAL_GAMES}`,
    note: provisional
      ? `Encore ${ranked(KWOTE_PROVISIONAL_GAMES - ranking.rankedGames)} avant ta première Kwote`
      : ranked(ranking.rankedGames),
    shortNote: provisional ? 'provisoire' : plural(ranking.rankedGames, 'partie'),
  }
}

export function agendaStatus(item: AgendaItem): { label: string; tone: StatusTone } | null {
  switch (item.status) {
    case 'REGISTERED':
      return { label: 'Place réservée', tone: 'ok' }
    case 'WAITLISTED':
      return { label: 'Liste d’attente', tone: 'warn' }
    case 'PENDING':
      return { label: 'Candidature envoyée', tone: 'warn' }
    case 'MISSING_PLAYERS':
      return {
        label: `Il manque ${plural((item.capacity ?? 0) - item.playerCount, 'joueur')}`,
        tone: 'warn',
      }
    case 'FULL':
      return { label: 'Table complète', tone: 'info' }
    case 'PLAYED':
      return null
  }
}

// ponytail: pas encore de résultats de partie (victoire, place, variation de Kwote) : ticket fin de partie
export function agendaTag(item: AgendaItem) {
  if (item.roomMode === 'CASUAL') return { label: 'Libre', variant: 'default' as const }
  if (item.roomMode === 'RANKED') return { label: 'Classée', variant: 'ranked' as const }
  return null
}

export function agendaCardProps(item: AgendaItem) {
  const past = item.status === 'PLAYED'
  const { day, month } = formatDayMonth(item.startsAt)
  const type = item.eventType
    ? EVENT_TYPE_LABELS[item.eventType]
    : item.roomMode === 'RANKED'
      ? 'Room classée'
      : 'Room libre'
  const time = formatHour(item.startsAt)
  return {
    color: past ? colors.muted : item.kind === 'EVENT' ? colors.event : colors.room,
    day,
    month,
    label: `${type} · ${item.game ? gameLabel(item.game) : 'Tous jeux'}`,
    title: item.title,
    meta: past ? (item.place ?? 'À domicile') : `${item.place ?? 'À domicile'} · ${time}`,
    count: item.capacity ? `${item.playerCount}/${item.capacity}` : undefined,
  }
}
