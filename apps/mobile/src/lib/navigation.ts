import type { PlayerTab } from '@kwatro/design-system'
import { router } from 'expo-router'

// ponytail: seules les pages existantes y sont ; ajouter Mes parties, Messages et Profil avec leurs écrans
const TAB_ROUTES: Partial<Record<PlayerTab, '/'>> = { explorer: '/' }

export const openHome = () => router.navigate('/')

export function openTab(tab: string) {
  const route = TAB_ROUTES[tab as PlayerTab]
  if (route) router.navigate(route)
}

// ponytail: fiches événement, room et lieu, inscription et création de room pas encore faites
export const notYet = () => {}
