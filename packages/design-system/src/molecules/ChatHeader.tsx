import { ArrowLeft, Bell, BellOff } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { Button } from '../atoms/Button'
import { IconButton } from '../atoms/IconButton'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, space, transition } from '../tokens'

/**
 * En-tête d'une conversation : titre, détail (date, lieu, joueurs) et cloche de sourdine.
 * Web : liseré de la couleur du type et bouton `link` vers la fiche. Téléphone (`onBack`) : bouton retour,
 * le titre ouvre la fiche.
 */
export function ChatHeader({
  title,
  detail,
  color,
  link,
  onOpen,
  muted,
  onMute,
  onBack,
}: {
  title: string
  detail?: string
  color: string
  /** « Voir l'événement », « Voir la room ». */
  link: string
  onOpen: () => void
  muted: boolean
  onMute: () => void
  onBack?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const compact = !!onBack
  const BellIcon = muted ? BellOff : Bell
  const mute = (
    <IconButton
      size={compact ? 44 : 36}
      label={muted ? 'Réactiver les notifications' : 'Couper les notifications'}
      bg={muted ? colors.disabledBg : colors.white}
      flat
      onPress={onMute}
      icon={<BellIcon size={18} color={colors.ink} strokeWidth={2.5} />}
    />
  )

  if (compact) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingTop: 4,
          paddingBottom: 12,
          paddingHorizontal: space.screen,
        }}
      >
        <IconButton
          size={44}
          label="Retour"
          onPress={onBack}
          icon={<ArrowLeft size={20} color={colors.ink} strokeWidth={2.5} />}
        />
        <Pressable
          role="link"
          aria-label={link}
          onPress={onOpen}
          {...hoverProps}
          style={{ flex: 1, minWidth: 0, gap: 1 }}
        >
          <Text
            role="heading"
            numberOfLines={1}
            style={{
              ...font('display'),
              fontSize: 17,
              lineHeight: 19,
              textTransform: 'uppercase',
              color: hovered ? colors.room : colors.ink,
              ...transition(['color']),
            }}
          >
            {title}
          </Text>
          {detail ? (
            <Typography variant="small" numberOfLines={1} style={{ fontSize: 12, lineHeight: 16 }}>
              {detail}
            </Typography>
          ) : null}
        </Pressable>
        {mute}
      </View>
    )
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: border.base,
        borderColor: colors.ink,
      }}
    >
      <View
        style={{
          width: 8,
          alignSelf: 'stretch',
          borderRadius: 4,
          borderWidth: border.thin,
          borderColor: colors.ink,
          backgroundColor: color,
        }}
      />
      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <Typography variant="h2" numberOfLines={1}>
          {title}
        </Typography>
        {detail ? <Typography variant="small">{detail}</Typography> : null}
      </View>
      <Button small kind="ghost" label={link} onPress={onOpen} />
      {mute}
    </View>
  )
}
