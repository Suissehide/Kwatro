import { Text } from 'react-native'
import { border, colors, font } from '../tokens'

/** Texte cité (détails d'un signalement), entre guillemets. */
export function Quote({ text }: { text: string }) {
  return (
    <Text
      style={{
        ...font('body', 500),
        fontSize: 15,
        lineHeight: 22,
        color: colors.ink,
        backgroundColor: colors.hover,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
      }}
    >
      {`« ${text} »`}
    </Text>
  )
}
