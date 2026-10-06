import { TrendingDown, TrendingUp } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { border, colors, font, radius, shadow, textOn } from '../tokens'

export function StatCard({
  value,
  label,
  delta,
  bg = colors.kwote,
}: {
  value: string
  label: string
  delta?: { text: string; up: boolean }
  bg?: string
}) {
  const fg = textOn(bg)
  const Trend = delta?.up ? TrendingUp : TrendingDown
  return (
    <Raised offset={shadow.md}>
      <View
        style={{
          backgroundColor: bg,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          paddingVertical: 14,
          paddingHorizontal: 16,
          gap: 4,
        }}
      >
        <Text style={{ ...font('display'), fontSize: 34, color: fg }}>{value}</Text>
        <Text style={{ ...font('body', 700), fontSize: 13, color: fg }}>{label}</Text>
        {delta ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Trend size={15} color={delta.up ? colors.venue : colors.room} strokeWidth={2.5} />
            <Text
              style={{
                ...font('mono', 700),
                fontSize: 13,
                color: delta.up ? colors.venue : colors.room,
              }}
            >
              {delta.text}
            </Text>
          </View>
        ) : null}
      </View>
    </Raised>
  )
}
