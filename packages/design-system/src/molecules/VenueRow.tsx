import { Text, View } from 'react-native'
import { border, colors, font } from '../tokens'
import { ListRow } from './ListRow'

/** Lieu dans une liste : pastille verte si partenaire, avantage Kwatro en option, distance à droite. */
export function VenueRow({
  name,
  subtitle,
  distance,
  partner,
  perk,
  inset,
  last,
  onPress,
}: {
  name: string
  /** Type et horaires, « Bar à jeux · jusqu'à 1 h ». */
  subtitle: string
  distance: string
  partner?: boolean
  perk?: string | null
  inset?: number
  last?: boolean
  onPress?: () => void
}) {
  return (
    <ListRow
      inset={inset}
      last={last}
      onPress={onPress}
      left={
        <View
          aria-label={partner ? 'Lieu partenaire' : undefined}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            borderWidth: border.thin,
            borderColor: colors.ink,
            backgroundColor: partner ? colors.venue : colors.white,
          }}
        />
      }
      title={name}
      subtitle={subtitle}
      note={perk ?? undefined}
      right={
        <Text style={{ ...font('mono', 700), fontSize: 13, color: colors.ink }}>{distance}</Text>
      }
    />
  )
}
