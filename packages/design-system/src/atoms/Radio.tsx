import { Pressable, Text, View } from 'react-native'
import { border, colors, font, sizes } from '../tokens'

export function Radio({
  value,
  onPress,
  label,
}: {
  value: boolean
  onPress?: () => void
  label: string
}) {
  return (
    <Pressable
      role="radio"
      aria-checked={value}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: sizes.touch }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: 11,
          backgroundColor: colors.white,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {value ? (
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ink }} />
        ) : null}
      </View>
      <Text style={{ ...font('body', 600), fontSize: 14, color: colors.ink }}>{label}</Text>
    </Pressable>
  )
}
