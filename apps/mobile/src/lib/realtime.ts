import { type Channel, channelName, channelSchema, REALTIME } from '@lucko/shared'
import { type QueryKey, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { Platform } from 'react-native'
import { io, type Socket } from 'socket.io-client'
import { API_URL, authClient } from './auth'

let socket: Socket | undefined

/** Connexion temps réel partagée par l'app. Réservée aux joueurs connectés : l'API refuse les autres. */
function getSocket() {
  socket ??= io(API_URL, {
    autoConnect: false,
    transports: ['websocket'],
    withCredentials: true,
    // Relu à chaque (re)connexion : sur téléphone, le cookie de session n'est pas envoyé automatiquement
    auth: (cb) => {
      void (async () =>
        cb({
          cookie: Platform.OS === 'web' ? undefined : await authClient.getCookie(),
          devUserId: process.env.EXPO_PUBLIC_DEV_USER_ID,
        }))()
    },
  })
  // Refusée (pas encore connecté) : le prochain écran qui en a besoin réessaie
  if (!socket.active) socket.connect()
  return socket
}

/** Déconnexion du joueur : la session suivante rouvre la connexion avec son propre cookie. */
export const disconnectRealtime = () => socket?.disconnect()

/**
 * Suit `channel` tant que l'écran est monté : `listeners` reçoit les événements de ce canal, `onResync` est appelé
 * après une reconnexion pour rattraper ce qui a été manqué. `enabled` : false tant que le joueur n'y a pas droit.
 */
export function useChannel(
  channel: Channel,
  listeners: Record<string, (payload: unknown) => void>,
  onResync: () => void,
  enabled = true,
) {
  const name = channelName(channel)
  // Dernières fonctions reçues : pas de réabonnement à chaque rendu
  const latest = useRef({ listeners, onResync })
  latest.current = { listeners, onResync }
  // biome-ignore lint/correctness/useExhaustiveDependencies: le canal est identifié par son nom
  useEffect(() => {
    if (!enabled) return
    const live = getSocket()
    const watch = () => live.emit(REALTIME.WATCH, channel)
    const resync = () => latest.current.onResync()
    const handlers = Object.keys(latest.current.listeners).map((event) => {
      const handler = (payload: unknown) => {
        const target = (payload as { channel?: unknown } | null)?.channel ?? payload
        const parsed = channelSchema.safeParse(target)
        if (parsed.success && channelName(parsed.data) === name)
          latest.current.listeners[event]?.(payload)
      }
      live.on(event, handler)
      return [event, handler] as const
    })
    if (live.connected) watch()
    // Les abonnements ne survivent pas à une reconnexion : on se réabonne et on rattrape ce qui a changé
    live.on('connect', watch)
    live.io.on('reconnect', resync)
    return () => {
      live.emit(REALTIME.UNWATCH, channel)
      live.off('connect', watch)
      live.io.off('reconnect', resync)
      for (const [event, handler] of handlers) live.off(event, handler)
    }
  }, [name, enabled])
}

/** Envoie un événement sur la connexion temps réel (saisie en cours du chat). */
export const emitRealtime = (event: string, payload: unknown) => getSocket().emit(event, payload)

/**
 * Recharge `queryKey` dès que l'API signale un changement sur le canal (places restantes, statut…).
 * `enabled` : false tant que le joueur n'a pas droit au canal (room dont il n'est pas membre).
 */
export function useRealtime(channel: Channel, queryKey: QueryKey, enabled = true) {
  const client = useQueryClient()
  const refresh = () => void client.invalidateQueries({ queryKey })
  useChannel(channel, { [REALTIME.CHANGED]: refresh }, refresh, enabled)
}
