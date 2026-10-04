import type { PlayerTab } from '@kwatro/design-system'
import { router } from 'expo-router'

// ponytail: Messages n'a pas encore d'écran
const TAB_ROUTES: Partial<Record<PlayerTab, '/' | '/my-games' | '/profile'>> = {
  explorer: '/',
  parties: '/my-games',
  profil: '/profile',
}

export const openHome = () => router.navigate('/')

export function openTab(tab: string) {
  const route = TAB_ROUTES[tab as PlayerTab]
  if (route) router.navigate(route)
}

// ponytail: fiches événement, room et lieu, inscription et création de room pas encore faites
export const notYet = () => {}
