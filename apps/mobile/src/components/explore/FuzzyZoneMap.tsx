import { colors, FuzzyZoneLabel, fuzzyZone } from '@lucko/design-system'
import { View } from 'react-native'
import MapView, { Circle, Marker } from 'react-native-maps'
import type { Place } from '@/lib/useLocation'

/**
 * Carte d'une room à domicile : zone floue tant que l'adresse n'est pas révélée, épingle ensuite.
 * `center` arrive déjà décalé par le serveur (aléatoire et stable par room) : le client n'a jamais
 * les vraies coordonnées avant la révélation.
 */
export function FuzzyZoneMap({
  center,
  radiusM = 500,
  revealed,
  address,
}: {
  center: Pick<Place, 'lat' | 'lng'>
  radiusM?: number
  revealed: boolean
  address?: string
}) {
  const delta = (radiusM / 111_000) * 3
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: delta,
          longitudeDelta: delta,
        }}
      >
        {revealed ? (
          <Marker
            coordinate={{ latitude: center.lat, longitude: center.lng }}
            pinColor={colors.room}
          />
        ) : (
          <Circle
            center={{ latitude: center.lat, longitude: center.lng }}
            radius={radiusM}
            fillColor={fuzzyZone.fill}
            strokeColor={fuzzyZone.stroke}
            strokeWidth={fuzzyZone.strokeWidth}
            lineDashPattern={[...fuzzyZone.dash]}
          />
        )}
      </MapView>
      <View style={{ position: 'absolute', left: 12, bottom: 12 }}>
        <FuzzyZoneLabel radiusM={radiusM} revealed={revealed} address={address} />
      </View>
    </View>
  )
}
