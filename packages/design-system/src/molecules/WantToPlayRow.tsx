import { Check, Plus } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, sizes, transition } from '../tokens'

/**
 * « Je veux jouer à » : abonnement à un jeu avec la demande agrégée de la ville. Jamais les noms des joueurs.
 * `pill` : bouton « Me prévenir » (web) ; `checkbox` : ligne entière cochable (mobile).
 */
export function WantToPlayRow({
  game,
  demandCount,
  city,
  subscribed,
  onToggle,
  variant = 'pill',
}: {
  game: string
  demandCount: number
  city: string
  subscribed: boolean
  onToggle: () => void
  variant?: 'pill' | 'checkbox'
}) {
  const { hovered, hoverProps } = useHover()
  const demand = `${demandCount} joueur${demandCount > 1 ? 's' : ''} l'attend${demandCount > 1 ? 'ent' : ''} à ${city}`
  const text = (
    <View style={{ flex: 1, gap: 1 }}>
      <Text style={{ ...font('body', 800), fontSize: 14, color: colors.ink }}>{game}</Text>
      <Text style={{ ...font('body', 400), fontSize: 12, color: colors.muted }}>{demand}</Text>
    </View>
  )

  if (variant === 'checkbox') {
    return (
      <Pressable
        role="checkbox"
        aria-checked={subscribed}
        aria-label={`Me prévenir pour ${game}, ${demand}`}
        onPress={onToggle}
        {...hoverProps}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: sizes.touch,
          paddingVertical: 8,
          paddingHorizontal: 4,
          borderRadius: radius.sm,
          backgroundColor: hovered ? colors.hover : 'transparent',
          ...transition(['background-color']),
        }}
      >
        <View
          style={{
            width: 24,
            height: 24,
            borderWidth: border.thin,
            borderColor: colors.ink,
            borderRadius: 6,
            backgroundColor: subscribed ? colors.venue : colors.white,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {subscribed ? <Check size={16} color={colors.white} strokeWidth={3} /> : null}
        </View>
        {text}
      </Pressable>
    )
  }

  const Icon = subscribed ? Check : Plus
  const fg = subscribed ? colors.white : colors.ink
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {text}
      <Pressable
        role="switch"
        aria-checked={subscribed}
        aria-label={`Me prévenir pour ${game}`}
        onPress={onToggle}
        {...hoverProps}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          height: 32,
          paddingHorizontal: 12,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: radius.pill,
          backgroundColor: subscribed ? colors.venue : hovered ? colors.hover : colors.white,
          transform: hovered ? [{ translateY: -1 }] : [],
          ...transition(['background-color', 'transform']),
        }}
      >
        <Icon size={13} color={fg} strokeWidth={2.5} />
        <Text style={{ ...font('body', 800), fontSize: 12, color: fg }}>
          {subscribed ? 'Prévenu' : 'Me prévenir'}
        </Text>
      </Pressable>
    </View>
  )
}
