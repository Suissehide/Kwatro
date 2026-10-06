import {
  Banner,
  BottomSheet,
  Button,
  ChatBubble,
  ChatComposer,
  ChatDivider,
  colors,
  IconButton,
  MobileScreen,
  Note,
  ScreenHeader,
  SkeletonCard,
  TextLink,
  Toggle,
  Typography,
} from '@lucko/design-system'
import {
  CHAT_EVENTS,
  CHAT_MESSAGE_MAX,
  CHAT_TYPES,
  type ChatType,
  chatChannel,
  formatTime,
  REPORT_REASON_LABELS,
  REPORT_REASONS,
} from '@lucko/shared'
import { useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Bell, BellOff, Pin } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { FlatList, KeyboardAvoidingView, Platform, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PlayerNav } from '@/components/PlayerNav'
import { dayLabel, localDay } from '@/lib/explore'
import { goBack } from '@/lib/navigation'
import { ApiError } from '@/lib/queryClient'
import { emitRealtime } from '@/lib/realtime'
import { type ChatMessage, useChatMutations, useChatQuery } from '@/queries/useChat'
import { useMeQuery } from '@/queries/useMe'

const WIDE = 900
/** Le signal « en train d'écrire » est renvoyé au plus toutes les 3 secondes. */
const TYPING_EVERY_MS = 3000

const messageTime = (date: string) =>
  localDay(date) === localDay(new Date())
    ? formatTime(date)
    : `${dayLabel(date)} · ${formatTime(date)}`

/** Chat de room ou de tournoi (KWT-80) : messages en direct, annonces de l'organisateur, signalement. */
export default function ChatScreen() {
  const params = useLocalSearchParams<{ type: string; id: string }>()
  const type: ChatType = (CHAT_TYPES as readonly string[]).includes(params.type)
    ? (params.type as ChatType)
    : 'room'
  const ref = { type, id: params.id }
  const me = useMeQuery({ required: true })
  const wide = useWindowDimensions().width >= WIDE
  const insets = useSafeAreaInsets()
  const chat = useChatQuery(ref)
  const { send, remove, report, markRead, mute } = useChatMutations(ref, {
    id: me?.id ?? '',
    pseudo: me?.pseudo ?? null,
  })
  const [text, setText] = useState('')
  const [announcement, setAnnouncement] = useState(false)
  const [selected, setSelected] = useState<ChatMessage | null>(null)
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

  const closeSheet = () => {
    setSelected(null)
    setReporting(false)
  }

  const title = first?.title ?? 'Chat'
  const forbidden = chat.error instanceof ApiError && chat.error.status === 404
  const error = send.error ?? remove.error ?? report.error

  const muteButton = first ? (
    <IconButton
      size={36}
      label={first.muted ? 'Réactiver les notifications' : 'Couper les notifications'}
      onPress={() => mute.mutate(!first.muted)}
      icon={
        first.muted ? (
          <BellOff size={18} color={colors.ink} strokeWidth={2.5} />
        ) : (
          <Bell size={18} color={colors.ink} strokeWidth={2.5} />
        )
      }
    />
  ) : null

  const body = !first ? (
    chat.isError ? (
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
    )
  ) : (
    <View style={{ flex: 1, gap: 10 }}>
      {first.pinned ? (
        <Note tone="rating" icon={Pin}>
          {first.pinned.author.pseudo ?? 'Organisateur'} : {first.pinned.body}
        </Note>
      ) : null}
      <FlatList
        inverted
        style={{ flex: 1 }}
        contentContainerStyle={{ gap: 10, paddingVertical: 8 }}
        data={messages}
        keyExtractor={(m) => m.id}
        onEndReached={() => {
          if (chat.hasNextPage && !chat.isFetchingNextPage) void chat.fetchNextPage()
        }}
        ListEmptyComponent={
          <View style={{ transform: [{ scaleY: -1 }], paddingVertical: 24 }}>
            <Typography variant="small" style={{ textAlign: 'center' }}>
              Aucun message pour l’instant. Lance la discussion !
            </Typography>
          </View>
        }
        renderItem={({ item, index }) => {
          const mine = item.author.id === me?.id
          const pending = item.id.startsWith('temp-')
          return (
            <View style={{ gap: 10 }}>
              {index === dividerAt ? <ChatDivider label="Nouveaux messages" /> : null}
              <ChatBubble
                text={item.body}
                mine={mine}
                author={mine ? undefined : (item.author.pseudo ?? 'Joueur')}
                time={pending ? 'Envoi…' : messageTime(item.createdAt)}
                announcement={item.kind === 'ANNOUNCEMENT'}
                pending={pending}
                onPress={pending ? undefined : () => setSelected(item)}
              />
            </View>
          )
        }}
      />
    </View>
  )

  const composer = first ? (
    <View style={{ gap: 8 }}>
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
              <Typography variant="small">
                Annonce : épinglée et notifiée à tous, même en sourdine
              </Typography>
            </View>
          ) : null
        }
      />
    </View>
  ) : null

  const canDelete = selected && (selected.author.id === me?.id || first?.moderator)
  const sheet = (
    <BottomSheet
      visible={!!selected}
      title={reporting ? 'Pourquoi signaler ce message ?' : 'Message'}
      onClose={closeSheet}
    >
      {selected && !reporting ? (
        <View style={{ gap: 10 }}>
          <Typography variant="small" numberOfLines={3}>
            {selected.body}
          </Typography>
          {selected.author.id !== me?.id ? (
            <Button kind="ghost" label="Signaler" onPress={() => setReporting(true)} />
          ) : null}
          {canDelete ? (
            <Button
              kind="danger"
              label="Supprimer le message"
              onPress={() => {
                remove.mutate(selected.id)
                closeSheet()
              }}
            />
          ) : null}
        </View>
      ) : null}
      {selected && reporting ? (
        <View style={{ gap: 8 }}>
          {REPORT_REASONS.map((reason) => (
            <Button
              key={reason}
              kind="ghost"
              label={REPORT_REASON_LABELS[reason]}
              onPress={() => {
                report.mutate(
                  { messageId: selected.id, reason },
                  { onSuccess: () => setReported(true) },
                )
                closeSheet()
              }}
            />
          ))}
        </View>
      ) : null}
    </BottomSheet>
  )

  if (!wide) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <MobileScreen
          insets={insets}
          scroll={false}
          header={<ScreenHeader title={title} onBack={goBack} right={muteButton} />}
          footer={composer}
        >
          {body}
        </MobileScreen>
        {sheet}
      </KeyboardAvoidingView>
    )
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.cream }}>
      <PlayerNav active="messages" />
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 760,
          alignSelf: 'center',
          paddingHorizontal: 32,
          paddingVertical: 24,
          gap: 16,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TextLink icon={ArrowLeft} label="Retour" onPress={goBack} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h2" numberOfLines={1}>
              {title}
            </Typography>
          </View>
          {muteButton}
        </View>
        {body}
        {composer}
      </View>
      {sheet}
    </View>
  )
}
