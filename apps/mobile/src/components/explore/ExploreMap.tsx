import { colors } from '@lucko/design-system'
import type { VenueListItem } from '@lucko/shared'
import MapView, { Marker } from 'react-native-maps'
import type { Place } from '@/lib/useLocation'

/** Carte des lieux (B1) : épingle verte pour les partenaires, blanche sinon. */
export function ExploreMap({
  center,
  venues,
  selectedId,
  onSelect,
}: {
  center: Place
  venues: VenueListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: center.lat,
        longitude: center.lng,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      }}
      showsUserLocation
    >
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
          title={venue.name}
          pinColor={
            venue.id === selectedId ? colors.room : venue.isPartner ? colors.venue : colors.ink
          }
          onPress={() => onSelect(venue.id)}
        />
      ))}
    </MapView>
  )
}
