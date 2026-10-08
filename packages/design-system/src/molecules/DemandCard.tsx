import { Text, View } from 'react-native'
import { colors, font, radius } from '../tokens'

/**
 * « Demande près d'ici » : joueurs qui attendent un jeu, sur fond ink. `inline` (téléphone) :
 * nombre et texte côte à côte, sans titre.
 */
export function DemandCard({
  count,
  text,
  inline,
}: {
  /** « 23 », ou « — » sous le seuil d'anonymat. */
  count: string
  text: string
  inline?: boolean
}) {
  return (
    <View
      style={{
        flexDirection: inline ? 'row' : 'column',
        alignItems: inline ? 'center' : 'flex-start',
        gap: inline ? 12 : 6,
        paddingVertical: inline ? 12 : 14,
        paddingHorizontal: inline ? 14 : 16,
        backgroundColor: colors.ink,
        borderRadius: inline ? radius.button : radius.card,
      }}
    >
      {inline ? null : (
        <Text
          style={{
            ...font('mono', 700),
            fontSize: 10,
            textTransform: 'uppercase',
            color: colors.rating,
          }}
        >
          Demande près d'ici
        </Text>
      )}
      <Text
        style={{
          ...font('display'),
          fontSize: inline ? 26 : 30,
          lineHeight: inline ? 28 : 30,
          color: inline ? colors.rating : colors.white,
        }}
      >
        {count}
      </Text>
      <Text
        style={{
          ...font('body', 500),
          fontSize: inline ? 12 : 13,
          lineHeight: inline ? 17 : 18,
          color: colors.line,
          flexShrink: 1,
        }}
      >
        {text}
      </Text>
    </View>
  )
}
