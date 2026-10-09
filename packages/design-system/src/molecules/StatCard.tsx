import { TrendingDown, TrendingUp } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, textOn, transition } from '../tokens'

/**
 * Chiffre clé ; avec `onPress`, lien vers le détail (soulevé au survol, comme un bouton).
 * `emphasized` : ombre pleine quand il demande une action ; `empty` : chiffre grisé quand il vaut 0.
 * `label-first` : ordre des tableaux de bord (libellé mono au-dessus, puis la valeur).
 */
export function StatCard({
  value,
  label,
  note,
  delta,
  bg = colors.rating,
  emphasized,
  empty,
  layout = 'value-first',
  onPress,
}: {
  value: string
  label: string
  note?: string
  delta?: { text: string; up: boolean }
  bg?: string
  emphasized?: boolean
  empty?: boolean
  layout?: 'value-first' | 'label-first'
  onPress?: () => void
}) {
  const fg = textOn(bg)
  const { hovered, hoverProps } = useHover()
  const Trend = delta?.up ? TrendingUp : TrendingDown
  const labelFirst = layout === 'label-first'
  const valueText = (
    <Text
      style={{
        ...font('display'),
        fontSize: 34,
        lineHeight: 36,
        color: empty ? colors.inactive : fg,
      }}
    >
      {value}
    </Text>
  )
  const labelText = labelFirst ? (
    <Text
      style={{
        ...font('mono', 700),
        fontSize: 11,
        textTransform: 'uppercase',
        color: fg === colors.ink ? colors.muted : fg,
      }}
    >
      {label}
    </Text>
  ) : (
    <Text style={{ ...font('body', 700), fontSize: 13, color: fg }}>{label}</Text>
  )
  const body = (
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
      {labelFirst ? labelText : valueText}
      {labelFirst ? valueText : labelText}
      {note ? (
        <Text
          style={{
            ...font('body', 400),
            fontSize: 12,
            color: fg === colors.ink ? colors.muted : fg,
          }}
        >
          {note}
        </Text>
      ) : null}
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
  )
  const card = emphasized ? <Raised offset={shadow.md}>{body}</Raised> : body
  return onPress ? (
    <Pressable role="link" aria-label={`${label} : ${value}`} onPress={onPress} {...hoverProps}>
      {card}
    </Pressable>
  ) : (
    card
  )
}
