import { Pressable, View } from 'react-native'
import { border, colors } from '../tokens'

export function Toggle({
  value,
  onChange,
  label,
}: {
  value: boolean
  onChange?: (v: boolean) => void
  label: string
}) {
  return (
    <Pressable
      role="switch"
      aria-checked={value}
      aria-label={label}
      onPress={() => onChange?.(!value)}
      hitSlop={9}
      style={{
        width: 46,
        height: 26,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 99,
        backgroundColor: value ? colors.venue : colors.white,
        justifyContent: 'center',
        paddingHorizontal: 2,
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: value ? colors.white : colors.ink,
          borderWidth: border.thin,
          borderColor: colors.ink,
          alignSelf: value ? 'flex-end' : 'flex-start',
        }}
      />
    </Pressable>
  )
}
