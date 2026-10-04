import type { PlayerTab } from '@kwatro/design-system'
import { router } from 'expo-router'

// ponytail: seules les pages existantes y sont ; ajouter Mes parties, Messages et Profil avec leurs écrans
const TAB_ROUTES: Partial<Record<PlayerTab, '/'>> = { explorer: '/' }

export const openHome = () => router.navigate('/')

/** Retour à l'écran précédent ; à l'accueil si la fiche a été ouverte directement (lien, web). */
export const goBack = () => (router.canGoBack() ? router.back() : openHome())

export const openVenue = (slug: string) =>
  router.push({ pathname: '/lieux/[slug]', params: { slug } })

export const openEvent = (id: string) =>
  router.push({ pathname: '/evenements/[id]', params: { id } })

export function openTab(tab: string) {
  const route = TAB_ROUTES[tab as PlayerTab]
  if (route) router.navigate(route)
}

// ponytail: fiche room et création de room pas encore faites
export const notYet = () => {}
