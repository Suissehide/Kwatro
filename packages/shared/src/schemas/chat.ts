import { z } from 'zod'
import { EVENT_TYPES, ROOM_MODES } from '../constants'
import { isoDateTime } from './common'
import type { Channel } from './realtime'

/**
 * Chat de room et de tournoi (LKO-80). Une conversation par room ou par événement, adressée comme sa fiche :
 * `/chats/room/<id>` ou `/chats/event/<id>`. En direct, sur le canal `room-chat` / `event-chat` (voir REALTIME).
 */
export const CHAT_TYPES = ['room', 'event'] as const
export type ChatType = (typeof CHAT_TYPES)[number]
export type ChatRef = { type: ChatType; id: string }

export const chatChannel = ({ type, id }: ChatRef): Channel => ({ type: `${type}-chat`, id })

export const CHAT_MESSAGE_MAX = 1000
/** Messages par page (historique paginé du plus récent au plus ancien). */
export const CHAT_PAGE_SIZE = 30

/** POST /chats/:type/:id/messages. `announcement` : réservé à l'hôte ou à l'organisateur. */
export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, { message: 'Message vide' })
    .max(CHAT_MESSAGE_MAX, { message: `${CHAT_MESSAGE_MAX} caractères maximum` }),
  announcement: z.boolean().default(false),
})

export type SendMessageInput = z.input<typeof sendMessageSchema>

export const chatMessageSchema = z.object({
  id: z.string(),
  author: z.object({ id: z.string(), pseudo: z.string().nullable() }),
  body: z.string(),
  kind: z.enum(['MESSAGE', 'ANNOUNCEMENT']),
  createdAt: isoDateTime,
})

export type ChatMessage = z.infer<typeof chatMessageSchema>

/** GET /chats/:type/:id/messages?cursor= : une page, du plus récent au plus ancien. */
export const chatPageSchema = z.object({
  /** Format ou jeu de la room, titre de l'événement. */
  title: z.string(),
  messages: z.array(chatMessageSchema),
  /** Id à passer en `cursor` pour la page suivante (plus ancienne) ; null au début de la conversation. */
  nextCursor: z.string().nullable(),
  /** Dernière annonce, épinglée en haut du chat. */
  pinned: chatMessageSchema.nullable(),
  /** Dernier passage du joueur, avant celui-ci : place le séparateur « nouveaux messages ». */
  lastReadAt: isoDateTime.nullable(),
  muted: z.boolean(),
  /** Hôte de la room ou staff du lieu : annonces et suppression des messages des autres. */
  moderator: z.boolean(),
  /** En-tête : date, lieu (null à domicile) et joueurs de la room ou inscrits de l'événement. */
  startsAt: isoDateTime,
  venueName: z.string().nullable(),
  players: z.number().int(),
  /** Places de la room ; null pour un événement (on affiche les inscrits). */
  capacity: z.number().int().nullable(),
})

export type ChatPage = z.infer<typeof chatPageSchema>

export const chatPageQuerySchema = z.object({ cursor: z.string().max(64).optional() })

export const muteChatSchema = z.object({ muted: z.boolean() })

/**
 * GET /me/chats (onglet Messages) : chats du joueur, même sans message pour une partie à venir,
 * et total des non-lus (badge).
 */
export const myChatsSchema = z.object({
  unread: z.number().int(),
  chats: z.array(
    z.object({
      type: z.enum(CHAT_TYPES),
      id: z.string(),
      /** Format ou jeu de la room, titre de l'événement. */
      title: z.string(),
      /** Mode de la room ou type de l'événement. */
      kind: z.enum([...ROOM_MODES, ...EVENT_TYPES]),
      /** Date de la room ou de l'événement. */
      startsAt: isoDateTime,
      /** null : room à domicile. */
      venueName: z.string().nullable(),
      /** Partie terminée ou annulée (groupe « Terminées »). */
      past: z.boolean(),
      muted: z.boolean(),
      /** null : personne n'a encore écrit. */
      last: z
        .object({
          pseudo: z.string().nullable(),
          body: z.string(),
          createdAt: isoDateTime,
          mine: z.boolean(),
        })
        .nullable(),
      unread: z.number().int(),
    }),
  ),
})

export type MyChats = z.infer<typeof myChatsSchema>

/** Événements poussés sur le canal d'un chat. */
export const CHAT_EVENTS = {
  /** Charge : { channel, message: ChatMessage } */
  MESSAGE: 'chat:message',
  /** Charge : { channel, messageId } */
  DELETED: 'chat:deleted',
  /** Client → API : { channel } ; API → autres clients : { channel, pseudo } */
  TYPING: 'chat:typing',
} as const
