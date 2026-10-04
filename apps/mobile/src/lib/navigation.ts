import type { PlayerTab } from '@kwatro/design-system'
import { router } from 'expo-router'

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

export function openTab(tab: string) {
  const route = TAB_ROUTES[tab as PlayerTab]
  if (route) router.navigate(route)
}

// ponytail: fiche room et création de room pas encore faites
export const notYet = () => {}
