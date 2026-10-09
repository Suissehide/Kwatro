import { Minus, Plus } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { IconButton } from '../atoms/IconButton'
import { colors, font } from '../tokens'

/**
 * Compteur − / + borné entre `min` et `max`. `step` : pas de chaque appui ; `format` : affichage (« 05 »).
 * `label` nomme les boutons pour les lecteurs d'écran (« Moins d'heures »).
 */
export function Stepper({
  value,
  min = 0,
  max = 99,
  step = 1,
  format = String,
  label,
  onChange,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  format?: (v: number) => string
  label?: string
  onChange: (v: number) => void
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <IconButton
        label={label ? `Moins ${label}` : 'Moins'}
        icon={<Minus size={18} color={colors.ink} strokeWidth={2.5} />}
        onPress={() => onChange(Math.max(min, value - step))}
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
        {format(value)}
      </Text>
      <IconButton
        label={label ? `Plus ${label}` : 'Plus'}
        icon={<Plus size={18} color={colors.ink} strokeWidth={2.5} />}
        onPress={() => onChange(Math.min(max, value + step))}
      />
    </View>
  )
}
