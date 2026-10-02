import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { border, colors, shadow, sizes } from '../tokens'
import { Raised } from './Raised'

/** Bouton carré à pictogramme. `label` est obligatoire : c'est le nom lu par les lecteurs d'écran. */
export function IconButton({
  icon,
  label,
  bg = colors.white,
  size = sizes.iconBtn,
  onPress,
}: {
  icon: ReactNode
  label: string
  bg?: string
  size?: number
  onPress?: () => void
}) {
  const r = size > 36 ? 12 : 10
  const face = (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: size > 36 ? border.base : border.thin,
        borderColor: colors.ink,
        borderRadius: r,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </View>
  )
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      hitSlop={Math.max(0, (sizes.touch - size) / 2)}
    >
      {bg === colors.white ? (
        face
      ) : (
        <Raised offset={shadow.sm} r={r}>
          {face}
        </Raised>
      )}
    </Pressable>
  )
}
