import { Pressable, Text, View } from 'react-native'
import { border, colors, font, onColor, radius, shadow } from '../tokens'
import { Raised } from './Raised'

export type ButtonKind = 'room' | 'event' | 'venue' | 'kwote' | 'ink' | 'ghost'
const bg: Record<ButtonKind, string> = {
  room: colors.room,
  event: colors.event,
  venue: colors.venue,
  kwote: colors.kwote,
  ink: colors.ink,
  ghost: colors.white,
}
const fg: Record<ButtonKind, string> = {
  room: onColor.room,
  event: onColor.event,
  venue: onColor.venue,
  kwote: onColor.kwote,
  ink: onColor.ink,
  ghost: colors.ink,
}

/** Bouton : à l'appui il glisse de la taille de son ombre, qui disparaît. */
export function Button({
  label,
  kind = 'room',
  small,
  disabled,
  onPress,
}: {
  label: string
  kind?: ButtonKind
  small?: boolean
  disabled?: boolean
  onPress?: () => void
}) {
  const off = small ? shadow.sm : shadow.md
  const r = small ? 9 : radius.button
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      onPress={onPress}
      disabled={disabled}
    >
      {({ pressed }) => {
        const face = (
          <View
            style={{
              backgroundColor: disabled ? colors.disabledBg : bg[kind],
              borderWidth: small ? border.thin : border.base,
              borderColor: disabled ? colors.disabledBorder : colors.ink,
              borderRadius: r,
              paddingVertical: small ? 7 : 14,
              paddingHorizontal: small ? 12 : 16,
              minHeight: small ? 36 : 52,
              alignItems: 'center',
              justifyContent: 'center',
              transform:
                pressed && kind !== 'ghost' ? [{ translateX: off }, { translateY: off }] : [],
            }}
          >
            <Text
              style={{
                ...font('body', 800),
                fontSize: small ? 12 : 15,
                textTransform: 'uppercase',
                color: disabled ? colors.disabledText : fg[kind],
              }}
            >
              {label}
            </Text>
          </View>
        )
        return kind === 'ghost' || disabled || pressed ? (
          face
        ) : (
          <Raised offset={off} r={r}>
            {face}
          </Raised>
        )
      }}
    </Pressable>
  )
}
