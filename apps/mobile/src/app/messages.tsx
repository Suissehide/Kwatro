import {
  Banner,
  CountBadge,
  colors,
  EmptyState,
  ListCard,
  ListRow,
  SkeletonCard,
  space,
  Typography,
} from '@lucko/design-system'
import { formatTime } from '@lucko/shared'
import { MessageCircle } from 'lucide-react-native'
import { useWindowDimensions, View } from 'react-native'
import { PlayerScreen } from '@/components/PlayerScreen'
import { dayLabel, localDay } from '@/lib/explore'
import { openChat } from '@/lib/navigation'
import { useChatsQuery } from '@/queries/useChat'
import { useMeQuery } from '@/queries/useMe'

const WIDE = 900

const when = (date: string) =>
  localDay(date) === localDay(new Date()) ? formatTime(date) : dayLabel(date)

/** Onglet Messages : chats des rooms et des événements du joueur, écrits ou à venir. */
export default function MessagesScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const me = useMeQuery({ required: true })
  const { data, isError, refetch } = useChatsQuery(!!me)

  const list = !data ? (
    isError ? (
      <Banner
        tone="err"
        message="Impossible de charger tes messages."
        action="Réessayer"
        onAction={() => void refetch()}
      />
    ) : (
      <SkeletonCard />
    )
  ) : data.chats.length === 0 ? (
    <EmptyState
      icon={<MessageCircle size={28} color={colors.ink} strokeWidth={2.5} />}
      title="Pas encore de messages"
      text="Le chat d'une room s'ouvre quand tu y as ta place ; celui d'un tournoi, quand tu es inscrit·e."
    />
  ) : (
    <ListCard>
      {data.chats.map((chat, i) => (
        <ListRow
          key={`${chat.type}-${chat.id}`}
          inset={16}
          title={chat.title}
          subtitle={
            chat.last
              ? `${chat.last.pseudo ?? 'Joueur'} : ${chat.last.body}`
              : 'Pas encore de message'
          }
          right={
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Typography variant="small">
                {chat.last ? when(chat.last.createdAt) : dayLabel(chat.startsAt)}
              </Typography>
              {chat.unread ? <CountBadge count={chat.unread} /> : null}
            </View>
          }
          last={i === data.chats.length - 1}
          onPress={() => openChat(chat.type, chat.id)}
        />
      ))}
    </ListCard>
  )

  if (!wide) {
    return (
      <PlayerScreen
        tab="messages"
        wide={false}
        header={
          <View style={{ paddingHorizontal: space.screen, paddingTop: 6, paddingBottom: 12 }}>
            <Typography variant="h1">Messages</Typography>
          </View>
        }
      >
        {list}
      </PlayerScreen>
    )
  }

  return (
    <PlayerScreen tab="messages" wide>
      <Typography variant="hero">Messages</Typography>
      <View style={{ maxWidth: 760 }}>{list}</View>
    </PlayerScreen>
  )
}
