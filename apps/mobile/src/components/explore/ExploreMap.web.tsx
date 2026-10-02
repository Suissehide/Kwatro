import { EmptyState, Typography } from '@kwatro/design-system'
import type { VenueListItem } from '@kwatro/shared'
import type { Place } from '@/lib/useLocation'

// ponytail: react-native-maps n'existe pas sur le web ; la carte web (back-office, Expo web) viendra
// avec le choix du fond de carte. En attendant, la vue liste reste complète.
export function ExploreMap(_props: {
  center: Place
  venues: VenueListItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <EmptyState
      icon={<Typography variant="h2">◎</Typography>}
      title="Carte disponible dans l'app"
      text="Sur le web, utilise la vue liste pour voir les lieux et les soirées."
    />
  )
}
