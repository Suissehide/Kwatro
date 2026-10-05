import {
  AvatarStack,
  Banner,
  Button,
  ConfirmDialog,
  ListCard,
  ListRow,
  PageTitle,
  SkeletonCard,
  StatusPill,
  Tag,
  Typography,
} from '@kwatro/design-system'
import { formatKwote, type RoomCandidate, type RoomDetail } from '@kwatro/shared'
import { router, useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { View } from 'react-native'
import { DetailScreen } from '@/components/DetailScreen'
import { eventWhen, gameLabel } from '@/lib/explore'
import { openVenue } from '@/lib/navigation'
import { useMeQuery } from '@/queries/useMe'
import { useParticipationMutations, useRoomQuery } from '@/queries/useRoom'

const MY_STATUS: Partial<
  Record<NonNullable<RoomDetail['myStatus']>, { label: string; tone: 'ok' | 'warn' | 'err' }>
> = {
  ACCEPTED: { label: 'Tu joues', tone: 'ok' },
  PENDING: { label: 'Demande envoyée', tone: 'warn' },
  WAITLISTED: { label: "En liste d'attente", tone: 'warn' },
  DECLINED: { label: 'Demande refusée', tone: 'err' },
}

/**
 * Fiche room (B6, KWT-56) : demander à rejoindre, liste d'attente quand c'est complet, quitter.
 * L'hôte y gère les demandes (C5) avec le profil de jeu de chaque candidat (C6).
 */
export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const me = useMeQuery()
  const { data: room, isError: failed, refetch } = useRoomQuery(id)
  const { join, leave, decide } = useParticipationMutations(id)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const pending = join.isPending || leave.isPending || decide.isPending
  const error = join.error ?? leave.error ?? decide.error
  const clearError = () => {
    join.reset()
    leave.reset()
    decide.reset()
  }

  if (!room) {
    return (
      <DetailScreen title="Room">
        {failed ? (
          <Banner
            tone="err"
            message="Impossible de charger cette room."
            action="Réessayer"
            onAction={() => void refetch()}
          />
        ) : (
          <SkeletonCard />
        )}
      </DetailScreen>
    )
  }

  const title = `${room.format ?? room.game.name} à ${room.capacity}`
  const full = room.players.length >= room.capacity
  const closed = room.status !== 'OPEN' && room.status !== 'FULL'
  const status = MY_STATUS[room.myStatus ?? 'LEFT']
  const details = [
    { title: 'Quand', value: eventWhen(room.startsAt, null) },
    {
      title: 'Places',
      value: `${room.players.length}/${room.capacity}${room.waitlistCount ? ` · ${room.waitlistCount} en liste d'attente` : ''}`,
    },
    {
      title: 'Inscription',
      value: room.autoAccept ? 'Automatique' : "Sur acceptation de l'hôte",
    },
    { title: 'Âge', value: room.minorsAllowed ? 'Ouverte aux mineurs' : '18 ans et plus' },
  ]

  let footer = null
  if (room.isHost) {
    footer = null
  } else if (closed) {
    footer = <Button disabled label="Room fermée" />
  } else if (!me) {
    footer = (
      <Button kind="room" label="Se connecter pour jouer" onPress={() => router.push('/auth')} />
    )
  } else if (
    room.myStatus === 'ACCEPTED' ||
    room.myStatus === 'PENDING' ||
    room.myStatus === 'WAITLISTED'
  ) {
    footer = (
      <Button
        kind="ghost"
        label={room.myStatus === 'ACCEPTED' ? 'Quitter la room' : 'Retirer ma demande'}
        disabled={pending}
        onPress={() => setConfirmLeave(true)}
      />
    )
  } else if (room.myStatus !== 'DECLINED') {
    footer = (
      <Button
        kind="room"
        label={
          full
            ? "Rejoindre la liste d'attente"
            : room.autoAccept
              ? 'Rejoindre la room'
              : 'Demander à rejoindre'
        }
        disabled={pending}
        onPress={() => join.mutate()}
      />
    )
  }

  return (
    <DetailScreen title={title} footer={footer}>
      <PageTitle
        eyebrow={`${room.mode === 'RANKED' ? 'Room classée' : 'Room libre'} · ${gameLabel(room.game)}`}
        title={title}
      />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {room.isHost ? <StatusPill tone="ok" label="Tu organises" /> : null}
        {!room.isHost && status ? <StatusPill {...status} /> : null}
        {room.status === 'FULL' ? <StatusPill label="Complète" /> : null}
        {room.status === 'CANCELLED' ? <StatusPill tone="err" label="Annulée" /> : null}
        {room.venue?.isPartner ? <Tag variant="partner" label="Lieu partenaire" /> : null}
      </View>
      {error ? <Banner tone="err" message={error.message} onClose={clearError} /> : null}

      <ListCard>
        {details.map((row) => (
          <ListRow key={row.title} inset={16} title={row.title} subtitle={row.value} />
        ))}
        {room.venue ? (
          <ListRow
            inset={16}
            title={room.venue.name}
            subtitle={room.venue.address}
            right={<Typography variant="small">Voir le lieu →</Typography>}
            last
            onPress={() => room.venue && openVenue(room.venue.slug)}
          />
        ) : null}
      </ListCard>

      {room.description ? <Typography>{room.description}</Typography> : null}

      <Typography variant="h2">Joueurs</Typography>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <AvatarStack names={room.players.map((p) => p.initial)} />
        <Typography variant="small">
          {room.players.some((p) => p.pseudo)
            ? room.players.map((p) => p.pseudo ?? p.initial).join(', ')
            : `Organisée par ${room.host.pseudo ?? 'un joueur'}`}
        </Typography>
      </View>

      {room.isHost ? (
        <Candidates
          candidates={room.candidates}
          full={full}
          disabled={pending}
          onDecide={(userId, accept) => decide.mutate({ userId, accept })}
        />
      ) : null}

      <ConfirmDialog
        visible={confirmLeave}
        title={room.myStatus === 'ACCEPTED' ? 'Quitter la room ?' : 'Retirer ta demande ?'}
        message={
          room.myStatus === 'ACCEPTED'
            ? "Ta place sera proposée au premier joueur de la liste d'attente."
            : 'Tu pourras redemander plus tard.'
        }
        confirmLabel="Confirmer"
        destructive
        onConfirm={() => {
          setConfirmLeave(false)
          leave.mutate()
        }}
        onCancel={() => setConfirmLeave(false)}
      />
    </DetailScreen>
  )
}

