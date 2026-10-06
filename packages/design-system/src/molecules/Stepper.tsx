import { Minus, Plus } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { IconButton } from '../atoms/IconButton'
import { colors, font } from '../tokens'

/** Compteur − / + borné entre `min` et `max`. */
export function Stepper({
  value,
  min = 0,
  max = 99,
  onChange,
}: {
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <IconButton
        label="Moins"
        icon={<Minus size={18} color={colors.ink} strokeWidth={2.5} />}
        onPress={() => onChange(Math.max(min, value - 1))}
      />
      <Text
        aria-live="polite"
        style={{
          ...font('display'),
          fontSize: 24,
          minWidth: 36,
          textAlign: 'center',
          color: colors.ink,
        }}
      >
        {value}
      </Text>
      <IconButton
        label="Plus"
        icon={<Plus size={18} color={colors.ink} strokeWidth={2.5} />}
        onPress={() => onChange(Math.min(max, value + 1))}
      />
    </View>
  )
}
