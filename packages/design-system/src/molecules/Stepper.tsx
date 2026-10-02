import { Text, View } from 'react-native'
import { IconButton } from '../atoms/IconButton'
import { colors, font } from '../tokens'

const glyph = { ...font('body', 800), fontSize: 18, color: colors.ink }

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
        icon={<Text style={glyph}>−</Text>}
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
        icon={<Text style={glyph}>+</Text>}
        onPress={() => onChange(Math.min(max, value + 1))}
      />
    </View>
  )
}
