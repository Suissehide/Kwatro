import { type PlayerTab, SITE_URL } from '@lucko/design-system'
import { router } from 'expo-router'
import { Linking } from 'react-native'

const TAB_ROUTES: Record<PlayerTab, '/' | '/my-games' | '/messages' | '/profile'> = {
  explorer: '/',
  parties: '/my-games',
  messages: '/messages',
  profil: '/profile',
}

export const openHome = () => router.navigate('/')

/** Retour à l'écran précédent ; à l'accueil si la fiche a été ouverte directement (lien, web). */
export const goBack = () => (router.canGoBack() ? router.back() : openHome())

/** Tous les lieux autour du joueur (B2, KWT-75). */
export const openVenues = () => router.push('/venues')

export const openVenue = (slug: string) =>
  router.push({ pathname: '/venues/[slug]', params: { slug } })

export const openEvent = (id: string) => router.push({ pathname: '/events/[id]', params: { id } })

export const openRoom = (id: string) => router.push({ pathname: '/rooms/[id]', params: { id } })

export const openChat = (type: 'room' | 'event', id: string) =>
  router.push({ pathname: '/chat/[type]/[id]', params: { type, id } })

export const openSettings = () => router.push('/settings')

/** Créer une room ; `venueSlug` présélectionne le lieu. */
export const openCreateRoom = (venueSlug?: string) =>
  router.push({ pathname: '/rooms/new', params: venueSlug ? { venue: venueSlug } : {} })

/** Page du site public : aide, pages légales. */
export const openSite = (path: string) => void Linking.openURL(SITE_URL + path)

export function openTab(tab: string) {
  const route = TAB_ROUTES[tab as PlayerTab]
  if (route) router.navigate(route)
}

// ponytail: listes complètes (programme, rooms, carte) pas encore faites
export const notYet = () => {}
