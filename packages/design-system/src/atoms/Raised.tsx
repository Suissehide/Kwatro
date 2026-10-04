import type { ReactNode } from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'
import { colors, radius } from '../tokens'

/** Ombre dure multiplateforme : une copie noire décalée sous l'élément (Android n'a pas d'ombre dure). */
export function Raised({
  offset = 4,
  r = radius.card,
  color = colors.ink,
  style,
  children,
}: {
  offset?: number
  r?: number
  color?: string
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
          backgroundColor: color,
          borderRadius: r,
        }}
      />
      {children}
    </View>
  )
}
