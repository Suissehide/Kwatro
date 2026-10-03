import {
  Avatar,
  Banner,
  Button,
  border,
  Chip,
  ContentCard,
  colors,
  DateBlock,
  EmptyState,
  font,
  KwoteBadge,
  MobileScreen,
  PlayerTabBar,
  Raised,
  radius,
  SkeletonCard,
  shadow,
  sizes,
  space,
  Tag,
  Typography,
  XpBar,
} from '@kwatro/design-system'
import {
  EVENT_TYPE_LABELS,
  type EventListItem,
  formatDayMonth,
  formatDistance,
  formatMinuteOfDay,
  formatTime,
  type Me,
  type RoomListItem,
  VENUE_TIME_ZONE,
  VENUE_TYPE_LABELS,
  type VenueListItem,
  xpLevel,
} from '@kwatro/shared'
import { type ReactNode, useEffect, useState } from 'react'
import { ScrollView, Text, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Logo } from '@/components/Logo'
import { api } from '@/lib/api'
import { useLocation } from '@/lib/useLocation'

// ponytail: fiches événement, room et lieu, inscription, création de room et autres onglets pas encore faits :
// boutons, liens et onglets sans action pour l'instant.

/** Largeur à partir de laquelle l'écran passe en mise en page desktop (même seuil que auth.tsx). */
const WIDE = 900
const RADIUS_KM = 10

/** Filtres par jeu : slug du catalogue (seed) et nom court affiché. */
const GAMES: { slug: string | null; label: string }[] = [
  { slug: null, label: 'Tous' },
  { slug: 'magic', label: 'Magic' },
  { slug: 'pokemon', label: 'Pokémon' },
  { slug: 'lorcana', label: 'Lorcana' },
  { slug: 'one-piece', label: 'One Piece' },
  { slug: 'yugioh', label: 'Yu-Gi-Oh!' },
  { slug: 'jeux-de-societe', label: 'Jeux de société' },
]
const NAV = ['Explorer', 'Mes parties', 'Messages', 'Profil']
const PLAYER_COLORS = [colors.event, colors.venue, colors.room, colors.kwote]

type Data = { events: EventListItem[]; rooms: RoomListItem[]; venues: VenueListItem[] }

const gameLabel = (game: { slug: string; name: string }) =>
  GAMES.find((g) => g.slug === game.slug)?.label ?? game.name

/** Date locale du lieu, « 2026-10-03 » : sert à garder les soirées du jour. */
const localDay = (date: Date | string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: VENUE_TIME_ZONE }).format(new Date(date))

/** « 21 h », « 20 h 30 » et, pour le bandeau du DateBlock, « 21H », « 20H30 ». */
function hours(date: string) {
  const [h = 0, m = 0] = formatTime(date).split(':').map(Number)
  return {
    text: formatMinuteOfDay(h * 60 + m),
    band: `${h}H${m ? String(m).padStart(2, '0') : ''}`,
  }
}

