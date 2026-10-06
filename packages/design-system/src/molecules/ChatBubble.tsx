import { Pressable, Text, View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, transition } from '../tokens'

/**
 * Message du chat. `announcement` : annonce de l'hôte ou de l'organisateur, mise en avant.
 * `pending` : envoi en cours. `onPress` ouvre les actions du message (signaler, supprimer).
 * Dans un groupe de messages du même auteur, seul le premier a `author` / `time` et `avatar` ;
 * les suivants passent `indent` pour rester alignés sous la bulle.
 */
export function ChatBubble({
  text,
  mine,
  author,
  time,
  announcement,
  pending,
  avatar,
  indent,
  avatarSize = 30,
  maxWidth = '78%',
  onPress,
}: {
  text: string
  mine?: boolean
  author?: string
  time?: string
  announcement?: boolean
  pending?: boolean
  /** Initiale de l'auteur sur une pastille de cette couleur, à gauche de la bulle. */
  avatar?: { name: string; color: string }
  indent?: boolean
  avatarSize?: number
  maxWidth?: `${number}%`
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const bg = announcement ? colors.ratingSoft : mine ? colors.room : colors.white
  const fg = mine && !announcement ? colors.white : colors.ink
  const meta = [announcement ? 'Annonce' : null, author, time].filter(Boolean).join(' · ')
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: mine ? 'flex-end' : 'flex-start',
        gap: avatarSize > 26 ? 10 : 8,
      }}
    >
      {avatar ? (
        <Avatar name={avatar.name} color={avatar.color} size={avatarSize} />
      ) : indent ? (
        <View style={{ width: avatarSize }} />
      ) : null}
      <View style={{ maxWidth, alignItems: mine ? 'flex-end' : 'flex-start', gap: 3 }}>
        {meta ? (
          <Typography variant="label" style={{ fontSize: 10 }}>
            {meta}
          </Typography>
        ) : null}
        <Pressable
          onPress={onPress}
          disabled={!onPress}
          role={onPress ? 'button' : undefined}
          aria-label={onPress ? `Actions du message : ${text}` : undefined}
          {...hoverProps}
          style={{
            backgroundColor: bg,
            borderWidth: announcement ? border.base : border.thin,
            borderColor: colors.ink,
            borderRadius: 14,
            borderBottomRightRadius: mine ? 4 : 14,
            borderBottomLeftRadius: mine ? 14 : 4,
            paddingVertical: 8,
            paddingHorizontal: 12,
            opacity: pending ? 0.6 : hovered && onPress ? 0.85 : 1,
            ...transition(['opacity']),
          }}
        >
          <Text style={{ ...font('body', 400), fontSize: 14, lineHeight: 19, color: fg }}>
            {text}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}
