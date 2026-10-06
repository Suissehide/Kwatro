import {
  Banner,
  PageTitle,
  Panel,
  ScreenHeader,
  SkeletonCard,
  Typography,
} from '@lucko/design-system'
import {
  COMMANDER_BRACKETS,
  createRoomSchema,
  DEFAULT_CITY,
  formatDistance,
  formatDuration,
  type Game,
  RADIUS_KM,
  ROOM_CAPACITY,
  ROOM_DESCRIPTION_MAX,
  type VenueListItem,
} from '@lucko/shared'
import { useStore } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { dayOptions, roomBody, roomDefaults, TIME_PATTERN } from '@/forms/room.form'
import { useAppForm } from '@/hooks/formConfig'
import { goBack } from '@/lib/navigation'
import { ApiError } from '@/lib/queryClient'
import { venuesQueryOptions } from '@/queries/useExplore'
import { useGamesQuery } from '@/queries/useGames'
import { useMeQuery } from '@/queries/useMe'
import { useRoomMutations } from '@/queries/useRoom'

const WIDE = 900

const BRACKET_OPTIONS = [
  { key: '', label: 'Pas précisé' },
  ...Object.entries(COMMANDER_BRACKETS).map(([n, name]) => ({ key: n, label: `${n} · ${name}` })),
]

/** « Partie à 2 · environ 50 min », « 2 à 5 joueurs par partie · environ 1 h 30 ». */
const formatInfo = (f: Game['formats'][number]) =>
  `${f.minPlayers === f.maxPlayers ? `Partie à ${f.minPlayers}` : `${f.minPlayers} à ${f.maxPlayers} joueurs par partie`} · environ ${formatDuration(f.durationMinutes)}`

const MODE_OPTIONS = [
  { key: 'CASUAL' as const, label: 'Normale' },
  { key: 'RANKED' as const, label: 'Classée' },
]

/**
 * Créer une room (C1 jeu, C2 où et quand, C3 qui) sur un seul écran. `?venue=<slug>` présélectionne
 * le lieu (bouton « Créer une room ici » de la fiche lieu).
 */
// ponytail: récap et lien de partage (C4) avec LKO-98, critères d'acceptation avec LKO-56
export default function CreateRoomScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const { venue: venueSlug } = useLocalSearchParams<{ venue?: string }>()
  const me = useMeQuery({ required: true })
  const games = useGamesQuery()
  // Lieux autour de la ville du joueur, dans le rayon maximal : la room peut être un peu plus loin
  const venues = useQuery({
    ...venuesQueryOptions(
      me?.latitude ?? DEFAULT_CITY.lat,
      me?.longitude ?? DEFAULT_CITY.lng,
      RADIUS_KM.max,
    ),
    enabled: !!me,
  })

  const header = <ScreenHeader title="Créer une room" onBack={goBack} />
  const failed = games.isError || venues.isError
  const content =
    games.data && venues.data ? (
      <RoomForm
        games={games.data}
        venues={venues.data}
        venueId={venues.data.find((v) => v.slug === venueSlug)?.id}
        wide={wide}
      />
    ) : failed ? (
      <Banner
        tone="err"
        message="Impossible de charger les jeux et les lieux."
        action="Réessayer"
        onAction={() => {
          void games.refetch()
          void venues.refetch()
        }}
      />
    ) : (
      <SkeletonCard />
    )

  return (
    <PlayerScreen tab="explorer" wide={wide} pushed header={header}>
      {wide ? (
        <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center', gap: 20 }}>
          <PageTitle title="Créer une room" />
          {content}
        </View>
      ) : (
        content
      )}
    </PlayerScreen>
  )
}

