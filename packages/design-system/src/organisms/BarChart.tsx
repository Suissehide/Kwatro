import { View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors } from '../tokens'

/** Histogramme ; les barres de `highlight` (index) passent en rating. */
export function BarChart({
  data,
  max,
  height = 180,
  highlight = [],
}: {
  data: { label: string; value: number }[]
  max?: number
  height?: number
  highlight?: number[]
}) {
  const m = max ?? Math.max(1, ...data.map((d) => d.value))
  return (
    <View
      role="img"
      aria-label={data.map((d) => `${d.label} ${d.value}`).join(', ')}
      style={{ gap: 6 }}
    >
      <View
        style={{
          height,
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 12,
          paddingHorizontal: 10,
          borderLeftWidth: border.base,
          borderBottomWidth: border.base,
          borderColor: colors.ink,
        }}
      >
        {data.map((d, i) => (
          <View
            key={d.label}
            style={{
              flex: 1,
              height: `${(d.value / m) * 100}%`,
              backgroundColor: highlight.includes(i) ? colors.rating : colors.venue,
              borderWidth: border.base,
              borderBottomWidth: 0,
              borderColor: colors.ink,
              borderTopLeftRadius: 6,
              borderTopRightRadius: 6,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 10 }}>
        {data.map((d) => (
          <Typography
            key={d.label}
            variant="label"
            color={colors.ink}
            style={{ flex: 1, textAlign: 'center' }}
          >
            {d.label}
          </Typography>
        ))}
      </View>
    </View>
  )
}
