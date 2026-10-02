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
          <Text
            style={{
              ...font('mono', 700),
              fontSize: 13,
              color: delta.up ? colors.venue : colors.room,
            }}
          >
            {delta.up ? '▲' : '▼'} {delta.text}
          </Text>
        ) : null}
      </View>
    </Raised>
  )
}
