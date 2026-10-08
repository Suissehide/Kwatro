import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { DateBlock } from '../atoms/DateBlock'
import { Typography } from '../atoms/Typography'
import { useHover } from '../atoms/useHover'
import { border, type ContentKind, colors, contentColor, font, radius, transition } from '../tokens'
import { ContentCard } from './ContentCard'

/**
 * Date de l'agenda d'un lieu, à la couleur de son type (soirée bleue, tournoi rouge).
 * `wide` : liseré à gauche et colonne d'action à droite ; sinon carte à bandeau, toute cliquable.
 * `time` (agenda de la ville) : l'heure remplace le bloc date ; `tags` se posent à côté du titre.
 */
export function AgendaEventCard({
  kind,
  weekday,
  day,
  month,
  label,
  title,
  meta,
  time,
  tags,
  price,
  places,
  placesAlert,
  action,
  wide,
  onPress,
}: {
  kind: ContentKind
  /** Bandeau du bloc date, « SAM ». */
  weekday?: string
  day?: string
  month?: string
  /** « 19:30 » : remplace le bloc date. */
  time?: string
  /** Tag type / 18+ / Partenaire. */
  tags?: ReactNode
  price?: string
  label?: string
  title: string
  meta: string
  places?: string | null
  /** Complet ou presque : places en rouge. */
  placesAlert?: boolean
  action?: ReactNode
  wide?: boolean
  onPress?: () => void
}) {
  const { hovered, hoverProps } = useHover()
  const color = contentColor[kind]
  const date = time ? (
    <Text style={{ width: 60, ...font('mono', 700), fontSize: 18, color: colors.ink }}>{time}</Text>
  ) : (
    <DateBlock day={day ?? ''} month={weekday ?? ''} sub={month} color={color} />
  )
  const placesText = places ? (
    <Text
      style={{
        ...font('mono', 700),
        fontSize: 12,
        color: placesAlert ? colors.room : colors.muted,
      }}
    >
      {places}
    </Text>
  ) : null
  const text = (
    <View style={{ flex: 1, minWidth: 0, gap: 5 }}>
      {label ? <Typography variant="label">{label}</Typography> : null}
      {tags ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Typography variant="title">{title}</Typography>
          {tags}
        </View>
      ) : (
        <Typography variant="title">{title}</Typography>
      )}
      <Typography variant="small">{meta}</Typography>
      {wide ? null : placesText}
    </View>
  )

  if (!wide) {
    return (
      <ContentCard kind={kind} onPress={onPress} label={title}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
          {date}
          {text}
        </View>
      </ContentCard>
    )
  }

  return (
    <Pressable role="link" aria-label={title} onPress={onPress} {...hoverProps}>
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: hovered && onPress ? colors.hover : colors.white,
          borderWidth: border.base,
          borderColor: colors.ink,
          borderRadius: radius.card,
          overflow: 'hidden',
          ...transition(['background-color']),
        }}
      >
        <View
          style={{
            width: 8,
            backgroundColor: color,
            borderRightWidth: border.base,
            borderColor: colors.ink,
          }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            paddingVertical: 14,
            paddingHorizontal: 16,
          }}
        >
          {date}
          {text}
          <View style={{ width: 170, alignItems: 'flex-end', gap: 6 }}>
            {action}
            {placesText}
            {price ? (
              <Text style={{ ...font('mono', 700), fontSize: 12, color: colors.ink }}>{price}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </Pressable>
  )
}
