import {
  Banner,
  Button,
  border,
  colors,
  EmptyState,
  MobileScreen,
  radius,
  Segmented,
  SkeletonCard,
  Typography,
} from '@kwatro/design-system'
import type { EventListItem, VenueListItem } from '@kwatro/shared'
import { type ReactNode, useEffect, useState } from 'react'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { EventCard } from '@/components/explore/EventCard'
import { ExploreMap } from '@/components/explore/ExploreMap'
import { VenueCard } from '@/components/explore/VenueCard'
import { api } from '@/lib/api'
import { useLocation } from '@/lib/useLocation'

const RADIUS_KM = 10
const SEGMENTS = ['Rooms', 'Événements', 'Lieux']

type Data = { venues: VenueListItem[]; events: EventListItem[] }

/** Explorer — « Où jouer ce soir » : carte des lieux (B1) et liste rooms / événements / lieux (B2). */
export default function ExploreScreen() {
  const insets = useSafeAreaInsets()
  const { place, ready } = useLocation()
  const [view, setView] = useState<'map' | 'list'>(Platform.OS === 'web' ? 'list' : 'map')
  const [segment, setSegment] = useState(1)
  const [data, setData] = useState<Data | null>(null)
  const [failed, setFailed] = useState(false)
  const [reload, setReload] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // biome-ignore lint/correctness/useExhaustiveDependencies: `reload` relance volontairement le chargement
  useEffect(() => {
    if (!ready) return
    let cancelled = false
    const query = { lat: place.lat, lng: place.lng, radiusKm: RADIUS_KM }
    setFailed(false)
    Promise.all([
      api.GET('/venues', { params: { query } }),
      api.GET('/events', { params: { query } }),
    ])
      .then(([venues, events]) => {
        if (cancelled) return
        if (!venues.data || !events.data) throw new Error('Réponse invalide')
        setData({ venues: venues.data, events: events.data })
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [ready, place, reload])

  const selected = data?.venues.find((v) => v.id === selectedId) ?? data?.venues[0]

  const header = (
    <View style={{ paddingHorizontal: 20, paddingBottom: 10, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h1">Explorer</Typography>
        <Button
          small
          kind="ghost"
          label={view === 'map' ? 'Liste' : 'Carte'}
          onPress={() => setView(view === 'map' ? 'list' : 'map')}
        />
      </View>
      <Typography variant="label">
        {place.label} · {RADIUS_KM} km
      </Typography>
    </View>
  )

  const loading = !data && !failed
  const error = failed ? (
    <Banner
      tone="err"
      message="Impossible de charger les lieux et les soirées."
      action="Réessayer"
      onAction={() => setReload((n) => n + 1)}
    />
  ) : null

  if (view === 'map') {
    return (
      <MobileScreen header={header} scroll={false} insets={insets}>
        {error}
        <View
          style={{
            flex: 1,
            borderWidth: border.base,
            borderColor: colors.ink,
            borderRadius: radius.card,
            overflow: 'hidden',
          }}
        >
          <ExploreMap
            center={place}
            venues={data?.venues ?? []}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
          />
        </View>
        {selected ? <VenueCard venue={selected} raised /> : loading ? <SkeletonCard /> : null}
      </MobileScreen>
    )
  }

  return (
    <MobileScreen header={header} insets={insets}>
      <Segmented items={SEGMENTS} value={segment} onChange={setSegment} />
      {error}
      {loading ? (
        <>
          <SkeletonCard />
          <SkeletonCard />
        </>
      ) : segment === 0 ? (
        <EmptyState
          icon={<Typography variant="h2">+</Typography>}
          title="Les rooms arrivent bientôt"
          text="Tu pourras créer ta partie et inviter des joueurs du coin."
        />
      ) : segment === 1 ? (
        <List
          items={data?.events ?? []}
          empty="Aucune soirée dans les 7 prochains jours autour de toi."
          render={(event) => <EventCard key={event.id} event={event} />}
          title="Cette semaine"
        />
      ) : (
        <List
          items={data?.venues ?? []}
          empty={`Aucun lieu à moins de ${RADIUS_KM} km.`}
          render={(venue) => <VenueCard key={venue.id} venue={venue} />}
        />
      )}
      {segment > 0 ? (
        <Typography variant="small">
          Trié par {segment === 1 ? 'date puis distance' : 'distance'}. À distance égale, les lieux
          partenaires passent devant.
        </Typography>
      ) : null}
    </MobileScreen>
  )
}

function List<T>({
  items,
  render,
  empty,
  title,
}: {
  items: T[]
  render: (item: T) => ReactNode
  empty: string
  title?: string
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Typography variant="h2">◎</Typography>}
        title="Rien pour l'instant"
        text={empty}
      />
    )
  }
  return (
    <View style={{ gap: 12 }}>
      {title ? <Typography variant="label">{title}</Typography> : null}
      {items.map(render)}
    </View>
  )
}
