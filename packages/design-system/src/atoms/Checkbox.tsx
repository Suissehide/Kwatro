import { Check } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { border, colors, font, sizes } from '../tokens'

/** Case à cocher. `hideLabel` = case seule (ex. tableau) : le libellé reste lu via aria-label. */
export function Checkbox({
  value,
  onChange,
  label,
  hideLabel,
}: {
  value: boolean
  onChange?: (v: boolean) => void
  label: string
  hideLabel?: boolean
}) {
  return (
    <Pressable
      role="checkbox"
      aria-checked={value}
      aria-label={label}
      onPress={() => onChange?.(!value)}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: sizes.touch }}
    >
      <View
        style={{
          width: 24,
          height: 24,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: 6,
          backgroundColor: value ? colors.venue : colors.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? <Check size={16} color={colors.white} strokeWidth={3} /> : null}
      </View>
      {!hideLabel ? (
        <Text style={{ ...font('body', 600), fontSize: 14, color: colors.ink }}>{label}</Text>
      ) : null}
    </Pressable>
  )
}
