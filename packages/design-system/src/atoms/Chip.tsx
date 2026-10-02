import { Pressable, Text } from 'react-native'
import { border, colors, font, radius, textOn } from '../tokens'

/** Pastille de filtre ; active = fond kwote (ou `color`). */
export function Chip({
  label,
  active,
  color = colors.kwote,
  onPress,
}: {
  label: string
  active?: boolean
  color?: string
  onPress?: () => void
}) {
  return (
    <Pressable
      role="button"
      aria-pressed={!!active}
      onPress={onPress}
      style={{
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.pill,
        paddingVertical: 5,
        paddingHorizontal: 11,
        backgroundColor: active ? color : colors.white,
      }}
    >
      <Text
        style={{
          ...font('body', active ? 800 : 600),
          fontSize: 13,
          color: active ? textOn(color) : colors.ink,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
