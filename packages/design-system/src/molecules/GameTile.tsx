import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'

/** Jeu à cocher dans une grille (onboarding) : pastille de sa couleur et nom. Coché : fond ratingSoft relevé. */
export function GameTile({
  label,
  color,
  selected,
  large,
  onPress,
}: {
  label: string
  color: string
  selected: boolean
  /** Desktop : 84 px de haut au lieu de 76. */
  large?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const tile = (
    <View
      style={{
        minHeight: large ? 84 : 76,
        padding: large ? 14 : 12,
        gap: 6,
        justifyContent: 'space-between',
        borderWidth: selected ? border.base : border.thin,
        borderColor: colors.ink,
        borderRadius: radius.card,
        backgroundColor: selected ? colors.ratingSoft : hovered ? colors.hover : colors.white,
        ...transition(['background-color']),
      }}
    >
      <View
        style={{
          width: 12,
          height: 12,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: 3,
          backgroundColor: color,
        }}
      />
      <Text
        style={{
          ...font('body', 800),
          fontSize: large ? 16 : 15,
          lineHeight: large ? 19 : 18,
          color: colors.ink,
        }}
      >
        {label}
      </Text>
    </View>
  )
  return (
    <Pressable
      role="checkbox"
      aria-checked={selected}
      aria-label={label}
      onPress={onPress}
      {...hoverProps}
    >
      {selected ? (
        <Raised offset={shadow.md} r={radius.card}>
          {tile}
        </Raised>
      ) : (
        tile
      )}
    </Pressable>
  )
}
