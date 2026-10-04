import { Text } from 'react-native'
import { border, colors, font, radius, semantic } from '../tokens'

/** Pastille d'information, non cliquable (jeux sur place). `muted` : « + 290 autres ». */
export function InfoChip({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <Text
      style={{
        ...font('body', 600),
        fontSize: 13,
        color: colors.ink,
        backgroundColor: muted ? semantic.neutralSoft : colors.white,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.pill,
        paddingVertical: 5,
        paddingHorizontal: 11,
        overflow: 'hidden',
      }}
    >
      {label}
    </Text>
  )
}
