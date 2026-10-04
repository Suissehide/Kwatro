import type { ReactNode } from 'react'
import { View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, radius } from '../tokens'

/** Carte blanche de formulaire ou de contenu, titre h2 facultatif et élément à droite du titre. */
export function Panel({
  title,
  right,
  compact,
  children,
}: {
  title?: string
  right?: ReactNode
  compact?: boolean
  children: ReactNode
}) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        padding: compact ? 16 : 24,
        gap: compact ? 14 : 18,
      }}
    >
      {title ? (
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <Typography variant="h2">{title}</Typography>
          {right}
        </View>
      ) : null}
      {children}
    </View>
  )
}
