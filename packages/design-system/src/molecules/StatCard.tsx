import { TrendingDown, TrendingUp } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, textOn, transition } from '../tokens'

/** Chiffre clé ; avec `onPress`, lien vers le détail (soulevé au survol, comme un bouton). */
export function StatCard({
  value,
  label,
  delta,
  bg = colors.kwote,
  onPress,
}: {
  value: string
  label: string
  delta?: { text: string; up: boolean }
  bg?: string
  onPress?: () => void
}) {
  const fg = textOn(bg)
  const { hovered, hoverProps } = useHover()
  const Trend = delta?.up ? TrendingUp : TrendingDown
  const card = (
    <Raised offset={shadow.md}>
      <View
        style={{
          transform: onPress && hovered ? [{ translateX: -1 }, { translateY: -1 }] : [],
          ...transition(['transform']),
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
  return onPress ? (
    <Pressable role="link" aria-label={`${label} : ${value}`} onPress={onPress} {...hoverProps}>
      {card}
    </Pressable>
  ) : (
    card
  )
}
