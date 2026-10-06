import { colors, EmptyState } from '@lucko/design-system'
import type { ChatRef } from '@lucko/shared'
import { router } from 'expo-router'
import { MessageCircle } from 'lucide-react-native'
import { useState } from 'react'
import { View } from 'react-native'
import { useChatsQuery } from '@/queries/useChat'
import { useMeQuery } from '@/queries/useMe'
import { InboxHeader, InboxList } from './ChatInbox'
import { ChatThread } from './ChatThread'
import { PlayerNav } from './PlayerNav'

/**
 * Messages sur desktop : boîte de réception à gauche, conversation à droite, sur un écran sans défilement.
 * Sans `selected`, la conversation la plus récente est ouverte. Choisir un chat met à jour l'URL.
 */
export function MessagesSplit({ selected }: { selected: ChatRef | null }) {
  const me = useMeQuery({ required: true })
  const { data, isError, refetch } = useChatsQuery(!!me)
  const [filter, setFilter] = useState(0)
  const latest = data?.chats[0]
  const current = selected ?? (latest ? { type: latest.type, id: latest.id } : null)

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <PlayerNav active="messages" />
      <View
        style={{
          flex: 1,
          minHeight: 0,
          width: '100%',
          maxWidth: 1280,
          alignSelf: 'center',
          paddingTop: 28,
          paddingHorizontal: 32,
          paddingBottom: 32,
          flexDirection: 'row',
          gap: 24,
        }}
      >
        <View style={{ width: 380, minHeight: 0, gap: 14 }}>
          <InboxHeader unread={data?.unread ?? 0} filter={filter} onFilter={setFilter} />
          <InboxList
            scroll
            chats={data?.chats}
            isError={isError}
            onRetry={() => void refetch()}
            filter={filter}
            selected={current}
            onOpen={(chat) => router.setParams(chat)}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0, minHeight: 0 }}>
          {current ? (
            <ChatThread key={`${current.type}-${current.id}`} chat={current} />
          ) : data ? (
            <EmptyState
              icon={<MessageCircle size={28} color={colors.ink} strokeWidth={2.5} />}
              title="Choisis une conversation"
              text="Les chats de tes rooms et de tes événements s'ouvrent ici."
            />
          ) : null}
        </View>
      </View>
    </View>
  )
}
