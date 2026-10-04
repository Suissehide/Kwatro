import {
  Banner,
  Button,
  EmptyState,
  EventCard,
  ListCard,
  ListRow,
  Note,
  PageTitle,
  Section,
  SkeletonCard,
  StatusPill,
  Tag,
  Typography,
} from '@kwatro/design-system'
import { formatMinuteOfDay, formatPrice, VENUE_TYPE_LABELS, type VenueDetail } from '@kwatro/shared'
import { useLocalSearchParams } from 'expo-router'
import { useCallback } from 'react'
import { Linking, View } from 'react-native'
import { DetailScreen } from '@/components/DetailScreen'
import { api } from '@/lib/api'
import { eventCardProps, gameLabel, openingLines } from '@/lib/explore'
import { openEvent } from '@/lib/navigation'
import { useDetail } from '@/lib/useDetail'

/** Fiche lieu (B3, KWT-11) : infos pratiques, horaires, jeux sur place et prochains événements. */
export default function VenueScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const load = useCallback(() => api.GET('/venues/{slug}', { params: { path: { slug } } }), [slug])
  const { data: venue, failed, retry } = useDetail<VenueDetail>(load)

  if (!venue) {
    return (
      <DetailScreen title="Lieu">
        {failed ? (
          <Banner
            tone="err"
            message="Impossible de charger ce lieu."
            action="Réessayer"
            onAction={retry}
          />
        ) : (
          <SkeletonCard />
        )}
      </DetailScreen>
    )
  }

  const itinerary = () =>
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`,
    )
  const practical = [
    { title: 'Adresse', value: `${venue.address}, ${venue.city}` },
    { title: 'Droit de jeu', value: formatPrice(venue.playFeeCents) ?? 'Non renseigné' },
    { title: 'Consommation minimum', value: formatPrice(venue.minSpendCents) ?? 'Aucune' },
    {
      title: 'Mineurs non accompagnés',
      value: venue.acceptsUnaccompaniedMinors ? 'Acceptés' : 'Non acceptés',
    },
  ]

  return (
    <DetailScreen
      title={venue.name}
      footer={<Button kind="venue" label="Itinéraire" onPress={itinerary} />}
    >
      <PageTitle eyebrow={`${VENUE_TYPE_LABELS[venue.type]} · ${venue.city}`} title={venue.name} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {venue.isPartner ? <Tag variant="partner" label="Partenaire" /> : null}
        {venue.openNow === null ? null : venue.openNow ? (
          <StatusPill
            tone="ok"
            label={
              venue.closesAtMinute === null
                ? 'Ouvert'
                : `Ouvert jusqu'à ${formatMinuteOfDay(venue.closesAtMinute)}`
            }
          />
        ) : (
          <StatusPill tone="neutral" label="Fermé" />
        )}
      </View>
      {venue.isPartner && venue.kwatroPerk ? (
        <Note tone="venue">Avantage Kwatro : {venue.kwatroPerk}</Note>
      ) : null}
      {venue.description ? <Typography>{venue.description}</Typography> : null}

      <Section title="Prochains événements">
        {venue.events.length === 0 ? (
          <EmptyState
            icon={<Typography variant="h2">◎</Typography>}
            title="Rien de prévu"
            text="Aucun événement annoncé dans les 30 prochains jours."
          />
        ) : (
          venue.events.map((event) => (
            <EventCard
              key={event.id}
              {...eventCardProps(event)}
              onPress={() => openEvent(event.id)}
            />
          ))
        )}
      </Section>

      <Section title="Infos pratiques">
        <ListCard>
          {practical.map((row, i) => (
            <ListRow
              key={row.title}
              title={row.title}
              subtitle={row.value}
              last={i === practical.length - 1}
            />
          ))}
        </ListCard>
      </Section>

      {venue.openingHours.length ? (
        <Section title="Horaires">
          <ListCard>
            {openingLines(venue.openingHours).map((line, i) => (
              <ListRow
                key={line.label}
                title={line.label}
                right={<Typography variant="small">{line.value}</Typography>}
                last={i === 6}
              />
            ))}
          </ListCard>
        </Section>
      ) : null}

      {venue.games.length ? (
        <Section title="Jeux sur place">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {venue.games.map((game) => (
              <Tag key={game.slug} label={gameLabel(game)} />
            ))}
          </View>
        </Section>
      ) : null}
    </DetailScreen>
  )
}
