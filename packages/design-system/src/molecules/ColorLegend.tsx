import { View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, radius } from '../tokens'

/** Légende des couleurs de contenu (agenda) : carte blanche, une pastille par couleur. */
export function ColorLegend({
  title = 'Légende',
  items,
}: {
  title?: string
  items: { label: string; color: string }[]
}) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        paddingVertical: 16,
        paddingHorizontal: 18,
        gap: 10,
      }}
    >
      <Typography variant="label">{title}</Typography>
      {items.map((item) => (
        <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View
            style={{
              width: 14,
              height: 14,
              borderWidth: border.thin,
              borderColor: colors.ink,
              borderRadius: radius.tag,
              backgroundColor: item.color,
            }}
          />
          <Typography variant="small" weight={600} color={colors.ink}>
            {item.label}
          </Typography>
        </View>
      ))}
    </View>
  )
}
