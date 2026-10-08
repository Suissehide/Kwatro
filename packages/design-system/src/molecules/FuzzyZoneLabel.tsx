import { MapPin } from 'lucide-react-native'
import { Text, View } from 'react-native'
import { Raised } from '../atoms/Raised'
import { border, colors, font, radius, shadow } from '../tokens'

/** Style de la zone floue d'une room à domicile, pour les cartes de l'app (native et Leaflet). */
export const fuzzyZone = {
  fill: 'rgba(39,71,214,0.18)',
  stroke: colors.event,
  strokeWidth: 3,
  dash: [8, 6],
  pin: { color: colors.room, size: 22 },
} as const

/**
 * Étiquette posée sur la carte d'une room à domicile : zone approximative tant que l'adresse n'est pas
 * révélée, adresse ensuite. La carte elle-même vit dans l'app (FuzzyZoneMap).
 */
export function FuzzyZoneLabel({
  radiusM = 500,
  revealed,
  address,
}: {
  radiusM?: number
  revealed: boolean
  address?: string
}) {
  const text = revealed && address ? address : `Zone approximative · environ ${radiusM} m`
  return (
    <Raised offset={shadow.sm} r={radius.pill} style={{ alignSelf: 'flex-start' }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingVertical: 5,
          paddingHorizontal: 10,
          backgroundColor: colors.white,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: radius.pill,
        }}
      >
        <MapPin size={14} color={revealed ? colors.room : colors.event} strokeWidth={2.5} />
        <Text style={{ ...font('body', 700), fontSize: 12, color: colors.ink }}>{text}</Text>
      </View>
    </Raised>
  )
}
