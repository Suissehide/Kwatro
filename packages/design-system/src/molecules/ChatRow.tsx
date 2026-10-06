import { BellOff } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { CountBadge } from '../atoms/CountBadge'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, transition } from '../tokens'

/** En-tête d'un groupe de conversations (« À venir », « Terminées »). */
export function ChatGroupLabel({ label, first }: { label: string; first?: boolean }) {
  return (
    <View
      style={{
        paddingTop: 10,
        paddingBottom: 6,
        paddingHorizontal: 16,
        backgroundColor: colors.hover,
        borderTopWidth: first ? 0 : border.thin,
        borderBottomWidth: border.thin,
        borderColor: colors.line,
      }}
    >
      <Typography variant="label">{label}</Typography>
    </View>
  )
}

/**
 * Conversation de la boîte de réception : liseré de la couleur du type (room, événement), titre et heure,
 * contexte (« Room classée · Ce soir 20:30 · Le Dé Fêlé »), aperçu du dernier message, sourdine et non-lus.
 */
export function ChatRow({
  title,
  time,
  context,
  preview,
  color,
  unread = 0,
  muted,
  selected,
  past,
  compact,
  onPress,
}: {
  title: string
  time: string
  context: string
  preview: string
  color: string
  unread?: number
  muted?: boolean
  selected?: boolean
  /** Partie terminée : ligne estompée. */
  past?: boolean
  compact?: boolean
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const strong = unread > 0
  return (
    <Pressable
      role="button"
      aria-label={title}
      aria-selected={selected}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 12,
        paddingRight: 14,
        borderBottomWidth: border.thin,
        borderColor: colors.line,
        backgroundColor: selected ? colors.ratingSoft : hovered ? colors.hover : colors.white,
        opacity: past ? 0.7 : 1,
        ...transition(['background-color']),
      }}
    >
      <View
        style={{
          width: 6,
          backgroundColor: color,
          borderTopRightRadius: 3,
          borderBottomRightRadius: 3,
        }}
      />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              ...font('body', 800),
              fontSize: 15,
              lineHeight: 19,
              color: colors.ink,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              ...font('mono', strong ? 700 : 400),
              fontSize: 12,
              color: strong ? colors.room : colors.muted,
            }}
          >
            {time}
          </Text>
        </View>
        <Typography variant="label" numberOfLines={1} style={compact ? { fontSize: 10 } : null}>
          {context}
        </Typography>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text
            numberOfLines={1}
            style={{
              flex: 1,
              ...font('body', strong ? 700 : 400),
              fontSize: 13,
              lineHeight: 18,
              color: strong ? colors.ink : colors.muted,
            }}
          >
            {preview}
          </Text>
          {muted ? (
            <View aria-label="En sourdine">
              <BellOff size={15} color={colors.muted} strokeWidth={2.5} />
            </View>
          ) : null}
          {strong ? <CountBadge count={unread} /> : null}
        </View>
      </View>
    </Pressable>
  )
}
