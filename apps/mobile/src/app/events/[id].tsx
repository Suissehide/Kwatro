import {
  Banner,
  Button,
  ConfirmDialog,
  ListCard,
  ListRow,
  Note,
  PageTitle,
  SkeletonCard,
  StatusPill,
  Tag,
  Typography,
} from '@kwatro/design-system'
import { EVENT_TYPE_LABELS, formatPrice } from '@kwatro/shared'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { Linking, View } from 'react-native'
import { DetailScreen } from '@/components/DetailScreen'
import { eventPlaces, eventWhen, gameLabel, isFull } from '@/lib/explore'
import { openVenue } from '@/lib/navigation'
import { useEventMutations, useEventQuery } from '@/queries/useEvent'
import { useMeQuery } from '@/queries/useMe'

/** Fiche événement (B4, KWT-11) et inscription dans l'app, avec liste d'attente quand c'est complet. */
export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const me = useMeQuery()
  const { data: event, isError: failed, refetch } = useEventQuery(id)
  const { register, unregister } = useEventMutations(id)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const pending = register.isPending || unregister.isPending
  const error = register.error ?? unregister.error
  const clearError = () => {
    register.reset()
    unregister.reset()
  }

  if (!event) {
    return (
      <DetailScreen title="Événement">
        {failed ? (
          <Banner
            tone="err"
            message="Impossible de charger cet événement."
            action="Réessayer"
            onAction={() => void refetch()}
          />
        ) : (
          <SkeletonCard />
        )}
      </DetailScreen>
    )
  }

  const games = event.games.length ? event.games.map(gameLabel).join(', ') : 'Tous jeux'
  const details = [
    { title: 'Quand', value: eventWhen(event.startsAt, event.endsAt) },
    { title: 'Prix', value: formatPrice(event.priceCents) ?? 'Non renseigné' },
    { title: 'Places', value: eventPlaces(event) },
    { title: 'Âge minimum', value: event.minAge ? `${event.minAge} ans` : null },
  ].filter((row): row is { title: string; value: string } => !!row.value)

  let footer = null
  if (event.cancelledAt) {
    footer = <Button disabled label="Événement annulé" />
  } else if (event.registrationMode === 'EXTERNAL' && event.externalUrl) {
    const url = event.externalUrl
    footer = (
      <Button kind="event" label="S'inscrire sur le site" onPress={() => Linking.openURL(url)} />
    )
  } else if (event.registrationMode === 'IN_APP') {
    footer = !me ? (
      <Button
        kind="event"
        label="Se connecter pour s'inscrire"
        onPress={() => router.push('/auth')}
      />
    ) : event.myRegistration ? (
      <Button
        kind="ghost"
        label={
          event.myRegistration === 'WAITLISTED' ? "Quitter la liste d'attente" : 'Se désinscrire'
        }
        disabled={pending}
        onPress={() => setConfirmCancel(true)}
      />
    ) : (
      <Button
        kind="event"
        label={isFull(event) ? "Rejoindre la liste d'attente" : "S'inscrire"}
        disabled={pending}
        onPress={() => register.mutate()}
      />
    )
  }

  return (
    <DetailScreen title={event.title} footer={footer}>
      <PageTitle eyebrow={`${EVENT_TYPE_LABELS[event.type]} · ${games}`} title={event.title} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {event.cancelledAt ? <StatusPill tone="err" label="Annulé" /> : null}
        {event.myRegistration === 'REGISTERED' ? <StatusPill tone="ok" label="Inscrit" /> : null}
        {event.myRegistration === 'WAITLISTED' ? (
          <StatusPill tone="warn" label="En liste d'attente" />
        ) : null}
        {event.venue.isPartner ? <Tag variant="partner" label="Lieu partenaire" /> : null}
      </View>
      {error ? <Banner tone="err" message={error.message} onClose={clearError} /> : null}
      {event.registrationMode === 'NONE' && !event.cancelledAt ? (
        <Note tone="plain">Entrée libre : pas besoin de s'inscrire, viens directement.</Note>
      ) : null}

      <ListCard>
        {details.map((row) => (
          <ListRow key={row.title} inset={16} title={row.title} subtitle={row.value} />
        ))}
        <ListRow
          inset={16}
          title={event.venue.name}
          subtitle={event.venue.address}
          right={<Typography variant="small">Voir le lieu →</Typography>}
          last
          onPress={() => openVenue(event.venue.slug)}
        />
      </ListCard>

      {event.description ? <Typography>{event.description}</Typography> : null}

      <ConfirmDialog
        visible={confirmCancel}
        title={
          event.myRegistration === 'WAITLISTED'
            ? "Quitter la liste d'attente ?"
            : 'Se désinscrire ?'
        }
        message={
          event.myRegistration === 'WAITLISTED'
            ? "Tu perdras ta position dans la liste d'attente."
            : "Ta place sera proposée au premier joueur de la liste d'attente."
        }
        confirmLabel="Confirmer"
        destructive
        onConfirm={() => {
          setConfirmCancel(false)
          unregister.mutate()
        }}
        onCancel={() => setConfirmCancel(false)}
      />
    </DetailScreen>
  )
}
