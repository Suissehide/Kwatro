import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { border, type ContentKind, colors, contentColor, radius, shadow } from '../tokens'

/** Carte de contenu avec bandeau de 8 px à la couleur du type ; `raised` pour la carte en tête de liste. */
export function ContentCard({
  kind,
  raised,
  children,
}: {
  kind?: ContentKind
  raised?: boolean
  children: ReactNode
}) {
  const inner = (
    <View
      style={{
        backgroundColor: colors.white,
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
  return raised ? <Raised offset={shadow.card}>{inner}</Raised> : inner
}
