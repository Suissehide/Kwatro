import { Text, View } from 'react-native'
import { Logo } from '../atoms/Logo'
import { colors, font } from '../tokens'

/** Logo + « Kwatro » : barre du site (32 px) et en-tête des écrans téléphone (28 px). */
export function Brand({ size = 32, fontSize = 22 }: { size?: number; fontSize?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Logo size={size} />
      <Text style={{ ...font('display'), fontSize, textTransform: 'uppercase', color: colors.ink }}>
        Kwatro
      </Text>
    </View>
  )
}