/** Accueil joueur (onglet Explorer) : soirées ce soir, rooms qui cherchent des joueurs, lieux ouverts. */
export default function HomeScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const insets = useSafeAreaInsets()
  const { place, ready } = useLocation()
  const [me, setMe] = useState<Me | null>(null)
  const [data, setData] = useState<Data | null>(null)
  const [failed, setFailed] = useState(false)
  const [reload, setReload] = useState(0)
  const [game, setGame] = useState<string | null>(null)

  useEffect(() => {
    // Sans session (ou API sans DEV_AUTH_HEADER), l'écran s'affiche sans pseudo ni Kwote
    api.GET('/me').then(
      ({ data }) => setMe(data ?? null),
      () => setMe(null),
    )
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: `reload` relance volontairement le chargement
  useEffect(() => {
    if (!ready) return
    let cancelled = false
    const query = { lat: place.lat, lng: place.lng, radiusKm: RADIUS_KM, days: 1 }
    setFailed(false)
    Promise.all([
      api.GET('/events', { params: { query } }),
      api.GET('/rooms', { params: { query } }),
      api.GET('/venues', { params: { query } }),
    ])
      .then(([events, rooms, venues]) => {
        if (cancelled) return
        if (!events.data || !rooms.data || !venues.data) throw new Error('Réponse invalide')
        const today = localDay(new Date())
        setData({
          events: events.data.filter((e) => localDay(e.startsAt) === today),
          rooms: rooms.data,
          venues: venues.data.filter((v) => v.openNow),
        })
      })
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [ready, place, reload])

  const matches = (games: { slug: string }[]) =>
    !game || games.length === 0 || games.some((g) => g.slug === game)
  const events = data?.events.filter((e) => matches(e.games)) ?? []
  const rooms = data?.rooms.filter((r) => matches([r.game])) ?? []
  const date = new Intl.DateTimeFormat('fr-FR', {
    timeZone: VENUE_TIME_ZONE,
    weekday: 'long',
    day: 'numeric',
    month: wide ? 'long' : 'short',
  }).format(new Date())
  const dateLine = `${date.charAt(0).toUpperCase()}${date.slice(1)} · ${me?.city ?? place.label}`

  const chips = GAMES.map((g) => (
    <Chip key={g.label} label={g.label} active={g.slug === game} onPress={() => setGame(g.slug)} />
  ))

  const error = failed ? (
    <Banner
      tone="err"
      message="Impossible de charger les soirées et les lieux."
      action="Réessayer"
      onAction={() => setReload((n) => n + 1)}
    />
  ) : null

  const eventList = !data ? (
    <SkeletonCard />
  ) : events.length === 0 ? (
    <EmptyState
      icon={<Typography variant="h2">◎</Typography>}
      title="Pas de soirée ce soir"
      text={
        game
          ? 'Aucune soirée pour ce jeu près de toi ce soir. Essaie un autre jeu.'
          : 'Aucune soirée près de toi ce soir. Les rooms et les lieux ouverts sont juste en dessous.'
      }
    />
  ) : (
    events.map((e, i) => <EventCard key={e.id} event={e} raised={i === 0} wide={wide} />)
  )

  const roomCards = rooms.map((r) => <RoomCard key={r.id} room={r} wide={wide} />)
  const roomList = !data ? (
    <SkeletonCard />
  ) : rooms.length === 0 ? (
    <Typography variant="small">Aucune room ne cherche de joueurs pour l'instant.</Typography>
  ) : null

  const venueList = !data ? (
    <SkeletonCard />
  ) : data.venues.length === 0 ? (
    <Typography variant="small">Aucun lieu ouvert en ce moment autour de toi.</Typography>
  ) : (
    <VenueList venues={data.venues} wide={wide} />
  )

  if (!wide) {
    return (
      <MobileScreen
        insets={insets}
        header={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: space.screen,
              paddingTop: 6,
              paddingBottom: 12,
            }}
          >
            <Logo size={28} />
            <Text
              style={{
                ...font('display'),
                fontSize: 20,
                textTransform: 'uppercase',
                color: colors.ink,
              }}
            >
              Kwatro
            </Text>
            <View style={{ flex: 1 }} />
            {me?.mainKwote ? <KwoteBadge value={kwote(me.mainKwote.kwote)} /> : null}
          </View>
        }
        tabBar={
          <PlayerTabBar
            active="explorer"
            onSelect={() => {}}
            onCreate={() => {}}
            bottomInset={Math.max(22, insets.bottom)}
          />
        }
      >
        <View style={{ gap: 6, paddingTop: 8 }}>
          <Typography variant="label">{dateLine}</Typography>
          <Typography variant="h1">Ce soir près de toi</Typography>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginHorizontal: -space.screen, flexGrow: 0 }}
          contentContainerStyle={{ gap: 8, paddingHorizontal: space.screen, paddingVertical: 2 }}
        >
          {chips}
        </ScrollView>
        {error}
        <Typography variant="h2" style={{ marginTop: 8 }}>
          Soirées ce soir
        </Typography>
        {eventList}
        <Typography variant="h2" style={{ marginTop: 8 }}>
          Il manque des joueurs
        </Typography>
        {roomList ?? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginHorizontal: -space.screen, flexGrow: 0 }}
            contentContainerStyle={{ gap: 12, paddingHorizontal: space.screen, paddingBottom: 6 }}
          >
            {roomCards}
          </ScrollView>
        )}
        <Typography variant="h2" style={{ marginTop: 8 }}>
          Lieux ouverts
        </Typography>
        {venueList}
      </MobileScreen>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <TopBar pseudo={me?.pseudo} />
      <ScrollView>
        <View
          style={{
            width: '100%',
            maxWidth: 1200,
            alignSelf: 'center',
            paddingHorizontal: 32,
            paddingTop: 48,
            paddingBottom: 72,
            gap: 32,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 72 }}>
            <View style={{ flex: 1, minWidth: 0, gap: 12 }}>
              <Typography variant="label">{dateLine}</Typography>
              <Text
                role="heading"
                style={{
                  ...font('display'),
                  fontSize: 56,
                  lineHeight: 55,
                  textTransform: 'uppercase',
                  color: colors.ink,
                  maxWidth: 640,
                }}
              >
                Ce soir près de toi
              </Text>
            </View>
            {me ? <ProfileCard me={me} /> : null}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{chips}</View>
          {error}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 40 }}>
            <View style={{ flex: 7, minWidth: 0, gap: 40 }}>
              <Section title="Soirées ce soir" link="Tout le programme">
                {eventList}
              </Section>
              <Section title="Il manque des joueurs" link="Voir les rooms">
                {roomList ?? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
                    {roomCards.map((card) => (
                      <View key={card.key} style={{ width: '48%', flexGrow: 1, maxWidth: '50%' }}>
                        {card}
                      </View>
                    ))}
                  </View>
                )}
              </Section>
            </View>
            <View style={{ flex: 5, minWidth: 0 }}>
              <Section title="Lieux ouverts" link="Carte">
                {/* ponytail: carte des lieux à brancher plus tard, encart vide en attendant */}
                <View
                  aria-label="Carte des lieux, bientôt disponible"
                  style={{
                    height: 280,
                    borderWidth: border.base,
                    borderColor: colors.ink,
                    borderRadius: radius.card,
                    backgroundColor: colors.creamDark,
                  }}
                />
                {venueList}
              </Section>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

