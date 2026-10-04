import {
  AvailabilityGrid,
  Button,
  LevelCard,
  ListCard,
  Panel,
  ProfileIdentity,
  RankCard,
  RankRow,
  Section,
  SkeletonCard,
  Typography,
} from '@kwatro/design-system'
import { xpLevel } from '@kwatro/shared'
import { router } from 'expo-router'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { AccountSection } from '@/components/profile/AccountSection'
import { placeLine, rankProps, vibeLabels, visibleAvatar } from '@/lib/profile'
import { useMe } from '@/lib/useMe'

const WIDE = 900

const openEdit = () => router.push('/profile/edit')

/** Profil du joueur (F1) : identité, niveau, Kwote par jeu, disponibilités et compte. Les parties sont dans Mes parties. */
export default function ProfileScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const me = useMe({ required: true })

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

  const account = <AccountSection email={me.email} wide={wide} />

  if (!wide) {
    return (
      <PlayerScreen tab="profil" wide={false} header={header}>
        {identity}
        <Section title="Classements">{rankings}</Section>
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
      <Section title="Disponibilités" link="Modifier" onLink={openEdit}>
        <Panel>
          <AvailabilityGrid value={me.availability} />
        </Panel>
      </Section>
      {account}
    </PlayerScreen>
  )
}
