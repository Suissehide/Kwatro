import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { DateBlock } from '../atoms/DateBlock'
import { Raised } from '../atoms/Raised'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, shadow, transition } from '../tokens'

/**
 * Partie de Mes parties. Web : liseré à gauche, compteur et état en colonnes, relevée au survol.
 * Téléphone : bandeau en haut, état et `side` (compteur ou variation de LK) sous le titre.
 */
export function AgendaCard({
  color,
  day,
  month,
  label,
  title,
  meta,
  count,
  status,
  side,
  wide,
  onPress,
}: {
  /** Événement (event), room (room), historique (muted). */
  color: string
  day: string
  month: string
  label: string
  title: string
  meta: string
  /** Joueurs, ex. « 8/12 ». */
  count?: string
  /** Pastille d'état ou étiquette de résultat. */
  status?: ReactNode
  /** Téléphone : à droite de l'état (par défaut le compteur, null pour rien). */
  side?: ReactNode
  wide?: boolean
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const lifted = wide && hovered && !!onPress
  const text = (
    <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
      <Typography variant="label">{label}</Typography>
      <Typography variant="title" numberOfLines={1}>
        {title}
      </Typography>
      <Typography variant="small" numberOfLines={1}>
        {meta}
      </Typography>
    </View>
  )
  const countText = count ? (
    <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.ink }}>{count}</Text>
  ) : null

  const face = (
    <View
      style={{
        flexDirection: wide ? 'row' : 'column',
        backgroundColor: colors.white,
        borderWidth: border.base,
        borderColor: colors.ink,
        borderRadius: radius.card,
        overflow: 'hidden',
        transform: lifted ? [{ translateX: -1 }, { translateY: -1 }] : [],
        ...transition(['transform']),
      }}
    >
      <View
        style={{
          backgroundColor: color,
          borderColor: colors.ink,
          ...(wide
            ? { width: 8, borderRightWidth: border.base }
            : { height: 8, borderBottomWidth: border.base }),
        }}
      />
      {wide ? (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            paddingVertical: 14,
            paddingHorizontal: 18,
          }}
        >
          <DateBlock day={day} month={month} color={color} />
          {text}
          <View style={{ width: 60, alignItems: 'center' }}>{countText}</View>
          <View style={{ width: 200, alignItems: 'flex-end', gap: 6 }}>
            <View>{status}</View>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 }}>
          <DateBlock day={day} month={month} color={color} />
          <View style={{ flex: 1, minWidth: 0, gap: 8 }}>
            {text}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {status ?? <View />}
              {side === undefined ? countText : side}
            </View>
          </View>
        </View>
      )}
    </View>
  )

  const card = wide ? (
    <Raised offset={lifted ? shadow.md : 0} r={radius.card}>
      {face}
    </Raised>
  ) : (
    face
  )
  return onPress ? (
    <Pressable role="link" aria-label={title} onPress={onPress} {...hoverProps}>
      {card}
    </Pressable>
  ) : (
    card
  )
}
