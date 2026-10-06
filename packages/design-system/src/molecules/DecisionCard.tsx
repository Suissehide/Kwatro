import { Pressable, Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, shadow, textOn, transition } from '../tokens'

/** Choix d'une décision (classer, avertir, suspendre) ; choisie : fond `color` et ombre. */
export function DecisionCard({
  title,
  description,
  color = colors.white,
  selected,
  onPress,
}: {
  title: string
  description: string
  color?: string
  selected?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const fg = selected ? textOn(color) : colors.ink
  const card = (
    <View
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: selected ? border.base : border.thin,
        borderColor: colors.ink,
        borderRadius: 10,
        backgroundColor: selected ? color : hovered ? colors.hover : colors.white,
        ...transition(['background-color']),
      }}
    >
      <Text style={{ ...font('body', 800), fontSize: 15, color: fg }}>{title}</Text>
      <Text style={{ ...font('body', 400), fontSize: 13, color: fg }}>{description}</Text>
    </View>
  )
  return (
    <Pressable
      role="radio"
      aria-checked={!!selected}
      onPress={onPress}
      {...hoverProps}
      style={{ flex: 1, minWidth: 150 }}
    >
      {selected ? (
        <Raised offset={shadow.sm} r={10}>
          {card}
        </Raised>
      ) : (
        card
      )}
    </Pressable>
  )
}
