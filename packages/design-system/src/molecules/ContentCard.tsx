import type { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, type ContentKind, colors, contentColor, radius, shadow } from '../tokens'

/**
 * Carte de contenu avec bandeau de 8 px à la couleur du type ; `raised` pour la carte en tête de liste.
 * Avec `onPress`, la carte entière est cliquable (fond crème clair au survol).
 */
export function ContentCard({
  kind,
  raised,
  onPress,
  label,
  children,
}: {
  kind?: ContentKind
  raised?: boolean
  onPress?: () => void
  /** Nom lu par les lecteurs d'écran quand la carte est cliquable. */
  label?: string
  children: ReactNode
}) {
  const { hovered, hoverProps } = useHover()
  const inner = (
    <View
      style={{
        backgroundColor: onPress && hovered ? colors.hover : colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      {kind ? (
        <View
          style={{
            height: 8,
            backgroundColor: contentColor[kind],
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