/** Demandes et liste d'attente (C5) : niveau, Kwote sur le format, badge -18 ; accepter ou refuser. */
function Candidates({
  candidates,
  full,
  disabled,
  onDecide,
}: {
  candidates: RoomCandidate[]
  full: boolean
  disabled: boolean
  onDecide: (userId: string, accept: boolean) => void
}) {
  return (
    <>
      <Typography variant="h2">Demandes ({candidates.length})</Typography>
      {candidates.length === 0 ? (
        <Typography variant="small">Aucune demande pour l'instant.</Typography>
      ) : (
        // Une carte par candidat, boutons sous le profil : rien de tronqué sur téléphone
        <View style={{ gap: 8 }}>
          {candidates.map((c) => (
            <ListCard key={c.userId}>
              <ListRow
                inset={16}
                last
                title={`${c.pseudo ?? 'Joueur'}${c.minor ? ' · -18' : ''}`}
                subtitle={[
                  c.status === 'WAITLISTED' ? "Liste d'attente" : null,
                  `${c.xp} XP`,
                  c.kwote !== null
                    ? `Kwote ${formatKwote(c.kwote)}`
                    : c.rankedGames
                      ? `${c.rankedGames} parties classées`
                      : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              />
              <View
                style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 14 }}
              >
                <Button
                  small
                  kind="ghost"
                  label="Refuser"
                  disabled={disabled}
                  onPress={() => onDecide(c.userId, false)}
                />
                <Button
                  small
                  kind="room"
                  label="Accepter"
                  disabled={disabled || full}
                  onPress={() => onDecide(c.userId, true)}
                />
              </View>
            </ListCard>
          ))}
        </View>
      )}
      {full && candidates.length ? (
        <Typography variant="small">
          La room est complète : une place libérée revient au premier de la liste d'attente.
        </Typography>
      ) : null}
    </>
  )
}
