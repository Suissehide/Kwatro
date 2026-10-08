import { Pressable, Text, View } from 'react-native'
import { Avatar } from '../atoms/Avatar'
import { Raised } from '../atoms/Raised'
import { useHover } from '../atoms/useHover'
import { border, colors, font, semantic, transition } from '../tokens'

export type RankPlayer = {
  id: string
  pseudo: string
  deck?: string
  /** LK actuels. */
  rating: number
  color: string
  avatarUri?: string | null
}

/**
 * Classement d'une partie par touchers successifs : un joueur non placé prend la position suivante,
 * un joueur placé est retiré. `deltas` (estimation des LK, dans l'ordre du classement) ne s'affiche
 * qu'une fois tout le monde placé.
 */
// ponytail: pas de glisser-déposer, les touchers suffisent ; l'ajouter si les tables de 6+ le réclament
export function RankPicker({
  players,
  order,
  onChange,
  deltas,
}: {
  players: RankPlayer[]
  /** Ids des joueurs placés, du 1er au dernier. */
  order: string[]
  onChange: (order: string[]) => void
  deltas?: string[]
}) {
  const complete = order.length === players.length
  const placed = order.map((id) => players.find((p) => p.id === id)).filter((p) => p !== undefined)
  const rest = players.filter((p) => !order.includes(p.id))
  return (
    <View style={{ gap: 8 }}>
      {placed.map((p, i) => (
        <Row
          key={p.id}
          player={p}
          position={i + 1}
          delta={complete ? deltas?.[i] : undefined}
          onPress={() => onChange(order.filter((id) => id !== p.id))}
        />
      ))}
      {rest.map((p) => (
        <Row key={p.id} player={p} onPress={() => onChange([...order, p.id])} />
      ))}
    </View>
  )
}

function Row({
  player,
  position,
  delta,
  onPress,
}: {
  player: RankPlayer
  position?: number
  delta?: string
  onPress: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const first = position === 1
  const row = (
    <Pressable
      role="button"
      aria-label={`Joueur ${player.pseudo}, ${position ? `position ${position}` : 'pas encore classé'}`}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: 12,
        backgroundColor: hovered ? colors.hover : position ? colors.white : colors.hover,
        transform: hovered ? [{ translateY: -1 }] : [],
        ...transition(['background-color', 'transform']),
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderWidth: border.thin,
          borderColor: colors.ink,
          borderRadius: 9,
          backgroundColor: first ? colors.rating : position ? colors.white : semantic.neutralSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ ...font('display'), fontSize: 18, color: colors.ink }}>
          {position ?? '–'}
        </Text>
      </View>
      <Avatar name={player.pseudo} uri={player.avatarUri} color={player.color} size={36} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={{ ...font('body', 800), fontSize: 15, color: colors.ink }}>
          {player.pseudo}
        </Text>
        {player.deck ? (
          <Text
            numberOfLines={1}
            style={{ ...font('body', 400), fontSize: 12, color: colors.muted }}
          >
            {player.deck}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ ...font('mono', 700), fontSize: 13, color: colors.ink }}>
          {player.rating} LK
        </Text>
        {delta ? (
          <Text
            style={{
              ...font('mono', 700),
              fontSize: 12,
              color: delta.startsWith('-') ? colors.room : colors.venue,
            }}
          >
            {delta}
          </Text>
        ) : null}
      </View>
    </Pressable>
  )
  return first ? (
    <Raised offset={3} r={12}>
      {row}
    </Raised>
  ) : (
    row
  )
}
