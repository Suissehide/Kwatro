import {
  Banner,
  Button,
  colors,
  EmptyState,
  Panel,
  ReviewCard,
  SkeletonCard,
  StatusPill,
  Tag,
} from '@lucko/design-system'
import { type AdminEvent, EVENT_TYPE_LABELS } from '@lucko/shared'
import { useLocalSearchParams } from 'expo-router'
import { CalendarX } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { ActionDialog } from '@/components/admin/ActionDialog'
import { AdminScreen } from '@/components/admin/AdminScreen'
import { EventForm } from '@/components/admin/EventForm'
import { eventWhen } from '@/lib/explore'
import {
  useAdminCatalogMutations,
  useAdminEventsQuery,
  useAdminVenuesQuery,
} from '@/queries/useAdminCatalog'
import { useGamesQuery } from '@/queries/useGames'

/** Événements d'un lieu (30 derniers jours et à venir) : créer, modifier, annuler une date ou une série. */
export default function AdminVenueEventsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const venue = useAdminVenuesQuery({ q: '' }).data?.find((v) => v.id === id)
  const events = useAdminEventsQuery(id)
  const games = useGamesQuery().data ?? []
  const { cancelEvent } = useAdminCatalogMutations()
  // null : liste ; 'new' : création ; un événement : modification
  const [editing, setEditing] = useState<AdminEvent | 'new' | null>(null)
  const [cancelling, setCancelling] = useState<{ event: AdminEvent; series: boolean } | null>(null)
  const gameName = (gameId: string) => games.find((g) => g.id === gameId)?.name

  return (
    <AdminScreen section="venues" title={venue?.name ?? 'Événements'} back>
      {editing ? (
        <Panel title={editing === 'new' ? 'Nouvel événement' : 'Modifier la date'}>
          <EventForm
            venueId={id}
            event={editing === 'new' ? undefined : editing}
            games={games}
            onDone={() => setEditing(null)}
          />
        </Panel>
      ) : (
        <View style={{ alignSelf: 'flex-start' }}>
          <Button kind="event" label="+ Nouvel événement" onPress={() => setEditing('new')} />
        </View>
      )}

      {events.isError ? (
        <Banner tone="err" message={events.error.message} />
      ) : !events.data ? (
        <SkeletonCard />
      ) : events.data.length === 0 ? (
        <EmptyState
          dashed
          icon={<CalendarX size={28} color={colors.ink} strokeWidth={2.5} />}
          title="Agenda vide"
          text="Aucun événement à venir pour ce lieu."
        />
      ) : (
        <View style={{ gap: 12 }}>
          {events.data.map((event) => {
            const cancelled = event.status === 'CANCELLED' || event.status === 'HIDDEN'
            const past = new Date(event.startsAt) < new Date()
            return (
              <ReviewCard
                key={event.id}
                title={event.title}
                tags={
                  <>
                    <Tag label={EVENT_TYPE_LABELS[event.type]} variant="event" />
                    {event.seriesId ? <StatusPill tone="info" label="Série" /> : null}
                    {cancelled ? <StatusPill tone="err" label="Annulé" /> : null}
                    {past && !cancelled ? <StatusPill tone="neutral" label="Passé" /> : null}
                  </>
                }
                meta={eventWhen(event.startsAt, event.endsAt)}
                body={[
                  `${event.registered} inscrit${event.registered > 1 ? 's' : ''}${event.capacity ? ` / ${event.capacity}` : ''}`,
                  event.gameIds.map(gameName).filter(Boolean).join(', ') || 'Tous jeux',
                ].join(' · ')}
                actions={
                  cancelled || past ? undefined : (
                    <>
                      <Button
                        small
                        kind="ghost"
                        label="Modifier"
                        onPress={() => setEditing(event)}
                      />
                      <Button
                        small
                        kind="room"
                        label="Annuler"
                        onPress={() => setCancelling({ event, series: false })}
                      />
                      {event.seriesId ? (
                        <Button
                          small
                          kind="room"
                          label="Annuler la série"
                          onPress={() => setCancelling({ event, series: true })}
                        />
                      ) : null}
                    </>
                  )
                }
              />
            )
          })}
        </View>
      )}

      <ActionDialog
        key={cancelling ? `${cancelling.event.id}-${cancelling.series}` : 'closed'}
        visible={cancelling !== null}
        title={cancelling?.series ? 'Annuler la série ?' : 'Annuler cet événement ?'}
        message={
          cancelling?.series
            ? 'Cette date et toutes les suivantes de la série sont annulées. Les inscrits sont prévenus.'
            : 'Les inscrits sont prévenus par notification.'
        }
        confirmLabel="Annuler l’événement"
        onCancel={() => setCancelling(null)}
        onConfirm={async ({ text }) => {
          if (!cancelling) return
          await cancelEvent.mutateAsync({
            id: cancelling.event.id,
            reason: text,
            series: cancelling.series,
          })
          setCancelling(null)
        }}
      />
    </AdminScreen>
  )
}
