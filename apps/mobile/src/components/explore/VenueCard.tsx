import { ContentCard, Note, Tag, Typography } from '@kwatro/design-system'
import {
  formatDistance,
  formatMinuteOfDay,
  VENUE_TYPE_LABELS,
  type VenueListItem,
} from '@kwatro/shared'
import { View } from 'react-native'

function openingLabel(venue: VenueListItem) {
  if (venue.openNow === null) return null
  if (!venue.openNow) return 'fermé'
  return venue.closesAtMinute === null
    ? 'ouvert'
    : `ouvert → ${formatMinuteOfDay(venue.closesAtMinute)}`
}

/** Lieu (B1 fiche en bas de carte, B2 segment Lieux). */
export function VenueCard({ venue, raised }: { venue: VenueListItem; raised?: boolean }) {
  const meta = [
    VENUE_TYPE_LABELS[venue.type],
    formatDistance(venue.distanceMeters),
    openingLabel(venue),
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <ContentCard kind="venue" raised={raised}>
      <Typography variant="title">{venue.name}</Typography>
      <Typography variant="small">{meta}</Typography>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {venue.isPartner ? <Tag label="Partenaire" variant="partner" /> : null}
        {venue.upcomingEventCount > 0 ? (
          <Tag
            label={`${venue.upcomingEventCount} événement${venue.upcomingEventCount > 1 ? 's' : ''}`}
            variant="event"
          />
        ) : null}
      </View>
      {venue.isPartner && venue.kwatroPerk ? <Note tone="venue">{venue.kwatroPerk}</Note> : null}
    </ContentCard>
  )
}
