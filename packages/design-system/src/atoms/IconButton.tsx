import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { border, colors, shadow, sizes } from '../tokens'
import { Raised } from './Raised'
import { useHover } from './useHover'

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
  const { hovered, hoverProps } = useHover()
  const plain = bg === colors.white
  const face = (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: size > 36 ? border.base : border.thin,
        borderColor: colors.ink,
        borderRadius: r,
        backgroundColor: plain && hovered ? colors.hover : bg,
        alignItems: 'center',
        justifyContent: 'center',
        transform: !plain && hovered ? [{ translateX: -1 }, { translateY: -1 }] : [],
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
      {...hoverProps}
    >
      {plain ? (
        face
      ) : (
        <Raised offset={shadow.sm} r={r}>
          {face}
        </Raised>
      )}
    </Pressable>
  )
}
