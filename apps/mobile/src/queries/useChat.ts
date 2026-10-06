import { CHAT_EVENTS, type ChatRef, chatChannel, type ReportInput } from '@lucko/shared'
import {
  type InfiniteData,
  queryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { CHAT } from '@/constants/queryKeys'
import { api } from '@/lib/api'
import { unwrap } from '@/lib/queryClient'
import { useChannel } from '@/lib/realtime'
import { useMeQuery } from './useMe'

// * QUERIES

const fetchPage = (ref: ChatRef, cursor?: string) =>
  unwrap(
    api.GET('/chats/{type}/{id}/messages', {
      params: { path: ref, query: cursor ? { cursor } : {} },
    }),
  )

type ChatPage = Awaited<ReturnType<typeof fetchPage>>
export type ChatMessage = ChatPage['messages'][number]
type Pages = InfiniteData<ChatPage, string | undefined>

const messagesKey = ({ type, id }: ChatRef) => [CHAT.MESSAGES, type, id]

/** Onglet Messages : conversations du joueur et total des non-lus (badge). */
export const chatsQueryOptions = queryOptions({
  queryKey: [CHAT.LIST],
  queryFn: () => unwrap(api.GET('/me/chats')),
})

export const useChatsQuery = (enabled = true) => useQuery({ ...chatsQueryOptions, enabled })

/** Pastilles des onglets : messages non lus du joueur connecté. */
export function useTabBadges() {
  const me = useMeQuery()
  const { data } = useChatsQuery(!!me)
  return { messages: data?.unread ?? 0 }
}

/** Non-lus d'un chat (bouton « Chat » des fiches room et événement). */
export function useChatUnread({ type, id }: ChatRef, enabled: boolean) {
  const { data } = useChatsQuery(enabled)
  return data?.chats.find((chat) => chat.type === type && chat.id === id)?.unread ?? 0
}

/** Ajoute un message en tête (sans doublon : il peut arriver par le socket et par la réponse HTTP). */
function addMessage(data: Pages | undefined, message: ChatMessage, replaceId?: string) {
  if (!data) return data
  const [first, ...rest] = data.pages
  if (!first) return data
  const others = first.messages.filter((m) => m.id !== replaceId && m.id !== message.id)
  return {
    ...data,
    pages: [
      {
        ...first,
        messages: [message, ...others],
        pinned: message.kind === 'ANNOUNCEMENT' ? message : first.pinned,
      },
      ...rest,
    ],
  }
}

function dropMessage(data: Pages | undefined, messageId: string) {
  if (!data) return data
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      messages: page.messages.filter((m) => m.id !== messageId),
      pinned: page.pinned?.id === messageId ? null : page.pinned,
    })),
  }
}

/** Saisie affichée tant qu'un autre joueur tape (il la renvoie toutes les quelques secondes). */
const TYPING_MS = 4000

/**
 * Historique paginé d'un chat, tenu à jour en direct : nouveaux messages, suppressions, saisie en cours.
 * Après une reconnexion, l'historique est rechargé (messages manqués, non-lus justes).
 */
export function useChatQuery(ref: ChatRef) {
  const client = useQueryClient()
  const key = messagesKey(ref)
  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam }) => fetchPage(ref, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  })
  const [typing, setTyping] = useState<string | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(typingTimer.current), [])

  useChannel(
    chatChannel(ref),
    {
      [CHAT_EVENTS.MESSAGE]: (payload) => {
        const { message } = payload as { message: ChatMessage }
        client.setQueryData<Pages>(key, (data) => addMessage(data, message))
        setTyping(null)
      },
      [CHAT_EVENTS.DELETED]: (payload) => {
        const { messageId } = payload as { messageId: string }
        const pinned = client.getQueryData<Pages>(key)?.pages[0]?.pinned?.id === messageId
        client.setQueryData<Pages>(key, (data) => dropMessage(data, messageId))
        // L'annonce épinglée supprimée : l'API renvoie la précédente
        if (pinned) void client.invalidateQueries({ queryKey: key })
      },
      [CHAT_EVENTS.TYPING]: (payload) => {
        setTyping((payload as { pseudo: string | null }).pseudo ?? 'Un joueur')
        clearTimeout(typingTimer.current)
        typingTimer.current = setTimeout(() => setTyping(null), TYPING_MS)
      },
    },
    () => void client.invalidateQueries({ queryKey: key }),
    query.isSuccess,
  )

  return { ...query, typing }
}

// * MUTATIONS

export function useChatMutations(ref: ChatRef, me: { id: string; pseudo: string | null }) {
  const client = useQueryClient()
  const key = messagesKey(ref)
  const path = { params: { path: ref } }

  /** Envoi optimiste : le message s'affiche tout de suite, retiré si l'API le refuse. */
  const send = useMutation({
    mutationKey: [CHAT.SEND, ref.type, ref.id],
    mutationFn: (body: { body: string; announcement?: boolean }) =>
      unwrap(api.POST('/chats/{type}/{id}/messages', { ...path, body })),
    onMutate: ({ body, announcement }) => {
      const temp: ChatMessage = {
        id: `temp-${Date.now()}`,
        author: me,
        body,
        kind: announcement ? 'ANNOUNCEMENT' : 'MESSAGE',
        createdAt: new Date().toISOString(),
      }
      client.setQueryData<Pages>(key, (data) => addMessage(data, temp))
      return temp.id
    },
    onSuccess: (message, _body, tempId) =>
      client.setQueryData<Pages>(key, (data) => addMessage(data, message, tempId)),
    onError: (_error, _body, tempId) => {
      if (tempId) client.setQueryData<Pages>(key, (data) => dropMessage(data, tempId))
    },
  })

  const remove = useMutation({
    mutationKey: [CHAT.DELETE, ref.type, ref.id],
    mutationFn: (messageId: string) =>
      unwrap(
        api.DELETE('/chats/{type}/{id}/messages/{messageId}', {
          params: { path: { ...ref, messageId } },
        }),
      ),
    onSuccess: (_data, messageId) =>
      client.setQueryData<Pages>(key, (data) => dropMessage(data, messageId)),
  })

  const report = useMutation({
    mutationKey: [CHAT.REPORT, ref.type, ref.id],
    mutationFn: ({ messageId, ...body }: ReportInput & { messageId: string }) =>
      unwrap(
        api.POST('/chats/{type}/{id}/messages/{messageId}/report', {
          params: { path: { ...ref, messageId } },
          body,
        }),
      ),
  })

  /** Le joueur a lu le chat : le badge de l'onglet Messages se met à jour. */
  const markRead = useMutation({
    mutationKey: [CHAT.READ, ref.type, ref.id],
    mutationFn: () => unwrap(api.PUT('/chats/{type}/{id}/read', path)),
    onSuccess: () => client.invalidateQueries({ queryKey: [CHAT.LIST] }),
  })

  const mute = useMutation({
    mutationKey: [CHAT.MUTE, ref.type, ref.id],
    mutationFn: (muted: boolean) =>
      unwrap(api.PUT('/chats/{type}/{id}/mute', { ...path, body: { muted } })),
    onSuccess: (_data, muted) =>
      client.setQueryData<Pages>(key, (data) =>
        data ? { ...data, pages: data.pages.map((page) => ({ ...page, muted })) } : data,
      ),
  })

  return { send, remove, report, markRead, mute }
}
