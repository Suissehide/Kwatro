import { Pressable, Text, View } from 'react-native'
import {
  border,
  colors,
  font,
  motion,
  onColor,
  radius,
  semantic,
  shadow,
  transition,
} from '../tokens'
import { Raised } from './Raised'
import { useHover } from './useHover'

/** `ghost` et `soft` (action secondaire, liste d'attente) n'ont pas d'ombre. */
export type ButtonKind = 'room' | 'event' | 'venue' | 'kwote' | 'ink' | 'ghost' | 'soft'
const bg: Record<ButtonKind, string> = {
  room: colors.room,
  event: colors.event,
  venue: colors.venue,
  kwote: colors.kwote,
  ink: colors.ink,
  ghost: colors.white,
  soft: semantic.neutralSoft,
}
const fg: Record<ButtonKind, string> = {
  room: onColor.room,
  event: onColor.event,
  venue: onColor.venue,
  kwote: onColor.kwote,
  ink: onColor.ink,
  ghost: colors.ink,
  soft: colors.ink,
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
  const { hovered, hoverProps } = useHover()
  const flat = kind === 'ghost' || kind === 'soft'
  const lifted = hovered && !disabled && !flat
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={disabled}
      onPress={onPress}
      disabled={disabled}
      {...hoverProps}
      // Même arrondi que la face : l'anneau de focus clavier (web) suit le bouton au lieu d'un rectangle
      style={{ borderRadius: r }}
    >
      {({ pressed }) => {
        const face = (
          <View
            style={{
              backgroundColor: disabled
                ? colors.disabledBg
                : flat && hovered
                  ? colors.hover
                  : bg[kind],
              borderWidth: small ? border.thin : border.base,
              borderColor: disabled ? colors.disabledBorder : colors.ink,
              borderRadius: r,
              paddingVertical: small ? 7 : 14,
              paddingHorizontal: small ? 12 : 16,
              minHeight: small ? 36 : 52,
              alignItems: 'center',
              justifyContent: 'center',
              ...transition(['transform', 'background-color'], motion.fast),
              transform:
                pressed && !flat
                  ? [{ translateX: off }, { translateY: off }]
                  : lifted
                    ? [{ translateX: -1 }, { translateY: -1 }]
                    : [],
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
        // Structure fixe pendant l'appui : la face glisse pile sur son ombre, qui disparaît dessous.
        // Retirer <Raised> à l'appui recréait la face sous le curseur : sur le web, Chrome n'envoie
        // alors pas de « click » au relâchement et onPress n'était jamais appelé.
        return flat || disabled ? (
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
