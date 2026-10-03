import type { ReactNode } from 'react'
import { View } from 'react-native'
import { border, colors, radius } from '../tokens'

export function ListCard({ children }: { children: ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  )
}
