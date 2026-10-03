import 'leaflet/dist/leaflet.css'
import { border, colors } from '@kwatro/design-system'
import type { VenueListItem } from '@kwatro/shared'
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet'
import type { Place } from '@/lib/useLocation'

/**
 * Carte des lieux sur le web (Expo web) : Leaflet + fond OpenStreetMap, attribution obligatoire.
 * Même rendu que la version native : partenaires en vert, lieu sélectionné en rouge.
 */
// ponytail: tuiles tile.openstreetmap.org (usage léger toléré) ; passer à un fournisseur de tuiles
// (ou un serveur maison) avant la mise en production, avec le choix du fond de carte natif.
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
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">contributeurs OpenStreetMap</a>'
      />
      <CircleMarker
        center={[center.lat, center.lng]}
        radius={7}
        pathOptions={{
          color: colors.ink,
          weight: border.thin,
          fillColor: colors.event,
          fillOpacity: 1,
        }}
      />
      {venues.map((venue) => {
        const selected = venue.id === selectedId
        return (
          <CircleMarker
            key={venue.id}
            center={[venue.latitude, venue.longitude]}
            radius={selected ? 14 : 11}
            pathOptions={{
              color: colors.ink,
              weight: border.base,
              fillColor: selected ? colors.room : venue.isPartner ? colors.venue : colors.white,
              fillOpacity: 1,
            }}
            eventHandlers={{ click: () => onSelect(venue.id) }}
          >
            <Tooltip direction="top" offset={[0, -10]}>
              {venue.name}
            </Tooltip>
          </CircleMarker>
        )
      })}
    </MapContainer>
  )
}
