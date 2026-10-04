import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius } from '../tokens'

/** Fermeture exceptionnelle (badge rouge) ou horaires modifiés (badge jaune). `compact` : sans note. */
export function ClosureRow({
  date,
  label,
  note,
  special,
  compact,
}: {
  date: string
  label: string
  note?: string | null
  special?: boolean
  compact?: boolean
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: compact ? 10 : 12 }}>
      <Text
        style={{
          ...font('mono', 700),
          minWidth: compact ? 78 : 84,
          fontSize: compact ? 10 : 11,
          textAlign: 'center',
          textTransform: 'uppercase',
          color: colors.ink,
          backgroundColor: special ? colors.kwoteSoft : colors.roomSoft,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: radius.tag,
          paddingVertical: 2,
          paddingHorizontal: 6,
        }}
      >
        {date}
      </Text>
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={{
            ...font('body', compact ? 600 : 800),
            fontSize: compact ? 13 : 14,
            lineHeight: 18,
            color: colors.ink,
          }}
        >
          {label}
        </Text>
        {note && !compact ? <Typography variant="small">{note}</Typography> : null}
      </View>
    </View>
  )
}