function RoomForm({
  games,
  venues,
  venueId,
  wide,
}: {
  games: Game[]
  venues: VenueListItem[]
  venueId?: string
  wide: boolean
}) {
  const { createRoom } = useRoomMutations()
  const form = useAppForm({
    defaultValues: roomDefaults(venueId),
    onSubmit: async ({ value, formApi }) => {
      try {
        await createRoom.mutateAsync(roomBody(value))
        router.replace('/my-games')
      } catch (error) {
        formApi.setErrorMap({
          onSubmit: {
            // 400 : motif métier (lieu fermé, mineurs…) affiché tel quel
            form:
              error instanceof ApiError && error.status === 400
                ? error.message
                : 'Impossible de créer la room pour l’instant. Réessaie.',
            fields: {},
          },
        })
      }
    },
  })
  const gameId = useStore(form.store, (state) => state.values.gameId)
  const game = games.find((g) => g.id === gameId)
  const tcg = game?.kind === 'TCG'
  const formatId = useStore(form.store, (state) => state.values.formatId)
  const format = game?.formats.find((f) => f.id === formatId)
  /** Nouveau format : bracket remis à zéro, places relevées au minimum du format (6 en draft). */
  const fitFormat = (minPlayers: number = ROOM_CAPACITY.min) => {
    form.setFieldValue('bracket', '')
    if (form.getFieldValue('capacity') < minPlayers) form.setFieldValue('capacity', minPlayers)
  }

  const gameFields = (
    <>
      <form.AppField
        name="gameId"
        validators={{ onSubmit: createRoomSchema.shape.gameId }}
        listeners={{
          // Nouveau jeu : premier format proposé ; jeux de société toujours en room normale
          onChange: ({ value }) => {
            const next = games.find((g) => g.id === value)
            form.setFieldValue('formatId', next?.formats[0]?.id ?? '')
            if (next?.kind !== 'TCG') form.setFieldValue('mode', 'CASUAL')
            fitFormat(next?.formats[0]?.minPlayers ?? next?.minPlayers)
          },
        }}
      >
        {(field) => <field.Choice options={games.map((g) => ({ key: g.id, label: g.name }))} />}
      </form.AppField>
      {tcg && game ? (
        <>
          <form.AppField
            name="formatId"
            listeners={{
              onChange: ({ value }) =>
                fitFormat(game.formats.find((f) => f.id === value)?.minPlayers),
            }}
          >
            {(field) => (
              <field.Choice
                label="Format"
                options={game.formats.map((f) => ({ key: f.id, label: f.name }))}
              />
            )}
          </form.AppField>
          {format ? <Typography variant="small">{formatInfo(format)}</Typography> : null}
          {format?.hasBrackets ? (
            <form.AppField name="bracket">
              {(field) => <field.Choice label="Bracket des decks" options={BRACKET_OPTIONS} />}
            </form.AppField>
          ) : null}
          <form.AppField name="mode">
            {(field) => <field.Choice label="Mode" options={MODE_OPTIONS} />}
          </form.AppField>
          <Typography variant="small">
            Classée : le résultat compte pour les LK. Normale : on joue pour le plaisir, XP
            seulement.
          </Typography>
        </>
      ) : null}
    </>
  )

  const whereFields = (
    <>
      <form.AppField name="venueId" validators={{ onSubmit: createRoomSchema.shape.venueId }}>
        {(field) => (
          <field.Choice
            label="Lieu"
            options={venues.map((v) => ({
              key: v.id,
              label: `${v.name} · ${formatDistance(v.distanceMeters)}`,
            }))}
          />
        )}
      </form.AppField>
      <form.AppField name="day">
        {(field) => <field.Choice label="Jour" options={dayOptions()} />}
      </form.AppField>
      <form.AppField
        name="time"
        validators={{
          onSubmit: ({ value }) => (TIME_PATTERN.test(value) ? undefined : 'Heure au format 20:30'),
        }}
      >
        {(field) => (
          <field.Text label="Heure" placeholder="20:30" keyboardType="numbers-and-punctuation" />
        )}
      </form.AppField>
    </>
  )

  const whoFields = (
    <>
      <form.AppField name="capacity">
        {(field) => (
          <field.Slider
            label="Places (toi compris)"
            min={format?.minPlayers ?? ROOM_CAPACITY.min}
            max={ROOM_CAPACITY.max}
            unit="joueurs"
          />
        )}
      </form.AppField>
      <form.AppField name="minorsAllowed">
        {(field) => (
          <field.Switch
            label="Ouverte aux mineurs"
            description="Sinon, la room est réservée aux 18 ans et plus et cachée aux mineurs."
          />
        )}
      </form.AppField>
      <form.AppField name="autoAccept">
        {(field) => (
          <field.Switch
            label="Inscription automatique"
            description="Sinon, tu acceptes chaque joueur qui demande à rejoindre."
          />
        )}
      </form.AppField>
      <form.AppField
        name="description"
        validators={{ onSubmit: createRoomSchema.shape.description.unwrap() }}
      >
        {(field) => (
          <field.Text
            label="Description et règles maison"
            placeholder="Ex. Bracket 3, decks proxy acceptés, on démarre à l’heure."
            multiline
            maxLength={ROOM_DESCRIPTION_MAX}
          />
        )}
      </form.AppField>
    </>
  )

  return (
    <View style={{ gap: wide ? 24 : 16 }}>
      <Panel title="Jeu" compact={!wide}>
        {gameFields}
      </Panel>
      <Panel title="Où et quand" compact={!wide}>
        {whereFields}
      </Panel>
      <Panel title="Qui" compact={!wide}>
        {whoFields}
      </Panel>
      <form.AppForm>
        <form.FormError />
        <View style={wide ? { alignSelf: 'flex-start' } : null}>
          <form.SubmitButton kind="rating" label="Publier la room" />
        </View>
      </form.AppForm>
    </View>
  )
}
