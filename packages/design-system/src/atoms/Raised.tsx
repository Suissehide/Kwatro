import type { ReactNode } from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'
import { colors, radius } from '../tokens'

/** Ombre dure multiplateforme : une copie noire décalée sous l'élément (Android n'a pas d'ombre dure). */
export function Raised({
  offset = 4,
  r = radius.card,
  style,
  children,
}: {
  offset?: number
  r?: number
  style?: StyleProp<ViewStyle>
  children: ReactNode
}) {
  return (
    <View style={[{ position: 'relative' }, style]}>
      <View
        style={{
          position: 'absolute',
          top: offset,
          left: offset,
          right: -offset,
          bottom: -offset,
          backgroundColor: colors.ink,
          borderRadius: r,
        }}
      />
      {children}
    </View>
  )
}
