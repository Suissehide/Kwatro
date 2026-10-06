import Constants from 'expo-constants'
import * as Device from 'expo-device'
import * as Notifications from 'expo-notifications'
import { type Href, router } from 'expo-router'
import { useEffect } from 'react'
import { Platform } from 'react-native'
import { CHAT } from '@/constants/queryKeys'
import { api } from './api'
import { queryClient } from './queryClient'

/** Notifications push (KWT-108) : seulement sur un vrai téléphone, pas sur le web ni le simulateur. */
const supported = Platform.OS !== 'web' && Device.isDevice

if (supported) {
  // Notification reçue pendant que l'app est ouverte : bannière quand même
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
}

/**
 * Jeton Expo Push de l'appareil, ou null : web, simulateur, permission refusée, ou app pas encore
 * liée à un projet EAS (`extra.eas.projectId`). `ask` affiche la demande système si besoin.
 */
async function deviceToken(ask: boolean) {
  if (!supported) return null
  let { status } = await Notifications.getPermissionsAsync()
  if (status !== 'granted' && ask) status = (await Notifications.requestPermissionsAsync()).status
  if (status !== 'granted') return null
  if (Platform.OS === 'android')
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lucko',
      importance: Notifications.AndroidImportance.DEFAULT,
    })
  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId
  try {
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data
  } catch {
    return null
  }
}

/** Enregistre ce téléphone auprès de l'API. false : notifications refusées ou impossibles ici. */
export async function registerPush(ask = false) {
  const token = await deviceToken(ask)
  if (token) await api.PUT('/me/push-tokens', { body: { token } })
  return token !== null
}

/** Déconnexion : ce téléphone ne reçoit plus rien pour ce joueur. */
export async function forgetPush() {
  const token = await deviceToken(false)
  if (token) await api.DELETE('/me/push-tokens/{token}', { params: { path: { token } } })
}

/**
 * À monter une fois : enregistre le téléphone quand un joueur est connecté (`meId`), sans demander
 * la permission (écran de pré-autorisation A8, KWT-59), et ouvre l'écran d'une notification tapée.
 */
export function usePush(meId: string | undefined) {
  useEffect(() => {
    if (meId) void registerPush().catch(() => undefined)
  }, [meId])

  useEffect(() => {
    if (!supported) return
    const open = (response: Notifications.NotificationResponse | null) => {
      const url = response?.notification.request.content.data?.url
      if (typeof url === 'string') router.push(url as Href)
    }
    void Notifications.getLastNotificationResponseAsync().then(open)
    const subscription = Notifications.addNotificationResponseReceivedListener(open)
    // Message reçu app ouverte : le badge de l'onglet Messages suit
    const received = Notifications.addNotificationReceivedListener(
      () => void queryClient.invalidateQueries({ queryKey: [CHAT.LIST] }),
    )
    return () => {
      subscription.remove()
      received.remove()
    }
  }, [])
}
