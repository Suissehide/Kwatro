import type { ReactNode } from 'react'
import { ScrollView } from 'react-native'
import { space } from '../tokens'

/** Défilement horizontal qui déborde jusqu'aux bords de l'écran téléphone (chips, cartes). */
export function Carousel({ gap = 12, children }: { gap?: number; children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginHorizontal: -space.screen, flexGrow: 0 }}
      contentContainerStyle={{ gap, paddingHorizontal: space.screen, paddingVertical: 2 }}
    >
      {children}
    </ScrollView>
  )
}
