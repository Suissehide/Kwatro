import { Pressable, Text, View } from 'react-native'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, transition } from '../tokens'
import { scoreOptions } from './scoreOptions'

/** Score d'une manche, options tirées du format (BO1/3/5). Grille de 3 colonnes ; `wide` : une ligne (web). */
export function ScorePicker({
  bestOf,
  value,
  onChange,
  allowDraw = true,
  wide,
}: {
  bestOf: 1 | 3 | 5
  /** « 2-1 » ou « Nul ». */
  value: string | null
  onChange?: (v: string) => void
  allowDraw?: boolean
  wide?: boolean
}) {
  return (
    <View
      role="radiogroup"
      aria-label="Score"
      style={{ flexDirection: 'row', flexWrap: wide ? 'nowrap' : 'wrap', gap: 6 }}
    >
      {scoreOptions(bestOf, allowDraw).map((score) => (
        <Option
          key={score}
          score={score}
          active={score === value}
          wide={wide}
          onPress={() => onChange?.(score)}
        />
      ))}
    </View>
  )
}

function Option({
  score,
  active,
  wide,
  onPress,
}: {
  score: string
  active: boolean
  wide?: boolean
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role="radio"
      aria-checked={active}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexGrow: 1,
        flexBasis: wide ? 0 : '30%',
        minHeight: wide ? undefined : 48,
        padding: wide ? 12 : 0,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.field,
        backgroundColor: active ? colors.rating : hovered ? colors.hover : colors.white,
        ...transition(['background-color']),
      }}
    >
      <Text style={{ ...font('mono', 700), fontSize: 16, color: colors.ink }}>{score}</Text>
    </Pressable>
  )
}
