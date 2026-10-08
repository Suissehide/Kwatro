import { Check, Plus } from 'lucide-react-native'
import { Pressable, View } from 'react-native'
import { Chip } from '../atoms/Chip'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, radius, shadow, transition } from '../tokens'

export type PlayIntentRow = {
  id: string
  game: string
  /** « 23 joueurs l'attendent à Bordeaux ». */
  demand: string
  on: boolean
}

/**
 * « Je veux jouer à… » (web) : un jeu par ligne, « Me prévenir » ou « Prévenu ». L'appui sur la ligne
 * bascule tout de suite ; la note du pied rappelle ce que voient les hôtes.
 */
export function PlayIntentsCard({
  title = 'Je veux jouer à…',
  subtitle,
  rows,
  footer,
  onToggle,
}: {
  title?: string
  subtitle: string
  rows: PlayIntentRow[]
  footer: string
  onToggle: (id: string) => void
}) {
  return (
    <Raised offset={shadow.card} r={radius.card}>
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            paddingVertical: 16,
            paddingHorizontal: 18,
            gap: 6,
            backgroundColor: colors.rating,
            borderBottomWidth: border.base,
            borderColor: colors.ink,
          }}
        >
          <Typography variant="h2">{title}</Typography>
          <Typography variant="small" weight={500} color={colors.ink}>
            {subtitle}
          </Typography>
        </View>
        <View style={{ paddingVertical: 8 }}>
          {rows.map((row) => (
            <Row key={row.id} {...row} onPress={() => onToggle(row.id)} />
          ))}
        </View>
        <View
          style={{
            paddingTop: 12,
            paddingBottom: 16,
            paddingHorizontal: 18,
            borderTopWidth: border.thin,
            borderColor: colors.line,
          }}
        >
          <Typography variant="small" style={{ fontSize: 12, lineHeight: 17 }}>
            {footer}
          </Typography>
        </View>
      </View>
    </Raised>
  )
}

function Row({ game, demand, on, onPress }: PlayIntentRow & { onPress: () => void }) {
  const { hovered, hoverProps } = useHover()
  return (
    <Pressable
      role="switch"
      aria-checked={on}
      aria-label={game}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: hovered ? colors.hover : 'transparent',
        ...transition(['background-color']),
      }}
    >
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Typography variant="title" style={{ fontSize: 14, lineHeight: 18 }}>
          {game}
        </Typography>
        <Typography variant="small" style={{ fontSize: 12, lineHeight: 16 }}>
          {demand}
        </Typography>
      </View>
      <Chip
        label={on ? 'Prévenu' : 'Me prévenir'}
        active={on}
        color={colors.venue}
        icon={on ? Check : Plus}
      />
    </Pressable>
  )
}
