import type { ReactNode } from 'react'
import { View } from 'react-native'
import { border, colors } from '../tokens'

/** Encadré sur fond doux (formulaire déplié dans une ligne, liste de vérification). */
export function Inset({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.hover,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 10,
        padding: 14,
        gap: 10,
      }}
    >
      {children}
    </View>
  )
}
