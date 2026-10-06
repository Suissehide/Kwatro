import { Check } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, sizes, transition } from '../tokens'

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const PERIODS = [
  { label: 'Matin', short: 'Mat.' },
  { label: 'Après-midi', short: 'Aprèm' },
  { label: 'Soir', short: 'Soir' },
]

/**
 * Créneaux de la semaine (7 jours × matin, après-midi, soir). Créneau = jour × 3 + moment (0 = lundi matin).
 * Avec `onToggle` les cases se touchent (44 px) ; sans, lecture seule (28 px). `compact` : libellés courts.
 */
export function AvailabilityGrid({
  value,
  onToggle,
  compact,
}: {
  value: number[]
  onToggle?: (slot: number) => void
  compact?: boolean
}) {
  const labelWidth = compact ? 46 : onToggle ? 96 : 110
  const gap = compact ? 4 : 6
  return (
    <View style={{ gap }}>
      <View style={{ flexDirection: 'row', gap }}>
        <View style={{ width: labelWidth }} />
        {DAYS.map((day) => (
          <Text
            key={day}
            aria-label={day}
            style={{
              flex: 1,
              textAlign: 'center',
              ...font('mono', 700),
              fontSize: 11,
              textTransform: 'uppercase',
              color: colors.muted,
            }}
          >
            {compact ? day.charAt(0) : day.slice(0, 3)}
          </Text>
        ))}
      </View>
      {PERIODS.map((period, p) => (
        <View key={period.label} style={{ flexDirection: 'row', alignItems: 'center', gap }}>
          <Text
            style={{
              width: labelWidth,
              ...font('body', 700),
              fontSize: compact ? 12 : 13,
              color: colors.ink,
            }}
          >
            {compact ? period.short : period.label}
          </Text>
          {DAYS.map((day, d) => {
            const slot = d * 3 + p
            return (
              <Cell
                key={day}
                label={`${day} ${period.label.toLowerCase()}`}
                on={value.includes(slot)}
                onPress={onToggle ? () => onToggle(slot) : undefined}
              />
            )
          })}
        </View>
      ))}
    </View>
  )
}

function Cell({ label, on, onPress }: { label: string; on: boolean; onPress?: () => void }) {
  const { hovered, hoverProps } = useHover()
  const style = {
    flex: 1,
    height: onPress ? sizes.touch : 28,
    borderWidth: border.thin,
    borderColor: colors.ink,
    borderRadius: onPress ? radius.sm : 6,
    backgroundColor: on ? colors.event : hovered ? colors.hover : colors.white,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    ...transition(['background-color']),
  }
  if (!onPress) return <View aria-label={`${label} : ${on ? 'oui' : 'non'}`} style={style} />
  return (
    <Pressable
      role="checkbox"
      aria-checked={on}
      aria-label={label}
      onPress={onPress}
      {...hoverProps}
      style={style}
    >
      {on ? <Check size={18} color={colors.white} strokeWidth={3} /> : null}
    </Pressable>
  )
}
