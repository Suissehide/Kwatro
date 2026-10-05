import {
  Banner,
  BrandHeader,
  Button,
  Carousel,
  ChipGroup,
  EmptyState,
  EventCard,
  KwoteBadge,
  ListCard,
  MobileScreen,
  PageTitle,
  PlayerTabBar,
  ProfileCard,
  RoomCard,
  Section,
  SkeletonCard,
  Typography,
  VenueRow,
  WebScreen,
} from '@kwatro/design-system'
import { formatKwote, xpLevel } from '@kwatro/shared'
import { Redirect } from 'expo-router'
import { useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MapFrame } from '@/components/explore/MapFrame'
import { PlayerNav } from '@/components/PlayerNav'
import {
  eventCardProps,
  GAMES,
  matchesGame,
  roomCardProps,
  todayLine,
  venueRowProps,
} from '@/lib/explore'
import {
  notYet,
  openCreateRoom,
  openEvent,
  openHome,
  openRoom,
  openTab,
  openVenue,
  openVenues,
} from '@/lib/navigation'
import { useTonightQuery } from '@/queries/useExplore'
import { useMeQuery } from '@/queries/useMe'

const WIDE = 900

export default function HomeScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const insets = useSafeAreaInsets()
  const me = useMeQuery()
  const { place, data, failed, retry } = useTonightQuery()
  const [game, setGame] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Compte tout juste créé : pseudo et ville avant l'accueil
  if (me && me.pseudo === null) return <Redirect href="/onboarding" />

  const events = data?.events.filter((e) => matchesGame(game, e.games)) ?? []
  const rooms = data?.rooms.filter((r) => matchesGame(game, [r.game])) ?? []
  const title = (
    <PageTitle
      eyebrow={todayLine(me?.city ?? place.label, !wide)}
      title="Ce soir près de toi"
      hero={wide}
    />
  )
  const filters = <ChipGroup items={GAMES} value={game} onChange={setGame} scroll={!wide} />
  const error = failed ? (
    <Banner
      tone="err"
      message="Impossible de charger les soirées et les lieux."
      action="Réessayer"
      onAction={retry}
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
    events.map((e, i) => (
      <EventCard
        key={e.id}
        {...eventCardProps(e)}
        wide={wide}
        raised={i === 0}
        onPress={() => openEvent(e.id)}
        action={
          e.registrationMode === 'NONE' ? (
            <Button small kind="ghost" label="Voir" onPress={() => openEvent(e.id)} />
          ) : (
            <Button small label="S'inscrire" onPress={() => openEvent(e.id)} />
          )
        }
      />
    ))
  )

  const roomCards = rooms.map((r) => (
    <View key={r.id} style={wide ? { width: '48%', flexGrow: 1, maxWidth: '50%' } : { width: 250 }}>
      <RoomCard {...roomCardProps(r)} wide={wide} onPress={() => openRoom(r.id)} />
    </View>
  ))
  const roomList = !data ? (
    <SkeletonCard />
  ) : rooms.length === 0 ? (
    <Typography variant="small">Aucune room ne cherche de joueurs pour l'instant.</Typography>
  ) : wide ? (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>{roomCards}</View>
  ) : (
    <Carousel>{roomCards}</Carousel>
  )

  const map = (height: number) => (
    <MapFrame
      height={height}
      center={place}
      venues={data?.venues ?? []}
      selectedId={selectedId}
      onSelect={setSelectedId}
    />
  )

  const venueList = !data ? (
    <SkeletonCard />
  ) : data.venues.length === 0 ? (
    <Typography variant="small">Aucun lieu ouvert en ce moment autour de toi.</Typography>
  ) : (
    <ListCard>
      {data.venues.map((v, i) => {
        const props = venueRowProps(v)
        return (
          <VenueRow
            key={v.id}
            {...props}
            perk={wide ? props.perk : null}
            inset={wide ? 16 : 14}
            last={i === data.venues.length - 1}
            onPress={() => openVenue(v.slug)}
          />
        )
      })}
    </ListCard>
  )

  if (!wide) {
    return (
      <MobileScreen
        insets={insets}
        header={
          <BrandHeader
            onHome={openHome}
            right={
              me?.mainKwote ? <KwoteBadge value={formatKwote(me.mainKwote.kwote)} /> : undefined
            }
          />
        }
        tabBar={
          <PlayerTabBar
            active="explorer"
            onSelect={openTab}
            onCreate={() => openCreateRoom()}
            bottomInset={Math.max(22, insets.bottom)}
          />
        }
      >
        {title}
        {filters}
        {error}
        <Section title="Soirées ce soir">{eventList}</Section>
        <Section title="Il manque des joueurs">{roomList}</Section>
        <Section title="Lieux ouverts" link="Tous les lieux" onLink={openVenues}>
          {map(200)}
          {venueList}
        </Section>
      </MobileScreen>
    )
  }

  return (
    <WebScreen nav={<PlayerNav active="explorer" />}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 72 }}>
        <View style={{ flex: 1, minWidth: 0 }}>{title}</View>
        {me ? (
          <View style={{ width: 380 }}>
            <ProfileCard
              pseudo={me.pseudo ?? ''}
              format={me.mainKwote?.format}
              kwote={me.mainKwote ? formatKwote(me.mainKwote.kwote) : undefined}
              xp={xpLevel(me.xp)}
            />
          </View>
        ) : null}
      </View>
      {filters}
      {error}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 40 }}>
        <View style={{ flex: 7, minWidth: 0, gap: 40 }}>
          <Section title="Soirées ce soir" link="Tout le programme" onLink={notYet}>
            {eventList}
          </Section>
          <Section title="Il manque des joueurs" link="Voir les rooms" onLink={notYet}>
            {roomList}
          </Section>
        </View>
        <View style={{ flex: 5, minWidth: 0 }}>
          <Section title="Lieux ouverts" link="Tous les lieux" onLink={openVenues}>
            {map(280)}
            {venueList}
          </Section>
        </View>
      </View>
    </WebScreen>
  )
}
