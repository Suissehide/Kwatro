import { Pressable, Text } from 'react-native'
import { colors, font, transition } from '../tokens'
import { useHover } from './useHover'

/** `muted` : lien discret souligné (ex. « Supprimer mon compte »). */
export function TextLink({
  label,
  muted,
  onPress,
}: {
  label: string
  muted?: boolean
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable role="link" onPress={onPress} {...hoverProps}>
      <Text
        style={{
          ...font('body', muted ? 600 : 800),
          fontSize: 13,
          color: hovered ? colors.room : muted ? colors.muted : colors.event,
          textDecorationLine: muted ? 'underline' : 'none',
          ...transition(['color']),
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
