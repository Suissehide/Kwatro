import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { border, colors, motion, shadow, sizes, transition } from '../tokens'
import { Raised } from './Raised'
import { useHover } from './useHover'

/**
 * Bouton carré à pictogramme. `label` est obligatoire : c'est le nom lu par les lecteurs d'écran.
 * Sur un fond coloré il a une ombre, sauf `flat` (état basculé, ex. sourdine).
 */
export function IconButton({
  icon,
  label,
  bg = colors.white,
  size = sizes.iconBtn,
  disabled,
  flat,
  onPress,
}: {
  icon: ReactNode
  label: string
  bg?: string
  size?: number
  disabled?: boolean
  flat?: boolean
  onPress?: () => void
}) {
  const r = size > 36 ? 12 : 10
  const { hovered, hoverProps } = useHover()
  const plain = bg === colors.white || disabled || flat
  const face = (
    <View
      style={{
        width: size,
        height: size,
        borderWidth: size > 36 ? border.base : border.thin,
        borderColor: disabled ? colors.disabledBorder : colors.ink,
        borderRadius: r,
        backgroundColor: disabled
          ? colors.disabledBg
          : bg === colors.white && hovered
            ? colors.hover
            : bg,
        alignItems: 'center',
        justifyContent: 'center',
        transform: !plain && hovered ? [{ translateX: -1 }, { translateY: -1 }] : [],
        ...transition(['transform', 'background-color'], motion.fast),
      }}
    >
      {icon}
    </View>
  )
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      disabled={disabled}
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
