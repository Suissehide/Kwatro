import { ContentCard, colors, DateBlock, font, Tag, Typography } from '@kwatro/design-system'
import {
  EVENT_TYPE_LABELS,
  type EventListItem,
  formatDayMonth,
  formatDistance,
  formatPrice,
  formatTime,
} from '@kwatro/shared'
import { Text, View } from 'react-native'

function priceLabel(event: EventListItem) {
  if (event.registrationMode === 'EXTERNAL') return 'Inscription externe'
  return (
    formatPrice(event.priceCents) ?? (event.registrationMode === 'NONE' ? 'Entrée libre' : null)
  )
}

/** Événement de l'agenda (B2, segment Événements). */
export function EventCard({ event }: { event: EventListItem }) {
  const { day, month } = formatDayMonth(event.startsAt)
  const meta = [
    event.venue.name,
    formatTime(event.startsAt),
    formatDistance(event.venue.distanceMeters),
  ].join(' · ')
  const price = priceLabel(event)
  return (
    <ContentCard kind="event">
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
        <DateBlock day={day} month={month} />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            <Tag label={EVENT_TYPE_LABELS[event.type]} />
            {event.venue.isPartner ? <Tag label="Partenaire" variant="partner" /> : null}
          </View>
          <Typography variant="title">{event.title}</Typography>
          <Typography variant="small">{meta}</Typography>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
            {price ? <Typography variant="small">{price}</Typography> : <View />}
            {event.capacity !== null ? (
              <Text
                aria-label={`${event.registeredCount} inscrits sur ${event.capacity} places`}
                style={{ ...font('mono', 700), fontSize: 13, color: colors.ink }}
              >
                {event.registeredCount}/{event.capacity}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </ContentCard>
  )
}
