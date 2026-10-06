import { useLocalSearchParams } from 'expo-router'
import { useWindowDimensions } from 'react-native'
import { ChatThread } from '@/components/ChatThread'
import { MessagesSplit } from '@/components/MessagesSplit'
import { chatParam } from '@/lib/chat'

const WIDE = 900

/** Chat de room ou de tournoi (LKO-80). Desktop : la vue scindée de l'onglet Messages, ce chat ouvert. */
export default function ChatScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>()
  const wide = useWindowDimensions().width >= WIDE
  const chat = chatParam(params) ?? { type: 'room' as const, id: params.id }
  if (wide) return <MessagesSplit selected={chat} />
  return <ChatThread key={`${chat.type}-${chat.id}`} chat={chat} compact />
}
