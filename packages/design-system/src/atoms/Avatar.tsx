import type { ReactNode } from 'react'
import { Image, Text, View } from 'react-native'
import { border, colors, font, sizes, textOn } from '../tokens'

/** Avatar : photo si `uri`, sinon l'initiale ; `badge` se pose en bas à droite (ex. CountBadge). */
export function Avatar({
  name,
  uri,
  color = colors.event,
  size = sizes.avatar.m,
  badge,
}: {
  name: string
  uri?: string | null
  color?: string
  size?: number
  badge?: ReactNode
}) {
  const large = size >= sizes.avatar.xl
  return (
    <View style={{ width: size, height: size }} aria-label={name}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          borderWidth: large ? border.base : border.thin,
          borderColor: colors.ink,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {uri ? (
          <Image source={{ uri }} style={{ width: '100%', height: '100%' }} />
        ) : (
          <Text
            style={{
              ...(large ? font('display') : font('body', 800)),
              fontSize: Math.round(size * (large ? 0.42 : 0.4)),
              color: textOn(color),
            }}
          >
            {name.slice(0, 1).toUpperCase()}
          </Text>
        )}
      </View>
      {badge ? <View style={{ position: 'absolute', right: -4, bottom: -4 }}>{badge}</View> : null}
    </View>
  )
}