/** Kwote avec séparateur de milliers : « 1 214 ». */
const kwote = (value: number) => value.toLocaleString('fr-FR')

/** Barre du site (comme WideLayout de auth.tsx) + navigation joueur, création de room et avatar. */
function TopBar({ pseudo }: { pseudo?: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderBottomWidth: border.base,
        borderColor: colors.ink,
      }}
    >
      <Logo size={32} />
      <Text
        style={{ ...font('display'), fontSize: 22, textTransform: 'uppercase', color: colors.ink }}
      >
        Kwatro
      </Text>
      <View role="navigation" style={{ flexDirection: 'row', gap: 6, marginLeft: 40 }}>
        {NAV.map((label, i) => {
          const on = i === 0
          const item = (
            <View
              key={label}
              aria-current={on ? 'page' : undefined}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: radius.field,
                borderWidth: border.thin,
                borderColor: on ? colors.ink : 'transparent',
                backgroundColor: on ? colors.room : 'transparent',
              }}
            >
              <Text
                style={{
                  ...font('body', on ? 800 : 600),
                  fontSize: 14,
                  color: on ? colors.white : colors.ink,
                }}
              >
                {label}
              </Text>
            </View>
          )
          return on ? (
            <Raised key={label} offset={shadow.sm} r={radius.field}>
              {item}
            </Raised>
          ) : (
            item
          )
        })}
      </View>
      <View style={{ flex: 1 }} />
      <Button small kind="kwote" label="+ Créer une room" />
      {pseudo ? (
        <View style={{ marginLeft: 8 }}>
          <Avatar name={pseudo} size={sizes.avatar.s} />
        </View>
      ) : null}
    </View>
  )
}

/** Carte profil (desktop) : pseudo, Kwote du format principal et niveau d'XP. */
function ProfileCard({ me }: { me: Me }) {
  const xp = xpLevel(me.xp)
  return (
    <Raised offset={shadow.card} r={radius.card} style={{ width: 380 }}>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          paddingVertical: 16,
          paddingHorizontal: 18,
          gap: 14,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Typography variant="title">{me.pseudo}</Typography>
          {me.mainKwote ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Typography variant="small">{me.mainKwote.format}</Typography>
              <KwoteBadge value={kwote(me.mainKwote.kwote)} />
            </View>
          ) : null}
        </View>
        <XpBar level={xp.level} name={xp.name} current={xp.current} max={xp.max} />
      </View>
    </Raised>
  )
}

