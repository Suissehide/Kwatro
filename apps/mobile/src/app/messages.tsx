import { space } from '@lucko/design-system'
import { useLocalSearchParams } from 'expo-router'
import { useState } from 'react'
import { useWindowDimensions, View } from 'react-native'
import { InboxHeader, InboxList } from '@/components/ChatInbox'
import { MessagesSplit } from '@/components/MessagesSplit'
import { PlayerScreen } from '@/components/PlayerScreen'
import { chatParam } from '@/lib/chat'
import { openChat } from '@/lib/navigation'
import { useChatsQuery } from '@/queries/useChat'
import { useMeQuery } from '@/queries/useMe'

const WIDE = 900

/** Onglet Messages : chats des rooms et des événements du joueur. Desktop : liste et conversation côte à côte. */
export default function MessagesScreen() {
  const wide = useWindowDimensions().width >= WIDE
  const params = useLocalSearchParams<{ type?: string; id?: string }>()
  const me = useMeQuery({ required: true })
  const { data, isError, refetch } = useChatsQuery(!!me)
  const [filter, setFilter] = useState(0)

  if (wide) return <MessagesSplit selected={chatParam(params)} />

  return (
    <PlayerScreen
      tab="messages"
      wide={false}
      header={
        <View style={{ paddingHorizontal: space.screen, paddingTop: 6, paddingBottom: 12 }}>
          <InboxHeader compact unread={data?.unread ?? 0} filter={filter} onFilter={setFilter} />
        </View>
      }
    >
      <InboxList
        compact
        chats={data?.chats}
        isError={isError}
        onRetry={() => void refetch()}
        filter={filter}
        onOpen={(chat) => openChat(chat.type, chat.id)}
      />
    </PlayerScreen>
  )
}
