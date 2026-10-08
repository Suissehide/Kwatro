import type { ReactNode } from 'react'
import { type StyleProp, View, type ViewStyle } from 'react-native'
import { border, colors, radius } from '../tokens'

export function ListCard({
  children,
  style,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
