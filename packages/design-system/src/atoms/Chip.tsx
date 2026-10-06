import { Pressable, Text, View } from 'react-native'
import { border, colors, font, radius, sizes, textOn, transition } from '../tokens'
import { useHover } from './useHover'

/** Pastille de filtre ; active = fond rating (ou `color`). Sans `onPress` : simple étiquette, sans survol. */
export function Chip({
  label,
  active,
  color = colors.rating,
  tall,
  onPress,
}: {
  label: string
  active?: boolean
  color?: string
  /** Cible tactile de 44 px (choix sur téléphone). */
  tall?: boolean
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const style = {
    borderWidth: border.thin,
    borderColor: colors.ink,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: tall ? 14 : 11,
    minHeight: tall ? sizes.touch : undefined,
    justifyContent: 'center' as const,
    backgroundColor: active ? color : hovered ? colors.hover : colors.white,
    ...transition(['background-color']),
  }
  const text = (
    <Text
      style={{
        ...font('body', active ? 800 : 600),
        fontSize: 13,
        color: active ? textOn(color) : colors.ink,
      }}
    >
      {label}
    </Text>
  )
  if (!onPress) return <View style={[style, { alignSelf: 'flex-start' }]}>{text}</View>
  return (
    <Pressable
      role="button"
      aria-pressed={!!active}
      onPress={onPress}
      {...hoverProps}
      style={style}
    >
      {text}
    </Pressable>
  )
}
