import { Text, View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors, font, radius } from '../tokens'

/** Info pratique : libellé, valeur en display et note. `compact` : trois côte à côte sur téléphone. */
export function FactCard({
  label,
  value,
  note,
  compact,
}: {
  label: string
  value: string
  note?: string | null
  compact?: boolean
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: compact ? 12 : radius.card,
        paddingVertical: compact ? 10 : 14,
        paddingHorizontal: compact ? 10 : 16,
        gap: compact ? 4 : 6,
      }}
    >
      <Typography variant="label" style={compact ? { fontSize: 10, letterSpacing: 0 } : null}>
        {label}
      </Typography>
      <Text
        style={{
          ...font('display'),
          fontSize: compact ? 18 : 28,
          lineHeight: compact ? 20 : 29,
          color: colors.ink,
        }}
      >
        {value}
      </Text>
      {note && !compact ? <Typography variant="small">{note}</Typography> : null}
    </View>
  )
}
