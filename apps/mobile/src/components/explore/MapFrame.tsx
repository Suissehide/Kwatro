import { border, colors, radius } from '@lucko/design-system'
import type { VenueListItem } from '@lucko/shared'
import { View } from 'react-native'
import type { Place } from '@/lib/useLocation'
import { ExploreMap } from './ExploreMap'

/** Carte des lieux dans son cadre (accueil, liste des lieux). */
export function MapFrame({
  height,
  ...map
}: {
  height: number
  center: Place
  venues: VenueListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <View
      style={{
        height,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
        backgroundColor: colors.creamDark,
      }}
    >
      <ExploreMap {...map} />
    </View>
  )
}
