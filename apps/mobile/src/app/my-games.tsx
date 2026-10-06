import {
  AgendaCard,
  Banner,
  Button,
  ChipGroup,
  colors,
  EmptyState,
  Segmented,
  SkeletonCard,
  StatusPill,
  Tag,
  Typography,
} from '@lucko/design-system'
import { type AgendaItem, agendaGroup } from '@lucko/shared'
import { router, useLocalSearchParams } from 'expo-router'
import { CalendarX } from 'lucide-react-native'
import { useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { GAMES, matchesGame } from '@/lib/explore'
import { openEvent, openHome, openRoom } from '@/lib/navigation'
import { agendaCardProps, agendaStatus, agendaTag } from '@/lib/profile'
import { useAgendaQuery } from '@/queries/useAgenda'
import { useMeQuery } from '@/queries/useMe'

const WIDE = 900

/** Mes parties (D1) : à venir et historique, groupées par période, filtrables par jeu. */
export default function MyGamesScreen() {
  const wide = useWindowDimensions().width >= WIDE
  useMeQuery({ required: true })
  const { agenda, failed, retry } = useAgendaQuery()
  const { tab } = useLocalSearchParams<{ tab?: string }>()
  const past = tab === 'history'
  const [game, setGame] = useState<string | null>(null)

  const all = agenda ? (past ? agenda.past : agenda.upcoming) : []
  const items = all.filter((item) => matchesGame(game, item.game ? [item.game] : []))
  const groups = new Map<string, AgendaItem[]>()
  for (const item of items) {
    const label = agendaGroup(item.startsAt, { past })
    groups.set(label, [...(groups.get(label) ?? []), item])
  }

  const segments = (
    <Segmented
      items={[
        `À venir${agenda ? ` (${agenda.upcoming.length})` : ''}`,
        `Historique${agenda ? ` (${agenda.past.length})` : ''}`,
      ]}
      value={past ? 1 : 0}
      onChange={(i) => router.setParams({ tab: i ? 'history' : undefined })}
    />
  )
  const filters = <ChipGroup items={GAMES} value={game} onChange={setGame} scroll={!wide} />

  const list = !agenda ? (
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
    <Empty past={past} filtered={all.length > 0} />
  ) : (
    [...groups].map(([label, group]) => (
      <View key={label} style={{ gap: 12 }}>
        <Typography variant="label">{label}</Typography>
        {group.map((item) => (
          <GameCard key={`${item.kind}-${item.id}`} item={item} wide={wide} />
        ))}
      </View>
    ))
  )

  if (!wide) {
    return (
      <PlayerScreen
        tab="parties"
        wide={false}
        header={
          <View style={{ paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, gap: 12 }}>
            <Typography variant="h1">Mes parties</Typography>
            {segments}
            {filters}
          </View>
        }
      >
        {list}
      </PlayerScreen>
    )
  }

  return (
    <PlayerScreen tab="parties" wide>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 24 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Typography variant="hero">Mes parties</Typography>
        </View>
        <View style={{ width: 380 }}>{segments}</View>
      </View>
      {filters}
      <View style={{ gap: 32 }}>{list}</View>
    </PlayerScreen>
  )
}

function GameCard({ item, wide }: { item: AgendaItem; wide: boolean }) {
  const status = agendaStatus(item)
  const tag = agendaTag(item)
  return (
    <AgendaCard
      {...agendaCardProps(item)}
      wide={wide}
      status={
        status ? (
          <StatusPill {...status} />
        ) : tag ? (
          <Tag label={tag.label} variant={tag.variant} />
        ) : null
      }
      // Historique : pas encore de variation de LK à montrer (résultats de partie à venir)
      side={item.status === 'PLAYED' ? null : undefined}
      onPress={() => (item.kind === 'ROOM' ? openRoom(item.id) : openEvent(item.id))}
    />
  )
}

function Empty({ past, filtered }: { past: boolean; filtered: boolean }) {
  if (filtered)
    return (
      <EmptyState
        dashed
        icon={<CalendarX size={28} color={colors.ink} strokeWidth={2.5} />}
        title="Rien pour ce jeu"
        text="Choisis un autre jeu, ou « Tous »."
      />
    )
  return past ? (
    <EmptyState
      dashed
      icon={<CalendarX size={28} color={colors.ink} strokeWidth={2.5} />}
      title="Pas encore de partie"
      text="Tes parties terminées apparaîtront ici, avec le résultat et tes LK."
    />
  ) : (
    <EmptyState
      dashed
      icon={<CalendarX size={28} color={colors.ink} strokeWidth={2.5} />}
      title="Rien de prévu"
      text="Inscris-toi à une soirée ou rejoins une room pour la retrouver ici."
      action={<Button small label="Explorer ce soir" onPress={openHome} />}
    />
  )
}
