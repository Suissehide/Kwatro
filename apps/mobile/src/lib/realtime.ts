import { type Channel, channelName, channelSchema, REALTIME } from '@kwatro/shared'
import { type QueryKey, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
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
 * Recharge `queryKey` dès que l'API signale un changement sur le canal (places restantes, statut…).
 * `enabled` : false tant que le joueur n'a pas droit au canal (room dont il n'est pas membre).
 */
export function useRealtime(channel: Channel, queryKey: QueryKey, enabled = true) {
  const client = useQueryClient()
  const name = channelName(channel)
  // biome-ignore lint/correctness/useExhaustiveDependencies: le canal est identifié par son nom, la clé suit le canal
  useEffect(() => {
    if (!enabled) return
    const live = getSocket()
    const watch = () => live.emit(REALTIME.WATCH, channel)
    const refresh = () => client.invalidateQueries({ queryKey })
    const onChanged = (payload: unknown) => {
      const changed = channelSchema.safeParse(payload)
      if (changed.success && channelName(changed.data) === name) void refresh()
    }
    if (live.connected) watch()
    // Les abonnements ne survivent pas à une reconnexion : on se réabonne et on rattrape ce qui a changé
    live.on('connect', watch)
    live.io.on('reconnect', refresh)
    live.on(REALTIME.CHANGED, onChanged)
    return () => {
      live.emit(REALTIME.UNWATCH, channel)
      live.off('connect', watch)
      live.io.off('reconnect', refresh)
      live.off(REALTIME.CHANGED, onChanged)
    }
  }, [name, enabled])
}
