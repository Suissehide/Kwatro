import { Text, View } from 'react-native'
import { colors, font } from '../tokens'
import { Stepper } from './Stepper'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Heure en deux compteurs (heures : minutes). `value` en minutes depuis minuit, bornée par `min` et
 * `max` ; les minutes vont par `step` et débordent sur l'heure voisine (45 + 15 = heure suivante).
 */
export function TimePicker({
  value,
  min = 0,
  max = 24 * 60 - 1,
  step = 15,
  onChange,
}: {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (minute: number) => void
}) {
  const clamp = (m: number) => Math.min(max, Math.max(min, m))
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Stepper
        label="d'heures"
        value={hours}
        min={Math.floor(min / 60)}
        max={Math.floor(max / 60)}
        format={pad}
        onChange={(h) => onChange(clamp(h * 60 + minutes))}
      />
      <Text style={{ ...font('mono', 700), fontSize: 22, color: colors.ink }}>:</Text>
      <Stepper
        label="de minutes"
        value={minutes}
        min={-step}
        max={60}
        step={step}
        format={pad}
        onChange={(m) => onChange(clamp(hours * 60 + m))}
      />
    </View>
  )
}
