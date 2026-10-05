import { type PlayerTab, SITE_URL } from '@kwatro/design-system'
import { router } from 'expo-router'
import { Linking } from 'react-native'

// ponytail: Messages n'a pas encore d'écran
const TAB_ROUTES: Partial<Record<PlayerTab, '/' | '/my-games' | '/profile'>> = {
  explorer: '/',
  parties: '/my-games',
  profil: '/profile',
}

export const openHome = () => router.navigate('/')

/** Retour à l'écran précédent ; à l'accueil si la fiche a été ouverte directement (lien, web). */
export const goBack = () => (router.canGoBack() ? router.back() : openHome())

export const openVenue = (slug: string) =>
  router.push({ pathname: '/venues/[slug]', params: { slug } })

export const openEvent = (id: string) => router.push({ pathname: '/events/[id]', params: { id } })

export const openRoom = (id: string) => router.push({ pathname: '/rooms/[id]', params: { id } })

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
