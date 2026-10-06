import { Text, View } from 'react-native'
import { colors, font } from '../tokens'

/** Entrée d'historique : trait de couleur à gauche, libellé, auteur et date, note. */
export function TimelineItem({
  color,
  title,
  meta,
  note,
}: {
  color: string
  title: string
  meta: string
  note?: string
}) {
  return (
    <View style={{ borderLeftWidth: 3, borderColor: color, paddingLeft: 10, gap: 1 }}>
      <Text style={{ ...font('body', 800), fontSize: 13, color: colors.ink }}>{title}</Text>
      <Text style={{ ...font('body', 400), fontSize: 12, color: colors.muted }}>{meta}</Text>
      {note ? (
        <Text style={{ ...font('body', 400), fontSize: 13, lineHeight: 18, color: colors.ink }}>
          {note}
        </Text>
      ) : null}
    </View>
  )
}
