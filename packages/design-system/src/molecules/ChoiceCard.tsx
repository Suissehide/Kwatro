import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'

/**
 * Choix unique en carte (jeu, bracket, room amicale ou classée) : pastille de couleur, libellé et
 * description. Choisie : fond ratingSoft, bordure épaisse, ombre. `disabled` : grisée, description du motif.
 */
export function ChoiceCard({
  label,
  description,
  swatch,
  big,
  selected,
  disabled,
  onPress,
}: {
  label: string
  description?: string
  /** Couleur du jeu, en carré au-dessus du libellé. */
  swatch?: string
  /** Libellé en display (« 3 » d'un bracket). */
  big?: boolean
  selected: boolean
  disabled?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const card = (
    <View
      style={{
        flexGrow: 1,
        gap: 4,
        // Carte de jeu : pastille en haut, nom en bas, quelle que soit la hauteur de la ligne
        justifyContent: swatch ? 'space-between' : 'flex-start',
        paddingVertical: big ? 10 : 12,
        paddingHorizontal: big ? 10 : 14,
        borderWidth: selected ? border.base : border.thin,
        borderColor: colors.ink,
        borderRadius: radius.button,
        backgroundColor: selected
          ? colors.ratingSoft
          : hovered && !disabled
            ? colors.hover
            : colors.white,
        opacity: disabled ? 0.5 : 1,
        ...transition(['background-color']),
      }}
    >
      {swatch ? (
        <View
          style={{
            width: 10,
            height: 10,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: 3,
            backgroundColor: swatch,
          }}
        />
      ) : null}
      <Text
        style={
          big
            ? { ...font('display'), fontSize: 20, color: colors.ink }
            : {
                ...font('body', 800),
                fontSize: swatch ? 14 : 15,
                lineHeight: 18,
                color: colors.ink,
              }
        }
      >
        {label}
      </Text>
      {description ? (
        <Text
          style={{
            ...font('body', big ? 600 : 400),
            fontSize: big ? 11 : 12,
            lineHeight: big ? 14 : 17,
            color: colors.muted,
          }}
        >
          {description}
        </Text>
      ) : null}
    </View>
  )
  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      aria-disabled={disabled}
      aria-label={description ? `${label}, ${description}` : label}
      disabled={disabled}
      onPress={onPress}
      {...hoverProps}
      style={{ flex: 1, minWidth: 0 }}
    >
      {selected ? (
        <Raised offset={shadow.sm} r={radius.button} style={{ flexGrow: 1 }}>
          {card}
        </Raised>
      ) : (
        card
      )}
    </Pressable>
  )
}
