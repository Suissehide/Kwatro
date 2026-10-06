import { colors } from '@lucko/design-system'
import {
  CHAT_TYPES,
  type ChatRef,
  type ChatType,
  EVENT_TYPE_LABELS,
  formatTime,
  VENUE_TIME_ZONE,
} from '@lucko/shared'
import type { ChatSummary as Chat, ChatPage } from '@/queries/useChat'
import { dayLabel, localDay, shortDay } from './explore'

export const CHAT_FILTERS = ['Tout', 'Rooms', 'Événements'] as const
const FILTER_TYPES: (ChatType | null)[] = [null, 'room', 'event']

export const chatColor = (type: ChatType) => (type === 'room' ? colors.room : colors.event)

const KIND_LABELS: Record<Chat['kind'], string> = {
  ...EVENT_TYPE_LABELS,
  RANKED: 'Room classée',
  CASUAL: 'Room libre',
}

/** Heure si aujourd'hui, sinon le jour court. */
const when = (date: string) =>
  localDay(date) === localDay(new Date()) ? formatTime(date) : dayLabel(date)

/** Conversations filtrées par type, réparties entre « À venir » et « Terminées » (groupes vides omis). */
export function chatGroups(chats: Chat[], filter: number) {
  const type = FILTER_TYPES[filter]
  const shown = chats.filter((chat) => !type || chat.type === type)
  return [
    { label: 'À venir', chats: shown.filter((chat) => !chat.past) },
    { label: 'Terminées', chats: shown.filter((chat) => chat.past) },
  ].filter((group) => group.chats.length)
}

export function chatRowProps(chat: Chat) {
  const time = formatTime(chat.startsAt)
  const day =
    localDay(chat.startsAt) !== localDay(new Date())
      ? dayLabel(chat.startsAt)
      : time >= '18:00'
        ? `Ce soir ${time}`
        : `Aujourd'hui ${time}`
  return {
    title: chat.title,
    time: chat.last ? when(chat.last.createdAt) : dayLabel(chat.startsAt),
    context: [KIND_LABELS[chat.kind], day, chat.venueName].filter(Boolean).join(' · '),
    preview: chat.last
      ? `${chat.last.mine ? 'Toi' : (chat.last.pseudo ?? 'Joueur')} : ${chat.last.body}`
      : 'Pas encore de message',
    color: chatColor(chat.type),
    unread: chat.unread,
    muted: chat.muted,
    past: chat.past,
  }
}

const capitalize = (text: string) => `${text.charAt(0).toUpperCase()}${text.slice(1)}`

const longDay = (date: string) =>
  capitalize(
    new Intl.DateTimeFormat('fr-FR', {
      timeZone: VENUE_TIME_ZONE,
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date(date)),
  )

/**
 * Détail de l'en-tête : « Vendredi 16 octobre, 19:00 · Carte Blanche · 18 inscrits ».
 * `compact` (téléphone) : « Ven. 16 oct. · 19:00 · 18 inscrits ».
 */
export function chatDetail(page: ChatPage, compact?: boolean) {
  const players =
    page.capacity === null
      ? `${page.players} inscrit${page.players > 1 ? 's' : ''}`
      : `${page.players}/${page.capacity} joueurs`
  const time = formatTime(page.startsAt)
  return compact
    ? [shortDay(page.startsAt), time, players].join(' · ')
    : [`${longDay(page.startsAt)}, ${time}`, page.venueName, players].filter(Boolean).join(' · ')
}

/** Séparateur de jour du fil : « Aujourd'hui », « Hier », sinon « Mercredi 24 septembre ». */
export function threadDay(date: string) {
  const day = localDay(date)
  if (day === localDay(new Date())) return "Aujourd'hui"
  if (day === localDay(new Date(Date.now() - 24 * 60 * 60 * 1000))) return 'Hier'
  return longDay(date)
}

const AVATAR_COLORS = [colors.room, colors.event, colors.venue]

/** Couleur d'avatar stable pour un auteur. */
export function authorColor(id: string) {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length] ?? colors.room
}

type ThreadMessage = {
  author: { id: string }
  createdAt: string
  kind: 'MESSAGE' | 'ANNOUNCEMENT'
}

/**
 * Mise en forme du fil, du plus récent au plus ancien (liste inversée) : séparateurs à poser au-dessus
 * de chaque message (changement de jour, « Nouveaux messages » à `newAt`) et premier message de chaque
 * groupe d'un même auteur (méta et avatar).
 */
export function threadLayout(messages: ThreadMessage[], newAt: number) {
  return messages.map((message, i) => {
    const older = messages[i + 1]
    const day = !older || localDay(older.createdAt) !== localDay(message.createdAt)
    const dividers = [
      day ? { label: threadDay(message.createdAt), tone: colors.muted } : null,
      i === newAt ? { label: 'Nouveaux messages', tone: colors.room } : null,
    ].filter((d) => d !== null)
    const first =
      dividers.length > 0 ||
      message.kind === 'ANNOUNCEMENT' ||
      older?.author.id !== message.author.id
    return { dividers, first }
  })
}

/** Chat désigné par les paramètres de route (`type`, `id`) ; null s'ils manquent ou sont invalides. */
export function chatParam(params: { type?: string; id?: string }): ChatRef | null {
  const type = CHAT_TYPES.find((t) => t === params.type)
  return type && params.id ? { type, id: params.id } : null
}
