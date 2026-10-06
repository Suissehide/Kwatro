import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font } from '../tokens'

/** Compteurs côte à côte, séparés par un trait. */
export function StatStrip({
  items,
}: {
  items: { label: string; value: number; color?: string }[]
}) {
  return (
    <View style={{ flexDirection: 'row' }}>
      {items.map((item, i) => (
        <View
          key={item.label}
          style={{
            flex: 1,
            paddingVertical: 12,
            paddingHorizontal: 18,
            gap: 2,
            borderLeftWidth: i ? border.thin : 0,
            borderColor: colors.line,
          }}
        >
          <Typography variant="label" style={{ color: colors.ink }}>
            {item.label}
          </Typography>
          <Text style={{ ...font('display'), fontSize: 22, color: item.color ?? colors.ink }}>
            {item.value}
          </Text>
        </View>
      ))}
    </View>
  )
}
