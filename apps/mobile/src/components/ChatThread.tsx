import {
  Banner,
  border,
  ChatBubble,
  ChatComposer,
  ChatDivider,
  ChatHeader,
  ContextMenu,
  colors,
  font,
  type MenuAnchor,
  PinnedBanner,
  Raised,
  radius,
  SkeletonCard,
  shadow,
  Toggle,
  Typography,
} from '@lucko/design-system'
import {
  CHAT_EVENTS,
  CHAT_MESSAGE_MAX,
  type ChatRef,
  chatChannel,
  formatTime,
  REPORT_REASON_LABELS,
  REPORT_REASONS,
} from '@lucko/shared'
import { Flag, Trash2 } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { authorColor, chatColor, chatDetail, threadLayout } from '@/lib/chat'
import { goBack, openEvent, openRoom } from '@/lib/navigation'
import { ApiError } from '@/lib/queryClient'
import { emitRealtime } from '@/lib/realtime'
import { type ChatMessage, useChatMutations, useChatQuery } from '@/queries/useChat'
import { useMeQuery } from '@/queries/useMe'

/** Le signal « en train d'écrire » est renvoyé au plus toutes les 3 secondes. */
const TYPING_EVERY_MS = 3000

/**
 * Conversation d'une room ou d'un événement (LKO-80) : messages en direct groupés par auteur, annonce
 * épinglée, saisie, signalement. `compact` : plein écran téléphone ; sinon carte de la vue scindée web.
 * À remonter (`key`) quand `chat` change : brouillon et séparateur sont propres à une conversation.
 */
