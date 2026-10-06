import { Pin } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { Tag } from '../atoms/Tag'
import { border, colors, font } from '../tokens'

/** Annonce épinglée en bandeau sous l'en-tête du chat. `compact` (téléphone) : deux lignes au plus. */
export function PinnedBanner({
  author,
  text,
  compact,
}: {
  author: string
  text: string
  compact?: boolean
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: compact ? 10 : 12,
        paddingVertical: compact ? 10 : 12,
        paddingHorizontal: compact ? 16 : 20,
        backgroundColor: colors.ratingSoft,
        borderColor: colors.ink,
        borderTopWidth: compact ? border.thin : 0,
        borderBottomWidth: compact ? 0 : border.thin,
      }}
    >
      <Tag label="Épinglé" variant="pinned" icon={Pin} />
      <Text
        numberOfLines={compact ? 2 : undefined}
        style={{
          flex: 1,
          ...font('body', 500),
          fontSize: compact ? 13 : 14,
          lineHeight: compact ? 18 : 20,
          color: colors.ink,
        }}
      >
        <Text style={font('body', 800)}>{author}</Text> · {text}
      </Text>
    </View>
  )
}
