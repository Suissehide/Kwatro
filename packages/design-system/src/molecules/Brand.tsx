import { Pressable, Text, View } from 'react-native'
import { Logo } from '../atoms/Logo'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { colors, font } from '../tokens'

export function Brand({
  size = 32,
  fontSize = 22,
  onDark,
  onPress,
}: {
  size?: number
  fontSize?: number
  /** Sur fond ink : texte blanc et ombre kwote (l'ombre ink y serait invisible). */
  onDark?: boolean
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const logo = <Logo size={size} rolling={hovered} />
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Math.max(10, size * 0.32) }}>
      {onDark ? (
        <Raised offset={Math.round(size / 11)} r={size * 0.2} color={colors.kwote}>
          {logo}
        </Raised>
      ) : (
        logo
      )}
      <Text
        style={{
          ...font('display'),
          fontSize,
          textTransform: 'uppercase',
          color: onDark ? colors.white : colors.ink,
        }}
      >
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