/** En-tête de section desktop : titre et lien à droite. */
function Section({ title, link, children }: { title: string; link: string; children: ReactNode }) {
  return (
    <View style={{ gap: 14 }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <Typography variant="h2">{title}</Typography>
        <Text role="link" style={{ ...font('body', 800), fontSize: 13, color: colors.event }}>
          {link}
        </Text>
      </View>
      {children}
    </View>
  )
}

/** Places restantes, ou mode d'inscription quand il n'y a pas de jauge. */
function spots(event: EventListItem) {
  if (event.registrationMode === 'NONE') return 'Accès libre'
  if (event.registrationMode === 'EXTERNAL') return 'Inscription externe'
  if (event.capacity === null) return null
  const left = Math.max(0, event.capacity - event.registeredCount)
  return left ? `${left} place${left > 1 ? 's' : ''} sur ${event.capacity}` : 'Complet'
}

/** Soirée du jour. Desktop : bouton S'inscrire / Voir ; téléphone : la carte entière ouvre le détail. */
function EventCard({
  event,
  raised,
  wide,
}: {
  event: EventListItem
  raised: boolean
  wide: boolean
}) {
  const games = event.games.length ? event.games.map(gameLabel).join(', ') : 'Tous jeux'
  const where = [event.venue.name, formatDistance(event.venue.distanceMeters)]
  const places = spots(event)
  const partner = event.venue.isPartner ? <Tag label="Partenaire" variant="partner" /> : null
  return (
    <ContentCard kind="event" raised={raised}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: wide ? 'center' : 'flex-start',
          gap: wide ? 16 : 12,
        }}
      >
        <DateBlock day={formatDayMonth(event.startsAt).day} month={hours(event.startsAt).band} />
        <View style={{ flex: 1, minWidth: 0, gap: 6 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <Typography variant="label">
              {EVENT_TYPE_LABELS[event.type]} · {games}
            </Typography>
            {wide ? partner : null}
          </View>
          <Typography variant="title">{event.title}</Typography>
          <Typography variant="small">
            {(wide && places ? [...where, places] : where).join(' · ')}
          </Typography>
          {wide ? null : (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 2,
              }}
            >
              <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.ink }}>
                {places}
              </Text>
              {partner}
            </View>
          )}
        </View>
        {wide ? (
          event.registrationMode === 'NONE' ? (
            <Button small kind="ghost" label="Voir" />
          ) : (
            <Button small label="S'inscrire" />
          )
        ) : null}
      </View>
    </ContentCard>
  )
}

/** Room ouverte : places prises, joueurs (desktop) et fourchette de Kwote des parties classées. */
function RoomCard({ room, wide }: { room: RoomListItem; wide: boolean }) {
  const missing = Math.max(0, room.capacity - room.players.length)
  const count = (
    <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.ink }}>
      {room.players.length}/{room.capacity}
    </Text>
  )
  const card = (
    <ContentCard kind="room">
      <Typography variant="label">
        {room.mode === 'RANKED' ? 'Partie classée' : 'Partie libre'} · {gameLabel(room.game)}
      </Typography>
      <Typography variant="title">
        {missing ? `Il manque ${missing} joueur${missing > 1 ? 's' : ''}` : 'Room complète'}
      </Typography>
      <Typography variant="small">
        {room.venue.name} · {hours(room.startsAt).text}
      </Typography>
      {wide ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 4,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ flexDirection: 'row' }}>
              {room.players.map((p, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: initiales seules, pas d'identifiant public
                <View key={i} style={{ marginRight: -6 }}>
                  <Avatar
                    name={p.initial}
                    color={PLAYER_COLORS[i % PLAYER_COLORS.length]}
                    size={28}
                  />
                </View>
              ))}
            </View>
            <View style={{ marginLeft: 6 }}>{count}</View>
          </View>
          {room.kwoteRange ? (
            <KwoteBadge value={`${kwote(room.kwoteRange.min)} – ${kwote(room.kwoteRange.max)}`} />
          ) : null}
        </View>
      ) : (
        count
      )}
    </ContentCard>
  )
  return wide ? card : <View style={{ width: 250 }}>{card}</View>
}

/** Lieux ouverts, dans l'ordre de l'API (distance, partenaires en premier à distance égale). */
function VenueList({ venues, wide }: { venues: VenueListItem[]; wide: boolean }) {
  return (
    <View
      style={{
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
      }}
    >
      {venues.map((v, i) => (
        <View
          key={v.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: wide ? 13 : 12,
            paddingHorizontal: wide ? 16 : 14,
            borderTopWidth: i ? border.thin : 0,
            borderColor: colors.line,
          }}
        >
          <View
            aria-label={v.isPartner ? 'Lieu partenaire' : undefined}
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              borderWidth: border.thin,
              borderColor: colors.ink,
              backgroundColor: v.isPartner ? colors.venue : colors.white,
            }}
          />
          <View style={{ flex: 1, minWidth: 0, gap: wide ? 3 : 2 }}>
            <Text style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>{v.name}</Text>
            <Typography variant="small">
              {VENUE_TYPE_LABELS[v.type]}
              {v.closesAtMinute !== null ? ` · jusqu'à ${formatMinuteOfDay(v.closesAtMinute)}` : ''}
            </Typography>
            {wide && v.isPartner && v.kwatroPerk ? (
              <Text
                style={{ ...font('body', 600), fontSize: 13, lineHeight: 18, color: colors.venue }}
              >
                {v.kwatroPerk}
              </Text>
            ) : null}
          </View>
          <Text style={{ ...font('mono', 700), fontSize: 13, color: colors.ink }}>
            {formatDistance(v.distanceMeters)}
          </Text>
        </View>
      ))}
    </View>
  )
}
