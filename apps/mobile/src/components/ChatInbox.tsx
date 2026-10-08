import {
  Banner,
  ChatGroupLabel,
  ChatRow,
  colors,
  EmptyState,
  font,
  ListCard,
  Segmented,
  SkeletonCard,
  Typography,
} from '@lucko/design-system'
import type { ChatRef } from '@lucko/shared'
import { MessageCircle } from 'lucide-react-native'
import { ScrollView, Text, View } from 'react-native'
import { CHAT_FILTERS, chatGroups, chatRowProps } from '@/lib/chat'
import type { ChatSummary } from '@/queries/useChat'

/** Titre « Messages », compteur de non-lus et filtre Tout · Rooms · Événements. */
export function InboxHeader({
  unread,
  filter,
  onFilter,
  compact,
}: {
  unread: number
  filter: number
  onFilter: (filter: number) => void
  compact?: boolean
}) {
  return (
    <View style={{ gap: compact ? 12 : 14 }}>
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
      >
        <Typography
          variant="h1"
          style={compact ? null : { fontSize: 40, lineHeight: 40 }}
          role="heading"
        >
          Messages
        </Typography>
        <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.muted }}>
          {unread ? `${unread} non lu${unread > 1 ? 's' : ''}` : 'Tout est lu'}
        </Text>
      </View>
      <Segmented items={[...CHAT_FILTERS]} value={filter} onChange={onFilter} />
    </View>
  )
}

/** Conversations groupées (« À venir », « Terminées ») ; `selected` surligne celle ouverte (web). */
export function InboxList({
  chats,
  isError,
  onRetry,
  filter,
  selected,
  onOpen,
  compact,
  scroll,
}: {
  chats: ChatSummary[] | undefined
  isError: boolean
  onRetry: () => void
  filter: number
  selected?: ChatRef | null
  onOpen: (chat: ChatRef) => void
  compact?: boolean
  /** Web : la carte remplit la colonne et défile seule. */
  scroll?: boolean
}) {
  if (!chats)
    return isError ? (
      <Banner
        tone="err"
        message="Impossible de charger tes messages."
        action="Réessayer"
        onAction={onRetry}
      />
    ) : (
      <SkeletonCard />
    )
  const groups = chatGroups(chats, filter)
  if (!groups.length)
    return (
      <EmptyState
        icon={<MessageCircle size={28} color={colors.ink} strokeWidth={2.5} />}
        title="Pas encore de messages"
        text={
          chats.length
            ? 'Aucune conversation de ce type.'
            : "Le chat d'une room s'ouvre quand tu y as ta place ; celui d'un tournoi, quand tu es inscrit·e."
        }
      />
    )
  const rows = groups.map((group, i) => (
    <View key={group.label}>
      <ChatGroupLabel label={group.label} first={i === 0} />
      {group.chats.map((chat) => (
        <ChatRow
          key={`${chat.type}-${chat.id}`}
          {...chatRowProps(chat)}
          compact={compact}
          selected={selected?.type === chat.type && selected.id === chat.id}
          onPress={() => onOpen({ type: chat.type, id: chat.id })}
        />
      ))}
    </View>
  ))
  return scroll ? (
    <ListCard style={{ flex: 1, minHeight: 0 }}>
      <ScrollView>{rows}</ScrollView>
    </ListCard>
  ) : (
    <ListCard>{rows}</ListCard>
  )
}
