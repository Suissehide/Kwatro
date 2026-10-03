import { Pressable, Text } from 'react-native'
import { colors, font, transition } from '../tokens'
import { useHover } from './useHover'

export function TextLink({ label, onPress }: { label: string; onPress?: () => void }) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable role="link" onPress={onPress} {...hoverProps}>
      <Text
        style={{
          ...font('body', 800),
          fontSize: 13,
          color: hovered ? colors.room : colors.event,
          ...transition(['color']),
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
