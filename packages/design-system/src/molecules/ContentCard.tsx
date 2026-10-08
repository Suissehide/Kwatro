import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import {
  border,
  type ContentKind,
  colors,
  contentColor,
  radius,
  shadow,
  transition,
} from '../tokens'

/** Carte de contenu avec bandeau de 8 px à la couleur du type ; `raised` pour la carte en tête de liste. */
export function ContentCard({
  kind,
  color,
  raised,
  onPress,
  label,
  children,
}: {
  kind?: ContentKind
  /** Remplace la couleur du type pour le bandeau. */
  color?: string
  raised?: boolean
  onPress?: () => void
  label?: string
  children: ReactNode
}) {
  const { hovered, hoverProps } = useHover()
  const inner = (
    <View
      style={{
        backgroundColor: onPress && hovered ? colors.hover : colors.white,
        ...transition(['background-color']),
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      {kind || color ? (
        <View
          style={{
            height: 8,
            backgroundColor: color ?? (kind && contentColor[kind]),
            borderBottomWidth: border.base,
            borderColor: colors.ink,
          }}
        />
      ) : null}
      <View style={{ paddingVertical: 12, paddingHorizontal: 14, gap: 8 }}>{children}</View>
    </View>
  )
  const card = raised ? <Raised offset={shadow.card}>{inner}</Raised> : inner
  return onPress ? (
    <Pressable role="link" aria-label={label} onPress={onPress} {...hoverProps}>
      {card}
    </Pressable>
  ) : (
    card
  )
}