export function ChatThread({ chat: ref, compact }: { chat: ChatRef; compact?: boolean }) {
  const me = useMeQuery({ required: true })
  const insets = useSafeAreaInsets()
  const chat = useChatQuery(ref)
  const { send, remove, report, markRead, mute } = useChatMutations(ref, {
    id: me?.id ?? '',
    pseudo: me?.pseudo ?? null,
  })
  const [text, setText] = useState('')
  const [announcement, setAnnouncement] = useState(false)
  const [menu, setMenu] = useState<{ message: ChatMessage; anchor: MenuAnchor } | null>(null)
  const [reporting, setReporting] = useState(false)
  const [reported, setReported] = useState(false)
  const lastTyping = useRef(0)

  const first = chat.data?.pages[0]
  const messages = chat.data?.pages.flatMap((page) => page.messages) ?? []
  // Dernier passage figé à l'ouverture : le séparateur ne bouge pas quand on lit
  const readAt = useRef<string | null | undefined>(undefined)
  if (first && readAt.current === undefined) readAt.current = first.lastReadAt
  const lastRead = readAt.current
  // Plus ancien message non lu des autres (liste du plus récent au plus ancien)
  const dividerAt = lastRead
    ? messages.findLastIndex((m) => m.createdAt > lastRead && m.author.id !== me?.id)
    : -1
  const layout = threadLayout(messages, dividerAt)

  // Tout est lu dès qu'un nouveau message s'affiche
  const newest = messages[0]?.id
  // biome-ignore lint/correctness/useExhaustiveDependencies: on marque lu à chaque nouveau message
  useEffect(() => {
    if (newest && !newest.startsWith('temp-')) markRead.mutate()
  }, [newest])

  const onChange = (value: string) => {
    setText(value)
    const now = Date.now()
    if (value && now - lastTyping.current > TYPING_EVERY_MS) {
      lastTyping.current = now
      emitRealtime(CHAT_EVENTS.TYPING, chatChannel(ref))
    }
  }

  const onSend = () => {
    const body = text.trim()
    if (!body) return
    setText('')
    setAnnouncement(false)
    send.mutate(
      { body, announcement },
      // Refusé (mot interdit, flood) : le texte revient pour être corrigé
      { onError: () => setText((current) => current || body) },
    )
  }

  const closeMenu = () => {
    setMenu(null)
    setReporting(false)
  }

  const forbidden = chat.error instanceof ApiError && chat.error.status === 404
  const error = send.error ?? remove.error ?? report.error
  const avatarSize = compact ? 26 : 30

  const header = first ? (
    <ChatHeader
      title={first.title}
      detail={chatDetail(first, compact)}
      color={chatColor(ref.type)}
      link={ref.type === 'room' ? 'Voir la room' : 'Voir l’événement'}
      onOpen={() => (ref.type === 'room' ? openRoom(ref.id) : openEvent(ref.id))}
      muted={first.muted}
      onMute={() => mute.mutate(!first.muted)}
      onBack={compact ? goBack : undefined}
    />
  ) : null

  const pinned = first?.pinned ? (
    <PinnedBanner
      compact={compact}
      author={first.pinned.author.pseudo ?? 'Organisateur'}
      text={first.pinned.body}
    />
  ) : null

  const thread = !first ? (
    <View style={{ padding: compact ? 14 : 24 }}>
      {chat.isError ? (
        <Banner
          tone="err"
          message={
            forbidden
              ? 'Ce chat est réservé aux joueurs de la room ou aux inscrits de l’événement.'
              : 'Impossible de charger le chat.'
          }
          action={forbidden ? undefined : 'Réessayer'}
          onAction={forbidden ? undefined : () => void chat.refetch()}
        />
      ) : (
        <SkeletonCard />
      )}
    </View>
  ) : (
    <FlatList
      inverted
      style={{ flex: 1, backgroundColor: colors.chatBg }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingVertical: compact ? 14 : 20,
        paddingHorizontal: compact ? 14 : 24,
      }}
      data={messages}
      keyExtractor={(m) => m.id}
      onEndReached={() => {
        if (chat.hasNextPage && !chat.isFetchingNextPage) void chat.fetchNextPage()
      }}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            transform: [{ scaleY: -1 }],
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 48,
          }}
        >
          <Typography variant="h2" style={{ fontSize: 20, lineHeight: 21 }}>
            Pas encore de message
          </Typography>
          <Typography variant="small" style={{ textAlign: 'center', maxWidth: 340, fontSize: 14 }}>
            Lance la discussion : qui ramène quoi, à quelle heure on se retrouve.
          </Typography>
        </View>
      }
      renderItem={({ item, index }) => {
        const mine = item.author.id === me?.id
        const pending = item.id.startsWith('temp-')
        const { dividers, first: starts } = layout[index] ?? { dividers: [], first: true }
        const author = item.author.pseudo ?? 'Joueur'
        return (
          <View style={{ paddingTop: dividers.length ? 0 : starts ? 10 : 6 }}>
            {dividers.map((divider) => (
              <View key={divider.label} style={{ marginTop: 12, marginBottom: 6 }}>
                <ChatDivider label={divider.label} tone={divider.tone} />
              </View>
            ))}
            <ChatBubble
              text={item.body}
              mine={mine}
              author={starts && !mine ? author : undefined}
              time={pending ? 'Envoi…' : starts ? formatTime(item.createdAt) : undefined}
              announcement={item.kind === 'ANNOUNCEMENT'}
              pending={pending}
              avatar={
                starts && !mine ? { name: author, color: authorColor(item.author.id) } : undefined
              }
              indent={!starts && !mine}
              avatarSize={avatarSize}
              maxWidth={compact ? '78%' : '62%'}
              onMenu={pending ? undefined : (anchor) => setMenu({ message: item, anchor })}
            />
          </View>
        )
      }}
    />
  )

  const composer = first ? (
    <View
      style={{
        gap: 8,
        paddingTop: compact ? 10 : 12,
        paddingHorizontal: compact ? 14 : 20,
        paddingBottom: compact ? 10 + insets.bottom : 16,
        borderTopWidth: border.base,
        borderColor: colors.ink,
        backgroundColor: colors.white,
      }}
    >
      {error ? (
        <Banner
          tone="err"
          message={error.message}
          onClose={() => {
            send.reset()
            remove.reset()
            report.reset()
          }}
        />
      ) : null}
      {reported ? (
        <Banner
          tone="ok"
          message="Merci, l’équipe Lucko va examiner ce message."
          onClose={() => setReported(false)}
        />
      ) : null}
      <ChatComposer
        compact={compact}
        value={text}
        onChange={onChange}
        onSend={onSend}
        maxLength={CHAT_MESSAGE_MAX}
        status={chat.typing ? `${chat.typing} écrit…` : null}
        accessory={
          first.moderator ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Toggle
                value={announcement}
                onChange={setAnnouncement}
                label="Envoyer comme annonce"
              />
              <Typography variant="small" style={{ flex: 1 }}>
                <Text style={{ ...font('body', 800), color: colors.ink }}>Annonce</Text> : épinglée
                et notifiée à tous, même en sourdine
              </Typography>
            </View>
          ) : null
        }
      />
    </View>
  ) : null

  const selected = menu?.message
  const actions = selected
    ? [
        ...(selected.author.id !== me?.id
          ? [{ label: 'Signaler', icon: Flag, onPress: () => setReporting(true) }]
          : []),
        ...(selected.author.id === me?.id || first?.moderator
          ? [
              {
                label: 'Supprimer',
                icon: Trash2,
                danger: true,
                onPress: () => {
                  remove.mutate(selected.id)
                  closeMenu()
                },
              },
            ]
          : []),
      ]
    : []
  const reasons = REPORT_REASONS.map((reason) => ({
    label: REPORT_REASON_LABELS[reason],
    onPress: () => {
      if (selected)
        report.mutate({ messageId: selected.id, reason }, { onSuccess: () => setReported(true) })
      closeMenu()
    },
  }))
  const contextMenu = (
    <ContextMenu
      anchor={menu?.anchor ?? null}
      align={selected?.author.id === me?.id ? 'right' : 'left'}
      title={reporting ? 'Pourquoi signaler ?' : undefined}
      items={reporting ? reasons : actions}
      onClose={closeMenu}
    />
  )

  if (compact) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.chatBg }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={{
            paddingTop: insets.top,
            backgroundColor: colors.cream,
            borderBottomWidth: border.base,
            borderColor: colors.ink,
          }}
        >
          {header}
          {pinned}
        </View>
        {thread}
        {composer}
        {contextMenu}
      </KeyboardAvoidingView>
    )
  }

  return (
    <Raised offset={shadow.card} r={radius.card} style={{ flex: 1, minHeight: 0 }}>
      <View
        style={{
          flex: 1,
          minHeight: 0,
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          overflow: 'hidden',
        }}
      >
        {header}
        {pinned}
        {thread}
        {composer}
      </View>
      {contextMenu}
    </Raised>
  )
}
