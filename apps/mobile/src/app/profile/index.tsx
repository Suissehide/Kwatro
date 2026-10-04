import {
  AvailabilityGrid,
  Banner,
  Button,
  DateBlock,
  LevelCard,
  ListCard,
  ListRow,
  Panel,
  ProfileIdentity,
  RankCard,
  RankRow,
  Section,
  SkeletonCard,
  StatusPill,
  Tag,
  Typography,
} from '@kwatro/design-system'
import { type AgendaItem, xpLevel } from '@kwatro/shared'
import { router } from 'expo-router'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { notYet } from '@/lib/navigation'
import {
  agendaCardProps,
  agendaStatus,
  agendaTag,
  placeLine,
  rankProps,
  vibeLabels,
  visibleAvatar,
} from '@/lib/profile'
import { useAgenda } from '@/lib/useAgenda'
import { useMe } from '@/lib/useMe'

const WIDE = 900
const PREVIEW = 3

const openEdit = () => router.push('/profile/edit')
const openAccount = () => router.push('/compte')
const openGames = (tab?: 'history') => router.navigate({ pathname: '/my-games', params: { tab } })

/** Profil du joueur (F1) : identité, niveau, Kwote par jeu, prochaines et dernières parties, disponibilités. */
export default function ProfileScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const me = useMe({ required: true })
  const { agenda, failed, retry } = useAgenda()

  const header = wide ? null : (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 10,
      }}
    >
      <Typography variant="h2">Profil</Typography>
      <Button small kind="ghost" label="Modifier" onPress={openEdit} />
    </View>
  )

  if (!me) {
    return (
      <PlayerScreen tab="profil" wide={wide} header={header}>
        <SkeletonCard />
        <SkeletonCard />
      </PlayerScreen>
    )
  }

  const pseudo = me.pseudo ?? ''
  const xp = xpLevel(me.xp)
  const identity = (
    <ProfileIdentity
      wide={wide}
      pseudo={pseudo}
      avatarUri={visibleAvatar(me)}
      place={placeLine(me, !wide)}
      vibes={vibeLabels(me)}
      xp={xp}
      onEdit={openEdit}
    />
  )

  const rankings = me.rankings.length ? (
    wide ? (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        {me.rankings.map((r) => (
          <View key={`${r.game.slug}-${r.format}`} style={{ flexBasis: 240, flexGrow: 1 }}>
            <RankCard {...rankProps(r)} />
          </View>
        ))}
      </View>
    ) : (
      <ListCard>
        {me.rankings.map((r, i) => {
          const { shortNote, ...props } = rankProps(r)
          return (
            <RankRow
              key={`${r.game.slug}-${r.format}`}
              {...props}
              note={shortNote}
              last={i === me.rankings.length - 1}
            />
          )
        })}
      </ListCard>
    )
  ) : (
    <Typography variant="small">
      Pas encore de Kwote : elle apparaît après tes premières parties classées en TCG.
    </Typography>
  )

  const games = (items: AgendaItem[] | undefined, empty: string) =>
    !items ? (
      failed ? (
        <Banner
          tone="err"
          message="Impossible de charger tes parties."
          action="Réessayer"
          onAction={retry}
        />
      ) : (
        <SkeletonCard />
      )
    ) : items.length === 0 ? (
      <Typography variant="small">{empty}</Typography>
    ) : (
      <ListCard>
        {items.slice(0, PREVIEW).map((item, i, shown) => (
          <GameRow key={item.id} item={item} wide={wide} last={i === shown.length - 1} />
        ))}
      </ListCard>
    )
  const upcoming = (
    <Section
      title={wide ? 'Prochaines parties' : 'Prochaines'}
      link={wide ? 'Toutes mes parties' : 'Tout voir'}
      onLink={() => openGames()}
    >
      {games(agenda?.upcoming, 'Rien de prévu pour l’instant.')}
    </Section>
  )
  const account = (
    <Section title="Compte">
      <ListCard>
        <ListRow
          inset={wide ? 16 : 14}
          last
          title="Mon compte"
          subtitle="E-mail de connexion, suppression du compte"
          right={<Typography variant="title">→</Typography>}
          onPress={openAccount}
        />
      </ListCard>
    </Section>
  )
  const past = (
    <Section
      title={wide ? 'Dernières parties' : 'Dernières'}
      link="Historique"
      onLink={() => openGames('history')}
    >
      {games(agenda?.past, 'Pas encore de partie jouée.')}
    </Section>
  )

  if (!wide) {
    return (
      <PlayerScreen tab="profil" wide={false} header={header}>
        {identity}
        <Section title="Classements">{rankings}</Section>
        {upcoming}
        {past}
        {account}
      </PlayerScreen>
    )
  }

  return (
    <PlayerScreen tab="profil" wide pseudo={pseudo}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 72 }}>
        <View style={{ flex: 1, minWidth: 0 }}>{identity}</View>
        <View style={{ width: 380 }}>
          <LevelCard {...xp} />
        </View>
      </View>
      <View style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 16 }}>
          <Typography variant="h2">Classements par jeu</Typography>
          <Typography variant="small">Kwote calculée sur les parties classées</Typography>
        </View>
        {rankings}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 40 }}>
        <View style={{ flex: 1, minWidth: 0 }}>{upcoming}</View>
        <View style={{ flex: 1, minWidth: 0 }}>{past}</View>
      </View>
      <Section title="Disponibilités" link="Modifier" onLink={openEdit}>
        <Panel>
          <AvailabilityGrid value={me.availability} />
        </Panel>
      </Section>
      {account}
    </PlayerScreen>
  )
}

/** Partie à venir (état) ou passée (type de room), en ligne de liste. */
function GameRow({ item, wide, last }: { item: AgendaItem; wide: boolean; last: boolean }) {
  const card = agendaCardProps(item)
  const status = agendaStatus(item)
  const tag = agendaTag(item)
  const right = status ? (
    <View>
      <StatusPill {...status} />
    </View>
  ) : tag ? (
    <View>
      <Tag label={tag.label} variant={tag.variant} />
    </View>
  ) : null
  return (
    <ListRow
      inset={wide ? 16 : 14}
      last={last}
      left={<DateBlock day={card.day} month={card.month} color={card.color} />}
      title={card.title}
      subtitle={card.meta}
      right={right}
      onPress={notYet}
    />
  )
}
