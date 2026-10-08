import 'leaflet/dist/leaflet.css'
import { border, colors, FuzzyZoneLabel, fuzzyZone } from '@lucko/design-system'
import { Circle, CircleMarker, MapContainer, TileLayer } from 'react-leaflet'
import { View } from 'react-native'
import type { Place } from '@/lib/useLocation'

/** Version web (Leaflet) de la carte d'une room à domicile ; voir FuzzyZoneMap.tsx. */
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
  return (
    <View style={{ flex: 1 }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>'
        />
        {revealed ? (
          <CircleMarker
            center={[center.lat, center.lng]}
            radius={fuzzyZone.pin.size / 2}
            pathOptions={{
              color: colors.ink,
              weight: border.base,
              fillColor: fuzzyZone.pin.color,
              fillOpacity: 1,
            }}
          />
        ) : (
          <Circle
            center={[center.lat, center.lng]}
            radius={radiusM}
            pathOptions={{
              color: fuzzyZone.stroke,
              weight: fuzzyZone.strokeWidth,
              dashArray: fuzzyZone.dash.join(' '),
              fillColor: fuzzyZone.stroke,
              fillOpacity: 0.18,
            }}
          />
        )}
      </MapContainer>
      <View style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 1000 }}>
        <FuzzyZoneLabel radiusM={radiusM} revealed={revealed} address={address} />
      </View>
    </View>
  )
}
