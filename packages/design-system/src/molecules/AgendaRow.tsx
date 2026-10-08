import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { Tag } from '../atoms/Tag'
import { useHover } from '../atoms/useHover'
import { border, colors, font, radius, transition } from '../tokens'

export type AgendaRowProps = {
  /** « 19:30 ». */
  time: string
  /** Couleur du type (liseré) et fond clair de son étiquette. */
  color: string
  tint: string
  type: string
  title: string
  /** « Le Dé Fêlé · 450 m · Magic ». */
  meta: string
  adult?: boolean
  /** Room classée : étiquette « Classée ». */
  ranked?: boolean
  partner?: boolean
  places?: string | null
  /** `alert` : dernière place (rouge) ; `off` : complet (grisé). */
  placesTone?: 'alert' | 'off'
  /** Web : prix sous les places. */
  price?: string | null
  /** Web : bouton à droite. */
  action?: ReactNode
  /** Web : ligne d'une carte de groupe (séparateur au-dessus sauf la première) ; sinon carte compacte. */
  wide?: boolean
  first?: boolean
  onPress?: () => void
}

/** Rendez-vous de l'agenda de la ville (room ou événement d'un lieu), au liseré de la couleur de son type. */
export function AgendaRow({
  time,
  color,
  tint,
  type,
  title,
  meta,
  adult,
  ranked,
  partner,
  places,
  placesTone,
  price,
  action,
  wide,
  first,
  onPress,
}: AgendaRowProps) {
  const { hovered, hoverProps } = useHover()
  const bg = hovered && onPress ? colors.hover : colors.white
  const placesColor =
    placesTone === 'alert' ? colors.room : placesTone === 'off' ? colors.inkMuted : colors.ink
  const typeTag = (
    <View
      style={{
        paddingHorizontal: wide ? 7 : 6,
        paddingVertical: 1,
        borderWidth: border.thin,
        borderColor: colors.ink,
        borderRadius: radius.pill,
        backgroundColor: tint,
      }}
    >
      <Text style={{ ...font('body', 700), fontSize: wide ? 11 : 10, color: colors.ink }}>
        {type}
      </Text>
    </View>
  )
  const adultTag = adult ? <Tag label="18+" variant="ranked" /> : null
  const rankedTag = ranked ? <Tag label="Classée" variant="ranked" /> : null
  const placesText = places ? (
    <Text style={{ ...font('mono', 700), fontSize: wide ? 13 : 12, color: placesColor }}>
      {places}
    </Text>
  ) : null

  if (!wide) {
    return (
      <Pressable role="link" aria-label={title} onPress={onPress} {...hoverProps}>
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: bg,
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
            style={{ flex: 1, minWidth: 0, paddingVertical: 10, paddingHorizontal: 12, gap: 4 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ ...font('mono', 700), fontSize: 14, color: colors.ink }}>{time}</Text>
              {typeTag}
              <View style={{ flex: 1 }} />
              {placesText}
            </View>
            <Text style={{ ...font('body', 800), fontSize: 15, lineHeight: 19, color: colors.ink }}>
              {title}
            </Text>
            <Text
              style={{ ...font('body', 400), fontSize: 12, lineHeight: 16, color: colors.muted }}
            >
              {meta}
            </Text>
            {rankedTag || adultTag ? (
              // « Classée » à gauche, « 18+ » en bas à droite
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {rankedTag}
                <View style={{ flex: 1 }} />
                {adultTag}
              </View>
            ) : null}
          </View>
        </View>
      </Pressable>
    )
  }

  return (
    <Pressable
      role="link"
      aria-label={title}
      onPress={onPress}
      {...hoverProps}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderTopWidth: first ? 0 : border.thin,
        borderColor: colors.line,
        backgroundColor: bg,
        ...transition(['background-color']),
      }}
    >
      <Text style={{ width: 72, ...font('mono', 700), fontSize: 18, color: colors.ink }}>
        {time}
      </Text>
      <View
        style={{
          width: 8,
          alignSelf: 'stretch',
          borderRadius: radius.tag,
          borderWidth: border.thin,
          borderColor: colors.ink,
          backgroundColor: color,
        }}
      />
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <Text style={{ ...font('body', 800), fontSize: 17, color: colors.ink }}>{title}</Text>
          {typeTag}
          {adultTag}
          {rankedTag}
          {partner ? <Tag label="Partenaire" variant="partner" /> : null}
        </View>
        <Text style={{ ...font('body', 400), fontSize: 13, lineHeight: 18, color: colors.muted }}>
          {meta}
        </Text>
      </View>
      <View style={{ width: 150, alignItems: 'flex-end', gap: 2 }}>
        {placesText}
        {price ? (
          <Text style={{ ...font('body', 400), fontSize: 12, color: colors.muted }}>{price}</Text>
        ) : null}
      </View>
      <View style={{ minWidth: 110, alignItems: 'flex-end' }}>{action}</View>
    </Pressable>
  )
}
