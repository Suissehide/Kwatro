import { Dimensions, Platform } from 'react-native'

const UMAMI_URL = process.env.EXPO_PUBLIC_UMAMI_URL ?? 'https://umami.qwetle.fr'
// Sans identifiant (dev, tests) : rien n'est envoyé
const WEBSITE_ID = process.env.EXPO_PUBLIC_UMAMI_WEBSITE_ID

let currentUrl = '/'

/**
 * Mesure d'audience Umami, anonyme et sans cookie (politique de confidentialité). Appel direct à l'API
 * plutôt que le script : il ne tourne pas dans l'app native. Sans `name` : page vue de `url`.
 * Jamais d'identifiant de joueur ni de donnée personnelle dans `data`.
 */
export function track(name?: string, data?: Record<string, string | number | boolean>) {
  if (!WEBSITE_ID) return
  const { width, height } = Dimensions.get('window')
  const payload = {
    website: WEBSITE_ID,
    hostname: Platform.OS === 'web' ? globalThis.location?.hostname : `app-${Platform.OS}`,
    language: Intl.DateTimeFormat().resolvedOptions().locale,
    screen: `${Math.round(width)}x${Math.round(height)}`,
    url: currentUrl,
    ...(name ? { name, data } : {}),
  }
  fetch(`${UMAMI_URL}/api/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'event', payload }),
  }).catch(() => {})
}

/** Page vue : appelée par le layout racine à chaque changement d'écran. */
export function trackPage(path: string) {
  currentUrl = path
  track()
}
