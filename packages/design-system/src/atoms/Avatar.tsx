import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import { border, colors, font, sizes, textOn } from '../tokens'

/** Avatar à l'initiale ; `badge` se pose en bas à droite (ex. CountBadge). */
export function Avatar({
  name,
  color = colors.event,
  size = sizes.avatar.m,
  badge,
}: {
  name: string
  color?: string
  size?: number
  badge?: ReactNode
}) {
  return (
    <View style={{ width: size, height: size }} aria-label={name}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: border.thin,
          borderColor: colors.ink,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{ ...font('body', 800), fontSize: Math.round(size * 0.4), color: textOn(color) }}
        >
          {name.slice(0, 1).toUpperCase()}
        </Text>
      </View>
      {badge ? <View style={{ position: 'absolute', right: -4, bottom: -4 }}>{badge}</View> : null}
    </View>
  )
}
