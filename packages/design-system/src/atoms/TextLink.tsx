import { Pressable, Text } from 'react-native'
import { colors, font } from '../tokens'
import { useHover } from './useHover'

/** Lien texte (« Tout le programme », « Carte ») : bleu événement, rouge au survol comme les liens du site. */
export function TextLink({ label, onPress }: { label: string; onPress?: () => void }) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable role="link" onPress={onPress} {...hoverProps}>
      <Text
        style={{
          ...font('body', 800),
          fontSize: 13,
          color: hovered ? colors.room : colors.event,
        }}
      >
        {label}
      </Text>
    </Pressable>
  )
}
