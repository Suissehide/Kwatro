import { View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors } from '../tokens'

/**
 * Histogramme ; les barres de `highlight` (index) passent en rating (soirs à XP bonus).
 * Au-delà de 14 barres (30 à 90 jours) : traits fins, coins de 4 px et libellés masqués par défaut.
 */
export function BarChart({
  data,
  max,
  height = 180,
  highlight = [],
  color = colors.venue,
  gap = 12,
  showLabels,
}: {
  data: { label: string; value: number }[]
  max?: number
  height?: number
  highlight?: number[]
  color?: string
  gap?: number
  showLabels?: boolean
}) {
  const m = max ?? Math.max(1, ...data.map((d) => d.value))
  const dense = data.length > 14
  const labels = showLabels ?? !dense
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
          gap,
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
              backgroundColor: highlight.includes(i) ? colors.rating : color,
              borderWidth: dense ? border.thin : border.base,
              borderBottomWidth: 0,
              borderColor: colors.ink,
              borderTopLeftRadius: dense ? 4 : 6,
              borderTopRightRadius: dense ? 4 : 6,
            }}
          />
        ))}
      </View>
      {labels ? (
        <View style={{ flexDirection: 'row', gap, paddingHorizontal: 10 }}>
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
      ) : null}
    </View>
  )
}
