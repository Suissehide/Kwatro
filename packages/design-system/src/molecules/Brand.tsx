import { Pressable, Text, View } from 'react-native'
import { Logo } from '../atoms/Logo'
import { useHover } from '../atoms/useHover'
import { colors, font } from '../tokens'

/**
 * Logo + « Kwatro » : barre du site (32 px) et en-tête des écrans téléphone (28 px).
 * Avec `onPress` : lien vers l'accueil ; au survol, le dé roule et compte jusqu'à quatre.
 */
export function Brand({
  size = 32,
  fontSize = 22,
  onPress,
}: {
  size?: number
  fontSize?: number
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Logo size={size} rolling={hovered} />
      <Text style={{ ...font('display'), fontSize, textTransform: 'uppercase', color: colors.ink }}>
        Kwatro
      </Text>
    </View>
  )
  return onPress ? (
    <Pressable role="link" aria-label="Kwatro, accueil" onPress={onPress} {...hoverProps}>
      {content}
    </Pressable>
  ) : (
    content
  )
}
