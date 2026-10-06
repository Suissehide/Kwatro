import { View } from 'react-native'
import { Typography } from '../atoms/Typography'
import { border, colors } from '../tokens'

/** Séparateur du fil de messages : « Nouveaux messages », un jour… */
export function ChatDivider({ label, tone = colors.room }: { label: string; tone?: string }) {
  return (
    <View role="separator" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ flex: 1, borderTopWidth: border.thin, borderColor: tone }} />
      <Typography variant="label" style={{ fontSize: 10, color: tone }}>
        {label}
      </Typography>
      <View style={{ flex: 1, borderTopWidth: border.thin, borderColor: tone }} />
    </View>
  )
}
